'use client';

import { useState } from 'react';
import { CheckCircle2, Download, FileText } from 'lucide-react';
import type { Caso } from '@/types';
import { ADVOGADO_DEMO } from '@/lib/store';
import { Aviso, Secao } from '@/components/ui';
import { cn } from '@/lib/utils';
import { baixarDocx, type TipoDocx } from '../api';

/**
 * Painel do advogado: gera os documentos da plataforma em .docx a partir dos templates
 * e mostra o estado dos documentos que cabem ao assistido enviar.
 */
export function GeradorDocumentos({ caso, desabilitado }: { caso: Caso; desabilitado?: boolean }) {
  const [erro, setErro] = useState<string | null>(null);
  const [baixando, setBaixando] = useState<string | null>(null);
  const adv = caso.advogado ?? ADVOGADO_DEMO;

  const daPlataforma = caso.documentos.filter((d) => d.geradoPelaPlataforma && d.id !== 'peticao_inicial');
  const doAssistido = caso.documentos.filter((d) => !d.geradoPelaPlataforma);

  async function baixar(tipo: TipoDocx) {
    setBaixando(tipo);
    setErro(null);
    try {
      await baixarDocx(tipo, caso, adv);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao gerar documento.');
    } finally {
      setBaixando(null);
    }
  }

  return (
    <Secao
      id="documentos"
      titulo="Documentos da plataforma"
      descricao="Gerados a partir dos templates oficiais em .docx com os dados do caso. Lacunas ficam marcadas."
    >
      {erro && (
        <div className="mb-3">
          <Aviso tipo="erro">{erro}</Aviso>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-2">
        {daPlataforma.map((d) => (
          <button
            key={d.id}
            className="btn-secondary justify-start text-left h-auto py-3"
            disabled={desabilitado || baixando !== null}
            onClick={() => baixar(d.id as TipoDocx)}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{d.nome}</span>
              <span className="block text-[11px] text-ink-500">
                {d.status === 'assinado'
                  ? '✓ assinado pelo assistido'
                  : d.status === 'gerado'
                    ? 'gerado · aguardando assinatura'
                    : baixando === d.id
                      ? 'gerando…'
                      : 'gerar .docx'}
              </span>
            </span>
            <Download className="w-3.5 h-3.5 ml-auto shrink-0" />
          </button>
        ))}
      </div>

      <div className="mt-4">
        <p className="label">Documentos do assistido</p>
        <ul className="flex flex-wrap gap-1.5">
          {doAssistido.map((d) => (
            <li
              key={d.id}
              className={cn(
                'badge',
                ['recebido', 'assinado'].includes(d.status)
                  ? 'bg-ok-100 text-ok-600'
                  : d.status === 'solicitado'
                    ? 'bg-warn-100 text-warn-600'
                    : 'bg-ink-100 text-ink-700',
              )}
              title={d.observacaoIA ?? d.descricao}
            >
              {['recebido', 'assinado'].includes(d.status) && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {d.nome}
            </li>
          ))}
        </ul>
      </div>
    </Secao>
  );
}
