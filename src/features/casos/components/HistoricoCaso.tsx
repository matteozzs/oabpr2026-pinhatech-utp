import type { Caso } from '@/types';
import { Secao } from '@/components/ui';
import { formatarDataHora } from '@/lib/utils';

/** Trilha de auditoria do caso: quem fez o quê e quando, incluindo as ações da IA. */
export function HistoricoCaso({ caso }: { caso: Caso }) {
  return (
    <Secao id="historico" titulo="Histórico">
      <ol className="text-sm space-y-1.5">
        {[...caso.historico].reverse().map((h, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-ink-500 font-mono text-xs shrink-0 w-32">{formatarDataHora(h.em)}</span>
            <span className="text-ink-700">
              {h.descricao} <span className="text-ink-500">· {h.autor}</span>
            </span>
          </li>
        ))}
      </ol>
    </Secao>
  );
}
