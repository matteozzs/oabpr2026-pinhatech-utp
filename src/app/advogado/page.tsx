'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Scale } from 'lucide-react';
import { ADVOGADO_DEMO, entrarComo, usePerfil, usePronto } from '@/lib/store';

/**
 * Porta de entrada do advogado. Quem já está no perfil não precisa "entrar de novo":
 * a tela reconhece e oferece seguir direto para os atendimentos.
 */
export default function AdvogadoPage() {
  const router = useRouter();
  const perfil = usePerfil();
  const pronto = usePronto();
  const jaDentro = pronto && perfil === 'advogado';

  return (
    <div className="max-w-xl mx-auto text-center pt-6">
      <Scale className="w-12 h-12 text-navy-700 mx-auto" />
      <h1 className="mt-4 text-3xl font-black text-navy-950">Sou Advogado Dativo</h1>
      <p className="mt-3 text-ink-700">
        Veja os atendimentos em que você foi nomeado(a), converse com a parte, gere o resumo fático, o checklist de documentos, as
        procurações e a minuta — tudo com fundamentação restrita a um corpus verificável.
      </p>

      {jaDentro ? (
        <>
          <Link href="/advogado/dashboard" className="btn-primary mt-6 w-full sm:w-auto text-base px-6 py-3">
            Ir para meus atendimentos <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-3 text-xs text-ink-500">
            Você já está no perfil de {ADVOGADO_DEMO.nome}. Use “Sair” no menu para trocar de perfil.
          </p>
        </>
      ) : (
        <>
          <button
            className="btn-primary mt-6 w-full sm:w-auto text-base px-6 py-3"
            onClick={() => {
              entrarComo('advogado');
              router.push('/advogado/dashboard');
            }}
          >
            Entrar como Advogado (demonstração) <ArrowRight className="w-4 h-4" />
          </button>
          <p className="mt-3 text-xs text-ink-500">
            Perfil de demonstração: {ADVOGADO_DEMO.nome}, {ADVOGADO_DEMO.oab}. Sem cadastro, sem senha.
          </p>
        </>
      )}
    </div>
  );
}
