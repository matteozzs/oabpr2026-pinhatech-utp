'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { entrarComo, useCaso, usePerfil } from '@/lib/store';
import { Aviso, Secao } from '@/components/ui';
import { useIA } from '@/features/ia';
import { CabecalhoCaso, HistoricoCaso, SecaoChecklist, SecaoMinuta, SecaoPacote, SecaoResumo } from '@/features/casos';
import { GeradorDocumentos } from '@/features/documentos';
import { AcoesChatAdvogado, Chat } from '@/features/chat';
import { PainelCras } from '@/features/cras';

/**
 * Atendimento de um caso, na ordem em que o advogado trabalha:
 * resumo → checklist → documentos → conversa → minuta → pacote → histórico.
 * Cada passo é um componente próprio em `features/casos`; esta página só compõe.
 */
export default function CasoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const perfil = usePerfil();
  const { caso, pronto } = useCaso(id);
  const ia = useIA();

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

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/advogado/dashboard" className="btn-ghost -ml-3">
          <ArrowLeft className="w-4 h-4" /> Painel
        </Link>
        <Link href={`/advogado/chat/${caso.id}`} className="btn-secondary text-xs">
          <MessageCircle className="w-3.5 h-3.5" /> Abrir conversa
        </Link>
      </div>

      <CabecalhoCaso caso={caso} />

      {ia.erro && <Aviso tipo="erro">{ia.erro}</Aviso>}

      <SecaoResumo caso={caso} ia={ia} />
      <SecaoChecklist caso={caso} ia={ia} />
      <GeradorDocumentos caso={caso} desabilitado={ia.ocupado !== null} />

      <Secao
        id="conversa"
        titulo="Conversa com o assistido"
        descricao="Pelo número oficial da plataforma. A tela dedicada tem a caixa de entrada e todas as ações."
        acoes={
          <Link href={`/advogado/chat/${caso.id}`} className="btn-primary">
            <MessageCircle className="w-4 h-4" /> Abrir conversa dedicada
          </Link>
        }
      >
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <Chat caso={caso} perfil="advogado" acoes={<AcoesChatAdvogado caso={caso} />} />
          </div>
          <div className="lg:col-span-2">
            <PainelCras cidade={caso.assistido.cidade} />
          </div>
        </div>
      </Secao>

      <SecaoMinuta caso={caso} ia={ia} />
      <SecaoPacote caso={caso} />
      <HistoricoCaso caso={caso} />
    </div>
  );
}
