import type { Area, Caso, ChecklistDocumental, DocumentoCatalogo, Mensagem, MetaIA, Minuta, ResumoFatico } from '@/types';
import { lerPrompt, systemBase } from './prompts';
import { recuperar, renderizarFontes, validarFontes, idsCitadosNoTexto } from './rag';
import { gerarJSON } from './provider';
import { catalogoPorArea } from '@/data/documentos';
import { dataPorExtenso } from '@/lib/utils';

/**
 * Orquestração das tarefas de IA.
 *
 * Cada tarefa: monta o prompt (tarefa + fontes + caso) → chama o provedor → valida a saída
 * (citações contra o corpus, campos obrigatórios) → devolve o objeto tipado.
 */

function bloco(tag: string, conteudo: unknown) {
  const corpo = typeof conteudo === 'string' ? conteudo : JSON.stringify(conteudo, null, 1);
  return `<${tag}>\n${corpo}\n</${tag}>`;
}

/** Projeção do caso que vai para o prompt: nada além do necessário. */
function casoParaPrompt(caso: Partial<Caso>) {
  const a = caso.assistido;
  return {
    protocolo: caso.protocolo,
    area: caso.area,
    comarca: caso.comarca,
    temProcessoAtivo: caso.temProcessoAtivo ?? false,
    numeroProcesso: caso.numeroProcesso || null,
    assistido: a
      ? {
          nome: a.nome,
          tipoPessoa: a.tipoPessoa,
          cpf: a.cpf || null,
          rg: a.rg || null,
          nacionalidade: a.nacionalidade || null,
          estadoCivil: a.estadoCivil || null,
          profissao: a.profissao || null,
          endereco: a.endereco || null,
          bairro: a.bairro || null,
          cidade: a.cidade,
          uf: a.uf,
          cep: a.cep || null,
          email: a.email || null,
          telefone: a.telefone || a.whatsapp || null,
          sabeLerEscrever: a.sabeLerEscrever ?? null,
          rendaFamiliarMensal: a.rendaFamiliarMensal ?? null,
          membrosFamilia: a.membrosFamilia ?? null,
        }
      : null,
    parteContraria: caso.parteContraria ?? null,
    relato: caso.relato,
    documentos: (caso.documentos ?? []).map((d) => ({ id: d.id, nome: d.nome, status: d.status })),
    dataHoje: dataPorExtenso(),
  };
}

function textoDeBusca(caso: Partial<Caso>, resumo?: ResumoFatico) {
  return [caso.relato?.texto, caso.relato?.motivoUrgencia, resumo?.tema, resumo?.pretensao, resumo?.resumoExecutivo]
    .filter(Boolean)
    .join(' ');
}

/* ---------------------------------------------------------------------- */

/** A conversa vira lista estruturada, só com o que é fato do caso (sem mensagens operacionais). */
function conversaParaPrompt(mensagens: Mensagem[] = []) {
  return mensagens
    .filter((m) => m.autor !== 'plataforma' && m.tipo !== 'orientacao_cras' && m.tipo !== 'solicitacao_assinatura')
    .map((m) => ({
      autor: m.autor === 'assistido' ? 'parte' : 'advogado',
      origem: m.canal === 'whatsapp_simulado' ? 'whatsapp' : 'chat',
      em: m.enviadoEm,
      texto: m.texto,
      anexo: m.anexo?.nome ?? null,
    }));
}

export async function tarefaResumo(caso: Partial<Caso>, mensagens: Mensagem[] = []): Promise<{ resumo: ResumoFatico; meta: MetaIA }> {
  const inicio = Date.now();
  const area = (caso.area ?? 'familia') as Area;
  const conversa = conversaParaPrompt(mensagens);
  const rec = recuperar({ area, texto: `${textoDeBusca(caso)} ${conversa.map((m) => m.texto).join(' ')}`, limite: 10 });
  const permitidas = new Set(rec.map((r) => r.dispositivo.id));

  const user = [bloco('tarefa', lerPrompt('01-resumo-fatico')), renderizarFontes(rec), bloco('caso', casoParaPrompt(caso)), bloco('conversa', conversa)].join('\n\n');

  const { dados, meta } = await gerarJSON<Omit<ResumoFatico, 'geradoEm' | 'modelo' | 'fontesUtilizadas'> & { fontesUtilizadas?: { id: string }[] }>({
    system: systemBase(),
    user,
    maxOutputTokens: 4096,
  });

  const v = validarFontes(dados.fontesUtilizadas, permitidas);
  const resumo: ResumoFatico = {
    area: dados.area === 'consumidor' ? 'consumidor' : 'familia',
    tema: dados.tema ?? '',
    temaSlug: dados.temaSlug ?? '',
    resumoExecutivo: dados.resumoExecutivo ?? '',
    fatosCronologicos: Array.isArray(dados.fatosCronologicos) ? dados.fatosCronologicos : [],
    partes: dados.partes ?? { autor: caso.assistido?.nome ?? '', reu: '[A COMPLETAR EM ENTREVISTA]', vinculo: '' },
    pretensao: dados.pretensao ?? '',
    urgencia: dados.urgencia ?? { existe: false, motivo: '' },
    hipossuficiencia: dados.hipossuficiencia ?? { indicios: false, justificativa: 'não há elementos no relato' },
    dadosFaltantes: Array.isArray(dados.dadosFaltantes) ? dados.dadosFaltantes : [],
    alertas: [
      ...(Array.isArray(dados.alertas) ? dados.alertas : []),
      ...v.invalidas.map((id) => `A IA citou "${id}", que não existe no corpus. Citação descartada.`),
    ],
    foraDoEscopo: Boolean(dados.foraDoEscopo),
    motivoForaDoEscopo: dados.motivoForaDoEscopo || undefined,
    fontesUtilizadas: v.validas,
    geradoEm: new Date().toISOString(),
    modelo: meta.modelo,
  };

  return {
    resumo,
    meta: {
      modelo: meta.modelo,
      ms: Date.now() - inicio,
      tentativas: meta.tentativas,
      uso: meta.uso,
      fontesRecuperadas: rec.map((r) => ({ id: r.dispositivo.id, pontuacao: r.pontuacao, motivos: r.motivos })),
      citacoesInvalidas: v.invalidas,
      citacoesForaDoContexto: v.foraDoContexto,
    },
  };
}

