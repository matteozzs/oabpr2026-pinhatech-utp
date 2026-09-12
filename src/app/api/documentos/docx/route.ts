import { NextResponse } from 'next/server';
import type { Advogado, Caso, Minuta } from '@/types';
import { docConsentimentoDados, docDeclaracaoHipossuficiencia, docPeticaoInicial, docProcuracao, paraBuffer } from '@/lib/documentos/docx';

export const runtime = 'nodejs';

type Tipo = 'procuracao' | 'declaracao_hipossuficiencia' | 'consentimento_dados' | 'peticao_inicial';

/**
 * POST { tipo, caso, advogado, minuta? } → arquivo .docx
 * O caso vem do navegador (o MVP não tem banco); o servidor só monta o documento.
 */
export async function POST(req: Request) {
  try {
    const { tipo, caso, advogado, minuta } = (await req.json()) as { tipo: Tipo; caso: Caso; advogado: Advogado; minuta?: Minuta };
    if (!tipo || !caso?.assistido) return NextResponse.json({ erro: 'Dados incompletos.' }, { status: 400 });

    const adv: Advogado = advogado ?? { nome: '[NOME DO(A) ADVOGADO(A)]', oab: 'OAB/PR [NÚMERO]' };
    let doc;
    let nome = '';
    switch (tipo) {
      case 'procuracao':
        doc = docProcuracao(caso, adv);
        nome = 'Procuracao';
        break;
      case 'declaracao_hipossuficiencia':
        doc = docDeclaracaoHipossuficiencia(caso);
        nome = 'Declaracao_Hipossuficiencia';
        break;
      case 'consentimento_dados':
        doc = docConsentimentoDados(caso, adv);
        nome = 'Termo_Consentimento_Dados';
        break;
      case 'peticao_inicial':
        if (!minuta) return NextResponse.json({ erro: 'Minuta ausente.' }, { status: 400 });
        doc = docPeticaoInicial(caso, minuta, adv);
        nome = 'Minuta_Peticao_Inicial';
        break;
      default:
        return NextResponse.json({ erro: 'Tipo de documento desconhecido.' }, { status: 400 });
    }

    const buffer = await paraBuffer(doc);
    const arquivo = `${nome}_${caso.protocolo}.docx`;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${arquivo}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return NextResponse.json({ erro: e instanceof Error ? e.message : 'Erro ao gerar documento' }, { status: 500 });
  }
}
