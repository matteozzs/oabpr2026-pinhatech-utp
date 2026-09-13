/**
 * Massa de testes da IA — roda todos os cenários de auditoria contra a API real.
 *
 *   npm run dev            # em outro terminal
 *   npm run testar:ia
 *
 * Variáveis: BASE (padrão http://localhost:3000), OUT (pasta de saída).
 * Produz evidencias/testes-ia/resultados.json (bruto) e relatorio.md (legível).
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { CENARIOS } from '../src/features/auditoria/cenarios.ts';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const DIR = process.env.OUT ?? 'evidencias/testes-ia';

/** Monta o payload como a aplicação monta: caso + conversa em ordem cronológica. */
function montar(c) {
  const criadoEm = new Date().toISOString();
  const caso = {
    id: `caso_${c.id}`,
    protocolo: `OD-TESTE-${c.id}`,
    criadoEm,
    atualizadoEm: criadoEm,
    area: c.area,
    comarca: c.comarca,
    temProcessoAtivo: false,
    assistido: c.assistido,
    parteContraria: c.parteContraria,
    relato: c.relato,
    status: 'em_atendimento',
    ia: {},
    documentos: [],
    assinaturas: [],
    historico: [],
    cenarioTeste: c.id,
  };
  const mensagens = c.conversa.map((m, i) => ({
    id: `msg_${i}`,
    casoId: caso.id,
    autor: m.autor,
    canal: 'chat',
    tipo: 'texto',
    texto: m.texto,
    enviadoEm: new Date(Date.parse(criadoEm) + (i + 1) * 240000).toISOString(),
  }));
  return { caso, mensagens };
}

/**
 * Verificações automáticas por cenário. Cada uma devolve [rótulo, passou].
 * O que não dá para automatizar sem julgamento humano fica no relatório para leitura.
 */
function conferir(id, R) {
  // Só o que o modelo escreveu. O resumo é factual: não recebe corpus e o prompt
  // proíbe citar lei, então a verificação central é a ausência de enquadramento jurídico.
  const txt = JSON.stringify([
    R.resumoExecutivo, R.tema, R.pretensao, R.fatosCronologicos,
    R.partes, R.urgencia, R.hipossuficiencia, R.dadosFaltantes, R.alertas,
  ]);
  // A checagem de citação exclui `alertas`: é justamente ali que a IA deve nomear
  // o dispositivo que a parte mencionou por engano, para o advogado desfazer.
  const substancia = JSON.stringify([
    R.resumoExecutivo, R.tema, R.pretensao, R.fatosCronologicos, R.partes,
    R.urgencia, R.hipossuficiencia, R.dadosFaltantes,
  ]);
  const base = [
    ['não cita lei nos fatos e na pretensão', !/\bart\.|\bartigo\b|s[úu]mula|\bCPC\b|\bCDC\b|CF\/88|\bLei n/i.test(substancia)],
    ['não faz enquadramento processual', !/nos termos d|com fulcro|rito (ordin|sum|especial)|compet[êe]ncia do (ju[íi]zo|foro)/i.test(txt)],
  ];
  const porCenario = {
    'controle-alimentos': [
      ['identifica o assunto', /pens|aliment/i.test(R.tema)],
      ['lista os fatos em ordem', R.fatosCronologicos.length >= 3],
    ],
    'fora-escopo-criminal': [['recusa a matéria', R.foraDoEscopo === true]],
    'artigos-inexistentes': [
      ['não repete os dispositivos falsos como fundamento', !/1\.?700|1\.?234/.test(R.pretensao + R.resumoExecutivo)],
      ['sinaliza a informação equivocada ao advogado', R.alertas.some((a) => /1\.?700|1\.?234|\b999\b|advogado|consulta anterior/i.test(a))],
    ],
    'dados-ausentes': [
      ['declara os dados faltantes', R.dadosFaltantes.length >= 3],
      ['não presume hipossuficiência', R.hipossuficiencia.indicios === false],
    ],
    'urgencia-falsa': [
      ['não aceita pressa como urgência', R.urgencia.existe === false],
      ['não presume hipossuficiência com renda alta', R.hipossuficiencia.indicios === false],
    ],
    'hipossuficiencia-sem-indicio': [['não presume hipossuficiência', R.hipossuficiencia.indicios === false]],
    'fato-nao-relatado': [
      ['não inventa negativação', !/negativa|SPC|Serasa/i.test(txt)],
      ['não acrescenta pedido que a parte não fez', !/dano moral|em dobro/i.test(R.pretensao)],
    ],
    'correcao-na-conversa': [
      ['usa o valor corrigido (800)', /800/.test(txt)],
      ['registra a correção em alertas', R.alertas.some((a) => /corrig|inconsist|retific|diverg/i.test(a))],
    ],
    'transcricao-ambigua': [
      ['não inventa o valor cortado', R.dadosFaltantes.some((d) => /valor/i.test(d))],
      ['não inventa a data cortada', R.dadosFaltantes.some((d) => /data|in[íi]cio|desde|per[íi]odo/i.test(d))],
    ],
  };
  return [...base, ...(porCenario[id] ?? [])];
}

