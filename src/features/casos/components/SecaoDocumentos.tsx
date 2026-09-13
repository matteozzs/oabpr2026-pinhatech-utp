'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, ListChecks, MessageCircle, UserRound, FileText, Upload } from 'lucide-react';
import type { Caso, ItemChecklist } from '@/types';
import { ADVOGADO_DEMO, atualizarCaso, useMensagens, atualizarMensagem, atualizarDocumento, enviarMensagem } from '@/lib/store';
import { OBRIGATORIEDADE_LABEL } from '@/data/documentos';
import { Aviso, Carregando, RotuloIA, Secao } from '@/components/ui';
import { FontesCitadas, PainelAuditoria, TextoComLacunas, iaApi, type UseIA } from '@/features/ia';
import { DadosDaParte, baixarDocx, camposFaltantes, type TipoDocx } from '@/features/documentos';
import { cn, formatarDataHora } from '@/lib/utils';



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

  const mensagens = useMensagens(caso.id);
  const paraAnalise = mensagens.filter((m) => m.anexo && !m.anexo.documentoId && !m.anexo.analisado);
  const [docSelecionado, setDocSelecionado] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [lgpdDocUrl, setLgpdDocUrl] = useState<string | null>(null);

  async function uploadParaTriagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setEnviando(true);
    const form = new FormData();
    form.append('arquivo', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const { url } = await res.json();

      enviarMensagem({
        casoId: caso.id,
        texto: `Documento enviado manualmente pelo advogado: ${file.name}`,
        autorId: adv.id,
        tipo: 'advogado',
        lida: true,
        anexo: { nome: file.name, url, analisado: false }
      });
    } catch(err) {
      alert("Falha ao subir o arquivo");
    } finally {
      setEnviando(false);
    }
  }

  const itensExibicao = caso.documentos.map((doc) => {
    const itemIA = checklist?.itens.find((i) => i.documentoId === doc.id);
    return { doc, itemIA };
  });

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
        descricao="Lista de documentos padrão necessários. Opcionalmente, você pode subir arquivos avulsos para Classificação."
        acoes={
          <div className="flex gap-2">
            <label className={cn("btn-secondary cursor-pointer", enviando && "opacity-50")}>
              <Upload className="w-4 h-4" /> {enviando ? 'Subindo...' : 'Subir Arquivo'}
              <input type="file" className="hidden" onChange={uploadParaTriagem} disabled={enviando} />
            </label>
            <button className="btn-secondary" disabled={true} title="Desativado para revisão">
              <ListChecks className="w-4 h-4" /> Análise de Documentação
            </button>
          </div>
        }
      >
        {erro && (
          <div className="mb-3">
            <Aviso tipo="erro">{erro}</Aviso>
          </div>
        )}

        <div className="space-y-4">
          {paraAnalise.length > 0 && (
            <div className="space-y-3 bg-warn-50/50 p-4 rounded-xl border border-warn-200">
              <h3 className="font-semibold text-warn-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-warn-600" />
                Classificação Pendente ({paraAnalise.length})
              </h3>
              <ul className="grid gap-4 sm:grid-cols-2">
                {paraAnalise.map((m) => {
                  const pendentesDoCaso = caso.documentos;
                  const sel = docSelecionado[m.id] || '';

                  return (
                    <li key={m.id} className="rounded-xl border border-warn-200 bg-white p-3 flex flex-col gap-3">
                      <div className="flex gap-3">
                        {m.anexo?.url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={m.anexo.url} alt={m.anexo.nome} className="w-16 h-16 object-cover rounded shadow-sm shrink-0 border border-black/10" />
                        ) : (
                          <div className="w-16 h-16 bg-warn-100 flex items-center justify-center rounded shrink-0">
                            <FileText className="w-6 h-6 text-warn-600" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-ink-900 truncate" title={m.anexo?.nome}>{m.anexo?.nome}</p>
                          <p className="text-[11px] text-ink-500">{formatarDataHora(m.enviadoEm)}</p>
                          <p className="text-xs text-ink-700 mt-1 line-clamp-2" title={m.texto}>"{m.texto}"</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mt-auto">
                        <select
                          className="input py-1.5 text-xs w-full bg-white border-warn-200 focus:border-warn-400 focus:ring-warn-400"
                          value={sel}
                          onChange={(e) => setDocSelecionado({ ...docSelecionado, [m.id]: e.target.value })}
                        >
                          <option value="">— Selecione o documento —</option>
                          {pendentesDoCaso.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.nome} {d.status === 'recebido' ? '(Já recebido)' : ''}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2 justify-end">
                          <button
                            className="btn-secondary text-xs py-1 px-2"
                            onClick={() => {
                              atualizarMensagem(m.id, { anexo: { ...m.anexo!, analisado: true } });
                            }}
                          >
                            Descartar
                          </button>
                          <button
                            className="btn-primary text-xs py-1 px-2 bg-warn-600 hover:bg-warn-700 text-white"
                            disabled={!sel}
                            onClick={() => {
                              const dId = docSelecionado[m.id];
                              if (!dId) return;
                              
                              atualizarDocumento(
                                caso.id,
                                dId,
                                { status: 'recebido', arquivoNome: m.anexo?.nome, arquivoUrl: m.anexo?.url },
                                { tipo: 'documento', descricao: `Advogado classificou anexo avulso como documento.`, autor: 'advogado' }
                              );
                              
                              atualizarMensagem(m.id, { 
                                anexo: { ...m.anexo!, documentoId: dId, analisado: true } 
                              });
                            }}
                          >
                            Vincular
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <ul className="divide-y divide-ink-200 rounded-xl border border-ink-200 overflow-hidden">
            {itensExibicao.map(({ doc, itemIA }) => {
              const geravel = GERAVEIS.includes(doc.id as TipoDocx);
              const jaAssinado = doc.status === 'assinado';
              const recebido = doc.status === 'recebido';
              const ausente = doc.status === 'pendente' || doc.status === 'solicitado';

              let corBadge = ausente ? 'bg-danger-100 text-danger-600' : 'bg-ok-100 text-ok-600';
              let labelBadge = ausente ? 'ausente' : 'entregue';
              
              if (geravel && !jaAssinado) {
                corBadge = 'bg-danger-100 text-danger-600';
                labelBadge = 'ausente';
              } else if (doc.status === 'solicitado') {
                corBadge = 'bg-warn-100 text-warn-600';
                labelBadge = 'solicitado';
              }

              return (
                <li key={doc.id} className="p-3 bg-white">
                  <div className="flex gap-3">
                    <span className={cn('badge shrink-0 h-fit', corBadge)}>{labelBadge}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-ink-900">
                        {doc.nome}
                        <span className="ml-2 text-[11px] font-normal text-ink-500">
                          {OBRIGATORIEDADE_LABEL[doc.obrigatoriedade]} · {doc.status}
                        </span>
                      </p>
                      
                      {itemIA && (
                        <div className="text-sm text-ink-700 mt-1">
                          <TextoComLacunas texto={itemIA.porQue} className="font-sans text-sm leading-normal" fontes={checklist.fontesUtilizadas} />
                        </div>
                      )}
                      {(itemIA?.ondeObter || doc.ondeObter) && (
                        <p className="text-xs text-navy-900 mt-0.5">Onde obter: {itemIA?.ondeObter || doc.ondeObter}</p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-2">
                        {geravel && !jaAssinado && (podeGerar ? (
                          <button className="btn-primary text-xs py-1.5" onClick={() => gerar(doc.id as TipoDocx)} disabled={baixando !== null}>
                            <Download className="w-3.5 h-3.5" />
                            {baixando === doc.id ? 'Gerando…' : `Gerar ${doc.nome} (.docx)`}
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

                        {ausente && !geravel && !recebido && (
                          <Link href={`/advogado/chat/${caso.id}`} className="btn-secondary text-xs py-1.5">
                            <MessageCircle className="w-3.5 h-3.5" />
                            Pedir na conversa
                          </Link>
                        )}

                        {!geravel && recebido && doc.arquivoUrl && (
                          <div className="flex flex-col gap-2 w-full mt-2 p-3 bg-ink-50 rounded-lg border border-ink-200">
                            <div className="flex items-center gap-3">
                              <a href={doc.arquivoUrl} target="_blank" rel="noreferrer" className="shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={doc.arquivoUrl} alt={doc.nome} className="w-12 h-12 object-cover rounded border border-ink-300" />
                              </a>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-ink-900">Anexo vinculado</p>
                                <div className="flex gap-3">
                                  <a href={doc.arquivoUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">
                                    Ver original
                                  </a>
                                  <button onClick={() => setLgpdDocUrl(doc.arquivoUrl!)} className="text-xs text-primary-600 hover:underline">
                                    Baixar
                                  </button>
                                </div>
                              </div>
                              <button
                                className="btn-secondary text-xs py-1 px-2 shrink-0"
                                onClick={() => {
                                  atualizarDocumento(
                                    caso.id,
                                    doc.id,
                                    { status: 'pendente', arquivoNome: undefined, arquivoUrl: undefined },
                                    { tipo: 'documento', descricao: `Advogado desfez o vínculo do documento.`, autor: 'advogado' }
                                  );
                                  const msg = mensagens.find(m => m.anexo?.documentoId === doc.id);
                                  if (msg) {
                                    atualizarMensagem(msg.id, {
                                      anexo: { ...msg.anexo!, documentoId: undefined, analisado: false }
                                    });
                                  }
                                }}
                              >
                                Desfazer e triar
                              </button>
                            </div>
                          </div>
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

          {checklist && checklist.documentosEspecificosDoCaso.length > 0 && (
            <div>
              <p className="label">Documentos específicos sugeridos (IA)</p>
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

          {checklist && (
            <>
              <FontesCitadas fontes={checklist.fontesUtilizadas} />
              <RotuloIA modelo={checklist.modelo} quando={checklist.geradoEm} />
              <PainelAuditoria meta={ia.metas.checklist} />
            </>
          )}
        </div>
      </Secao>

      {lgpdDocUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-ink-900 mb-2">Termo de Responsabilidade</h3>
            <p className="text-sm text-ink-600 mb-6 leading-relaxed">
              Ao baixar este documento, você declara estar ciente de que ele contém dados sensíveis e concorda em tratá-los exclusivamente para os fins deste processo judicial, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn-secondary" onClick={() => setLgpdDocUrl(null)}>Cancelar</button>
              <a 
                href={lgpdDocUrl} 
                download 
                target="_blank" 
                rel="noreferrer" 
                className="btn-primary" 
                onClick={() => setLgpdDocUrl(null)}
              >
                Concordar e Baixar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
