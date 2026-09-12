'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, UserCheck } from 'lucide-react';
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
          Aqui você acompanha o processo em que a OAB/PR ou o Fórum nomeou um(a) advogado(a) dativo(a) para você: conversa com ele(a),
          envia os documentos que faltam e assina o que for necessário.
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950">Meus processos</h1>
        <p className="text-ink-700 mt-1">Acompanhe o andamento, envie documentos e fale com o(a) advogado(a) nomeado(a).</p>
      </div>

      {!pronto ? null : casos.length === 0 ? (
        <div className="card p-8 text-center text-ink-700">
          Nenhum processo por aqui ainda. Os processos aparecem quando a OAB/PR ou o Fórum nomeia um(a) advogado(a) dativo(a) para o seu caso.
        </div>
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
