# Tarefa 01 — Resumo fático

## Objetivo

Consolidar **tudo que o(a) advogado(a) dativo(a) apurou com a parte** — a nomeação recebida, o relato inicial e, principalmente, a **conversa** havida no chat (mensagens escritas e transcrições de áudio) — em uma síntese executiva que permita se apropriar do caso em menos de um minuto.

Esta tarefa é acionada pelo advogado **de dentro da conversa**, quando ele julga já ter apurado o suficiente. O resultado alimenta o checklist documental e a minuta.

## Entrada

- `<caso>`: área, comarca, se há processo ativo, dados já conhecidos da parte e o relato inicial.
- `<conversa>`: histórico do chat em ordem cronológica, com autor e origem de cada mensagem (`texto` ou `transcricao_audio`). Pode vir vazio — nesse caso trabalhe apenas com o relato inicial.
- `<fontes>`: dispositivos recuperados para o tema.

## Regras específicas

### Sobre a conversa
- A conversa é **fonte de fato**, não de direito. Extraia dela: datas, valores, nomes, vínculos, documentos mencionados, mudanças na versão dos fatos.
- Quando a parte **corrigir ou complementar** algo dito antes, vale a informação mais recente — e registre a mudança em `alertas`.
- Transcrições de áudio podem conter repetição, hesitação e erro de transcrição. Interprete o sentido sem acrescentar fato novo; se um trecho for ininteligível ou ambíguo em ponto relevante, registre em `dadosFaltantes`.
- **Não trate como fato** o que a parte apresenta como suposição, boato ou opinião ("acho que ele ganha uns três mil"). Se for relevante, registre como a confirmar.
- Ignore mensagens operacionais da plataforma e pedidos de documento feitos pelo advogado — não são fatos do caso.

### Sobre a síntese
- Reorganize os fatos em **ordem cronológica**, sem acrescentar nada que não esteja no relato ou na conversa.
- Identifique o **tema** em linguagem técnica (ex.: "Execução de alimentos", "Cobrança indevida com negativação", "Reconhecimento e dissolução de união estável") e um `temaSlug` em snake_case.
- Se o material for insuficiente para identificar a pretensão, registre isso em `dadosFaltantes` — **não deduza** a pretensão.
- `partes.reu`: use o nome informado; se não houver, `[A COMPLETAR EM ENTREVISTA]`.
- `pretensao`: **exatamente o que a parte pediu**, traduzido para linguagem técnica — nada além. Repetição em dobro, dano moral, tutela de urgência, multa e afins podem ser cabíveis, mas são **decisão do advogado**: se identificar algum, registre em `alertas` como sugestão ("cabe avaliar o pedido de..."), nunca dentro de `pretensao`. O advogado precisa distinguir, de relance, o que a parte quer do que ele pode pleitear.
- `hipossuficiencia.indicios`: `true` **apenas** com indício concreto (renda informada abaixo de 3 salários mínimos, desemprego, CadÚnico, benefício social, dificuldade financeira relatada). Caso contrário, `false` com justificativa "não há elementos no relato".
- `urgencia.existe`: `true` em duas hipóteses — e o campo `motivo` **deve dizer qual das duas se aplica**:
  - **(a) risco fático concreto e atual**: falta de alimento para criança, corte de serviço essencial, risco à saúde, prazo decadencial próximo;
  - **(b) presunção legal**: pedido de alimentos em favor de menor, hipótese em que a lei autoriza a fixação de provisórios de plano.
  A **pressa da parte não é urgência** em nenhuma das duas — "quero resolver logo", "é para ontem" e conveniência pessoal não contam. Fora dessas hipóteses, `false`, com o motivo explicando por quê.
- `alertas`: inconsistências entre o relato e a conversa, matéria conexa fora do escopo (ex.: violência), risco de prescrição/decadência, necessidade de encaminhamento paralelo.
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
  "pretensao": "string — o que a parte quer, em linguagem técnica",
  "urgencia": { "existe": true, "motivo": "string" },
  "hipossuficiencia": { "indicios": true, "justificativa": "string" },
  "dadosFaltantes": ["string", "..."],
  "alertas": ["string", "..."],
  "foraDoEscopo": false,
  "motivoForaDoEscopo": "string | vazio",
  "fontesUtilizadas": [ { "id": "string" } ]
}
```
