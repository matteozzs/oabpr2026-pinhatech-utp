'use client';

import { useMemo, useSyncExternalStore } from 'react';
import type { Caso, Mensagem, Perfil } from '@/types';
import { K, subscribe } from './nucleo';
import { garantirSemente } from './semente';
import { perfilAtual } from './perfil';

/**
 * Hooks sobre o localStorage via `useSyncExternalStore`.
 *
 * Os snapshots são cacheados pelo texto bruto lido do localStorage para manter a identidade
 * referencial entre leituras sem mudança — exigência do hook, que senão entra em laço de render.
 */

const VAZIO_CASOS: Caso[] = [];
const VAZIO_MSGS: Mensagem[] = [];

let rawCasos: string | null | undefined;
let snapCasos: Caso[] = VAZIO_CASOS;

function snapshotCasos(): Caso[] {
  garantirSemente();
  const raw = window.localStorage.getItem(K.casos);
  if (raw !== rawCasos) {
    rawCasos = raw;
    try {
      snapCasos = raw ? (JSON.parse(raw) as Caso[]) : VAZIO_CASOS;
    } catch {
      snapCasos = VAZIO_CASOS;
    }
  }
  return snapCasos;
}

let rawMsgs: string | null | undefined;
let snapMsgs: Mensagem[] = VAZIO_MSGS;

function snapshotMensagens(): Mensagem[] {
  garantirSemente();
  const raw = window.localStorage.getItem(K.mensagens);
  if (raw !== rawMsgs) {
    rawMsgs = raw;
    try {
      snapMsgs = raw ? (JSON.parse(raw) as Mensagem[]) : VAZIO_MSGS;
    } catch {
      snapMsgs = VAZIO_MSGS;
    }
  }
  return snapMsgs;
}

/** `false` no servidor e durante a hidratação; `true` depois de montado no cliente. */
export function usePronto() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function useCasos() {
  const casos = useSyncExternalStore(subscribe, snapshotCasos, () => VAZIO_CASOS);
  const pronto = usePronto();
  return { casos, pronto };
}

export function useCaso(id: string | undefined) {
  const { casos, pronto } = useCasos();
  const caso = useMemo(() => (id ? casos.find((c) => c.id === id || c.protocolo === id) : undefined), [casos, id]);
  return { caso, pronto };
}

export function useMensagens(casoId: string | undefined) {
  const todas = useSyncExternalStore(subscribe, snapshotMensagens, () => VAZIO_MSGS);
  return useMemo(
    () => (casoId ? todas.filter((m) => m.casoId === casoId).sort((a, b) => a.enviadoEm.localeCompare(b.enviadoEm)) : VAZIO_MSGS),
    [todas, casoId],
  );
}

export function usePerfil(): Perfil | null {
  return useSyncExternalStore(subscribe, perfilAtual, () => null);
}

/** Caixa de entrada: última mensagem e não lidas por caso, reativo ao store de mensagens. */
export function useResumoConversas() {
  const todas = useSyncExternalStore(subscribe, snapshotMensagens, () => VAZIO_MSGS);
  return useMemo(() => {
    const out: Record<string, { ultima?: Mensagem; naoLidas: number }> = {};
    for (const m of todas) {
      const r = (out[m.casoId] ??= { naoLidas: 0 });
      if (!r.ultima || m.enviadoEm > r.ultima.enviadoEm) r.ultima = m;
      if (m.autor === 'assistido' && !m.lidaPeloAdvogado) r.naoLidas += 1;
    }
    return out;
  }, [todas]);
}
