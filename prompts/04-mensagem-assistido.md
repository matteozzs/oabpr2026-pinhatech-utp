# Tarefa 04 — Mensagem acessível à parte

## Objetivo

Transformar a lista técnica de pendências em uma comunicação **clara, curta e acolhedora** para a parte assistida, no canal escolhido pelo advogado. A comunicação com a população vulnerável é o maior gargalo da advocacia dativa — esta tarefa existe para reduzi-lo.

## Entrada

- `<canal>`: `chat` ou `email`. Muda a forma, não o conteúdo (ver abaixo).
- `<advogado>`: nome.
- `<assistido>`: primeiro nome, se sabe ler e escrever (`sabeLerEscrever`), cidade.
- `<pendencias>`: documentos ausentes, cada um com `nome` e `ondeObter` (quando houver).
- `<cras>`: quando houver, orientação sobre o CRAS do município.
- `<fontes>`: pode vir vazio; esta tarefa normalmente **não** cita lei.

## Regras de linguagem (valem para os dois canais)

- Frases curtas. Uma ideia por frase. Sem siglas não explicadas (se usar "CRAS", explique: "o Centro de Referência de Assistência Social, que ajuda com documentos e cadastro").
- Sem "juridiquês": nada de "instruir os autos", "petição", "protocolar". Diga "dar entrada no seu pedido", "os papéis".
- Liste os documentos numerados, um por linha, com uma dica prática de onde conseguir cada um, quando `ondeObter` existir.
- Diga o que acontece depois ("Assim que você mandar, eu preparo os papéis").
- Se `sabeLerEscrever` for `false`: mensagem ainda mais curta, e sugira que alguém de confiança ajude ou que responda por áudio.
- Não prometa resultado do processo. Não mencione prazos judiciais específicos.
- Não invente endereço, telefone ou horário de órgão público. Se `<cras>` não trouxer, diga "procure o CRAS mais perto da sua casa" e nada mais.

## Diferenças por canal

### `chat`
- Sem saudação formal longa: "Oi, {nome}." basta.
- Sem assunto. O campo `assunto` volta vazio.
- Assine com o nome do advogado e "Advogado(a) dativo(a) nomeado(a) para o seu caso".

### `email`
- Preencha `assunto`: até 60 caracteres, claro e sem jargão (ex.: "Documentos que preciso para dar entrada no seu pedido").
- Abra com "Olá, {nome}," e feche com despedida cordial.
- Como o e-mail costuma ser lido sem contexto, abra lembrando **quem é você e por que está escrevendo**: "Sou {nome do advogado}, advogado(a) nomeado(a) pela OAB para cuidar do seu caso."
- Diga que a pessoa pode responder por este e-mail ou pelo chat da plataforma.
- Não use formatação de marcação (nada de `**`, `#`): texto puro, que é como o e-mail será enviado.

## Schema de saída (JSON)

```json
{
  "assunto": "string — preenchido só quando o canal for email; vazio no chat",
  "texto": "string — a mensagem completa, com quebras de linha \\n",
  "resumoCurto": "string — até 80 caracteres, para notificação",
  "fontesUtilizadas": []
}
```
