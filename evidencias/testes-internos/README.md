# Evidências dos testes internos (Entrega 2)

Saídas brutas das rotas da aplicação, obtidas em 12/09/2026 no ambiente local, referenciadas em `../../TESTES_INTERNOS.md` pelos IDs no nome de cada arquivo.

| Arquivo | O que prova |
|---|---|
| `T05-T11_resumo_*.json` | Resumo fático: tema, urgência, hipossuficiência, dados faltantes, fontes válidas, painel `meta` com RAG |
| `T12-T14_checklist_*.json` | Checklist documental com `fundamentoId` por item |
| `T15-T24_minuta_*.json` | Minuta completa com `lacunas`, `fundamentacaoNaoLocalizada`, 10 fontes validadas, 0 inválidas |
| `T26-T29_mensagem_assistido.json` | Mensagem acessível para assistido que não lê bem, sem endereço inventado |
| `T30_fallback_modelo_503.json` | `meta.tentativas`: primário 503 após 29,6 s → fallback respondeu em 3,8 s |
| `T32_fora_do_escopo_criminal.json` | `foraDoEscopo: true`, encaminhamento à Defensoria, sem fontes |
| `T33_artigos_inexistentes.json` | Artigos falsos citados pelo cidadão foram para `fundamentacaoNaoLocalizada`, não para a fundamentação |
| `T04_procuracao_*.docx` / `T34_peticao_inicial_*.docx` | Documentos gerados a partir dos templates, com marcadores de lacuna |
