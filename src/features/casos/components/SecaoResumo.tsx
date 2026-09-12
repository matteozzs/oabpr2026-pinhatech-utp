'use client';

import Link from 'next/link';
import { MessageCircle, Sparkles } from 'lucide-react';
import type { Caso } from '@/types';
import { Aviso, RotuloIA, Secao } from '@/components/ui';
import { FontesCitadas, PainelAuditoria, type UseIA } from '@/features/ia';
import { cn } from '@/lib/utils';

/**
 * Resumo fático — construído a partir da conversa com a parte.
 *
 * A geração acontece **dentro da conversa**, quando o advogado julga já ter apurado o
 * suficiente. Aqui a seção só exibe o resultado; sem resumo, aponta o caminho.
 */
export function SecaoResumo({ caso, ia }: { caso: Caso; ia: UseIA }) {
  const resumo = caso.ia.resumo;

  if (!resumo) {
    return (
      <Secao titulo="Resumo fático" descricao="Gerado a partir do que você apurou na conversa com a parte.">
        <div className="rounded-2xl border border-dashed border-ink-300 p-6 text-center">
          <Sparkles className="w-8 h-8 text-navy-700 mx-auto" />
          <p className="mt-3 text-ink-900 font-semibold">Ainda não há resumo para este caso.</p>
          <p className="mt-1 text-sm text-ink-700 max-w-md mx-auto">
            Converse com a parte pelo chat — por mensagem ou áudio transcrito. Quando tiver apurado o suficiente, use{' '}
            <strong>Gerar resumo fático</strong> lá mesmo: a IA consolida o relato inicial e toda a conversa, e o resultado aparece aqui.
          </p>
          <Link href={`/advogado/chat/${caso.id}`} className="btn-primary mt-4">
            <MessageCircle className="w-4 h-4" /> Ir para a conversa
          </Link>
        </div>
      </Secao>
    );
  }

  return (
    <Secao
      titulo="Resumo fático"
      descricao="Consolidado do relato inicial com a conversa havida com a parte."
      acoes={
        <Link href={`/advogado/chat/${caso.id}`} className="btn-secondary text-xs">
          <MessageCircle className="w-3.5 h-3.5" /> Atualizar na conversa
        </Link>
      }
    >
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
            <p className="label">Dados que a IA não encontrou (não foram inventados)</p>
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
    </Secao>
  );
}
