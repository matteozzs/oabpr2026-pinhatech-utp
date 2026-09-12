import { CheckCircle2, FileText } from 'lucide-react';
import type { Caso } from '@/types';
import { OBRIGATORIEDADE_LABEL } from '@/data/documentos';
import { Secao } from '@/components/ui';

/** Visão do cidadão: o que falta (com onde conseguir) e o que já foi entregue. */
export function ListaDocumentosCidadao({ caso }: { caso: Caso }) {
  const pendentes = caso.documentos.filter((d) => !d.geradoPelaPlataforma && ['pendente', 'solicitado'].includes(d.status));
  const recebidos = caso.documentos.filter((d) => ['recebido', 'assinado', 'gerado'].includes(d.status));

  return (
    <Secao id="documentos" titulo="Documentos" descricao="O que já temos e o que ainda falta.">
      {pendentes.length > 0 && (
        <div className="mb-4">
          <p className="label">Faltam ({pendentes.length})</p>
          <ul className="space-y-2">
            {pendentes.map((d) => (
              <li key={d.id} className="rounded-xl border border-warn-100 bg-warn-100/40 p-3">
                <p className="font-semibold text-ink-900 text-sm inline-flex items-center gap-2">
                  <FileText className="w-4 h-4 text-warn-600" /> {d.nome}
                  <span className="badge bg-white text-warn-600 border border-amber-200">{OBRIGATORIEDADE_LABEL[d.obrigatoriedade]}</span>
                </p>
                <p className="text-xs text-ink-700 mt-1">{d.observacaoIA || d.descricao}</p>
                {d.ondeObter && <p className="text-xs text-navy-900 mt-1">Onde conseguir: {d.ondeObter}</p>}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-500 mt-2">Para enviar, abra a conversa e escolha o documento em “Anexar foto”.</p>
        </div>
      )}

      {recebidos.length > 0 && (
        <div>
          <p className="label">Já temos ({recebidos.length})</p>
          <ul className="flex flex-wrap gap-2">
            {recebidos.map((d) => (
              <li key={d.id} className="badge bg-ok-100 text-ok-600 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {d.nome}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pendentes.length === 0 && recebidos.length === 0 && <p className="text-sm text-ink-500">Nenhum documento registrado ainda.</p>}
    </Secao>
  );
}
