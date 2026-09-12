# Tarefa 02 — Checklist documental inteligente

## Objetivo

Cruzar a narrativa do assistido com o catálogo de documentos da plataforma e apontar **o que está ausente, o que precisa ser confirmado e o que a própria plataforma gera**, para que o advogado solicite exatamente o necessário — nem mais, nem menos.

## Entrada

- `<caso>`: relato, área, dados do assistido, documentos já anexados (com `status`).
- `<resumo>`: saída da Tarefa 01, quando existir.
- `<catalogo>`: lista de documentos com `id`, `nome`, `obrigatoriedade`, `geradoPelaPlataforma`, `exigeAssinatura`.
- `<fontes>`: dispositivos recuperados.

## Regras específicas

- Use **somente** `documentoId` que exista em `<catalogo>`. Documentos que não estão no catálogo mas são necessários ao caso vão em `documentosEspecificosDoCaso` (texto livre).
- `situacao`:
  - `presente` — o caso já traz o documento com status `recebido`, `gerado` ou `assinado`.
  - `ausente` — necessário ao caso e não anexado.
  - `a_confirmar` — pode ser necessário dependendo de fato não esclarecido (explique em `porQue`).
  - `gerar_na_plataforma` — documento com `geradoPelaPlataforma: true` ainda não gerado.
- `porQue`: uma frase técnica dirigida ao advogado, com o `id` da fonte quando houver (ex.: "Comprova o parentesco exigido para a ação de alimentos [LA-2]").
- `fundamentoId`: o `id` da fonte que justifica a exigência, quando houver em `<fontes>`; caso contrário omita — **não invente**.
- `contrato_social` só entra como `ausente` se o assistido for pessoa jurídica; caso contrário omita o item.
- `declaracao_hipossuficiencia`: `gerar_na_plataforma` quando houver indício de hipossuficiência (ver `<resumo>`), senão `a_confirmar`.
- `orientacaoCras`: `true` quando o assistido precisar de apoio para obter documentos civis (certidões, CadÚnico, comprovante de renda) ou quando houver indício de vulnerabilidade social.
- Não solicite documento que não tenha relação com a pretensão.

## Schema de saída (JSON)

```json
{
  "itens": [
    {
      "documentoId": "string (do catálogo)",
      "nome": "string",
      "situacao": "ausente | presente | a_confirmar | gerar_na_plataforma",
      "porQue": "string",
      "ondeObter": "string | omitido",
      "fundamentoId": "string | omitido"
    }
  ],
  "documentosEspecificosDoCaso": [ { "nome": "string", "porQue": "string" } ],
  "orientacaoCras": false,
  "fontesUtilizadas": [ { "id": "string" } ]
}
```
