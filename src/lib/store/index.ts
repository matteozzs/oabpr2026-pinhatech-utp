/**
 * Store da demonstração — ponto único de importação.
 *
 * `nucleo`  → chaves, localStorage, assinatura de mudanças
 * `semente` → casos de demonstração e "Restaurar demonstração"
 * `casos`   → CRUD de casos, documentos e assinaturas
 * `mensagens` / `perfil` → conversas e perfil ativo
 * `hooks`   → leitura reativa nas telas
 */
export { ADVOGADO_DEMO, NUMERO_OFICIAL_PLATAFORMA, subscribe } from './nucleo';
export { garantirSemente, restaurarDemonstracao } from './semente';
export {
  carregarCasos,
  obterCaso,
  criarCaso,
  atualizarCaso,
  mudarStatus,
  atualizarDocumento,
  registrarAssinatura,
  documentosIniciais,
  type EntradaNovoCaso,
} from './casos';
export { todasMensagens, mensagensDoCaso, enviarMensagem, marcarLidas } from './mensagens';
export { perfilAtual, entrarComo, sair } from './perfil';
export { usePronto, useCasos, useCaso, useMensagens, usePerfil, useResumoConversas } from './hooks';