/* ---------------------------------------------------------------------- */

export async function tarefaChecklist(
  caso: Partial<Caso>,
  resumo?: ResumoFatico,
): Promise<{ checklist: ChecklistDocumental; meta: MetaIA }> {
  const inicio = Date.now();
  const area = (resumo?.area ?? caso.area ?? 'familia') as Area;
  const rec = recuperar({ area, texto: textoDeBusca(caso, resumo), temas: ['peticao_inicial', 'documentos', 'gratuidade'], limite: 10 });
  const permitidas = new Set(rec.map((r) => r.dispositivo.id));
  const catalogo: DocumentoCatalogo[] = catalogoPorArea(area);

  const user = [
    bloco('tarefa', lerPrompt('02-checklist-documental')),
    renderizarFontes(rec),
    bloco('caso', casoParaPrompt(caso)),
    resumo ? bloco('resumo', resumo) : '',
    bloco(
      'catalogo',
      catalogo.map((d) => ({
        id: d.id,
        nome: d.nome,
        obrigatoriedade: d.obrigatoriedade,
        geradoPelaPlataforma: !!d.geradoPelaPlataforma,
        exigeAssinatura: !!d.exigeAssinatura,
        ondeObter: d.ondeObter ?? null,
      })),
    ),
  ]
    .filter(Boolean)
    .join('\n\n');

  const { dados, meta } = await gerarJSON<Partial<ChecklistDocumental> & { fontesUtilizadas?: { id: string }[] }>({
    system: systemBase(),
    user,
    maxOutputTokens: 4096,
  });

  const idsCatalogo = new Set(catalogo.map((d) => d.id));
  const v = validarFontes(dados.fontesUtilizadas, permitidas);

  const checklist: ChecklistDocumental = {
    itens: (Array.isArray(dados.itens) ? dados.itens : [])
      .filter((i) => i && idsCatalogo.has(i.documentoId))
      .map((i) => ({
        documentoId: i.documentoId,
        nome: i.nome || catalogo.find((c) => c.id === i.documentoId)?.nome || i.documentoId,
        situacao: (['ausente', 'presente', 'a_confirmar', 'gerar_na_plataforma'] as const).includes(i.situacao) ? i.situacao : 'a_confirmar',
        porQue: i.porQue ?? '',
        ondeObter: i.ondeObter || catalogo.find((c) => c.id === i.documentoId)?.ondeObter,
        fundamentoId: i.fundamentoId && permitidas.has(i.fundamentoId) ? i.fundamentoId : undefined,
      })),
    documentosEspecificosDoCaso: Array.isArray(dados.documentosEspecificosDoCaso) ? dados.documentosEspecificosDoCaso : [],
    orientacaoCras: Boolean(dados.orientacaoCras),
    fontesUtilizadas: v.validas,
    geradoEm: new Date().toISOString(),
    modelo: meta.modelo,
  };

  return {
    checklist,
    meta: {
      modelo: meta.modelo,
      ms: Date.now() - inicio,
      tentativas: meta.tentativas,
      uso: meta.uso,
      fontesRecuperadas: rec.map((r) => ({ id: r.dispositivo.id, pontuacao: r.pontuacao, motivos: r.motivos })),
      citacoesInvalidas: v.invalidas,
      citacoesForaDoContexto: v.foraDoContexto,
    },
  };
}

/* ---------------------------------------------------------------------- */

