'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { entrarComo, useCaso, usePerfil } from '@/lib/store';
import { Aviso } from '@/components/ui';
import { useIA } from '@/features/ia';
import {
  CabecalhoCaso,
  HistoricoCaso,
  IndiceCaso,
  SECOES,
  SecaoDocumentos,
  SecaoMinuta,
  SecaoPacote,
  SecaoResumo,
  type SecaoCaso,
} from '@/features/casos';

/**
 * Atendimento de um caso. O índice à esquerda navega entre as etapas; o conteúdo
 * da etapa ativa aparece ao centro. A conversa com a parte tem tela própria —
 * aqui fica só o atalho, para não haver dois chats concorrentes.
 */
export default function CasoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const perfil = usePerfil();
  const { caso, pronto } = useCaso(id);
  const ia = useIA();
  const q = useSearchParams();

  useEffect(() => {
    if (perfil !== 'advogado') entrarComo('advogado');
  }, [perfil]);

  if (!pronto) return null;

  if (!caso) {
    return (
      <div className="max-w-xl mx-auto">
        <Aviso tipo="alerta">Caso não encontrado neste navegador.</Aviso>
        <Link href="/advogado/dashboard" className="btn-ghost mt-3">
          <ArrowLeft className="w-4 h-4" /> Painel
        </Link>
      </div>
    );
  }

  const pedida = q.get('secao') as SecaoCaso | null;
  const ativa: SecaoCaso = SECOES.some((s) => s.id === pedida) ? pedida! : 'resumo';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/advogado/dashboard" className="btn-ghost -ml-3">
          <ArrowLeft className="w-4 h-4" /> Painel
        </Link>
        <Link href={`/advogado/chat/${caso.id}`} className="btn-secondary text-xs">
          <MessageCircle className="w-3.5 h-3.5" /> Conversa com a parte
        </Link>
      </div>

      <CabecalhoCaso caso={caso} />

      {ia.erro && <Aviso tipo="erro">{ia.erro}</Aviso>}

      <div className="grid lg:grid-cols-[16rem_1fr] gap-5 items-start">
        <IndiceCaso caso={caso} ativa={ativa} />

        <div className="min-w-0">
          {ativa === 'resumo' && <SecaoResumo caso={caso} ia={ia} />}
          {ativa === 'documentos' && <SecaoDocumentos caso={caso} ia={ia} />}
          {ativa === 'minuta' && <SecaoMinuta caso={caso} ia={ia} />}
          {ativa === 'pacote' && <SecaoPacote caso={caso} />}
          {ativa === 'historico' && <HistoricoCaso caso={caso} />}
        </div>
      </div>
    </div>
  );
}
