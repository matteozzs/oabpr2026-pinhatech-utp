import type { Caso, ChecklistDocumental, Mensagem, MetaIA, Minuta, ResumoFatico } from '@/types';

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

/** O resumo nasce do relato inicial somado à conversa havida com a parte. */
export function pedirResumo(caso: Caso, mensagens: Mensagem[] = []) {
  return post<{ resumo: ResumoFatico; meta: MetaIA }>('/api/ia/resumo', { caso, mensagens }).then((r) => ({ dados: r.resumo, meta: r.meta }));
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
