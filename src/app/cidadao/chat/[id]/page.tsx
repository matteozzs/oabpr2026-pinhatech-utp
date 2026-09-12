'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, FileSignature, FolderOpen } from 'lucide-react';
import { entrarComo, useCaso, usePerfil } from '@/lib/store';
import { Aviso, StatusBadge } from '@/components/ui';
import { Chat } from '@/features/chat';
import { linkBuscaCras } from '@/lib/cras';

export default function ChatCidadaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const perfil = usePerfil();
  const { caso, pronto } = useCaso(id);

  useEffect(() => {
    if (perfil !== 'cidadao') entrarComo('cidadao');
  }, [perfil]);

  if (!pronto) return null;
  if (!caso)
    return (
      <div className="max-w-xl mx-auto">
        <Aviso tipo="alerta">Conversa não encontrada neste navegador.</Aviso>
        <Link href="/cidadao" className="btn-ghost mt-3">
          <ArrowLeft className="w-4 h-4" /> Minhas solicitações
        </Link>
      </div>
    );

  const paraAssinar = caso.documentos.filter((d) => d.exigeAssinatura && d.status !== 'assinado').length;

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/cidadao/solicitacao/${caso.id}`} className="btn-ghost -ml-3">
          <ArrowLeft className="w-4 h-4" /> Minha solicitação
        </Link>
        <StatusBadge status={caso.status} />
      </div>
      <div>
        <h1 className="text-xl font-black text-navy-950">Conversa com {caso.advogado?.nome ?? 'o(a) advogado(a)'}</h1>
        <p className="text-sm text-ink-700">Advogado(a) dativo(a) nomeado(a) para o seu caso · protocolo {caso.protocolo}</p>
      </div>
      <Chat
        caso={caso}
        perfil="cidadao"
        modo="dedicado"
        acoes={
          <>
            {paraAssinar > 0 && (
              <Link href={`/cidadao/solicitacao/${caso.id}#assinaturas`} className="btn-primary text-xs py-1.5">
                <FileSignature className="w-3.5 h-3.5" /> Assinar documentos ({paraAssinar})
              </Link>
            )}
            <a className="btn-secondary text-xs py-1.5" href={linkBuscaCras(caso.assistido.cidade)} target="_blank" rel="noreferrer">
              <Building2 className="w-3.5 h-3.5" /> Onde fica o CRAS
            </a>
            <Link href={`/cidadao/solicitacao/${caso.id}#documentos`} className="btn-secondary text-xs py-1.5">
              <FolderOpen className="w-3.5 h-3.5" /> Meus documentos
            </Link>
          </>
        }
      />
    </div>
  );
}
