/**
 * Provedor de IA — Gemini via REST (Google AI Studio).
 *
 * Decisões:
 * - REST puro com fetch: zero dependência de SDK, chamada 100% legível para auditoria.
 * - Cadeia de fallback: modelos do Gemini oscilam entre 503 "high demand"; se o
 *   primário falhar por indisponibilidade, tentamos o próximo. A demo nunca depende de um só modelo.
 * - Teto de tokens de saída (`maxOutputTokens`) em toda chamada — requisito do projeto e
 *   proteção contra custo/timeout. Nos modelos Gemini 3.x os tokens de raciocínio contam
 *   nesse teto, por isso o nível de raciocínio é fixado em "low" e o teto é generoso.
 * - Temperatura baixa: saída determinística para tarefas jurídicas.
 *
 * Trocar de provedor (ex.: Claude) = reimplementar `gerarTexto` mantendo a assinatura.
 */

import type { TentativaModelo, UsoTokens } from '@/types';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

const MODELO_PRIMARIO = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const CADEIA_FALLBACK = (process.env.GEMINI_FALLBACKS || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.8-flash')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

export interface OpcoesGeracao {
  system: string;
  user: string;
  /** Teto de tokens de saída (inclui raciocínio nos modelos 3.x). */
  maxOutputTokens?: number;
  temperature?: number;
  /** Força JSON no modelo. */
  json?: boolean;
}

export interface ResultadoGeracao {
  texto: string;
  modelo: string;
  tentativas: TentativaModelo[];
  uso?: UsoTokens;
  finishReason?: string;
}

export class ErroIA extends Error {
  constructor(
    message: string,
    public readonly tentativas: TentativaModelo[] = [],
    public readonly status = 502,
  ) {
    super(message);
    this.name = 'ErroIA';
  }
}

export function iaConfigurada() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function modelosParaTentar() {
  const lista = [MODELO_PRIMARIO, ...CADEIA_FALLBACK];
  return Array.from(new Set(lista));
}

/** Um modelo é "indisponível" quando vale a pena tentar o próximo. */
function ehIndisponibilidade(status: number) {
  return status === 503 || status === 429 || status === 404 || status === 500;
}

export async function gerarTexto(op: OpcoesGeracao): Promise<ResultadoGeracao> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    throw new ErroIA('IA não configurada: defina GEMINI_API_KEY no ambiente.', [], 503);
  }

  const tentativas: TentativaModelo[] = [];
  const corpo = {
    systemInstruction: { parts: [{ text: op.system }] },
    contents: [{ role: 'user', parts: [{ text: op.user }] }],
    generationConfig: {
      temperature: op.temperature ?? 0.2,
      maxOutputTokens: op.maxOutputTokens ?? 4096,
      ...(op.json !== false ? { responseMimeType: 'application/json' } : {}),
      thinkingConfig: { thinkingLevel: 'low' },
    },
  };

  for (const modelo of modelosParaTentar()) {
    const inicio = Date.now();
    try {
      const resp = await fetch(`${ENDPOINT}/${modelo}:generateContent?key=${chave}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        // Um modelo travado não pode segurar a demo: 25s e passa para o próximo (o 503 do Gemini costuma levar ~30s).
        signal: AbortSignal.timeout(25_000),
      });
      const ms = Date.now() - inicio;

      if (!resp.ok) {
        const detalhe = await resp.text().catch(() => '');
        const status = resp.status;
        tentativas.push({
          modelo,
          status: ehIndisponibilidade(status) ? 'indisponivel' : 'erro',
          httpStatus: status,
          detalhe: detalhe.slice(0, 300),
          ms,
        });
        if (ehIndisponibilidade(status)) continue;
        throw new ErroIA(`Erro ${status} no modelo ${modelo}`, tentativas, 502);
      }

      const dados = await resp.json();
      const cand = dados?.candidates?.[0];
      const partes: { text?: string; thought?: boolean }[] = cand?.content?.parts ?? [];
      // Ignora partes de raciocínio, se o modelo as expuser.
      const texto = partes
        .filter((p) => !p.thought && typeof p.text === 'string')
        .map((p) => p.text)
        .join('');

      if (!texto) {
        tentativas.push({ modelo, status: 'erro', detalhe: `sem texto (finish=${cand?.finishReason})`, ms });
        continue;
      }

      tentativas.push({ modelo, status: 'ok', ms });
      const u = dados?.usageMetadata ?? {};
      return {
        texto,
        modelo,
        tentativas,
        finishReason: cand?.finishReason,
        uso: { entrada: u.promptTokenCount, saida: u.candidatesTokenCount, raciocinio: u.thoughtsTokenCount },
      };
    } catch (e) {
      const ms = Date.now() - inicio;
      if (e instanceof ErroIA) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      tentativas.push({ modelo, status: 'indisponivel', detalhe: msg.slice(0, 200), ms });
      continue;
    }
  }

  throw new ErroIA('Nenhum modelo de IA respondeu. Tente novamente em instantes.', tentativas, 503);
}

/** Remove cercas de código e tenta extrair o primeiro objeto JSON do texto. */
export function extrairJSON<T = unknown>(texto: string): T {
  let t = texto.trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(t) as T;
  } catch {
    const ini = t.indexOf('{');
    const fim = t.lastIndexOf('}');
    if (ini >= 0 && fim > ini) {
      return JSON.parse(t.slice(ini, fim + 1)) as T;
    }
    throw new Error('Resposta da IA não é JSON válido.');
  }
}

export async function gerarJSON<T>(op: OpcoesGeracao): Promise<{ dados: T; meta: ResultadoGeracao }> {
  const r = await gerarTexto({ ...op, json: true });
  try {
    return { dados: extrairJSON<T>(r.texto), meta: r };
  } catch {
    // Uma segunda tentativa, pedindo explicitamente correção do JSON.
    const r2 = await gerarTexto({
      ...op,
      json: true,
      user: `${op.user}\n\nATENÇÃO: sua resposta anterior não era JSON válido. Responda SOMENTE o JSON.`,
    });
    return { dados: extrairJSON<T>(r2.texto), meta: { ...r2, tentativas: [...r.tentativas, ...r2.tentativas] } };
  }
}
