'use client';

import { Sparkles } from 'lucide-react';
import type { Caso } from '@/types';
import { atualizarCaso } from '@/lib/store';
import { Aviso, Carregando, RotuloIA, Secao } from '@/components/ui';
import { FontesCitadas, PainelAuditoria, iaApi, type UseIA } from '@/features/ia';
import { cn } from '@/lib/utils';

/** Passo 1 do atendimento: a IA reorganiza o relato para o advogado se apropriar do caso. */
export function SecaoResumo({ caso, ia }: { caso: Caso; ia: UseIA }) {
  const resumo = caso.ia.resumo;
  const rodando = ia.ocupado === 'resumo';

  async function gerar() {
    const r = await ia.executar('resumo', () => iaApi.pedirResumo(caso));
    if (!r) return;
    atualizarCaso(caso.id, (c) => ({ ia: { ...c.ia, resumo: r } }), {
      tipo: 'ia',
      descricao: `Resumo fático gerado pela IA (${r.modelo}).`,
      autor: 'ia',
    });
  }

  return (
    <Secao
      id="resumo"
      titulo="Resumo fático"
      descricao="A IA reorganiza o relato do assistido para você se apropriar do caso em um minuto."
      acoes={
        <button className="btn-primary" onClick={gerar} disabled={ia.ocupado !== null}>
          <Sparkles className="w-4 h-4" /> {resumo ? 'Reanalisar' : 'Analisar com IA'}
        </button>
      }
    >
      <details className="mb-4">
        <summary className="cursor-pointer text-sm font-semibold text-navy-900">
          Relato original do assistido ({caso.relato.origem === 'voz' ? 'voz transcrita' : 'texto'})
        </summary>
        <p className="mt-2 text-sm text-ink-700 whitespace-pre-wrap rounded-xl bg-ink-50 border border-ink-200 p-3">{caso.relato.texto}</p>
      </details>

      {rodando && <Carregando texto="Recuperando fontes no corpus e analisando o relato…" />}

      {resumo && !rodando && (
        <div className="space-y-4">
          {resumo.foraDoEscopo && (
            <Aviso tipo="alerta">
              <strong>Fora do escopo da plataforma.</strong> {resumo.motivoForaDoEscopo}
            </Aviso>
          )}

          <p className="text-ink-900 leading-relaxed">{resumo.resumoExecutivo}</p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="label">Fatos em ordem</p>
              <ol className="list-decimal ml-5 space-y-1 text-ink-700">
                {resumo.fatosCronologicos.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ol>
            </div>
            <div className="space-y-3">
              <div>
                <p className="label">Pretensão</p>
                <p className="text-ink-700">{resumo.pretensao}</p>
              </div>
              <div>
                <p className="label">Partes</p>
                <p className="text-ink-700">
                  {resumo.partes.autor} <span className="text-ink-500">×</span> {resumo.partes.reu}{' '}
                  <span className="text-ink-500">({resumo.partes.vinculo})</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={cn('badge', resumo.urgencia.existe ? 'bg-danger-100 text-danger-600' : 'bg-ink-100 text-ink-700')} title={resumo.urgencia.motivo}>
                  urgência: {resumo.urgencia.existe ? 'sim' : 'não'}
                </span>
                <span
                  className={cn('badge', resumo.hipossuficiencia.indicios ? 'bg-ok-100 text-ok-600' : 'bg-ink-100 text-ink-700')}
                  title={resumo.hipossuficiencia.justificativa}
                >
                  hipossuficiência: {resumo.hipossuficiencia.indicios ? 'indícios' : 'sem elementos'}
                </span>
              </div>
            </div>
          </div>

          {resumo.dadosFaltantes.length > 0 && (
            <div>
              <p className="label">Dados que a IA não encontrou no relato (não foram inventados)</p>
              <ul className="flex flex-wrap gap-1.5">
                {resumo.dadosFaltantes.map((d, i) => (
                  <li key={i} className="lacuna text-xs">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resumo.alertas.length > 0 && (
            <Aviso tipo="alerta">
              <ul className="list-disc ml-4 space-y-0.5">
                {resumo.alertas.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </Aviso>
          )}

          <FontesCitadas fontes={resumo.fontesUtilizadas} />
          <RotuloIA modelo={resumo.modelo} quando={resumo.geradoEm} />
          <PainelAuditoria meta={ia.metas.resumo} />
        </div>
      )}

      {!resumo && !rodando && (
        <p className="text-sm text-ink-500">Clique em “Analisar com IA” para gerar o resumo fático, a triagem de urgência e os dados faltantes.</p>
      )}
    </Secao>
  );
}
