'use client';

import { useState } from 'react';
import { Check, Copy, Mail, Send, Sparkles } from 'lucide-react';
import type { Caso } from '@/types';
import { ADVOGADO_DEMO, enviarMensagem } from '@/lib/store';
import { encontrarCras } from '@/lib/cras';
import { Aviso, Campo, Carregando, RotuloIA } from '@/components/ui';
import { iaApi, useIA } from '@/features/ia';

/**
 * Composição de e-mail para a parte.
 *
 * A plataforma não tem servidor de e-mail nesta versão: o envio abre o cliente de e-mail
 * do próprio advogado (`mailto:`) e registra a mensagem na conversa do caso, para a trilha
 * de auditoria ficar completa. O disparo pelo servidor está no roadmap.
 */
export function ComporEmail({ caso }: { caso: Caso }) {
  const ia = useIA();
  const adv = caso.advogado ?? ADVOGADO_DEMO;
  const primeiroNome = caso.assistido.nome.split(' ')[0];
  const destino = caso.assistido.email ?? '';

  const [assunto, setAssunto] = useState(`Seu processo — protocolo ${caso.protocolo}`);
  const [corpo, setCorpo] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const pendentes = caso.documentos.filter((d) => !d.geradoPelaPlataforma && ['pendente', 'solicitado'].includes(d.status));

  async function redigirComIA() {
    const cras = encontrarCras(caso.assistido.cidade);
    const r = await ia.executar('mensagem', () =>
      iaApi.pedirMensagem({
        canal: 'email',
        advogado: { nome: adv.nome },
        assistido: { primeiroNome, sabeLerEscrever: caso.assistido.sabeLerEscrever, cidade: caso.assistido.cidade },
        pendencias: pendentes.map((d) => ({ nome: d.nome, ondeObter: d.ondeObter })),
        cras: cras ? { municipio: cras.municipio, rede: cras.rede, servicos: cras.servicos } : null,
      }),
    );
    if (!r) return;
    setCorpo(r.texto);
    if (r.assunto.trim()) setAssunto(r.assunto.trim());
    setEnviado(false);
  }

  function abrirNoClienteDeEmail() {
    if (!corpo.trim()) return;
    const url = `mailto:${encodeURIComponent(destino)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.open(url, '_blank');
    enviarMensagem({
      casoId: caso.id,
      autor: 'advogado',
      canal: 'email',
      tipo: 'email',
      assunto,
      texto: corpo,
      geradaPorIA: Boolean(ia.metas.mensagem),
    });
    setEnviado(true);
  }

  async function copiar() {
    await navigator.clipboard.writeText(`Assunto: ${assunto}\n\n${corpo}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (!destino) {
    return (
      <Aviso tipo="alerta">
        A parte não tem e-mail cadastrado. Preencha em <strong>Documentos → Dados da parte</strong> ou use o chat da plataforma.
      </Aviso>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Campo rotulo="Para" htmlFor="email-para">
          <input id="email-para" className="input bg-ink-100" value={destino} readOnly />
        </Campo>
        <Campo rotulo="Assunto" htmlFor="email-assunto">
          <input id="email-assunto" className="input" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
        </Campo>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <label className="label mb-0" htmlFor="email-corpo">
            Mensagem
          </label>
          <button className="btn-secondary text-xs py-1.5" onClick={redigirComIA} disabled={ia.ocupado !== null}>
            <Sparkles className="w-3.5 h-3.5" /> {corpo ? 'Redigir de novo com IA' : 'Redigir com IA'}
          </button>
        </div>
        <textarea
          id="email-corpo"
          className="input min-h-[220px]"
          value={corpo}
          onChange={(e) => {
            setCorpo(e.target.value);
            setEnviado(false);
          }}
          placeholder={
            pendentes.length
              ? `Use "Redigir com IA" para pedir os ${pendentes.length} documento(s) pendente(s) em linguagem acessível — ou escreva você mesmo.`
              : 'Escreva a mensagem, ou use a IA para redigir.'
          }
        />
      </div>

      {ia.ocupado === 'mensagem' && <Carregando texto="Redigindo e-mail acessível…" />}
      {ia.erro && <Aviso tipo="erro">{ia.erro}</Aviso>}
      {corpo && ia.metas.mensagem && <RotuloIA modelo={ia.metas.mensagem.modelo} />}

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={abrirNoClienteDeEmail} disabled={!corpo.trim()}>
          <Send className="w-4 h-4" /> Enviar pelo meu e-mail
        </button>
        <button className="btn-secondary" onClick={copiar} disabled={!corpo.trim()}>
          {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiado ? 'Copiado' : 'Copiar'}
        </button>
        {enviado && (
          <span className="text-sm text-ok-600 inline-flex items-center gap-1">
            <Check className="w-4 h-4" /> Registrado na conversa do caso
          </span>
        )}
      </div>

      <p className="text-[11px] text-ink-500 inline-flex items-start gap-1.5">
        <Mail className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Nesta versão o envio abre o seu próprio cliente de e-mail e registra a mensagem no histórico do caso — a plataforma não dispara
          e-mail por conta própria. O disparo pelo servidor está no roadmap.
        </span>
      </p>
    </div>
  );
}
