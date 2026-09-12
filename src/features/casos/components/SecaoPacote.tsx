'use client';

import { CheckCircle2, ClipboardList, PackageCheck } from 'lucide-react';
import type { Caso } from '@/types';
import { enviarMensagem, mudarStatus } from '@/lib/store';
import { Aviso, Secao } from '@/components/ui';
import { cn } from '@/lib/utils';

/** Passo 4: conferência final e protocolo (simulado). */
export function SecaoPacote({ caso }: { caso: Caso }) {
  const minuta = caso.ia.minuta;
  const pendentes = caso.documentos.filter((d) => !d.geradoPelaPlataforma && ['pendente', 'solicitado'].includes(d.status));
  const assinado = (id: string) => caso.documentos.find((d) => d.id === id)?.status === 'assinado';
  const pronto = Boolean(minuta) && caso.assinaturas.length >= 1;
  const finalizado = caso.status === 'protocolado';

  function protocolar() {
    mudarStatus(caso.id, 'protocolado', 'Petição protocolada (simulação).');
    enviarMensagem({
      casoId: caso.id,
      autor: 'plataforma',
      canal: 'chat',
      texto: 'Seu pedido foi protocolado na Justiça. O(a) advogado(a) vai te avisar sobre o andamento.',
    });
  }

  return (
    <Secao id="pacote" titulo="Pacote de protocolo" descricao="Minuta revisada + procuração assinada + declaração + documentos da parte.">
      <ul className="text-sm space-y-1 mb-4">
        <Item ok={Boolean(minuta)} texto="Minuta da petição inicial gerada e revisada" />
        <Item ok={assinado('procuracao')} texto="Procuração assinada pela parte" />
        <Item ok={assinado('consentimento_dados')} texto="Consentimento para uso de dados assinado" />
        <Item ok={assinado('declaracao_hipossuficiencia')} texto="Declaração de hipossuficiência assinada" />
        <Item ok={pendentes.length === 0} texto={`Documentos da parte recebidos (${pendentes.length} pendente(s))`} />
      </ul>

      <div className="flex flex-wrap gap-2">
        {caso.status !== 'pronto_protocolo' && !finalizado && (
          <button className="btn-primary" disabled={!pronto} onClick={() => mudarStatus(caso.id, 'pronto_protocolo', 'Pacote aprovado pelo advogado.')}>
            <PackageCheck className="w-4 h-4" /> Aprovar pacote
          </button>
        )}
        {caso.status === 'pronto_protocolo' && (
          <button className="btn-primary" onClick={protocolar}>
            <ClipboardList className="w-4 h-4" /> Registrar protocolo (simulação)
          </button>
        )}
        {finalizado && <Aviso tipo="ok">Protocolado. A parte foi avisada pela conversa.</Aviso>}
      </div>

      {!pronto && !finalizado && (
        <p className="text-xs text-ink-500 mt-2">
          Para aprovar: gere a minuta e obtenha ao menos uma assinatura da parte (ela assina na tela dela).
        </p>
      )}
    </Secao>
  );
}

function Item({ ok, texto }: { ok?: boolean; texto: string }) {
  return (
    <li className={cn('inline-flex items-center gap-2', ok ? 'text-ok-600' : 'text-ink-700')}>
      {ok ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-4 h-4 rounded-full border-2 border-ink-300 inline-block" />} {texto}
    </li>
  );
}
