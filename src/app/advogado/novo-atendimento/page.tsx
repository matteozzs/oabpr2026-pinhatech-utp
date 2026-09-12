'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, ClipboardPlus, Mic, MicOff } from 'lucide-react';
import comarcasJson from '@/data/comarcas.json';
import { criarCaso, entrarComo, usePerfil } from '@/lib/store';
import { useSpeech } from '@/hooks/use-speech';
import { Aviso, Campo, Secao } from '@/components/ui';
import { AREA_LABEL, type Area } from '@/types';
import { capitalizarNome, cn, mascaraCPF, mascaraTelefone } from '@/lib/utils';

/**
 * Cadastro do atendimento pelo advogado já nomeado.
 * Fluxo real: a OAB/Fórum nomeia → o advogado aceita → registra aqui o caso e o relato do assistido
 * (que pode ter chegado por telefone, WhatsApp, áudio ou atendimento presencial).
 */
export default function NovoAtendimentoPage() {
  const router = useRouter();
  const perfil = usePerfil();
  const [erro, setErro] = useState<string | null>(null);

  const [origem, setOrigem] = useState<'oab' | 'forum'>('oab');
  const [referencia, setReferencia] = useState('');
  const [area, setArea] = useState<Area>('familia');
  const [comarca, setComarca] = useState('');
  const [temProcesso, setTemProcesso] = useState(false);
  const [numeroProcesso, setNumeroProcesso] = useState('');

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cidade, setCidade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [sabeLer, setSabeLer] = useState(true);
  const [renda, setRenda] = useState('');
  const [membros, setMembros] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [profissao, setProfissao] = useState('');

  const [nomeReu, setNomeReu] = useState('');
  const [relacaoReu, setRelacaoReu] = useState('');
  const [relato, setRelato] = useState('');
  const [origemRelato, setOrigemRelato] = useState<'texto' | 'voz'>('texto');
  const [urgencia, setUrgencia] = useState(false);
  const [motivoUrgencia, setMotivoUrgencia] = useState('');

  const fala = useSpeech((t) => {
    setRelato((r) => (r ? r + ' ' : '') + t.trim());
    setOrigemRelato('voz');
  });
  const comarcas = useMemo(() => comarcasJson.comarcas.map((c) => capitalizarNome(c.nome)), []);

  useEffect(() => {
    if (perfil !== 'advogado') entrarComo('advogado');
  }, [perfil]);

  const pode = nome.trim().length >= 3 && cidade.trim() && comarca.trim() && relato.trim().length >= 30;

  function salvar() {
    setErro(null);
    try {
      const caso = criarCaso({
        area,
        comarca,
        temProcessoAtivo: temProcesso,
        numeroProcesso: temProcesso ? numeroProcesso || undefined : undefined,
        registradoPor: 'advogado',
        nomeacao: { origem, referencia: referencia || undefined },
        assistido: {
          nome: nome.trim(),
          tipoPessoa: 'PF',
          cpf: cpf || undefined,
          cidade: cidade.trim(),
          uf: 'PR',
          telefone: telefone || undefined,
          whatsapp: telefone || undefined,
          sabeLerEscrever: sabeLer,
          rendaFamiliarMensal: renda ? Number(renda) : undefined,
          membrosFamilia: membros ? Number(membros) : undefined,
          estadoCivil: estadoCivil || undefined,
          profissao: profissao || undefined,
        },
        parteContraria: nomeReu ? { nome: nomeReu.trim(), tipoPessoa: 'PF', relacao: relacaoReu || undefined } : undefined,
        relato: { texto: relato.trim(), origem: origemRelato, urgencia, motivoUrgencia: urgencia ? motivoUrgencia : undefined },
      });
      router.push(`/advogado/caso/${caso.id}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível registrar.');
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button className="btn-ghost -ml-3" onClick={() => router.push('/advogado/dashboard')}>
        <ArrowLeft className="w-4 h-4" /> Painel
      </button>
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950 inline-flex items-center gap-2">
          <ClipboardPlus className="w-7 h-7 text-navy-700" /> Novo atendimento
        </h1>
        <p className="text-ink-700 mt-1">Você já foi nomeado(a) e aceitou. Registre aqui o caso e o relato do assistido — a IA cuida do resto.</p>
      </div>

      <Secao titulo="Nomeação" descricao="Feita pela OAB/PR ou pela Vara. Só para referência.">
        <div className="grid sm:grid-cols-3 gap-4">
          <Campo rotulo="Origem">
            <div className="flex gap-2">
              {(['oab', 'forum'] as const).map((v) => (
                <button key={v} type="button" onClick={() => setOrigem(v)} className={cn('btn flex-1', origem === v ? 'bg-navy-700 text-white' : 'bg-white border border-ink-200')} aria-pressed={origem === v}>
                  {v === 'oab' ? 'OAB/PR' : 'Vara / Fórum'}
                </button>
              ))}
            </div>
          </Campo>
          <div className="sm:col-span-2">
            <Campo rotulo="Referência (ofício, número, data)" htmlFor="ref">
              <input id="ref" className="input" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ex.: Ofício 123/2026 — 2ª Vara de Família" />
            </Campo>
          </div>
        </div>
      </Secao>

      <Secao titulo="Caso">
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo rotulo="Área" obrigatorio>
            <div className="flex gap-2">
              {(['familia', 'consumidor'] as Area[]).map((a) => (
                <button key={a} type="button" onClick={() => setArea(a)} className={cn('btn flex-1', area === a ? 'bg-navy-700 text-white' : 'bg-white border border-ink-200')} aria-pressed={area === a}>
                  {a === 'familia' ? 'Família' : 'Consumidor'}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-500 mt-1">{AREA_LABEL[area]}</p>
          </Campo>
          <Campo rotulo="Comarca" obrigatorio htmlFor="comarca">
            <input id="comarca" list="lista-comarcas" className="input" value={comarca} onChange={(e) => setComarca(e.target.value)} />
            <datalist id="lista-comarcas">
              {comarcas.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Campo>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={temProcesso} onChange={(e) => setTemProcesso(e.target.checked)} /> Já existe processo em andamento
          </label>
          {temProcesso && (
            <Campo rotulo="Número do processo" htmlFor="nproc">
              <input id="nproc" className="input" value={numeroProcesso} onChange={(e) => setNumeroProcesso(e.target.value)} placeholder="0000000-00.0000.8.16.0000" />
            </Campo>
          )}
        </div>
      </Secao>

      <Secao titulo="Assistido" descricao="O que faltar vira [A COMPLETAR EM ENTREVISTA] nos documentos — a plataforma não inventa.">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Campo rotulo="Nome completo" obrigatorio htmlFor="nome">
              <input id="nome" className="input" value={nome} onChange={(e) => setNome(e.target.value)} />
            </Campo>
          </div>
          <Campo rotulo="CPF" htmlFor="cpf">
            <input id="cpf" className="input" inputMode="numeric" value={cpf} onChange={(e) => setCpf(mascaraCPF(e.target.value))} />
          </Campo>
          <Campo rotulo="Cidade" obrigatorio htmlFor="cidade">
            <input id="cidade" list="lista-comarcas" className="input" value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </Campo>
          <Campo rotulo="Telefone / WhatsApp" htmlFor="tel">
            <input id="tel" className="input" inputMode="tel" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} />
          </Campo>
          <Campo rotulo="Estado civil" htmlFor="ec">
            <input id="ec" className="input" value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} />
          </Campo>
          <Campo rotulo="Profissão" htmlFor="prof">
            <input id="prof" className="input" value={profissao} onChange={(e) => setProfissao(e.target.value)} />
          </Campo>
          <Campo rotulo="Renda familiar mensal (R$)" htmlFor="renda">
            <input id="renda" className="input" inputMode="numeric" value={renda} onChange={(e) => setRenda(e.target.value.replace(/\D/g, ''))} />
          </Campo>
          <Campo rotulo="Pessoas na família" htmlFor="membros">
            <input id="membros" className="input" inputMode="numeric" value={membros} onChange={(e) => setMembros(e.target.value.replace(/\D/g, ''))} />
          </Campo>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={!sabeLer} onChange={(e) => setSabeLer(!e.target.checked)} /> O assistido tem dificuldade para ler e escrever (a comunicação será adaptada)
          </label>
        </div>
      </Secao>

      <Secao titulo="Relato do assistido" descricao="Cole o texto, transcreva o áudio pelo microfone, ou digite o que o assistido contou.">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {fala.suportado && (
              <button type="button" className={cn(fala.ouvindo ? 'btn-danger' : 'btn-secondary')} onClick={fala.ouvindo ? fala.parar : fala.iniciar} aria-pressed={fala.ouvindo}>
                {fala.ouvindo ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {fala.ouvindo ? 'Parar' : 'Transcrever pelo microfone'}
              </button>
            )}
            {fala.ouvindo && <span className="text-xs text-danger-600 animate-pulse">● Ouvindo…</span>}
            {fala.parcial && <span className="text-xs text-ink-500 italic">{fala.parcial}</span>}
          </div>
          {fala.erro && <Aviso tipo="alerta">{fala.erro}</Aviso>}
          <textarea className="input min-h-[160px]" value={relato} onChange={(e) => setRelato(e.target.value)} aria-label="Relato" placeholder="Ex.: A assistida relata que o ex-companheiro não paga a pensão dos dois filhos desde maio…" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Campo rotulo="Parte contrária" htmlFor="reu">
              <input id="reu" className="input" value={nomeReu} onChange={(e) => setNomeReu(e.target.value)} />
            </Campo>
            <Campo rotulo="Relação / vínculo" htmlFor="rel">
              <input id="rel" className="input" value={relacaoReu} onChange={(e) => setRelacaoReu(e.target.value)} />
            </Campo>
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-ink-200 p-3 cursor-pointer">
            <input type="checkbox" className="mt-1 w-4 h-4" checked={urgencia} onChange={(e) => setUrgencia(e.target.checked)} />
            <span className="text-sm text-ink-700">
              <span className="font-semibold text-ink-900 inline-flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-warn-600" /> Há urgência
              </span>{' '}
              — risco concreto e atual (alimentos de criança, serviço essencial cortado, saúde).
            </span>
          </label>
          {urgencia && (
            <Campo rotulo="Motivo" htmlFor="urg">
              <input id="urg" className="input" value={motivoUrgencia} onChange={(e) => setMotivoUrgencia(e.target.value)} />
            </Campo>
          )}
        </div>
      </Secao>

      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      <div className="flex justify-end">
        <button className="btn-primary" disabled={!pode} onClick={salvar}>
          <ClipboardPlus className="w-4 h-4" /> Registrar atendimento
        </button>
      </div>
    </div>
  );
}
