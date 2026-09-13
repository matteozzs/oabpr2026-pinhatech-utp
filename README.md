# Ordem Dativa

> Ferramentas de IA para a advocacia dativa — do relato em voz do cidadão à minuta pronta para revisão, com fundamentação restrita a um corpus aberto e verificável.

**Hackathon da Cidadania OAB/PR 2026 · Trilha Inovação Aberta e Cidadania · Equipe PinhaTech UTP · Licença MIT**

---

## Sumário

1. [O problema](#1-o-problema)
2. [O que a plataforma faz](#2-o-que-a-plataforma-faz)
3. [Roteiro de teste para auditores (5 minutos)](#3-roteiro-de-teste-para-auditores-5-minutos) · [mapa completo de telas](docs/telas.md)
4. [Como a IA é controlada (anti-alucinação)](#4-como-a-ia-é-controlada-anti-alucinação)
5. [Como rodar localmente](#5-como-rodar-localmente)
6. [Arquitetura](#6-arquitetura)
7. [Dados](#7-dados)
8. [Escopo, limitações e roadmap](#8-escopo-limitações-e-roadmap)
9. [Equipe e licença](#9-equipe-e-licença)

---

## 1. O problema

Entre 12/03 e 12/09/2026 a OAB/PR distribuiu **80.933 nomeações dativas** em **163 comarcas** (fonte: [advocaciadativa.oabpr.org.br](https://advocaciadativa.oabpr.org.br/nomeacoes-por-periodo)). Cível e Família somam 42% desse volume.

O advogado dativo recebe a nomeação, um cidadão em situação de vulnerabilidade e honorários tabelados. Precisa decidir rápido se aceita, entender um relato muitas vezes confuso, pedir os documentos certos a uma pessoa que às vezes não lê bem, e redigir peças com fundamentação correta. Cada etapa dessa cadeia é um gargalo — e o cidadão fica esperando.

**Ordem Dativa** ataca cada etapa com IA que **não inventa**: um corpus jurídico fechado, prompts auditáveis e validação de citações no servidor.

## 2. O que a plataforma faz

| Jornada do cidadão | Jornada do advogado dativo |
|---|---|
| Entra sem cadastro e relata o problema **por texto ou voz** | **Já nomeado pela OAB/Fórum** (a nomeação e o aceite acontecem antes da plataforma), registra o atendimento — ou recebe o relato que o cidadão enviou — com urgência sinalizada |
| Recebe protocolo e acompanha o status em linguagem simples | Lê o **resumo fático** gerado pela IA para se apropriar do caso em um minuto |
| Vê a lista de documentos que faltam e **onde obter** cada um | Gera o **checklist documental** cruzando o relato com o catálogo |
| Recebe orientação sobre o **CRAS** do seu município | Gera **procuração, declaração de hipossuficiência e termo de consentimento LGPD** em `.docx` a partir dos templates oficiais |
| **Assina** os documentos (aceite eletrônico com hash, gov.br ilustrativo, ou impressão + foto) | Fala com a parte pela seção **Contato** — chat interno pelo **número oficial da plataforma** (o número pessoal nunca é exposto) e **e-mail redigido com IA**: pede documentos em **linguagem acessível** (IA, revisada), envia a orientação do CRAS e o pedido de assinatura como cartões |
| Conversa com o advogado em uma **tela de chat dedicada** e envia fotos dos documentos | Gera a **minuta da petição inicial** com cada citação validada contra o corpus, baixa em `.docx`, aprova o **pacote de protocolo** |

Escopo desta versão: **Família e Sucessões** e **Direito do Consumidor (cível)**.

## 3. Roteiro de teste para auditores (5 minutos)

Acesse o link da demonstração (ou rode localmente, seção 5). Não há login: os botões “Entrar como … (demonstração)” abrem cada perfil. Os dados ficam só no seu navegador; “Restaurar demonstração” no painel do advogado volta ao estado inicial.

**A. Jornada do advogado (3 min)**
1. Início → **Sou Advogado Dativo** → *Entrar como Advogado (demonstração)*.
2. No painel, abra o caso **OD-2026-100001** (Maria Aparecida, Colombo, urgente). Repare que o caso já chega **em atendimento**: a nomeação e o aceite aconteceram na OAB/Fórum. (Para registrar um caso novo como advogado: **Novo atendimento**.)
3. Clique **Analisar com IA**. Em ~5s aparece o resumo fático, a triagem de urgência/hipossuficiência, os **dados que a IA não encontrou** (e não inventou) e as **fontes citadas** — cada uma expansível com o texto legal.
4. Abra o **Painel de auditoria da IA** (linha tracejada): mostra os dispositivos recuperados pelo RAG, a pontuação de cada um, o modelo, os tokens, e quaisquer citações inválidas bloqueadas.
5. **Gerar checklist com IA** → **Gerar minuta com IA** (~8–15s). Na minuta, os marcadores amarelos `[A COMPLETAR EM ENTREVISTA]` são lacunas declaradas; os chips azuis `[CPC-98]` são citações validadas. O quadro “A IA declarou o que não sabe” lista lacunas e fundamentação não localizada.
6. **Baixar .docx** da minuta. **Abrir conversa dedicada** → **Pedir documentos (IA)** → revise → **Enviar**. Experimente também **Orientar ao CRAS** e **Pedir assinatura** (viram cartões no chat) e **Simular resposta (demo)**.

**B. Jornada do cidadão (2 min)**
1. Menu → **Sair** → **Sou Cidadão** → *Entrar como Cidadão (demonstração)* → **Nova solicitação**.
2. Escolha *Consumidor*, comarca *Curitiba*, e no passo 3 use **Falar em vez de escrever** (Chrome) ou cole: *“Meu nome foi pro Serasa por uma conta de celular que cancelei em fevereiro, tenho protocolo. Continuaram cobrando 89,90 e paguei duas com medo. Quero limpar meu nome e receber de volta.”*
3. Envie. Na tela da solicitação: documentos pendentes, **assinar** procuração/declaração/consentimento, painel do **CRAS**, e a **conversa** (tela dedicada). Anexe uma “foto” de documento pela conversa.
4. Volte ao perfil de advogado: o caso novo está no topo da fila, com o documento recebido.

**C. Testes de alucinação — [`/auditoria`](docs/telas.md)** — 9 cenários prontos, cada um declarando antes o que testa e o que é falha, mais um cenário livre para montar o caso que quiser. Por linha de comando, `npm run testar:ia` roda todos contra a API real e gera [`evidencias/testes-ia/relatorio.md`](evidencias/testes-ia/relatorio.md) — última execução: **36/36 verificações**. Roteiro completo em [`docs/auditoria-ia.md`](docs/auditoria-ia.md).

## 4. Como a IA é controlada (anti-alucinação)

A IA desta plataforma **não tem acesso livre ao próprio conhecimento jurídico**. Ela recebe, a cada chamada, um bloco `<fontes>` com dispositivos recuperados de [`knowledge/corpus.json`](knowledge/corpus.json) e é proibida de citar qualquer coisa fora dele.

| Mecanismo | Onde | O que garante |
|---|---|---|
| **Corpus fechado** (69 dispositivos: CF/88, CPC, CC, CDC, ECA, Lei de Alimentos, EOAB, LGPD, súmulas STJ) | `knowledge/corpus.json` | Só o que está aqui pode ser citado |
| **RAG determinístico** por sobreposição léxica, filtrado por área | `src/lib/ia/rag.ts#recuperar` | Recuperação explicável linha a linha, sem serviço externo |
| **Regras de grounding** na system instruction | `prompts/00-sistema-base.md` §3 | Cite pelo `id`; se não está nas fontes, declare `FUNDAMENTAÇÃO NÃO LOCALIZADA NO CORPUS` |
| **Marcador de dado ausente** `[A COMPLETAR EM ENTREVISTA]` | `prompts/00-sistema-base.md` §3.4 | Nunca inventa CPF, RG, endereço, valor, número de processo |
| **Validação no servidor** de cada `id` citado | `src/lib/ia/rag.ts#validarFontes` | `id` inexistente é descartado e reportado; a IA não tem a palavra final |
| **Saída estruturada em JSON** com `lacunas`, `dadosFaltantes`, `fundamentacaoNaoLocalizada` | `prompts/0N-*.md` | Obriga a IA a declarar o que não sabe |
| **Escopo delimitado** (`foraDoEscopo`) | `prompts/00-sistema-base.md` §2 | Matéria criminal/trabalhista etc. não gera peça |
| **Temperatura 0.2**, raciocínio em nível baixo, teto de tokens por chamada | `src/lib/ia/provider.ts` | Saída determinística e custo controlado |
| **Rótulo permanente** “gerado por IA · requer revisão” | UI e rodapé dos `.docx` | Nada sai como definitivo |
| **Recusa de gerar sem material** | `src/features/ia/material.ts` | Sem relato nem falas da parte, o resumo nem é oferecido — não se pede à IA o que ela não tem como responder |
| **Banco de cenários + massa de testes** | `/auditoria`, `npm run testar:ia` | 9 cenários com resultado esperado declarado; 36 verificações automáticas |
| **Painel de auditoria** na própria tela | `src/components/ia.tsx#PainelAuditoria` | Auditor vê fontes recuperadas, pontuação, citações bloqueadas |

Os prompts são arquivos Markdown legíveis por quem não programa e reutilizáveis em qualquer LLM: [`prompts/README.md`](prompts/README.md). A página **/transparencia** da própria plataforma lista o corpus inteiro.

## 5. Como rodar localmente

Requisitos: Node 18+ (testado com Node 24) e uma chave do [Google AI Studio](https://aistudio.google.com/) (gratuita).

```bash
git clone https://github.com/matteozzs/oabpr2026-pinhatech-utp.git
cd oabpr2026-pinhatech-utp
npm install
cp .env.example .env.local   # e preencha GEMINI_API_KEY
npm run dev
```

Abra http://localhost:3000 — o servidor escuta **apenas em 127.0.0.1**. Diagnóstico da IA e do corpus: http://localhost:3000/api/ia/status. Mapa das telas: [`docs/telas.md`](docs/telas.md).

Variáveis (`.env.example`):

| Variável | Padrão | Função |
|---|---|---|
| `GEMINI_API_KEY` | — | chave do AI Studio (obrigatória para a IA) |
| `GEMINI_MODEL` | `gemini-3.5-flash` | modelo primário |
| `GEMINI_FALLBACKS` | `gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.8-flash` | cadeia tentada quando o primário devolve 503/429 |

Sem chave, toda a navegação funciona; só os botões de IA respondem “IA não configurada”. Trocar de provedor (ex.: Claude) = reimplementar `gerarTexto` em `src/lib/ia/provider.ts`.

Deploy: projeto Next.js padrão, importável na Vercel sem configuração — basta definir as variáveis acima.

## 6. Arquitetura

Um único repositório, um único deploy. Sem banco de dados: o estado da demonstração vive no navegador (`localStorage`), com casos-semente para a plataforma nunca aparecer vazia. Cada avaliador tem seu próprio ambiente isolado.

O código é organizado **por feature**, não por tipo de arquivo — detalhe e regras de dependência em [`docs/arquitetura.md`](docs/arquitetura.md).

```
prompts/            ← O AGENTE. Persona, escopo, regras anti-alucinação e as 4 tarefas (Markdown)
knowledge/          ← O CORPUS. Única fonte que a IA pode citar (JSON aberto) + metodologia
templates/          ← Modelos oficiais .docx de procuração e declaração de hipossuficiência
src/
  app/              ← rotas: páginas finas que compõem features + route handlers em app/api
  components/       ← genérico, sem regra de negócio: ui/ (primitivos) e layout/
  features/         ← domínio: ia/ · casos/ · chat/ · documentos/ · cras/
  lib/              ← infraestrutura: ia/ e documentos/ (servidor), store/ (cliente), utils
  data/             ← comarcas reais, catálogo de documentos, rede CRAS, casos-semente
docs/               ← mapa de telas, arquitetura e guia de auditoria da IA
evidencias/         ← saídas brutas dos testes e prints dos checkpoints
```

Stack: Next.js 16 (App Router) · TypeScript · Tailwind v4 · Gemini via REST (sem SDK, chamada legível) · `docx` · Web Speech API para voz.

**Mapa completo das 12 telas (a do caso tem 5 subtelas), com link e o que validar: [`docs/telas.md`](docs/telas.md).**

## 7. Dados

- **Comarcas e volumes**: extraídos da planilha oficial de nomeações (12/03–12/09/2026, 80.933 registros) para `src/data/comarcas.json`. Só agregados por comarca/especialidade; **nenhum nome de advogado é usado**.
- **Rede CRAS da RMC** (`src/data/cras-rmc.json`): 29 municípios com o tipo de rede e os serviços da Proteção Social Básica. Dados informativos para a demonstração — a plataforma **não** exibe endereço/telefone inventado; o botão de localização abre busca pública.
- **Casos-semente**: 6 casos fictícios (nomes inventados), em comarcas reais, inclusive Castro (19 nomeações no semestre) e Terra Boa (1 nomeação).
- **Corpus jurídico**: transcrito pela equipe; cada item carrega `verificado: false` até a conferência das pessoas do Direito contra a fonte oficial. Ver [`knowledge/README.md`](knowledge/README.md).

## 8. Escopo, limitações e roadmap

O que está simulado e declarado como tal na interface: o vínculo da solicitação do cidadão com a nomeação (na operação real, a OAB/Fórum nomeia e o advogado aceita antes de o caso entrar na plataforma; na demonstração todo caso vai para a advogada de demonstração), a assinatura digital (aceite com hash SHA-256, não ICP-Brasil), o gov.br (botão ilustrativo), o protocolo judicial e o espelhamento no WhatsApp.

Roadmap completo em **/roadmap**: API oficial do WhatsApp (Meta), gov.br/ICP-Brasil, transcrição de vídeo, integração com o sistema de dativos da OAB/PR, mapa estadual completo, novas áreas (Criminal é o maior volume), persistência compartilhada e verificação integral do corpus.

## 9. Equipe e licença

**PinhaTech UTP** — Hackathon da Cidadania OAB/PR 2026.

_Integrantes: [a preencher]_

Licença [MIT](LICENSE). Nos termos do edital, o material pode ser adotado, adaptado e aprimorado por advogados, seccionais e departamentos jurídicos, preservados os créditos.

Ambiente de demonstração com dados fictícios. Toda saída de IA é minuta e exige revisão de advogado(a). Não é serviço oficial da OAB, do TJPR ou de qualquer órgão público.
