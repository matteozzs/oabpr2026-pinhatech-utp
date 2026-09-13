import Link from 'next/link';
import { BookOpen, ExternalLink, FileCode2, ShieldCheck } from 'lucide-react';
import { carregarCorpus } from '@/lib/ia/rag';
import { iaConfigurada } from '@/lib/ia/provider';

const REPO = 'https://github.com/matteozzs/oabpr2026-pinhatech-utp/blob/main';

/** Página de transparência: mostra o corpus e os prompts que governam a IA, para auditoria. */
export default function TransparenciaPage() {
  const corpus = carregarCorpus();
  const porDiploma = new Map<string, typeof corpus.dispositivos>();
  for (const d of corpus.dispositivos) {
    porDiploma.set(d.diploma, [...(porDiploma.get(d.diploma) ?? []), d]);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950 inline-flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-navy-700" /> Transparência da IA
        </h1>
        <p className="text-ink-700 mt-1">
          Tudo que a IA pode citar está nesta página. Tudo que a IA é instruída a fazer está em arquivos Markdown públicos. Nada é caixa-preta.
        </p>
      </div>

      <section className="grid sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-2xl font-black text-navy-900">{corpus.dispositivos.length}</p>
          <p className="text-xs text-ink-700">dispositivos no corpus fechado</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-black text-navy-900">{corpus.dispositivos.filter((d) => d.verificado).length}</p>
          <p className="text-xs text-ink-700">conferidos contra a fonte oficial (em andamento)</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-black text-navy-900">{iaConfigurada() ? 'ativa' : 'inativa'}</p>
          <p className="text-xs text-ink-700">IA neste ambiente</p>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-ink-900 inline-flex items-center gap-2 mb-3">
          <FileCode2 className="w-5 h-5 text-navy-700" /> Os prompts (o agente)
        </h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {[
            ['00-sistema-base.md', 'Persona, escopo, regras de grounding e anti-alucinação'],
            ['01-resumo-fatico.md', 'Síntese executiva para o advogado se apropriar do caso'],
            ['02-checklist-documental.md', 'Pendências documentais'],
            ['03-minuta-peticao-inicial.md', 'Petição inicial com citação por id'],
            ['04-mensagem-assistido.md', 'Mensagem acessível ao cidadão'],
          ].map(([arq, desc]) => (
            <li key={arq} className="rounded-xl border border-ink-200 p-3">
              <a href={`${REPO}/prompts/${arq}`} target="_blank" rel="noreferrer" className="font-mono text-navy-700 underline inline-flex items-center gap-1">
                prompts/{arq} <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-ink-700 mt-0.5">{desc}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-700 mt-4">
          Para testar na prática, entre como advogado e use os atendimentos de demonstração. O protocolo{' '}
          <span className="font-mono">OD-2026-100007</span> chega em branco, sem relato e sem conversa, para o avaliador montar o caso que
          quiser e observar o comportamento da IA.
        </p>
        <p className="text-sm text-ink-700 mt-2">
          Como funciona o controle de alucinação, passo a passo:{' '}
          <a href={`${REPO}/docs/auditoria-ia.md`} target="_blank" rel="noreferrer" className="text-navy-700 underline">
            docs/auditoria-ia.md
          </a>
          .
        </p>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-ink-900 inline-flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-navy-700" /> O corpus (a única fonte de fundamentação)
        </h2>
        <p className="text-sm text-ink-700 mb-4">
          Versão {corpus._meta.versao}, atualizado em {corpus._meta.atualizado_em}. Arquivo aberto:{' '}
          <a href={`${REPO}/knowledge/corpus.json`} target="_blank" rel="noreferrer" className="text-navy-700 underline">
            knowledge/corpus.json
          </a>
          . Itens marcados como “a verificar” aguardam conferência das pessoas do Direito.
        </p>
        <div className="space-y-5">
          {Array.from(porDiploma.entries()).map(([diploma, itens]) => (
            <div key={diploma}>
              <h3 className="font-semibold text-ink-900 mb-2">
                {diploma} <span className="text-ink-500 font-normal text-sm">({itens.length})</span>
              </h3>
              <ul className="space-y-1.5">
                {itens.map((d) => (
                  <li key={d.id} className="rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] bg-navy-100 text-navy-900 rounded px-1.5 py-0.5">{d.id}</span>
                      <span className="font-medium text-ink-900">{d.dispositivo}</span>
                      <span className={`badge ${d.verificado ? 'bg-ok-100 text-ok-600' : 'bg-warn-100 text-warn-600'}`}>{d.verificado ? 'verificado' : 'a verificar'}</span>
                      <span className="text-[11px] text-ink-500">{d.areas.join(', ')}</span>
                    </div>
                    <p className="font-serif text-ink-700 leading-relaxed">“{d.texto}”</p>
                    {d.nota && <p className="text-xs text-ink-500 mt-1">Nota: {d.nota}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm text-ink-700">
        <Link href="/roadmap" className="text-navy-700 underline">
          Roadmap
        </Link>{' '}
        · A verificação jurídica integral do corpus é o primeiro item.
      </p>
    </div>
  );
}
