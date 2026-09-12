# Base de conhecimento (RAG)

`corpus.json` é a **única** fonte de fundamentação jurídica que a IA pode citar. É um corpus fechado, curado à mão, em formato aberto, para que qualquer advogado possa ler, conferir, corrigir e ampliar.

## Por que um corpus fechado em vez de busca aberta

- **Auditabilidade**: cada dispositivo citado numa minuta pode ser conferido em segundos, neste arquivo, com link para a fonte oficial.
- **Controle de alucinação**: a IA não tem como citar artigo que não existe aqui. Quem valida a citação é o servidor (`src/lib/ia/rag.ts`), não o modelo.
- **Adoção por terceiros**: outra seccional ou escritório troca o corpus e reaproveita todo o resto.

## Estrutura de cada dispositivo

```json
{
  "id": "CPC-98",
  "diploma": "Código de Processo Civil (Lei 13.105/2015)",
  "dispositivo": "Art. 98, caput",
  "texto": "…transcrição…",
  "areas": ["geral" | "familia" | "consumidor"],
  "temas": ["gratuidade", "hipossuficiencia"],
  "palavras_chave": ["…termos em linguagem comum que o cidadão usa…"],
  "fonte": "cpc",
  "verificado": false
}
```

`palavras_chave` inclui deliberadamente expressões coloquiais ("não paga pensão", "nome sujo", "cortaram a água") — é assim que o relato do cidadão encontra o dispositivo certo.

## Recuperação

`src/lib/ia/rag.ts` pontua cada dispositivo pela sobreposição entre o relato/tema do caso e `palavras_chave` + `temas` + `texto`, filtra pela área e devolve os N mais relevantes como bloco `<fontes>` para o prompt. Sem banco vetorial, sem serviço externo: a recuperação é determinística e explicável linha a linha.

## Estado de verificação

`verificado: false` significa que o texto foi transcrito pela equipe e **aguarda conferência das pessoas do Direito** contra a fonte oficial. Antes de uso real, cada item deve ser conferido e marcado `true`. Dispositivos de referência (como `PR-LEI-18664`) não têm texto literal e a IA é instruída a apenas mencioná-los.

## Escopo atual

Família e Sucessões · Direito do Consumidor (cível) · Gratuidade da justiça · Advocacia dativa · LGPD (consentimento).
Ampliar para outra área = adicionar dispositivos aqui e, se necessário, um prompt de tarefa em `prompts/`.
