'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Paperclip, Send, Smartphone } from 'lucide-react';
import type { Caso, Perfil } from '@/types';
import { NUMERO_OFICIAL_PLATAFORMA, atualizarDocumento, enviarMensagem, marcarLidas, useMensagens } from '@/lib/store';
import { cn } from '@/lib/utils';
import { BolhaMensagem } from './BolhaMensagem';

/**
 * Chat interno do caso — canal dedicado entre o advogado dativo e a parte assistida.
 *
 * O advogado fala pelo número oficial da plataforma; o número pessoal nunca é exposto.
 * A integração com a API oficial do WhatsApp (Meta) está no roadmap: hoje o canal é o chat.
 */
export function Chat({
  caso,
  perfil,
  modo = 'compacto',
  acoes,
}: {
  caso: Caso;
  perfil: Perfil;
  modo?: 'compacto' | 'dedicado';
  /** Ações rápidas exibidas acima do compositor. */
  acoes?: ReactNode;
}) {
  const mensagens = useMensagens(caso.id);
  const [texto, setTexto] = useState('');
  const [anexoId, setAnexoId] = useState('');
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: 'nearest' });
  }, [mensagens.length]);

  // Marcar lidas é escrita no sistema externo (localStorage), não estado React.
  useEffect(() => {
    if (perfil === 'advogado') marcarLidas(caso.id);
  }, [perfil, caso.id, mensagens.length]);

  const pendentes = caso.documentos.filter((d) => !d.geradoPelaPlataforma && ['pendente', 'solicitado'].includes(d.status));
  const primeiroNome = caso.assistido.nome.split(' ')[0];

  function enviar() {
    const t = texto.trim();
    if (!t && !anexoId) return;
    const doc = caso.documentos.find((d) => d.id === anexoId);

    enviarMensagem({
      casoId: caso.id,
      autor: perfil === 'cidadao' ? 'assistido' : 'advogado',
      canal: 'chat',
      tipo: doc ? 'documento' : 'texto',
      texto: t || (doc ? `Enviei a foto do documento: ${doc.nome}` : ''),
      anexo: doc ? { nome: `${doc.nome} (foto simulada).jpg`, documentoId: doc.id } : undefined,
    });

    if (doc) {
      atualizarDocumento(
        caso.id,
        doc.id,
        { status: 'recebido', arquivoNome: `${doc.nome} (foto simulada).jpg` },
        { tipo: 'documento', descricao: `Assistido enviou "${doc.nome}" pelo chat.`, autor: 'assistido' },
      );
    }

    setTexto('');
    setAnexoId('');
  }

  return (
    <div className={cn('flex flex-col rounded-2xl border border-ink-200 overflow-hidden bg-white', modo === 'dedicado' && 'h-[calc(100dvh-11rem)] min-h-[520px]')}>
      <div className="px-4 py-2.5 bg-navy-50 border-b border-ink-200 flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 text-navy-900 font-semibold">
          <Smartphone className="w-3.5 h-3.5" /> Canal oficial da plataforma
        </span>
        <span className="text-ink-500 truncate">{NUMERO_OFICIAL_PLATAFORMA}</span>
      </div>

      <div className={cn('overflow-y-auto p-4 space-y-3 bg-ink-50', modo === 'dedicado' ? 'flex-1' : 'max-h-[360px]')} aria-live="polite">
        {mensagens.length === 0 && <p className="text-sm text-ink-500 text-center py-6">Nenhuma mensagem ainda.</p>}
        {mensagens.map((m) => (
          <BolhaMensagem key={m.id} m={m} perfil={perfil} caso={caso} primeiroNome={primeiroNome} />
        ))}
        <div ref={fimRef} />
      </div>

      <div className="p-3 border-t border-ink-200 space-y-2">
        {acoes}

        {perfil === 'cidadao' && pendentes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label htmlFor={`anexo-${caso.id}`} className="text-ink-700 font-medium inline-flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" /> Anexar foto de documento:
            </label>
            <select id={`anexo-${caso.id}`} value={anexoId} onChange={(e) => setAnexoId(e.target.value)} className="input py-1.5 w-auto text-xs">
              <option value="">— escolher —</option>
              {pendentes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
            <span className="text-ink-500">(simulação: marca como recebido)</span>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            className="input min-h-[44px] max-h-32 resize-y"
            placeholder={perfil === 'cidadao' ? 'Escreva sua mensagem…' : `Mensagem para ${primeiroNome}…`}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
            aria-label="Mensagem"
          />
          <button className="btn-primary px-3" onClick={enviar} aria-label="Enviar mensagem">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
