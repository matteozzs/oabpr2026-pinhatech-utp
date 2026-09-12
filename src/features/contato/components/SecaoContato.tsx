'use client';

import Link from 'next/link';
import { ArrowRight, Mail, MessageCircle, Phone, Smartphone } from 'lucide-react';
import type { Caso } from '@/types';
import { NUMERO_OFICIAL_PLATAFORMA, useMensagens } from '@/lib/store';
import { Secao } from '@/components/ui';
import { formatarDataHora } from '@/lib/utils';
import { ComporEmail } from './ComporEmail';

/**
 * Contato — todos os canais com a parte reunidos no painel do caso:
 * o chat interno (tela própria) e o e-mail. WhatsApp fica declarado como roadmap.
 */
export function SecaoContato({ caso }: { caso: Caso }) {
  const mensagens = useMensagens(caso.id);
  const ultima = mensagens[mensagens.length - 1];
  const naoLidas = mensagens.filter((m) => m.autor === 'assistido' && !m.lidaPeloAdvogado).length;
  const emails = mensagens.filter((m) => m.canal === 'email');

  return (
    <div className="space-y-4">
      <Secao titulo="Contato com a parte" descricao={`${caso.assistido.nome} · ${caso.comarca}`}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-ink-200 p-3">
            <p className="label mb-1 inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Telefone / WhatsApp
            </p>
            <p className="text-sm text-ink-900">{caso.assistido.telefone ?? caso.assistido.whatsapp ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-ink-200 p-3">
            <p className="label mb-1 inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> E-mail
            </p>
            <p className="text-sm text-ink-900 truncate">{caso.assistido.email ?? '— não informado'}</p>
          </div>
        </div>
        {caso.assistido.sabeLerEscrever === false && (
          <p className="mt-3 text-xs text-warn-600 bg-warn-100 rounded-lg px-3 py-2">
            A parte tem dificuldade para ler e escrever — prefira o chat com áudio, e frases curtas em qualquer canal.
          </p>
        )}
      </Secao>

      <Secao
        titulo="Chat interno"
        descricao={`Pelo canal oficial da plataforma. Seu número pessoal não é exposto — ${NUMERO_OFICIAL_PLATAFORMA}`}
        acoes={
          <Link href={`/advogado/chat/${caso.id}`} className="btn-primary">
            <MessageCircle className="w-4 h-4" /> Abrir conversa
            {naoLidas > 0 && <span className="badge bg-white text-navy-800 ml-1">{naoLidas}</span>}
          </Link>
        }
      >
        {ultima ? (
          <div className="rounded-xl bg-ink-50 border border-ink-200 p-3">
            <p className="text-xs text-ink-500 mb-1">
              Última mensagem · {ultima.autor === 'assistido' ? caso.assistido.nome.split(' ')[0] : 'você'} ·{' '}
              {formatarDataHora(ultima.enviadoEm)}
              {ultima.canal === 'email' && ' · por e-mail'}
            </p>
            <p className="text-sm text-ink-900 line-clamp-3 whitespace-pre-wrap">{ultima.texto}</p>
          </div>
        ) : (
          <p className="text-sm text-ink-500">Nenhuma mensagem ainda. É pelo chat que você gera o resumo fático e pede os documentos.</p>
        )}
        <p className="text-xs text-ink-500 mt-3">
          {mensagens.length} mensagem(ns) no histórico{emails.length > 0 ? ` · ${emails.length} por e-mail` : ''}.
        </p>
      </Secao>

      <Secao titulo="E-mail" descricao="Para quem prefere e-mail, ou quando o documento é longo demais para o chat.">
        <ComporEmail caso={caso} />
      </Secao>

      <Secao titulo="WhatsApp oficial" descricao="Roadmap — integração com a API Cloud da Meta.">
        <div className="rounded-xl border border-dashed border-ink-300 p-4 flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-ink-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-ink-700">
              Espelhar esta conversa no WhatsApp da parte, pelo número oficial da plataforma, com recebimento de fotos de documentos e
              áudios transcritos automaticamente.
            </p>
            <Link href="/roadmap" className="text-sm text-navy-700 underline inline-flex items-center gap-1 mt-1">
              Ver roadmap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Secao>
    </div>
  );
}
