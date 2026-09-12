import type { FonteCitada } from '@/types';
import { cn } from '@/lib/utils';

const PADRAO_ID = /^[A-Z0-9]+(?:-[A-Z0-9]+)+$/;
const PADRAO_LACUNA = /COMPLETAR|DEFINIR|CONFIRMAR|DETALHAR|NÃO LOCALIZADA|A DISTRIBUIR|DILIGENCIAR/i;

/**
 * Renderiza texto da IA destacando os dois marcadores que importam para a auditoria:
 * `[CPC-98]` vira chip de citação (com o dispositivo no title) e
 * `[A COMPLETAR EM ENTREVISTA]` vira marca de lacuna.
 */
export function TextoComLacunas({ texto, className, fontes }: { texto: string; className?: string; fontes?: FonteCitada[] }) {
  const mapa = new Map((fontes ?? []).map((f) => [f.id, f]));
  const partes = texto.split(/(\[[^\]]+\])/g);

  return (
    <div className={cn('prose-minuta', className)}>
      {partes.map((p, i) => {
        if (!p.startsWith('[')) return <span key={i}>{p}</span>;
        const conteudo = p.slice(1, -1);

        if (PADRAO_ID.test(conteudo)) {
          const f = mapa.get(conteudo);
          return (
            <span
              key={i}
              className="font-sans font-mono text-[11px] bg-navy-100 text-navy-900 rounded px-1 py-0.5 mx-0.5 align-middle"
              title={f ? `${f.diploma}, ${f.dispositivo}` : 'Citação não validada pelo corpus'}
            >
              {conteudo}
            </span>
          );
        }

        if (PADRAO_LACUNA.test(conteudo)) {
          return (
            <span key={i} className="lacuna font-sans text-[13px]">
              {p}
            </span>
          );
        }

        return <span key={i}>{p}</span>;
      })}
    </div>
  );
}
