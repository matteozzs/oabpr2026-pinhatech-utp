import Image from 'next/image';

/**
 * Marca da Ordem Dativa. Os arquivos em `public/marca/` são os oficiais fornecidos
 * pela equipe, recortados e com fundo transparente.
 */
export function Logo({ altura = 44, comTexto = true }: { altura?: number; comTexto?: boolean }) {
  if (!comTexto) {
    return (
      <Image
        src="/marca/icone.png"
        alt="Ordem Dativa"
        width={512}
        height={454}
        priority
        style={{ height: altura, width: 'auto' }}
        className="select-none"
      />
    );
  }

  return (
    <Image
      src="/marca/logo.png"
      alt="Ordem Dativa"
      width={960}
      height={335}
      priority
      style={{ height: altura, width: 'auto' }}
      className="select-none"
    />
  );
}
