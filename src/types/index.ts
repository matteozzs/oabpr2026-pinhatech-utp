/**
 * Modelo de domínio da plataforma Ordem Dativa.
 *
 * Todo o estado da demonstração vive no navegador (localStorage) — ver src/lib/store.ts.
 * Os tipos abaixo são compartilhados entre cliente, route handlers e camada de IA.
 */

export type Area = 'familia' | 'consumidor';

export type Perfil = 'cidadao' | 'advogado';

export type TipoPessoa = 'PF' | 'PJ';

/**
 * A nomeação do advogado dativo e o seu aceite acontecem FORA da plataforma (OAB/PR e Fórum).
 * A plataforma entra em jogo com o advogado já nomeado: o caso nasce "em atendimento".
 */
export type StatusCaso =
  | 'nova_solicitacao' // cidadão enviou o relato; aguardando vínculo com a nomeação
  | 'em_atendimento' // advogado nomeado registrou/recebeu o caso e está atuando
  | 'aguardando_documentos' // documentos solicitados ao assistido
  | 'minuta_gerada' // minuta da petição gerada pela IA e pendente de revisão
  | 'pronto_protocolo' // pacote aprovado pelo advogado
  | 'protocolado'; // protocolo concluído (simulação)

export const STATUS_LABEL: Record<StatusCaso, string> = {
  nova_solicitacao: 'Nova solicitação',
  em_atendimento: 'Em atendimento',
  aguardando_documentos: 'Aguardando documentos',
  minuta_gerada: 'Minuta gerada',
  pronto_protocolo: 'Pronto para protocolo',
  protocolado: 'Protocolado',
};

/**
 * O mesmo status, dito para quem está do outro lado.
 * O cidadão não precisa saber de "minuta" nem de fila interna — precisa saber
 * se está tudo correndo e se falta alguma coisa dele.
 */
export const STATUS_LABEL_CIDADAO: Record<StatusCaso, string> = {
  nova_solicitacao: 'Aguardando advogado',
  em_atendimento: 'Em andamento',
  aguardando_documentos: 'Faltam documentos seus',
  minuta_gerada: 'Em andamento',
  pronto_protocolo: 'Pronto para dar entrada',
  protocolado: 'Protocolado na Justiça',
};

export const AREA_LABEL: Record<Area, string> = {
  familia: 'Família e Sucessões',
  consumidor: 'Direito do Consumidor (Cível)',
};

export interface Assistido {
  nome: string;
  tipoPessoa: TipoPessoa;
  cpf?: string;
  rg?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  profissao?: string;
  endereco?: string;
  bairro?: string;
  cidade: string;
  uf: string;
  cep?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  sabeLerEscrever?: boolean;
  rendaFamiliarMensal?: number;
  membrosFamilia?: number;
}

export interface ParteContraria {
  nome: string;
  tipoPessoa: TipoPessoa;
  relacao?: string;
  endereco?: string;
  cidade?: string;
}

export interface Relato {
  texto: string;
  origem: 'texto' | 'voz';
  urgencia: boolean;
  motivoUrgencia?: string;
}

export type StatusDocumento =
  | 'pendente'
  | 'solicitado'
  | 'recebido'
  | 'gerado'
  | 'assinado'
  | 'nao_aplicavel';

export type ObrigatoriedadeDocumento =
  | 'obrigatorio'
  | 'recomendado'
  | 'se_aplicavel'
  | 'se_pj'
  | 'conforme_caso';

export interface DocumentoCatalogo {
  id: string;
  nome: string;
  descricao: string;
  obrigatoriedade: ObrigatoriedadeDocumento;
  /** Documento que a plataforma gera a partir de template (procuração, declaração, consentimento, petição). */
  geradoPelaPlataforma?: boolean;
  /** Exige assinatura do assistido. */
  exigeAssinatura?: boolean;
  /** Onde o assistido pode obter/regularizar o documento, quando aplicável. */
  ondeObter?: string;
  areas?: Area[];
}

