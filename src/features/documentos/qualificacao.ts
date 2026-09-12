import type { Assistido, Caso } from '@/types';

/**
 * Quais dados da parte são indispensáveis para a plataforma gerar um documento
 * sem deixar marcador de lacuna. Enquanto faltar algum, o botão de gerar não habilita:
 * é a regra que impede a plataforma de emitir peça incompleta como se estivesse pronta.
 */
export const CAMPOS_QUALIFICACAO = [
  { campo: 'nome', rotulo: 'Nome completo' },
  { campo: 'cpf', rotulo: 'CPF' },
  { campo: 'rg', rotulo: 'RG' },
  { campo: 'nacionalidade', rotulo: 'Nacionalidade' },
  { campo: 'estadoCivil', rotulo: 'Estado civil' },
  { campo: 'profissao', rotulo: 'Profissão' },
  { campo: 'endereco', rotulo: 'Endereço' },
  { campo: 'cidade', rotulo: 'Cidade' },
] as const satisfies readonly { campo: keyof Assistido; rotulo: string }[];

export function camposFaltantes(a: Assistido): string[] {
  return CAMPOS_QUALIFICACAO.filter(({ campo }) => !String(a[campo] ?? '').trim()).map(({ rotulo }) => rotulo);
}

export function qualificacaoCompleta(a: Assistido): boolean {
  return camposFaltantes(a).length === 0;
}

/** Percentual preenchido — usado no indicador do painel de dados da parte. */
export function percentualQualificacao(a: Assistido): number {
  const total = CAMPOS_QUALIFICACAO.length;
  return Math.round(((total - camposFaltantes(a).length) / total) * 100);
}

/** Marcadores de lacuna que ainda restam no texto da minuta, depois das edições do advogado. */
const RE_LACUNA = /\[[^\]]*(?:COMPLETAR|A DEFINIR|A CONFIRMAR|A DETALHAR|NÃO LOCALIZADA|A DISTRIBUIR|DILIGENCIAR)[^\]]*\]/gi;

export function lacunasNoTexto(...textos: (string | undefined)[]): string[] {
  const achados = new Set<string>();
  for (const t of textos) {
    for (const m of (t ?? '').matchAll(RE_LACUNA)) achados.add(m[0]);
  }
  return [...achados];
}

export function lacunasDaMinuta(caso: Caso): string[] {
  const m = caso.ia.minuta;
  if (!m) return [];
  return lacunasNoTexto(
    m.enderecamento,
    m.classeProcessual,
    m.qualificacaoAutor,
    m.qualificacaoReu,
    m.gratuidade,
    m.fatos,
    m.direito,
    m.tutelaUrgencia,
    ...m.pedidos,
    m.valorCausa,
    m.provas,
    m.fechamento,
  );
}
