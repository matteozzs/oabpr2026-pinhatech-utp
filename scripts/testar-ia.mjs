/**
 * Massa de testes da IA — roda os atendimentos de demonstração contra a API real.
 *
 *   npm run dev            # em outro terminal
 *   npm run testar:ia
 *
 * Variáveis: BASE (padrão http://localhost:3000), OUT (pasta de saída).
 * Produz evidencias/testes-ia/resultados.json (bruto) e relatorio.md (legível).
 *
 * Os casos testados são exatamente os que o avaliador vê em Atendimentos — mesmos
 * relatos, mesmas conversas. Não há massa paralela: o que passa aqui é o que ele
 * encontra na tela.
 */
import { register } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

register('./resolver-ts.mjs', import.meta.url);
const { CASOS_SEMENTE, MENSAGENS_SEMENTE } = await import('../src/data/casos-semente.ts');

const BASE = process.env.BASE ?? 'http://localhost:3000';
const DIR = process.env.OUT ?? 'evidencias/testes-ia';

/** O que cada atendimento coloca à prova, para o relatório dizer por que ele está aqui. */
const PROPOSITO = {
  caso_demo_001: {
    testa: 'O funcionamento normal, com relato completo e conversa coerente. Serve de referência para comparar com os demais.',
    esperado: 'Fatos em ordem e indícios de hipossuficiência reconhecidos. Nenhuma citação de lei: o resumo é só fato.',
    falhaSe: 'Citar dispositivo legal, classificar juridicamente o caso, ou inventar valor, data ou endereço não informado.',
  },
  caso_demo_002: {
    testa: 'Se a IA acrescenta à pretensão o que a parte não pediu. O relato pede a baixa da negativação, o fim da cobrança e a devolução — nada além disso.',
    esperado: 'A pretensão fica no que ela pediu. Tese que o advogado pode somar vai para os alertas, como sugestão, nunca dentro da pretensão.',
    falhaSe: 'Trazer dano moral ou repetição em dobro para dentro de `pretensao`.',
  },
  caso_demo_003: {
    testa: 'Relato por voz, de parte que escreve com dificuldade, e urgência que se agrava ao longo da conversa.',
    esperado: 'Os fatos acompanham a conversa: o corte segue no quinto dia, não no terceiro que constava no relato inicial.',
    falhaSe: 'Ignorar a atualização da conversa, ou tratar a dificuldade de escrita como incerteza sobre o fato.',
  },
  caso_demo_004: {
    testa: 'Dado de qualificação escrito pela parte no meio do chat. É a informação mais fácil de se perder, e sem ela a procuração sai com lacuna.',
    esperado: 'CPF, RG e endereço aparecem em `dadosDeIdentificacao`, com o valor exatamente como ela digitou e o trecho de onde saiu.',
    falhaSe: 'Deixar o CPF de fora, reformatar o número, ou completar o endereço com o que não foi dito.',
  },
  caso_demo_005: {
    testa: 'Caso com processo já em andamento, em que a parte quer reduzir o valor, não deixar de pagar.',
    esperado: 'A pretensão reflete o pedido de ajuste do valor. A ameaça de prisão mencionada pela outra parte vira alerta, não fato consumado.',
    falhaSe: 'Descrever a pretensão como exoneração, ou registrar a prisão como algo já decidido.',
  },
  caso_demo_006: {
    testa: 'Captura parcial: a parte digita o CPF e o endereço, mas diz que não sabe o RG de cabeça e que mandará a foto depois.',
    esperado: 'CPF e endereço capturados. O RG **não** aparece: a IA não lê anexos e não adivinha número.',
    falhaSe: 'Inventar o RG, ou dar por recebido o documento que ainda não chegou.',
  },
  caso_demo_007: {
    testa: 'O atendimento em branco, sem relato e sem conversa. Sem material, a pergunta certa não é o que a IA responde, e sim se ela chega a ser chamada.',
    esperado: 'A rota recusa com HTTP 400 e uma frase explicando por quê. Nenhuma chamada ao modelo é feita. Na tela, o botão de resumir já vem desabilitado, com o mesmo motivo.',
    falhaSe: 'Chamar o modelo e devolver um resumo — fatos, partes ou pretensão inventados a partir do nada.',
  },
};

/** Monta o payload como a aplicação monta: caso + conversa em ordem cronológica. */
function montar(caso) {
  const mensagens = MENSAGENS_SEMENTE.filter((m) => m.casoId === caso.id).sort((a, b) => a.enviadoEm.localeCompare(b.enviadoEm));
  return { caso, mensagens };
}

/**
 * Verificações automáticas. Cada uma devolve [rótulo, passou].
 * O que não dá para automatizar sem julgamento humano fica no relatório para leitura.
 */
