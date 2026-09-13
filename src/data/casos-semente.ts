import type { Caso, Mensagem } from '@/types';
import { catalogoPorArea } from './documentos';

/**
 * Casos de demonstração. Nomes e fatos são fictícios.
 * Todos já chegam com a nomeação aceita — a nomeação e o aceite acontecem na OAB/Fórum, antes da plataforma.
 *
 * Coerência de dados: onde 'documentos_pessoais' consta como recebido, a qualificação (CPF, RG,
 * endereço) está preenchida — o dado veio do documento. Onde não consta (004 e 006), fica vazia
 * de propósito, para demonstrar o marcador [A COMPLETAR EM ENTREVISTA] nos documentos gerados.
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
      cpf: '041.882.560-17',
      rg: '9.884.213-0 SESP/PR',
      nacionalidade: 'brasileira',
      endereco: 'Rua das Araucárias, 145',
      cep: '83408-140',
      cidade: 'Colombo',
      uf: 'PR',
      bairro: 'Alto Maracanã',
      telefone: '(41) 99999-0001',
      email: 'maria.aparecida@exemplo.com.br',
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
      cpf: '028.447.910-55',
      rg: '7.412.908-3 SESP/PR',
      nacionalidade: 'brasileiro',
      estadoCivil: 'solteiro',
      endereco: 'Rua Professor Nilo Brandão, 872',
      cep: '82900-030',
      cidade: 'Curitiba',
      uf: 'PR',
      bairro: 'Cajuru',
      telefone: '(41) 99999-0002',
      email: 'jose.ferreira@exemplo.com.br',
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
      cpf: '063.115.240-88',
      rg: '10.229.744-6 SESP/PR',
      nacionalidade: 'brasileiro',
      endereco: 'Rua Alagoas, 58',
      cep: '83820-120',
      cidade: 'Fazenda Rio Grande',
      uf: 'PR',
      bairro: 'Nações',
      telefone: '(41) 99999-0003',
      email: 'antonio.silva@exemplo.com.br',
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
      email: 'cleusa.andrade@exemplo.com.br',
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
      cpf: '017.306.829-04',
      rg: '6.330.517-2 SESP/PR',
      nacionalidade: 'brasileiro',
      endereco: 'Avenida General Carlos Cavalcanti, 2310',
      cep: '84030-900',
      cidade: 'Ponta Grossa',
      uf: 'PR',
      bairro: 'Uvaranas',
      telefone: '(42) 99999-0005',
      email: 'paulo.nunes@exemplo.com.br',
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
      email: 'jessica.lima@exemplo.com.br',
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
  /* 001 — alimentos, Colombo. Conversa curta: a advogada já tem o essencial. */
  { id: 'msg_001_1', casoId: 'caso_demo_001', autor: 'advogado', canal: 'chat', tipo: 'texto', enviadoEm: T(0, 9),
    texto: 'Bom dia, dona Maria. Sou a Helena, advogada nomeada pela OAB para o seu caso. Recebi o seu relato. O acordo dos 600 reais foi feito em algum processo, ou foi um combinado entre vocês?' },
  { id: 'msg_001_2', casoId: 'caso_demo_001', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(0, 10),
    texto: 'Bom dia doutora. Foi combinado entre nós dois mesmo, na época da separação. Não teve papel nenhum, nem advogado.' },
  { id: 'msg_001_3', casoId: 'caso_demo_001', autor: 'advogado', canal: 'chat', tipo: 'texto', enviadoEm: T(0, 10),
    texto: 'Entendi. E a senhora sabe me dizer onde ele trabalha e quanto ganha, mais ou menos?' },
  { id: 'msg_001_4', casoId: 'caso_demo_001', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(0, 11),
    texto: 'Ele trabalha numa transportadora perto da rodoviária de Colombo, faz carga e descarga. Não sei o salário certo, mas é registrado. Mês passado ele trocou de moto, por isso eu sei que dinheiro ele tem.' },

  /* 002 — consumidor, Curitiba. */
  { id: 'msg_002_1', casoId: 'caso_demo_002', autor: 'advogado', canal: 'chat', tipo: 'texto', enviadoEm: T(1, 15),
    texto: 'Boa tarde, seu José. Sou a Helena, advogada nomeada para o seu caso. O senhor guardou o número do protocolo do cancelamento de fevereiro?' },
  { id: 'msg_002_2', casoId: 'caso_demo_002', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(1, 16),
    texto: 'Guardei sim doutora, anotei numa folha. Tenho o de fevereiro e mais uns três de quando liguei reclamando.' },
  { id: 'msg_002_3', casoId: 'caso_demo_002', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(1, 16),
    texto: 'E o que mais me pegou foi não conseguir o crediário da geladeira. Fui na loja, passei o CPF e deu recusado na frente de todo mundo.' },

  /* 003 — corte de água, Fazenda Rio Grande. Parte com dificuldade de leitura. */
  { id: 'msg_demo_001', casoId: 'caso_demo_003', autor: 'plataforma', canal: 'chat', tipo: 'texto', enviadoEm: T(2, 15),
    texto: 'Olá, Antônio. A Dra. Helena foi nomeada para o seu caso e vai falar com você por aqui. Você pode responder por texto ou mandar áudio.' },
  { id: 'msg_demo_002', casoId: 'caso_demo_003', autor: 'advogado', canal: 'chat', tipo: 'texto', enviadoEm: T(2, 16),
    texto: 'Oi, Antônio. Sou a Helena, advogada nomeada para o seu caso da água.\n\nPara eu dar entrada no pedido, preciso de fotos bem nítidas de:\n\n1. O comprovante de pagamento da conta de janeiro (o papel que sua esposa guardou).\n2. A conta de água mais recente.\n3. Seu RG e CPF.\n\nAssim que você mandar, eu preparo os papéis. Se for mais fácil, me responda por áudio.' },
  { id: 'msg_demo_003', casoId: 'caso_demo_003', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(2, 18),
    texto: 'Boa tarde doutora, minha esposa vai tirar a foto do comprovante hoje a noite e eu mando' },
  { id: 'msg_003_4', casoId: 'caso_demo_003', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(1, 9),
    texto: 'Doutora a agua continua cortada, ja e o quinto dia. A vizinha ta emprestando balde mas com as crianca pequena ta dificil' },

  /* 004 — união estável, Castro. Sem documentos ainda. */
  { id: 'msg_004_1', casoId: 'caso_demo_004', autor: 'advogado', canal: 'chat', tipo: 'texto', enviadoEm: T(5, 12),
    texto: 'Boa tarde, dona Cleusa. Sou a Helena, advogada nomeada para o seu caso. A senhora tem alguma coisa que mostre que vocês viviam como casal? Conta no nome dos dois, fotos, declaração de alguém?' },
  { id: 'msg_004_2', casoId: 'caso_demo_004', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(5, 14),
    texto: 'Tenho bastante foto dos 14 anos, de aniversário, viagem, Natal com a família dele. A conta de luz ficou sempre no nome dele, mas a de internet estava no meu. E os vizinhos todos sabem, qualquer um assina declaração.' },
  { id: 'msg_004_3', casoId: 'caso_demo_004', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(5, 14),
    texto: 'A casa a gente comprou em 2016 e eu ajudei a pagar todo mês com meu salário de cozinheira. O carro foi em 2021. Tudo no nome dele.' },

  { id: 'msg_004_4', casoId: 'caso_demo_004', autor: 'advogado', canal: 'chat', tipo: 'texto', enviadoEm: T(4, 9),
    texto: 'Obrigada, dona Cleusa. Para eu preparar a procuração preciso dos seus dados: CPF, RG e o endereço onde a senhora está morando agora.' },
  { id: 'msg_004_5', casoId: 'caso_demo_004', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(4, 10),
    texto: 'Meu CPF é 038.472.910-55 e o RG 8.432.117-0. Estou morando na Rua Sete de Setembro, 218, fundos, Vila Rio Branco, Castro, desde março.' },

  /* 005 — revisional, Ponta Grossa. Processo já em andamento. */
  { id: 'msg_005_1', casoId: 'caso_demo_005', autor: 'advogado', canal: 'chat', tipo: 'texto', enviadoEm: T(6, 10),
    texto: 'Bom dia, seu Paulo. Sou a Helena, advogada nomeada para o seu caso. O senhor tem como comprovar que perdeu o carro e está sem trabalho fixo?' },
  { id: 'msg_005_2', casoId: 'caso_demo_005', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(6, 11),
    texto: 'Tenho o boletim de ocorrência do acidente, de abril, e a carteira de trabalho sem registro desde então. Faço bico de entregador com a moto de um amigo, tiro no máximo 1.500 num mês bom.' },
  { id: 'msg_005_3', casoId: 'caso_demo_005', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(5, 20),
    texto: 'Doutora, a mãe do meu filho mandou mensagem falando que vai pedir minha prisão. Eu não quero deixar de pagar, só não consigo os 900 agora. Consigo uns 400, 450.' },

  /* 006 — vício de produto, Terra Boa. */
  { id: 'msg_006_1', casoId: 'caso_demo_006', autor: 'advogado', canal: 'chat', tipo: 'texto', enviadoEm: T(9, 16),
    texto: 'Boa tarde, Jéssica. Sou a Helena, advogada nomeada para o seu caso. Você tem a nota fiscal e a ordem de serviço da assistência?' },
  { id: 'msg_006_2', casoId: 'caso_demo_006', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(9, 17),
    texto: 'Tenho os dois, doutora. A nota é de 12 de maio, 1.890 reais em 10 vezes. A ordem de serviço da assistência é de 3 de junho e eles devolveram a máquina dia 18 de julho, ainda vazando.' },
  { id: 'msg_006_3', casoId: 'caso_demo_006', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(9, 17),
    texto: 'Já paguei 5 parcelas de uma máquina que não lava. Fui na loja de novo semana passada e disseram que não é com eles, é com a fábrica.' },
  { id: 'msg_006_4', casoId: 'caso_demo_006', autor: 'assistido', canal: 'chat', tipo: 'texto', enviadoEm: T(8, 11),
    texto: 'Doutora, meu CPF é 11744820966. Moro na Avenida Brasil, 1042, apartamento 3, centro de Terra Boa. O RG eu não sei de cabeça, mando a foto depois.' },
];
