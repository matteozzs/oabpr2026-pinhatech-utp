import { STATUS_LABEL, STATUS_LABEL_CIDADAO, type Perfil, type StatusCaso } from '@/types';
import { cn } from '@/lib/utils';

/** Cores na visão do advogado: refletem a etapa do trabalho dele. */
const COR_ADVOGADO: Record<StatusCaso, string> = {
  nova_solicitacao: 'bg-ink-100 text-ink-700',
  em_atendimento: 'bg-navy-100 text-navy-900',
  aguardando_documentos: 'bg-warn-100 text-warn-600',
  minuta_gerada: 'bg-navy-100 text-navy-900',
  pronto_protocolo: 'bg-ok-100 text-ok-600',
  protocolado: 'bg-ok-100 text-ok-600',
};

/**
 * Cores na visão do cidadão: só fica amarelo quando a bola está com ele.
 * O resto do andamento é azul — "está correndo" — e verde no fim.
 */
const COR_CIDADAO: Record<StatusCaso, string> = {
  nova_solicitacao: 'bg-ink-100 text-ink-700',
  em_atendimento: 'bg-navy-100 text-navy-900',
  aguardando_documentos: 'bg-warn-100 text-warn-600',
  minuta_gerada: 'bg-navy-100 text-navy-900',
  pronto_protocolo: 'bg-navy-100 text-navy-900',
  protocolado: 'bg-ok-100 text-ok-600',
};

export function StatusBadge({ status, perfil = 'advogado' }: { status: StatusCaso; perfil?: Perfil }) {
  const cidadao = perfil === 'cidadao';
  return (
    <span className={cn('badge', (cidadao ? COR_CIDADAO : COR_ADVOGADO)[status])}>
      {(cidadao ? STATUS_LABEL_CIDADAO : STATUS_LABEL)[status]}
    </span>
  );
}
