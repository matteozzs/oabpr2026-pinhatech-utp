import { AlertTriangle } from 'lucide-react';
import type { Caso } from '@/types';
import { AREA_LABEL } from '@/types';
import { StatusBadge } from '@/components/ui';
import { formatarDataHora, formatarMoeda } from '@/lib/utils';

/** Cartão de identificação do caso no painel do advogado. */
export function CabecalhoCaso({ caso }: { caso: Caso }) {
  const resumo = caso.ia.resumo;

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-mono text-ink-500">{caso.protocolo}</p>
          <h1 className="text-2xl font-black text-navy-950">{resumo?.tema ?? AREA_LABEL[caso.area]}</h1>
          <p className="text-sm text-ink-700 mt-1">
            {caso.assistido.nome} · {caso.comarca} · {caso.temProcessoAtivo ? `processo ${caso.numeroProcesso ?? 'em andamento'}` : 'sem processo ativo'} ·{' '}
            {formatarDataHora(caso.criadoEm)}
          </p>
          {caso.nomeacao && (
            <p className="text-xs text-ink-500 mt-1">
              Nomeação pela {caso.nomeacao.origem === 'forum' ? 'Vara/Fórum' : 'OAB/PR'}
              {caso.nomeacao.referencia ? ` — ${caso.nomeacao.referencia}` : ''} · aceite registrado fora da plataforma
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {caso.relato.urgencia && (
            <span className="badge bg-danger-100 text-danger-600 inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> urgente
            </span>
          )}
          <StatusBadge status={caso.status} />
        </div>
      </div>

      <dl className="grid sm:grid-cols-4 gap-3 mt-4 text-sm">
        <div>
          <dt className="label">Área</dt>
          <dd>{AREA_LABEL[caso.area]}</dd>
        </div>
        <div>
          <dt className="label">Renda familiar</dt>
          <dd>
            {caso.assistido.rendaFamiliarMensal
              ? `${formatarMoeda(caso.assistido.rendaFamiliarMensal)} · ${caso.assistido.membrosFamilia ?? '?'} pessoa(s)`
              : 'não informada'}
          </dd>
        </div>
        <div>
          <dt className="label">Sabe ler/escrever</dt>
          <dd>{caso.assistido.sabeLerEscrever === false ? 'Tem dificuldade' : caso.assistido.sabeLerEscrever ? 'Sim' : 'não informado'}</dd>
        </div>
        <div>
          <dt className="label">Parte contrária</dt>
          <dd>{caso.parteContraria?.nome ?? '—'}</dd>
        </div>
      </dl>
    </div>
  );
}
