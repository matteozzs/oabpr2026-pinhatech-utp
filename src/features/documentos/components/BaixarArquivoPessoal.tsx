'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, ShieldAlert } from 'lucide-react';
import type { Caso } from '@/types';
import { atualizarCaso } from '@/lib/store';
import { cn, formatarDataHora } from '@/lib/utils';

/** Prazo de guarda sugerido pela plataforma, contado do encerramento do atendimento. */
export const ANOS_DE_GUARDA = 3;

/**
 * Baixa um arquivo que a **parte** enviou — foto de RG, comprovante, certidão.
 *
 * Documento que a plataforma emite sai direto; este não. Aqui o arquivo é da pessoa
 * assistida, e sair da plataforma para a máquina do advogado muda quem responde pela
 * guarda. Por isso o aviso vem antes do download, e não depois: ele existe para ser
 * lido enquanto ainda dá para desistir.
 *
 * O aceite fica no histórico do caso, com data e hora. Numa demonstração isso é
 * encenação, mas é a encenação certa: em operação real, é esse registro que mostra
 * quem acessou o quê, e quando.
 */
export function BaixarArquivoPessoal({
  caso,
  nomeArquivo,
  documentoId,
  variante = 'secundario',
}: {
  caso: Caso;
  nomeArquivo: string;
  documentoId?: string;
  variante?: 'secundario' | 'discreto';
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        className={cn(variante === 'discreto' ? 'btn-ghost' : 'btn-secondary', 'text-xs py-1.5')}
        onClick={() => setAberto(true)}
        title="Baixar o arquivo enviado pela parte"
      >
        <Download className="w-3.5 h-3.5" /> Baixar
      </button>

      {aberto && <AvisoDeGuarda caso={caso} nomeArquivo={nomeArquivo} documentoId={documentoId} aoFechar={() => setAberto(false)} />}
    </>
  );
}

function AvisoDeGuarda({
  caso,
  nomeArquivo,
  documentoId,
  aoFechar,
}: {
  caso: Caso;
  nomeArquivo: string;
  documentoId?: string;
  aoFechar: () => void;
}) {
  const confirmarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmarRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aoFechar]);

  function confirmar() {
    const agora = new Date();
    const descarte = new Date(agora);
    descarte.setFullYear(descarte.getFullYear() + ANOS_DE_GUARDA);

    // Demonstração: o arquivo da parte é simulado, então o que baixa é um comprovante
    // do acesso. Nada é apresentado como se fosse a foto do documento real.
    const conteudo = [
      'ORDEM DATIVA — COMPROVANTE DE ACESSO A ARQUIVO COM DADOS PESSOAIS',
      '',
      `Arquivo: ${nomeArquivo}`,
      `Protocolo: ${caso.protocolo}`,
      `Parte: ${caso.assistido.nome}`,
      `Advogado(a): ${caso.advogado?.nome ?? '—'}`,
      `Baixado em: ${formatarDataHora(agora.toISOString())}`,
      '',
      `Guarda sugerida: até ${descarte.toLocaleDateString('pt-BR')} (${ANOS_DE_GUARDA} anos).`,
      'Uso restrito a este atendimento. Não compartilhe fora do processo.',
      '',
      'Ambiente de demonstração: o arquivo original é simulado e não acompanha este comprovante.',
    ].join('\n');

    const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante-acesso-${caso.protocolo}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    atualizarCaso(caso.id, {}, {
      tipo: 'documento',
      descricao: `Arquivo "${nomeArquivo}" baixado pelo advogado${documentoId ? ` (documento: ${documentoId})` : ''}. Ciente do aviso de proteção de dados — guarda sugerida até ${descarte.toLocaleDateString('pt-BR')}.`,
      autor: 'advogado',
    });

    aoFechar();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/40 flex items-end sm:items-center justify-center p-3"
      onClick={(e) => e.target === e.currentTarget && aoFechar()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="titulo-aviso-lgpd" className="card w-full max-w-lg p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-warn-100 text-warn-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h2 id="titulo-aviso-lgpd" className="text-lg font-bold text-navy-950">
              Este arquivo tem dados pessoais
            </h2>
            <p className="text-sm text-ink-700 mt-0.5 break-words">
              <span className="font-medium">{nomeArquivo}</span>, enviado por {caso.assistido.nome.split(' ')[0]} no protocolo{' '}
              <span className="font-mono">{caso.protocolo}</span>.
            </p>
          </div>
        </div>

        <p className="text-sm text-ink-900 mt-4">
          Ao baixar, o arquivo sai da plataforma e a guarda passa a ser sua. A partir daí:
        </p>

        <ul className="mt-2 space-y-1.5 text-sm text-ink-700 list-disc pl-5">
          <li>Use somente para este atendimento. Não compartilhe fora do processo.</li>
          <li>
            Guarde por até <strong>{ANOS_DE_GUARDA} anos</strong> após o encerramento do caso. Depois disso, apague.
          </li>
          <li>Se a parte pedir, ela tem direito de saber o que você guardou a respeito dela.</li>
        </ul>

        <p className="text-xs text-ink-500 mt-3">
          Tratamento de dados pessoais regido pela Lei nº 13.709/2018 (LGPD). O prazo de guarda acima é a recomendação desta plataforma, não
          um prazo legal — confira o que se aplica ao seu caso. O download fica registrado no histórico do atendimento.
        </p>

        <div className="flex flex-wrap justify-end gap-2 mt-5">
          <button className="btn-ghost text-sm" onClick={aoFechar}>
            Cancelar
          </button>
          <button ref={confirmarRef} className="btn-primary text-sm" onClick={confirmar}>
            <Download className="w-4 h-4" /> Entendi, baixar
          </button>
        </div>
      </div>
    </div>
  );
}
