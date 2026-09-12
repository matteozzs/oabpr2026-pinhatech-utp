import type { Caso, Mensagem } from '@/types';
import { catalogoPorArea } from './documentos';

/**
 * Casos de demonstração. Nomes e fatos são fictícios.
 * Todos já chegam com a nomeação aceita — a nomeação e o aceite acontecem na OAB/Fórum, antes da plataforma.
 * As comarcas são reais (fonte: advocaciadativa.oabpr.org.br, 12/03 a 12/09/2026) — inclusive
 * Terra Boa, que teve 1 nomeação em seis meses, e Castro, com 19: exemplos de cobertura leve.
 */

const ADV = { nome: 'Helena Marques Ribeiro', oab: 'OAB/PR 00.000 (demonstração)', comarcaSede: 'Curitiba' };

function docs(area: 'familia' | 'consumidor', recebidos: string[] = [], gerados: string[] = []) {
  return catalogoPorArea(area)
    .filter((d) => d.obrigatoriedade !== 'se_pj')
    .map((d) => ({
      ...d,
      status: recebidos.includes(d.id) ? ('recebido' as const) : gerados.includes(d.id) ? ('gerado' as const) : ('pendente' as const),
    }));
}

const T = (diasAtras: number, hora = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(hora, 0, 0, 0);
  return d.toISOString();
};

