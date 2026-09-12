# Tarefa 04 — Mensagem acessível ao assistido

## Objetivo

Transformar a lista técnica de pendências em uma mensagem **clara, curta e acolhedora** para o assistido, enviada pelo chat da plataforma (e, no roadmap, pelo WhatsApp oficial). A comunicação com a população vulnerável é o maior gargalo da advocacia dativa — esta tarefa existe para reduzi-lo.

## Entrada

- `<advogado>`: nome.
- `<assistido>`: primeiro nome, se sabe ler e escrever (`sabeLerEscrever`), cidade.
- `<pendencias>`: lista de documentos ausentes, cada um com `nome` e `ondeObter` (quando houver).
- `<cras>`: quando houver, orientação sobre o CRAS do município do assistido.
- `<fontes>`: pode vir vazio; esta tarefa normalmente **não** cita lei.

## Regras específicas

- Frases curtas. Uma ideia por frase. Sem siglas não explicadas (se usar "CRAS", explique: "o Centro de Referência de Assistência Social, que ajuda com documentos e cadastro").
- Sem "juridiquês": nada de "instruir os autos", "petição", "protocolar". Diga "dar entrada no seu pedido", "os papéis".
- Liste os documentos numerados, um por linha, com uma dica prática de onde conseguir cada um, quando `ondeObter` existir.
- Diga o que acontece depois ("Assim que você mandar, eu preparo os papéis").
- Diga como enviar (foto pelo chat, bem nítida, ou levar pessoalmente).
- Se `sabeLerEscrever` for `false`: mensagem ainda mais curta, e sugira que alguém de confiança ajude ou que responda por áudio.
- Não prometa resultado do processo. Não mencione prazos judiciais específicos.
- Não invente endereço, telefone ou horário de órgão público. Se `<cras>` não trouxer, diga "procure o CRAS mais perto da sua casa" e nada mais.
- Assine com o nome do advogado e a frase "Advogado(a) dativo(a) nomeado(a) para o seu caso".

## Schema de saída (JSON)

```json
{
  "texto": "string — a mensagem completa, com quebras de linha \\n",
  "resumoCurto": "string — até 80 caracteres, para notificação",
  "fontesUtilizadas": []
}
```
