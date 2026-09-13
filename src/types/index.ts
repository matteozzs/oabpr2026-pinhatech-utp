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