export const CASOS_SEMENTE: Caso[] = [
  {
    id: 'caso_demo_001',
    protocolo: 'OD-2026-100001',
    criadoEm: T(0, 8),
    atualizadoEm: T(0, 8),
    area: 'familia',
    comarca: 'Colombo',
    temProcessoAtivo: false,
    assistido: {
      nome: 'Maria Aparecida dos Santos',
      tipoPessoa: 'PF',
      cidade: 'Colombo',
      uf: 'PR',
      bairro: 'Alto Maracanã',
      telefone: '(41) 99999-0001',
      sabeLerEscrever: true,
      rendaFamiliarMensal: 1600,
      membrosFamilia: 3,
      estadoCivil: 'divorciada',
      profissao: 'diarista',
    },
    parteContraria: { nome: 'Carlos Eduardo Pereira', tipoPessoa: 'PF', relacao: 'ex-marido, pai das crianças' },
    relato: {
      origem: 'voz',
      urgencia: true,
      motivoUrgencia: 'As crianças estão sem o dinheiro do remédio e da comida há quatro meses.',
      texto:
        'Oi, meu nome é Maria. Eu me separei do Carlos faz uns dois anos e a gente tinha combinado que ele ia dar 600 reais por mês pros nossos dois filhos, o Kauã de 9 e a Laura de 6. Só que faz quatro meses que ele não paga nada, desde maio. Eu trabalho de diarista e ganho uns 1.600 no mês quando tem serviço, e não tá dando pra comprar o remédio da asma da Laura e o material da escola. Ele trabalha de carga e descarga numa transportadora ali perto da rodoviária de Colombo, eu sei que ele recebe. Já mandei mensagem, já liguei, ele só diz que tá sem dinheiro mas eu vi que ele trocou de moto. Eu não tenho como pagar advogado. Eu queria que ele fosse obrigado a pagar a pensão das crianças e que ficasse registrado pra não acontecer de novo.',
    },
    status: 'em_atendimento',
    advogado: ADV,
    ia: {},
    documentos: docs('familia', ['documentos_pessoais']),
    assinaturas: [],
    historico: [
      { em: T(0, 8), tipo: 'criacao', descricao: 'Solicitação registrada pelo cidadão (relato por voz, transcrito).', autor: 'assistido' },
      { em: T(0, 8), tipo: 'nomeacao', descricao: 'Nomeação pela OAB/PR aceita pela advogada — fora da plataforma. Atendimento registrado.', autor: 'advogado' },
    ],
    registradoPor: 'advogado',
    nomeacao: { origem: 'oab', referencia: 'Ofício de nomeação (fictício)' },
    semente: true,
  },
  {
    id: 'caso_demo_002',
    protocolo: 'OD-2026-100002',
    criadoEm: T(1, 14),
    atualizadoEm: T(1, 14),
    area: 'consumidor',
    comarca: 'Curitiba',
    temProcessoAtivo: false,
    assistido: {
      nome: 'José Carlos Ferreira',
      tipoPessoa: 'PF',
      cidade: 'Curitiba',
      uf: 'PR',
      bairro: 'Cajuru',
      telefone: '(41) 99999-0002',
      sabeLerEscrever: true,
      rendaFamiliarMensal: 2200,
      membrosFamilia: 2,
      profissao: 'auxiliar de serviços gerais',
    },
    parteContraria: { nome: 'Operadora de telefonia (nome a confirmar na fatura)', tipoPessoa: 'PJ', relacao: 'fornecedora de serviço' },
    relato: {
      origem: 'texto',
      urgencia: false,
      texto:
        'Cancelei meu plano de celular em fevereiro deste ano, tenho o número do protocolo do cancelamento. Mesmo assim continuaram me cobrando 89,90 por mês e em julho descobri que meu nome foi pro Serasa por uma dívida de 359,60 dessa linha que eu já tinha cancelado. Fui tentar fazer crediário pra comprar uma geladeira e não consegui por causa disso. Liguei umas cinco vezes, cada vez me passam um protocolo diferente e nada resolve. Quero que tirem meu nome do Serasa, que cancelem essa cobrança e que me devolvam o que cobraram indevido. Eu paguei duas faturas depois do cancelamento com medo de ficar negativado, uns 180 reais.',
    },
    status: 'em_atendimento',
    advogado: ADV,
    ia: {},
    documentos: docs('consumidor', ['documentos_pessoais', 'protocolos_atendimento']),
    assinaturas: [],
    historico: [
      { em: T(1, 14), tipo: 'criacao', descricao: 'Solicitação registrada pelo cidadão.', autor: 'assistido' },
      { em: T(1, 14), tipo: 'nomeacao', descricao: 'Nomeação pela OAB/PR aceita pela advogada — fora da plataforma. Atendimento registrado.', autor: 'advogado' },
    ],
    registradoPor: 'advogado',
    nomeacao: { origem: 'oab', referencia: 'Ofício de nomeação (fictício)' },
    semente: true,
  },
  {
    id: 'caso_demo_003',
    protocolo: 'OD-2026-100003',
    criadoEm: T(3, 9),
    atualizadoEm: T(2, 16),
    area: 'consumidor',
    comarca: 'Fazenda Rio Grande',
    temProcessoAtivo: false,
    assistido: {
      nome: 'Antônio Marcos da Silva',
      tipoPessoa: 'PF',
      cidade: 'Fazenda Rio Grande',
      uf: 'PR',
      bairro: 'Nações',
      telefone: '(41) 99999-0003',
      sabeLerEscrever: false,
      rendaFamiliarMensal: 1412,
      membrosFamilia: 4,
      profissao: 'pedreiro',
      estadoCivil: 'casado',
    },
    parteContraria: { nome: 'Concessionária de água e saneamento', tipoPessoa: 'PJ', relacao: 'fornecedora de serviço essencial' },
    relato: {
      origem: 'voz',
      urgencia: true,
      motivoUrgencia: 'Casa com dois filhos pequenos sem água há três dias.',
      texto:
        'Cortaram a água da minha casa na terça-feira. Falaram que era por uma conta de janeiro que eu não paguei, mas eu paguei essa conta no mercado, tenho o comprovante, minha esposa guardou. Eu fui lá no atendimento com o papel e a moça disse que no sistema constava em aberto e que eu tinha que esperar uns dias pra "compensar". Tô com dois filhos pequenos em casa, um de dois anos, sem água pra cozinhar e dar banho. A vizinha tá me dando água em balde. Eu queria que religassem a água agora e que parassem de me cobrar uma conta que eu já paguei.',
    },
    status: 'aguardando_documentos',
    advogado: ADV,
    ia: {},
    documentos: docs('consumidor', ['documentos_pessoais'], ['procuracao', 'declaracao_hipossuficiencia']),
    assinaturas: [],
    historico: [
      { em: T(3, 9), tipo: 'criacao', descricao: 'Solicitação registrada pelo cidadão (relato por voz, transcrito).', autor: 'assistido' },
      { em: T(3, 9), tipo: 'nomeacao', descricao: 'Nomeação pela OAB/PR aceita pela advogada — fora da plataforma. Atendimento registrado.', autor: 'advogado' },
      { em: T(2, 16), tipo: 'status', descricao: 'Documentos solicitados ao assistido pelo chat.', autor: 'advogado' },
    ],
    registradoPor: 'advogado',
    nomeacao: { origem: 'oab', referencia: 'Ofício de nomeação (fictício)' },
    semente: true,
  },
  {
    id: 'caso_demo_004',
    protocolo: 'OD-2026-100004',
    criadoEm: T(5, 11),
    atualizadoEm: T(5, 11),
    area: 'familia',
    comarca: 'Castro',
    temProcessoAtivo: false,
    assistido: {
      nome: 'Cleusa Maria Andrade',
      tipoPessoa: 'PF',
      cidade: 'Castro',
      uf: 'PR',
      telefone: '(42) 99999-0004',
      sabeLerEscrever: true,
      rendaFamiliarMensal: 1900,
      membrosFamilia: 1,
      profissao: 'cozinheira',
      estadoCivil: 'solteira',
    },
    parteContraria: { nome: 'Valdir Antunes', tipoPessoa: 'PF', relacao: 'ex-companheiro' },
    relato: {
      origem: 'texto',
      urgencia: false,
      texto:
        'Morei com o Valdir por 14 anos, de 2011 até março deste ano, na mesma casa, todo mundo na cidade sabia que a gente era casal, nunca casamos no papel. Nesse tempo a gente comprou a casa onde morávamos, que ficou no nome dele, e um carro. Ele me mandou embora de casa em março e disse que eu não tenho direito a nada porque não era casada. Eu ajudei a pagar a casa com meu salário todos esses anos. Quero que reconheçam que a gente vivia como casal e que eu tenho direito à minha parte dos bens. Não temos filhos juntos.',
    },
    status: 'em_atendimento',
    advogado: ADV,
    ia: {},
    documentos: docs('familia'),
    assinaturas: [],
    historico: [
      { em: T(5, 11), tipo: 'criacao', descricao: 'Solicitação registrada pelo cidadão.', autor: 'assistido' },
      { em: T(5, 11), tipo: 'nomeacao', descricao: 'Nomeação pela OAB/PR aceita pela advogada — fora da plataforma (comarca de cobertura leve: 19 nomeações no semestre). Atendimento registrado.', autor: 'advogado' },
    ],
    registradoPor: 'advogado',
    nomeacao: { origem: 'oab', referencia: 'Ofício de nomeação (fictício)' },
    semente: true,
  },
  {
    id: 'caso_demo_005',
    protocolo: 'OD-2026-100005',
    criadoEm: T(7, 10),
    atualizadoEm: T(6, 9),
    area: 'familia',
    comarca: 'Ponta Grossa',
    temProcessoAtivo: true,
    numeroProcesso: '0000000-00.2024.8.16.0019 (fictício)',
    assistido: {
      nome: 'Paulo Roberto Nunes',
      tipoPessoa: 'PF',
      cidade: 'Ponta Grossa',
      uf: 'PR',
      bairro: 'Uvaranas',
      telefone: '(42) 99999-0005',
      sabeLerEscrever: true,
      rendaFamiliarMensal: 1500,
      membrosFamilia: 1,
      profissao: 'desempregado (ex-motorista)',
      estadoCivil: 'divorciado',
    },
    parteContraria: { nome: 'Fernanda Nunes (representando o filho)', tipoPessoa: 'PF', relacao: 'ex-esposa, guardiã do filho' },
    relato: {
      origem: 'texto',
      urgencia: false,
      texto:
        'Tenho um processo de pensão do meu filho de 12 anos que já tá correndo, foi fixado em 900 reais quando eu era motorista de aplicativo. Em abril eu perdi o carro num acidente e fiquei desempregado, tô fazendo bico e tirando uns 1.500 quando muito. Não tô conseguindo pagar os 900 e a mãe dele já falou que vai pedir minha prisão. Eu quero continuar pagando, mas preciso que o valor seja ajustado pra minha situação de agora até eu me reerguer. Tenho o boletim do acidente e a carteira de trabalho sem registro.',
    },
    status: 'em_atendimento',
    advogado: ADV,
    ia: {},
    documentos: docs('familia', ['documentos_pessoais', 'comprovante_residencia']),
    assinaturas: [],
    historico: [
      { em: T(7, 10), tipo: 'criacao', descricao: 'Solicitação registrada pelo cidadão (processo já em andamento).', autor: 'assistido' },
      { em: T(7, 10), tipo: 'nomeacao', descricao: 'Nomeação pela OAB/PR aceita pela advogada — fora da plataforma. Atendimento registrado.', autor: 'advogado' },
    ],
    registradoPor: 'advogado',
    nomeacao: { origem: 'oab', referencia: 'Ofício de nomeação (fictício)' },
    semente: true,
  },
  {
    id: 'caso_demo_006',
    protocolo: 'OD-2026-100006',
    criadoEm: T(9, 15),
    atualizadoEm: T(9, 15),
    area: 'consumidor',
    comarca: 'Terra Boa',
    temProcessoAtivo: false,
    assistido: {
      nome: 'Jéssica Oliveira Lima',
      tipoPessoa: 'PF',
      cidade: 'Terra Boa',
      uf: 'PR',
      telefone: '(44) 99999-0006',
      sabeLerEscrever: true,
      rendaFamiliarMensal: 2000,
      membrosFamilia: 3,
      profissao: 'atendente',
    },
    parteContraria: { nome: 'Loja de eletrodomésticos (nome na nota fiscal)', tipoPessoa: 'PJ', relacao: 'fornecedora do produto' },
    relato: {
      origem: 'texto',
      urgencia: false,
      texto:
        'Comprei uma máquina de lavar em maio, paguei 1.890 reais em 10 vezes no cartão. Com um mês ela começou a vazar e parou de centrifugar. Levei na assistência autorizada em junho, ficou 45 dias lá e voltou do mesmo jeito. A loja diz que a garantia é com a fábrica e a fábrica diz que é com a loja. Já passou muito dos 30 dias e ninguém resolve. Eu quero meu dinheiro de volta ou uma máquina nova, e tô pagando as parcelas de uma coisa que não funciona. Tenho a nota fiscal e a ordem de serviço da assistência.',
    },
    status: 'em_atendimento',
    advogado: ADV,
    ia: {},
    documentos: docs('consumidor', ['contrato_ou_nota', 'laudo_ou_fotos_produto']),
    assinaturas: [],
    historico: [
      { em: T(9, 15), tipo: 'criacao', descricao: 'Solicitação registrada pelo cidadão.', autor: 'assistido' },
      { em: T(9, 15), tipo: 'nomeacao', descricao: 'Nomeação pela OAB/PR aceita pela advogada — fora da plataforma (comarca com 1 nomeação no semestre — cobertura leve). Atendimento registrado.', autor: 'advogado' },
    ],
    registradoPor: 'advogado',
    nomeacao: { origem: 'oab', referencia: 'Ofício de nomeação (fictício)' },
    semente: true,
  },
];

