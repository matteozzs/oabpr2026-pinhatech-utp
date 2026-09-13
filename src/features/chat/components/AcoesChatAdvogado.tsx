'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, FileSignature, MessageSquareText, Send, Sparkles, UserRound } from 'lucide-react';
import type { Caso } from '@/types';
import { ADVOGADO_DEMO, atualizarCaso, atualizarDocumento, enviarMensagem, mudarStatus, useMensagens } from '@/lib/store';
import { encontrarCras } from '@/lib/cras';
import { Aviso, Carregando, RotuloIA } from '@/components/ui';
import { cn } from '@/lib/utils';
import { iaApi, materialParaResumo, useIA } from '@/features/ia';

/**
 * Ações do advogado dentro da conversa.
 *
 * É daqui que nasce o **resumo fático**: quando o advogado julga ter apurado o suficiente
 * com a parte — por mensagem ou áudio transcrito — ele gera o resumo, que passa a existir
 * no painel do caso. Um atalho aparece ao lado do botão assim que o resumo fica pronto.
 */
export function AcoesChatAdvogado({ caso }: { caso: Caso }) {
  const ia = useIA();
  const mensagens = useMensagens(caso.id);
  const [rascunho, setRascunho] = useState<string | null>(null);

  const adv = caso.advogado ?? ADVOGADO_DEMO;
  const primeiroNome = caso.assistido.nome.split(' ')[0];
  const docsPendentes = caso.documentos.filter((d) => !d.geradoPelaPlataforma && ['pendente', 'solicitado'].includes(d.status));
  const docsAssinar = caso.documentos.filter((d) => d.exigeAssinatura && d.status !== 'assinado');
  const temResumo = Boolean(caso.ia.resumo);
  // Sem material factual não há o que resumir — e pedir resumo do nada é convite à alucinação.
  const material = materialParaResumo(caso, mensagens);

  async function gerarResumo() {
    const r = await ia.executar('resumo', () => iaApi.pedirResumo(caso, mensagens));
    if (!r) return;
    atualizarCaso(caso.id, (c) => ({ ia: { ...c.ia, resumo: r } }), {
      tipo: 'ia',
      descricao: `Resumo fático gerado pela IA (${r.modelo}) a partir da conversa com a parte.`,
      autor: 'ia',
    });
  }

  async function pedirDocumentos() {
    const cras = encontrarCras(caso.assistido.cidade);
    const r = await ia.executar('mensagem', () =>
      iaApi.pedirMensagem({
        canal: 'chat',
        advogado: { nome: adv.nome },
        assistido: { primeiroNome, sabeLerEscrever: caso.assistido.sabeLerEscrever, cidade: caso.assistido.cidade },
        pendencias: docsPendentes.map((d) => ({ nome: d.nome, ondeObter: d.ondeObter })),
        cras: cras ? { municipio: cras.municipio, rede: cras.rede, servicos: cras.servicos } : null,
      }),
    );
    if (r) setRascunho(r.texto);
  }

  function enviarRascunho() {
    if (!rascunho) return;
    enviarMensagem({ casoId: caso.id, autor: 'advogado', canal: 'chat', tipo: 'texto', texto: rascunho, geradaPorIA: true });
    docsPendentes.filter((d) => d.status === 'pendente').forEach((d) => atualizarDocumento(caso.id, d.id, { status: 'solicitado' }));
    if (caso.status === 'em_atendimento') mudarStatus(caso.id, 'aguardando_documentos', 'Documentos solicitados à parte pela conversa.');
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
        { tipo: 'documento', descricao: `Parte enviou "${doc.nome}" pela conversa.`, autor: 'assistido' },
      );
    }
  }

  return (
    <div className="space-y-2">
      {rascunho !== null && (
        <div className="rounded-xl border border-navy-100 bg-navy-50 p-3 space-y-2">
          <p className="label">Revise antes de enviar</p>
          <textarea className="input min-h-[160px]" value={rascunho} onChange={(e) => setRascunho(e.target.value)} aria-label="Mensagem à parte" />
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

      {ia.ocupado === 'resumo' && <Carregando texto="Lendo a conversa e consolidando o resumo fático…" />}
      {ia.ocupado === 'mensagem' && <Carregando texto="Redigindo mensagem acessível…" />}
      {ia.erro && <Aviso tipo="erro">{ia.erro}</Aviso>}

      {/* Resumo fático: o passo que fecha a apuração */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1.5 border-b border-ink-200">
        <button
          className="btn-primary text-xs py-1.5"
          onClick={gerarResumo}
          disabled={ia.ocupado !== null || !material.suficiente}
          title={material.suficiente ? '' : material.motivo}
        >
          <Sparkles className="w-3.5 h-3.5" /> {temResumo ? 'Atualizar resumo fático' : 'Gerar resumo fático'}
        </button>

        {temResumo && (
          <Link href={`/advogado/caso/${caso.id}?secao=resumo`} className="btn-secondary text-xs py-1.5">
            Ver no painel do caso <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

        <span className={cn('text-[11px] ml-1', material.suficiente ? 'text-ink-500' : 'text-warn-600')}>
          {material.suficiente ? `a partir de: ${material.origem} · ${material.caracteres} caracteres` : material.motivo}
        </span>
      </div>

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
        <button className="btn-ghost text-xs py-1.5" onClick={simularResposta} title="Somente para a demonstração: simula a parte respondendo">
          <UserRound className="w-3.5 h-3.5" /> Simular resposta (demo)
        </button>
      </div>
    </div>
  );
}
