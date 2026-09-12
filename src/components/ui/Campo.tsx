import type { ReactNode } from 'react';

/** Rótulo + controle + dica, com marcação de obrigatoriedade acessível. */
export function Campo({
  rotulo,
  children,
  dica,
  obrigatorio,
  htmlFor,
}: {
  rotulo: string;
  children: ReactNode;
  dica?: string;
  obrigatorio?: boolean;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {rotulo}
        {obrigatorio && (
          <span className="text-danger-600 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {dica && <p className="text-xs text-ink-500 mt-1">{dica}</p>}
    </div>
  );
}
