'use client';

import type { Advogado } from '@/types';

/**
 * Núcleo do store da demonstração: chaves, leitura/escrita no localStorage e o
 * mecanismo de assinatura que alimenta os hooks (`useSyncExternalStore`).
 *
 * Decisão de arquitetura: o MVP não tem banco de dados. Cada avaliador que abre o link
 * tem seu próprio estado isolado; os casos-semente garantem que a plataforma nunca aparece vazia.
 * Trocar por Supabase/KV = reimplementar `ler`/`gravar` mantendo as assinaturas.
 */

export const K = {
  casos: 'ordem-dativa:casos:v1',
  mensagens: 'ordem-dativa:mensagens:v1',
  perfil: 'ordem-dativa:perfil:v1',
  semeado: 'ordem-dativa:semeado:v1',
} as const;

export const ADVOGADO_DEMO: Advogado = {
  nome: 'Helena Marques Ribeiro',
  oab: 'OAB/PR 00.000 (demonstração)',
  comarcaSede: 'Curitiba',
};

/** Número oficial da plataforma — o advogado nunca expõe o número pessoal. */
export const NUMERO_OFICIAL_PLATAFORMA = '+55 41 0000-0000 (número oficial Ordem Dativa — simulação)';

const listeners = new Set<() => void>();

export function emitir() {
  listeners.forEach((l) => l());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function ler<T>(chave: string, padrao: T): T {
  if (typeof window === 'undefined') return padrao;
  try {
    const raw = window.localStorage.getItem(chave);
    return raw ? (JSON.parse(raw) as T) : padrao;
  } catch {
    return padrao;
  }
}

export function gravar(chave: string, valor: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* quota / modo privado: segue sem persistir */
  }
  emitir();
}
