# Tarefa 03 — Minuta de petição inicial

## Objetivo

Redigir a **minuta** de petição inicial estruturada, a partir do relato aprovado e dos documentos coletados, para revisão do(a) advogado(a) dativo(a). Esta é a tarefa com maior risco de alucinação: cada regra abaixo existe por isso.

## Entrada

- `<caso>`: dados do assistido, parte contrária, comarca, relato, urgência, documentos.
- `<resumo>`: saída da Tarefa 01.
- `<checklist>`: saída da Tarefa 02 (quando existir).
- `<fontes>`: dispositivos recuperados. **Toda fundamentação sai daqui.**

## Regras específicas

### Estrutura
- `enderecamento`: "EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA [VARA] DA COMARCA DE [COMARCA]/PR". A comarca vem de `<caso>`. A vara: se o tema for de família, use "VARA DE FAMÍLIA" quando a comarca for de grande porte e `[VARA A CONFIRMAR NA DISTRIBUIÇÃO]` caso contrário; se consumidor, "VARA CÍVEL" ou "JUIZADO ESPECIAL CÍVEL" conforme o valor e a complexidade, ou o marcador se não houver como decidir.
- `classeProcessual`: a ação adequada ao tema (ex.: "AÇÃO DE ALIMENTOS C/C PEDIDO DE ALIMENTOS PROVISÓRIOS", "AÇÃO DE EXECUÇÃO DE ALIMENTOS", "AÇÃO DECLARATÓRIA DE INEXISTÊNCIA DE DÉBITO C/C INDENIZAÇÃO POR DANOS MORAIS").
- `qualificacaoAutor` e `qualificacaoReu`: no padrão do art. 319, II do CPC, com marcador `[A COMPLETAR EM ENTREVISTA]` para cada dado ausente. **Nunca** preencha CPF, RG, endereço ou estado civil que não estejam em `<caso>`.
- `gratuidade`: parágrafo requerendo gratuidade da justiça, fundamentado nos `id` de `<fontes>` pertinentes.
- `fatos`: narrativa em terceira pessoa, ordem cronológica, **somente** com o que está no relato. Sem adjetivos, sem inferências sobre intenção da parte contrária.
- `direito`: fundamentação por tópicos. **Cada afirmação jurídica deve terminar com o `id` entre colchetes**, ex.: "...conforme o binômio necessidade-possibilidade [CC-1694]". Se precisar de fundamento que não está em `<fontes>`, escreva no próprio texto `FUNDAMENTAÇÃO NÃO LOCALIZADA NO CORPUS: <tema>` e repita em `fundamentacaoNaoLocalizada`.
- `tutelaUrgencia`: preencha **apenas** se `<resumo>.urgencia.existe` for `true`; fundamente em `[CPC-300]` e, em alimentos, `[LA-4]`. Caso contrário, omita o campo.
- `pedidos`: lista, cada item uma frase, começando pela gratuidade, depois tutela (se houver), citação, mérito, provas, custas/honorários.
- `valorCausa`: aplique o critério de `[CPC-292]` **somente** se os valores estiverem em `<caso>`; senão `[VALOR DA CAUSA A DEFINIR COM O ASSISTIDO — critério: <inciso aplicável>]`.
- `provas`: protesto genérico por provas + documentos indicados no checklist.
- `fechamento`: "Nestes termos, pede deferimento." + comarca + data por extenso vinda de `<caso>` + linha de assinatura "[NOME DO(A) ADVOGADO(A)] — OAB/PR [NÚMERO]".

### Lacunas
- `lacunas`: liste **todo** marcador `[A COMPLETAR EM ENTREVISTA]` e `[... A DEFINIR ...]` que você inseriu, um por item, em linguagem simples para o advogado ler ao assistido.

### Fontes
- `fontesUtilizadas`: exatamente os `id` citados no texto. Se citou no texto, tem que estar aqui; se está aqui, tem que estar citado.

## Schema de saída (JSON)

```json
{
  "enderecamento": "string",
  "classeProcessual": "string",
  "qualificacaoAutor": "string",
  "qualificacaoReu": "string",
  "gratuidade": "string",
  "fatos": "string",
  "direito": "string",
  "tutelaUrgencia": "string | omitido",
  "pedidos": ["string", "..."],
  "valorCausa": "string",
  "provas": "string",
  "fechamento": "string",
  "lacunas": ["string", "..."],
  "fundamentacaoNaoLocalizada": ["string", "..."],
  "fontesUtilizadas": [ { "id": "string" } ]
}
```
