import { NextResponse } from 'next/server';
import { iaConfigurada } from '@/lib/ia/provider';
import { carregarCorpus } from '@/lib/ia/rag';

export const runtime = 'nodejs';

/** Diagnóstico simples: a IA está configurada? Quantos dispositivos há no corpus? */
export async function GET() {
  const corpus = carregarCorpus();
  return NextResponse.json({
    iaConfigurada: iaConfigurada(),
    modelo: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    corpus: {
      versao: corpus._meta.versao,
      dispositivos: corpus.dispositivos.length,
      verificados: corpus.dispositivos.filter((d) => d.verificado).length,
      atualizadoEm: corpus._meta.atualizado_em,
    },
  });
}
