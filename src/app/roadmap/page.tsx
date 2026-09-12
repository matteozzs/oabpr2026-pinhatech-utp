import { CheckCircle2, CircleDashed, Rocket } from 'lucide-react';

const FEITO = [
  'Portal de acesso duplo (cidadão / advogado dativo) sem barreira de login',
  'Relato por texto ou voz (Web Speech API, no navegador)',
  'Cadastro do atendimento pelo advogado já nomeado (a nomeação e o aceite acontecem na OAB/Fórum)',
  'Resumo fático gerado de dentro da conversa, a partir do que foi apurado com a parte',
  'Checklist documental com ação real por item: gerar o .docx aqui ou pedir na conversa',
  'Minuta editável, com conferência bloqueada enquanto restar lacuna no texto',
  'Procuração, declaração de hipossuficiência e consentimento LGPD em .docx a partir dos templates',
  'Minuta da petição inicial com citação por id e validação no servidor',
  'Chat dedicado com a parte, pelo número oficial da plataforma (número do advogado preservado), com caixa de entrada, orientação do CRAS e pedido de assinatura como cartões',
  'Seção de Contato no painel do caso: chat interno, e-mail com redação por IA e WhatsApp declarado',
  'Painel de instrução à parte com rede CRAS da RMC',
  'Assinatura eletrônica com hash (simulação), gov.br (ilustrativo) e impressão + foto',
  'Corpus jurídico aberto e prompts auditáveis',
];

const ROADMAP = [
  { t: 'WhatsApp oficial (API Cloud da Meta)', d: 'Espelhar o chat no WhatsApp do assistido pelo número oficial da plataforma, com recebimento de fotos de documentos e áudios transcritos.' },
  { t: 'Transcrição de vídeo e áudio no servidor', d: 'Relatos em vídeo/áudio enviados pelo WhatsApp transcritos por modelo multimodal.' },
  { t: 'Assinatura gov.br e ICP-Brasil', d: 'Assinatura qualificada da procuração e declarações via gov.br (prata/ouro) e certificado A1/A3.' },
  { t: 'Integração com o sistema de dativos da OAB/PR', d: 'Receber a nomeação direto do sistema oficial, sem o advogado precisar registrá-la à mão. O credenciamento segue acontecendo lá, não aqui.' },
  { t: 'Disparo de e-mail pelo servidor', d: 'Hoje a composição é feita na plataforma e o envio abre o cliente de e-mail do advogado. Falta o SMTP próprio, com registro de entrega e resposta da parte voltando para a conversa.' },
  { t: 'Mapa estadual completo', d: 'CRAS, CREAS, Defensoria e Fórum dos 399 municípios com endereço verificado (CadSUAS).' },
  { t: 'Novas áreas', d: 'Criminal (maior volume de nomeações), Infância e Juventude, Execução Penal — bastando ampliar o corpus e os prompts.' },
  { t: 'Persistência compartilhada', d: 'Supabase/Postgres para o caso criado no celular do cidadão aparecer no painel do advogado em outro dispositivo.' },
  { t: 'Verificação jurídica do corpus', d: 'Conferência de cada dispositivo contra a fonte oficial pelas pessoas do Direito, com marcação verificado: true.' },
];

export default function RoadmapPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950 inline-flex items-center gap-2">
          <Rocket className="w-7 h-7 text-navy-700" /> Roadmap
        </h1>
        <p className="text-ink-700 mt-1">O que está funcionando nesta versão e o que vem depois. Tudo aberto, sob licença MIT, para qualquer seccional adotar.</p>
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
