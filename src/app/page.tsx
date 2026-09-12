import Link from 'next/link';
import { ArrowRight, BookOpenCheck, FileText, MessageSquareHeart, Scale, ShieldCheck, Users } from 'lucide-react';
import comarcas from '@/data/comarcas.json';

export default function Home() {
  const totalComarcas = comarcas.total_comarcas;
  const totalNomeacoes = comarcas.total_nomeacoes.toLocaleString('pt-BR');
  const civelFamilia = comarcas.comarcas.reduce((s, c) => s + c.civel + c.familia, 0);

  return (
    <div className="space-y-12">
      <section className="text-center max-w-3xl mx-auto pt-4">
        <p className="badge bg-navy-100 text-navy-900 mb-4">Hackathon da Cidadania OAB/PR 2026 · Inovação Aberta e Cidadania</p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-950 leading-[1.1]">
          O kit completo do advogado dativo.
          <br />
          <span className="text-navy-700">Em linguagem que o cidadão entende.</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-ink-700">
          Do relato em voz do assistido à minuta pronta para revisão: resumo do caso, checklist de documentos,
          procuração, declaração de hipossuficiência e comunicação acessível — com IA fundamentada só em fontes
          verificáveis.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto" aria-label="Escolha seu perfil">
        <Link href="/cidadao" className="card p-6 sm:p-8 hover:border-navy-500 hover:shadow-md transition group">
          <Users className="w-10 h-10 text-navy-700" />
          <h2 className="mt-4 text-2xl font-bold text-ink-900">Sou Cidadão</h2>
          <p className="mt-1 text-ink-700">Preciso de ajuda com pensão, guarda, divórcio, união estável ou um problema de consumo — e não posso pagar advogado.</p>
          <span className="mt-5 inline-flex items-center gap-1 font-semibold text-navy-700 group-hover:gap-2 transition-all">
            Pedir ajuda <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
        <Link href="/advogado" className="card p-6 sm:p-8 hover:border-navy-500 hover:shadow-md transition group">
          <Scale className="w-10 h-10 text-navy-700" />
          <h2 className="mt-4 text-2xl font-bold text-ink-900">Sou Advogado Dativo</h2>
          <p className="mt-1 text-ink-700">Fui nomeado(a) e quero decidir rápido, pedir só os documentos certos e gerar as peças com fundamentação conferível.</p>
          <span className="mt-5 inline-flex items-center gap-1 font-semibold text-navy-700 group-hover:gap-2 transition-all">
            Abrir painel <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </section>

      <section className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-center" aria-label="Contexto em números">
        <div className="card p-5">
          <p className="text-3xl font-black text-navy-900">{totalNomeacoes}</p>
          <p className="text-sm text-ink-700 mt-1">nomeações dativas no Paraná em 6 meses</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-black text-navy-900">{totalComarcas}</p>
          <p className="text-sm text-ink-700 mt-1">comarcas atendidas pela advocacia dativa</p>
        </div>
        <div className="card p-5">
          <p className="text-3xl font-black text-navy-900">{civelFamilia.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-ink-700 mt-1">nomeações em Cível e Família — o escopo desta versão</p>
        </div>
        <p className="sm:col-span-3 text-xs text-ink-500">
          Fonte: {comarcas.fonte} · período {comarcas.periodo}
        </p>
      </section>

      <section className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-ink-900 mb-4">O que a plataforma faz</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { i: MessageSquareHeart, t: 'Relato em voz ou texto', d: 'O cidadão conta o problema do jeito dele. A IA organiza os fatos e aponta o que falta.' },
            { i: BookOpenCheck, t: 'Resumo para decidir em 1 minuto', d: 'O advogado lê a síntese e aceita ou recusa a nomeação — com justificativa formal gerada se recusar.' },
            { i: FileText, t: 'Checklist e minutas', d: 'Documentos certos para o caso, procuração, declaração de hipossuficiência, consentimento LGPD e a petição inicial em .docx.' },
            { i: ShieldCheck, t: 'IA sem alucinação', d: 'Fundamentação restrita a um corpus aberto e verificável. Citação inexistente é bloqueada no servidor.' },
          ].map(({ i: Icone, t, d }) => (
            <div key={t} className="card p-5 flex gap-3">
              <Icone className="w-6 h-6 text-navy-700 shrink-0" />
              <div>
                <p className="font-semibold text-ink-900">{t}</p>
                <p className="text-sm text-ink-700 mt-0.5">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
