'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, Eye, Gavel, Pencil } from 'lucide-react';
import type { Caso, Minuta } from '@/types';
import { ADVOGADO_DEMO, atualizarCaso } from '@/lib/store';
import { Aviso, Carregando, RotuloIA, Secao } from '@/components/ui';
import { FontesCitadas, PainelAuditoria, TextoComLacunas, iaApi, type UseIA } from '@/features/ia';
import { baixarDocx, lacunasDaMinuta } from '@/features/documentos';
import { agoraISO } from '@/lib/utils';

type CampoTexto = 'enderecamento' | 'classeProcessual' | 'qualificacaoAutor' | 'qualificacaoReu' | 'gratuidade' | 'fatos' | 'direito' | 'tutelaUrgencia' | 'valorCausa' | 'provas' | 'fechamento';

const CAMPOS: { campo: CampoTexto; rotulo: string; linhas: number }[] = [
  { campo: 'enderecamento', rotulo: 'Endereçamento', linhas: 2 },
  { campo: 'classeProcessual', rotulo: 'Classe processual', linhas: 2 },
  { campo: 'qualificacaoAutor', rotulo: 'Qualificação do autor', linhas: 4 },
  { campo: 'qualificacaoReu', rotulo: 'Qualificação do réu', linhas: 3 },
  { campo: 'gratuidade', rotulo: 'I — Da gratuidade da justiça', linhas: 4 },
  { campo: 'fatos', rotulo: 'II — Dos fatos', linhas: 8 },
  { campo: 'direito', rotulo: 'III — Do direito', linhas: 8 },
  { campo: 'tutelaUrgencia', rotulo: 'Da tutela de urgência', linhas: 4 },
  { campo: 'valorCausa', rotulo: 'Do valor da causa', linhas: 2 },
  { campo: 'provas', rotulo: 'Das provas', linhas: 3 },
  { campo: 'fechamento', rotulo: 'Fechamento', linhas: 3 },
];

/**
 * Minuta da petição inicial: gerada pela IA, **editável pelo advogado** e só marcável
 * como revisada quando não restar nenhum marcador de lacuna no texto.
 */
