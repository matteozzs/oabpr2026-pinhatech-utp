# Mapa de telas — o que validar em cada uma

**12 telas** (a do caso tem 5 subtelas) + 6 rotas de API. Os links são relativos: prefixe com o endereço local (`npm run dev`, na porta que o terminal informar).

Casos de demonstração: `caso_demo_001` a `caso_demo_006`. **Restaurar demonstração** (painel do advogado) devolve tudo ao estado inicial.

> **Premissa do produto:** a nomeação do advogado dativo e o seu aceite acontecem na **OAB/PR ou no Fórum, antes da plataforma**. A plataforma não cria solicitações nem credencia ninguém — ela entra em jogo com o advogado já nomeado e atuando.

---

## 1. Entrada e institucional

| # | Tela | Link | O que validar |
|---|---|---|---|
| 1 | **Home / portal duplo** | [`/`](/) | Dois caminhos (Cidadão / Advogado) + números do dado real: 80.933 nomeações, 163 comarcas, 34.215 em Cível+Família |
| 2 | **Transparência da IA** | [`/transparencia`](/transparencia) | Os **69 dispositivos** do corpus por diploma, com texto e selo "a verificar"; links dos 4 prompts |
| 3 | **Roadmap** | [`/roadmap`](/roadmap) | O que está entregue × o que vem depois |

## 2. Jornada do cidadão

| # | Tela | Link | O que validar |
|---|---|---|---|
| 4 | **Meus processos** | [`/cidadao`](/cidadao) | Entrada por botão de demonstração; lista dos processos em que já há advogado nomeado |
| 5 | **Acompanhamento** | [`/cidadao/solicitacao/caso_demo_001`](/cidadao/solicitacao/caso_demo_001) | Status em linguagem simples; cartão da conversa; documentos que faltam com onde conseguir; assinatura; CRAS |
| 6 | **Conversa** | [`/cidadao/chat/caso_demo_001`](/cidadao/chat/caso_demo_001) | Chat em tela cheia; anexar foto de documento; cartões de CRAS e de assinatura |

**Assinatura:** em (5) → "Documentos para assinar" → **Assinar digitalmente (simulação)** gera registro com método, horário e SHA-256. Também há gov.br (ilustrativo) e imprimir + foto.

## 3. Jornada do advogado dativo

| # | Tela | Link | O que validar |
|---|---|---|---|
| 7 | **Porta de entrada** | [`/advogado`](/advogado) | Botão de demonstração |
| 8 | **Meus atendimentos** | [`/advogado/dashboard`](/advogado/dashboard) | 6 casos; indicadores; filtros; urgentes destacados; não lidas; restaurar demonstração |
| 9 | **Registrar nomeação** | [`/advogado/novo-atendimento`](/advogado/novo-atendimento) | Origem da nomeação (OAB/Fórum) e ofício; dados da parte; relato colado, digitado ou transcrito |
| 10 | **Atendimento do caso** | [`/advogado/caso/caso_demo_001`](/advogado/caso/caso_demo_001) | **A tela principal** — índice à esquerda, subtela ao centro. Detalhe abaixo |
| 11 | **Caixa de conversas** | [`/advogado/chat`](/advogado/chat) | Lista por parte com última mensagem, protocolo, status e não lidas |
| 12 | **Conversa** | [`/advogado/chat/caso_demo_001`](/advogado/chat/caso_demo_001) | Chat + painel lateral + ações — inclusive **Gerar resumo fático** |

### Detalhe da tela 10 — as 5 subtelas

O índice à esquerda mostra o estado de cada etapa (pendente / em andamento / concluída) e o número de lacunas da minuta. A conversa **não** fica aqui: é link para a tela 12, para não haver dois chats concorrentes.

| Subtela | Link | O que validar |
|---|---|---|
| **Resumo fático** | [`?secao=resumo`](/advogado/caso/caso_demo_001?secao=resumo) | Sem resumo, explica que ele nasce da conversa e leva até lá. Com resumo: fatos em ordem, pretensão, urgência, hipossuficiência, dados que a IA não encontrou, fontes e painel de auditoria |
| **Documentos** | [`?secao=documentos`](/advogado/caso/caso_demo_001?secao=documentos) | **Dados da parte** (completo / % e o que falta) + checklist da IA. Cada item tem ação real: o que a plataforma emite vira **botão que gera o .docx** — habilitado só com os dados completos; o que falta ou precisa confirmar vira **botão que leva à conversa** |
| **Minuta da petição** | [`?secao=minuta`](/advogado/caso/caso_demo_001?secao=minuta) | Gerar · **Editar** (campo a campo) · **Baixar .docx**. O painel de conferência conta as lacunas e **só libera "Marcar como revisada" quando não resta nenhuma** |
| **Pacote de protocolo** | [`?secao=pacote`](/advogado/caso/caso_demo_001?secao=pacote) | Conferência em 5 itens; aprovar; registrar protocolo (simulação) |
| **Histórico** | [`?secao=historico`](/advogado/caso/caso_demo_001?secao=historico) | Trilha de auditoria com autor de cada evento, inclusive as ações da IA |

### Ações na conversa (tela 12)

- **Gerar resumo fático** — consolida o relato inicial + toda a conversa (mensagens e áudios transcritos). Depois de pronto, aparece ao lado o atalho **Ver no painel do caso**
- **Pedir documentos (IA)** — redige mensagem acessível e abre para revisão
- **Orientar ao CRAS** — cartão com busca pública do CRAS e do Fórum
- **Pedir assinatura** — cartão com atalho "Assinar agora" para o cidadão
- **Simular resposta (demo)** — a parte responde e envia uma foto, para validar o fluxo sozinho

## 4. Casos-semente

| Protocolo | Link | Cenário | Dados da parte |
|---|---|---|---|
| OD-2026-100001 | [`caso_demo_001`](/advogado/caso/caso_demo_001) | Alimentos, Colombo, **urgente**, relato por voz | completos |
| OD-2026-100002 | [`caso_demo_002`](/advogado/caso/caso_demo_002) | Consumidor, Curitiba, negativação indevida | completos |
| OD-2026-100003 | [`caso_demo_003`](/advogado/caso/caso_demo_003) | Corte de água, Fazenda Rio Grande, **parte não lê bem** | completos |
| OD-2026-100004 | [`caso_demo_004`](/advogado/caso/caso_demo_004) | União estável, **Castro** (19 nomeações no semestre) | **faltam 4** — demonstra o bloqueio de geração |
| OD-2026-100005 | [`caso_demo_005`](/advogado/caso/caso_demo_005) | Revisional de alimentos, **processo em andamento** | completos |
| OD-2026-100006 | [`caso_demo_006`](/advogado/caso/caso_demo_006) | Vício de produto, **Terra Boa** (1 nomeação no semestre) | **faltam 4** |

## 5. Rotas de API

| Rota | Método | Uso |
|---|---|---|
| `/api/ia/status` | GET | Diagnóstico: IA configurada, modelo, tamanho do corpus |
| `/api/ia/resumo` | POST | Tarefa 01 — recebe o caso **e a conversa** |
| `/api/ia/checklist` | POST | Tarefa 02 |
| `/api/ia/minuta` | POST | Tarefa 03 — devolve **422** se o caso estiver fora do escopo |
| `/api/ia/mensagem` | POST | Tarefa 04 |
| `/api/documentos/docx` | POST | Gera `.docx` a partir dos templates |

## 6. Testes de alucinação

Roteiro em [`auditoria-ia.md`](auditoria-ia.md); evidências em [`../evidencias/testes-internos/`](../evidencias/testes-internos/).
