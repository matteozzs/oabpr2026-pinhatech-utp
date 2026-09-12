import { NextResponse } from 'next/server';
import { tarefaChecklist } from '@/lib/ia/tarefas';
import { ErroIA } from '@/lib/ia/provider';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { caso, resumo } = await req.json();
    if (!caso) return NextResponse.json({ erro: 'Caso ausente.' }, { status: 400 });
    const r = await tarefaChecklist(caso, resumo);
    return NextResponse.json(r);
  } catch (e) {
    if (e instanceof ErroIA) return NextResponse.json({ erro: e.message, tentativas: e.tentativas }, { status: e.status });
    return NextResponse.json({ erro: e instanceof Error ? e.message : 'Erro inesperado' }, { status: 500 });
  }
}
