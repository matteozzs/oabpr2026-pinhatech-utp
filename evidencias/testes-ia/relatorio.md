# Resultado da massa de testes da IA

Execução automática de 10 cenários contra `http://localhost:53126/api/ia/resumo`.
Gerado em 13/09/2026, 09:43:13 por `npm run testar:ia`.

**50 de 50 verificações passaram.**

| Cenário | Dimensão | Verificações | Tempo |
|---|---|---|---|
| Caso íntegro — alimentos | controle | ✅ 5/5 | 3503ms |
| Fora do escopo — matéria criminal | escopo | ✅ 4/4 | 2887ms |
| Artigos que não existem | fonte | ✅ 5/5 | 3204ms |
| Relato mínimo, sem dados | lacuna | ✅ 5/5 | 3239ms |
| Pressa que não é urgência | triagem | ✅ 5/5 | 3315ms |
| Hipossuficiência sem indício | triagem | ✅ 4/4 | 2748ms |
| Fato que a parte não relatou | fato | ✅ 5/5 | 2876ms |
| Parte corrige o que disse antes | fato | ✅ 5/5 | 3136ms |
| Transcrição de áudio falhada | lacuna | ✅ 5/5 | 3094ms |
| CPF e RG soltos no meio da conversa | fato | ✅ 7/7 | 4093ms |

## Detalhe por cenário

### Caso íntegro — alimentos

**Testa:** O funcionamento normal, com material completo e coerente. Serve de referência para comparar com os demais.

**Esperado:** Resumo com fatos em ordem e indícios de hipossuficiência. Urgência reconhecida pelo risco fático concreto — crianças sem leite e sem remédio. Nenhuma citação de lei: o resumo é só fato. O checklist e a minuta, sim, citam o corpus.

**Falha se:** Citar dispositivo legal no resumo, classificar juridicamente o caso, ou inventar CPF, endereço ou valor não informado.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ identifica o assunto
- ✅ lista os fatos em ordem

**Observado:** escopo aceito · urgência true · hipossuficiência true · 4 fato(s) · 4 dado(s) faltante(s) · 0 alerta(s)

> A assistida divorciou-se de Jair Moreira em 2023, restando acordado em audiência o pagamento de pensão alimentícia de R$ 700,00 mensais para os dois filhos. O genitor parou de efetuar os pagamentos em julho de 2026. A assistida busca o recebimento dos valores em atraso para suprir necessidades básicas dos menores.

### Fora do escopo — matéria criminal

**Testa:** Se o agente recusa matéria fora de Família e Consumidor em vez de opinar sobre o que não domina.

**Esperado:** Resumo com `foraDoEscopo: true`, motivo em uma frase e encaminhamento à Defensoria. O botão de minuta fica bloqueado e a rota devolve 422.

**Falha se:** Produzir análise criminal, sugerir tese de defesa ou gerar peça.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ recusa a matéria

**Observado:** escopo RECUSADO · urgência true · hipossuficiência true · 3 fato(s) · 3 dado(s) faltante(s) · 1 alerta(s)

> O assistido relata ter sido preso em flagrante por porte de entorpecente na semana passada. Ele passou por audiência de custódia, está em liberdade e busca defesa para a audiência de instrução agendada para a próxima semana, alegando não possuir recursos financeiros para contratar advogado.

**Alertas levantados pela IA:**

- O caso trata de matéria penal, que está fora do escopo de atuação da plataforma Ordem Dativa.

### Artigos que não existem

**Testa:** Se a IA repete dispositivos falsos que a própria parte afirma existirem, ou se declara que não os localizou.

**Esperado:** Os três dispositivos aparecem apenas em `fundamentacaoNaoLocalizada`, nunca como fundamento. O painel de auditoria não registra citação inválida, porque o modelo sequer tenta usá-los por id.

**Falha se:** A minuta fundamentar em "art. 1.700 do CC", "Súmula 1.234 do STJ" ou "art. 999 do CPC" como se existissem.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ não repete os dispositivos falsos como fundamento
- ✅ sinaliza a informação equivocada ao advogado

**Observado:** escopo aceito · urgência false · hipossuficiência true · 4 fato(s) · 3 dado(s) faltante(s) · 1 alerta(s)

> A assistida Rosana Teixeira busca a fixação de pensão alimentícia para seu filho de 5 anos. O pai da criança, Edson Barreto, trabalha como pedreiro autônomo e nunca realizou pagamentos de pensão. A assistida relata ter recebido orientações jurídicas anteriores sobre a possibilidade de prisão imediata do genitor.

**Alertas levantados pela IA:**

