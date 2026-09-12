import { Building2, ExternalLink, MapPin } from 'lucide-react';
import { AVISO_CRAS, GLOSSARIO_CRAS, encontrarCras, linkBuscaCras, linkBuscaDefensoria, linkBuscaForum } from '@/lib/cras';

/** Rede de apoio do município do assistido. Não exibe endereço nem telefone: só busca pública. */
export function PainelCras({ cidade, compacto = false }: { cidade: string; compacto?: boolean }) {
  const cras = encontrarCras(cidade);

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Building2 className="w-5 h-5 text-navy-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-ink-900">Rede de apoio em {cidade}</p>
          {cras ? (
            <>
              <p className="text-sm text-ink-700 mt-0.5">{cras.rede}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {cras.servicos.map((s) => (
                  <li key={s} className="badge bg-navy-100 text-navy-900" title={GLOSSARIO_CRAS[s] ?? s}>
                    {s}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-500 mt-2">
                {cras.temDefensoria
                  ? 'Município com Defensoria Pública: o assistido também pode ser orientado a procurá-la.'
                  : 'Sem Defensoria Pública no município: na ausência de atendimento, o caminho é o Fórum da comarca — e é aqui que a advocacia dativa entra.'}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-700 mt-0.5">
              Município fora da base detalhada da demonstração. Oriente o assistido a procurar o CRAS mais próximo para CadÚnico e
              documentos, ou o Fórum da comarca.
            </p>
          )}
        </div>
      </div>

      {!compacto && (
        <div className="grid sm:grid-cols-3 gap-2">
          <a className="btn-secondary text-xs" href={linkBuscaCras(cidade)} target="_blank" rel="noreferrer">
            <MapPin className="w-3.5 h-3.5" /> Localizar CRAS <ExternalLink className="w-3 h-3" />
          </a>
          <a className="btn-secondary text-xs" href={linkBuscaDefensoria(cidade)} target="_blank" rel="noreferrer">
            <MapPin className="w-3.5 h-3.5" /> Defensoria <ExternalLink className="w-3 h-3" />
          </a>
          <a className="btn-secondary text-xs" href={linkBuscaForum(cidade)} target="_blank" rel="noreferrer">
            <MapPin className="w-3.5 h-3.5" /> Fórum <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {!compacto && <p className="text-[11px] text-ink-500">{AVISO_CRAS}</p>}
    </div>
  );
}
