import type { Area, DocumentoCatalogo } from '@/types';

/**
 * Catálogo de documentos exigidos para instrução do processo.
 *
 * Base comum a todos os casos + específicos por área. A IA (prompts/02-checklist-documental.md)
 * cruza este catálogo com a narrativa do assistido para apontar o que está ausente.
 */
export const DOCUMENTOS_BASE: DocumentoCatalogo[] = [
  {
    id: 'peticao_inicial',
    nome: 'Petição Inicial',
    descricao: 'Minuta gerada pela plataforma e revisada pelo advogado dativo.',
    obrigatoriedade: 'obrigatorio',
    geradoPelaPlataforma: true,
  },
  {
    id: 'procuracao',
    nome: 'Procuração',
    descricao: 'Instrumento de mandato outorgando poderes ao advogado (art. 105 do CPC).',
    obrigatoriedade: 'obrigatorio',
    geradoPelaPlataforma: true,
    exigeAssinatura: true,
  },
  {
    id: 'consentimento_dados',
    nome: 'Termo de Consentimento para Uso de Dados',
    descricao: 'Autorização do assistido para tratamento dos seus dados pessoais na plataforma (LGPD).',
    obrigatoriedade: 'obrigatorio',
    geradoPelaPlataforma: true,
    exigeAssinatura: true,
  },
  {
    id: 'declaracao_hipossuficiencia',
    nome: 'Declaração de Hipossuficiência',
    descricao: 'Declaração de insuficiência de recursos para gratuidade da justiça (art. 98 e 99 do CPC).',
    obrigatoriedade: 'se_aplicavel',
    geradoPelaPlataforma: true,
    exigeAssinatura: true,
    ondeObter: 'Gerada pela plataforma. Se precisar de apoio para regularizar o CadÚnico, procure o CRAS do seu município.',
  },
  {
    id: 'documentos_pessoais',
    nome: 'Documentos Pessoais (RG e CPF)',
    descricao: 'Documento oficial com foto e CPF do assistido.',
    obrigatoriedade: 'recomendado',
    ondeObter: 'Instituto de Identificação do Paraná (RG) e Receita Federal (CPF).',
  },
  {
    id: 'comprovante_residencia',
    nome: 'Comprovante de Residência',
    descricao: 'Conta de água, luz, telefone ou declaração de residência recente.',
    obrigatoriedade: 'recomendado',
  },
  {
    id: 'guia_custas',
    nome: 'Guia de Custas ou Pedido de Isenção',
    descricao: 'Comprovante de recolhimento das custas iniciais ou pedido de gratuidade na própria petição.',
    obrigatoriedade: 'obrigatorio',
  },
  {
    id: 'contrato_social',
    nome: 'Contrato Social',
    descricao: 'Obrigatório apenas se o assistido for pessoa jurídica.',
    obrigatoriedade: 'se_pj',
  },
  {
    id: 'documentos_especificos',
    nome: 'Documentos Específicos do Caso',
    descricao: 'Contratos, laudos, certidões, comprovantes e demais provas conforme a natureza da causa.',
    obrigatoriedade: 'conforme_caso',
  },
];

export const DOCUMENTOS_FAMILIA: DocumentoCatalogo[] = [
  {
    id: 'certidao_nascimento_filhos',
    nome: 'Certidão de Nascimento dos Filhos',
    descricao: 'Comprova a filiação e a obrigação alimentar (art. 1.696 do CC).',
    obrigatoriedade: 'conforme_caso',
    areas: ['familia'],
    ondeObter: 'Cartório de Registro Civil onde foi feito o registro. Segunda via gratuita para quem tem hipossuficiência (Lei 9.534/97).',
  },
  {
    id: 'certidao_casamento',
    nome: 'Certidão de Casamento',
    descricao: 'Necessária em divórcio, separação e questões patrimoniais.',
    obrigatoriedade: 'conforme_caso',
    areas: ['familia'],
    ondeObter: 'Cartório de Registro Civil onde foi celebrado o casamento.',
  },
  {
    id: 'comprovante_despesas_filhos',
    nome: 'Comprovantes de Despesas dos Filhos',
    descricao: 'Escola, saúde, alimentação, vestuário — demonstram a necessidade (art. 1.694, §1º do CC).',
    obrigatoriedade: 'recomendado',
    areas: ['familia'],
  },
  {
    id: 'comprovante_renda_partes',
    nome: 'Indicativos de Renda do Alimentante',
    descricao: 'Holerite, carteira de trabalho, extratos ou declaração de onde trabalha e quanto ganha aproximadamente (art. 2º da Lei 5.478/68).',
    obrigatoriedade: 'recomendado',
    areas: ['familia'],
  },
  {
    id: 'comprovante_uniao_estavel',
    nome: 'Provas da União Estável',
    descricao: 'Fotos, declarações, contas conjuntas, comprovantes de mesmo endereço (art. 1.723 do CC).',
    obrigatoriedade: 'conforme_caso',
    areas: ['familia'],
  },
];

export const DOCUMENTOS_CONSUMIDOR: DocumentoCatalogo[] = [
  {
    id: 'contrato_ou_nota',
    nome: 'Contrato, Nota Fiscal ou Comprovante da Compra',
    descricao: 'Prova da relação de consumo (arts. 2º e 3º do CDC).',
    obrigatoriedade: 'obrigatorio',
    areas: ['consumidor'],
  },
  {
    id: 'faturas_cobrancas',
    nome: 'Faturas e Cobranças Contestadas',
    descricao: 'Boletos, faturas, prints de cobrança — base para repetição do indébito (art. 42, parágrafo único do CDC).',
    obrigatoriedade: 'conforme_caso',
    areas: ['consumidor'],
  },
  {
    id: 'protocolos_atendimento',
    nome: 'Protocolos de Atendimento e Reclamações',
    descricao: 'Números de protocolo, e-mails, prints de chat com o fornecedor, registro no Procon ou consumidor.gov.br.',
    obrigatoriedade: 'recomendado',
    areas: ['consumidor'],
    ondeObter: 'consumidor.gov.br e Procon-PR aceitam reclamação gratuita e geram protocolo.',
  },
  {
    id: 'negativacao',
    nome: 'Comprovante de Negativação',
    descricao: 'Consulta ao SPC/Serasa mostrando a inscrição contestada (art. 43 do CDC).',
    obrigatoriedade: 'conforme_caso',
    areas: ['consumidor'],
    ondeObter: 'Consulta gratuita nos sites do Serasa e do SPC Brasil.',
  },
  {
    id: 'laudo_ou_fotos_produto',
    nome: 'Fotos, Laudo ou Ordem de Serviço do Produto/Serviço',
    descricao: 'Evidência do vício ou defeito (arts. 18 e 20 do CDC).',
    obrigatoriedade: 'conforme_caso',
    areas: ['consumidor'],
  },
];

export function catalogoPorArea(area: Area): DocumentoCatalogo[] {
  const especificos = area === 'familia' ? DOCUMENTOS_FAMILIA : DOCUMENTOS_CONSUMIDOR;
  return [...DOCUMENTOS_BASE, ...especificos];
}

export const OBRIGATORIEDADE_LABEL = {
  obrigatorio: 'Obrigatório',
  recomendado: 'Recomendado',
  se_aplicavel: 'Se aplicável',
  se_pj: 'Se PJ',
  conforme_caso: 'Conforme o caso',
} as const;
