'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { entrarComo, useCasos, usePerfil, useResumoConversas } from '@/lib/store';
import { StatusBadge } from '@/components/ui';
import { formatarDataHora } from '@/lib/utils';

export default function ConversasPage() {
  const perfil = usePerfil();
  const { casos, pronto } = useCasos();
  const resumo = useResumoConversas();

  useEffect(() => {
    if (perfil !== 'advogado') entrarComo('advogado');
  }, [perfil]);

  const ordenados = [...casos].sort((a, b) => (resumo[b.id]?.ultima?.enviadoEm ?? b.atualizadoEm).localeCompare(resumo[a.id]?.ultima?.enviadoEm ?? a.atualizadoEm));

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950 inline-flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-navy-700" /> Conversas
        </h1>
        <p className="text-ink-700 mt-1">Uma conversa dedicada por assistido, pelo número oficial da plataforma.</p>
      </div>
      {!pronto ? null : (
        <ul className="card divide-y divide-ink-200 overflow-hidden">
          {ordenados.map((c) => {
            const r = resumo[c.id];
            return (
              <li key={c.id}>
                <Link href={`/advogado/chat/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-navy-50 transition">
                  <div className="w-10 h-10 rounded-full bg-navy-100 text-navy-900 font-bold flex items-center justify-center shrink-0">
                    {c.assistido.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-ink-900 truncate">{c.assistido.nome}</p>
                      <span className="text-[11px] text-ink-500 shrink-0">{r?.ultima ? formatarDataHora(r.ultima.enviadoEm) : ''}</span>
                    </div>
                    <p className="text-sm text-ink-700 truncate">{r?.ultima ? `${r.ultima.autor === 'assistido' ? '' : 'Você: '}${r.ultima.texto}` : 'Sem mensagens — inicie a conversa.'}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] font-mono text-ink-500">{c.protocolo}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                  {r?.naoLidas ? <span className="badge bg-navy-700 text-white shrink-0">{r.naoLidas}</span> : <ArrowRight className="w-4 h-4 text-ink-500 shrink-0" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
