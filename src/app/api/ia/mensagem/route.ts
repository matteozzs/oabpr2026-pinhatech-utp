import { NextResponse } from 'next/server';
import { tarefaMensagem } from '@/lib/ia/tarefas';
import { ErroIA } from '@/lib/ia/provider';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const entrada = await req.json();
    if (!entrada?.advogado?.nome || !entrada?.assistido?.primeiroNome) {
      return NextResponse.json({ erro: 'Dados incompletos.' }, { status: 400 });
    }
    const r = await tarefaMensagem(entrada);
    return NextResponse.json(r);
  } catch (e) {
    if (e instanceof ErroIA) return NextResponse.json({ erro: e.message, tentativas: e.tentativas }, { status: e.status });
    return NextResponse.json({ erro: e instanceof Error ? e.message : 'Erro inesperado' }, { status: 500 });
  }
}