export function SecaoMinuta({ caso, ia }: { caso: Caso; ia: UseIA }) {
  const minuta = caso.ia.minuta;
  const resumo = caso.ia.resumo;
  const rodando = ia.ocupado === 'minuta';

  // `rascunho` só existe enquanto o advogado edita — assim não há estado duplicado
  // para sincronizar quando a minuta é regerada.
  const [rascunho, setRascunho] = useState<Minuta | null>(null);
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const editando = rascunho !== null;
  const lacunas = lacunasDaMinuta(caso);

  async function gerar() {
    const r = await ia.executar('minuta', () => iaApi.pedirMinuta(caso, resumo, caso.ia.checklist));
    if (!r) return;
    atualizarCaso(
      caso.id,
      (c) => ({
        ia: { ...c.ia, minuta: r },
        status: ['pronto_protocolo', 'protocolado'].includes(c.status) ? c.status : 'minuta_gerada',
      }),
      { tipo: 'ia', descricao: `Minuta gerada pela IA (${r.modelo}) com ${r.fontesUtilizadas.length} fontes validadas.`, autor: 'ia' },
    );
    setRascunho(null);
  }

  function salvarEdicao() {
    if (!rascunho) return;
    atualizarCaso(caso.id, (c) => ({ ia: { ...c.ia, minuta: { ...rascunho, editadaEm: agoraISO(), revisadaEm: undefined } } }), {
      tipo: 'minuta',
      descricao: 'Minuta editada pelo advogado.',
      autor: 'advogado',
    });
    setRascunho(null);
  }

  function marcarRevisada() {
    atualizarCaso(caso.id, (c) => (c.ia.minuta ? { ia: { ...c.ia, minuta: { ...c.ia.minuta, revisadaEm: agoraISO() } } } : {}), {
      tipo: 'minuta',
      descricao: 'Minuta conferida e marcada como revisada pelo advogado.',
      autor: 'advogado',
    });
  }

  async function baixar() {
    setBaixando(true);
    setErro(null);
    try {
      await baixarDocx('peticao_inicial', caso, caso.advogado ?? ADVOGADO_DEMO, minuta);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao gerar o .docx.');
    } finally {
      setBaixando(false);
    }
  }

  return (
    <Secao
      titulo="Minuta da petição inicial"
      descricao="Fundamentação restrita ao corpus, cada citação validada no servidor. Você pode editar antes de conferir."
      acoes={
        <>
          <button className="btn-primary" onClick={gerar} disabled={ia.ocupado !== null || resumo?.foraDoEscopo}>
            <Gavel className="w-4 h-4" /> {minuta ? 'Regerar' : 'Gerar minuta com IA'}
          </button>
          {minuta && (
            <>
              <button className="btn-secondary" onClick={() => (editando ? salvarEdicao() : setRascunho(minuta))}>
                {editando ? <CheckCircle2 className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                {editando ? 'Salvar edição' : 'Editar'}
              </button>
              <button className="btn-secondary" onClick={baixar} disabled={baixando}>
                <Download className="w-4 h-4" /> {baixando ? 'Gerando…' : 'Baixar .docx'}
              </button>
            </>
          )}
        </>
      }
    >
      {erro && (
        <div className="mb-3">
          <Aviso tipo="erro">{erro}</Aviso>
        </div>
      )}

      {rodando && <Carregando texto="Recuperando dispositivos, redigindo e validando citações… (até 30s)" />}

      {!minuta && !rodando && (
        <p className="text-sm text-ink-500">
          {resumo
            ? 'Gere a minuta quando o resumo estiver revisado. O checklist de documentos melhora o resultado.'
            : 'Gere o resumo fático primeiro, na conversa com a parte — ele orienta a minuta.'}
        </p>
      )}

      {minuta && !rodando && (
        <div className="space-y-5">
          <PainelDeConferencia caso={caso} lacunas={lacunas} onRevisar={marcarRevisada} />

          {editando && rascunho ? (
            <div className="space-y-3">
              {CAMPOS.filter((c) => c.campo !== 'tutelaUrgencia' || rascunho.tutelaUrgencia !== undefined).map(({ campo, rotulo, linhas }) => (
                <div key={campo}>
                  <label className="label" htmlFor={`m-${campo}`}>
                    {rotulo}
                  </label>
                  <textarea
                    id={`m-${campo}`}
                    className="input font-serif text-[15px] leading-7"
                    rows={linhas}
                    value={rascunho[campo] ?? ''}
                    onChange={(e) => setRascunho({ ...rascunho, [campo]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label className="label">Pedidos (um por linha)</label>
                <textarea
                  className="input font-serif text-[15px] leading-7"
                  rows={Math.max(4, rascunho.pedidos.length + 1)}
                  value={rascunho.pedidos.join('\n')}
                  onChange={(e) => setRascunho({ ...rascunho, pedidos: e.target.value.split('\n').filter((l) => l.trim()) })}
                />
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={salvarEdicao}>
                  <CheckCircle2 className="w-4 h-4" /> Salvar edição
                </button>
                <button className="btn-ghost" onClick={() => setRascunho(null)}>
                  Descartar
                </button>
              </div>
            </div>
          ) : (
            <CorpoDaMinuta minuta={minuta} />
          )}

          <FontesCitadas fontes={minuta.fontesUtilizadas} titulo="Fontes citadas na minuta (validadas contra o corpus)" />
          <RotuloIA modelo={minuta.modelo} quando={minuta.geradoEm} />
          {minuta.editadaEm && (
            <p className="text-[11px] text-ink-500 -mt-1">
              Editada pelo advogado em {new Date(minuta.editadaEm).toLocaleString('pt-BR')}.
            </p>
          )}
          <PainelAuditoria meta={ia.metas.minuta} />
        </div>
      )}
    </Secao>
  );
}

/** Estado de conferência: a minuta só pode ser dada por correta sem lacunas no texto. */
function PainelDeConferencia({ caso, lacunas, onRevisar }: { caso: Caso; lacunas: string[]; onRevisar: () => void }) {
  const minuta = caso.ia.minuta!;
  const naoLocalizada = minuta.fundamentacaoNaoLocalizada;

  if (minuta.revisadaEm && lacunas.length === 0) {
    return (
      <Aviso tipo="ok">
        <span className="inline-flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            <strong>Minuta conferida.</strong> Revisada em {new Date(minuta.revisadaEm).toLocaleString('pt-BR')} — sem lacunas pendentes.
          </span>
        </span>
      </Aviso>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-warn-100 p-4 text-sm text-warn-600 space-y-3">
      <p className="font-semibold inline-flex items-center gap-1.5">
        <AlertTriangle className="w-4 h-4" />
        {lacunas.length > 0 ? `${lacunas.length} lacuna(s) a preencher antes de conferir` : 'Pronta para conferência'}
      </p>

      {lacunas.length > 0 && (
        <>
          <p>Edite a minuta e substitua cada marcador pelo dado real. Enquanto restar um, ela não pode ser dada por correta.</p>
          <ul className="flex flex-wrap gap-1.5">
            {lacunas.map((l, i) => (
              <li key={i} className="lacuna text-xs">
                {l}
              </li>
            ))}
          </ul>
        </>
      )}

      {naoLocalizada.length > 0 && (
        <div>
          <p className="text-xs uppercase font-semibold">Fundamentação não localizada no corpus ({naoLocalizada.length})</p>
          <ul className="list-disc ml-4">
            {naoLocalizada.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}

      <button className="btn-primary text-xs" onClick={onRevisar} disabled={lacunas.length > 0}>
        <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como revisada
      </button>
    </div>
  );
}

function CorpoDaMinuta({ minuta }: { minuta: Minuta }) {
  const f = minuta.fontesUtilizadas;
  const temTutela = Boolean(minuta.tutelaUrgencia);

  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-8 space-y-4">
      <p className="text-xs text-ink-500 inline-flex items-center gap-1.5 -mt-1">
        <Eye className="w-3.5 h-3.5" /> Visualização — use “Editar” para alterar o texto
      </p>
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
