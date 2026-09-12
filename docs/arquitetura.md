# Arquitetura do código

Organização por **feature**, não por tipo de arquivo. A regra prática: para entender "como funciona o chat", abre-se uma pasta — não se caça um componente em `components/`, um hook em `hooks/` e um fetch em `lib/`.

```
src/
├── app/                      ROTAS. Páginas finas que compõem features.
│   ├── api/ia/*              resumo · checklist · minuta · mensagem · status
│   ├── api/documentos/docx   geração de .docx
│   ├── cidadao/*             4 telas do cidadão
│   └── advogado/*            7 telas do advogado
│
├── components/               GENÉRICO. Não conhece regra de negócio.
│   ├── ui/                   Secao · Campo · Aviso · Carregando · StatusBadge · RotuloIA
│   └── layout/               Header · Footer · Logo
│
├── features/                 DOMÍNIO. Cada pasta é uma capacidade do produto.
│   ├── ia/                   api.ts (cliente das rotas) · use-ia.ts (estado)
│   │   └── components/       FontesCitadas · TextoComLacunas · PainelAuditoria
│   ├── casos/components/     CabecalhoCaso · CardCaso · HistoricoCaso
│   │                         SecaoResumo · SecaoChecklist · SecaoMinuta · SecaoPacote
│   ├── chat/components/      Chat · BolhaMensagem · AcoesChatAdvogado
│   ├── documentos/           api.ts (baixarDocx)
│   │   └── components/       Assinatura · GeradorDocumentos · ListaDocumentosCidadao
│   └── cras/components/      PainelCras
│
├── lib/                      INFRAESTRUTURA.
│   ├── ia/                   SERVIDOR: provider (Gemini + fallback) · prompts · rag · tarefas
│   ├── documentos/docx.ts    SERVIDOR: montagem dos .docx
│   ├── store/                CLIENTE: nucleo · semente · casos · mensagens · perfil · hooks
│   ├── cras.ts · utils.ts
│
├── data/                     Dados estáticos: comarcas reais, catálogo de documentos,
│                             rede CRAS, casos-semente
├── hooks/use-speech.ts       Transcrição de voz no navegador
└── types/index.ts            Contratos compartilhados cliente/servidor
```

## Regras de dependência

```
app  →  features  →  components/ui  →  lib/utils
         ↓
       lib/store (cliente)   lib/ia, lib/documentos (servidor)
```

- **`components/` nunca importa de `features/`.** O caminho é sempre o inverso.
- **Uma feature não importa componentes de outra**, exceto pelo `index.ts` público (`@/features/ia`, `@/features/chat`…). Foi assim que `AcoesChatAdvogado` passou a usar `useIA` sem duplicar `fetch`.
- **Código de cliente nunca importa `lib/ia/*` nem `lib/documentos/docx.ts`** — esses usam `node:fs` e o bundler quebraria. O contato é por HTTP, via `features/ia/api.ts` e `features/documentos/api.ts`. Os tipos compartilhados (`MetaIA`, `TentativaModelo`) moram em `types/`, justamente para o cliente não precisar tocar no módulo do servidor.
- **Páginas não fazem `fetch`.** Quem chama a IA é `features/ia/api.ts`; quem guarda estado de carregamento e erro é `useIA`.

## Por que separar assim

| Problema antes | Como ficou |
|---|---|
| `components/ui.tsx` e `components/ia.tsx` eram barris com 3–6 componentes cada | Um componente por arquivo, com `index.ts` reexportando |
| `app/advogado/caso/[id]/page.tsx` tinha ~600 linhas e 6 responsabilidades | 88 linhas; cada passo virou `features/casos/components/Secao*.tsx` |
| Lógica de `fetch` repetida na página do caso e no chat | `features/ia/api.ts` + `useIA`, usados pelos dois |
| `lib/store.ts` com 330 linhas misturando casos, mensagens, perfil e hooks | `lib/store/` com 6 módulos e um `index.ts` de entrada |
| `MetaIA` definido em `lib/ia/tarefas.ts` (módulo de servidor) e importado pelo cliente | Movido para `types/index.ts` |

## Onde mexer para…

| Tarefa | Arquivo |
|---|---|
| Mudar o que a IA faz | `prompts/*.md` (é o agente; não precisa programar) |
| Acrescentar dispositivo legal | `knowledge/corpus.json` |
| Mudar recuperação do RAG | `lib/ia/rag.ts` → `recuperar` |
| Trocar de provedor (Claude, GPT) | `lib/ia/provider.ts` → `gerarTexto` |
| Acrescentar documento ao catálogo | `data/documentos.ts` |
| Acrescentar passo ao atendimento | novo `features/casos/components/Secao*.tsx` + uma linha na página |
| Trocar localStorage por banco | `lib/store/nucleo.ts` → `ler` / `gravar` |
