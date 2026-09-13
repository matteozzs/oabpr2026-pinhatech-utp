# Tarefa 01 — Resumo fático

## Objetivo

Contar ao advogado dativo **o que aconteceu**, para que ele não precise ler dezenas de mensagens soltas nem ouvir áudios longos em sequência antes de agir.

O produto desta tarefa é **fato**, não direito. O enquadramento jurídico vem nas etapas seguintes (checklist e minuta), que recebem o corpus de fundamentação — esta não recebe.

Esta tarefa é acionada pelo advogado **de dentro da conversa**, quando ele julga já ter apurado o suficiente.

## Entrada

- `<caso>`: área, comarca, se há processo ativo, dados já conhecidos da parte e o relato inicial.
- `<conversa>`: histórico do chat em ordem cronológica, com autor e origem de cada mensagem (`texto` ou `transcricao_audio`).

Não há bloco `<fontes>` nesta tarefa, e isso é proposital: **você não tem corpus para citar aqui**.

## O que NÃO fazer

- **Não cite lei.** Nenhum artigo, nenhuma súmula, nenhum diploma, nem "nos termos da lei".
- **Não classifique juridicamente.** Não diga qual é o instituto, o rito, a natureza da ação ou o fundamento.
- **Não sugira tese.** Nada de "cabe dano moral", "é caso de repetição em dobro", "possível tutela de urgência".
- **Não avalie mérito.** Não diga se a parte tem razão, se vai ganhar ou se a prova é suficiente.
- **Não acrescente fato.** Nada que não esteja no relato ou na conversa, por mais provável que pareça.

Se sentir falta de alguma dessas coisas, é sinal de que está indo longe demais: pare no fato.

## Regras específicas

### Sobre a conversa
- A conversa é fonte de fato. Extraia dela: datas, valores, nomes, vínculos, documentos mencionados, mudanças na versão dos fatos.
- Quando a parte **corrigir ou complementar** algo dito antes, vale a informação mais recente — e registre a mudança em `alertas`.
- Transcrições de áudio podem conter repetição, hesitação e erro de transcrição. Interprete o sentido sem acrescentar fato novo; se um trecho for ininteligível ou ambíguo em ponto relevante, registre em `dadosFaltantes`.
- **Não trate como fato** o que a parte apresenta como suposição, boato ou opinião ("acho que ele ganha uns três mil"). Se for relevante, registre como a confirmar.
- Ignore mensagens operacionais da plataforma e pedidos de documento feitos pelo advogado. Não são fatos do caso e **não entram em `fatosCronologicos`** — o que o advogado pediu é trabalho do atendimento, não história da parte.

### Dados de identificação ditos na conversa
A parte costuma escrever o próprio CPF, RG ou endereço no meio do chat, em resposta a um pedido do advogado. Esse dado **não pode se perder entre as mensagens**: o advogado precisa levá-lo para a ficha da parte, que é o que alimenta procuração, declaração e petição.

Preencha `dadosDeIdentificacao` com tudo que a parte informou **por escrito na conversa** e que caiba em um destes campos — e **somente** nestes:

`nome` · `cpf` · `rg` · `nacionalidade` · `estadoCivil` · `profissao` · `endereco` · `bairro` · `cidade` · `uf` · `cep` · `telefone` · `email`

- `valor`: exatamente como a parte escreveu, sem reformatar, sem completar e sem corrigir dígito. Se ela escreveu o CPF sem pontos, mantenha sem pontos.
- `trecho`: a frase da conversa em que o dado apareceu, para o advogado conferir a origem.
- Um item por dado. Se a parte repetir o mesmo dado, registre uma vez, com o valor mais recente.
- Se ela **corrigir** um dado dito antes, use o valor corrigido e registre a correção em `alertas`.
- Dado de **terceiro** (a outra parte, um filho, uma testemunha) **não entra aqui** — este campo é só da parte assistida. Mencione no fato, se for relevante.
- Dado que aparece só em foto de documento anexada **não entra aqui**: você não lê anexos. Se a parte disser que mandou a foto, registre isso em `alertas`.
- Nada dito na conversa? Devolva lista vazia. **Nunca repita aqui um dado que já veio em `<caso>`** e nunca invente um número.

### Sobre a síntese
- Reorganize os fatos em **ordem cronológica**, sem acrescentar nada que não esteja no relato ou na conversa.
- `tema`: nomeie o assunto em poucas palavras, do jeito que se diria ao telefone ("Pensão não paga há quatro meses", "Cobrança de conta já cancelada"). Não é a classe processual. `temaSlug` em snake_case.
- `resumoExecutivo`: 2 a 4 frases dizendo o que aconteceu e o que a parte quer. Sem juízo de valor.
- `partes.reu`: use o nome informado; se não houver, `[A COMPLETAR EM ENTREVISTA]`.
- `pretensao`: **o que a parte pediu, nas palavras dela**. "Quer que ele volte a pagar a pensão", não "execução de alimentos pelo rito da prisão". Se ela não pediu nada de concreto, diga isso.
- `hipossuficiencia.indicios`: `true` **apenas** com indício concreto e relatado (renda informada baixa, desemprego, CadÚnico, benefício social, dificuldade financeira dita pela parte). Caso contrário, `false` com justificativa "não há elementos no relato". É constatação de fato, não deferimento de gratuidade.
- `urgencia.existe`: `true` só com **risco fático concreto e atual** — criança sem o que comer ou sem remédio de uso contínuo, **corte de água, luz ou gás na casa**, risco à saúde, despejo ou leilão com data marcada, prazo prestes a vencer. Serviço essencial interrompido é urgência enquanto durar, ainda mais com criança, idoso ou doente em casa. A **pressa da parte não é urgência**: "quero resolver logo" e "é para ontem" não contam. Presunção legal também não é fato: se a urgência decorre da lei, quem avalia é o advogado, não este resumo. Fora disso, `false`. O campo `motivo` é obrigatório nas duas hipóteses — diga o que caracteriza o risco, ou por que ele não existe. Nunca devolva `motivo` vazio, e nunca omita o campo `urgencia`.
- `dadosFaltantes`: o que falta apurar para o caso andar, em linguagem de fato ("valor atual do aluguel", "data exata do corte").
- `alertas`: inconsistências entre o relato e a conversa, correções feitas pela parte, matéria conexa que precisa de atenção (ex.: menção a violência), anexo que você não consegue ler. Sem recomendação de tese.
- `foraDoEscopo`: aplique a regra do sistema. Se `true`, preencha `motivoForaDoEscopo` e deixe `fatosCronologicos` com o relato resumido em 1 item.

## Schema de saída (JSON)

```json
{
  "area": "familia | consumidor",
  "tema": "string — o assunto em poucas palavras",
  "temaSlug": "string",
  "resumoExecutivo": "string — 2 a 4 frases, só fatos",
  "fatosCronologicos": ["string", "..."],
  "partes": { "autor": "string", "reu": "string", "vinculo": "string" },
  "pretensao": "string — o que a parte pediu, nas palavras dela",
  "urgencia": { "existe": false, "motivo": "string" },
  "hipossuficiencia": { "indicios": false, "justificativa": "string" },
  "dadosFaltantes": ["string", "..."],
  "dadosDeIdentificacao": [
    { "campo": "cpf", "valor": "string — como a parte escreveu", "trecho": "string — a frase de onde saiu" }
  ],
  "alertas": ["string", "..."],
  "foraDoEscopo": false,
  "motivoForaDoEscopo": "string | vazio"
}
```
