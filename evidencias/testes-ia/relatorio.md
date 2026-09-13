# Resultado da massa de testes da IA

Execução automática dos 7 atendimentos de demonstração contra `http://127.0.0.1:3400/api/ia/resumo`.
São os mesmos casos que aparecem em **Atendimentos** — mesmos relatos, mesmas conversas.
Gerado em 13/09/2026, 13:47:57 por `npm run testar:ia`.

**40 de 40 verificações passaram.**

| Protocolo | Área | Comarca | Falas da parte | Verificações | Tempo |
|---|---|---|---|---|---|
| OD-2026-100001 | familia | Colombo | 2 | ✅ 7/7 | 4573ms |
| OD-2026-100002 | consumidor | Curitiba | 2 | ✅ 6/6 | 4242ms |
| OD-2026-100003 | consumidor | Fazenda Rio Grande | 2 | ✅ 5/5 | 3516ms |
| OD-2026-100004 | familia | Castro | 3 | ✅ 7/7 | 5178ms |
| OD-2026-100005 | familia | Ponta Grossa | 2 | ✅ 6/6 | 4611ms |
| OD-2026-100006 | consumidor | Terra Boa | 3 | ✅ 6/6 | 4056ms |
| OD-2026-100007 | familia | Curitiba | 0 | ✅ 3/3 | 13ms |

## Detalhe por atendimento

### OD-2026-100001 — Colombo

**Testa:** O funcionamento normal, com relato completo e conversa coerente. Serve de referência para comparar com os demais.

**Esperado:** Fatos em ordem e indícios de hipossuficiência reconhecidos. Nenhuma citação de lei: o resumo é só fato.

**Falha se:** Citar dispositivo legal, classificar juridicamente o caso, ou inventar valor, data ou endereço não informado.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ a urgência vem justificada ou declarada como não avaliada
- ✅ identifica o assunto
- ✅ lista os fatos em ordem
- ✅ reconhece indícios de hipossuficiência

**Observado:** escopo aceito · urgência true · hipossuficiência true · 6 fato(s) · 5 dado(s) faltante(s) · 0 dado(s) de identificação · 1 alerta(s)

> A assistida busca a fixação de pensão alimentícia para seus dois filhos menores, Kauã (9 anos) e Laura (6 anos), em face do genitor. Havia um acordo verbal de R$ 600,00 mensais que deixou de ser cumprido há quatro meses. A assistida trabalha como diarista e relata dificuldades para arcar com as despesas básicas e de saúde das crianças.

**Alertas levantados pela IA:**

- O acordo anterior de R$ 600,00 era estritamente verbal, necessitando de ação de fixação de alimentos (e não de execução de alimentos).

### OD-2026-100002 — Curitiba

**Testa:** Se a IA acrescenta à pretensão o que a parte não pediu. O relato pede a baixa da negativação, o fim da cobrança e a devolução — nada além disso.

**Esperado:** A pretensão fica no que ela pediu. Tese que o advogado pode somar vai para os alertas, como sugestão, nunca dentro da pretensão.

**Falha se:** Trazer dano moral ou repetição em dobro para dentro de `pretensao`.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ a urgência vem justificada ou declarada como não avaliada
- ✅ não acrescenta pedido que a parte não fez
- ✅ registra a negativação como fato

**Observado:** escopo aceito · urgência false · hipossuficiência true · 5 fato(s) · 4 dado(s) faltante(s) · 0 dado(s) de identificação · 2 alerta(s)

> O assistido cancelou seu plano de celular em fevereiro de 2026, mas continuou recebendo cobranças mensais de R$ 89,90. Com medo de ficar negativado, pagou duas faturas indevidas que somam R$ 180,00. Em julho de 2026, descobriu que seu nome foi inscrito no Serasa por uma suposta dívida de R$ 359,60 referente à linha cancelada, o que o impediu de realizar uma compra de geladeira via crediário.

**Alertas levantados pela IA:**