export interface DocumentoCaso extends DocumentoCatalogo {
  status: StatusDocumento;
  arquivoNome?: string;
  atualizadoEm?: string;
  /** Pendência identificada pela IA (motivo textual). */
  observacaoIA?: string;
}

export type MetodoAssinatura =
  | 'assinatura_digital_plataforma'
  | 'gov_br'
  | 'impressao_digitalizacao';

export interface Assinatura {
  documentoId: string;
  metodo: MetodoAssinatura;
  assinadoEm: string;
  /** SHA-256 do conteúdo + carimbo de tempo — simulação de integridade, não certificação ICP-Brasil. */
  hash: string;
  ip?: string;
}

export interface Advogado {
  nome: string;
  oab: string;
  comarcaSede?: string;
  telefone?: string;
}

export type AutorMensagem = 'assistido' | 'advogado' | 'plataforma';
export type CanalMensagem = 'chat' | 'email' | 'whatsapp_simulado';

/** Tipos especiais renderizados como cartões no chat. */
export type TipoMensagem = 'texto' | 'orientacao_cras' | 'solicitacao_assinatura' | 'documento' | 'email';

export interface Mensagem {
  id: string;
  casoId: string;
  autor: AutorMensagem;
  canal: CanalMensagem;
  tipo?: TipoMensagem;
  texto: string;
  enviadoEm: string;
  anexo?: { nome: string; documentoId?: string };
  /** Assunto — só nas mensagens de canal 'email'. */
  assunto?: string;
  /** Mensagem redigida pela IA (para auditoria). */
  geradaPorIA?: boolean;
  /** Lida pelo destinatário (controle simples de "não lidas" na caixa de entrada). */
  lidaPeloAdvogado?: boolean;
}

export interface EventoHistorico {
  em: string;
  tipo: string;
  descricao: string;
  autor: AutorMensagem | 'ia';
}

/* ------------------------------------------------------------------ */
/* Saídas estruturadas da IA — espelham os schemas em prompts/*.md     */
/* ------------------------------------------------------------------ */

export interface FonteCitada {
  id: string;
  diploma: string;
  dispositivo: string;
  /** Preenchido pelo servidor a partir do corpus; nunca pela IA. */
  texto?: string;
  fonte?: string;
}

/**
 * Campos de qualificação que a parte pode simplesmente escrever na conversa
 * ("meu CPF é 000...", "moro na rua tal, 45"). O vocabulário é fechado e as
 * chaves são as de `Assistido`, para que o que a IA extraiu possa ser levado
 * ao formulário sem tradução nem adivinhação.
 */
export const CAMPO_IDENTIFICACAO_LABEL = {
  nome: 'Nome completo',
  cpf: 'CPF',
  rg: 'RG',
  nacionalidade: 'Nacionalidade',
  estadoCivil: 'Estado civil',
  profissao: 'Profissão',
  endereco: 'Endereço',
  bairro: 'Bairro',
  cidade: 'Cidade',
  uf: 'UF',
  cep: 'CEP',
  telefone: 'Telefone',
  email: 'E-mail',
} as const satisfies Record<string, string>;

export type CampoIdentificacao = keyof typeof CAMPO_IDENTIFICACAO_LABEL;

export const CAMPOS_IDENTIFICACAO = Object.keys(CAMPO_IDENTIFICACAO_LABEL) as CampoIdentificacao[];

/** Um dado de qualificação que a parte escreveu no chat, com o trecho de onde saiu. */
export interface DadoNaConversa {
  campo: CampoIdentificacao;
  /** O valor como a parte escreveu — a plataforma não normaliza nem completa. */
  valor: string;
  /** A frase da conversa em que apareceu, para o advogado conferir a origem. */
  trecho: string;
}

