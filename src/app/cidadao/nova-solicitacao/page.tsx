'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Mic, MicOff, Send } from 'lucide-react';
import comarcasJson from '@/data/comarcas.json';
import { ADVOGADO_DEMO, criarCaso, entrarComo, usePerfil } from '@/lib/store';
import { useSpeech } from '@/hooks/use-speech';
import { Aviso, Campo, Secao } from '@/components/ui';
import { AREA_LABEL, type Area } from '@/types';
import { capitalizarNome, cn, mascaraTelefone } from '@/lib/utils';

const PASSOS = ['Sobre o problema', 'Sobre você', 'Seu relato', 'Revisar e enviar'];

export default function NovaSolicitacaoPage() {
  const router = useRouter();
  const perfil = usePerfil();
  const [passo, setPasso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [area, setArea] = useState<Area | ''>('');
  const [comarca, setComarca] = useState('');
  const [temProcesso, setTemProcesso] = useState<'nao' | 'sim'>('nao');
  const [numeroProcesso, setNumeroProcesso] = useState('');

  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [sabeLer, setSabeLer] = useState<'sim' | 'nao'>('sim');
  const [renda, setRenda] = useState('');
  const [membros, setMembros] = useState('');
  const [cpf, setCpf] = useState('');

  const [relato, setRelato] = useState('');
  const [origem, setOrigem] = useState<'texto' | 'voz'>('texto');
  const [urgencia, setUrgencia] = useState(false);
  const [motivoUrgencia, setMotivoUrgencia] = useState('');
  const [nomeReu, setNomeReu] = useState('');
  const [relacaoReu, setRelacaoReu] = useState('');

  const fala = useSpeech((t) => {
    setRelato((r) => (r ? r + ' ' : '') + t.trim());
    setOrigem('voz');
  });

  const comarcas = useMemo(() => comarcasJson.comarcas.map((c) => capitalizarNome(c.nome)), []);

  useEffect(() => {
    if (perfil !== 'cidadao') entrarComo('cidadao');
  }, [perfil]);

  const podeAvancar = [Boolean(area && comarca), nome.trim().length >= 3 && cidade.trim().length >= 2, relato.trim().length >= 30, true][passo];

  async function enviar() {
    if (!area) return;
    setEnviando(true);
    setErro(null);
    try {
      const caso = criarCaso({
        registradoPor: 'assistido',
        area,
        comarca,
        temProcessoAtivo: temProcesso === 'sim',
        numeroProcesso: temProcesso === 'sim' ? numeroProcesso || undefined : undefined,
        assistido: {
          nome: nome.trim(),
          tipoPessoa: 'PF',
          cpf: cpf || undefined,
          cidade: cidade.trim(),
          uf: 'PR',
          telefone: telefone || undefined,
          whatsapp: telefone || undefined,
          sabeLerEscrever: sabeLer === 'sim',
          rendaFamiliarMensal: renda ? Number(renda) : undefined,
          membrosFamilia: membros ? Number(membros) : undefined,
        },
        parteContraria: nomeReu ? { nome: nomeReu.trim(), tipoPessoa: 'PF', relacao: relacaoReu || undefined } : undefined,
        relato: { texto: relato.trim(), origem, urgencia, motivoUrgencia: urgencia ? motivoUrgencia : undefined },
      });
      router.push(`/cidadao/solicitacao/${caso.id}?nova=1`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível registrar.');
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950">Nova solicitação</h1>
        <p className="text-ink-700 mt-1">Leva uns 3 minutos. Você pode falar em vez de escrever.</p>
      </div>

      <ol className="flex items-center gap-2 text-xs" aria-label="Etapas">
        {PASSOS.map((p, i) => (
          <li key={p} className={cn('flex-1 rounded-full h-1.5', i <= passo ? 'bg-navy-700' : 'bg-ink-200')} aria-current={i === passo ? 'step' : undefined}>
            <span className="sr-only">{p}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm font-semibold text-navy-900">
        Etapa {passo + 1} de {PASSOS.length}: {PASSOS[passo]}
      </p>

      {passo === 0 && (
        <Secao titulo="Qual é o tipo do problema?">
          <div className="grid sm:grid-cols-2 gap-3">
            {(['familia', 'consumidor'] as Area[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setArea(a)}
                className={cn('rounded-2xl border-2 p-4 text-left transition', area === a ? 'border-navy-700 bg-navy-50' : 'border-ink-200 hover:border-navy-500')}
                aria-pressed={area === a}
              >
                <p className="font-bold text-ink-900">{a === 'familia' ? 'Família' : 'Consumidor'}</p>
                <p className="text-sm text-ink-700 mt-1">
                  {a === 'familia' ? 'Pensão, guarda dos filhos, divórcio, união estável.' : 'Cobrança errada, nome negativado, produto com defeito, água/luz cortada, golpe bancário.'}
                </p>
                <p className="text-[11px] text-ink-500 mt-2">{AREA_LABEL[a]}</p>
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <Campo rotulo="Comarca (cidade do fórum)" obrigatorio htmlFor="comarca" dica="Normalmente é a cidade onde você mora ou onde mora a criança.">
              <input id="comarca" list="lista-comarcas" className="input" value={comarca} onChange={(e) => setComarca(e.target.value)} placeholder="Comece a digitar…" />
              <datalist id="lista-comarcas">
                {comarcas.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Campo>
            <Campo rotulo="Já existe processo na Justiça sobre isso?" obrigatorio>
              <div className="flex gap-2">
                {(['nao', 'sim'] as const).map((v) => (
                  <button key={v} type="button" onClick={() => setTemProcesso(v)} className={cn('btn flex-1', temProcesso === v ? 'bg-navy-700 text-white' : 'bg-white border border-ink-200')} aria-pressed={temProcesso === v}>
                    {v === 'nao' ? 'Não' : 'Sim'}
                  </button>
                ))}
              </div>
            </Campo>
            {temProcesso === 'sim' && (
              <Campo rotulo="Número do processo (se souber)" htmlFor="nproc" dica="Fica no topo de qualquer papel da Justiça. Pode deixar em branco.">
                <input id="nproc" className="input" value={numeroProcesso} onChange={(e) => setNumeroProcesso(e.target.value)} placeholder="0000000-00.0000.8.16.0000" />
              </Campo>
            )}
          </div>
        </Secao>
      )}

      {passo === 1 && (
        <Secao titulo="Sobre você" descricao="Só o básico. O resto o(a) advogado(a) completa com você depois.">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Campo rotulo="Seu nome completo" obrigatorio htmlFor="nome">
                <input id="nome" className="input" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
              </Campo>
            </div>
            <Campo rotulo="Cidade onde você mora" obrigatorio htmlFor="cidade">
              <input id="cidade" list="lista-comarcas" className="input" value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </Campo>
            <Campo rotulo="Telefone / WhatsApp" htmlFor="tel">
              <input id="tel" className="input" inputMode="tel" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} placeholder="(41) 99999-9999" />
            </Campo>
            <Campo rotulo="CPF (opcional)" htmlFor="cpf" dica="Pode deixar para depois.">
              <input id="cpf" className="input" inputMode="numeric" value={cpf} onChange={(e) => setCpf(e.target.value)} />
            </Campo>
            <Campo rotulo="Você sabe ler e escrever?" dica="Isso muda como o(a) advogado(a) vai falar com você.">
              <div className="flex gap-2">
                {(['sim', 'nao'] as const).map((v) => (
                  <button key={v} type="button" onClick={() => setSabeLer(v)} className={cn('btn flex-1', sabeLer === v ? 'bg-navy-700 text-white' : 'bg-white border border-ink-200')} aria-pressed={sabeLer === v}>
                    {v === 'sim' ? 'Sim' : 'Tenho dificuldade'}
                  </button>
                ))}
              </div>
            </Campo>
            <Campo rotulo="Renda da família por mês (aprox.)" htmlFor="renda" dica="Serve para o pedido de justiça gratuita.">
              <input id="renda" className="input" inputMode="numeric" value={renda} onChange={(e) => setRenda(e.target.value.replace(/\D/g, ''))} placeholder="Ex.: 1600" />
            </Campo>
            <Campo rotulo="Quantas pessoas vivem dessa renda?" htmlFor="membros">
              <input id="membros" className="input" inputMode="numeric" value={membros} onChange={(e) => setMembros(e.target.value.replace(/\D/g, ''))} placeholder="Ex.: 3" />
            </Campo>
          </div>
        </Secao>
      )}

      {passo === 2 && (
        <Secao titulo="Conte o que aconteceu" descricao="Com suas palavras. Quem, o quê, desde quando, o que você quer que aconteça.">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {fala.suportado ? (
                <button type="button" className={cn(fala.ouvindo ? 'btn-danger' : 'btn-secondary')} onClick={fala.ouvindo ? fala.parar : fala.iniciar} aria-pressed={fala.ouvindo}>
                  {fala.ouvindo ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {fala.ouvindo ? 'Parar de gravar' : 'Falar em vez de escrever'}
                </button>
              ) : (
                <span className="text-xs text-ink-500">Transcrição de voz disponível no Chrome/Edge.</span>
              )}
              {fala.ouvindo && <span className="text-xs text-danger-600 animate-pulse">● Ouvindo… fale com calma.</span>}
              {fala.parcial && <span className="text-xs text-ink-500 italic">{fala.parcial}</span>}
            </div>
            {fala.erro && <Aviso tipo="alerta">{fala.erro}</Aviso>}
            <textarea
              className="input min-h-[180px]"
              value={relato}
              onChange={(e) => {
                setRelato(e.target.value);
                if (!fala.ouvindo) setOrigem('texto');
              }}
              placeholder="Exemplo: Meu ex-marido não paga a pensão dos nossos dois filhos desde maio. Eu trabalho de diarista e não está dando para comprar o remédio…"
              aria-label="Relato"
            />
            <p className="text-xs text-ink-500">{relato.trim().length} caracteres · mínimo 30</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Campo rotulo="Contra quem é o problema? (se souber)" htmlFor="reu">
                <input id="reu" className="input" value={nomeReu} onChange={(e) => setNomeReu(e.target.value)} placeholder="Nome da pessoa ou empresa" />
              </Campo>
              <Campo rotulo="Qual a relação?" htmlFor="rel">
                <input id="rel" className="input" value={relacaoReu} onChange={(e) => setRelacaoReu(e.target.value)} placeholder="ex-marido, loja, banco, operadora…" />
              </Campo>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-ink-200 p-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-4 h-4" checked={urgencia} onChange={(e) => setUrgencia(e.target.checked)} />
              <span>
                <span className="font-semibold text-ink-900 inline-flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-warn-600" /> É urgente
                </span>
                <span className="block text-sm text-ink-700">Alguém está sem comida, sem remédio, sem água ou luz, ou há risco imediato.</span>
              </span>
            </label>
            {urgencia && (
              <Campo rotulo="Por que é urgente?" htmlFor="urg">
                <input id="urg" className="input" value={motivoUrgencia} onChange={(e) => setMotivoUrgencia(e.target.value)} />
              </Campo>
            )}
          </div>
        </Secao>
      )}

      {passo === 3 && (
        <Secao titulo="Confira e envie">
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="label">Tipo</dt>
              <dd>{area ? AREA_LABEL[area] : '—'}</dd>
            </div>
            <div>
              <dt className="label">Comarca</dt>
              <dd>{comarca}</dd>
            </div>
            <div>
              <dt className="label">Nome</dt>
              <dd>{nome}</dd>
            </div>
            <div>
              <dt className="label">Cidade</dt>
              <dd>{cidade}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="label">Relato ({origem === 'voz' ? 'por voz' : 'por texto'})</dt>
              <dd className="whitespace-pre-wrap rounded-xl bg-ink-50 p-3 border border-ink-200">{relato}</dd>
            </div>
            {urgencia && (
              <div className="sm:col-span-2">
                <dt className="label">Urgência</dt>
                <dd>{motivoUrgencia || 'Sim'}</dd>
              </div>
            )}
          </dl>
          <Aviso tipo="info">
            Ao enviar, sua solicitação recebe um protocolo. Na operação real, a OAB ou o Fórum nomeia um(a) advogado(a) dativo(a), que aceita e passa a cuidar do seu caso por aqui — nesta demonstração, {ADVOGADO_DEMO.nome} já é a responsável. Você poderá falar com ela pela conversa e assinar os documentos pelo celular.
          </Aviso>
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </Secao>
      )}

      <div className="flex items-center justify-between gap-3">
        <button type="button" className="btn-ghost" onClick={() => (passo === 0 ? router.push('/cidadao') : setPasso((p) => p - 1))}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        {passo < PASSOS.length - 1 ? (
          <button type="button" className="btn-primary" disabled={!podeAvancar} onClick={() => setPasso((p) => p + 1)}>
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" className="btn-primary" disabled={enviando} onClick={enviar}>
            {enviando ? 'Enviando…' : 'Enviar solicitação'} <Send className="w-4 h-4" />
          </button>
        )}
      </div>
      {passo === 2 && relato.trim().length >= 30 && (
        <p className="text-xs text-ok-600 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Relato suficiente para análise.
        </p>
      )}
    </div>
  );
}
