'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, ListChecks, MessageCircle, UserRound } from 'lucide-react';
import type { Caso, ItemChecklist } from '@/types';
import { ADVOGADO_DEMO, atualizarCaso } from '@/lib/store';
import { OBRIGATORIEDADE_LABEL } from '@/data/documentos';
import { Aviso, Carregando, RotuloIA, Secao } from '@/components/ui';
import { FontesCitadas, PainelAuditoria, TextoComLacunas, iaApi, type UseIA } from '@/features/ia';
import { BaixarArquivoPessoal, DadosDaParte, baixarDocx, camposFaltantes, type TipoDocx } from '@/features/documentos';
import { cn } from '@/lib/utils';

const COR_SITUACAO: Record<ItemChecklist['situacao'], string> = {
  presente: 'bg-ok-100 text-ok-600',
  ausente: 'bg-danger-100 text-danger-600',
  a_confirmar: 'bg-warn-100 text-warn-600',
  gerar_na_plataforma: 'bg-navy-100 text-navy-900',
};

const ROTULO_SITUACAO: Record<ItemChecklist['situacao'], string> = {
  presente: 'entregue',
  ausente: 'ausente',
  a_confirmar: 'a confirmar',
  gerar_na_plataforma: 'gerar aqui',
};

const GERAVEIS: TipoDocx[] = ['procuracao', 'declaracao_hipossuficiencia', 'consentimento_dados'];

/**
 * Documentos do caso: qualificação da parte + checklist da IA + geração efetiva.
 *
 * Cada item do checklist tem uma ação real:
 * - o que a plataforma gera → botão que gera o .docx, habilitado só com os dados completos;
 * - o que falta ou precisa confirmar → botão que leva à conversa para pedir à parte.
 */