export const MENSAGENS_SEMENTE: Mensagem[] = [
  {
    id: 'msg_demo_001',
    casoId: 'caso_demo_003',
    autor: 'plataforma',
    canal: 'chat',
    texto: 'Olá, Antônio. A Dra. Helena foi nomeada para o seu caso e vai falar com você por aqui. Você pode responder por texto ou mandar áudio.',
    enviadoEm: T(2, 15),
  },
  {
    id: 'msg_demo_002',
    casoId: 'caso_demo_003',
    autor: 'advogado',
    canal: 'chat',
    geradaPorIA: true,
    texto:
      'Oi, Antônio. Sou a Helena, advogada nomeada para o seu caso da água.\n\nPara eu dar entrada no pedido, preciso de fotos bem nítidas de:\n\n1. O comprovante de pagamento da conta de janeiro (o papel que sua esposa guardou).\n2. A conta de água mais recente.\n3. Seu RG e CPF.\n\nAssim que você mandar, eu preparo os papéis. Se for mais fácil, me responda por áudio.\n\nHelena Marques Ribeiro\nAdvogada dativa nomeada para o seu caso',
    enviadoEm: T(2, 16),
  },
  {
    id: 'msg_demo_003',
    casoId: 'caso_demo_003',
    autor: 'assistido',
    canal: 'chat',
    texto: 'Boa tarde doutora, minha esposa vai tirar a foto do comprovante hoje a noite e eu mando',
    enviadoEm: T(2, 18),
  },
];
