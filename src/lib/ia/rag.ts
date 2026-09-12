import fs from 'node:fs';
import path from 'node:path';
import type { Area, FonteCitada } from '@/types';
import { normalizar } from '@/lib/utils';

/**
 * RAG determinístico sobre `knowledge/corpus.json`.
 *
 * Não há embeddings nem serviço externo: a recuperação é por sobreposição léxica entre o
 * relato/tema do caso e `palavras_chave` + `temas` + `texto` de cada dispositivo, filtrada por área.
 * É deliberadamente simples para que um auditor consiga explicar, linha a linha, por que um
 * dispositivo entrou no prompt — e para que a citação seja validada aqui, no servidor, e não pela IA.
 */

export interface Dispositivo {
  id: string;
  diploma: string;
  dispositivo: string;
  texto: string;
  areas: string[];
  temas: string[];
  palavras_chave: string[];
  fonte: string;
  verificado: boolean;
  nota?: string;
}

interface Corpus {
  _meta: { versao: string; fontes_oficiais: Record<string, string>; atualizado_em: string };
  dispositivos: Dispositivo[];
}

let corpusCache: Corpus | null = null;

export function carregarCorpus(): Corpus {
  if (corpusCache && process.env.NODE_ENV === 'production') return corpusCache;
  const arquivo = path.join(process.cwd(), 'knowledge', 'corpus.json');
  corpusCache = JSON.parse(fs.readFileSync(arquivo, 'utf8')) as Corpus;
  return corpusCache;
}

export function todosDispositivos() {
  return carregarCorpus().dispositivos;
}

export function buscarPorId(id: string): Dispositivo | undefined {
  return carregarCorpus().dispositivos.find((d) => d.id === id);
}

/** Dispositivos que toda petição inicial de hipossuficiente precisa, independentemente do tema. */
const ESSENCIAIS_PETICAO = ['CF88-5-LXXIV', 'CPC-98', 'CPC-99', 'CPC-105', 'CPC-319', 'CPC-320', 'CPC-292'];

export interface OpcoesRecuperacao {
  area: Area;
  texto: string;
  temas?: string[];
  limite?: number;
  /** Inclui os essenciais de petição (gratuidade, requisitos da inicial). */
  incluirEssenciais?: boolean;
}

export interface Recuperado {
  dispositivo: Dispositivo;
  pontuacao: number;
  motivos: string[];
}

export function recuperar(op: OpcoesRecuperacao): Recuperado[] {
  const { area, limite = 12 } = op;
  const consulta = normalizar(op.texto);
  const tokens = new Set(consulta.split(' ').filter((t) => t.length > 3));
  const temasExtra = new Set((op.temas ?? []).map(normalizar));

  const candidatos = todosDispositivos().filter(
    (d) => d.areas.includes(area) || d.areas.includes('geral'),
  );

  const pontuados: Recuperado[] = candidatos.map((d) => {
    let pontuacao = 0;
    const motivos: string[] = [];

    for (const pc of d.palavras_chave) {
      const n = normalizar(pc);
      if (n && consulta.includes(n)) {
        pontuacao += 3;
        motivos.push(`palavra-chave "${pc}"`);
      }
    }
    for (const t of d.temas) {
      if (temasExtra.has(normalizar(t))) {
        pontuacao += 4;
        motivos.push(`tema "${t}"`);
      }
    }
    const textoNorm = normalizar(d.texto);
    let sobreposicao = 0;
    for (const tk of tokens) if (textoNorm.includes(tk)) sobreposicao += 1;
    if (sobreposicao) {
      pontuacao += Math.min(sobreposicao * 0.5, 3);
      motivos.push(`${sobreposicao} termos do relato no texto`);
    }
    // Dispositivos da área específica valem um pouco mais que os gerais.
    if (d.areas.includes(area)) pontuacao += 0.5;

    return { dispositivo: d, pontuacao, motivos };
  });

  let selecionados = pontuados
    .filter((p) => p.pontuacao > 0)
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .slice(0, limite);

  if (op.incluirEssenciais) {
    const ids = new Set(selecionados.map((s) => s.dispositivo.id));
    for (const id of ESSENCIAIS_PETICAO) {
      if (ids.has(id)) continue;
      const d = buscarPorId(id);
      if (d) selecionados.push({ dispositivo: d, pontuacao: 0, motivos: ['essencial para petição inicial'] });
    }
  }

  // Garante ao menos um mínimo de contexto mesmo com relato muito curto.
  if (selecionados.length < 4) {
    const faltam = 4 - selecionados.length;
    const ids = new Set(selecionados.map((s) => s.dispositivo.id));
    const extras = pontuados
      .filter((p) => !ids.has(p.dispositivo.id) && p.dispositivo.areas.includes(area))
      .slice(0, faltam)
      .map((p) => ({ ...p, motivos: ['complemento de área'] }));
    selecionados = [...selecionados, ...extras];
  }

  return selecionados;
}

/** Renderiza o bloco `<fontes>` que vai para o prompt. */
export function renderizarFontes(recuperados: Recuperado[]): string {
  const linhas = recuperados.map((r) => {
    const d = r.dispositivo;
    const ref = d.nota?.includes('referência') || d.dispositivo.toLowerCase().includes('referência');
    return [
      `<fonte id="${d.id}"${ref ? ' tipo="referencia"' : ''}>`,
      `Diploma: ${d.diploma}`,
      `Dispositivo: ${d.dispositivo}`,
      `Texto: ${d.texto}`,
      d.nota ? `Nota: ${d.nota}` : null,
      `</fonte>`,
    ]
      .filter(Boolean)
      .join('\n');
  });
  return `<fontes>\n${linhas.join('\n\n')}\n</fontes>`;
}

/**
 * Valida as citações devolvidas pela IA contra o corpus.
 * Só o que existe no corpus volta enriquecido; o resto é descartado e relatado.
 */
export function validarFontes(
  citadas: { id?: string }[] | undefined,
  permitidas?: Set<string>,
): { validas: FonteCitada[]; invalidas: string[]; foraDoContexto: string[] } {
  const validas: FonteCitada[] = [];
  const invalidas: string[] = [];
  const foraDoContexto: string[] = [];
  const vistos = new Set<string>();

  for (const c of citadas ?? []) {
    const id = (c?.id ?? '').trim();
    if (!id || vistos.has(id)) continue;
    vistos.add(id);
    const d = buscarPorId(id);
    if (!d) {
      invalidas.push(id);
      continue;
    }
    if (permitidas && !permitidas.has(id)) {
      // Existe no corpus, mas não estava no bloco <fontes> desta chamada: a IA "lembrou" — registramos.
      foraDoContexto.push(id);
    }
    validas.push({
      id: d.id,
      diploma: d.diploma,
      dispositivo: d.dispositivo,
      texto: d.texto,
      fonte: carregarCorpus()._meta.fontes_oficiais[d.fonte] ?? d.fonte,
    });
  }
  return { validas, invalidas, foraDoContexto };
}

/** Extrai todos os `[ID]` citados dentro de um texto livre. */
export function idsCitadosNoTexto(texto: string): string[] {
  const ids = new Set<string>();
  const re = /\[([A-Z0-9]+(?:-[A-Z0-9]+)+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) ids.add(m[1]);
  return Array.from(ids);
}
