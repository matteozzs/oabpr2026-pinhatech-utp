import Link from 'next/link';
import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import type { Caso } from '@/types';
import { AREA_LABEL } from '@/types';
import { StatusBadge } from '@/components/ui';
import { cn, formatarData } from '@/lib/utils';

function primeirasPalavras(t: string, n = 12) {
  const p = t.split(/\s+/).slice(0, n).join(' ');
  return p.length < t.length ? p + '…' : p;
}

/** Item da lista de casos — usado no painel do advogado e na lista do cidadão. */
export function CardCaso({ caso, href, naoLidas = 0, destacarUrgencia = true }: { caso: Caso; href: string; naoLidas?: number; destacarUrgencia?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'card p-4 sm:p-5 flex items-center justify-between gap-3 hover:border-navy-500 transition',
        destacarUrgencia && caso.relato.urgencia && 'border-l-4 border-l-danger-600',
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
          <span className="font-mono">{caso.protocolo}</span>
          <span>·</span>
          <span>{AREA_LABEL[caso.area]}</span>
          {caso.relato.urgencia && (
            <span className="badge bg-danger-100 text-danger-600 inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> urgente
            </span>
          )}
          {caso.ia.resumo && (
            <span className="badge bg-navy-100 text-navy-900 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> analisado
            </span>
          )}
          {naoLidas > 0 && <span className="badge bg-navy-700 text-white">{naoLidas} nova(s)</span>}
        </div>
        <p className="font-semibold text-ink-900 truncate mt-0.5">{caso.ia.resumo?.tema ?? primeirasPalavras(caso.relato.texto)}</p>
        <p className="text-sm text-ink-700">
          {caso.assistido.nome} · {caso.comarca} · {caso.temProcessoAtivo ? 'processo em andamento' : 'sem processo'} · {formatarData(caso.criadoEm)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={caso.status} />
        <ArrowRight className="w-4 h-4 text-ink-500" />
      </div>
    </Link>
  );
}
