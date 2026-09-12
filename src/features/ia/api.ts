import type { Caso, ChecklistDocumental, MetaIA, Minuta, ResumoFatico } from '@/types';

/**
 * Cliente tipado das rotas `/api/ia/*`.
 *
 * Existe para que nenhuma página precise saber o formato do corpo, o caminho ou o tratamento de erro.
 * Toda chamada devolve `{ dados, meta }` — `meta` é o que alimenta o painel de auditoria.
 */

async function post<T>(url: string, corpo: unknown): Promise<T> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.erro || `Erro ${r.status} ao chamar a IA.`);
  return j as T;
}

export function pedirResumo(caso: Caso) {
  return post<{ resumo: ResumoFatico; meta: MetaIA }>('/api/ia/resumo', { caso }).then((r) => ({ dados: r.resumo, meta: r.meta }));
}

export function pedirChecklist(caso: Caso, resumo?: ResumoFatico) {
  return post<{ checklist: ChecklistDocumental; meta: MetaIA }>('/api/ia/checklist', { caso, resumo }).then((r) => ({
    dados: r.checklist,
    meta: r.meta,
  }));
}

export function pedirMinuta(caso: Caso, resumo?: ResumoFatico, checklist?: ChecklistDocumental) {
  return post<{ minuta: Minuta; meta: MetaIA }>('/api/ia/minuta', { caso, resumo, checklist }).then((r) => ({
    dados: r.minuta,
    meta: r.meta,
  }));
}

export interface EntradaMensagem {
  advogado: { nome: string };
  assistido: { primeiroNome: string; sabeLerEscrever?: boolean; cidade: string };
  pendencias: { nome: string; ondeObter?: string }[];
  cras?: { municipio: string; rede: string; servicos: string[] } | null;
}

export function pedirMensagem(entrada: EntradaMensagem) {
  return post<{ texto: string; resumoCurto: string; meta: MetaIA }>('/api/ia/mensagem', entrada).then((r) => ({
    dados: r.texto,
    meta: r.meta,
  }));
}
