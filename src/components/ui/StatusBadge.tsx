import { STATUS_LABEL, type StatusCaso } from '@/types';
import { cn } from '@/lib/utils';

const COR_STATUS: Record<StatusCaso, string> = {
  nova_solicitacao: 'bg-ink-100 text-ink-700',
  em_atendimento: 'bg-navy-100 text-navy-900',
  aguardando_documentos: 'bg-warn-100 text-warn-600',
  minuta_gerada: 'bg-navy-100 text-navy-900',
  pronto_protocolo: 'bg-ok-100 text-ok-600',
  protocolado: 'bg-ok-100 text-ok-600',
};

export function StatusBadge({ status }: { status: StatusCaso }) {
  return <span className={cn('badge', COR_STATUS[status])}>{STATUS_LABEL[status]}</span>;
}
