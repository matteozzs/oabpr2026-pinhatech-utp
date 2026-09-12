'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import type { MetaIA } from '@/types';

/**
 * Painel que abre na própria tela e mostra ao auditor o que a IA recebeu e o que foi bloqueado:
 * dispositivos recuperados pelo RAG com pontuação, citações inválidas descartadas pelo servidor,
 * tentativas de modelo e consumo de tokens.
 */
export function PainelAuditoria({ meta, extra }: { meta?: MetaIA | null; extra?: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  if (!meta) return null;

  return (
    <div className="mt-4 rounded-xl border border-dashed border-ink-300 bg-white">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold text-ink-700"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
      >
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-navy-700" /> Painel de auditoria da IA — modelo {meta.modelo}, {(meta.ms / 1000).toFixed(1)}s
          {meta.citacoesInvalidas.length > 0 && (
            <span className="badge bg-danger-100 text-danger-600 ml-1">
              {meta.citacoesInvalidas.length} citação(ões) inválida(s) bloqueada(s)
            </span>
          )}
        </span>
        {aberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {aberto && (
        <div className="px-3 pb-3 text-xs text-ink-700 space-y-3">
          <div>
            <p className="font-semibold text-ink-900 mb-1">
              Dispositivos recuperados pelo RAG e entregues ao modelo ({meta.fontesRecuperadas.length})
            </p>
            <ul className="space-y-0.5">
              {meta.fontesRecuperadas.map((f) => (
                <li key={f.id}>
                  <span className="font-mono bg-ink-100 rounded px-1">{f.id}</span> · pontuação {f.pontuacao.toFixed(1)} ·{' '}
                  <span className="text-ink-500">{f.motivos.slice(0, 3).join('; ')}</span>
                </li>
              ))}
            </ul>
          </div>

          {meta.citacoesInvalidas.length > 0 && (
            <div>
              <p className="font-semibold text-danger-600 mb-1">
                Citações que a IA tentou usar e NÃO existem no corpus (descartadas pelo servidor)
              </p>
              <p className="font-mono">{meta.citacoesInvalidas.join(', ')}</p>
            </div>
          )}

          {meta.citacoesForaDoContexto.length > 0 && (
            <div>
              <p className="font-semibold text-warn-600 mb-1">Citações válidas no corpus, mas fora do bloco de fontes desta chamada</p>
              <p className="font-mono">{meta.citacoesForaDoContexto.join(', ')}</p>
            </div>
          )}

          <div>
            <p className="font-semibold text-ink-900 mb-1">Tentativas de modelo</p>
            <ul>
              {meta.tentativas.map((t, i) => (
                <li key={i}>
                  {t.modelo}: {t.status}
                  {t.httpStatus ? ` (HTTP ${t.httpStatus})` : ''} · {t.ms}ms
                </li>
              ))}
            </ul>
            {meta.uso && (
              <p className="mt-1 text-ink-500">
                Tokens — entrada {meta.uso.entrada ?? '?'} · saída {meta.uso.saida ?? '?'} · raciocínio {meta.uso.raciocinio ?? 0}
              </p>
            )}
          </div>

          {extra}
        </div>
      )}
    </div>
  );
}
