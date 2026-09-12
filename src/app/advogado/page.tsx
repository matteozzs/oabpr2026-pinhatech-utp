'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Scale } from 'lucide-react';
import { ADVOGADO_DEMO, entrarComo } from '@/lib/store';

export default function AdvogadoPage() {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto text-center pt-6">
      <Scale className="w-12 h-12 text-navy-700 mx-auto" />
      <h1 className="mt-4 text-3xl font-black text-navy-950">Sou Advogado Dativo</h1>
      <p className="mt-3 text-ink-700">
        Veja suas nomeações, leia o resumo do caso feito pela IA, aceite ou recuse com justificativa, gere o checklist de
        documentos, as procurações e a minuta da petição — tudo com fundamentação restrita a um corpus verificável.
      </p>
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
    </div>
  );
}
