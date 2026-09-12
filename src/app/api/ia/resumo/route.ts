import { NextResponse } from 'next/server';
import { tarefaResumo } from '@/lib/ia/tarefas';
import { ErroIA } from '@/lib/ia/provider';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { caso } = await req.json();
    if (!caso?.relato?.texto || String(caso.relato.texto).trim().length < 10) {
      return NextResponse.json({ erro: 'Relato muito curto para análise.' }, { status: 400 });
    }
    const r = await tarefaResumo(caso);
    return NextResponse.json(r);
  } catch (e) {
    if (e instanceof ErroIA) return NextResponse.json({ erro: e.message, tentativas: e.tentativas }, { status: e.status });
    return NextResponse.json({ erro: e instanceof Error ? e.message : 'Erro inesperado' }, { status: 500 });
  }
}