function conferir(caso, mensagens, R) {
  // Só o que o modelo escreveu. O resumo é factual: não recebe corpus e o prompt
  // proíbe citar lei, então a verificação central é a ausência de enquadramento jurídico.
  const txt = JSON.stringify([
    R.resumoExecutivo, R.tema, R.pretensao, R.fatosCronologicos,
    R.partes, R.urgencia, R.hipossuficiencia, R.dadosFaltantes, R.alertas,
  ]);
  // A checagem de citação exclui `alertas`: é ali que a IA deve nomear o dispositivo
  // que a parte mencionou por engano, para o advogado desfazer.
  const substancia = JSON.stringify([
    R.resumoExecutivo, R.tema, R.pretensao, R.fatosCronologicos, R.partes,
    R.urgencia, R.hipossuficiencia, R.dadosFaltantes,
  ]);

  // Dado de qualificação só pode ter vindo da conversa. Comparação sem pontuação e sem
  // acento: o que importa é se a sequência existe no que a parte escreveu, não o formato.
  const cru = (x) => (x ?? '').normalize('NFD').replace(/[^0-9a-z]/gi, '').toLowerCase();
  const conversaCrua = cru(mensagens.map((m) => m.texto).join(' '));
  const ditos = Array.isArray(R.dadosDeIdentificacao) ? R.dadosDeIdentificacao : [];

  const base = [
    ['não cita lei nos fatos e na pretensão', !/\bart\.|\bartigo\b|s[úu]mula|\bCPC\b|\bCDC\b|CF\/88|\bLei n/i.test(substancia)],
    ['não faz enquadramento processual', !/nos termos d|com fulcro|rito (ordin|sum|especial)|compet[êe]ncia do (ju[íi]zo|foro)/i.test(txt)],
    ['todo dado de identificação veio da conversa', ditos.every((d) => conversaCrua.includes(cru(d.valor)))],
    // A triagem de urgência é juízo do modelo e varia entre execuções — não dá para
    // fixar o veredito num teste. O que a plataforma garante é outra coisa, e essa sim
    // é determinística: ou vem justificada, ou vem declarada como não avaliada. Campo em
    // branco nunca chega ao advogado como "não há urgência". O veredito de cada caso fica
    // no relatório, em "Observado", para leitura humana.
    [
      'a urgência vem justificada ou declarada como não avaliada',
      (R.urgencia.motivo ?? '').trim().length > 0 || R.dadosFaltantes.some((d) => /urgência não avaliada/i.test(d)),
    ],
  ];

  const porCaso = {
    caso_demo_001: [
      ['identifica o assunto', /pens|aliment/i.test(R.tema + R.resumoExecutivo)],
      ['lista os fatos em ordem', R.fatosCronologicos.length >= 3],
      ['reconhece indícios de hipossuficiência', R.hipossuficiencia.indicios === true],
    ],
    caso_demo_002: [
      ['não acrescenta pedido que a parte não fez', !/dano moral|em dobro/i.test(R.pretensao)],
      ['registra a negativação como fato', /serasa|negativ/i.test(txt)],
    ],
    caso_demo_003: [['usa a informação mais recente da conversa', /quinto dia|cinco dias|5 dias/i.test(txt)]],
    caso_demo_004: [
      ['captura o CPF que a parte digitou', ditos.some((d) => d.campo === 'cpf' && cru(d.valor) === '03847291055')],
      ['captura o RG que a parte digitou', ditos.some((d) => d.campo === 'rg' && cru(d.valor) === '84321170')],
      ['captura o endereço que a parte digitou', ditos.some((d) => d.campo === 'endereco' && /sete de setembro/i.test(d.valor))],
    ],
    caso_demo_005: [
      ['a pretensão é ajustar o valor, não deixar de pagar', !/exoner|isen[çc]|cancelamento da pens/i.test(R.pretensao)],
      ['não registra a prisão como fato consumado', !/foi preso|prisão decretada|teve a prisão/i.test(txt)],
    ],
    caso_demo_006: [
      ['captura o CPF que a parte digitou', ditos.some((d) => d.campo === 'cpf' && cru(d.valor) === '11744820966')],
      ['não inventa o RG que ela disse não saber', !ditos.some((d) => d.campo === 'rg')],
    ],

  };

  return [...base, ...(porCaso[caso.id] ?? [])];
}

/* ---------------------------------------------------------------------- */

const saida = { executadoEm: new Date().toISOString(), base: BASE, resultados: [] };
let totalOk = 0;
let totalChecks = 0;

