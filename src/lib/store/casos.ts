'use client';

import type { Area, Assinatura, Caso, DocumentoCaso, EventoHistorico, StatusCaso } from '@/types';
import { catalogoPorArea } from '@/data/documentos';
import { agoraISO } from '@/lib/utils';
import { K, gravar, ler } from './nucleo';
import { garantirSemente } from './semente';

export function carregarCasos(): Caso[] {
  garantirSemente();
  return ler<Caso[]>(K.casos, []);
}

export function obterCaso(id: string): Caso | undefined {
  return carregarCasos().find((c) => c.id === id || c.protocolo === id);
}

function salvarCasos(casos: Caso[]) {
  gravar(K.casos, casos);
}

export function documentosIniciais(area: Area, tipoPessoa: 'PF' | 'PJ'): DocumentoCaso[] {
  return catalogoPorArea(area)
    .filter((d) => d.obrigatoriedade !== 'se_pj' || tipoPessoa === 'PJ')
    .map((d) => ({ ...d, status: 'pendente' as const }));
}

export function atualizarCaso(
  id: string,
  patch: Partial<Caso> | ((c: Caso) => Partial<Caso>),
  evento?: Omit<EventoHistorico, 'em'>,
) {
  const casos = carregarCasos();
  const idx = casos.findIndex((c) => c.id === id);
  if (idx < 0) return;
  const atual = casos[idx];
  const p = typeof patch === 'function' ? patch(atual) : patch;
  const novo: Caso = {
    ...atual,
    ...p,
    atualizadoEm: agoraISO(),
    historico: evento ? [...atual.historico, { ...evento, em: agoraISO() }] : atual.historico,
  };
  casos[idx] = novo;
  salvarCasos(casos);
  return novo;
}

export function mudarStatus(id: string, status: StatusCaso, descricao: string, autor: EventoHistorico['autor'] = 'advogado') {
  return atualizarCaso(id, { status }, { tipo: 'status', descricao, autor });
}

export function atualizarDocumento(
  casoId: string,
  documentoId: string,
  patch: Partial<DocumentoCaso>,
  evento?: Omit<EventoHistorico, 'em'>,
) {
  return atualizarCaso(
    casoId,
    (c) => ({
      documentos: c.documentos.map((d) => (d.id === documentoId ? { ...d, ...patch, atualizadoEm: agoraISO() } : d)),
    }),
    evento,
  );
}

export function registrarAssinatura(casoId: string, assinatura: Assinatura) {
  return atualizarCaso(
    casoId,
    (c) => ({
      assinaturas: [...c.assinaturas.filter((a) => a.documentoId !== assinatura.documentoId), assinatura],
      documentos: c.documentos.map((d) => (d.id === assinatura.documentoId ? { ...d, status: 'assinado', atualizadoEm: agoraISO() } : d)),
    }),
    { tipo: 'assinatura', descricao: `Documento "${assinatura.documentoId}" assinado (${assinatura.metodo}).`, autor: 'assistido' },
  );
}
