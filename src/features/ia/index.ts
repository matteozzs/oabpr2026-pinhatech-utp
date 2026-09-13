/**
 * Feature IA — tudo que o cliente precisa para acionar e auditar o agente.
 * O agente em si (prompts, RAG, provedor) vive em `src/lib/ia`, do lado do servidor.
 */
export { FontesCitadas } from './components/FontesCitadas';
export { TextoComLacunas } from './components/TextoComLacunas';
export { PainelAuditoria } from './components/PainelAuditoria';
export { useIA, type TarefaIA, type UseIA } from './use-ia';
export { materialParaResumo, MINIMO_MATERIAL, type MaterialResumo } from './material';
export * as iaApi from './api';
