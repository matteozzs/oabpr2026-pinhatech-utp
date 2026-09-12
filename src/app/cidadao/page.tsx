'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, UserCheck } from 'lucide-react';
import { entrarComo, useCasos, usePerfil } from '@/lib/store';
import { CardCaso } from '@/features/casos';

export default function CidadaoPage() {
  const perfil = usePerfil();
  const { casos, pronto } = useCasos();
  const router = useRouter();

  if (perfil !== 'cidadao') {
    return (
      <div className="max-w-xl mx-auto text-center pt-6">
        <UserCheck className="w-12 h-12 text-navy-700 mx-auto" />
        <h1 className="mt-4 text-3xl font-black text-navy-950">Sou Cidadão</h1>
        <p className="mt-3 text-ink-700">
          Aqui você conta o seu problema com suas palavras — por texto ou por voz — e recebe um número de protocolo. Um(a) advogado(a)
          dativo(a) nomeado(a) pela OAB/PR vai analisar e falar com você por aqui.
        </p>
        <button
          className="btn-primary mt-6 w-full sm:w-auto text-base px-6 py-3"
          onClick={() => {
            entrarComo('cidadao');
            router.push('/cidadao');
          }}
        >
          Entrar como Cidadão (demonstração) <ArrowRight className="w-4 h-4" />
        </button>
        <p className="mt-3 text-xs text-ink-500">Ambiente de demonstração: sem cadastro, sem senha. Os dados ficam só no seu navegador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-950">Minhas solicitações</h1>
          <p className="text-ink-700 mt-1">Acompanhe o andamento, envie documentos e fale com o(a) advogado(a).</p>
        </div>
        <Link href="/cidadao/nova-solicitacao" className="btn-primary">
          <Plus className="w-4 h-4" /> Nova solicitação
        </Link>
      </div>

      {!pronto ? null : casos.length === 0 ? (
        <div className="card p-8 text-center text-ink-700">Você ainda não tem solicitações.</div>
      ) : (
        <ul className="grid gap-3">
          {casos.map((c) => (
            <li key={c.id}>
              <CardCaso caso={c} href={`/cidadao/solicitacao/${c.id}`} destacarUrgencia={false} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
