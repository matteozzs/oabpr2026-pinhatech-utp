import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Bloco padrão de conteúdo: título, descrição opcional, ações à direita. */
export function Secao({
  titulo,
  descricao,
  acoes,
  children,
  className,
  id,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('card p-5 sm:p-6', className)} aria-labelledby={id ? `${id}-titulo` : undefined}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 id={id ? `${id}-titulo` : undefined} className="text-lg font-bold text-ink-900">
            {titulo}
          </h2>
          {descricao && <p className="text-sm text-ink-500 mt-0.5">{descricao}</p>}
        </div>
        {acoes && <div className="flex flex-wrap gap-2 shrink-0">{acoes}</div>}
      </div>
      {children}
    </section>
  );
}
