import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const CORES = {
  info: 'bg-navy-50 border-navy-100 text-navy-900',
  alerta: 'bg-warn-100 border-amber-200 text-warn-600',
  erro: 'bg-danger-100 border-red-200 text-danger-600',
  ok: 'bg-ok-100 border-green-200 text-ok-600',
} as const;

export function Aviso({ tipo = 'info', children }: { tipo?: keyof typeof CORES; children: ReactNode }) {
  return (
    <div role={tipo === 'erro' ? 'alert' : 'status'} className={cn('rounded-xl border px-4 py-3 text-sm', CORES[tipo])}>
      {children}
    </div>
  );
}
