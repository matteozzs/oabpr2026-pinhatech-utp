import { Loader2 } from 'lucide-react';

export function Carregando({ texto = 'Processando…' }: { texto?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-700" role="status" aria-live="polite">
      <Loader2 className="w-4 h-4 animate-spin text-navy-700" />
      <span>{texto}</span>
    </div>
  );
}
