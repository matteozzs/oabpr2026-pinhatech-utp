'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { FonteCitada } from '@/types';

/** Lista expansível das fontes que a IA citou — cada uma com o texto legal e o link oficial. */
export function FontesCitadas({ fontes, titulo = 'Fontes citadas' }: { fontes: FonteCitada[]; titulo?: string }) {
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});

  if (!fontes?.length) {
    return <p className="text-xs text-ink-500 italic">Nenhuma fonte citada — a IA não fundamentou juridicamente esta saída.</p>;
  }

  return (
    <div>
      <p className="label flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" /> {titulo} ({fontes.length})
      </p>
      <ul className="space-y-1.5">
        {fontes.map((f) => {
          const aberta = !!abertas[f.id];
          return (
            <li key={f.id} className="rounded-lg border border-ink-200 bg-ink-50">
              <button
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
                onClick={() => setAbertas((s) => ({ ...s, [f.id]: !aberta }))}
                aria-expanded={aberta}
              >
                <span className="text-sm">
                  <span className="font-mono text-[11px] bg-navy-100 text-navy-900 rounded px-1.5 py-0.5 mr-2">{f.id}</span>
                  <span className="font-medium text-ink-900">{f.diploma}</span>
                  <span className="text-ink-700"> — {f.dispositivo}</span>
                </span>
                {aberta ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
              </button>
              {aberta && (
                <div className="px-3 pb-3 text-sm text-ink-700">
                  <p className="font-serif leading-relaxed">“{f.texto}”</p>
                  {f.fonte && (
                    <a
                      href={f.fonte}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-navy-700 underline text-xs mt-2"
                    >
                      Conferir na fonte oficial <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
