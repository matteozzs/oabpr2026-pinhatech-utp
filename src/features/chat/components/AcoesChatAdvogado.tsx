'use client';

import Link from 'next/link';
import { ArrowRight, Building2, FileSignature, FileWarning, Send, Sparkles, UserRound } from 'lucide-react';
import type { Caso } from '@/types';
import { ADVOGADO_DEMO, atualizarCaso, atualizarDocumento, enviarMensagem, mudarStatus, useMensagens } from '@/lib/store';
import { encontrarCras } from '@/lib/cras';
import { Aviso, Carregando, RotuloIA } from '@/components/ui';
import { cn } from '@/lib/utils';
import { iaApi, materialParaResumo, useIA } from '@/features/ia';

/**
 * Ações do advogado dentro da conversa.
 *
 * O único uso de IA aqui é o **resumo dos fatos**: quando o advogado julga ter apurado o
 * suficiente com a parte, a IA transforma mensagens e áudios transcritos numa síntese
 * factual. O restante — pendências, CRAS, assinatura — é determinístico.
 */
export function AcoesChatAdvogado({ caso }: { caso: Caso }) {
  const ia = useIA();
  const mensagens = useMensagens(caso.id);

  const adv = caso.advogado ?? ADVOGADO_DEMO;
  const primeiroNome = caso.assistido.nome.split(' ')[0];
  const docsPendentes = caso.documentos.filter((d) => !d.geradoPelaPlataforma && ['pendente', 'solicitado'].includes(d.status));
  const docsRecebidos = caso.documentos.filter((d) => !d.geradoPelaPlataforma && ['recebido', 'assinado'].includes(d.status));
  const docsAssinar = caso.documentos.filter((d) => d.exigeAssinatura && d.status !== 'assinado');
  const temResumo = Boolean(caso.ia.resumo);
  const material = materialParaResumo(caso, mensagens);

  async function gerarResumo() {
    const r = await ia.executar('resumo', () => iaApi.pedirResumo(caso, mensagens));
    if (!r) return;
    atualizarCaso(caso.id, (c) => ({ ia: { ...c.ia, resumo: r } }), {
      tipo: 'ia',
      descricao: `Resumo dos fatos gerado pela IA (${r.modelo}) a partir da conversa com a parte.`,
      autor: 'ia',
    });
  }

  /** Lista de pendências por template — sem IA. O advogado revisa no chat como qualquer mensagem. */
  function enviarPendencias() {
    if (!docsPendentes.length) return;
    const lista = docsPendentes.map((d, i) => `${i + 1}. ${d.nome}${d.ondeObter ? ` — ${d.ondeObter}` : ''}`).join('\n');
    enviarMensagem({
      casoId: caso.id,
      autor: 'advogado',
      canal: 'chat',
      tipo: 'texto',
      texto: `Oi, ${primeiroNome}. Para eu dar entrada no seu pedido, ainda preciso destes documentos:\n\n${lista}\n\nPode mandar foto por aqui mesmo, bem nítida. Assim que chegar, eu preparo os papéis.\n\n${adv.nome}\nAdvogado(a) dativo(a) nomeado(a) para o seu caso`,
    });
    docsPendentes.filter((d) => d.status === 'pendente').forEach((d) => atualizarDocumento(caso.id, d.id, { status: 'solicitado' }));
    if (caso.status === 'em_atendimento') mudarStatus(caso.id, 'aguardando_documentos', 'Documentos solicitados à parte pela conversa.');
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
      {ia.ocupado === 'resumo' && <Carregando texto="Lendo a conversa e resumindo os fatos…" />}
      {ia.erro && <Aviso tipo="erro">{ia.erro}</Aviso>}

      {/* Alerta determinístico do estado dos documentos — sem IA */}
      {docsPendentes.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-warn-100 px-3 py-2.5">
          <p className="text-xs font-semibold text-warn-600 inline-flex items-center gap-1.5">
            <FileWarning className="w-3.5 h-3.5" />
            {docsPendentes.length} documento(s) pendente(s)
            {docsRecebidos.length > 0 && <span className="font-normal">· {docsRecebidos.length} já entregue(s)</span>}
          </p>
          <p className="text-xs text-warn-600 mt-1">{docsPendentes.map((d) => d.nome).join(' · ')}</p>
          <button className="btn-secondary text-xs py-1 mt-2" onClick={enviarPendencias}>
            <Send className="w-3.5 h-3.5" /> Enviar a lista à parte
          </button>
        </div>
      )}

      {/* Resumo dos fatos: o único uso de IA nesta tela */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1.5 border-b border-ink-200">
        <button
          className="btn-primary text-xs py-1.5"
          onClick={gerarResumo}
          disabled={ia.ocupado !== null || !material.suficiente}
          title={material.suficiente ? '' : material.motivo}
        >
          <Sparkles className="w-3.5 h-3.5" /> {temResumo ? 'Atualizar resumo dos fatos' : 'Resumir os fatos'}
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

      {temResumo && <RotuloIA />}

      <div className="flex flex-wrap gap-1.5">
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
