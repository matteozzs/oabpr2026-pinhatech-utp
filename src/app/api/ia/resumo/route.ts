import { NextResponse } from 'next/server';
import { tarefaResumo } from '@/lib/ia/tarefas';
import { ErroIA } from '@/lib/ia/provider';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { caso, mensagens } = await req.json();
    const material = [caso?.relato?.texto ?? '', ...((mensagens ?? []) as { texto?: string }[]).map((m) => m?.texto ?? '')].join(' ').trim();
    if (material.length < 10) {
      return NextResponse.json({ erro: 'Ainda não há material suficiente. Converse com a parte ou registre o relato antes de gerar o resumo.' }, { status: 400 });
    }
    const r = await tarefaResumo(caso, mensagens ?? []);
    return NextResponse.json(r);
  } catch (e) {
    if (e instanceof ErroIA) return NextResponse.json({ erro: e.message, tentativas: e.tentativas }, { status: e.status });
    return NextResponse.json({ erro: e instanceof Error ? e.message : 'Erro inesperado' }, { status: 500 });
  }
}
