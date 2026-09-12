import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import type { Advogado, Caso, Minuta } from '@/types';
import { capitalizarNome, dataPorExtenso } from '@/lib/utils';

/**
 * Geração de documentos .docx a partir dos templates oficiais em /templates.
 *
 * Os textos abaixo reproduzem, palavra por palavra, os modelos PROCURACAO.docx e
 * DECLARACAO_HIPOSSUFICIENCIA.docx fornecidos pela equipe. Dados não informados permanecem
 * com o marcador entre colchetes para preenchimento na entrevista — a plataforma nunca inventa.
 */

const M = '[A COMPLETAR EM ENTREVISTA]';

function ou(v: string | undefined | null, marcador = M) {
  return v && String(v).trim() ? String(v).trim() : marcador;
}

function p(texto: string, opts: { negrito?: boolean; alinhamento?: (typeof AlignmentType)[keyof typeof AlignmentType]; tamanho?: number; espacoDepois?: number } = {}) {
  return new Paragraph({
    alignment: opts.alinhamento ?? AlignmentType.JUSTIFIED,
    spacing: { after: opts.espacoDepois ?? 240, line: 360 },
    children: [new TextRun({ text: texto, bold: opts.negrito, size: opts.tamanho ?? 24, font: 'Times New Roman' })],
  });
}

function titulo(texto: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 480 },
    children: [new TextRun({ text: texto, bold: true, size: 28, font: 'Times New Roman' })],
  });
}

function qualificacao(c: Caso) {
  const a = c.assistido;
  const endereco = [a.endereco, a.bairro, a.cidade && a.uf ? `${a.cidade}/${a.uf}` : a.cidade, a.cep ? `CEP ${a.cep}` : null]
    .filter(Boolean)
    .join(', ');
  return {
    nome: ou(a.nome).toUpperCase(),
    nacionalidade: ou(a.nacionalidade, 'brasileiro(a)'),
    estadoCivil: ou(a.estadoCivil),
    profissao: ou(a.profissao),
    cpf: ou(a.cpf, '[número do CPF — A COMPLETAR]'),
    rg: ou(a.rg, '[número do RG — A COMPLETAR]'),
    endereco: ou(endereco, '[endereço completo — A COMPLETAR]'),
  };
}

function localData(c: Caso) {
  const { dia, mes, ano } = dataPorExtenso();
  return `${capitalizarNome(c.assistido.cidade || c.comarca)}/${c.assistido.uf || 'PR'}, ${dia} de ${mes} de ${ano}.`;
}

function assinatura(nome: string) {
  return [
    new Paragraph({ spacing: { before: 720 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '_____________________________________________', font: 'Times New Roman' })] }),
    p(nome, { alinhamento: AlignmentType.CENTER, negrito: true, espacoDepois: 0 }),
  ];
}

function rodapeIA(txt = 'Documento gerado pela plataforma Ordem Dativa a partir de template. Requer conferência e assinatura.') {
  return new Paragraph({
    spacing: { before: 720 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: txt, italics: true, size: 18, color: '666666', font: 'Times New Roman' })],
  });
}

/* ------------------------------------------------------------------ */

export function docProcuracao(c: Caso, adv: Advogado) {
  const q = qualificacao(c);
  const oab = adv.oab.replace(/\s*\(.*?\)\s*/g, '').trim();
  return new Document({
    sections: [
      {
        children: [
          titulo('PROCURAÇÃO'),
          p(
            `Eu, ${q.nome}, ${q.nacionalidade}, ${q.estadoCivil}, ${q.profissao}, portador(a) do CPF nº ${q.cpf} e RG nº ${q.rg}, residente e domiciliado(a) em ${q.endereco}, nomeio e constituo como meu(minha) procurador(a) o(a) advogado(a) ${adv.nome.toUpperCase()}, inscrito(a) na ${oab || 'OAB/[UF] sob o nº [número da OAB]'}, conferindo-lhe poderes para me representar judicial e extrajudicialmente, praticando todos os atos necessários à defesa dos meus direitos e interesses.`,
          ),
          p(
            'Para tanto, concedo poderes para propor ações, apresentar defesa, acompanhar processos, requerer documentos e providências, apresentar petições, recursos e manifestações, produzir provas, receber intimações e praticar os demais atos necessários ao regular andamento do processo.',
          ),
          p(
            'Concedo também os poderes especiais previstos no art. 105 do Código de Processo Civil, quando aplicáveis, para confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, receber, dar quitação, firmar compromisso e assinar declaração de hipossuficiência econômica.',
          ),
          p(
            `A presente procuração destina-se especialmente à representação do(a) outorgante no processo ou atendimento relacionado a ${c.numeroProcesso ? c.numeroProcesso : `[Número do Processo — a distribuir] (protocolo interno ${c.protocolo})`}.`,
          ),
          p('Declaro estar ciente dos poderes concedidos por meio deste instrumento.'),
          p(localData(c), { alinhamento: AlignmentType.RIGHT }),
          ...assinatura(q.nome),
          rodapeIA(),
        ],
      },
    ],
  });
}

