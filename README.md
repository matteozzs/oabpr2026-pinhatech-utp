# Ordem Dativa

> Da conversa com a parte à minuta pronta para revisão. Uma plataforma aberta para o advogado dativo do Paraná, e um lugar onde o cidadão assistido acompanha o próprio processo em linguagem que entende.

**Hackathon da Cidadania OAB/PR 2026 · Trilha Inovação Aberta e Cidadania · Equipe PinhaTech UTP · Licença MIT**

📄 A mesma história em documento: [`docs/Ordem-Dativa-Documentacao.docx`](docs/Ordem-Dativa-Documentacao.docx)

---

## Sumário

1. [O que é](#1-o-que-é)
2. [O problema](#2-o-problema)
3. [A jornada do advogado dativo](#3-a-jornada-do-advogado-dativo)
4. [A jornada do cidadão](#4-a-jornada-do-cidadão)
5. [O que garante que a IA não inventa](#5-o-que-garante-que-a-ia-não-inventa)
6. [O que a ferramenta não faz](#6-o-que-a-ferramenta-não-faz)
7. [Roteiro de teste manual](#7-roteiro-de-teste-manual)
8. [Como rodar](#8-como-rodar)
9. [Equipe e licença](#9-equipe-e-licença)

---

## 1. O que é

Ordem Dativa apoia o advogado dativo no trabalho que ele já faz, e dá ao cidadão assistido um lugar para acompanhar o processo dele.

A ferramenta cobre o trecho que hoje acontece por telefone, WhatsApp pessoal e papel: entender o caso, reunir os documentos certos, preparar as peças e manter a parte informada.

**A plataforma não distribui nomeações e não credencia ninguém.** A nomeação do advogado dativo e o aceite continuam acontecendo na OAB/PR ou no Fórum, como hoje. O caso chega à ferramenta com o advogado já nomeado e atuando.

![Tela inicial](docs/imagens/01-home.png)

## 2. O problema

Entre 12/03 e 12/09/2026 a OAB/PR distribuiu **80.933 nomeações dativas** em **163 comarcas** ([fonte](https://advocaciadativa.oabpr.org.br/nomeacoes-por-periodo)). Cível e Família respondem por **34.215** delas, o escopo desta primeira versão.

Do outro lado de cada nomeação há um advogado com honorários tabelados e um cidadão em situação de vulnerabilidade. O advogado precisa entender um relato muitas vezes desorganizado, às vezes em áudios longos, pedir documentos a quem nem sempre sabe onde consegui-los, e redigir peças. O cidadão, enquanto isso, não sabe em que pé está o processo dele.

| Onde dói | O que a ferramenta faz | O que muda |
|---|---|---|
| Relato espalhado em mensagens e áudios longos | Resumo dos fatos em ordem cronológica, gerado a partir da conversa | O advogado se apropria do caso em um minuto |
| Dado pessoal dito no chat e perdido no meio das mensagens | CPF, RG e endereço digitados pela parte são destacados e levados à ficha com um clique | A procuração deixa de sair com lacuna por um dado que já tinha sido informado |
| Lista de documentos montada de memória, caso a caso | Checklist do caso, separando o que a plataforma emite do que precisa ser pedido | Menos ida e volta com a parte |
| Peça escrita do zero a cada nomeação | Minuta da petição inicial editável, com as lacunas marcadas | O advogado revisa em vez de digitar |
| Cidadão sem notícia do próprio processo | Acompanhamento em linguagem simples e conversa direta | Menos ligação para perguntar como está |
| Número pessoal do advogado exposto | Conversa pelo canal oficial da plataforma | O advogado fala com a parte sem entregar o celular dele |

## 3. A jornada do advogado dativo

### Painel de atendimentos

A fila de casos em andamento. Urgentes destacados, conversas com mensagem nova com contador, filtros por área e por etapa.

![Painel do advogado](docs/imagens/03-painel-advogado.png)

### Conversa com a parte

Pelo canal oficial da plataforma: o número pessoal do advogado não é exposto. A parte escreve, manda áudio transcrito no próprio navegador ou anexa foto de documento. As ações do atendimento ficam ao lado da conversa.

![Conversa do advogado](docs/imagens/05-conversa-advogado.png)

### Resumo dos fatos

**O resumo nasce da conversa.** Enquanto a parte não falar nada no chat, o botão fica desabilitado e explica o motivo. Entram no resumo os dados do processo e o que foi dito na conversa, nada além disso.

Ele responde *o que aconteceu*, não o que o direito diz: fatos em ordem, pretensão nas palavras da própria parte, triagem de urgência e de hipossuficiência, e a lista do que a IA não encontrou. Enquadramento jurídico vem nas etapas seguintes.

![Resumo dos fatos](docs/imagens/07-resumo-fatico.png)

**Dado pessoal dito na conversa não se perde.** Quando a parte escreve o próprio CPF, RG ou endereço no meio do chat, o resumo destaca cada valor com o trecho de onde saiu.

![Dados ditos na conversa](docs/imagens/08-dados-ditos-na-conversa.png)

### Dados da parte e documentos

Os dados da parte alimentam todos os documentos gerados. A seção fica sempre aberta, porque é ela que bloqueia a geração enquanto faltar algo. Cada dado que a parte escreveu na conversa aparece com um botão para aproveitar.

![Dados da parte](docs/imagens/09-dados-da-parte.png)

O checklist cruza o caso com o catálogo e diz o que gerar aqui e o que pedir à parte. Cada item tem ação real: o que a plataforma emite vira botão de download, o que depende da parte vira atalho para a conversa.

![Checklist de documentos](docs/imagens/10-checklist-documentos.png)

### Minuta da petição

Sai editável campo a campo, com download em `.docx`. Os marcadores amarelos são lacunas declaradas pela própria ferramenta. **Enquanto restar uma, a minuta não pode ser marcada como revisada.**

![Minuta da petição](docs/imagens/11-minuta.png)

### Pacote de protocolo e histórico

Conferência final em cinco itens antes de dar entrada, e a trilha do atendimento com o autor de cada evento, inclusive as ações da IA.

![Histórico do caso](docs/imagens/14-historico.png)

## 4. A jornada do cidadão

**O cidadão não vê a triagem interna do advogado.** Marcação de urgência, etapa do trabalho e qualquer indicação de que a IA já analisou o caso ficam do lado de lá. Ele vê o próprio relato, o andamento em linguagem simples e o que falta dele.

Compare esta lista com a do painel do advogado, logo acima. É o mesmo conjunto de casos.

![Meus processos, visão do cidadão](docs/imagens/15-cidadao-processos.png)

A tela do processo diz em uma frase o que está acontecendo, quem é o advogado nomeado, o que falta de documento e onde conseguir cada coisa.

![Acompanhamento do cidadão](docs/imagens/16-cidadao-acompanhamento.png)

A interface foi desenhada primeiro para o celular, que é por onde a maior parte das pessoas assistidas vai acessar.

<p align="center">
  <img src="docs/imagens/21-celular-acompanhamento.png" width="260" alt="Acompanhamento no celular">
  <img src="docs/imagens/22-celular-conversa.png" width="260" alt="Conversa no celular">
</p>

## 5. O que garante que a IA não inventa

Cinco compromissos visíveis na própria tela:

- **Declara o que não sabe.** Dado que não foi informado vira marcador de lacuna, nunca um número plausível.
- **A minuta não pode ser dada por revisada** enquanto restar uma lacuna.
- **Nada sai como definitivo.** Toda saída de IA é minuta e carrega o aviso de que exige revisão.
- **Fato e direito ficam separados.** O resumo conta o que aconteceu e não cita lei. Um resumo que não cita lei não tem como citar lei errada.
- **Matéria fora de Família e Consumidor é recusada**, com encaminhamento, em vez de gerar peça sobre o que a ferramenta não cobre.

**Banco de testes aberto.** A plataforma traz uma página de testes, fora do fluxo do produto, com **dez cenários** que tentam induzir erro. Cada um declara antes o que exercita, qual é o comportamento correto e o que caracteriza falha. Por linha de comando, `npm run testar:ia` roda todos contra a API real e escreve [`evidencias/testes-ia/relatorio.md`](evidencias/testes-ia/relatorio.md). Última execução: **50 de 50 verificações**. Roteiro completo em [`docs/auditoria-ia.md`](docs/auditoria-ia.md).

![Banco de testes](docs/imagens/19-banco-de-testes.png)

## 6. O que a ferramenta não faz

- Não distribui nomeações nem credencia advogados. Isso é da OAB/PR e do Fórum.
- Não protocola na Justiça. O protocolo é simulado na demonstração.
- Não envia e-mail pela plataforma. O atalho abre o cliente do próprio advogado, já endereçado.
- A assinatura é aceite eletrônico com registro de método e horário, não certificado ICP-Brasil. O botão do gov.br é ilustrativo.
- Não substitui o advogado em nada. Toda peça é minuta para revisão.

O que vem depois está em **/roadmap**, na própria plataforma.

## 7. Roteiro de teste manual

Cerca de dez minutos, sem preparo. Não há cadastro nem senha: os botões de demonstração abrem cada perfil. Os dados ficam apenas no navegador de quem testa, então cada avaliador tem o seu próprio ambiente.

**Antes de começar.** Prefira o Chrome, porque a transcrição de voz usa um recurso que só ele oferece por completo. Role a tela inicial até o rodapé e use **Reiniciar dados da demonstração**, para partir do mesmo estado deste documento.

### A. A jornada do advogado (6 min)

1. Tela inicial → **Sou Advogado Dativo** → entrar na demonstração.
2. No painel, repare que os seis casos já chegam **em atendimento**. É proposital: a nomeação aconteceu antes da plataforma. Não existe "abrir caso" aqui.
3. Abra **OD-2026-100004** (Cleusa Maria Andrade, Castro).
4. Vá em **Resumo fático**. Ainda não há resumo, e a tela diz por quê: ele nasce da conversa. Clique em **Ir para a conversa**.
5. Leia a conversa. Em uma das mensagens a parte escreve o CPF, o RG e o endereço dela. Clique em **Resumir os fatos**.
6. Volte ao painel do caso pelo atalho que apareceu. Confira os fatos em ordem, a pretensão nas palavras da parte e o quadro *Dados que a IA não encontrou*. Nenhum artigo de lei aparece aqui, e isso é intencional.
7. Ainda no resumo, encontre **Dados que a parte escreveu na conversa**. Estão lá o CPF, o RG e o endereço, cada um com a frase de onde saíram.
8. Abra **Documentos**. A ficha marca 50% e quatro campos faltando. Use os botões **Usar** do quadro azul e depois **Salvar dados**: a ficha fecha em 100%.
9. **Gerar checklist com IA**. Repare que os botões de gerar documento, antes bloqueados, agora estão habilitados, porque a ficha ficou completa. Baixe a procuração em `.docx` e confira se os dados entraram no texto.
10. **Minuta da petição** → gerar. Tente **Marcar como revisada**: o botão só libera quando não restar lacuna. Use **Editar** para preencher uma e veja o contador cair.
11. Passe por **Pacote de protocolo** e **Histórico**.

### B. A jornada do cidadão (2 min)

1. Menu → **Sair** → entrar como Cidadão.
2. Abra **OD-2026-100001** (Maria Aparecida). Leia a frase que explica o andamento e a lista de documentos que faltam, com onde conseguir cada um.
3. Abra a conversa, mande uma mensagem e anexe uma "foto" de documento.
4. Em **Documentos para assinar**, assine a procuração pela simulação. O registro guarda método, horário e código de verificação.
5. Volte ao perfil de advogado e confira que a mensagem e o documento chegaram.

### C. O que cada lado vê (1 min)

1. Como advogado, veja as marcações do caso **OD-2026-100001** no painel: *urgente*, *analisado*, e a etapa do trabalho.
2. Troque para o perfil de cidadão e abra a lista dele. O mesmo caso aparece sem nenhuma dessas marcações.
3. Confira que *Minuta gerada* virou **Em andamento** e *Aguardando documentos* virou **Faltam documentos seus**.

### D. Tentar fazer a IA errar (3 min)

1. Menu → **Banco de testes**, fora do fluxo do produto.
2. Escolha um cenário. Cada um declara antes o que exercita, o que é correto e o que seria falha.
3. Sugestões: *CPF e RG soltos no meio da conversa* mostra o dado pessoal sendo recuperado sem que o da outra parte se misture; *Fora do escopo — matéria criminal* mostra a recusa; *Artigos inexistentes* mostra o que acontece quando a parte cita uma lei que não existe.
4. **Criar cenário** → abra a conversa como advogado → gere o resumo. Compare com o que o cenário declarou esperar.
5. Use o **cenário livre** para montar o caso e a conversa que quiser.

### Voltar ao estado inicial

Rodapé da tela inicial → **Reiniciar dados da demonstração**. No painel do advogado há o equivalente, em **Restaurar demonstração**.

> Mapa completo das telas, com link direto e o que validar em cada uma: [`docs/telas.md`](docs/telas.md).

## 8. Como rodar

Requisitos: Node 18+ (testado com Node 24) e uma chave gratuita do [Google AI Studio](https://aistudio.google.com/).

```bash
git clone https://github.com/matteozzs/oabpr2026-pinhatech-utp.git
cd oabpr2026-pinhatech-utp
npm install
cp .env.example .env.local   # e preencha GEMINI_API_KEY
npm run dev
```

Abra http://localhost:3000 — o servidor escuta **apenas em 127.0.0.1**. Sem a chave, toda a navegação funciona e só os botões de IA respondem que ela não está configurada.

| Variável | Padrão | Função |
|---|---|---|
| `GEMINI_API_KEY` | — | chave do AI Studio (obrigatória para a IA) |
| `GEMINI_MODEL` | `gemini-3.5-flash` | modelo primário |
| `GEMINI_FALLBACKS` | `gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.8-flash` | cadeia tentada quando o primário devolve 503/429 |

Um repositório, um deploy, sem banco de dados: o estado da demonstração vive no navegador, com casos-semente para a plataforma nunca aparecer vazia. Projeto Next.js padrão, importável na Vercel sem configuração. Quem quiser o detalhe: [`docs/arquitetura.md`](docs/arquitetura.md).

Para regenerar a documentação depois de mudar telas: `node scripts/gerar-documentacao.mjs`.

## 9. Equipe e licença

**PinhaTech UTP** — Hackathon da Cidadania OAB/PR 2026.

_Integrantes: [a preencher]_

Licença [MIT](LICENSE). Nos termos do edital, o material pode ser adotado, adaptado e aprimorado por advogados, seccionais e departamentos jurídicos, preservados os créditos.

Ambiente de demonstração com dados fictícios. Os nomes das partes são inventados; as comarcas e os volumes de nomeação são reais. Toda saída de IA é minuta e exige revisão de advogado(a). Não é serviço oficial da OAB, do TJPR ou de qualquer órgão público.
