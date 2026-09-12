'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import { entrarComo, useCaso, useMensagens, usePerfil } from '@/lib/store';
import { AREA_LABEL, type StatusCaso } from '@/types';
import { Aviso, Secao, StatusBadge } from '@/components/ui';
import { Assinatura, ListaDocumentosCidadao } from '@/features/documentos';
import { PainelCras } from '@/features/cras';
import { formatarDataHora } from '@/lib/utils';

const EXPLICA_STATUS: Record<StatusCaso, string> = {
  nova_solicitacao: 'Recebemos seu pedido. Em breve um(a) advogado(a) será nomeado(a) pela OAB ou pelo Fórum.',
  em_atendimento: 'Um(a) advogado(a) foi nomeado(a) para o seu caso e está cuidando dele. Fique de olho na conversa.',
  aguardando_documentos: 'O(a) advogado(a) precisa de documentos seus. Veja a lista abaixo e mande pela conversa.',
  minuta_gerada: 'Os papéis do seu pedido estão sendo preparados.',
  pronto_protocolo: 'Tudo pronto. O(a) advogado(a) vai dar entrada no seu pedido na Justiça.',
  protocolado: 'Seu pedido foi protocolado na Justiça. O(a) advogado(a) vai te avisar sobre o andamento.',
};

export default function SolicitacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const perfil = usePerfil();
  const q = useSearchParams();
  const { caso, pronto } = useCaso(id);
  const mensagens = useMensagens(caso?.id);

  useEffect(() => {
    if (perfil !== 'cidadao') entrarComo('cidadao');
  }, [perfil]);

  if (!pronto) return null;

  if (!caso) {
    return (
      <div className="max-w-xl mx-auto">
        <Aviso tipo="alerta">Solicitação não encontrada neste navegador.</Aviso>
        <Link href="/cidadao" className="btn-ghost mt-3">
          <ArrowLeft className="w-4 h-4" /> Minhas solicitações
        </Link>
      </div>
    );
  }

  const ultima = mensagens[mensagens.length - 1];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href="/cidadao" className="btn-ghost -ml-3">
        <ArrowLeft className="w-4 h-4" /> Minhas solicitações
      </Link>

      {q.get('nova') && (
        <Aviso tipo="ok">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> <strong>Pedido enviado!</strong> Guarde seu protocolo:{' '}
            <span className="font-mono">{caso.protocolo}</span>
          </span>
        </Aviso>
      )}

      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-ink-500">Protocolo {caso.protocolo}</p>
            <h1 className="text-2xl font-black text-navy-950">{caso.ia.resumo?.tema ?? AREA_LABEL[caso.area]}</h1>
            <p className="text-sm text-ink-700 mt-1">
              {caso.assistido.nome} · {caso.comarca} · enviado em {formatarDataHora(caso.criadoEm)}
            </p>
          </div>
          <StatusBadge status={caso.status} />
        </div>
        <p className="mt-4 text-ink-900 bg-navy-50 rounded-xl p-3 inline-flex items-start gap-2">
          <Clock className="w-4 h-4 mt-0.5 text-navy-700 shrink-0" /> {EXPLICA_STATUS[caso.status]}
        </p>
        {caso.advogado && (
          <p className="mt-3 text-sm text-ink-700">
            Advogado(a) responsável: <strong>{caso.advogado.nome}</strong> ({caso.advogado.oab})
          </p>
        )}
      </div>

      <Link href={`/cidadao/chat/${caso.id}`} className="card p-4 sm:p-5 flex items-center gap-3 hover:border-navy-500 transition">
        <div className="w-11 h-11 rounded-full bg-navy-100 text-navy-900 flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900">Conversa com {caso.advogado?.nome ?? 'o(a) advogado(a)'}</p>
          <p className="text-sm text-ink-700 truncate">{ultima ? ultima.texto : 'Abra para falar com o(a) advogado(a) e enviar documentos.'}</p>
        </div>
        <span className="btn-primary text-xs shrink-0">Abrir</span>
      </Link>

      <ListaDocumentosCidadao caso={caso} />

      <Secao
        id="assinaturas"
        titulo="Documentos para assinar"
        descricao="Procuração, declaração de hipossuficiência e consentimento para uso dos seus dados."
      >
        <Assinatura caso={caso} />
      </Secao>

      <Secao id="apoio" titulo="Onde conseguir ajuda com documentos" descricao="CRAS ajuda com CadÚnico, certidões e comprovantes.">
        <PainelCras cidade={caso.assistido.cidade} />
      </Secao>
    </div>
  );
}
