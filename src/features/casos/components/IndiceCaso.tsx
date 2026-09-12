'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Clock, FileText, Gavel, MessageCircle, PackageCheck, Sparkles } from 'lucide-react';
import type { Caso } from '@/types';
import { cn } from '@/lib/utils';
import { lacunasDaMinuta } from '@/features/documentos';

export type SecaoCaso = 'resumo' | 'contato' | 'documentos' | 'minuta' | 'pacote' | 'historico';

export const SECOES: { id: SecaoCaso; rotulo: string; icone: typeof Sparkles }[] = [
  { id: 'resumo', rotulo: 'Resumo fático', icone: Sparkles },
  { id: 'contato', rotulo: 'Contato', icone: MessageCircle },
  { id: 'documentos', rotulo: 'Documentos', icone: FileText },
  { id: 'minuta', rotulo: 'Minuta da petição', icone: Gavel },
  { id: 'pacote', rotulo: 'Pacote de protocolo', icone: PackageCheck },
  { id: 'historico', rotulo: 'Histórico', icone: Clock },
];

/** Estado de cada etapa, para o índice mostrar onde o atendimento está. */
function estado(caso: Caso, secao: SecaoCaso): 'concluido' | 'em_andamento' | 'pendente' {
  switch (secao) {
    case 'resumo':
      return caso.ia.resumo ? 'concluido' : 'pendente';
    case 'contato':
      return caso.assistido.email || caso.assistido.telefone ? 'concluido' : 'pendente';
    case 'documentos': {
      const pendentes = caso.documentos.filter((d) => !d.geradoPelaPlataforma && ['pendente', 'solicitado'].includes(d.status));
      if (!caso.ia.checklist) return 'pendente';
      return pendentes.length === 0 ? 'concluido' : 'em_andamento';
    }
    case 'minuta':
      if (!caso.ia.minuta) return 'pendente';
      return caso.ia.minuta.revisadaEm ? 'concluido' : 'em_andamento';
    case 'pacote':
      return caso.status === 'protocolado' ? 'concluido' : caso.status === 'pronto_protocolo' ? 'em_andamento' : 'pendente';
    default:
      return 'concluido';
  }
}

export function IndiceCaso({ caso, ativa }: { caso: Caso; ativa: SecaoCaso }) {
  const lacunas = lacunasDaMinuta(caso).length;

  return (
    <nav aria-label="Etapas do atendimento" className="lg:sticky lg:top-20">
      <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {SECOES.map(({ id, rotulo, icone: Icone }) => {
          const st = estado(caso, id);
          const atual = id === ativa;
          return (
            <li key={id} className="shrink-0 lg:shrink">
              <Link
                href={`?secao=${id}`}
                scroll={false}
                aria-current={atual ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors whitespace-nowrap',
                  atual ? 'bg-navy-700 text-white font-semibold' : 'text-ink-700 hover:bg-navy-50',
                )}
              >
                <Icone className={cn('w-4 h-4 shrink-0', atual ? 'text-white' : 'text-navy-700')} />
                <span className="flex-1">{rotulo}</span>
                {id === 'minuta' && lacunas > 0 && (
                  <span className={cn('badge text-[10px]', atual ? 'bg-white/20 text-white' : 'bg-warn-100 text-warn-600')}>{lacunas}</span>
                )}
                {st === 'concluido' ? (
                  <CheckCircle2 className={cn('w-3.5 h-3.5 shrink-0', atual ? 'text-white' : 'text-ok-600')} />
                ) : st === 'em_andamento' ? (
                  <Circle className={cn('w-3.5 h-3.5 shrink-0 fill-current', atual ? 'text-white' : 'text-warn-600')} />
                ) : (
                  <Circle className={cn('w-3.5 h-3.5 shrink-0', atual ? 'text-white/50' : 'text-ink-300')} />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

    </nav>
  );
}
