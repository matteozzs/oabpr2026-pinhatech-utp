'use client';

import { useState } from 'react';
import { Building2, FileSignature, MessageSquareText, Send, UserRound } from 'lucide-react';
import type { Caso } from '@/types';
import { ADVOGADO_DEMO, atualizarDocumento, enviarMensagem, mudarStatus } from '@/lib/store';
import { encontrarCras } from '@/lib/cras';
import { Aviso, Carregando, RotuloIA } from '@/components/ui';
import { iaApi, useIA } from '@/features/ia';

/**
 * Ações rápidas do advogado no chat: pedir documentos (IA), enviar orientação do CRAS,
 * pedir assinatura, e — para a demonstração sem acompanhamento — simular a resposta do assistido.
 */
export function AcoesChatAdvogado({ caso }: { caso: Caso }) {
  const ia = useIA();
  const [rascunho, setRascunho] = useState<string | null>(null);

  const adv = caso.advogado ?? ADVOGADO_DEMO;
  const primeiroNome = caso.assistido.nome.split(' ')[0];
  const docsPendentes = caso.documentos.filter((d) => !d.geradoPelaPlataforma && ['pendente', 'solicitado'].includes(d.status));
  const docsAssinar = caso.documentos.filter((d) => d.exigeAssinatura && d.status !== 'assinado');

  async function pedirDocumentos() {
    const cras = encontrarCras(caso.assistido.cidade);
    const texto = await ia.executar('mensagem', () =>
      iaApi.pedirMensagem({
        advogado: { nome: adv.nome },
        assistido: { primeiroNome, sabeLerEscrever: caso.assistido.sabeLerEscrever, cidade: caso.assistido.cidade },
        pendencias: docsPendentes.map((d) => ({ nome: d.nome, ondeObter: d.ondeObter })),
        cras: cras ? { municipio: cras.municipio, rede: cras.rede, servicos: cras.servicos } : null,
      }),
    );
    if (texto) setRascunho(texto);
  }

  function enviarRascunho() {
    if (!rascunho) return;
    enviarMensagem({ casoId: caso.id, autor: 'advogado', canal: 'chat', tipo: 'texto', texto: rascunho, geradaPorIA: true });
    docsPendentes.filter((d) => d.status === 'pendente').forEach((d) => atualizarDocumento(caso.id, d.id, { status: 'solicitado' }));
    if (caso.status === 'em_atendimento') mudarStatus(caso.id, 'aguardando_documentos', 'Documentos solicitados ao assistido pelo chat.');
    setRascunho(null);
  }

  function enviarCras() {
    const c = encontrarCras(caso.assistido.cidade);
    const texto = c
      ? `${primeiroNome}, se precisar de ajuda para conseguir documentos (certidão, RG, comprovante) ou para fazer o Cadastro Único, procure o CRAS de ${c.municipio} — é o Centro de Referência de Assistência Social, atendimento gratuito. Lá eles ajudam com: ${c.servicos.join(', ')}.\n\nUse o botão abaixo para ver o mais perto de você.`
      : `${primeiroNome}, se precisar de ajuda para conseguir documentos (certidão, RG, comprovante) ou para fazer o Cadastro Único, procure o CRAS mais perto da sua casa — é o Centro de Referência de Assistência Social, atendimento gratuito.\n\nUse o botão abaixo para ver o mais perto de você.`;
    enviarMensagem({ casoId: caso.id, autor: 'advogado', canal: 'chat', tipo: 'orientacao_cras', texto });
  }

  function pedirAssinatura() {
    if (!docsAssinar.length) return;
    const lista = docsAssinar.map((d) => `• ${d.nome}`).join('\n');
    enviarMensagem({
      casoId: caso.id,
      autor: 'advogado',
      canal: 'chat',
      tipo: 'solicitacao_assinatura',
      texto: `${primeiroNome}, preparei os papéis abaixo com os seus dados. Preciso da sua assinatura para dar entrada no pedido:\n\n${lista}\n\nVocê pode assinar pelo celular (assinatura digital), pelo gov.br, ou imprimir, assinar e me mandar a foto.`,
    });
  }

  function simularResposta() {
    const doc = docsPendentes[0];
    enviarMensagem({
      casoId: caso.id,
      autor: 'assistido',
      canal: 'chat',
      tipo: doc ? 'documento' : 'texto',
      texto: doc ? `Doutora, mandei a foto do ${doc.nome.toLowerCase()}. Tá dando pra ver?` : 'Doutora, recebi sim. Muito obrigado pela ajuda.',
      anexo: doc ? { nome: `${doc.nome} (foto simulada).jpg`, documentoId: doc.id } : undefined,
    });
    if (doc) {
      atualizarDocumento(
        caso.id,
        doc.id,
        { status: 'recebido', arquivoNome: `${doc.nome} (foto simulada).jpg` },
        { tipo: 'documento', descricao: `Assistido enviou "${doc.nome}" pelo chat.`, autor: 'assistido' },
      );
    }
  }

  return (
    <div className="space-y-2">
      {rascunho !== null && (
        <div className="rounded-xl border border-navy-100 bg-navy-50 p-3 space-y-2">
          <p className="label">Revise antes de enviar</p>
          <textarea className="input min-h-[160px]" value={rascunho} onChange={(e) => setRascunho(e.target.value)} aria-label="Mensagem ao assistido" />
          <div className="flex gap-2">
            <button className="btn-primary text-xs" onClick={enviarRascunho}>
              <Send className="w-3.5 h-3.5" /> Enviar
            </button>
            <button className="btn-ghost text-xs" onClick={() => setRascunho(null)}>
              Descartar
            </button>
          </div>
          <RotuloIA />
        </div>
      )}

      {ia.ocupado === 'mensagem' && <Carregando texto="Redigindo mensagem acessível…" />}
      {ia.erro && <Aviso tipo="erro">{ia.erro}</Aviso>}

      <div className="flex flex-wrap gap-1.5">
        <button
          className="btn-secondary text-xs py-1.5"
          onClick={pedirDocumentos}
          disabled={ia.ocupado !== null || docsPendentes.length === 0}
          title={docsPendentes.length ? '' : 'Nenhum documento pendente'}
        >
          <MessageSquareText className="w-3.5 h-3.5" /> Pedir documentos (IA)
        </button>
        <button className="btn-secondary text-xs py-1.5" onClick={enviarCras}>
          <Building2 className="w-3.5 h-3.5" /> Orientar ao CRAS
        </button>
        <button className="btn-secondary text-xs py-1.5" onClick={pedirAssinatura} disabled={docsAssinar.length === 0}>
          <FileSignature className="w-3.5 h-3.5" /> Pedir assinatura
        </button>
        <button className="btn-ghost text-xs py-1.5" onClick={simularResposta} title="Somente para a demonstração: simula o assistido respondendo">
          <UserRound className="w-3.5 h-3.5" /> Simular resposta (demo)
        </button>
      </div>
    </div>
  );
}