export function SecaoDocumentos({ caso, ia }: { caso: Caso; ia: UseIA }) {
  const checklist = caso.ia.checklist;
  const rodando = ia.ocupado === 'checklist';
  const [erro, setErro] = useState<string | null>(null);
  const [baixando, setBaixando] = useState<string | null>(null);

  const faltamDados = camposFaltantes(caso.assistido);
  const podeGerar = faltamDados.length === 0;
  const adv = caso.advogado ?? ADVOGADO_DEMO;

  async function gerarChecklist() {
    const r = await ia.executar('checklist', () => iaApi.pedirChecklist(caso, caso.ia.resumo));
    if (!r) return;
    atualizarCaso(
      caso.id,
      (c) => ({
        ia: { ...c.ia, checklist: r },
        documentos: c.documentos.map((d) => {
          const item = r.itens.find((i) => i.documentoId === d.id);
          return item ? { ...d, observacaoIA: item.porQue } : d;
        }),
      }),
      { tipo: 'ia', descricao: `Checklist documental gerado pela IA (${r.modelo}).`, autor: 'ia' },
    );
  }

  async function gerar(tipo: TipoDocx) {
    setBaixando(tipo);
    setErro(null);
    try {
      await baixarDocx(tipo, caso, adv);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao gerar o documento.');
    } finally {
      setBaixando(null);
    }
  }

  return (
    <div className="space-y-4">
      <DadosDaParte caso={caso} />

      <Secao
        titulo="Documentos do caso"
        descricao="A IA cruza o que foi apurado com o catálogo e diz o que gerar aqui e o que pedir à parte."
        acoes={
          <button className="btn-primary" onClick={gerarChecklist} disabled={ia.ocupado !== null}>
            <ListChecks className="w-4 h-4" /> {checklist ? 'Recalcular' : 'Gerar checklist com IA'}
          </button>
        }
      >
        {erro && (
          <div className="mb-3">
            <Aviso tipo="erro">{erro}</Aviso>
          </div>
        )}

        {rodando && <Carregando texto="Cruzando o caso com o catálogo de documentos…" />}

        {!checklist && !rodando && (
          <p className="text-sm text-ink-500">
            Gere o checklist para saber exatamente o que a plataforma emite e o que precisa ser pedido à parte.
            {!caso.ia.resumo && ' O resumo fático melhora o resultado — gere-o antes, na conversa.'}
          </p>
        )}

        {checklist && !rodando && (
          <div className="space-y-4">
            <ul className="divide-y divide-ink-200 rounded-xl border border-ink-200 overflow-hidden">
              {checklist.itens.map((i) => {
                const doc = caso.documentos.find((x) => x.id === i.documentoId);
                const geravel = GERAVEIS.includes(i.documentoId as TipoDocx);
                const jaAssinado = doc?.status === 'assinado';

                return (
                  <li key={i.documentoId} className="p-3 bg-white">
                    <div className="flex gap-3">
                      <span className={cn('badge shrink-0 h-fit', COR_SITUACAO[i.situacao])}>{ROTULO_SITUACAO[i.situacao]}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-ink-900">
                          {i.nome}
                          {doc && (
                            <span className="ml-2 text-[11px] font-normal text-ink-500">
                              {OBRIGATORIEDADE_LABEL[doc.obrigatoriedade]} · {doc.status}
                            </span>
                          )}
                        </p>
                        <div className="text-sm text-ink-700">
                          <TextoComLacunas texto={i.porQue} className="font-sans text-sm leading-normal" fontes={checklist.fontesUtilizadas} />
                        </div>
                        {i.ondeObter && <p className="text-xs text-navy-900 mt-0.5">Onde obter: {i.ondeObter}</p>}

                        <div className="mt-2 flex flex-wrap gap-2">
                          {/* O que a plataforma emite: botão real, condicionado aos dados */}
                          {geravel &&
                            !jaAssinado &&
                            (podeGerar ? (
                              <button className="btn-primary text-xs py-1.5" onClick={() => gerar(i.documentoId as TipoDocx)} disabled={baixando !== null}>
                                <Download className="w-3.5 h-3.5" />
                                {baixando === i.documentoId ? 'Gerando…' : `Gerar ${i.nome} (.docx)`}
                              </button>
                            ) : (
                              <a className="btn-secondary text-xs py-1.5" href="#dados-da-parte">
                                <UserRound className="w-3.5 h-3.5" /> Completar dados da parte ({faltamDados.length})
                              </a>
                            ))}

                          {geravel && jaAssinado && (
                            <span className="badge bg-ok-100 text-ok-600 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> assinado pela parte
                            </span>
                          )}

                          {/* Arquivo que a parte enviou: baixar passa a guarda para o advogado, e o aviso vem antes. */}
                          {doc && !doc.geradoPelaPlataforma && ['recebido', 'assinado'].includes(doc.status) && (
                            <BaixarArquivoPessoal
                              caso={caso}
                              nomeArquivo={doc.arquivoNome ?? `${doc.nome} (enviado pela parte)`}
                              documentoId={doc.id}
                            />
                          )}

                          {/* O que depende da parte: direcionamento para a conversa */}
                          {(i.situacao === 'ausente' || i.situacao === 'a_confirmar') && !geravel && (
                            <Link href={`/advogado/chat/${caso.id}`} className="btn-secondary text-xs py-1.5">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {i.situacao === 'ausente' ? 'Pedir na conversa' : 'Confirmar na conversa'}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {!podeGerar && (
              <Aviso tipo="alerta">
                Faltam <strong>{faltamDados.length}</strong> dados da parte para emitir os documentos sem lacuna: {faltamDados.join(', ')}.{' '}
                <a className="underline font-semibold" href="#dados-da-parte">
                  Completar agora
                </a>
              </Aviso>
            )}

            {checklist.documentosEspecificosDoCaso.length > 0 && (
              <div>
                <p className="label">Documentos específicos deste caso</p>
                <ul className="space-y-2">
                  {checklist.documentosEspecificosDoCaso.map((d, k) => (
                    <li key={k} className="rounded-xl border border-ink-200 p-3 flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-ink-900">{d.nome}</p>
                        <p className="text-sm text-ink-700">{d.porQue}</p>
                      </div>
                      <Link href={`/advogado/chat/${caso.id}`} className="btn-secondary text-xs py-1.5 shrink-0">
                        <MessageCircle className="w-3.5 h-3.5" /> Pedir na conversa
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <FontesCitadas fontes={checklist.fontesUtilizadas} />
            <RotuloIA modelo={checklist.modelo} quando={checklist.geradoEm} />
            <PainelAuditoria meta={ia.metas.checklist} />
          </div>
        )}
      </Secao>
    </div>
  );
}