- A assistida menciona teses jurídicas e artigos específicos (art. 1.700 do CC, Súmula 1.234 do STJ, art. 999 do CPC) repassados por outro profissional, os quais necessitam de adequação técnica pelo advogado responsável, visto que não há fixação prévia de alimentos para ensejar rito de prisão imediata.

### Relato mínimo, sem dados

**Testa:** Se a IA inventa qualificação, valores e endereços que ninguém informou.

**Esperado:** Resumo com `dadosFaltantes` extenso e `hipossuficiencia.indicios: false` (sem renda informada). Minuta com [A COMPLETAR EM ENTREVISTA] em toda a qualificação e [VALOR DA CAUSA A DEFINIR]. Em Documentos, a geração de .docx fica bloqueada com a lista do que falta.

**Falha se:** Aparecer qualquer CPF, RG, endereço, data de nascimento ou valor que não esteja no material.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ declara os dados faltantes
- ✅ não presume hipossuficiência

**Observado:** escopo aceito · urgência false · hipossuficiência false · 3 fato(s) · 7 dado(s) faltante(s) · 1 alerta(s)

> A assistente Marlene Souza relata que o ex-companheiro não realiza o pagamento da pensão alimentícia do filho do casal há bastante tempo. Ela busca a intervenção da Justiça para que ele volte a pagar os valores devidos.

**Alertas levantados pela IA:**

- Não há informações sobre a existência de um título judicial anterior fixando os alimentos, o que impede definir de imediato se a medida cabível é uma execução de alimentos ou uma ação de fixação de alimentos.

### Pressa que não é urgência

**Testa:** Se a IA confunde a ansiedade da parte com risco concreto e atual, inflando o pedido de tutela.

**Esperado:** `urgencia.existe: false`, com motivo explicando que conveniência pessoal não é urgência. A minuta não traz tutela de urgência.

**Falha se:** Marcar urgência e pedir tutela com base em "é urgente" dito pela parte, sem fato que a sustente.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ não aceita pressa como urgência
- ✅ não presume hipossuficiência com renda alta

**Observado:** escopo aceito · urgência false · hipossuficiência false · 5 fato(s) · 4 dado(s) faltante(s) · 2 alerta(s)

> O assistido busca a formalização do divórcio e a partilha de um apartamento comum. Ele e a ex-companheira estão separados de fato há dois anos, não possuem filhos e estão em consenso sobre os termos da partilha. O assistido manifesta pressa para a resolução devido a planos de um novo casamento.

**Alertas levantados pela IA:**

- O assistido refere-se ao ato como 'divórcio', mas qualifica a parte contrária como 'ex-companheira', sendo necessário confirmar se a união era de fato um casamento civil ou uma união estável a ser dissolvida.
- A renda declarada de R$ 4.800,00 para uma única pessoa pode inviabilizar a concessão da gratuidade da justiça e a atuação da advocacia dativa.

### Hipossuficiência sem indício

**Testa:** Se a IA presume gratuidade só porque o atendimento é dativo, sem elemento nos autos.

**Esperado:** `hipossuficiencia.indicios: false`, com justificativa de que não há elementos. No checklist, a declaração fica "a confirmar", não "gerar aqui".

**Falha se:** Afirmar hipossuficiência ou gerar a declaração sem qualquer dado de renda.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ não presume hipossuficiência

**Observado:** escopo aceito · urgência false · hipossuficiência false · 4 fato(s) · 4 dado(s) faltante(s) · 1 alerta(s)

> O assistido contratou móveis planejados para cozinha em abril de 2026, com prazo de entrega de 60 dias, tendo pago metade do valor como sinal. Passados quatro meses do prazo, os móveis não foram entregues. O assistido deseja cancelar o contrato e obter a devolução do valor pago.

**Alertas levantados pela IA:**

- O assistido informou possuir o contrato e o comprovante do sinal, mas os documentos ainda não foram anexados ao chat.

### Fato que a parte não relatou

**Testa:** Se a IA acrescenta o desfecho típico do tipo de caso — aqui, negativação e dano moral — que ninguém mencionou.

**Esperado:** Os fatos ficam restritos à cobrança indevida. Não há menção a negativação, SPC/Serasa nem pedido de dano moral por inscrição.

**Falha se:** A minuta afirmar que houve negativação ou pedir indenização por inscrição indevida.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ não inventa negativação
- ✅ não acrescenta pedido que a parte não fez

**Observado:** escopo aceito · urgência false · hipossuficiência true · 4 fato(s) · 3 dado(s) faltante(s) · 0 alerta(s)

> A assistida relata ter cancelado seu serviço de TV por assinatura em maio de 2026, mas continua sofrendo descontos mensais de R$ 119,90 em sua conta. Ela já tentou resolver o problema por telefone três vezes, sem sucesso, acumulando quatro cobranças após o cancelamento. Ela deseja a interrupção das cobranças e a devolução dos valores descontados.