export async function tarefaMinuta(
  caso: Partial<Caso>,
  resumo?: ResumoFatico,
  checklist?: ChecklistDocumental,
): Promise<{ minuta: Minuta; meta: MetaIA }> {
  const inicio = Date.now();
  const area = (resumo?.area ?? caso.area ?? 'familia') as Area;
  // Temas de recuperação: urgência (do relato OU do resumo) + slug do tema identificado.
  const urgente = Boolean(caso.relato?.urgencia) || Boolean(resumo?.urgencia?.existe);
  const temas = [
    ...(urgente ? ['tutela_urgencia', 'liminar', 'alimentos_provisorios', 'servico_essencial'] : []),
    ...(resumo?.temaSlug ? resumo.temaSlug.split('_').filter((t) => t.length > 3) : []),
  ];
  const rec = recuperar({
    area,
    texto: textoDeBusca(caso, resumo),
    temas,
    limite: 14,
    incluirEssenciais: true,
  });
  const permitidas = new Set(rec.map((r) => r.dispositivo.id));

  const user = [
    bloco('tarefa', lerPrompt('03-minuta-peticao-inicial')),
    renderizarFontes(rec),
    bloco('caso', casoParaPrompt(caso)),
    resumo ? bloco('resumo', resumo) : '',
    checklist ? bloco('checklist', { itens: checklist.itens, especificos: checklist.documentosEspecificosDoCaso }) : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const { dados, meta } = await gerarJSON<Partial<Minuta> & { fontesUtilizadas?: { id: string }[] }>({
    system: systemBase(),
    user,
    maxOutputTokens: 8192,
  });

  // Fontes: união do que a IA declarou com o que ela efetivamente citou no texto.
  const textoTodo = [dados.gratuidade, dados.direito, dados.tutelaUrgencia, ...(dados.pedidos ?? [])].filter(Boolean).join('\n');
  const declaradas = (dados.fontesUtilizadas ?? []).map((f) => f.id);
  const citadasNoTexto = idsCitadosNoTexto(textoTodo);
  const uniao = Array.from(new Set([...declaradas, ...citadasNoTexto])).map((id) => ({ id }));
  const v = validarFontes(uniao, permitidas);

  const minuta: Minuta = {
    enderecamento: dados.enderecamento ?? '',
    classeProcessual: dados.classeProcessual ?? '',
    qualificacaoAutor: dados.qualificacaoAutor ?? '',
    qualificacaoReu: dados.qualificacaoReu ?? '',
    gratuidade: dados.gratuidade ?? '',
    fatos: dados.fatos ?? '',
    direito: dados.direito ?? '',
    tutelaUrgencia: dados.tutelaUrgencia || undefined,
    pedidos: Array.isArray(dados.pedidos) ? dados.pedidos : [],
    valorCausa: dados.valorCausa ?? '',
    provas: dados.provas ?? '',
    fechamento: dados.fechamento ?? '',
    lacunas: Array.isArray(dados.lacunas) ? dados.lacunas : [],
    fundamentacaoNaoLocalizada: [
      ...(Array.isArray(dados.fundamentacaoNaoLocalizada) ? dados.fundamentacaoNaoLocalizada : []),
      ...v.invalidas.map((id) => `Citação "${id}" não existe no corpus e foi descartada pela validação do servidor.`),
    ],
    fontesUtilizadas: v.validas,
    geradoEm: new Date().toISOString(),
    modelo: meta.modelo,
  };

  return {
    minuta,
    meta: {
      modelo: meta.modelo,
      ms: Date.now() - inicio,
      tentativas: meta.tentativas,
      uso: meta.uso,
      fontesRecuperadas: rec.map((r) => ({ id: r.dispositivo.id, pontuacao: r.pontuacao, motivos: r.motivos })),
      citacoesInvalidas: v.invalidas,
      citacoesForaDoContexto: v.foraDoContexto,
    },
  };
}

/* ---------------------------------------------------------------------- */


export interface EntradaMensagem {
  canal?: 'chat' | 'email';
  advogado: { nome: string };
  assistido: { primeiroNome: string; sabeLerEscrever?: boolean; cidade: string };
  pendencias: { nome: string; ondeObter?: string }[];
  cras?: { municipio: string; rede: string; servicos: string[] } | null;
}

export async function tarefaMensagem(e: EntradaMensagem): Promise<{ texto: string; assunto: string; resumoCurto: string; meta: MetaIA }> {
  const inicio = Date.now();
  const user = [
    bloco('tarefa', lerPrompt('04-mensagem-assistido')),
    '<fontes>\n</fontes>',
    bloco('advogado', e.advogado),
    bloco('assistido', e.assistido),
    bloco('pendencias', e.pendencias),
    bloco('cras', e.cras ?? null),
  ].join('\n\n');

  const { dados, meta } = await gerarJSON<{ texto?: string; assunto?: string; resumoCurto?: string }>({
    system: systemBase(),
    user,
    maxOutputTokens: 2048,
    temperature: 0.4,
  });
  return {
    texto: dados.texto ?? '',
    assunto: e.canal === 'email' ? (dados.assunto ?? '') : '',
    resumoCurto: dados.resumoCurto ?? '',
    meta: {
      modelo: meta.modelo,
      ms: Date.now() - inicio,
      tentativas: meta.tentativas,
      uso: meta.uso,
      fontesRecuperadas: [],
      citacoesInvalidas: [],
      citacoesForaDoContexto: [],
    },
  };
}
