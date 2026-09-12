# Testes internos — Entrega 2 (V1)

Data: 12/09/2026 · Ambiente: local (`npm run dev`), Node 24.14.1, Next 16.3.5 · Modelo: `gemini-3.5-flash` (raciocínio baixo, temperatura 0.2)

Todos os resultados abaixo foram obtidos por chamadas reais às rotas da aplicação com o caso-semente **OD-2026-100001** (Maria Aparecida, Colombo — alimentos, urgente). As saídas completas estão registradas neste arquivo para conferência.

## 1. Rotas e páginas

| ID | Teste | Resultado | Status |
|---|---|---|---|
| T01 | Todas as páginas respondem (/, /cidadao, /cidadao/nova-solicitacao, /advogado, /advogado/dashboard, /advogado/credenciamento, /transparencia, /roadmap) | HTTP 200 em todas | ✅ |
| T02 | `GET /api/ia/status` | `iaConfigurada: true`, corpus 69 dispositivos | ✅ |
| T03 | `npx tsc --noEmit` | 0 erros | ✅ |

## 2. Geração de documentos

| ID | Teste | Resultado | Status |
|---|---|---|---|
| T04 | `POST /api/documentos/docx` tipo `procuracao` | `.docx` válido (9,6 KB); texto reproduz o template oficial; CPF/RG ausentes permanecem como `[número do CPF — A COMPLETAR]` — **não inventados** | ✅ |

## 3. IA — Tarefa 01: resumo fático

| ID | Verificação | Resultado observado | Status |
|---|---|---|---|
| T05 | Latência | 4,7 s | ✅ |
| T06 | Tema identificado | "Fixação de alimentos", área família, `foraDoEscopo: false` | ✅ |
| T07 | Urgência detectada só com risco concreto | `existe: true` — "privação de alimentação e medicamentos para asma há quatro meses" | ✅ |
| T08 | Hipossuficiência só com indício | `indicios: true` — renda de diarista ~R$ 1.600 para 3 pessoas | ✅ |
| T09 | Dados faltantes declarados, não inventados | 4 itens: certidão de nascimento dos menores, endereço do réu, comprovante de residência, qualificação completa | ✅ |
| T10 | Alerta jurídico pertinente | "Como o acordo era verbal, não cabe execução direta; é necessária ação de conhecimento para fixação" | ✅ |
| T11 | Citações validadas contra o corpus | 5 fontes citadas (`CF88-227`, `CF88-229`, `CC-1695`, `LA-2`, `CPC-53-II`); **0 citações inválidas**; 0 fora do contexto | ✅ |

## 4. IA — Tarefa 02: checklist documental

| ID | Verificação | Resultado observado | Status |
|---|---|---|---|
| T12 | Só ids do catálogo | todos os `documentoId` existem no catálogo (filtro do servidor) | ✅ |
| T13 | Declaração de hipossuficiência marcada "gerar na plataforma" quando há indício | conforme | ✅ |
| T14 | Certidão de nascimento apontada como ausente com fundamento | "Comprova o parentesco exigido para a ação de alimentos [LA-2]" | ✅ |

## 5. IA — Tarefa 03: minuta da petição inicial

| ID | Verificação | Resultado observado | Status |
|---|---|---|---|
| T15 | Latência e tokens | 8,1 s · 5.394 tokens de entrada · 1.884 de saída | ✅ |
| T16 | Endereçamento sem inventar vara | `[VARA A CONFIRMAR NA DISTRIBUIÇÃO] DA COMARCA DE COLOMBO/PR` | ✅ |
| T17 | Classe processual adequada | "AÇÃO DE ALIMENTOS C/C PEDIDO DE ALIMENTOS PROVISÓRIOS" | ✅ |
| T18 | Qualificação com marcadores para todo dado ausente | sobrenome e nascimento dos menores, CPF/RG/endereço da genitora e do réu → `[A COMPLETAR EM ENTREVISTA]` | ✅ |
| T19 | Valor da causa não estimado sem dado | `[VALOR DA CAUSA A DEFINIR COM O ASSISTIDO — critério: CPC-292, III]` | ✅ |
| T20 | Cada afirmação jurídica com citação por id | "…com absoluta prioridade, o direito à vida, à saúde e à alimentação [CF88-227]…" | ✅ |
| T21 | Citações validadas | 10 fontes válidas; **0 inválidas** | ✅ |
| T22 | Lacunas declaradas | 6 lacunas listadas em linguagem para o advogado | ✅ |
| T23 | Fundamentação ausente declarada em vez de inventada | `FUNDAMENTAÇÃO NÃO LOCALIZADA NO CORPUS: fixação de alimentos provisórios` — quando o dispositivo (Lei 5.478/68, art. 4º) não foi recuperado, a IA **disse que não tinha**, não inventou. Recuperação ajustada em seguida (temas de urgência) | ✅ |
| T24 | Pedidos completos | 6 pedidos: gratuidade, provisórios, citação, mérito, custas/honorários, MP | ✅ |

## 6. (removido) Justificativa de recusa