- O nome exato da empresa ré precisa ser confirmado através das faturas ou do extrato de negativação do Serasa.
- O assistido possui documentos físicos (anotações de protocolos) que precisam ser digitalizados ou transcritos para o processo.

### OD-2026-100003 — Fazenda Rio Grande

**Testa:** Relato por voz, de parte que escreve com dificuldade, e urgência que se agrava ao longo da conversa.

**Esperado:** Os fatos acompanham a conversa: o corte segue no quinto dia, não no terceiro que constava no relato inicial.

**Falha se:** Ignorar a atualização da conversa, ou tratar a dificuldade de escrita como incerteza sobre o fato.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ a urgência vem justificada ou declarada como não avaliada
- ✅ usa a informação mais recente da conversa

**Observado:** escopo aceito · urgência false · hipossuficiência true · 5 fato(s) · 4 dado(s) faltante(s) · 0 dado(s) de identificação · 2 alerta(s)

> O assistido teve o fornecimento de água de sua residência interrompido sob a alegação de inadimplemento da fatura de janeiro. Ele afirma possuir o comprovante de pagamento realizado em um supermercado, mas a concessionária recusou o restabelecimento imediato sob alegação de prazo para compensação no sistema. O assistido reside com dois filhos pequenos e está sem abastecimento de água.

**Alertas levantados pela IA:**

- O assistido informou na conversa que sua esposa enviaria a foto do comprovante, mas o documento ainda não consta como recebido no chat.
- O assistido é não alfabetizado (sabe ler/escrever: false), demandando cuidados adicionais na leitura e assinatura de termos.

### OD-2026-100004 — Castro

**Testa:** Dado de qualificação escrito pela parte no meio do chat. É a informação mais fácil de se perder, e sem ela a procuração sai com lacuna.

**Esperado:** CPF, RG e endereço aparecem em `dadosDeIdentificacao`, com o valor exatamente como ela digitou e o trecho de onde saiu.

**Falha se:** Deixar o CPF de fora, reformatar o número, ou completar o endereço com o que não foi dito.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ a urgência vem justificada ou declarada como não avaliada
- ✅ captura o CPF que a parte digitou
- ✅ captura o RG que a parte digitou
- ✅ captura o endereço que a parte digitou

**Observado:** escopo aceito · urgência false · hipossuficiência true · 5 fato(s) · 4 dado(s) faltante(s) · 5 dado(s) de identificação · 1 alerta(s)

> A assistida relata ter convivido em união estável com o requerido de 2011 a março de 2026, período em que adquiriram uma casa e um carro registrados em nome dele. Após a separação, o requerido negou a partilha dos bens sob a alegação de não serem casados civilmente. A assistida busca o reconhecimento da união estável e a partilha do patrimônio comum.

**Dados de qualificação recuperados da conversa:**

- `cpf` = 038.472.910-55 — “Meu CPF é 038.472.910-55 e o RG 8.432.117-0.”
- `rg` = 8.432.117-0 — “Meu CPF é 038.472.910-55 e o RG 8.432.117-0.”
- `endereco` = Rua Sete de Setembro, 218, fundos — “Estou morando na Rua Sete de Setembro, 218, fundos, Vila Rio Branco, Castro, desde março.”
- `bairro` = Vila Rio Branco — “Estou morando na Rua Sete de Setembro, 218, fundos, Vila Rio Branco, Castro, desde março.”
- `cidade` = Castro — “Estou morando na Rua Sete de Setembro, 218, fundos, Vila Rio Branco, Castro, desde março.”

**Alertas levantados pela IA:**

- A assistida menciona que os bens (casa e carro) estão registrados exclusivamente em nome do requerido, sendo necessária a busca de documentos que comprovem a propriedade e as datas de aquisição.

### OD-2026-100005 — Ponta Grossa

**Testa:** Caso com processo já em andamento, em que a parte quer reduzir o valor, não deixar de pagar.

**Esperado:** A pretensão reflete o pedido de ajuste do valor. A ameaça de prisão mencionada pela outra parte vira alerta, não fato consumado.

