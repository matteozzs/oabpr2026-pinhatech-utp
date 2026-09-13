'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, FlaskConical, RotateCcw, ShieldCheck } from 'lucide-react';
import { entrarComo, limparCasosDeTeste, removerMensagensDosCasos, useCasos, usePerfil } from '@/lib/store';
import { Aviso, Secao } from '@/components/ui';
import { CENARIOS, CartaoCenario, CenarioLivre } from '@/features/auditoria';

/**
 * Banco de cenários — bancada de testes da IA.
 *
 * Não faz parte do fluxo do produto: existe para que um auditor monte o caso que quiser,
 * abra como advogado e observe o comportamento do agente. Cada cenário pronto exercita um
 * mecanismo específico de controle de alucinação, com o resultado esperado declarado antes.
 */
export default function AuditoriaPage() {
  const perfil = usePerfil();
  const { casos, pronto } = useCasos();
  const [limpou, setLimpou] = useState<number | null>(null);

  useEffect(() => {
    if (perfil !== 'advogado') entrarComo('advogado');
  }, [perfil]);

  const deTeste = casos.filter((c) => c.cenarioTeste);

  function limpar() {
    const ids = deTeste.map((c) => c.id);
    removerMensagensDosCasos(ids);
    limparCasosDeTeste();
    setLimpou(ids.length);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="badge bg-warn-100 text-warn-600 mb-3 inline-flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5" /> Bancada de testes — fora do fluxo do produto
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950">Banco de cenários</h1>
        <p className="text-ink-700 mt-2 max-w-3xl">
          Cada cenário monta um caso e uma conversa que colocam à prova um mecanismo de controle de alucinação. Crie o cenário, abra a
          conversa como advogado, gere o resumo fático — e compare o que aconteceu com o comportamento esperado, declarado antes do teste.
        </p>
      </div>

      <Aviso tipo="info">
        <strong>Como usar.</strong> O resumo fático nasce <strong>dentro da conversa</strong>, a partir do relato inicial somado às falas
        da parte. Depois dele, siga para <em>Documentos</em> e <em>Minuta</em> no painel do caso. O{' '}
        <strong>Painel de auditoria da IA</strong>, no fim de cada seção, mostra os dispositivos que o RAG entregou ao modelo, a pontuação
        de cada um e as citações bloqueadas pelo servidor. Roteiro completo em{' '}
        <a
          href="https://github.com/matteozzs/oabpr2026-pinhatech-utp/blob/main/docs/auditoria-ia.md"
          target="_blank"
          rel="noreferrer"
          className="underline font-semibold"
        >
          docs/auditoria-ia.md
        </a>
        .
      </Aviso>

      <Secao
        titulo={`Cenários prontos (${CENARIOS.length})`}
        descricao="Cada um com o que testa, o comportamento correto e o que caracteriza falha."
        acoes={
          <Link href="/transparencia" className="btn-secondary text-xs">
            <ShieldCheck className="w-3.5 h-3.5" /> Ver o corpus
          </Link>
        }
      >
        <ul className="grid md:grid-cols-2 gap-4">
          {CENARIOS.map((c) => (
            <CartaoCenario key={c.id} cenario={c} />
          ))}
        </ul>
      </Secao>

      <CenarioLivre />

      <Secao titulo="Limpeza" descricao="Os casos criados aqui ficam no seu navegador, junto com os de demonstração.">
        {limpou !== null && (
          <div className="mb-3">
            <Aviso tipo="ok">{limpou} caso(s) de teste removido(s). Os casos de demonstração continuam intactos.</Aviso>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-secondary" onClick={limpar} disabled={!pronto || deTeste.length === 0}>
            <RotateCcw className="w-4 h-4" /> Remover cenários de teste ({deTeste.length})
          </button>
          <Link href="/advogado/dashboard" className="btn-ghost text-sm">
            Ir para os atendimentos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Secao>
    </div>
  );
}