for (const semente of CASOS_SEMENTE) {
  const { caso, mensagens } = montar(semente);
  const t0 = Date.now();
  const r = await fetch(`${BASE}/api/ia/resumo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caso, mensagens }),
  });
  const j = await r.json();
  const ms = Date.now() - t0;

  // Sem relato e sem fala da parte não há o que resumir: o esperado aqui é a recusa,
  // não uma resposta. É a trava do lado do servidor, espelhando a do botão na tela.
  const material = [caso.relato.texto, ...mensagens.map((m) => m.texto)].join(' ').trim();
  const checks =
    material.length < 10
      ? [
          ['a rota recusa gerar sem material', r.status === 400],
          ['nenhum resumo é produzido', !j.resumo],
          ['a recusa explica o motivo', typeof j.erro === 'string' && j.erro.length > 20],
        ]
      : j.resumo
        ? conferir(caso, mensagens, j.resumo)
        : [['a API respondeu', false]];
  const ok = checks.filter(([, v]) => v).length;
  totalOk += ok;
  totalChecks += checks.length;

  const proposito = PROPOSITO[caso.id] ?? { testa: '', esperado: '', falhaSe: '' };
  saida.resultados.push({
    caso: caso.id,
    protocolo: caso.protocolo,
    area: caso.area,
    comarca: caso.comarca,
    falasDaParte: mensagens.filter((m) => m.autor === 'assistido').length,
    ...proposito,
    http: r.status,
    ms,
    verificacoes: checks.map(([rotulo, passou]) => ({ rotulo, passou })),
    resumo: j.resumo ?? null,
    meta: j.meta ?? null,
    erro: j.erro ?? null,
  });

  const marca = ok === checks.length ? 'PASSA' : 'FALHA';
  console.log(`  ${marca}  ${String(ms).padStart(5)}ms  ${caso.protocolo.padEnd(16)} ${ok}/${checks.length} verificações`);
}

await mkdir(DIR, { recursive: true });
await writeFile(`${DIR}/resultados.json`, JSON.stringify(saida, null, 1), 'utf8');

const linhas = [
  '# Resultado da massa de testes da IA',
  '',
  `Execução automática dos ${CASOS_SEMENTE.length} atendimentos de demonstração contra \`${BASE}/api/ia/resumo\`.`,
  'São os mesmos casos que aparecem em **Atendimentos** — mesmos relatos, mesmas conversas.',
  `Gerado em ${new Date(saida.executadoEm).toLocaleString('pt-BR')} por \`npm run testar:ia\`.`,
  '',
  `**${totalOk} de ${totalChecks} verificações passaram.**`,
  '',
  '| Protocolo | Área | Comarca | Falas da parte | Verificações | Tempo |',
  '|---|---|---|---|---|---|',
  ...saida.resultados.map((r) => {
    const ok = r.verificacoes.filter((v) => v.passou).length;
    const marca = ok === r.verificacoes.length ? '✅' : '❌';
    return `| ${r.protocolo} | ${r.area} | ${r.comarca} | ${r.falasDaParte} | ${marca} ${ok}/${r.verificacoes.length} | ${r.ms}ms |`;
  }),
  '',
  '## Detalhe por atendimento',
  '',
];

for (const r of saida.resultados) {
  linhas.push(`### ${r.protocolo} — ${r.comarca}`, '');
  linhas.push(`**Testa:** ${r.testa}`, '');
  linhas.push(`**Esperado:** ${r.esperado}`, '');
  linhas.push(`**Falha se:** ${r.falhaSe}`, '');
  linhas.push('**Verificações automáticas:**', '');
  for (const v of r.verificacoes) linhas.push(`- ${v.passou ? '✅' : '❌'} ${v.rotulo}`);
  if (r.resumo) {
    const ditos = r.resumo.dadosDeIdentificacao ?? [];
    linhas.push(
      '',
      `**Observado:** escopo ${r.resumo.foraDoEscopo ? 'RECUSADO' : 'aceito'} · urgência ${r.resumo.urgencia.existe} · ` +
        `hipossuficiência ${r.resumo.hipossuficiencia.indicios} · ${r.resumo.fatosCronologicos.length} fato(s) · ` +
        `${r.resumo.dadosFaltantes.length} dado(s) faltante(s) · ${ditos.length} dado(s) de identificação · ${r.resumo.alertas.length} alerta(s)`,
      '',
      `> ${r.resumo.resumoExecutivo}`,
    );
    if (ditos.length) {
      linhas.push('', '**Dados de qualificação recuperados da conversa:**', '');
      for (const d of ditos) linhas.push(`- \`${d.campo}\` = ${d.valor} — “${d.trecho}”`);
    }
    if (r.resumo.alertas.length) {
      linhas.push('', '**Alertas levantados pela IA:**', '');
      for (const a of r.resumo.alertas) linhas.push(`- ${a}`);
    }
  }
  linhas.push('');
}

linhas.push('---', '', 'Saída bruta completa, com o payload e os metadados de auditoria de cada chamada: [`resultados.json`](resultados.json).');

await writeFile(`${DIR}/relatorio.md`, linhas.join('\n'), 'utf8');

console.log(`\n  ${totalOk}/${totalChecks} verificações · ${DIR}/relatorio.md`);
if (totalOk < totalChecks) process.exitCode = 1;
