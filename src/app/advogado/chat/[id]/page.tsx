'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FolderOpen } from 'lucide-react';
import { entrarComo, useCaso, usePerfil } from '@/lib/store';
import { Aviso, StatusBadge } from '@/components/ui';
import { AcoesChatAdvogado, Chat } from '@/features/chat';
import { PainelCras } from '@/features/cras';
import { AREA_LABEL } from '@/types';
import { cn } from '@/lib/utils';

export default function ChatAdvogadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const perfil = usePerfil();
  const { caso, pronto } = useCaso(id);

  useEffect(() => {
    if (perfil !== 'advogado') entrarComo('advogado');
  }, [perfil]);

  if (!pronto) return null;
  if (!caso)
    return (
      <div className="max-w-xl mx-auto">
        <Aviso tipo="alerta">Conversa não encontrada.</Aviso>
        <Link href="/advogado/chat" className="btn-ghost mt-3">
          <ArrowLeft className="w-4 h-4" /> Conversas
        </Link>
      </div>
    );

  const recebidos = caso.documentos.filter((d) => ['recebido', 'assinado'].includes(d.status));
  const pendentes = caso.documentos.filter((d) => !d.geradoPelaPlataforma && ['pendente', 'solicitado'].includes(d.status));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Link href="/advogado/chat" className="btn-ghost -ml-3">
          <ArrowLeft className="w-4 h-4" /> Conversas
        </Link>
        <Link href={`/advogado/caso/${caso.id}`} className="btn-secondary text-xs">
          <FolderOpen className="w-3.5 h-3.5" /> Abrir caso
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black text-navy-950">{caso.assistido.nome}</h1>
            <StatusBadge status={caso.status} />
            <span className="text-xs text-ink-500">
              {caso.protocolo} · {AREA_LABEL[caso.area]} · {caso.comarca}
              {caso.assistido.sabeLerEscrever === false && ' · tem dificuldade para ler — prefira frases curtas'}
            </span>
          </div>
          <Chat caso={caso} perfil="advogado" modo="dedicado" acoes={<AcoesChatAdvogado caso={caso} />} />
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <p className="label">Documentos</p>
            {pendentes.length > 0 && (
              <ul className="space-y-1 mb-2">
                {pendentes.map((d) => (
                  <li key={d.id} className={cn('text-sm flex items-center gap-2', d.status === 'solicitado' ? 'text-warn-600' : 'text-ink-700')}>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-current inline-block shrink-0" /> {d.nome}
                    {d.status === 'solicitado' && <span className="text-[10px]">(pedido)</span>}
                  </li>
                ))}
              </ul>
            )}
            {recebidos.length > 0 && (
              <ul className="space-y-1">
                {recebidos.map((d) => (
                  <li key={d.id} className="text-sm text-ok-600 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {d.nome}
                  </li>
                ))}
              </ul>
            )}
            {pendentes.length === 0 && recebidos.length === 0 && <p className="text-sm text-ink-500">Nenhum documento registrado.</p>}
          </div>
          <PainelCras cidade={caso.assistido.cidade} compacto />
        </aside>
      </div>
    </div>
  );
}
