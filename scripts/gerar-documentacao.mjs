/**
 * Gera docs/Ordem-Dativa-Documentacao.docx a partir das telas em docs/imagens.
 *
 *   node scripts/gerar-documentacao.mjs
 *
 * As telas são capturadas à parte, contra o build de produção. Este script só
 * monta o documento — o conteúdo funcional fica aqui, em um lugar só, e o
 * README.md conta a mesma história em Markdown.
 */
import {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, Packer,
  PageBreak, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx';
import { readFile, writeFile } from 'node:fs/promises';

const NAVY = '0B3C7A';
const INK = '3A4454';
const CINZA = '6B7685';

const IMG = 'docs/imagens';
const LARGURA_DESKTOP = 600;
const LARGURA_CELULAR = 230;

/* ---------- blocos ---------- */

const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 }, children: [new TextRun({ text: t, bold: true, size: 32, color: NAVY })] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 }, children: [new TextRun({ text: t, bold: true, size: 25, color: NAVY })] });
const p = (t, o = {}) => new Paragraph({ spacing: { after: 140, line: 300 }, ...o, children: [new TextRun({ text: t, size: 21, color: INK })] });

/** Parágrafo com trechos em negrito: rico(['texto ', ['negrito'], ' resto']). */
const rico = (partes, o = {}) =>
  new Paragraph({
    spacing: { after: 140, line: 300 },
    ...o,
    children: partes.map((x) =>
      Array.isArray(x)
        ? new TextRun({ text: x[0], bold: true, size: 21, color: INK })
        : new TextRun({ text: x, size: 21, color: INK })),
  });

const item = (t) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 90, line: 300 }, children: [new TextRun({ text: t, size: 21, color: INK })] });

const passo = (n, t) =>
  new Paragraph({
    spacing: { after: 110, line: 300 },
    indent: { left: 360, hanging: 360 },
    children: [new TextRun({ text: n + '. ', bold: true, size: 21, color: NAVY }), new TextRun({ text: t, size: 21, color: INK })],
  });

const legenda = (t) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 260 }, children: [new TextRun({ text: t, size: 17, italics: true, color: CINZA })] });

async function tela(arquivo, texto, largura = LARGURA_DESKTOP) {
  const dados = await readFile(IMG + '/' + arquivo + '.png');
  // as capturas saem em 1280x940 (desktop) e 390x844 (celular)
  const proporcao = largura === LARGURA_CELULAR ? 844 / 390 : 940 / 1280;
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 80 },
      children: [new ImageRun({ data: dados, transformation: { width: largura, height: Math.round(largura * proporcao) } })],
    }),
    legenda(texto),
  ];
}

const celula = (texto, { cabecalho = false, largura = 33 } = {}) =>
  new TableCell({
    width: { size: largura, type: WidthType.PERCENTAGE },
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
    shading: cabecalho ? { type: ShadingType.CLEAR, fill: 'EAF1FA' } : undefined,
    children: [new Paragraph({ spacing: { after: 0, line: 280 }, children: [new TextRun({ text: texto, size: 19, bold: cabecalho, color: cabecalho ? NAVY : INK })] })],
  });

function tabela(cabecalhos, linhas, larguras) {
  const borda = { style: BorderStyle.SINGLE, size: 2, color: 'D5DBE3' };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: borda, bottom: borda, left: borda, right: borda, insideHorizontal: borda, insideVertical: borda },
    rows: [
      new TableRow({ tableHeader: true, children: cabecalhos.map((c, i) => celula(c, { cabecalho: true, largura: larguras[i] })) }),
      ...linhas.map((l) => new TableRow({ children: l.map((c, i) => celula(c, { largura: larguras[i] })) })),
    ],
  });
}

const espaco = () => new Paragraph({ spacing: { after: 200 }, children: [] });
const quebra = () => new Paragraph({ children: [new PageBreak()] });

/* ---------- conteúdo ---------- */

