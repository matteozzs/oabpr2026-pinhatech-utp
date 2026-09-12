'use client';

import { ListChecks } from 'lucide-react';
import type { Caso, ItemChecklist } from '@/types';
import { atualizarCaso } from '@/lib/store';
import { OBRIGATORIEDADE_LABEL } from '@/data/documentos';
import { Aviso, Carregando, RotuloIA, Secao } from '@/components/ui';
import { FontesCitadas, PainelAuditoria, TextoComLacunas, iaApi, type UseIA } from '@/features/ia';
import { cn } from '@/lib/utils';

const COR_SITUACAO: Record<ItemChecklist['situacao'], string> = {
  presente: 'bg-ok-100 text-ok-600',
  ausente: 'bg-danger-100 text-danger-600',
  a_confirmar: 'bg-warn-100 text-warn-600',
  gerar_na_plataforma: 'bg-navy-100 text-navy-900',
};

const ROTULO_SITUACAO: Record<ItemChecklist['situacao'], string> = {
  presente: 'presente',
  ausente: 'ausente',
  a_confirmar: 'a confirmar',
  gerar_na_plataforma: 'gerar aqui',
};

/** Passo 2: a IA cruza o relato com o catálogo e diz exatamente o que pedir ao assistido. */
export function SecaoChecklist({ caso, ia }: { caso: Caso; ia: UseIA }) {
  const checklist = caso.ia.checklist;
  const rodando = ia.ocupado === 'checklist';

  async function gerar() {
    const r = await ia.executar('checklist', () => iaApi.pedirChecklist(caso, caso.ia.resumo));
    if (!r) return;
    atualizarCaso(
      caso.id,
      (c) => ({
        ia: { ...c.ia, checklist: r },
        documentos: c.documentos.map((d) => {
          const item = r.itens.find((i) => i.documentoId === d.id);
          return item ? { ...d, observacaoIA: item.porQue } : d;
        }),
      }),
      { tipo: 'ia', descricao: `Checklist documental gerado pela IA (${r.modelo}).`, autor: 'ia' },
    );
  }

  return (
    <Secao
      id="checklist"
      titulo="Checklist de documentos"
      descricao="A IA cruza o relato com o catálogo e aponta o que falta, o que confirmar e o que a plataforma gera."
      acoes={
        <button className="btn-primary" onClick={gerar} disabled={ia.ocupado !== null}>
          <ListChecks className="w-4 h-4" /> {checklist ? 'Recalcular' : 'Gerar checklist com IA'}
        </button>
      }
    >
      {rodando && <Carregando texto="Cruzando relato com o catálogo de documentos…" />}

      {checklist && !rodando && (
        <div className="space-y-4">
          <ul className="divide-y divide-ink-200 rounded-xl border border-ink-200 overflow-hidden">
            {checklist.itens.map((i) => {
              const d = caso.documentos.find((x) => x.id === i.documentoId);
              return (
                <li key={i.documentoId} className="p-3 flex gap-3 bg-white">
                  <span className={cn('badge shrink-0 h-fit', COR_SITUACAO[i.situacao])}>{ROTULO_SITUACAO[i.situacao]}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-ink-900">
                      {i.nome}
                      {d && (
                        <span className="ml-2 text-[11px] font-normal text-ink-500">
                          {OBRIGATORIEDADE_LABEL[d.obrigatoriedade]} · status: {d.status}
                        </span>
                      )}
                    </p>
                    <div className="text-sm text-ink-700">
                      <TextoComLacunas texto={i.porQue} className="font-sans text-sm leading-normal" fontes={checklist.fontesUtilizadas} />
                    </div>
                    {i.ondeObter && <p className="text-xs text-navy-900 mt-0.5">Onde obter: {i.ondeObter}</p>}
                  </div>
                </li>
              );
            })}
          </ul>

          {checklist.documentosEspecificosDoCaso.length > 0 && (
            <div>
              <p className="label">Documentos específicos deste caso</p>
              <ul className="list-disc ml-5 text-sm text-ink-700 space-y-0.5">
                {checklist.documentosEspecificosDoCaso.map((d, k) => (
                  <li key={k}>
                    <strong>{d.nome}</strong> — {d.porQue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {checklist.orientacaoCras && (
            <Aviso tipo="info">
              A IA sugere orientar o assistido ao CRAS para regularizar documentos civis / CadÚnico. Use “Orientar ao CRAS” na conversa.
            </Aviso>
          )}

          <FontesCitadas fontes={checklist.fontesUtilizadas} />
          <RotuloIA modelo={checklist.modelo} quando={checklist.geradoEm} />
          <PainelAuditoria meta={ia.metas.checklist} />
        </div>
      )}

      {!checklist && !rodando && <p className="text-sm text-ink-500">Gere o checklist para saber exatamente o que pedir ao assistido.</p>}
    </Secao>
  );
}
