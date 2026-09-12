# Tarefa 01 — Resumo fático e triagem

## Objetivo

Produzir a síntese executiva que permite ao(à) advogado(a) dativo(a) — já nomeado(a) pela OAB/Fórum — se apropriar do caso em menos de um minuto, sem ouvir áudios longos nem ler relatos desorganizados.

## Entrada

Bloco `<caso>` com: relato livre do cidadão (texto ou transcrição de voz), área declarada, comarca, se há processo ativo, dados básicos informados.
Bloco `<fontes>` com os dispositivos recuperados para o tema.

## Regras específicas

- Reorganize os fatos em **ordem cronológica**, sem acrescentar nada que não esteja no relato.
- Identifique o **tema** em linguagem técnica (ex.: "Execução de alimentos", "Cobrança indevida com negativação", "Reconhecimento e dissolução de união estável") e um `temaSlug` em snake_case.
- Se o relato for insuficiente para identificar a pretensão, registre isso em `dadosFaltantes` — **não deduza** a pretensão.
- `partes.reu`: use o nome que o cidadão informou; se não informou, `[A COMPLETAR EM ENTREVISTA]`.
- `hipossuficiencia.indicios`: `true` **apenas** se o relato ou os dados trouxerem indício concreto (renda informada abaixo de 3 salários mínimos, desemprego, CadÚnico, benefício social, dificuldade financeira relatada). Caso contrário, `false` com justificativa "não há elementos no relato".
- `urgencia.existe`: `true` somente se houver risco **concreto e atual** relatado (falta de alimento para criança, corte de serviço essencial, risco à saúde, prazo decadencial próximo). Preferência ou pressa do cidadão não é urgência.
- `alertas`: inconsistências no relato, indícios de matéria conexa fora do escopo (ex.: violência), risco de prescrição/decadência, necessidade de encaminhamento paralelo.
- `foraDoEscopo`: aplique a regra do sistema. Se `true`, preencha `motivoForaDoEscopo` e deixe `fatosCronologicos` com o relato resumido em 1 item, sem análise jurídica.
- `fontesUtilizadas`: apenas os `id` que embasam sua leitura do tema. Não cite fonte que não usou.

## Schema de saída (JSON)

```json
{
  "area": "familia | consumidor",
  "tema": "string",
  "temaSlug": "string",
  "resumoExecutivo": "string — 2 a 4 frases, para leitura do advogado",
  "fatosCronologicos": ["string", "..."],
  "partes": { "autor": "string", "reu": "string", "vinculo": "string" },
  "pretensao": "string — o que o cidadão quer, em linguagem técnica",
  "urgencia": { "existe": true, "motivo": "string" },
  "hipossuficiencia": { "indicios": true, "justificativa": "string" },
  "dadosFaltantes": ["string", "..."],
  "alertas": ["string", "..."],
  "foraDoEscopo": false,
  "motivoForaDoEscopo": "string | vazio",
  "fontesUtilizadas": [ { "id": "string" } ]
}
```