async function corpo() {
  return [
    h1('1. O que é'),
    p('Ordem Dativa é uma plataforma aberta que apoia o advogado dativo do Paraná no trabalho que ele já faz, e dá ao cidadão assistido um lugar para acompanhar o próprio processo em linguagem que ele entende.'),
    p('A ferramenta cobre o trecho que hoje acontece por telefone, WhatsApp pessoal e papel: entender o caso, reunir os documentos certos, preparar as peças e manter a parte informada.'),
    rico([['A plataforma não distribui nomeações e não credencia ninguém.'], ' A nomeação do advogado dativo e o aceite continuam acontecendo na OAB/PR ou no Fórum, como hoje. O caso chega à ferramenta com o advogado já nomeado e atuando.']),

    h1('2. O problema'),
    p('Entre 12 de março e 12 de setembro de 2026, a OAB/PR distribuiu 80.933 nomeações dativas em 163 comarcas. Cível e Família respondem por 34.215 delas, o escopo desta primeira versão.'),
    p('Do outro lado de cada nomeação há um advogado com honorários tabelados e um cidadão em situação de vulnerabilidade. O advogado precisa entender um relato muitas vezes desorganizado, às vezes em áudios longos, pedir documentos a quem nem sempre sabe onde consegui-los, e redigir peças. O cidadão, enquanto isso, não sabe em que pé está o processo dele.'),
    espaco(),
    tabela(
      ['Onde dói', 'O que a ferramenta faz', 'O que muda'],
      [
        ['Relato espalhado em mensagens e áudios longos', 'Resumo dos fatos em ordem cronológica, gerado a partir da conversa', 'O advogado se apropria do caso em um minuto, sem ouvir tudo de novo'],
        ['Dado pessoal dito no chat e perdido no meio das mensagens', 'CPF, RG e endereço digitados pela parte são destacados e levados à ficha com um clique', 'A procuração deixa de sair com lacuna por um dado que já tinha sido informado'],
        ['Lista de documentos montada de memória, caso a caso', 'Checklist do caso, com o que a plataforma emite e o que precisa ser pedido', 'Menos ida e volta com a parte'],
        ['Peça escrita do zero a cada nomeação', 'Minuta da petição inicial editável, com as lacunas marcadas', 'O advogado revisa em vez de digitar'],
        ['Cidadão sem notícia do próprio processo', 'Acompanhamento em linguagem simples e conversa direta com o advogado', 'Menos ligação para perguntar como está'],
        ['Número pessoal do advogado exposto', 'Conversa pelo canal oficial da plataforma', 'O advogado fala com a parte sem entregar o celular dele'],
      ],
      [26, 40, 34],
    ),

    quebra(),
    h1('3. Como a ferramenta entra no fluxo'),
    p('São dois acessos, um para cada lado, sem cadastro e sem senha no ambiente de demonstração.'),
    ...(await tela('01-home', 'Tela inicial: os dois caminhos, e os números reais da advocacia dativa no Paraná.')),
    p('No rodapé da tela inicial ficam a versão da plataforma e o botão que devolve a demonstração ao estado de fábrica.'),
    ...(await tela('02-home-rodape', 'Rodapé: versão e reinício da demonstração.')),

    quebra(),
    h1('4. A jornada do advogado dativo'),

    h2('4.1 Painel de atendimentos'),
    p('A fila de casos em andamento. Os urgentes ficam destacados, as conversas com mensagem nova aparecem com contador, e os filtros separam por área e por etapa.'),
    ...(await tela('03-painel-advogado', 'Painel do advogado: seis casos de demonstração, indicadores e filtros.')),

    h2('4.2 Conversa com a parte'),
    p('A conversa acontece pelo canal oficial da plataforma. O número pessoal do advogado não é exposto. A parte pode escrever, mandar áudio transcrito no próprio navegador e anexar foto de documento.'),
    ...(await tela('04-caixa-conversas', 'Caixa de conversas: uma linha por parte, com a última mensagem e o que não foi lido.')),
    p('Dentro da conversa ficam as ações do atendimento: resumir os fatos, enviar a lista de documentos pendentes, orientar ao CRAS e pedir assinatura. O alerta de documentos é contagem, não opinião: diz quantos faltam e quais.'),
    ...(await tela('05-conversa-advogado', 'Conversa do advogado, com o painel do caso e as ações ao lado.')),

    h2('4.3 Resumo dos fatos'),
    rico([['O resumo nasce da conversa.'], ' Enquanto a parte não falar nada no chat, o botão fica desabilitado e explica o motivo. O que entra no resumo são os dados do processo e o que foi dito na conversa, nada além disso.']),
    ...(await tela('06-conversa-resumo-pronto', 'Resumo gerado dentro da conversa, com atalho para o painel do caso.')),
    p('O resumo responde o que aconteceu, não o que o direito diz. Traz os fatos em ordem, a pretensão nas palavras da própria parte, a triagem de urgência e de hipossuficiência, e a lista do que a IA não encontrou. Enquadramento jurídico vem nas etapas seguintes.'),
    ...(await tela('07-resumo-fatico', 'Resumo dos fatos: ordem cronológica, pretensão, partes e triagem.')),
    rico([['Dado pessoal dito na conversa não se perde.'], ' Quando a parte escreve o próprio CPF, RG ou endereço no meio do chat, o resumo destaca cada valor com o trecho de onde saiu.']),
    ...(await tela('08-dados-ditos-na-conversa', 'O que a parte digitou de qualificação, com a frase de origem.')),

    h2('4.4 Dados da parte e documentos'),
    p('Os dados da parte alimentam todos os documentos gerados. A seção fica sempre aberta, porque é ela que bloqueia a geração enquanto faltar algo. Cada dado que a parte escreveu na conversa aparece com um botão para aproveitar.'),
    ...(await tela('09-dados-da-parte', 'Dados da parte: o que falta em destaque e o que a parte já informou pelo chat.')),
    p('O checklist cruza o caso com o catálogo de documentos e diz o que a plataforma emite e o que precisa ser pedido. Cada item tem ação: o que é gerado aqui vira botão de download, o que depende da parte vira atalho para a conversa.'),
    ...(await tela('10-checklist-documentos', 'Checklist do caso, com ação real em cada item.')),

    h2('4.5 Minuta da petição'),
    p('A minuta sai editável, campo a campo, e pode ser baixada em .docx. Os marcadores amarelos são lacunas declaradas pela própria ferramenta. Enquanto restar uma, a minuta não pode ser marcada como revisada.'),
    ...(await tela('11-minuta', 'Minuta da petição inicial, com o quadro de lacunas a preencher antes de conferir.')),
    ...(await tela('12-minuta-lacunas', 'O texto da peça, com as lacunas destacadas no corpo.')),

    h2('4.6 Pacote de protocolo e histórico'),
    p('O pacote reúne a conferência final em cinco itens antes de o advogado dar entrada. O histórico guarda a trilha do atendimento, com o autor de cada evento, inclusive as ações da IA.'),
    ...(await tela('13-pacote-protocolo', 'Pacote de protocolo: conferência item a item.')),
    ...(await tela('14-historico', 'Histórico do caso, com autor e horário de cada evento.')),

    quebra(),
    h1('5. A jornada do cidadão'),
    rico([['O cidadão não vê a triagem interna do advogado.'], ' Marcação de urgência, etapa do trabalho e qualquer indicação de que a IA já analisou o caso ficam do lado de lá. Ele vê o próprio relato, o andamento em linguagem simples e o que falta dele.']),

    h2('5.1 Meus processos'),
    ...(await tela('15-cidadao-processos', 'A mesma fila da seção 4.1, do ponto de vista de quem espera: sem urgência, sem etapa interna.')),

    h2('5.2 Acompanhamento'),
    p('A tela do processo diz em uma frase o que está acontecendo, quem é o advogado nomeado, o que falta de documento e onde conseguir cada coisa.'),
    ...(await tela('16-cidadao-acompanhamento', 'Acompanhamento: status explicado, advogado responsável e atalho para a conversa.')),
    ...(await tela('17-cidadao-documentos', 'Documentos pendentes, com orientação de onde obter cada um.')),

    h2('5.3 Conversa'),
    ...(await tela('18-cidadao-conversa', 'Conversa do cidadão com o advogado, com anexo de foto de documento.')),

    h2('5.4 No celular'),
    p('A interface foi desenhada primeiro para o celular, que é por onde a maior parte das pessoas assistidas vai acessar.'),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 80 },
      children: [
        new ImageRun({ data: await readFile(IMG + '/21-celular-acompanhamento.png'), transformation: { width: LARGURA_CELULAR, height: Math.round(LARGURA_CELULAR * (844 / 390)) } }),
        new TextRun({ text: '    ' }),
        new ImageRun({ data: await readFile(IMG + '/22-celular-conversa.png'), transformation: { width: LARGURA_CELULAR, height: Math.round(LARGURA_CELULAR * (844 / 390)) } }),
      ],
    }),
    legenda('Acompanhamento e conversa no celular.'),

    quebra(),
    h1('6. O que garante que a IA não inventa'),
    p('Sem entrar no mérito técnico, são cinco compromissos visíveis na própria tela:'),
    item('A ferramenta declara o que não sabe. Dado que não foi informado vira marcador de lacuna, nunca um número plausível.'),
    item('A minuta não pode ser dada por revisada enquanto restar uma lacuna.'),
    item('Nada sai como definitivo. Toda saída de IA é minuta e carrega o aviso de que exige revisão de advogado.'),
    item('Fato e direito ficam separados. O resumo conta o que aconteceu e não cita lei; o enquadramento jurídico só aparece nas etapas seguintes.'),
    item('Matéria fora de Família e Consumidor é recusada, com encaminhamento, em vez de gerar peça sobre o que a ferramenta não cobre.'),
    espaco(),
    rico([['Banco de testes aberto. '], 'A própria plataforma traz uma página de testes, fora do fluxo do produto, com dez cenários que tentam induzir erro. Cada cenário declara antes o que está testando, qual é o comportamento correto e o que caracteriza falha. Na última execução, 50 de 50 verificações automáticas passaram.']),
    ...(await tela('19-banco-de-testes', 'Banco de testes: dez cenários prontos e um cenário livre, para o avaliador montar o caso que quiser.')),

    quebra(),
    h1('7. O que a ferramenta não faz'),
    p('Está declarado na interface, e vale repetir aqui:'),
    item('Não distribui nomeações nem credencia advogados. Isso é da OAB/PR e do Fórum.'),
    item('Não protocola na Justiça. O protocolo é simulado na demonstração.'),
    item('Não envia e-mail pela plataforma. O atalho abre o cliente do próprio advogado, já endereçado.'),
    item('A assinatura é aceite eletrônico com registro de método e horário, não certificado ICP-Brasil. O botão do gov.br é ilustrativo.'),
    item('Não substitui o advogado em nada. Toda peça é minuta para revisão.'),
    espaco(),
    p('O que vem depois está na página de roadmap da própria plataforma.'),
    ...(await tela('20-roadmap', 'Roadmap: o que está entregue e o que vem em seguida.')),

    quebra(),
    h1('8. Roteiro de teste manual'),
    p('O roteiro abaixo leva cerca de dez minutos e não exige preparo. Não há cadastro nem senha: os botões de demonstração abrem cada perfil. Os dados ficam apenas no navegador de quem testa, então cada avaliador tem o seu próprio ambiente.'),

    h2('8.1 Antes de começar'),
    passo(1, 'Abra o endereço da demonstração. Prefira o Chrome, porque a transcrição de voz usa um recurso que só ele oferece por completo.'),
    passo(2, 'Role a tela inicial até o rodapé e use "Reiniciar dados da demonstração". Isso garante que você está partindo do mesmo estado deste documento.'),

    h2('8.2 Teste A — a jornada do advogado (6 minutos)'),
    passo(1, 'Na tela inicial, escolha "Sou Advogado Dativo" e entre na demonstração.'),
    passo(2, 'No painel, repare que os seis casos já chegam em atendimento. Isso é proposital: a nomeação aconteceu na OAB ou no Fórum, antes da plataforma. Não existe "abrir caso" aqui.'),
    passo(3, 'Abra o caso OD-2026-100004, de Cleusa Maria Andrade, em Castro.'),
    passo(4, 'Vá em "Resumo fático". Ainda não há resumo, e a tela diz por quê: ele nasce da conversa. Clique em "Ir para a conversa".'),
    passo(5, 'Leia a conversa. Em uma das mensagens a parte escreve o CPF, o RG e o endereço dela. Clique em "Resumir os fatos" e espere alguns segundos.'),
    passo(6, 'Volte ao painel do caso pelo atalho que apareceu. Confira os fatos em ordem, a pretensão nas palavras da parte e o quadro "Dados que a IA não encontrou". Nenhum artigo de lei aparece aqui, e isso é intencional.'),
    passo(7, 'Ainda no resumo, encontre o quadro "Dados que a parte escreveu na conversa". Estão lá o CPF, o RG e o endereço, cada um com a frase de onde saíram.'),
    passo(8, 'Abra "Documentos". A ficha da parte marca 50% e quatro campos faltando. Use os botões "Usar" do quadro azul e depois "Salvar dados": a ficha fecha em 100%.'),
    passo(9, 'Clique em "Gerar checklist com IA". Repare que os botões de gerar documento, antes bloqueados, agora estão habilitados, porque a ficha ficou completa. Baixe a procuração em .docx e confira se os dados da parte entraram no texto.'),
    passo(10, 'Vá em "Minuta da petição" e gere a minuta. Confira o quadro de lacunas e tente "Marcar como revisada": o botão só libera quando não restar nenhuma. Use "Editar" para preencher uma lacuna e veja o contador cair.'),
    passo(11, 'Passe por "Pacote de protocolo" e "Histórico". O histórico mostra quem fez cada coisa, inclusive as ações da IA.'),

    h2('8.3 Teste B — a jornada do cidadão (2 minutos)'),
    passo(1, 'No menu, use "Sair" e entre como Cidadão.'),
    passo(2, 'Abra o processo OD-2026-100001, de Maria Aparecida. Leia a frase que explica o andamento e a lista de documentos que faltam, com a orientação de onde conseguir cada um.'),
    passo(3, 'Abra a conversa e mande uma mensagem. Anexe uma "foto" de documento.'),
    passo(4, 'Em "Documentos para assinar", assine a procuração pela simulação. O registro guarda método, horário e um código de verificação.'),
    passo(5, 'Volte ao perfil de advogado e confira que a mensagem e o documento chegaram.'),

    h2('8.4 Teste C — o que cada lado vê (1 minuto)'),
    p('Este teste confere a separação entre as duas visões, que é uma decisão de projeto, não um detalhe.'),
    passo(1, 'Como advogado, abra o painel e repare nas marcações do caso OD-2026-100001: "urgente", "analisado" e a etapa do trabalho.'),
    passo(2, 'Troque para o perfil de cidadão e abra a lista dele. O mesmo caso aparece sem nenhuma dessas marcações, com o relato da própria parte e o andamento dito em português simples.'),
    passo(3, 'Confira que "Minuta gerada" virou "Em andamento" e que "Aguardando documentos" virou "Faltam documentos seus".'),

    h2('8.5 Teste D — tentar fazer a IA errar (3 minutos)'),
    passo(1, 'No menu, abra "Banco de testes". Ele fica fora do fluxo do produto, e existe para o avaliador.'),
    passo(2, 'Escolha um cenário. Cada um declara antes do teste o que está exercitando, o que é o comportamento correto e o que seria falha.'),
    passo(3, 'Sugestões: "CPF e RG soltos no meio da conversa" mostra o dado pessoal sendo recuperado sem que o da outra parte se misture; "Fora do escopo — matéria criminal" mostra a recusa; "Artigos inexistentes" mostra o que acontece quando a parte cita uma lei que não existe.'),
    passo(4, 'Clique em "Criar cenário", abra a conversa como advogado e gere o resumo. Compare o resultado com o que o cenário declarou esperar.'),
    passo(5, 'Use o "cenário livre" para montar o caso e a conversa que quiser, e tentar induzir a ferramenta a inventar.'),

    h2('8.6 Voltar ao estado inicial'),
    p('A qualquer momento: rodapé da tela inicial, botão "Reiniciar dados da demonstração". No painel do advogado há o equivalente, em "Restaurar demonstração". Tudo volta aos seis casos originais.'),

    quebra(),
    h1('9. Acesso'),
    p('A plataforma roda inteiramente no navegador de quem testa, sem banco de dados e sem conta. Para executar localmente bastam o Node instalado e uma chave gratuita do Google AI Studio:'),
    new Paragraph({
      spacing: { before: 100, after: 200 },
      shading: { type: ShadingType.CLEAR, fill: 'F4F6F9' },
      children: [
        new TextRun({ text: 'npm install', font: 'Consolas', size: 19 }),
        new TextRun({ break: 1, text: 'cp .env.example .env.local    # e preencha GEMINI_API_KEY', font: 'Consolas', size: 19 }),
        new TextRun({ break: 1, text: 'npm run dev', font: 'Consolas', size: 19 }),
      ],
    }),
    p('Sem a chave, toda a navegação funciona e apenas os botões de IA respondem que ela não está configurada.'),
    p('Código aberto sob licença MIT, em github.com/matteozzs/oabpr2026-pinhatech-utp. Nos termos do edital, o material pode ser adotado, adaptado e aprimorado por advogados, seccionais e departamentos jurídicos, preservados os créditos.'),

    h1('10. Avisos'),
    p('Ambiente de demonstração com dados fictícios. Os nomes das partes são inventados; as comarcas e os volumes de nomeação são reais. Toda saída de IA é minuta e exige revisão de advogado ou advogada. Não é serviço oficial da OAB, do TJPR ou de qualquer órgão público.'),
  ];
}

