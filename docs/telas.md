# Mapa de telas — o que validar em cada uma

14 telas + 6 rotas de API. Os links abaixo são relativos: prefixe com o endereço local (`npm run dev` → `http://localhost:3000`, ou a porta que o terminal informar).

Casos de demonstração disponíveis: `caso_demo_001` a `caso_demo_006`. O botão **Restaurar demonstração** (painel do advogado) devolve tudo ao estado inicial.

---

## 1. Entrada e institucional

| # | Tela | Link | O que validar |
|---|---|---|---|
| 1 | **Home / portal duplo** | [`/`](/) | Dois caminhos claros (Cidadão / Advogado). Os três números vêm do dado real: 80.933 nomeações, 163 comarcas, 34.215 em Cível+Família, com a fonte citada abaixo |
| 2 | **Transparência da IA** | [`/transparencia`](/transparencia) | Lista os **69 dispositivos** do corpus agrupados por diploma, cada um com texto e selo "a verificar"; links para os 4 prompts no GitHub; indicador de IA ativa/inativa |
| 3 | **Roadmap** | [`/roadmap`](/roadmap) | 12 itens entregues × 9 do roadmap (WhatsApp oficial, gov.br/ICP-Brasil, vídeo, mapa estadual, persistência compartilhada, verificação do corpus) |

## 2. Jornada do cidadão

| # | Tela | Link | O que validar |
|---|---|---|---|
| 4 | **Porta de entrada** | [`/cidadao`](/cidadao) | Botão "Entrar como Cidadão (demonstração)" — sem cadastro, sem senha. Depois de entrar, vira a lista de solicitações |
| 5 | **Nova solicitação** | [`/cidadao/nova-solicitacao`](/cidadao/nova-solicitacao) | 4 passos com barra de progresso; escolha de área; comarca com autocompletar das 163 reais; **"Falar em vez de escrever"** (Web Speech API, Chrome); pergunta sobre saber ler/escrever; marcação de urgência; revisão antes de enviar |
| 6 | **Acompanhamento** | [`/cidadao/solicitacao/caso_demo_001`](/cidadao/solicitacao/caso_demo_001) | Status explicado em linguagem simples; cartão da conversa com a última mensagem; documentos que faltam com **onde conseguir**; bloco de assinatura; painel do CRAS |
| 7 | **Conversa dedicada** | [`/cidadao/chat/caso_demo_001`](/cidadao/chat/caso_demo_001) | Chat em tela cheia; ações rápidas (Assinar documentos / Onde fica o CRAS / Meus documentos); **anexar foto** de documento pendente; cartões de CRAS e de assinatura recebidos do advogado |

**Validar a assinatura:** em (6), seção "Documentos para assinar" → **Assinar digitalmente (simulação)** gera registro de integridade com método, horário e SHA-256. Os outros dois caminhos (gov.br ilustrativo; imprimir + foto) também estão ali.

## 3. Jornada do advogado dativo

> A nomeação e o aceite acontecem na OAB/Fórum, **antes** da plataforma. Por isso todo caso já nasce "Em atendimento".

| # | Tela | Link | O que validar |
|---|---|---|---|
| 8 | **Porta de entrada** | [`/advogado`](/advogado) | Botão "Entrar como Advogado (demonstração)" |
| 9 | **Meus atendimentos** | [`/advogado/dashboard`](/advogado/dashboard) | 6 casos-semente; indicadores (em atendimento / aguardando documentos / total); filtros por área e status; borda vermelha nos urgentes; selo "analisado"; contador de mensagens não lidas; **Restaurar demonstração** |
| 10 | **Novo atendimento** | [`/advogado/novo-atendimento`](/advogado/novo-atendimento) | Origem da nomeação (OAB/PR ou Vara) e referência do ofício; dados do assistido; relato colado, digitado ou **transcrito pelo microfone** |
| 11 | **Atendimento do caso** | [`/advogado/caso/caso_demo_001`](/advogado/caso/caso_demo_001) | **A tela principal.** Seis seções na ordem de trabalho — ver detalhe abaixo |
| 12 | **Caixa de conversas** | [`/advogado/chat`](/advogado/chat) | Lista por assistido com avatar, última mensagem, protocolo, status e badge de não lidas; ordenada pela mensagem mais recente |
| 13 | **Conversa dedicada** | [`/advogado/chat/caso_demo_001`](/advogado/chat/caso_demo_001) | Chat em tela cheia + painel lateral com documentos e rede de apoio; 4 ações rápidas (abaixo) |
| 14 | **Credenciamento** | [`/advogado/credenciamento`](/advogado/credenciamento) | Dados do edital OAB/PR e da PGE (Lei 18.664/2015); emite credencial com hash |

