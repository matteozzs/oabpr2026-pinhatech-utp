# Prompts — o agente da Ordem Dativa

Esta pasta é o **artefato principal** da solução na trilha Inovação Aberta e Cidadania: os prompts são o agente. O aplicativo em `src/` é a interface que os executa.

Todo prompt é um arquivo Markdown legível por qualquer pessoa — inclusive quem não programa — e pode ser reutilizado em outra ferramenta (Gemini, Claude, GPT) copiando o conteúdo.

## Estrutura

| Arquivo | Papel | Quando roda |
|---|---|---|
| `00-sistema-base.md` | Persona, escopo, **regras de grounding e anti-alucinação**, formato | Em toda chamada, como *system instruction* |
| `01-resumo-fatico.md` | Síntese executiva para o advogado (já nomeado) se apropriar do caso | Ao abrir um caso |
| `02-checklist-documental.md` | Pendências documentais cruzando relato × catálogo | Após o resumo |
| `03-minuta-peticao-inicial.md` | Minuta estruturada da petição, com citação por `id` | Quando o advogado aciona "Gerar minuta" |
| `04-mensagem-assistido.md` | Mensagem acessível ao cidadão pedindo documentos | Ao clicar "Solicitar documentos" |

## Como uma chamada é montada

```
system  = 00-sistema-base.md
user    = <tarefa>  conteúdo de 0N-*.md  </tarefa>
          <fontes>  dispositivos recuperados de knowledge/corpus.json (RAG)  </fontes>
          <caso>    JSON com os dados do caso  </caso>
          [<resumo>, <checklist>, <catalogo>, <advogado>, <motivo> ... conforme a tarefa]
```

A montagem está em `src/lib/ia/tarefas.ts`. A recuperação das fontes está em `src/lib/ia/rag.ts`.

## Mecanismos de controle de alucinação

1. **Corpus fechado** — a IA só pode citar dispositivos que estejam em `knowledge/corpus.json`, pelo `id`. Regra 3.2 do sistema base.
2. **Declaração explícita de lacuna** — quando o corpus não cobre, a IA escreve `FUNDAMENTAÇÃO NÃO LOCALIZADA NO CORPUS` em vez de completar de memória. Regra 3.3.
3. **Marcador de dado ausente** — `[A COMPLETAR EM ENTREVISTA]` para todo dado não informado. Nunca inventa CPF, endereço, valor ou número de processo. Regra 3.4.
4. **Validação no servidor** — depois da resposta, `src/lib/ia/rag.ts#validarFontes` confere cada `id` citado contra o corpus. `id` inexistente é removido e registrado como alerta. A IA não tem a palavra final sobre o que citou.
5. **Saída estruturada** — JSON com schema fixo por tarefa. Campos como `lacunas`, `dadosFaltantes` e `fundamentacaoNaoLocalizada` obrigam a IA a declarar o que não sabe.
6. **Escopo delimitado** — matéria fora de Família/Consumidor retorna `foraDoEscopo: true` com encaminhamento, sem peça.
7. **Temperatura baixa** (0.2) e nível de raciocínio controlado, para saída determinística.
8. **Rótulo permanente** — toda saída é exibida como "gerada por IA, requer revisão do advogado".

## Como auditar

Ver `docs/auditoria-ia.md` — traz casos de teste prontos para verificar cada mecanismo acima, inclusive tentativas deliberadas de induzir alucinação.