/* ---------- documento ---------- */

const capa = [
  new Paragraph({ spacing: { before: 2200, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ORDEM DATIVA', bold: true, size: 64, color: NAVY })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 700 }, children: [new TextRun({ text: 'Documentação da ferramenta', size: 30, color: INK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Hackathon da Cidadania OAB/PR 2026', size: 23, bold: true, color: INK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Trilha Inovação Aberta e Cidadania', size: 23, color: INK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: 'Equipe PinhaTech UTP', size: 23, color: INK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Versão 1.0.0 · ambiente de demonstração · licença MIT', size: 19, color: CINZA })] }),
  quebra(),
];

const doc = new Document({
  creator: 'Equipe PinhaTech UTP',
  title: 'Ordem Dativa — Documentação da ferramenta',
  description: 'Telas, entrega de valor e roteiro de teste manual da plataforma Ordem Dativa.',
  styles: { default: { document: { run: { font: 'Calibri', size: 21, color: INK } } } },
  sections: [
    {
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } },
      footers: {
        default: new Footer({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Ordem Dativa · PinhaTech UTP · Hackathon da Cidadania OAB/PR 2026', size: 16, color: CINZA })] })],
        }),
      },
      children: [...capa, ...(await corpo())],
    },
  ],
});

await writeFile('docs/Ordem-Dativa-Documentacao.docx', await Packer.toBuffer(doc));
console.log('docs/Ordem-Dativa-Documentacao.docx');
