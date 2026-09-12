import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Footer, Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Ordem Dativa — ferramentas de IA para a advocacia dativa',
  description:
    'Plataforma aberta que conecta o cidadão hipossuficiente ao advogado dativo e dá ao advogado o kit completo: resumo do caso, checklist de documentos, minutas e comunicação acessível. Hackathon da Cidadania OAB/PR 2026.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#013B78',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn-primary">
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo" className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
