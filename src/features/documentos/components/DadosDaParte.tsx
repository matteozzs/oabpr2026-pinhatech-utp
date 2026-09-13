'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, MessageSquareQuote, Save, UserRound } from 'lucide-react';
import { CAMPO_IDENTIFICACAO_LABEL, type Assistido, type Caso, type DadoNaConversa } from '@/types';
import { atualizarCaso } from '@/lib/store';
import { Campo } from '@/components/ui';
import { cn, mascaraCPF } from '@/lib/utils';
import { CAMPOS_QUALIFICACAO, camposFaltantes, percentualQualificacao } from '../qualificacao';

/**
 * Qualificação da parte — o que entra nos documentos gerados.
 *
 * Existe porque a plataforma não inventa dado: o que não estiver aqui vira
 * [A COMPLETAR EM ENTREVISTA] na peça. O advogado preenche à medida que recebe
 * os documentos pessoais ou apura na conversa.
 *
 * Fica sempre aberta, e de propósito: é a seção que bloqueia a geração de
 * documentos, e uma seção fechada esconde justamente o que está faltando.
 */
export function DadosDaParte({ caso }: { caso: Caso }) {
  const [rascunho, setRascunho] = useState<Assistido>(caso.assistido);
  const [salvo, setSalvo] = useState(false);

  const faltam = camposFaltantes(caso.assistido);
  const pct = percentualQualificacao(caso.assistido);
  const completo = faltam.length === 0;

  /** O que a parte escreveu na conversa e ainda não está igual na ficha. */
  const ditosNaConversa = useMemo(() => {
    const ditos = caso.ia.resumo?.dadosDeIdentificacao ?? [];
    return ditos.filter((d) => String(rascunho[d.campo] ?? '').trim() !== d.valor.trim());
  }, [caso.ia.resumo, rascunho]);

  function set<K extends keyof Assistido>(k: K, v: Assistido[K]) {
    setRascunho((r) => ({ ...r, [k]: v }));
    setSalvo(false);
  }

  function usar(d: DadoNaConversa) {
    set(d.campo, (d.campo === 'cpf' ? mascaraCPF(d.valor) : d.valor) as Assistido[typeof d.campo]);
  }

  function salvar() {
    atualizarCaso(caso.id, { assistido: rascunho }, { tipo: 'dados', descricao: 'Qualificação da parte atualizada pelo advogado.', autor: 'advogado' });
    setSalvo(true);
  }

  return (
    <div id="dados-da-parte" className="rounded-2xl border border-ink-200 bg-white overflow-hidden scroll-mt-24">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="inline-flex items-center gap-2 min-w-0">
          <UserRound className="w-4 h-4 text-navy-700 shrink-0" />
          <span className="font-semibold text-ink-900 truncate">Dados da parte</span>
          <span className={cn('badge shrink-0', completo ? 'bg-ok-100 text-ok-600' : 'bg-warn-100 text-warn-600')}>
            {completo ? 'completo' : `${pct}% · faltam ${faltam.length}`}
          </span>
        </span>
      </div>

      {!completo && (
        <p className="px-4 pb-3 text-xs text-ink-700">
          Sem estes dados os documentos saem com marcador de lacuna: <span className="lacuna">{faltam.join(' · ')}</span>
        </p>
      )}

      <div className="px-4 pb-4 border-t border-ink-200 pt-4 space-y-4">
        {ditosNaConversa.length > 0 && (
          <div className="rounded-xl border border-navy-100 bg-navy-50 p-3">
            <p className="label mb-1 inline-flex items-center gap-1.5 text-navy-900">
              <MessageSquareQuote className="w-3.5 h-3.5" /> A parte escreveu isto na conversa
            </p>
            <p className="text-xs text-ink-700 mb-2">
              Confira antes de usar: o valor vai exatamente como ela digitou. Depois de aplicar, salve.
            </p>
            <ul className="space-y-1.5">
              {ditosNaConversa.map((d) => {
                const atual = String(rascunho[d.campo] ?? '').trim();
                return (
                  <li key={d.campo} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-ink-500 text-xs w-28 shrink-0">{CAMPO_IDENTIFICACAO_LABEL[d.campo]}</span>
                    <span className="font-mono text-ink-900">{d.valor}</span>
                    {atual && <span className="text-xs text-warn-600">substitui “{atual}”</span>}
                    <button className="btn-secondary text-xs py-1 px-2 ml-auto" onClick={() => usar(d)}>
                      {atual ? 'Substituir' : 'Usar'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {CAMPOS_QUALIFICACAO.map(({ campo, rotulo }) => (
            <Campo key={campo} rotulo={rotulo} htmlFor={`q-${campo}`} obrigatorio>
              <input
                id={`q-${campo}`}
                className="input"
                value={String(rascunho[campo] ?? '')}
                onChange={(e) => set(campo, (campo === 'cpf' ? mascaraCPF(e.target.value) : e.target.value) as Assistido[typeof campo])}
              />
            </Campo>
          ))}
          <Campo rotulo="Bairro" htmlFor="q-bairro">
            <input id="q-bairro" className="input" value={rascunho.bairro ?? ''} onChange={(e) => set('bairro', e.target.value)} />
          </Campo>
          <Campo rotulo="CEP" htmlFor="q-cep">
            <input id="q-cep" className="input" value={rascunho.cep ?? ''} onChange={(e) => set('cep', e.target.value)} />
          </Campo>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary text-sm" onClick={salvar}>
            <Save className="w-4 h-4" /> Salvar dados
          </button>
          {salvo && (
            <span className="text-sm text-ok-600 inline-flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Salvo
            </span>
          )}
        </div>
        <p className="text-[11px] text-ink-500">
          Preencha com o que consta nos documentos recebidos ou no que foi apurado com a parte. A plataforma nunca completa esses campos sozinha.
        </p>
      </div>
    </div>
  );
}
