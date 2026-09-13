import type { Caso, Mensagem } from '@/types';

/**
 * O resumo fático só faz sentido quando há o que resumir.
 *
 * Sem esta verificação a plataforma convida o advogado a gerar um resumo de um caso vazio —
 * e um modelo pressionado a resumir o nada tende a preencher o vazio. É a primeira linha
 * de defesa contra alucinação: não pedir à IA o que ela não tem como responder.
 */

/** Mínimo de caracteres de material factual para valer a pena chamar a IA. */
export const MINIMO_MATERIAL = 60;

export interface MaterialResumo {
  /** Caracteres úteis: relato inicial + falas da parte. */
  caracteres: number;
  falasDaParte: number;
  temRelato: boolean;
  suficiente: boolean;
  /** Por que não dá para gerar ainda — vazio quando `suficiente`. */
  motivo: string;
  /** De onde veio o material, para exibir ao advogado. */
  origem: string;
}

export function materialParaResumo(caso: Pick<Caso, 'relato'>, mensagens: Mensagem[] = []): MaterialResumo {
  const relato = (caso.relato?.texto ?? '').trim();

  // Só falas da parte contam como fato novo. Mensagens do advogado e cartões
  // operacionais (CRAS, pedido de assinatura) não trazem material do caso.
  const falas = mensagens.filter(
    (m) => m.autor === 'assistido' && m.tipo !== 'orientacao_cras' && m.tipo !== 'solicitacao_assinatura',
  );
  const textoFalas = falas.map((m) => m.texto.trim()).join(' ');
  const caracteres = relato.length + textoFalas.length;

  const partes: string[] = [];
  if (relato) partes.push('relato inicial');
  if (falas.length) partes.push(`${falas.length} fala(s) da parte`);

  // O resumo é o produto de ter conversado. Sem nenhuma fala da parte no chat não há
  // o que resumir — e um resumo que existe sem conversa nenhuma confunde quem audita.
  const suficiente = falas.length > 0 && caracteres >= MINIMO_MATERIAL;
  let motivo = '';
  if (!suficiente) {
    motivo =
      falas.length === 0
        ? 'A parte ainda não falou nada nesta conversa. O resumo nasce do que ela contar aqui.'
        : `Material insuficiente (${caracteres} de ${MINIMO_MATERIAL} caracteres). Apure mais na conversa antes de gerar.`;
  }

  return {
    caracteres,
    falasDaParte: falas.length,
    temRelato: Boolean(relato),
    suficiente,
    motivo,
    origem: partes.length ? partes.join(' + ') : 'nenhum material',
  };
}