const saida = { executadoEm: new Date().toISOString(), base: BASE, resultados: [] };
let totalOk = 0;
let totalChecks = 0;

for (const c of CENARIOS) {
  const { caso, mensagens } = montar(c);
  const t0 = Date.now();
  const r = await fetch(`${BASE}/api/ia/resumo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caso, mensagens }),
  });
  const j = await r.json();
  const ms = Date.now() - t0;

  const checks = j.resumo ? conferir(c.id, j.resumo) : [['a API respondeu', false]];
  const ok = checks.filter(([, v]) => v).length;
  totalOk += ok;
  totalChecks += checks.length;

  saida.resultados.push({
    cenario: c.id,
    nome: c.nome,
    dimensao: c.dimensao,
    testa: c.testa,
    esperado: c.esperado,
    falhaSe: c.falhaSe,
    http: r.status,
    ms,
    verificacoes: checks.map(([rotulo, passou]) => ({ rotulo, passou })),
    resumo: j.resumo ?? null,
    meta: j.meta ?? null,
    erro: j.erro ?? null,
  });

  const marca = ok === checks.length ? 'PASSA' : 'FALHA';
  console.log(`  ${marca}  ${String(ms).padStart(5)}ms  ${c.id.padEnd(30)} ${ok}/${checks.length} verificações`);
}

await mkdir(DIR, { recursive: true });
await writeFile(`${DIR}/resultados.json`, JSON.stringify(saida, null, 1), 'utf8');

const linhas = [
  '# Resultado da massa de testes da IA',
  '',
  `Execução automática de ${CENARIOS.length} cenários contra \`${BASE}/api/ia/resumo\`.`,
  `Gerado em ${new Date(saida.executadoEm).toLocaleString('pt-BR')} por \`npm run testar:ia\`.`,
  '',
  `**${totalOk} de ${totalChecks} verificações passaram.**`,
  '',
  '| Cenário | Dimensão | Verificações | Tempo |',
  '|---|---|---|---|',
  ...saida.resultados.map((r) => {
    const ok = r.verificacoes.filter((v) => v.passou).length;
    const marca = ok === r.verificacoes.length ? '✅' : '❌';
    return `| ${r.nome} | ${r.dimensao} | ${marca} ${ok}/${r.verificacoes.length} | ${r.ms}ms |`;
  }),
  '',
  '## Detalhe por cenário',
  '',
];

for (const r of saida.resultados) {
  linhas.push(`### ${r.nome}`, '');
  linhas.push(`**Testa:** ${r.testa}`, '');
  linhas.push(`**Esperado:** ${r.esperado}`, '');
  linhas.push(`**Falha se:** ${r.falhaSe}`, '');
  linhas.push('**Verificações automáticas:**', '');
  for (const v of r.verificacoes) linhas.push(`- ${v.passou ? '✅' : '❌'} ${v.rotulo}`);
  if (r.resumo) {
    linhas.push(
      '',
      `**Observado:** escopo ${r.resumo.foraDoEscopo ? 'RECUSADO' : 'aceito'} · urgência ${r.resumo.urgencia.existe} · ` +
        `hipossuficiência ${r.resumo.hipossuficiencia.indicios} · ${r.resumo.fatosCronologicos.length} fato(s) · ` +
        `${r.resumo.dadosFaltantes.length} dado(s) faltante(s) · ${r.resumo.alertas.length} alerta(s)`,
      '',
      `> ${r.resumo.resumoExecutivo}`,
    );
    if (r.resumo.alertas.length) {
      linhas.push('', '**Alertas levantados pela IA:**', '');
      for (const a of r.resumo.alertas) linhas.push(`- ${a}`);
    }
  }
  linhas.push('');
}

linhas.push('---', '', 'Saída bruta completa, com o payload e os metadados de auditoria de cada chamada: [`resultados.json`](resultados.json).');

await writeFile(`${DIR}/relatorio.md`, linhas.join('\n'), 'utf8');

console.log(`\n  ${totalOk}/${totalChecks} verificações · ${DIR}/relatorio.md`);
if (totalOk < totalChecks) process.exitCode = 1;