export function docDeclaracaoHipossuficiencia(c: Caso) {
  const q = qualificacao(c);
  return new Document({
    sections: [
      {
        children: [
          titulo('DECLARAÇÃO DE HIPOSSUFICIÊNCIA ECONÔMICA'),
          p(
            `Eu, ${q.nome}, ${q.nacionalidade}, ${q.estadoCivil}, ${q.profissao}, portador(a) do CPF nº ${q.cpf} e RG nº ${q.rg}, residente e domiciliado(a) em ${q.endereco}, DECLARO, sob as penas da lei, que não disponho de recursos financeiros suficientes para arcar com as custas, despesas processuais e honorários advocatícios sem comprometer meu sustento e o de minha família.`,
          ),
          p(
            'Diante disso, requeiro a concessão dos benefícios da justiça gratuita, nos termos do art. 5º, inciso LXXIV, da Constituição Federal e dos arts. 98 e seguintes do Código de Processo Civil.',
          ),
          p(
            'Declaro, ainda, estar ciente de que, caso necessário, poderei ser chamado(a) a apresentar documentos destinados à comprovação da minha insuficiência de recursos, especialmente quando não estiver abrangido(a) pela presunção relativa estabelecida pela jurisprudência aplicável.',
          ),
          p('Declaro, para que produza os efeitos legais, a veracidade das informações aqui prestadas.'),
          p(localData(c), { alinhamento: AlignmentType.RIGHT }),
          ...assinatura(q.nome),
          rodapeIA(),
        ],
      },
    ],
  });
}

export function docConsentimentoDados(c: Caso, adv: Advogado) {
  const q = qualificacao(c);
  return new Document({
    sections: [
      {
        children: [
          titulo('TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS'),
          p(
            `Eu, ${q.nome}, portador(a) do CPF nº ${q.cpf}, na condição de titular dos dados, AUTORIZO o(a) advogado(a) dativo(a) ${adv.nome.toUpperCase()} (${adv.oab}) e a plataforma Ordem Dativa a realizar o tratamento dos meus dados pessoais, inclusive dados sensíveis eventualmente necessários, com a finalidade específica e determinada de prestação de assistência jurídica gratuita no atendimento identificado pelo protocolo ${c.protocolo}, nos termos do art. 7º, inciso I, e do art. 8º da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais).`,
          ),
          p(
            'Os dados serão utilizados exclusivamente para: (i) análise do caso e elaboração de documentos e peças processuais; (ii) comunicação comigo pelos canais da plataforma; (iii) instrução do processo judicial ou administrativo correspondente; e (iv) cumprimento de obrigações legais e regulamentares perante a OAB/PR e o Poder Judiciário.',
          ),
          p(
            'Estou ciente de que posso, a qualquer momento, solicitar acesso, correção, anonimização, portabilidade ou eliminação dos meus dados, bem como revogar este consentimento, mediante manifestação ao(à) advogado(a) responsável, sem prejuízo dos tratamentos realizados até a revogação e daqueles exigidos por lei.',
          ),
          p('Declaro que li e compreendi este termo, e que o consentimento é livre, informado e inequívoco.'),
          p(localData(c), { alinhamento: AlignmentType.RIGHT }),
          ...assinatura(q.nome),
          rodapeIA(),
        ],
      },
    ],
  });
}

export function docPeticaoInicial(c: Caso, m: Minuta, adv: Advogado) {
  const secao = (t: string) => p(t, { negrito: true, alinhamento: AlignmentType.LEFT, espacoDepois: 120 });
  const paras: Paragraph[] = [
    p(m.enderecamento, { negrito: true, alinhamento: AlignmentType.CENTER, espacoDepois: 480 }),
    p(m.qualificacaoAutor),
    p(`vem, por seu(sua) advogado(a) dativo(a) que esta subscreve, propor a presente`, { alinhamento: AlignmentType.LEFT }),
    p(m.classeProcessual, { negrito: true, alinhamento: AlignmentType.CENTER }),
    p(`em face de ${m.qualificacaoReu}, pelos fatos e fundamentos a seguir expostos.`),
    secao('I — DA GRATUIDADE DA JUSTIÇA'),
    p(m.gratuidade),
    secao('II — DOS FATOS'),
    p(m.fatos),
    secao('III — DO DIREITO'),
    p(m.direito),
  ];
  if (m.tutelaUrgencia) {
    paras.push(secao('IV — DA TUTELA DE URGÊNCIA'), p(m.tutelaUrgencia));
  }
  paras.push(secao(`${m.tutelaUrgencia ? 'V' : 'IV'} — DOS PEDIDOS`), p('Diante do exposto, requer-se:'));
  m.pedidos.forEach((ped, i) => paras.push(p(`${String.fromCharCode(97 + i)}) ${ped}`)));
  paras.push(secao(`${m.tutelaUrgencia ? 'VI' : 'V'} — DAS PROVAS`), p(m.provas));
  paras.push(secao('DO VALOR DA CAUSA'), p(m.valorCausa));
  paras.push(p(m.fechamento, { alinhamento: AlignmentType.LEFT }));
  paras.push(...assinatura(`${adv.nome} — ${adv.oab}`));
  if (m.lacunas.length) {
    paras.push(secao('LACUNAS A PREENCHER NA ENTREVISTA (remover antes do protocolo)'));
    m.lacunas.forEach((l) => paras.push(p(`• ${l}`, { alinhamento: AlignmentType.LEFT, espacoDepois: 60 })));
  }
  if (m.fontesUtilizadas.length) {
    paras.push(secao('FONTES CITADAS (corpus da plataforma)'));
    m.fontesUtilizadas.forEach((f) => paras.push(p(`[${f.id}] ${f.diploma}, ${f.dispositivo}`, { alinhamento: AlignmentType.LEFT, espacoDepois: 60, tamanho: 20 })));
  }
  paras.push(rodapeIA(`Minuta gerada por IA (${m.modelo}) em ${new Date(m.geradoEm).toLocaleString('pt-BR')} com fundamentação restrita ao corpus da plataforma. Requer revisão integral e assinatura do(a) advogado(a).`));
  return new Document({ sections: [{ children: paras }] });
}

export async function paraBuffer(doc: Document) {
  return Packer.toBuffer(doc);
}