export interface ResumoFatico {
  area: Area;
  tema: string;
  temaSlug: string;
  resumoExecutivo: string;
  fatosCronologicos: string[];
  partes: { autor: string; reu: string; vinculo: string };
  pretensao: string;
  urgencia: { existe: boolean; motivo: string };
  hipossuficiencia: { indicios: boolean; justificativa: string };
  dadosFaltantes: string[];
  /**
   * Dados de qualificação ditos por escrito na conversa. Existe para que um CPF
   * solto no meio do chat não se perca entre as mensagens: aparece no resumo e
   * pode ser levado direto para os dados da parte.
   */
  dadosDeIdentificacao: DadoNaConversa[];
  alertas: string[];
  foraDoEscopo: boolean;
  motivoForaDoEscopo?: string;
  geradoEm: string;
  modelo: string;
}

export interface ItemChecklist {
  documentoId: string;
  nome: string;
  situacao: 'ausente' | 'presente' | 'a_confirmar' | 'gerar_na_plataforma';
  porQue: string;
  ondeObter?: string;
  fundamentoId?: string;
}

export interface ChecklistDocumental {
  itens: ItemChecklist[];
  documentosEspecificosDoCaso: { nome: string; porQue: string }[];
  orientacaoCras: boolean;
  fontesUtilizadas: FonteCitada[];
  geradoEm: string;
  modelo: string;
}

export interface Minuta {
  enderecamento: string;
  classeProcessual: string;
  qualificacaoAutor: string;
  qualificacaoReu: string;
  gratuidade: string;
  fatos: string;
  direito: string;
  tutelaUrgencia?: string;
  pedidos: string[];
  valorCausa: string;
  provas: string;
  fechamento: string;
  lacunas: string[];
  fontesUtilizadas: FonteCitada[];
  fundamentacaoNaoLocalizada: string[];
  geradoEm: string;
  modelo: string;
  /** Preenchido quando o advogado revisa e marca a minuta como conferida (só possível sem lacunas). */
  revisadaEm?: string;
  /** Marcado quando o advogado editou o texto gerado. */
  editadaEm?: string;
}

export interface Caso {
  id: string;
  protocolo: string;
  criadoEm: string;
  atualizadoEm: string;
  area: Area;
  comarca: string;
  temProcessoAtivo: boolean;
  numeroProcesso?: string;
  assistido: Assistido;
  parteContraria?: ParteContraria;
  relato: Relato;
  status: StatusCaso;
  advogado?: Advogado;
  ia: {
    resumo?: ResumoFatico;
    checklist?: ChecklistDocumental;
    minuta?: Minuta;
  };
  /** Referência da nomeação feita pela OAB/Fórum (ofício, data) — informada pelo advogado. */
  nomeacao?: { referencia?: string; em?: string; origem: 'oab' | 'forum' | 'outro' };
  /** Quem registrou o caso na plataforma. */
  registradoPor?: 'assistido' | 'advogado';
  documentos: DocumentoCaso[];
  assinaturas: Assinatura[];
  historico: EventoHistorico[];
  /** Caso de demonstração pré-carregado. */
  semente?: boolean;
  /** Id do cenário de auditoria que originou o caso — permite limpar só os de teste. */
  cenarioTeste?: string;
}

/* ------------------------------------------------------------------ */
/* Metadados de auditoria da IA — contrato compartilhado cliente/servidor */
/* ------------------------------------------------------------------ */

export interface TentativaModelo {
  modelo: string;
  status: 'ok' | 'indisponivel' | 'erro';
  httpStatus?: number;
  detalhe?: string;
  ms: number;
}

export interface UsoTokens {
  entrada?: number;
  saida?: number;
  raciocinio?: number;
}

/** O que o painel de auditoria mostra ao auditor sobre uma chamada de IA. */
export interface MetaIA {
  modelo: string;
  ms: number;
  tentativas: TentativaModelo[];
  uso?: UsoTokens;
  fontesRecuperadas: { id: string; pontuacao: number; motivos: string[] }[];
  citacoesInvalidas: string[];
  citacoesForaDoContexto: string[];
}
