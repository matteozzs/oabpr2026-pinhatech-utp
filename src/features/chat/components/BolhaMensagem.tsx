'use client';

import Link from 'next/link';
import { Building2, ExternalLink, FileSignature, MapPin, Paperclip } from 'lucide-react';
import type { Caso, Mensagem, Perfil } from '@/types';
import { linkBuscaCras, linkBuscaForum } from '@/lib/cras';
import { cn, formatarDataHora } from '@/lib/utils';

/**
 * Uma mensagem no chat. Mensagens com `tipo` viram cartões acionáveis:
 * orientação do CRAS (com busca pública) e pedido de assinatura (com atalho para assinar).
 */
export function BolhaMensagem({ m, perfil, caso, primeiroNome }: { m: Mensagem; perfil: Perfil; caso: Caso; primeiroNome: string }) {
  const minha = perfil === 'cidadao' ? m.autor === 'assistido' : m.autor === 'advogado';
  const sistema = m.autor === 'plataforma';
  const cidade = caso.assistido.cidade;

  if (m.tipo === 'orientacao_cras') {
    return (
      <Cartao minha={minha} titulo="Onde conseguir ajuda com documentos" icone={<Building2 className="w-3.5 h-3.5" />} em={m.enviadoEm} texto={m.texto}>
        <a className="btn-secondary text-xs py-1.5" href={linkBuscaCras(cidade)} target="_blank" rel="noreferrer">
          <MapPin className="w-3.5 h-3.5" /> Localizar CRAS em {cidade} <ExternalLink className="w-3 h-3" />
        </a>
        <a className="btn-secondary text-xs py-1.5" href={linkBuscaForum(cidade)} target="_blank" rel="noreferrer">
          <MapPin className="w-3.5 h-3.5" /> Fórum <ExternalLink className="w-3 h-3" />
        </a>
      </Cartao>
    );
  }

  if (m.tipo === 'solicitacao_assinatura') {
    return (
      <Cartao minha={minha} titulo="Documentos para assinar" icone={<FileSignature className="w-3.5 h-3.5" />} em={m.enviadoEm} texto={m.texto}>
        {perfil === 'cidadao' && (
          <Link href={`/cidadao/solicitacao/${caso.id}#assinaturas`} className="btn-primary text-xs py-1.5">
            <FileSignature className="w-3.5 h-3.5" /> Assinar agora
          </Link>
        )}
      </Cartao>
    );
  }

  return (
    <div className={cn('flex', sistema ? 'justify-center' : minha ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap shadow-sm',
          sistema ? 'bg-white text-ink-700 text-xs border border-ink-200' : minha ? 'bg-navy-700 text-white' : 'bg-white text-ink-900 border border-ink-200',
        )}
      >
        {!sistema && (
          <p className={cn('text-[11px] mb-1 font-semibold', minha ? 'text-navy-100' : 'text-navy-700')}>
            {m.autor === 'advogado' ? (caso.advogado?.nome ?? 'Advogado(a)') : primeiroNome}
            {m.geradaPorIA && <span className="ml-1 font-normal opacity-80">· redigida com IA, revisada</span>}
          </p>
        )}
        <p>{m.texto}</p>
        {m.anexo && (
          <p className={cn('mt-1.5 text-xs inline-flex items-center gap-1 rounded-lg px-2 py-1', minha ? 'bg-navy-800' : 'bg-ink-100')}>
            <Paperclip className="w-3 h-3" /> {m.anexo.nome}
          </p>
        )}
        <p className={cn('text-[10px] mt-1', minha ? 'text-navy-100' : 'text-ink-500')}>{formatarDataHora(m.enviadoEm)}</p>
      </div>
    </div>
  );
}

function Cartao({
  minha,
  titulo,
  icone,
  texto,
  em,
  children,
}: {
  minha: boolean;
  titulo: string;
  icone: React.ReactNode;
  texto: string;
  em: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('flex', minha ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[90%] rounded-2xl border border-navy-100 bg-white shadow-sm overflow-hidden">
        <div className="px-3.5 py-2 bg-navy-50 text-navy-900 text-xs font-semibold inline-flex items-center gap-1.5 w-full">
          {icone} {titulo}
        </div>
        <div className="px-3.5 py-2.5 text-sm text-ink-900 whitespace-pre-wrap">{texto}</div>
        {children && <div className="px-3.5 pb-3 flex flex-wrap gap-2">{children}</div>}
        <p className="px-3.5 pb-2 text-[10px] text-ink-500">{formatarDataHora(em)}</p>
      </div>
    </div>
  );
}
