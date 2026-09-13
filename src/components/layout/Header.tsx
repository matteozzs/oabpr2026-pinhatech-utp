'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './Logo';
import { sair, usePerfil } from '@/lib/store';
import { cn } from '@/lib/utils';

const LINKS_CIDADAO = [{ href: '/cidadao', rotulo: 'Meus processos' }];

// Não há "novo atendimento": quem abre o caso é a OAB/PR ou o Fórum, ao nomear.
// A plataforma entra depois, com o advogado já nomeado e o caso já existindo.
const LINKS_ADVOGADO = [
  { href: '/advogado/dashboard', rotulo: 'Atendimentos' },
  { href: '/advogado/chat', rotulo: 'Conversas' },
];

const LINKS_VISITANTE = [
  { href: '/cidadao', rotulo: 'Sou Cidadão' },
  { href: '/advogado', rotulo: 'Sou Advogado Dativo' },
];

const LINKS_COMUNS = [
  { href: '/transparencia', rotulo: 'Transparência da IA' },
  { href: '/auditoria', rotulo: 'Banco de testes' },
  { href: '/roadmap', rotulo: 'Roadmap' },
];

export function Header() {
  const perfilAtivo = usePerfil();
  const pathname = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  // A raiz é o portal de entrada: cabeçalho reduzido, sem a navegação do perfil
  // nem o botão Sair, porque a própria página oferece os dois caminhos.
  const naRaiz = pathname === '/';
  const perfil = naRaiz ? null : perfilAtivo;

  const links = naRaiz ? [] : perfil === 'cidadao' ? LINKS_CIDADAO : perfil === 'advogado' ? LINKS_ADVOGADO : LINKS_VISITANTE;

  function onSair() {
    sair();
    setAberto(false);
    router.push('/');
  }

  const Item = ({ href, rotulo }: { href: string; rotulo: string }) => (
    <Link
      href={href}
      onClick={() => setAberto(false)}
      className={cn(
        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        pathname === href ? 'bg-navy-100 text-navy-900' : 'text-ink-700 hover:bg-ink-100',
      )}
    >
      {rotulo}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-ink-200">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Ordem Dativa — início" className="shrink-0">
          <Logo altura={44} />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Principal">
          {links.map((l) => (
            <Item key={l.href} {...l} />
          ))}
          {links.length > 0 && <span className="mx-1 h-5 w-px bg-ink-200" aria-hidden="true" />}
          {LINKS_COMUNS.map((l) => (
            <Item key={l.href} {...l} />
          ))}
          {perfil && (
            <button onClick={onSair} className="btn-ghost ml-1 text-sm" aria-label="Sair do perfil de demonstração">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          {naRaiz &&
            LINKS_COMUNS.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs font-medium text-ink-700 hover:text-navy-800">
                {l.rotulo}
              </Link>
            ))}
          {perfil && <span className="badge bg-navy-100 text-navy-900">{perfil === 'cidadao' ? 'Cidadão' : 'Advogado'}</span>}
          <button
            className={cn('btn-ghost p-2', naRaiz && 'hidden')}
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setAberto((v) => !v)}
          >
            {aberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {aberto && (
        <div id="menu-mobile" className="lg:hidden border-t border-ink-200 bg-white px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Item key={l.href} {...l} />
          ))}
          {links.length > 0 && <div className="h-px bg-ink-200 my-1" />}
          {LINKS_COMUNS.map((l) => (
            <Item key={l.href} {...l} />
          ))}
          {perfil && (
            <button onClick={onSair} className="btn-ghost justify-start">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          )}
        </div>
      )}
    </header>
  );
}
