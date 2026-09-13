'use client';

import type { Mensagem } from '@/types';
import { agoraISO, gerarId } from '@/lib/utils';
import { K, gravar, ler } from './nucleo';
import { garantirSemente } from './semente';

export function todasMensagens(): Mensagem[] {
  garantirSemente();
  return ler<Mensagem[]>(K.mensagens, []);
}

export function mensagensDoCaso(casoId: string): Mensagem[] {
  return todasMensagens()
    .filter((m) => m.casoId === casoId)
    .sort((a, b) => a.enviadoEm.localeCompare(b.enviadoEm));
}

export function enviarMensagem(m: Omit<Mensagem, 'id' | 'enviadoEm'> & { enviadoEmForcado?: string }): Mensagem {
  const { enviadoEmForcado, ...resto } = m;
  const nova: Mensagem = { ...resto, id: gerarId('msg'), enviadoEm: enviadoEmForcado ?? agoraISO() };
  gravar(K.mensagens, [...ler<Mensagem[]>(K.mensagens, []), nova]);
  return nova;
}


/** Marca como lidas as mensagens do assistido — usado ao abrir a conversa pelo advogado. */
export function marcarLidas(casoId: string) {
  const todas = ler<Mensagem[]>(K.mensagens, []);
  let mudou = false;
  const novas = todas.map((m) => {
    if (m.casoId === casoId && m.autor === 'assistido' && !m.lidaPeloAdvogado) {
      mudou = true;
      return { ...m, lidaPeloAdvogado: true };
    }
    return m;
  });
  if (mudou) gravar(K.mensagens, novas);
}
