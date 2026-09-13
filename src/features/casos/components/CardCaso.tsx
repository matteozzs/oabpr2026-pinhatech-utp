import Link from 'next/link';
import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import type { Caso, Perfil } from '@/types';
import { AREA_LABEL } from '@/types';
import { StatusBadge } from '@/components/ui';
import { cn, formatarData } from '@/lib/utils';

function primeirasPalavras(t: string, n = 16) {
  const limpo = t.trim();
  if (!limpo) return '';
  const p = limpo.split(/\s+/).slice(0, n).join(' ');
  return p.length < limpo.length ? p + '…' : p;
}

/**
 * Item da lista de atendimentos.
 *
 * O título é o protocolo, não o assunto: é por ele que o caso é chamado no Fórum,
 * na OAB e no telefone, e é o que não muda quando a leitura do caso muda. O relato
 * da parte vem logo abaixo, como descrição — as palavras dela, e não uma etiqueta
 * escolhida pela plataforma.
 *
 * A visão do cidadão omite de propósito o que é triagem interna do advogado:
 * marcação de urgência, selo de "analisado" e etapa do trabalho. Nada disso diz
 * respeito a quem está esperando o processo andar.
 */
export function CardCaso({
  caso,
  href,
  naoLidas = 0,
  perfil = 'advogado',
}: {
  caso: Caso;
  href: string;
  naoLidas?: number;
  perfil?: Perfil;
}) {
  const cidadao = perfil === 'cidadao';
  const assunto = primeirasPalavras(caso.relato.texto);

  return (
    <Link
      href={href}
      className={cn(
        'card p-4 sm:p-5 flex items-center justify-between gap-3 hover:border-navy-500 transition',
        !cidadao && caso.relato.urgencia && 'border-l-4 border-l-danger-600',
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
          <span>{AREA_LABEL[caso.area]}</span>

          {/* Triagem interna: só o advogado vê */}
          {!cidadao && caso.relato.urgencia && (
            <span className="badge bg-danger-100 text-danger-600 inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> urgente
            </span>
          )}
          {!cidadao && caso.ia.resumo && (
            <span className="badge bg-navy-100 text-navy-900 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> analisado
            </span>
          )}
          {naoLidas > 0 && <span className="badge bg-navy-700 text-white">{naoLidas} nova(s)</span>}
        </div>

        <p className="font-mono font-bold text-navy-950 mt-0.5">{caso.protocolo}</p>

        <p className="text-sm text-ink-700">
          {cidadao
            ? `${caso.advogado ? `Advogado(a): ${caso.advogado.nome} · ` : ''}${caso.comarca} · desde ${formatarData(caso.criadoEm)}`
            : `${caso.assistido.nome} · ${caso.comarca} · ${caso.temProcessoAtivo ? 'processo em andamento' : 'sem processo'} · ${formatarData(caso.criadoEm)}`}
        </p>

        <p className={cn('text-xs text-ink-500 mt-0.5 truncate', !assunto && 'italic')}>
          {assunto || 'Nomeação recebida. Nenhum contato com a parte ainda.'}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={caso.status} perfil={perfil} />
        <ArrowRight className="w-4 h-4 text-ink-500" />
      </div>
    </Link>
  );
}