### Detalhe da tela 11 — atendimento do caso

| Seção | Âncora | O que validar |
|---|---|---|
| Cabeçalho | — | Protocolo, comarca, renda familiar, se sabe ler/escrever, referência da nomeação |
| **Resumo fático** | [`#resumo`](/advogado/caso/caso_demo_001#resumo) | Botão **Analisar com IA** (~4 s): fatos em ordem, pretensão, partes, urgência, hipossuficiência, **dados que a IA não encontrou** e fontes expansíveis. Abra o **Painel de auditoria** |
| **Checklist** | [`#checklist`](/advogado/caso/caso_demo_001#checklist) | **Gerar checklist com IA** (~5 s): 11 itens com situação (presente / ausente / a confirmar / gerar aqui), motivo com citação e onde obter |
| **Documentos** | [`#documentos`](/advogado/caso/caso_demo_001#documentos) | Gera procuração, declaração de hipossuficiência e consentimento LGPD em `.docx` a partir dos templates |
| **Conversa** | [`#conversa`](/advogado/caso/caso_demo_001#conversa) | Prévia do chat + painel do CRAS; atalho para a tela dedicada |
| **Minuta** | [`#minuta`](/advogado/caso/caso_demo_001#minuta) | **Gerar minuta com IA** (~9 s): peça completa com lacunas em amarelo, chips de citação azuis, quadro "A IA declarou o que não sabe" e download `.docx` |
| **Pacote** | [`#pacote`](/advogado/caso/caso_demo_001#pacote) | Conferência em 5 itens; aprovar pacote; registrar protocolo (simulação) |
| **Histórico** | [`#historico`](/advogado/caso/caso_demo_001#historico) | Trilha de auditoria com autor de cada evento, inclusive as ações da IA |

### Ações rápidas da conversa (tela 13)

- **Pedir documentos (IA)** — redige mensagem acessível e abre para revisão antes de enviar
- **Orientar ao CRAS** — envia cartão com busca pública do CRAS e do Fórum
- **Pedir assinatura** — envia cartão com atalho "Assinar agora" para o cidadão
- **Simular resposta (demo)** — o assistido responde e envia uma foto, para validar o fluxo sozinho

## 4. Casos-semente (para testar cenários diferentes)

| Protocolo | Link | Cenário |
|---|---|---|
| OD-2026-100001 | [`caso_demo_001`](/advogado/caso/caso_demo_001) | Alimentos, Colombo, **urgente**, relato por voz |
| OD-2026-100002 | [`caso_demo_002`](/advogado/caso/caso_demo_002) | Consumidor, Curitiba, negativação indevida |
| OD-2026-100003 | [`caso_demo_003`](/advogado/caso/caso_demo_003) | Consumidor, Fazenda Rio Grande, corte de água, **assistido não lê bem**, já aguardando documentos |
| OD-2026-100004 | [`caso_demo_004`](/advogado/caso/caso_demo_004) | União estável, **Castro** (19 nomeações no semestre) |
| OD-2026-100005 | [`caso_demo_005`](/advogado/caso/caso_demo_005) | Revisional de alimentos, Ponta Grossa, **processo já em andamento** |
| OD-2026-100006 | [`caso_demo_006`](/advogado/caso/caso_demo_006) | Vício de produto, **Terra Boa** (1 nomeação no semestre) |

## 5. Rotas de API

| Rota | Método | Uso |
|---|---|---|
| `/api/ia/status` | GET | Diagnóstico: IA configurada, modelo, tamanho do corpus |
| `/api/ia/resumo` | POST | Tarefa 01 |
| `/api/ia/checklist` | POST | Tarefa 02 |
| `/api/ia/minuta` | POST | Tarefa 03 — devolve **422** se o caso estiver fora do escopo |
| `/api/ia/mensagem` | POST | Tarefa 04 |
| `/api/documentos/docx` | POST | Gera `.docx` a partir dos templates |

## 6. Testes de alucinação

Roteiro completo em [`auditoria-ia.md`](auditoria-ia.md); evidências das execuções em [`../evidencias/testes-internos/`](../evidencias/testes-internos/).
