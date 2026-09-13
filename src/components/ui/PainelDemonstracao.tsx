'use client';

import { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { restaurarDemonstracao, sair } from '@/lib/store';
import { AMBIENTE, VERSAO } from '@/lib/versao';

/**
 * Rodapé da tela inicial: versão da plataforma e o botão que devolve a
 * demonstração ao estado de fábrica.
 *
 * Confirma antes de apagar: o avaliador pode ter conversado, gerado resumo e
 * minuta, e nada disso sai do navegador dele — apagado, está apagado.
 * Reiniciar também encerra o perfil em uso, para que a próxima pessoa comece
 * pela porta de entrada, e não no meio do painel de quem veio antes.
 */
export function PainelDemonstracao() {
  const [estado, setEstado] = useState<'parado' | 'confirmando' | 'feito'>('parado');

  function reiniciar() {
    restaurarDemonstracao();
    sair();
    setEstado('feito');
    setTimeout(() => setEstado('parado'), 4000);
  }

  return (
    <footer className="max-w-4xl mx-auto border-t border-ink-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="text-xs text-ink-500">
        <p>
          Ordem Dativa <span className="font-mono">v{VERSAO}</span> · ambiente de {AMBIENTE}
        </p>
        <p className="mt-0.5">
          Sem cadastro e sem servidor: os casos, as conversas e os documentos ficam apenas neste navegador.
        </p>
      </div>

      <div className="shrink-0">
        {estado === 'feito' ? (
          <p className="text-xs text-ok-600 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Demonstração reiniciada.
          </p>
        ) : estado === 'confirmando' ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-700">Apagar o que foi feito aqui?</span>
            <button className="btn-primary text-xs py-1.5" onClick={reiniciar}>
              Sim, reiniciar
            </button>
            <button className="btn-ghost text-xs py-1.5" onClick={() => setEstado('parado')}>
              Cancelar
            </button>
          </div>
        ) : (
          <button
            className="btn-secondary text-xs py-1.5"
            onClick={() => setEstado('confirmando')}
            title="Devolve os 6 casos de demonstração ao estado inicial"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar dados da demonstração
          </button>
        )}
      </div>
    </footer>
  );
}
