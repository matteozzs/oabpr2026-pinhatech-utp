/** Rótulo permanente exigido pela política de confiabilidade: nada sai como definitivo. */
export function RotuloIA({ modelo, quando }: { modelo?: string; quando?: string }) {
  return (
    <p className="text-[11px] text-ink-500 mt-2">
      Gerado por IA{modelo ? ` (${modelo})` : ''}
      {quando ? ` em ${new Date(quando).toLocaleString('pt-BR')}` : ''} · fundamentação restrita ao corpus da plataforma ·{' '}
      <strong>requer revisão do(a) advogado(a)</strong>.
    </p>
  );
}
