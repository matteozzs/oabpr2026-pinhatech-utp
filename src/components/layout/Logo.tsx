export function Logo({ tamanho = 36, comTexto = true }: { tamanho?: number; comTexto?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="24" cy="32" r="21" fill="#1565C0" />
        <path d="M28 6 A26 26 0 0 1 28 58 Z" fill="#0B3A78" />
      </svg>
      {comTexto && (
        <span className="leading-none">
          <span className="block text-[15px] font-black tracking-tight text-navy-900">ORDEM</span>
          <span className="block text-[15px] font-light tracking-[0.18em] text-navy-700">DATIVA</span>
        </span>
      )}
    </span>
  );
}
