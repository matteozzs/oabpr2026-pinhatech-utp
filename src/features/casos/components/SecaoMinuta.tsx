'use client';

import { useState } from 'react';
import { Download, Gavel } from 'lucide-react';
import type { Caso, Minuta } from '@/types';
import { ADVOGADO_DEMO, atualizarCaso } from '@/lib/store';
import { Aviso, Carregando, RotuloIA, Secao } from '@/components/ui';
import { FontesCitadas, PainelAuditoria, TextoComLacunas, iaApi, type UseIA } from '@/features/ia';
import { baixarDocx } from '@/features/documentos';

/** Passo 3: a minuta. Cada citação é validada no servidor contra o corpus antes de chegar aqui. */
export function SecaoMinuta({ caso, ia }: { caso: Caso; ia: UseIA }) {
  const minuta = caso.ia.minuta;
  const resumo = caso.ia.resumo;
  const rodando = ia.ocupado === 'minuta';
  const [baixando, setBaixando] = useState(false);
  const [erroDocx, setErroDocx] = useState<string | null>(null);

  async function gerar() {
    const r = await ia.executar('minuta', () => iaApi.pedirMinuta(caso, resumo, caso.ia.checklist));
    if (!r) return;
    atualizarCaso(
      caso.id,
      (c) => ({
        ia: { ...c.ia, minuta: r },
        status: ['pronto_protocolo', 'protocolado'].includes(c.status) ? c.status : 'minuta_gerada',
      }),
      {
        tipo: 'ia',
        descricao: `Minuta da petição inicial gerada pela IA (${r.modelo}) com ${r.fontesUtilizadas.length} fontes validadas.`,
        autor: 'ia',
      },
    );
  }

  async function baixar() {
    setBaixando(true);
    setErroDocx(null);
    try {
      await baixarDocx('peticao_inicial', caso, caso.advogado ?? ADVOGADO_DEMO, minuta);
    } catch (e) {
      setErroDocx(e instanceof Error ? e.message : 'Falha ao gerar o .docx.');
    } finally {
      setBaixando(false);
    }
  }

  return (
    <Secao
      id="minuta"
      titulo="Minuta da petição inicial"
      descricao="Estruturada pela IA com fundamentação restrita ao corpus. Cada citação é validada no servidor."
      acoes={
        <>
          <button className="btn-primary" onClick={gerar} disabled={ia.ocupado !== null || resumo?.foraDoEscopo}>
            <Gavel className="w-4 h-4" /> {minuta ? 'Regerar minuta' : 'Gerar minuta com IA'}
          </button>
          {minuta && (
            <button className="btn-secondary" onClick={baixar} disabled={baixando}>
              <Download className="w-4 h-4" /> {baixando ? 'Gerando…' : 'Baixar .docx'}
            </button>
          )}
        </>
      }
    >
      {erroDocx && (
        <div className="mb-3">
          <Aviso tipo="erro">{erroDocx}</Aviso>
        </div>
      )}

      {rodando && <Carregando texto="Recuperando dispositivos, redigindo e validando citações… (até 30s)" />}

      {minuta && !rodando && (
        <div className="space-y-5">
          <DeclaracaoDeLacunas minuta={minuta} />
          <CorpoDaMinuta minuta={minuta} />
          <FontesCitadas fontes={minuta.fontesUtilizadas} titulo="Fontes citadas na minuta (validadas contra o corpus)" />
          <RotuloIA modelo={minuta.modelo} quando={minuta.geradoEm} />
          <PainelAuditoria meta={ia.metas.minuta} />
        </div>
      )}

      {!minuta && !rodando && (
        <p className="text-sm text-ink-500">
          {resumo ? 'Gere a minuta quando o resumo estiver revisado. O checklist melhora o resultado.' : 'Gere o resumo fático primeiro — ele orienta a minuta.'}
        </p>
      )}
    </Secao>
  );
}

/** O que a IA declarou não saber — o coração do controle de alucinação, em destaque. */
function DeclaracaoDeLacunas({ minuta }: { minuta: Minuta }) {
  if (!minuta.lacunas.length && !minuta.fundamentacaoNaoLocalizada.length) return null;

  return (
    <Aviso tipo="alerta">
      <p className="font-semibold mb-1">A IA declarou o que não sabe:</p>
      {minuta.lacunas.length > 0 && (
        <>
          <p className="text-xs uppercase font-semibold mt-1">Lacunas a preencher na entrevista ({minuta.lacunas.length})</p>
          <ul className="list-disc ml-4">
            {minuta.lacunas.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </>
      )}
      {minuta.fundamentacaoNaoLocalizada.length > 0 && (
        <>
          <p className="text-xs uppercase font-semibold mt-2">Fundamentação não localizada no corpus ({minuta.fundamentacaoNaoLocalizada.length})</p>
          <ul className="list-disc ml-4">
            {minuta.fundamentacaoNaoLocalizada.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </>
      )}
    </Aviso>
  );
}

function CorpoDaMinuta({ minuta }: { minuta: Minuta }) {
  const f = minuta.fontesUtilizadas;
  const temTutela = Boolean(minuta.tutelaUrgencia);

  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-8 space-y-4">
      <p className="prose-minuta font-bold text-center">{minuta.enderecamento}</p>
      <TextoComLacunas texto={minuta.qualificacaoAutor} fontes={f} />
      <p className="prose-minuta">vem, por seu(sua) advogado(a) dativo(a), propor a presente</p>
      <p className="prose-minuta font-bold text-center">{minuta.classeProcessual}</p>
      <TextoComLacunas texto={`em face de ${minuta.qualificacaoReu}, pelos fatos e fundamentos a seguir.`} fontes={f} />

      <h3 className="font-bold">I — DA GRATUIDADE DA JUSTIÇA</h3>
      <TextoComLacunas texto={minuta.gratuidade} fontes={f} />

      <h3 className="font-bold">II — DOS FATOS</h3>
      <TextoComLacunas texto={minuta.fatos} fontes={f} />

      <h3 className="font-bold">III — DO DIREITO</h3>
      <TextoComLacunas texto={minuta.direito} fontes={f} />

      {temTutela && (
        <>
          <h3 className="font-bold">IV — DA TUTELA DE URGÊNCIA</h3>
          <TextoComLacunas texto={minuta.tutelaUrgencia!} fontes={f} />
        </>
      )}

      <h3 className="font-bold">{temTutela ? 'V' : 'IV'} — DOS PEDIDOS</h3>
      <ol className="prose-minuta list-[lower-alpha] ml-6 space-y-1">
        {minuta.pedidos.map((p, i) => (
          <li key={i}>
            <TextoComLacunas texto={p} className="inline" fontes={f} />
          </li>
        ))}
      </ol>

      <h3 className="font-bold">{temTutela ? 'VI' : 'V'} — DAS PROVAS</h3>
      <TextoComLacunas texto={minuta.provas} fontes={f} />

      <h3 className="font-bold">DO VALOR DA CAUSA</h3>
      <TextoComLacunas texto={minuta.valorCausa} fontes={f} />

      <TextoComLacunas texto={minuta.fechamento} fontes={f} />
    </article>
  );
}
