'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ClipboardPlus, MessageCircle, RotateCcw } from 'lucide-react';
import { ADVOGADO_DEMO, entrarComo, restaurarDemonstracao, useCasos, usePerfil, useResumoConversas } from '@/lib/store';
import { AREA_LABEL, STATUS_LABEL, type Area, type StatusCaso } from '@/types';
import { CardCaso } from '@/features/casos';

export default function DashboardPage() {
  const perfil = usePerfil();
  const { casos, pronto } = useCasos();
  const conversas = useResumoConversas();
  const [area, setArea] = useState<Area | ''>('');
  const [status, setStatus] = useState<StatusCaso | ''>('');

  useEffect(() => {
    if (perfil !== 'advogado') entrarComo('advogado');
  }, [perfil]);

  const filtrados = useMemo(() => casos.filter((c) => (!area || c.area === area) && (!status || c.status === status)), [casos, area, status]);
  const emAtendimento = casos.filter((c) => c.status === 'em_atendimento').length;
  const aguardando = casos.filter((c) => c.status === 'aguardando_documentos').length;
  const naoLidas = Object.values(conversas).reduce((s, r) => s + r.naoLidas, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-950">Atendimentos em andamento</h1>
          <p className="text-ink-700 mt-1">
            {ADVOGADO_DEMO.nome} · {ADVOGADO_DEMO.oab}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/advogado/chat" className="btn-secondary">
            <MessageCircle className="w-4 h-4" /> Conversas {naoLidas > 0 && <span className="badge bg-navy-700 text-white ml-1">{naoLidas}</span>}
          </Link>
          <Link href="/advogado/novo-atendimento" className="btn-primary">
            <ClipboardPlus className="w-4 h-4" /> Novo atendimento
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Indicador valor={emAtendimento} rotulo="em atendimento" cor="text-navy-900" />
        <Indicador valor={aguardando} rotulo="aguardando documentos" cor="text-warn-600" />
        <Indicador valor={casos.length} rotulo="total" cor="text-ink-900" />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select className="input w-auto py-2 text-sm" value={area} onChange={(e) => setArea(e.target.value as Area | '')} aria-label="Filtrar por área">
          <option value="">Todas as áreas</option>
          {(Object.keys(AREA_LABEL) as Area[]).map((a) => (
            <option key={a} value={a}>
              {AREA_LABEL[a]}
            </option>
          ))}
        </select>
        <select className="input w-auto py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as StatusCaso | '')} aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          {(Object.keys(STATUS_LABEL) as StatusCaso[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button className="btn-ghost text-xs ml-auto" onClick={restaurarDemonstracao} title="Apaga alterações locais e recarrega os casos de demonstração">
          <RotateCcw className="w-3.5 h-3.5" /> Restaurar demonstração
        </button>
      </div>

      {!pronto ? null : filtrados.length === 0 ? (
        <div className="card p-8 text-center text-ink-700">Nenhum caso com esses filtros.</div>
      ) : (
        <ul className="grid gap-3">
          {filtrados.map((c) => (
            <li key={c.id}>
              <CardCaso caso={c} href={`/advogado/caso/${c.id}`} naoLidas={conversas[c.id]?.naoLidas ?? 0} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Indicador({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: string }) {
  return (
    <div className="card p-4">
      <p className={`text-2xl font-black ${cor}`}>{valor}</p>
      <p className="text-xs text-ink-700">{rotulo}</p>
    </div>
  );
}
