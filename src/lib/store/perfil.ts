'use client';

import type { Perfil } from '@/types';
import { K, gravar, ler } from './nucleo';

export function perfilAtual(): Perfil | null {
  return ler<Perfil | null>(K.perfil, null);
}

export function entrarComo(perfil: Perfil) {
  gravar(K.perfil, perfil);
}

export function sair() {
  gravar(K.perfil, null);
}
