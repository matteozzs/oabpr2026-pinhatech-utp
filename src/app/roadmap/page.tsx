import { CheckCircle2, CircleDashed, CircleDotDashed, Rocket } from 'lucide-react';

/**
 * O que a plataforma faz hoje, o que está em revisão e o que vem depois.
 *
 * Esta página é uma declaração, e por isso só entra aqui o que está de fato na tela.
 * Funcionalidade removida sai da lista no mesmo dia: um roadmap que promete o que a
 * demonstração não faz custa mais caro do que um roadmap curto.
 */

const FEITO = [
  'Portal de acesso duplo (cidadão / advogado dativo), sem cadastro e sem senha',
  'O caso chega com o advogado já nomeado — a plataforma não distribui nomeação nem credencia ninguém',
  'Chat dedicado com a parte pelo número oficial da plataforma, com o número pessoal do advogado preservado, caixa de entrada e cartões de CRAS e de assinatura',
  'Anexo enviado pela parte fica no navegador de quem testa: sem servidor, sem URL pública',
  'Triagem do que chega: o advogado vê o anexo avulso e classifica como documento do caso, ou desfaz o vínculo',
  'Aviso de guarda de dados pessoais antes de baixar arquivo da parte, com prazo sugerido e registro no histórico',
  'Resumo fático gerado de dentro da conversa, só com fato, sem citar lei',
  'CPF, RG e endereço ditos pela parte no chat destacados no resumo, com o trecho de origem, e aproveitáveis na ficha com um clique',
  'Lista de documentos do caso com ação real por item: gerar o .docx aqui ou pedir na conversa',
  'Procuração, declaração de hipossuficiência e consentimento LGPD em .docx a partir dos templates da equipe',
  'Minuta da petição inicial com citação por id validada no servidor, editável campo a campo, com a conferência bloqueada enquanto restar lacuna',
  'Pacote de protocolo e histórico do atendimento com o autor de cada evento, inclusive as ações da IA',
  'Visão do cidadão separada da triagem do advogado: sem marca de urgência, sem selo de analisado, andamento em linguagem simples',
  'Assinatura eletrônica com hash (simulação), gov.br (ilustrativo) e impressão + foto',
  'Painel de instrução à parte com a rede CRAS da RMC',
  'Corpus jurídico aberto e prompts auditáveis em Markdown',
  'Massa de testes automática sobre os próprios atendimentos de demonstração, sem cenários paralelos',
];

const EM_REVISAO = [
  {
    t: 'Geração automática do checklist pela IA',
    d: 'O botão está desativado enquanto a equipe revisa o resultado. A lista de documentos do caso e a ação por item continuam funcionando.',
  },
];

const ROADMAP = [
  {
    t: 'Entrada por voz na conversa',
    d: 'O ditado por Web Speech API existia na tela de registro de nomeação, que saiu quando a plataforma deixou de abrir casos. O lugar natural dele agora é a caixa de mensagem do chat, onde a parte fala.',
  },
  {
    t: 'Armazenamento de arquivo',
    d: 'Hoje o anexo vive no navegador de quem testa, com teto por arquivo: imagem é reduzida e arquivo grande vai só com o nome. Em produção precisa de armazenamento externo com controle de acesso, para o arquivo não ficar aberto a quem tiver o link.',
  },
  {
    t: 'WhatsApp oficial (API Cloud da Meta)',
    d: 'Espelhar o chat no WhatsApp do assistido pelo número oficial da plataforma, com recebimento de fotos de documentos e áudios transcritos.',
  },
  {
    t: 'Transcrição de vídeo e áudio no servidor',
    d: 'Relatos em vídeo ou áudio enviados pelo WhatsApp transcritos por modelo multimodal.',
  },
  {
    t: 'Assinatura gov.br e ICP-Brasil',
    d: 'Assinatura qualificada da procuração e das declarações via gov.br (prata/ouro) e certificado A1/A3.',
  },
  {
    t: 'Integração com o sistema de dativos da OAB/PR',
    d: 'Receber a nomeação direto do sistema oficial, em vez de o caso chegar por fora. O credenciamento segue acontecendo lá, não aqui.',
  },
  {
    t: 'Disparo de e-mail pelo servidor',
    d: 'Hoje o atalho abre o cliente de e-mail do próprio advogado, já endereçado e com o assunto sugerido. Falta SMTP próprio, com registro de entrega e a resposta da parte voltando para a conversa.',
  },
  {
    t: 'Mapa estadual completo',
    d: 'CRAS, CREAS, Defensoria e Fórum dos 399 municípios com endereço verificado (CadSUAS).',
  },
  {
    t: 'Novas áreas',
    d: 'Criminal (maior volume de nomeações), Infância e Juventude, Execução Penal — bastando ampliar o corpus e os prompts.',
  },
  {
    t: 'Persistência compartilhada',
    d: 'Hoje cada navegador tem o seu próprio ambiente, e nada é compartilhado. Falta um banco para o advogado e a parte verem o mesmo caso de dispositivos diferentes.',
  },
  {
    t: 'Verificação jurídica do corpus',
    d: 'Conferência de cada dispositivo contra a fonte oficial pelas pessoas do Direito, com marcação verificado: true.',
  },
];

export default function RoadmapPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950 inline-flex items-center gap-2">
          <Rocket className="w-7 h-7 text-navy-700" /> Roadmap
        </h1>
        <p className="text-ink-700 mt-1">
          O que está funcionando nesta versão e o que vem depois. Tudo aberto, sob licença MIT, para qualquer seccional adotar.
        </p>
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-ink-900 mb-3">Nesta versão</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {FEITO.map((f) => (
            <li key={f} className="flex gap-2 text-ink-700">
              <CheckCircle2 className="w-4 h-4 text-ok-600 shrink-0 mt-0.5" /> {f}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-ink-900 mb-1">Em revisão</h2>
        <p className="text-sm text-ink-700 mb-3">Está no código, mas desligado na tela enquanto a equipe confere.</p>
        <ul className="space-y-3">
          {EM_REVISAO.map((r) => (
            <li key={r.t} className="flex gap-3">
              <CircleDotDashed className="w-5 h-5 text-warn-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink-900">{r.t}</p>
                <p className="text-sm text-ink-700">{r.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-ink-900 mb-3">Próximos passos</h2>
        <ol className="space-y-3">
          {ROADMAP.map((r) => (
            <li key={r.t} className="flex gap-3">
              <CircleDashed className="w-5 h-5 text-navy-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink-900">{r.t}</p>
                <p className="text-sm text-ink-700">{r.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
