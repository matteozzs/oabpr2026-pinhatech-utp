'use client';

import type { Area, Assinatura, Caso, DocumentoCaso, EventoHistorico, StatusCaso } from '@/types';
import { catalogoPorArea } from '@/data/documentos';
import { agoraISO, gerarId, gerarProtocolo } from '@/lib/utils';
import { ADVOGADO_DEMO, K, gravar, ler } from './nucleo';
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

export interface EntradaNovoCaso {
  area: Area;
  comarca: string;
  temProcessoAtivo: boolean;
  numeroProcesso?: string;
  assistido: Caso['assistido'];
  parteContraria?: Caso['parteContraria'];
  relato: Caso['relato'];
  registradoPor: 'assistido' | 'advogado';
  nomeacao?: Caso['nomeacao'];
  cenarioTeste?: string;
}

/**
 * Cria um caso. A nomeação e o aceite do advogado já aconteceram na OAB/Fórum;
 * por isso o caso nasce "em atendimento", vinculado ao advogado de demonstração.
 */
export function criarCaso(e: EntradaNovoCaso): Caso {
  const agora = agoraISO();
  const historico: EventoHistorico[] =
    e.registradoPor === 'advogado'
      ? [
          {
            em: agora,
            tipo: 'nomeacao',
            descricao: `Nomeação ${e.nomeacao?.referencia ? `(${e.nomeacao.referencia}) ` : ''}pela ${
              e.nomeacao?.origem === 'forum' ? 'Vara/Fórum' : 'OAB/PR'
            } aceita pelo advogado — fora da plataforma.`,
            autor: 'advogado',
          },
          { em: agora, tipo: 'criacao', descricao: `Atendimento registrado na plataforma por ${ADVOGADO_DEMO.nome}.`, autor: 'advogado' },
        ]
      : [
          { em: agora, tipo: 'criacao', descricao: 'Solicitação registrada pelo cidadão.', autor: 'assistido' },
          {
            em: agora,
            tipo: 'nomeacao',
            descricao: `Vínculo com a nomeação de ${ADVOGADO_DEMO.nome} registrado (simulação — na operação real, a OAB/Fórum nomeia e o advogado aceita antes de o caso entrar aqui).`,
            autor: 'plataforma',
          },
        ];

  const caso: Caso = {
    id: gerarId('caso'),
    protocolo: gerarProtocolo(),
    criadoEm: agora,
    atualizadoEm: agora,
    area: e.area,
    comarca: e.comarca,
    temProcessoAtivo: e.temProcessoAtivo,
    numeroProcesso: e.numeroProcesso,
    assistido: e.assistido,
    parteContraria: e.parteContraria,
    relato: e.relato,
    status: 'em_atendimento',
    advogado: ADVOGADO_DEMO,
    nomeacao: e.nomeacao,
    registradoPor: e.registradoPor,
    cenarioTeste: e.cenarioTeste,
    ia: {},
    documentos: documentosIniciais(e.area, e.assistido.tipoPessoa),
    assinaturas: [],
    historico,
  };
  salvarCasos([caso, ...carregarCasos()]);
  return caso;
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

/** Remove os casos criados pelo banco de cenários, preservando os de demonstração. */
export function limparCasosDeTeste() {
  const restantes = carregarCasos().filter((c) => !c.cenarioTeste);
  salvarCasos(restantes);
  return restantes.length;
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
