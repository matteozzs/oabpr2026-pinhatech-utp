'use client';

import type { Advogado, Caso, Minuta } from '@/types';
import { atualizarDocumento } from '@/lib/store';

export type TipoDocx = 'procuracao' | 'declaracao_hipossuficiencia' | 'consentimento_dados' | 'peticao_inicial';

/** Pede o .docx ao servidor e dispara o download no navegador. Marca o documento como gerado. */
export async function baixarDocx(tipo: TipoDocx, caso: Caso, advogado: Advogado, minuta?: Minuta) {
  const resp = await fetch('/api/documentos/docx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo, caso, advogado, minuta }),
  });
  if (!resp.ok) {
    const e = await resp.json().catch(() => ({}));
    throw new Error(e.erro || 'Falha ao gerar o documento.');
  }

  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (resp.headers.get('Content-Disposition')?.match(/filename="(.+?)"/)?.[1] ?? `${tipo}.docx`).replace(/"/g, '');
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  const doc = caso.documentos.find((d) => d.id === tipo);
  if (doc && doc.status === 'pendente') {
    atualizarDocumento(
      caso.id,
      tipo,
      { status: 'gerado', arquivoNome: a.download },
      { tipo: 'documento', descricao: `Documento "${doc.nome}" gerado pela plataforma.`, autor: 'plataforma' },
    );
  }
}
