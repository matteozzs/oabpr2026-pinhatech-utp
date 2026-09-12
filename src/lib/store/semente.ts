'use client';

import { CASOS_SEMENTE, MENSAGENS_SEMENTE } from '@/data/casos-semente';
import { K, gravar, ler, emitir } from './nucleo';

/** Popula o navegador com os casos de demonstração na primeira visita. */
export function garantirSemente() {
  if (typeof window === 'undefined') return;
  if (ler<boolean>(K.semeado, false)) return;
  gravar(K.casos, CASOS_SEMENTE);
  gravar(K.mensagens, MENSAGENS_SEMENTE);
  gravar(K.semeado, true);
}

/** Apaga o que o avaliador fez e recarrega a demonstração do zero. */
export function restaurarDemonstracao() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(K.casos);
  window.localStorage.removeItem(K.mensagens);
  window.localStorage.removeItem(K.semeado);
  garantirSemente();
  emitir();
}
