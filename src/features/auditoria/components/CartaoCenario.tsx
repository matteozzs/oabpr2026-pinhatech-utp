'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, MessageSquare, Play, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIMENSAO_COR, DIMENSAO_LABEL, type CenarioTeste } from '../cenarios';
import { criarDoCenario } from '../criar';

/** Um cenário pronto: o que ele testa, o que se espera, e o botão que o materializa. */
export function CartaoCenario({ cenario }: { cenario: CenarioTeste }) {
  const router = useRouter();
  const [criado, setCriado] = useState<{ id: string; protocolo: string } | null>(null);

  function criar() {
    const caso = criarDoCenario(cenario);
    setCriado({ id: caso.id, protocolo: caso.protocolo });
  }

  return (
    <li className="card p-5 flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-bold text-ink-900">{cenario.nome}</h3>
        <span className={cn('badge shrink-0', DIMENSAO_COR[cenario.dimensao])}>{DIMENSAO_LABEL[cenario.dimensao]}</span>
      </div>

      <dl className="mt-3 space-y-2 text-sm flex-1">
        <div>
          <dt className="label">O que testa</dt>
          <dd className="text-ink-700">{cenario.testa}</dd>
        </div>
        <div>
          <dt className="label inline-flex items-center gap-1">
            <Check className="w-3 h-3 text-ok-600" /> Comportamento correto
          </dt>
          <dd className="text-ink-700">{cenario.esperado}</dd>
        </div>
        <div>
          <dt className="label inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-danger-600" /> Falha se
          </dt>
          <dd className="text-ink-700">{cenario.falhaSe}</dd>
        </div>
      </dl>

      <p className="mt-3 text-[11px] text-ink-500 inline-flex items-center gap-1.5">
        <MessageSquare className="w-3.5 h-3.5" />
        {cenario.comarca} · {cenario.area === 'familia' ? 'Família' : 'Consumidor'} · relato{' '}
        {cenario.relato.origem === 'voz' ? 'por voz' : 'por texto'} + {cenario.conversa.length} mensagem(ns)
      </p>

      {criado ? (
        <div className="mt-3 rounded-xl bg-ok-100 border border-green-200 p-3">
          <p className="text-sm text-ok-600 font-semibold">Cenário criado — {criado.protocolo}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn-primary text-xs py-1.5" onClick={() => router.push(`/advogado/chat/${criado.id}`)}>
              Abrir a conversa <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button className="btn-secondary text-xs py-1.5" onClick={() => router.push(`/advogado/caso/${criado.id}`)}>
              Abrir o caso
            </button>
            <button className="btn-ghost text-xs py-1.5" onClick={criar}>
              Criar outro
            </button>
          </div>
          <p className="mt-2 text-[11px] text-ink-700">
            Gere o resumo fático <strong>pela conversa</strong> — é lá que a IA lê o relato e as falas da parte.
          </p>
        </div>
      ) : (
        <button className="btn-primary mt-4 text-sm" onClick={criar}>
          <Play className="w-4 h-4" /> Criar cenário
        </button>
      )}
    </li>
  );
}