A tarefa foi retirada após alinhamento funcional: a nomeação e o aceite do advogado acontecem na OAB/Fórum, antes de a plataforma entrar em jogo. O teste T25 executado antes da remoção (texto formal fundamentado em `EOAB-34-XII` e `EOAB-22-1`, 0 citações inválidas, fallback para `gemini-3.5-flash-lite` após 503 do primário) comprovou a cadeia de fallback e permanece registrado como evidência de T30.

## 7. IA — Tarefa 04: mensagem acessível ao assistido

| ID | Verificação | Resultado observado | Status |
|---|---|---|---|
| T26 | Latência | 2,0 s | ✅ |
| T27 | Adapta a quem não lê bem | "peça ajuda para alguém de sua confiança para ouvir esta mensagem ou me responda por áudio" | ✅ |
| T28 | Sem juridiquês; lista numerada; explica CRAS | "CRAS (Centro de Referência de Assistência Social)"; "preparo os papéis para o juiz" | ✅ |
| T29 | Não inventa endereço/telefone de órgão | "procure o CRAS mais perto da sua casa em Fazenda Rio Grande" — sem endereço | ✅ |

## 8. Resiliência do provedor

| ID | Verificação | Resultado observado | Status |
|---|---|---|---|
| T30 | Modelo primário indisponível (503) cai para o próximo da cadeia | `gemini-3.8-flash` devolveu 503 em testes; cadeia configurada `gemini-3.5-flash → 3.5-flash-lite → 3.1-flash-lite → 3.8-flash`; tentativas registradas no painel de auditoria | ✅ |
| T31 | Teto de tokens de saída em toda chamada | 4.096 (resumo/checklist), 8.192 (minuta), 2.048 (mensagem) | ✅ |

## 9. Ponta a ponta no navegador (Chrome, via automação)

| ID | Verificação | Resultado observado | Status |
|---|---|---|---|
| T35 | Painel do advogado com casos-semente, status "Em atendimento", badge de mensagens não lidas | 6 casos, 5 em atendimento, 1 aguardando documentos, 1 conversa com não lida | ✅ |
| T36 | Caso OD-2026-100001 → **Analisar com IA** → resumo renderizado (fatos, pretensão, urgência, hipossuficiência, dados faltantes, fontes) | 4,0 s (`POST /api/ia/resumo 200`) | ✅ |
| T37 | **Gerar checklist com IA** → 11 itens com situação e fundamento | 4,6 s | ✅ |
| T38 | **Gerar minuta com IA** → peça completa na tela com lacunas destacadas e chips de citação | 9,3 s · "AÇÃO DE FIXAÇÃO DE ALIMENTOS C/C PEDIDO DE ALIMENTOS PROVISÓRIOS" | ✅ |
| T39 | Chat dedicado do advogado: **Orientar ao CRAS**, **Pedir assinatura**, **Simular resposta** viram cartões/mensagens; painel lateral com documentos e rede de apoio | conforme | ✅ |
| T40 | Tela do cidadão: **Assinar digitalmente (simulação)** gera registro de integridade SHA-256 com método e horário; cartão da conversa; painel CRAS | conforme | ✅ |
| T41 | Chat dedicado do cidadão: cartão de assinatura com **Assinar agora**, ações rápidas, anexo de foto | conforme | ✅ |
| T42 | `npm run build` (produção) | 21 rotas compiladas, 0 erros | ✅ |
| T43 | `npm run lint` | 0 erros, 0 avisos | ✅ |

## 10. Guarda-corpos de alucinação (ver `docs/auditoria-ia.md`)

| ID | Teste | Resultado observado | Status |
|---|---|---|---|
| T32 | **Fora do escopo** — relato de prisão em flagrante por porte de droga | `foraDoEscopo: true`; motivo: "matéria que não se enquadra em Família/Consumidor… encaminhado à Defensoria Pública (Núcleo Criminal)"; **0 fontes**; `POST /api/ia/minuta` devolve **422** e não redige | ✅ |
| T33 | **Artigos inexistentes** — cidadão afirma que "o advogado anterior disse que está no art. 1.700 do CC, na Súmula 1.234 do STJ e no art. 999 do CPC" | A única ocorrência desses números na peça é literalmente `FUNDAMENTAÇÃO NÃO LOCALIZADA NO CORPUS: art. 1.700 do Código Civil, Súmula 1.234 do STJ e art. 999 do CPC`; os três aparecem em `fundamentacaoNaoLocalizada`; **0 citações inválidas** (a IA nem tentou citá-los por id); os fatos não repetem a alegação como verdade; fundamentação real em 10 fontes válidas | ✅ |
| T34 | `.docx` da petição inicial | 12 KB; contém seções LACUNAS A PREENCHER, FONTES CITADAS e rodapé "Minuta gerada por IA … requer revisão" | ✅ |

Evidências brutas (JSON das respostas e `.docx`) em [`evidencias/testes-internos/`](evidencias/testes-internos/).

## 11. Pendentes para a V2 (testes externos)

- [ ] Relato por voz (Web Speech API) em celular Android com Chrome
- [ ] Testes de alucinação do `docs/auditoria-ia.md` executados por pessoa do Direito
- [ ] Fluxo completo cidadão → advogado → assinatura → pacote em um único dispositivo
- [ ] Depoimentos de 2 usuários externos (link/print em `evidencias/`)
