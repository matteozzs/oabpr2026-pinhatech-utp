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
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
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

  async function enviar() {
    const t = texto.trim();
    if (!t && !arquivo) return;

    setEnviando(true);
    try {
      let arquivoUrl = undefined;
      let arquivoNome = undefined;

      if (arquivo) {
        const formData = new FormData();
        formData.append('file', arquivo);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Falha no upload');
        const data = await res.json();
        arquivoUrl = data.url;
        arquivoNome = arquivo.name;
      }

      const anexoMsg = arquivoNome
        ? {
            nome: arquivoNome,
            url: arquivoUrl,
            analisado: false
          }
        : undefined;

      enviarMensagem({
        casoId: caso.id,
        autor: perfil === 'cidadao' ? 'assistido' : 'advogado',
        canal: 'chat',
        tipo: anexoMsg ? 'documento' : 'texto',
        texto: t || (arquivoNome ? 'Enviei um documento' : ''),
        anexo: anexoMsg,
      });

      setTexto('');
      setArquivo(null);
    } catch (e) {
      alert('Houve um erro no envio. Tente novamente.');
      console.error(e);
    } finally {
      setEnviando(false);
    }
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
        {mensagens.length === 0 && (
          <p className="text-sm text-ink-500 text-center py-6 px-4">
            {perfil === 'advogado'
              ? 'Nenhuma mensagem ainda. Escreva para fazer o primeiro contato e entender o caso.'
              : 'Nenhuma mensagem ainda.'}
          </p>
        )}
        {mensagens.map((m) => (
          <BolhaMensagem key={m.id} m={m} perfil={perfil} caso={caso} primeiroNome={primeiroNome} />
        ))}
        <div ref={fimRef} />
      </div>

      <div className="p-3 border-t border-ink-200 space-y-2">
        {acoes}

        {perfil === 'cidadao' && (
          <div className="flex flex-col gap-2 text-xs mb-2">
            <div className="flex items-center gap-2">
              <label htmlFor={`arquivo-${caso.id}`} className="text-ink-700 font-medium inline-flex items-center gap-1 cursor-pointer">
                <Paperclip className="w-3.5 h-3.5" /> Anexar documento
              </label>
              <input 
                id={`arquivo-${caso.id}`}
                type="file" 
                accept="image/*,.pdf,.doc,.docx" 
                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 file:cursor-pointer"
                disabled={enviando}
              />
            </div>
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
          <button className="btn-primary px-3" onClick={enviar} aria-label="Enviar mensagem" disabled={enviando}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
