import fs from 'node:fs';
import path from 'node:path';

/**
 * Carrega os prompts de `prompts/*.md` do disco.
 * Os arquivos são a fonte da verdade — não há cópia em código.
 */

export type NomePrompt =
  | '00-sistema-base'
  | '01-resumo-fatico'
  | '02-checklist-documental'
  | '03-minuta-peticao-inicial'
  | '04-mensagem-assistido';

const cache = new Map<NomePrompt, string>();

export function lerPrompt(nome: NomePrompt): string {
  if (process.env.NODE_ENV === 'production' && cache.has(nome)) return cache.get(nome)!;
  const arquivo = path.join(process.cwd(), 'prompts', `${nome}.md`);
  const conteudo = fs.readFileSync(arquivo, 'utf8');
  cache.set(nome, conteudo);
  return conteudo;
}

/** O sistema base sem o cabeçalho explicativo (tudo após a primeira linha horizontal). */
export function systemBase(): string {
  const bruto = lerPrompt('00-sistema-base');
  const idx = bruto.indexOf('\n---\n');
  return idx >= 0 ? bruto.slice(idx + 5).trim() : bruto;
}
