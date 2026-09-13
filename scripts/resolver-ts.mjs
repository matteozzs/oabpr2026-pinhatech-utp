/**
 * Hook de resolução para rodar os arquivos `.ts` do projeto direto no Node.
 *
 * O código da aplicação importa sem extensão (`./documentos`), como o bundler do
 * Next espera. O Node, em ESM, exige a extensão. Este hook fecha essa diferença —
 * e só ela — para que a massa de testes use os mesmos dados de demonstração que a
 * plataforma usa, em vez de uma cópia que sairia do ar na primeira alteração.
 */
import { existsSync } from 'node:fs';
import { dirname, extname, resolve as resolverCaminho } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const EXTENSOES = ['.ts', '.tsx', '.js', '.mjs'];

export function resolve(especificador, contexto, proximo) {
  const relativo = especificador.startsWith('.');
  if (relativo && !extname(especificador) && contexto.parentURL?.startsWith('file:')) {
    const base = dirname(fileURLToPath(contexto.parentURL));
    for (const ext of EXTENSOES) {
      const alvo = resolverCaminho(base, especificador + ext);
      if (existsSync(alvo)) return proximo(pathToFileURL(alvo).href, contexto);
    }
  }
  return proximo(especificador, contexto);
}
