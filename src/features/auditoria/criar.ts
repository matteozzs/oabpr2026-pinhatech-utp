'use client';

import type { Area, Assistido, Caso, ParteContraria, Relato } from '@/types';
import { criarCaso, enviarMensagem } from '@/lib/store';
import type { CenarioTeste } from './cenarios';

/**
 * Criação de casos para auditoria: monta o caso e semeia a conversa de uma vez,
 * para o avaliador chegar na tela do advogado com o material já no lugar.
 */

export interface EntradaCenario {
  area: Area;
  comarca: string;
  assistido: Assistido;
  parteContraria?: ParteContraria;
  relato: Relato;
  conversa: { autor: 'assistido' | 'advogado'; texto: string }[];
  /** Identificador do cenário de origem, para o caso poder ser limpo depois. */
  cenarioTeste: string;
}

export function criarCasoDeCenario(e: EntradaCenario): Caso {
  const caso = criarCaso({
    area: e.area,
    comarca: e.comarca,
    temProcessoAtivo: false,
    registradoPor: 'advogado',
    nomeacao: { origem: 'oab', referencia: 'Cenário de auditoria' },
    assistido: e.assistido,
    parteContraria: e.parteContraria,
    relato: e.relato,
    cenarioTeste: e.cenarioTeste,
  });

  // As mensagens entram em ordem, com alguns minutos de diferença, para a
  // linha do tempo ficar coerente quando o auditor abrir a conversa.
  e.conversa.forEach((m, i) => {
    enviarMensagem({
      casoId: caso.id,
      autor: m.autor,
      canal: 'chat',
      tipo: 'texto',
      texto: m.texto,
      lidaPeloAdvogado: m.autor === 'advogado' ? undefined : false,
      enviadoEmForcado: new Date(Date.parse(caso.criadoEm) + (i + 1) * 4 * 60_000).toISOString(),
    });
  });

  return caso;
}

export function criarDoCenario(c: CenarioTeste): Caso {
  return criarCasoDeCenario({
    area: c.area,
    comarca: c.comarca,
    assistido: c.assistido,
    parteContraria: c.parteContraria,
    relato: c.relato,
    conversa: c.conversa,
    cenarioTeste: c.id,
  });
}