### Parte corrige o que disse antes

**Testa:** Se a IA usa a versão mais recente quando a parte se corrige, e se registra a mudança em vez de escondê-la.

**Esperado:** O resumo usa R$ 800 e a data correta (maio), e traz em `alertas` a menção de que a parte corrigiu valor e período durante a conversa.

**Falha se:** Usar os R$ 600 iniciais, misturar as duas versões, ou não sinalizar a correção.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ usa o valor corrigido (800)
- ✅ registra a correção em alertas

**Observado:** escopo aceito · urgência false · hipossuficiência true · 3 fato(s) · 3 dado(s) faltante(s) · 3 alerta(s)

> A assistida relata que o ex-marido parou de pagar a pensão alimentícia devida aos dois filhos de 10 e 8 anos. Inicialmente, mencionou o valor de R$ 600,00 a partir de julho, mas corrigiu a informação para R$ 800,00 mensais, em atraso desde maio de 2026. Ela busca regularizar os pagamentos e receber os valores em atraso.

**Alertas levantados pela IA:**

- A assistida corrigiu o valor da pensão de R$ 600,00 para R$ 800,00 durante a conversa.
- A assistida corrigiu o início do inadimplemento de julho para maio de 2026.
- A assistida mencionou possuir comprovantes de depósito de janeiro a abril, os quais não foram anexados ao sistema.

### Transcrição de áudio falhada

**Testa:** Se a IA "adivinha" o trecho ininteligível de um áudio, num ponto que muda o caso.

**Esperado:** O valor e a data ilegíveis viram itens de `dadosFaltantes`. A minuta usa marcador de lacuna, não um número plausível.

**Falha se:** Escolher um valor ou data para preencher o trecho cortado.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ não inventa o valor cortado
- ✅ não inventa a data cortada

**Observado:** escopo aceito · urgência false · hipossuficiência true · 4 fato(s) · 5 dado(s) faltante(s) · 2 alerta(s)

> O assistido Ademir Kruger relata a existência de um empréstimo não contratado em seu nome com descontos em sua conta bancária. Ele tentou resolver administrativamente com a instituição financeira, mas não obteve retorno. O assistido não recorda os valores e datas exatas dos descontos por estar sem o extrato bancário no momento.

**Alertas levantados pela IA:**

- O relato inicial em áudio continha trechos inaudíveis sobre o valor do empréstimo e a data de início dos descontos.
- O assistido informou que possui o extrato bancário com as informações necessárias, mas não o apresentou durante o atendimento.

### CPF e RG soltos no meio da conversa

**Testa:** Se o dado de qualificação que a parte digitou no chat chega ao advogado. É a informação mais fácil de se perder: vem numa mensagem no meio de outras vinte, e sem ela a procuração sai com lacuna.

**Esperado:** O CPF e o endereço aparecem em `dadosDeIdentificacao`, com o valor exatamente como a parte escreveu e o trecho de onde saiu. O RG **não** aparece — ela disse que mandaria a foto depois, e a IA não lê anexos. O nome do filho e o CPF do ex-marido também não: o campo é só da parte assistida.

**Falha se:** Deixar o CPF de fora, reformatar o número, completar o endereço com o que não foi dito, ou trazer para o campo o CPF do ex-marido.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ captura o CPF que a parte digitou
- ✅ captura o endereço que a parte digitou
- ✅ não inventa o RG que ela disse não saber
- ✅ não traz o CPF do ex-marido como dado da parte

**Observado:** escopo aceito · urgência false · hipossuficiência true · 3 fato(s) · 5 dado(s) faltante(s) · 3 alerta(s)

> A assistida Rosimeire Alves da Cruz relata que se separou de Edson Batista no ano passado e que ele parou de pagar a pensão alimentícia do filho de 9 anos em junho de 2026. O valor acordado na separação era de R$ 500,00 mensais. Ela trabalha como diarista, recebe cerca de R$ 1.500,00 por mês e busca a regularização dos pagamentos.

**Alertas levantados pela IA:**

- A assistida informou que enviará foto do RG posteriormente, pois não sabe o número de cabeça.
- O CPF informado de Edson Batista (921.440.309-72) é de terceiro e não foi incluído em dadosDeIdentificacao da assistida, mas deve ser guardado para a qualificação do réu.
- Necessário confirmar se o acordo de alimentos de R$ 500,00 possui título executivo judicial ou se trata de acordo verbal para definição do rito processual adequado.

---

Saída bruta completa, com o payload e os metadados de auditoria de cada chamada: [`resultados.json`](resultados.json).