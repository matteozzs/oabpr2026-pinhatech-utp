'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import comarcasJson from '@/data/comarcas.json';
import { entrarComo, usePerfil, usePronto } from '@/lib/store';
import { Aviso, Campo, Secao } from '@/components/ui';
import { agoraISO, capitalizarNome, sha256 } from '@/lib/utils';

const KEY = 'ordem-dativa:credenciamento:v1';

interface Credenciamento {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  numeroOab: string;
  subsecaoOab: string;
  comarcaSede: string;
  aceitaLimitrofes: boolean;
  especialidades: string[];
  limiteSimultaneas: number;
  possuiCertificadoDigital: boolean;
  chavePix: string;
  aceitouTermo: boolean;
  credencialId?: string;
  hash?: string;
  em?: string;
}

const VAZIO: Credenciamento = {
  nomeCompleto: 'Helena Marques Ribeiro',
  cpf: '',
  email: '',
  telefone: '',
  numeroOab: '',
  subsecaoOab: 'Curitiba',
  comarcaSede: 'Curitiba',
  aceitaLimitrofes: true,
  especialidades: ['Família e Sucessões', 'Cível'],
  limiteSimultaneas: 5,
  possuiCertificadoDigital: true,
  chavePix: '',
  aceitouTermo: false,
};

const ESPECIALIDADES = ['Família e Sucessões', 'Cível', 'Infância e Juventude — cível'];

/**
 * Credenciamento oficial (Edital OAB/PR + PGE) — versão de demonstração.
 * Coleta o mínimo necessário para a distribuição de nomeações e o pagamento de honorários
 * (Lei 18.664/2015). Fica no navegador; gera uma "credencial" com hash de integridade.
 */
export default function CredenciamentoPage() {
  const perfil = usePerfil();
  const pronto = usePronto();

  useEffect(() => {
    if (perfil !== 'advogado') entrarComo('advogado');
  }, [perfil]);

  // O formulário só monta no cliente: o estado inicial pode ler o localStorage sem risco de hidratação.
  return pronto ? <Formulario /> : null;
}

function lerSalvo(): Credenciamento {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Credenciamento) : VAZIO;
  } catch {
    return VAZIO;
  }
}

function Formulario() {
  const [f, setF] = useState<Credenciamento>(lerSalvo);
  const [salvo, setSalvo] = useState(false);

  const set = <K extends keyof Credenciamento>(k: K, v: Credenciamento[K]) => setF((s) => ({ ...s, [k]: v }));

  async function salvar() {
    const em = agoraISO();
    const hash = await sha256(`${f.nomeCompleto}|${f.numeroOab}|${f.comarcaSede}|${em}`);
    const cred = { ...f, credencialId: `CRED-${hash.slice(0, 8).toUpperCase()}`, hash, em };
    localStorage.setItem(KEY, JSON.stringify(cred));
    setF(cred);
    setSalvo(true);
  }

  const comarcas = comarcasJson.comarcas.map((c) => capitalizarNome(c.nome));
  const pode = f.nomeCompleto.trim() && f.numeroOab.trim() && f.comarcaSede && f.especialidades.length > 0 && f.aceitouTermo;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950">Credenciamento na advocacia dativa</h1>
        <p className="text-ink-700 mt-1">Dados exigidos pelo edital da OAB/PR e pela PGE para nomeação e pagamento de honorários. Demonstração — nada é enviado a órgão algum.</p>
      </div>

      {f.credencialId && (
        <Aviso tipo="ok">
          <span className="inline-flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" /> Credencial <span className="font-mono">{f.credencialId}</span> emitida em {new Date(f.em!).toLocaleString('pt-BR')}
          </span>
        </Aviso>
      )}

      <Secao titulo="Identificação">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Campo rotulo="Nome completo" obrigatorio htmlFor="nome">
              <input id="nome" className="input" value={f.nomeCompleto} onChange={(e) => set('nomeCompleto', e.target.value)} />
            </Campo>
          </div>
          <Campo rotulo="Número OAB/PR" obrigatorio htmlFor="oab">
            <input id="oab" className="input" value={f.numeroOab} onChange={(e) => set('numeroOab', e.target.value)} placeholder="00.000" />
          </Campo>
          <Campo rotulo="Subseção" htmlFor="sub">
            <input id="sub" className="input" value={f.subsecaoOab} onChange={(e) => set('subsecaoOab', e.target.value)} />
          </Campo>
          <Campo rotulo="CPF" htmlFor="cpf">
            <input id="cpf" className="input" value={f.cpf} onChange={(e) => set('cpf', e.target.value)} />
          </Campo>
          <Campo rotulo="E-mail" htmlFor="email">
            <input id="email" type="email" className="input" value={f.email} onChange={(e) => set('email', e.target.value)} />
          </Campo>
        </div>
      </Secao>

      <Secao titulo="Atuação" descricao="Define para quais nomeações você entra na distribuição.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo rotulo="Comarca-sede" obrigatorio htmlFor="sede">
            <input id="sede" list="comarcas" className="input" value={f.comarcaSede} onChange={(e) => set('comarcaSede', e.target.value)} />
            <datalist id="comarcas">
              {comarcas.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Campo>
          <Campo rotulo="Limite de nomeações simultâneas" htmlFor="lim">
            <input id="lim" type="number" min={1} max={30} className="input" value={f.limiteSimultaneas} onChange={(e) => set('limiteSimultaneas', Number(e.target.value))} />
          </Campo>
          <div className="sm:col-span-2">
            <p className="label">Especialidades (edital)</p>
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES.map((e) => {
                const on = f.especialidades.includes(e);
                return (
                  <button key={e} type="button" aria-pressed={on} className={on ? 'btn-primary' : 'btn-secondary'} onClick={() => set('especialidades', on ? f.especialidades.filter((x) => x !== e) : [...f.especialidades, e])}>
                    {e}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.aceitaLimitrofes} onChange={(e) => set('aceitaLimitrofes', e.target.checked)} /> Aceito nomeações em comarcas limítrofes
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.possuiCertificadoDigital} onChange={(e) => set('possuiCertificadoDigital', e.target.checked)} /> Possuo certificado digital ICP-Brasil (Projudi)
          </label>
        </div>
      </Secao>

      <Secao titulo="Honorários (PGE / Lei 18.664/2015)" descricao="Dados bancários para depósito dos honorários fixados pelo juízo.">
        <Campo rotulo="Chave Pix ou conta (titularidade própria)" htmlFor="pix" dica="Demonstração: não preencha dados reais.">
          <input id="pix" className="input" value={f.chavePix} onChange={(e) => set('chavePix', e.target.value)} />
        </Campo>
        <label className="mt-4 flex items-start gap-3 rounded-xl border border-ink-200 p-3 cursor-pointer">
          <input type="checkbox" className="mt-1" checked={f.aceitouTermo} onChange={(e) => set('aceitouTermo', e.target.checked)} />
          <span className="text-sm text-ink-700">
            Declaro ciência dos deveres do defensor dativo, inclusive o de não recusar nomeação sem justo motivo (art. 34, XII, da Lei 8.906/94), e aceito a tabela de honorários da OAB/PR e PGE.
          </span>
        </label>
        <div className="mt-4 flex items-center gap-3">
          <button className="btn-primary" disabled={!pode} onClick={salvar}>
            <ShieldCheck className="w-4 h-4" /> {f.credencialId ? 'Atualizar credencial' : 'Emitir credencial'}
          </button>
          {salvo && <span className="text-sm text-ok-600">Salvo neste navegador.</span>}
        </div>
      </Secao>
    </div>
  );
}
