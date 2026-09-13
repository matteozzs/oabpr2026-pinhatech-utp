'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, ExternalLink, Mail, MessageCircle, Phone, Smartphone } from 'lucide-react';
import type { Caso } from '@/types';
import { Secao } from '@/components/ui';

/**
 * Canais de contato com a parte.
 *
 * O e-mail **não** é enviado pela plataforma: o advogado usa o cliente dele, como e quando
 * quiser. Aqui só ficam o endereço, o atalho que abre o e-mail já endereçado e o assunto
 * sugerido com o protocolo — o que poupa digitação sem fingir uma integração que não existe.
 */
export function CanaisDeContato({ caso }: { caso: Caso }) {
  const [copiado, setCopiado] = useState<string | null>(null);

  const email = caso.assistido.email;
  const telefone = caso.assistido.telefone ?? caso.assistido.whatsapp;
  const assunto = `Seu processo — protocolo ${caso.protocolo}`;
  const soDigitos = (telefone ?? '').replace(/\D/g, '');

  async function copiar(chave: string, valor: string) {
    await navigator.clipboard.writeText(valor);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 2000);
  }

  return (
    <Secao titulo="Canais de contato" descricao={`${caso.assistido.nome} · ${caso.comarca}`}>
      <ul className="space-y-3">
        <li className="rounded-xl border border-ink-200 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="label mb-0 inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Telefone / WhatsApp
            </span>
            {telefone && <BotaoCopiar chave="telefone" valor={telefone} copiado={copiado} aoCopiar={copiar} />}
          </div>
          <p className="text-sm text-ink-900 mt-1">{telefone ?? '— não informado'}</p>
          {soDigitos.length >= 10 && (
            <a
              className="btn-secondary text-xs py-1.5 mt-2"
              href={`https://wa.me/55${soDigitos}?text=${encodeURIComponent(`Olá, ${caso.assistido.nome.split(' ')[0]}. Aqui é ${caso.advogado?.nome ?? 'seu(sua) advogado(a)'}, sobre o protocolo ${caso.protocolo}.`)}`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir no WhatsApp <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </li>

        <li className="rounded-xl border border-ink-200 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="label mb-0 inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> E-mail
            </span>
            {email && <BotaoCopiar chave="e-mail" valor={email} copiado={copiado} aoCopiar={copiar} />}
          </div>
          <p className="text-sm text-ink-900 mt-1 break-all">{email ?? '— não informado'}</p>
          {email ? (
            <>
              <div className="flex flex-wrap gap-2 mt-2">
                <a className="btn-secondary text-xs py-1.5" href={`mailto:${email}?subject=${encodeURIComponent(assunto)}`}>
                  Escrever no meu e-mail <ExternalLink className="w-3 h-3" />
                </a>
                <BotaoCopiar chave="assunto" valor={assunto} copiado={copiado} aoCopiar={copiar} />
              </div>
              <p className="text-[11px] text-ink-500 mt-2">
                Abre o seu cliente de e-mail já endereçado, com o assunto <em>{assunto}</em>. A plataforma não envia e-mail — a mensagem
                sai da sua conta, do jeito que você escrever.
              </p>
            </>
          ) : (
            <p className="text-[11px] text-ink-500 mt-1">
              Preencha em <strong>Documentos → Dados da parte</strong> se quiser usar este canal.
            </p>
          )}
        </li>

        <li className="rounded-xl border border-navy-100 bg-navy-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="label mb-0 inline-flex items-center gap-1.5 text-navy-900">
              <MessageCircle className="w-3.5 h-3.5" /> Chat da plataforma
            </span>
            <Link href={`/advogado/chat/${caso.id}`} className="btn-primary text-xs py-1.5">
              Abrir conversa
            </Link>
          </div>
          <p className="text-sm text-ink-700 mt-1">
            Canal oficial: o seu número pessoal não é exposto. É aqui que a parte manda foto de documento e que nasce o resumo dos fatos.
          </p>
        </li>

        <li className="rounded-xl border border-dashed border-ink-300 p-3">
          <span className="label mb-0 inline-flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" /> WhatsApp oficial da plataforma
          </span>
          <p className="text-sm text-ink-700 mt-1">
            Roadmap: espelhar a conversa no WhatsApp da parte pela API oficial da Meta, com recebimento de fotos e áudios transcritos.
          </p>
        </li>
      </ul>

      {caso.assistido.sabeLerEscrever === false && (
        <p className="mt-3 text-xs text-warn-600 bg-warn-100 rounded-lg px-3 py-2">
          A parte tem dificuldade para ler e escrever — prefira o chat com áudio, e frases curtas em qualquer canal.
        </p>
      )}
    </Secao>
  );
}

function BotaoCopiar({
  chave,
  valor,
  copiado,
  aoCopiar,
}: {
  chave: string;
  valor: string;
  copiado: string | null;
  aoCopiar: (chave: string, valor: string) => void;
}) {
  const feito = copiado === chave;
  return (
    <button className="btn-ghost text-xs py-1 px-2" onClick={() => aoCopiar(chave, valor)} aria-label={`Copiar ${chave}`}>
      {feito ? <Check className="w-3.5 h-3.5 text-ok-600" /> : <Copy className="w-3.5 h-3.5" />}
      {feito ? 'copiado' : 'copiar'}
    </button>
  );
}
