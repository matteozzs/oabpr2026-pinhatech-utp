'use client';

import { useState } from 'react';
import { CheckCircle2, Download, FileSignature, Printer, ShieldCheck, Upload } from 'lucide-react';
import type { Caso, MetodoAssinatura } from '@/types';
import { ADVOGADO_DEMO, atualizarDocumento, registrarAssinatura } from '@/lib/store';
import { agoraISO, sha256 } from '@/lib/utils';
import { Aviso } from '@/components/ui';
import { baixarDocx, type TipoDocx } from '../api';

const TIPO_POR_DOC: Record<string, TipoDocx> = {
  procuracao: 'procuracao',
  declaracao_hipossuficiencia: 'declaracao_hipossuficiencia',
  consentimento_dados: 'consentimento_dados',
};

const ROTULO_METODO: Record<MetodoAssinatura, string> = {
  assinatura_digital_plataforma: 'assinatura digital da plataforma (simulação)',
  gov_br: 'gov.br (roadmap)',
  impressao_digitalizacao: 'impressão + digitalização/foto',
};

/**
 * Assinatura pelo assistido. "Assinatura digital" aqui é SIMULAÇÃO: registra aceite com hash
 * SHA-256 + carimbo de tempo. A opção gov.br é apenas ilustrativa (roadmap). Impressão + foto
 * marca o documento como recebido para upload.
 */
export function Assinatura({ caso }: { caso: Caso }) {
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [govbr, setGovbr] = useState<string | null>(null);
  const docs = caso.documentos.filter((d) => d.exigeAssinatura);
  const adv = caso.advogado ?? ADVOGADO_DEMO;

  async function assinarDigital(docId: string) {
    setOcupado(docId);
    const hash = await sha256(`${caso.protocolo}|${docId}|${caso.assistido.nome}|${agoraISO()}`);
    registrarAssinatura(caso.id, { documentoId: docId, metodo: 'assinatura_digital_plataforma', assinadoEm: agoraISO(), hash });
    setOcupado(null);
  }

  function fotoImpresso(docId: string) {
    atualizarDocumento(
      caso.id,
      docId,
      { status: 'assinado', arquivoNome: 'documento assinado (foto simulada).jpg' },
      { tipo: 'assinatura', descricao: `Documento "${docId}" impresso, assinado e enviado por foto.`, autor: 'assistido' },
    );
    registrarAssinatura(caso.id, { documentoId: docId, metodo: 'impressao_digitalizacao', assinadoEm: agoraISO(), hash: 'upload' });
  }

  if (!docs.length) return null;

  return (
    <div className="space-y-3">
      {docs.map((d) => {
        const ass = caso.assinaturas.find((a) => a.documentoId === d.id);
        const gerado = ['gerado', 'assinado', 'recebido'].includes(d.status);
        return (
          <div key={d.id} className="rounded-2xl border border-ink-200 p-4 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900 inline-flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-navy-700" /> {d.nome}
                </p>
                <p className="text-xs text-ink-500 mt-0.5">{d.descricao}</p>
              </div>
              {ass ? (
                <span className="badge bg-ok-100 text-ok-600 shrink-0 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Assinado
                </span>
              ) : (
                <span className="badge bg-warn-100 text-warn-600 shrink-0">Aguardando assinatura</span>
              )}
            </div>

            {ass ? (
              <div className="mt-3 text-xs text-ink-700 rounded-lg bg-ink-50 p-3 font-mono break-all">
                <p className="font-sans font-semibold text-ink-900 inline-flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-ok-600" /> Registro de integridade
                </p>
                <p>método: {ROTULO_METODO[ass.metodo]}</p>
                <p>em: {new Date(ass.assinadoEm).toLocaleString('pt-BR')}</p>
                <p>sha256: {ass.hash}</p>
                <p className="font-sans text-ink-500 mt-1">
                  Simulação de aceite eletrônico com carimbo de integridade. Não é certificação ICP-Brasil.
                </p>
              </div>
            ) : (
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                <button className="btn-secondary text-xs justify-start" onClick={() => baixarDocx(TIPO_POR_DOC[d.id], caso, adv)} disabled={!TIPO_POR_DOC[d.id]}>
                  <Download className="w-3.5 h-3.5" /> Ver / baixar o documento (.docx)
                </button>
                <button className="btn-primary text-xs justify-start" onClick={() => assinarDigital(d.id)} disabled={ocupado === d.id}>
                  <FileSignature className="w-3.5 h-3.5" /> Assinar digitalmente (simulação)
                </button>
                <button className="btn-secondary text-xs justify-start" onClick={() => setGovbr(d.id)}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Assinar com gov.br
                </button>
                <button className="btn-secondary text-xs justify-start" onClick={() => fotoImpresso(d.id)}>
                  <Printer className="w-3.5 h-3.5" /> Imprimir, assinar e enviar foto <Upload className="w-3 h-3" />
                </button>
                {!gerado && (
                  <p className="sm:col-span-2 text-[11px] text-ink-500">
                    O documento é gerado pela plataforma a partir do template oficial com os dados que você informou.
                  </p>
                )}
              </div>
            )}

            {govbr === d.id && (
              <div className="mt-3">
                <Aviso tipo="info">
                  <strong>gov.br — em breve.</strong> A assinatura com conta gov.br (nível prata/ouro) faz parte do roadmap e depende de
                  credenciamento da plataforma junto ao ITI. Por enquanto, use a assinatura digital da plataforma ou a impressão com foto.{' '}
                  <button className="underline ml-1" onClick={() => setGovbr(null)}>
                    Fechar
                  </button>
                </Aviso>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
