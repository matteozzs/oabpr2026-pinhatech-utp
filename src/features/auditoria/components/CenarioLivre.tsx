'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Trash2, Wand2 } from 'lucide-react';
import comarcasJson from '@/data/comarcas.json';
import { Aviso, Campo, Secao } from '@/components/ui';
import { MINIMO_MATERIAL } from '@/features/ia';
import { AREA_LABEL, type Area } from '@/types';
import { capitalizarNome, cn, mascaraCPF } from '@/lib/utils';
import { criarCasoDeCenario } from '../criar';

type Fala = { autor: 'assistido' | 'advogado'; texto: string };

/**
 * Cenário livre: o avaliador monta o caso que quiser e a conversa que quiser,
 * e abre o resultado como advogado. É o que permite testar hipóteses fora da lista pronta.
 */
export function CenarioLivre() {
  const router = useRouter();

  const [area, setArea] = useState<Area>('familia');
  const [comarca, setComarca] = useState('Curitiba');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [profissao, setProfissao] = useState('');
  const [renda, setRenda] = useState('');
  const [membros, setMembros] = useState('');
  const [sabeLer, setSabeLer] = useState(true);
  const [nomeReu, setNomeReu] = useState('');
  const [relacaoReu, setRelacaoReu] = useState('');
  const [relato, setRelato] = useState('');
  const [origemRelato, setOrigemRelato] = useState<'texto' | 'voz'>('texto');
  const [urgencia, setUrgencia] = useState(false);
  const [motivoUrgencia, setMotivoUrgencia] = useState('');
  const [falas, setFalas] = useState<Fala[]>([{ autor: 'assistido', texto: '' }]);
  const [criado, setCriado] = useState<{ id: string; protocolo: string } | null>(null);

  const comarcas = comarcasJson.comarcas.map((c) => capitalizarNome(c.nome));
  const material = relato.trim().length + falas.filter((f) => f.autor === 'assistido').reduce((s, f) => s + f.texto.trim().length, 0);
  const pode = nome.trim().length >= 3 && comarca.trim().length > 0;

  function criar() {
    const caso = criarCasoDeCenario({
      area,
      comarca,
      cenarioTeste: 'livre',
      assistido: {
        nome: nome.trim(),
        tipoPessoa: 'PF',
        cpf: cpf || undefined,
        cidade: comarca,
        uf: 'PR',
        profissao: profissao || undefined,
        rendaFamiliarMensal: renda ? Number(renda) : undefined,
        membrosFamilia: membros ? Number(membros) : undefined,
        sabeLerEscrever: sabeLer,
      },
      parteContraria: nomeReu ? { nome: nomeReu.trim(), tipoPessoa: 'PF', relacao: relacaoReu || undefined } : undefined,
      relato: { texto: relato.trim(), origem: origemRelato, urgencia, motivoUrgencia: urgencia ? motivoUrgencia : undefined },
      conversa: falas.filter((f) => f.texto.trim()).map((f) => ({ autor: f.autor, texto: f.texto.trim() })),
    });
    setCriado({ id: caso.id, protocolo: caso.protocolo });
  }

  if (criado) {
    return (
      <Secao titulo="Cenário livre" descricao="Criado. Abra como advogado para rodar a IA.">
        <Aviso tipo="ok">
          Caso <strong>{criado.protocolo}</strong> criado com {falas.filter((f) => f.texto.trim()).length} mensagem(ns).
        </Aviso>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => router.push(`/advogado/chat/${criado.id}`)}>
            Abrir a conversa <ArrowRight className="w-4 h-4" />
          </button>
          <button className="btn-secondary" onClick={() => router.push(`/advogado/caso/${criado.id}`)}>
            Abrir o caso
          </button>
          <button className="btn-ghost" onClick={() => setCriado(null)}>
            Montar outro
          </button>
        </div>
      </Secao>
    );
  }

  return (
    <Secao
      titulo="Cenário livre"
      descricao="Monte o caso e a conversa que quiser. Útil para testar hipóteses que não estão na lista acima."
      acoes={
        <button className="btn-primary" onClick={criar} disabled={!pode}>
          <Wand2 className="w-4 h-4" /> Criar e abrir
        </button>
      }
    >
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <Campo rotulo="Área" obrigatorio>
            <div className="flex gap-2">
              {(['familia', 'consumidor'] as Area[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={cn('btn flex-1 text-sm', area === a ? 'bg-navy-700 text-white' : 'bg-white border border-ink-200')}
                  aria-pressed={area === a}
                >
                  {a === 'familia' ? 'Família' : 'Consumidor'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-500 mt-1">{AREA_LABEL[area]}</p>
          </Campo>
          <Campo rotulo="Comarca" obrigatorio htmlFor="cl-comarca">
            <input id="cl-comarca" list="cl-comarcas" className="input" value={comarca} onChange={(e) => setComarca(e.target.value)} />
            <datalist id="cl-comarcas">
              {comarcas.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Campo>
        </div>

        <div>
          <p className="label">Parte assistida</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Campo rotulo="Nome" obrigatorio htmlFor="cl-nome">
              <input id="cl-nome" className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Ana Paula Rocha" />
            </Campo>
            <Campo rotulo="CPF" htmlFor="cl-cpf" dica="Deixe vazio para testar a lacuna">
              <input id="cl-cpf" className="input" value={cpf} onChange={(e) => setCpf(mascaraCPF(e.target.value))} />
            </Campo>
            <Campo rotulo="Profissão" htmlFor="cl-prof">
              <input id="cl-prof" className="input" value={profissao} onChange={(e) => setProfissao(e.target.value)} />
            </Campo>
            <Campo rotulo="Renda mensal (R$)" htmlFor="cl-renda" dica="Vazio testa a triagem de hipossuficiência">
              <input id="cl-renda" className="input" inputMode="numeric" value={renda} onChange={(e) => setRenda(e.target.value.replace(/\D/g, ''))} />
            </Campo>
            <Campo rotulo="Pessoas na família" htmlFor="cl-membros">
              <input id="cl-membros" className="input" inputMode="numeric" value={membros} onChange={(e) => setMembros(e.target.value.replace(/\D/g, ''))} />
            </Campo>
            <Campo rotulo="Sabe ler e escrever">
              <div className="flex gap-2">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setSabeLer(v)}
                    className={cn('btn flex-1 text-sm', sabeLer === v ? 'bg-navy-700 text-white' : 'bg-white border border-ink-200')}
                    aria-pressed={sabeLer === v}
                  >
                    {v ? 'Sim' : 'Tem dificuldade'}
                  </button>
                ))}
              </div>
            </Campo>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Campo rotulo="Parte contrária" htmlFor="cl-reu">
            <input id="cl-reu" className="input" value={nomeReu} onChange={(e) => setNomeReu(e.target.value)} />
          </Campo>
          <Campo rotulo="Vínculo" htmlFor="cl-rel">
            <input id="cl-rel" className="input" value={relacaoReu} onChange={(e) => setRelacaoReu(e.target.value)} placeholder="ex-marido, banco, loja…" />
          </Campo>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <label className="label mb-0" htmlFor="cl-relato">
              Relato inicial
            </label>
            <div className="flex gap-1">
              {(['texto', 'voz'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrigemRelato(o)}
                  className={cn('badge', origemRelato === o ? 'bg-navy-700 text-white' : 'bg-ink-100 text-ink-700')}
                  aria-pressed={origemRelato === o}
                >
                  {o === 'texto' ? 'por texto' : 'por voz (transcrito)'}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="cl-relato"
            className="input min-h-[120px]"
            value={relato}
            onChange={(e) => setRelato(e.target.value)}
            placeholder="O que a parte contou. Deixe vazio para testar o bloqueio do resumo sem material."
          />
          <label className="mt-2 flex items-start gap-2 text-sm text-ink-700">
            <input type="checkbox" className="mt-1" checked={urgencia} onChange={(e) => setUrgencia(e.target.checked)} />
            <span>A parte alega urgência</span>
          </label>
          {urgencia && (
            <input
              className="input mt-2"
              value={motivoUrgencia}
              onChange={(e) => setMotivoUrgencia(e.target.value)}
              placeholder="Motivo alegado — use algo vago para testar se a IA aceita pressa como urgência"
              aria-label="Motivo da urgência"
            />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="label mb-0">Conversa</p>
            <button className="btn-secondary text-xs py-1.5" onClick={() => setFalas((f) => [...f, { autor: 'assistido', texto: '' }])}>
              <Plus className="w-3.5 h-3.5" /> Mensagem
            </button>
          </div>
          <ul className="space-y-2">
            {falas.map((f, i) => (
              <li key={i} className="flex gap-2">
                <select
                  className="input w-36 py-2 text-xs shrink-0"
                  value={f.autor}
                  onChange={(e) => setFalas((fs) => fs.map((x, j) => (j === i ? { ...x, autor: e.target.value as Fala['autor'] } : x)))}
                  aria-label={`Autor da mensagem ${i + 1}`}
                >
                  <option value="assistido">Parte</option>
                  <option value="advogado">Advogado</option>
                </select>
                <textarea
                  className="input min-h-[44px]"
                  rows={2}
                  value={f.texto}
                  onChange={(e) => setFalas((fs) => fs.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)))}
                  aria-label={`Mensagem ${i + 1}`}
                />
                <button
                  className="btn-ghost px-2 shrink-0"
                  onClick={() => setFalas((fs) => (fs.length > 1 ? fs.filter((_, j) => j !== i) : fs))}
                  aria-label={`Remover mensagem ${i + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <p className={cn('text-xs mt-2', material >= MINIMO_MATERIAL ? 'text-ok-600' : 'text-warn-600')}>
            Material factual: {material} caracteres (relato + falas da parte).{' '}
            {material >= MINIMO_MATERIAL
              ? 'Suficiente para gerar o resumo.'
              : `Abaixo de ${MINIMO_MATERIAL}, o botão de resumo fica bloqueado de propósito — este é um teste válido.`}
          </p>
        </div>
      </div>
    </Secao>
  );
}
