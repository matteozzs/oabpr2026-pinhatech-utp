'use client';

import { useCallback, useState } from 'react';
import type { MetaIA } from '@/types';

export type TarefaIA = 'resumo' | 'checklist' | 'minuta';

/**
 * Estado compartilhado das chamadas de IA numa tela: qual tarefa está rodando,
 * o último erro e a `meta` de auditoria de cada tarefa.
 *
 * A execução em si fica em `features/ia/api.ts`; este hook só orquestra o estado,
 * para que várias seções da mesma página não disputem botões nem repitam try/catch.
 */
export function useIA() {
  const [ocupado, setOcupado] = useState<TarefaIA | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [metas, setMetas] = useState<Partial<Record<TarefaIA, MetaIA>>>({});

  const executar = useCallback(
    async <T,>(tarefa: TarefaIA, acao: () => Promise<{ dados: T; meta: MetaIA }>): Promise<T | null> => {
      setOcupado(tarefa);
      setErro(null);
      try {
        const { dados, meta } = await acao();
        setMetas((m) => ({ ...m, [tarefa]: meta }));
        return dados;
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha na IA.');
        return null;
      } finally {
        setOcupado(null);
      }
    },
    [],
  );

  return {
    /** Tarefa em execução, ou null. Use para desabilitar botões da tela inteira. */
    ocupado,
    erro,
    limparErro: useCallback(() => setErro(null), []),
    metas,
    executar,
  };
}

export type UseIA = ReturnType<typeof useIA>;
