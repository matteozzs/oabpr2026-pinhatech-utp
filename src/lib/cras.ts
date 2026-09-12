import dados from '@/data/cras-rmc.json';
import { normalizar } from '@/lib/utils';

export interface CrasMunicipio {
  municipio: string;
  rede: string;
  servicos: string[];
  temDefensoria: boolean;
}

export const GLOSSARIO_CRAS: Record<string, string> = dados.servicos_glossario;
export const AVISO_CRAS: string = dados._aviso;

export function encontrarCras(cidade?: string): CrasMunicipio | null {
  if (!cidade) return null;
  const alvo = normalizar(cidade);
  const m = (dados.municipios as CrasMunicipio[]).find((x) => normalizar(x.municipio) === alvo);
  return m ?? null;
}

/** Busca pública — a plataforma não inventa endereço nem telefone. */
export function linkBuscaCras(cidade: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(`CRAS ${cidade} PR`)}`;
}

export function linkBuscaForum(cidade: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(`Fórum ${cidade} PR`)}`;
}

export function linkBuscaDefensoria(cidade: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(`Defensoria Pública ${cidade} PR`)}`;
}