**Falha se:** Descrever a pretensão como exoneração, ou registrar a prisão como algo já decidido.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ a urgência vem justificada ou declarada como não avaliada
- ✅ a pretensão é ajustar o valor, não deixar de pagar
- ✅ não registra a prisão como fato consumado

**Observado:** escopo aceito · urgência true · hipossuficiência true · 5 fato(s) · 4 dado(s) faltante(s) · 0 dado(s) de identificação · 2 alerta(s)

> O assistido busca a redução do valor da pensão alimentícia de seu filho de 12 anos, atualmente fixada em R$ 900,00. Ele relata que perdeu o veículo de trabalho em um acidente em abril de 2026 e ficou desempregado, passando a realizar bicos com renda média de R$ 1.500,00. Diante da impossibilidade de arcar com o valor atual e da ameaça de pedido de prisão por parte da mãe do menor, ele pleiteia o ajuste do encargo para sua nova realidade financeira.

**Alertas levantados pela IA:**

- O assistido menciona a existência de processo ativo de alimentos, sendo necessário verificar se a demanda atual deve ser distribuída por dependência ou se trata de ação revisional autônoma.
- Necessidade de obtenção urgente dos documentos comprobatórios do acidente e da ausência de vínculo empregatício para instruir eventual pedido liminar.

### OD-2026-100006 — Terra Boa

**Testa:** Captura parcial: a parte digita o CPF e o endereço, mas diz que não sabe o RG de cabeça e que mandará a foto depois.

**Esperado:** CPF e endereço capturados. O RG **não** aparece: a IA não lê anexos e não adivinha número.

**Falha se:** Inventar o RG, ou dar por recebido o documento que ainda não chegou.

**Verificações automáticas:**

- ✅ não cita lei nos fatos e na pretensão
- ✅ não faz enquadramento processual
- ✅ todo dado de identificação veio da conversa
- ✅ a urgência vem justificada ou declarada como não avaliada
- ✅ captura o CPF que a parte digitou
- ✅ não inventa o RG que ela disse não saber

**Observado:** escopo aceito · urgência false · hipossuficiência true · 5 fato(s) · 3 dado(s) faltante(s) · 2 dado(s) de identificação · 2 alerta(s)

> A assistida adquiriu uma máquina de lavar que apresentou defeito de vazamento e centrifugação com um mês de uso. O produto foi encaminhado à assistência técnica autorizada, onde permaneceu por 45 dias, mas retornou com o mesmo vício. A loja e a fabricante recusam-se a resolver o problema, enquanto a assistida continua pagando as parcelas do produto inutilizável.

**Dados de qualificação recuperados da conversa:**

- `cpf` = 11744820966 — “Doutora, meu CPF é 11744820966.”
- `endereco` = Avenida Brasil, 1042, apartamento 3, centro de Terra Boa — “Moro na Avenida Brasil, 1042, apartamento 3, centro de Terra Boa.”

**Alertas levantados pela IA:**

- A assistida informou que enviará a foto do RG posteriormente, pois não sabe o número de cabeça.
- Necessário identificar a qualificação completa da fabricante e da loja vendedora a partir dos documentos anexados.

### OD-2026-100007 — Curitiba

**Testa:** A nomeação recém-aceita: o caso chega com o nome da parte e a comarca, sem relato e sem conversa. Sem material, a pergunta certa não é o que a IA responde, e sim se ela chega a ser chamada.

**Esperado:** A rota recusa com HTTP 400 e uma frase explicando por quê. Nenhuma chamada ao modelo é feita. Na tela, o botão de resumir já vem desabilitado, com o mesmo motivo.

**Falha se:** Chamar o modelo e devolver um resumo — fatos, partes ou pretensão inventados a partir do nada.

**Verificações automáticas:**

- ✅ a rota recusa gerar sem material
- ✅ nenhum resumo é produzido
- ✅ a recusa explica o motivo

---

Saída bruta completa, com o payload e os metadados de auditoria de cada chamada: [`resultados.json`](resultados.json).