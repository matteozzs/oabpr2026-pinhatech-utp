import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-3 text-sm text-ink-700">
        <div>
          <p className="font-semibold text-ink-900">Ordem Dativa</p>
          <p className="mt-1">
            Ferramentas de IA para a advocacia dativa. Protótipo desenvolvido para o Hackathon da Cidadania OAB/PR 2026 —
            trilha Inovação Aberta e Cidadania.
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink-900">Equipe PinhaTech UTP</p>
          <p className="mt-1">
            Código aberto sob licença MIT.{' '}
            <a
              className="underline text-navy-700"
              href="https://github.com/matteozzs/oabpr2026-pinhatech-utp"
              target="_blank"
              rel="noreferrer"
            >
              Repositório no GitHub
            </a>
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink-900">Aviso</p>
          <p className="mt-1">
            Ambiente de demonstração com dados fictícios. Toda saída de IA é minuta e exige revisão de advogado(a). Não é
            serviço oficial da OAB, do TJPR ou de qualquer órgão público.{' '}
            <Link href="/transparencia" className="underline text-navy-700">
              Como a IA é controlada
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
