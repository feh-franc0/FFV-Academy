#!/usr/bin/env node
/**
 * Drift check entre frontend/src/lib/curriculum/ e scripts/seeds/.
 *
 * Falha o CI se:
 *   - Um slug declarado nas trilhas NÃO tem JSON correspondente em
 *     scripts/seeds/articles/<slug>.json. Resultado: usuário acessa
 *     /aprenda/<slug> e pega 404 porque o importer não tem o que persistir.
 *   - Um slug com seed NÃO está em scripts/seeds/article-mappings.json. O
 *     importer roda em duas fases: a fase 1 insere TODO artigo com
 *     trail_id='legacy-auto' / hub_id='legacy' / xp=10 / read_time=5, e a fase 2
 *     corrige isso a partir do article-mappings.json. Slug ausente do mapping =
 *     artigo publicado órfão, no hub "Legacy (auto-import)", fora da trilha.
 *     Falha silenciosa: nada quebra, o conteúdo só não aparece onde deveria.
 *
 * Não falha:
 *   - JSON órfão (seed sem entrada nas trilhas) — apenas WARN. Pode
 *     acontecer durante refatorações; conteúdo extra no banco não quebra
 *     nada (frontend só renderiza o que está nas trilhas).
 *
 * Uso: `node scripts/check-curriculum-seed-drift.mjs`
 * No CI: roda como step antes do build, exit 1 = bloqueia merge.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// O currículo virou `curriculum/trails/<trailId>.ts` em ago/2026 — um arquivo
// por trilha. Concatenar na ordem dos imports reproduz o texto que este script
// lia antes, inclusive a ORDEM (que a checagem de promessas usa para delimitar
// cada entrada pela posição da seguinte).
const DIR_TRILHAS = join(ROOT, 'frontend', 'src', 'lib', 'curriculum', 'trails');
const SEEDS_DIR = join(ROOT, 'scripts', 'seeds', 'articles');

function fail(msg) {
  console.error('\x1b[31m✗\x1b[0m', msg);
  process.exit(1);
}

function warn(msg) {
  console.warn('\x1b[33m⚠\x1b[0m', msg);
}

function ok(msg) {
  console.log('\x1b[32m✓\x1b[0m', msg);
}

// 1. Extrai slugs das trilhas
if (!existsSync(DIR_TRILHAS)) {
  fail(`diretório de trilhas não encontrado em ${DIR_TRILHAS}`);
}

const ordemTrilhas = [
  ...readFileSync(join(DIR_TRILHAS, 'index.ts'), 'utf8')
    .matchAll(/from '\.\/(trail[a-z0-9-]*)'/g),
].map(m => m[1]);
const curriculumSrc = ordemTrilhas
  .map(t => readFileSync(join(DIR_TRILHAS, `${t}.ts`), 'utf8'))
  .join('\n');
const slugMatches = curriculumSrc.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g);
const declaredSlugs = new Set();
for (const m of slugMatches) {
  declaredSlugs.add(m[1]);
}

if (declaredSlugs.size === 0) {
  fail('nenhum slug encontrado em curriculum.ts — regex quebrou?');
}

ok(`${declaredSlugs.size} slugs declarados em curriculum.ts`);

// 2. Lista JSONs em scripts/seeds/articles/
if (!existsSync(SEEDS_DIR)) {
  fail(`diretório de seeds não encontrado em ${SEEDS_DIR}`);
}

const seedFiles = readdirSync(SEEDS_DIR)
  .filter(f => f.endsWith('.json') && !f.startsWith('_'))
  .map(f => f.replace(/\.json$/, ''));
const seedSlugs = new Set(seedFiles);

ok(`${seedSlugs.size} JSONs em scripts/seeds/articles/`);

// 3. Diff
const missingSeeds = [...declaredSlugs].filter(s => !seedSlugs.has(s)).sort();
const orphanSeeds = [...seedSlugs].filter(s => !declaredSlugs.has(s)).sort();

// ─── Duas listas, porque são dois fenômenos diferentes ───
//
// A allowlist antes era uma só, misturando "nunca vai ter seed, por desenho" com
// "vai ter seed quando alguém escrever". O efeito prático: `--strict` acusava as
// duas coisas juntas, nunca poderia ficar verde, e por isso nunca entrou no CI —
// virou uma flag que ninguém liga. Separadas, `--strict` passa a significar
// exatamente "o débito de conteúdo está zerado" e pode ser ligado no dia em que
// estiver.

// 1. Slugs ESTRUTURAIS: são landing de hub, referenciadas em href de hub na home.
//    Não são módulos e nunca terão JSON. Ausência aqui é correto, não débito.
const HUB_LANDINGS = new Set([
  'aws', 'claude-anthropic', 'dados', 'engenharia',
  'fundamentos', 'ia', 'programacao',
]);

// 2. Débito de CONTEÚDO: módulo declarado no currículo cujo JSON não existe.
//    Cada um destes é um /aprenda/<slug> que devolve 404 em produção.
//    Rastreados como A-1 e A-2 em PLANO_MESTRE_PENDENCIAS_2026-08.md.
//
//    REGRA: esta lista só encolhe. Entrada nova aqui exige justificativa no PR.
// ZERADA em ago/2026: A-1 (AIF-C01, 8 módulos) e A-2 (Anthropic Claude AI
// Practitioner, 14 módulos) foram produzidas, e com isso todo slug declarado no
// currículo tem conteúdo — nenhuma rota /aprenda responde 404.
//
// Por isso `--strict` entrou no CI. A partir daqui, declarar módulo sem escrever
// o conteúdo quebra o build, que é o comportamento desejado: slug no currículo é
// promessa de página, e promessa quebrada era invisível até este ponto.
const CONTEUDO_PENDENTE = new Set([]);

const STRICT = process.argv.includes('--strict');

// Higiene da própria lista: entrada que já tem seed, ou que nem é declarada no
// currículo, é ruído que faz a lista parecer maior que o problema. Foram 8 assim
// (3 mortas do pivot, 5 já produzidas) até ago/2026.
const pendenteResolvida = [...CONTEUDO_PENDENTE].filter(s => seedSlugs.has(s));
const pendenteFantasma  = [...CONTEUDO_PENDENTE].filter(s => !declaredSlugs.has(s));
if (pendenteResolvida.length > 0 || pendenteFantasma.length > 0) {
  console.error('');
  console.error('\x1b[31mCONTEUDO_PENDENTE está desatualizada neste script:\x1b[0m');
  for (const s of pendenteResolvida) console.error(`  - ${s}: já tem seed — remova da lista`);
  for (const s of pendenteFantasma) console.error(`  - ${s}: não está no curriculum.ts — remova da lista`);
  process.exit(1);
}

if (missingSeeds.length > 0) {
  // Separa em "esperado faltar" (allowlist) vs "regressão real" (novo gap).
  const unexpected = missingSeeds.filter(s => !HUB_LANDINGS.has(s) && !CONTEUDO_PENDENTE.has(s));
  const expected   = missingSeeds.filter(s =>  CONTEUDO_PENDENTE.has(s));

  if (expected.length > 0) {
    warn(`${expected.length} módulos declarados sem conteúdo (débito A-1/A-2 — cada um é um 404):`);
    for (const s of expected.slice(0, 5)) warn(`  - ${s}`);
    if (expected.length > 5) warn(`  ... e mais ${expected.length - 5}`);
  }

  if (unexpected.length > 0) {
    console.error('');
    console.error(`\x1b[31m${unexpected.length} slug(s) NOVO(s) declarado(s) em curriculum.ts SEM seed JSON:\x1b[0m`);
    for (const s of unexpected) {
      console.error(`  - ${s}`);
    }
    console.error('');
    console.error('Consequência em prod: /aprenda/<slug> → 404');
    console.error('Fix (1): gerar o JSON em scripts/seeds/articles/<slug>.json');
    console.error('Fix (2): se for landing de hub, adicionar a HUB_LANDINGS neste script');
    console.error('Fix (3): se é módulo planejado, adicionar a CONTEUDO_PENDENTE e ao PLANO_MESTRE');
    process.exit(1);
  }

  // `--strict` agora depende SÓ do débito de conteúdo — landing de hub não conta.
  // Quando A-1 e A-2 fecharem, esta flag fica verde e entra no CI.
  if (STRICT && expected.length > 0) {
    console.error('');
    console.error(`\x1b[31mMODO STRICT: ${expected.length} módulo(s) sem conteúdo.\x1b[0m`);
    console.error('Produza o conteúdo ou remova o slug do curriculum.ts.');
    process.exit(1);
  }
  if (expected.length === 0) {
    ok('nenhum módulo declarado sem conteúdo (só landings de hub)');
  }
} else {
  ok('todos os slugs do curriculum têm seed JSON');
}

// 4. article-mappings.json — o mapa slug → trail_id/hub/xp/order que a fase 2
// do importer usa. Slug com conteúdo mas sem mapping vira artigo órfão em prod.
const MAPPINGS_PATH = join(ROOT, 'scripts', 'seeds', 'article-mappings.json');

if (!existsSync(MAPPINGS_PATH)) {
  fail(`article-mappings.json não encontrado em ${MAPPINGS_PATH}`);
}

let mappings;
try {
  mappings = JSON.parse(readFileSync(MAPPINGS_PATH, 'utf8'));
} catch (err) {
  fail(`article-mappings.json inválido: ${err.message}`);
}

if (!Array.isArray(mappings) || mappings.length === 0) {
  fail('article-mappings.json vazio ou não é um array');
}

const mappedSlugs = new Set(mappings.map(m => m.slug));
const semMapping = [...seedSlugs].filter(s => !mappedSlugs.has(s)).sort();

if (semMapping.length > 0) {
  console.error('');
  console.error(`\x1b[31m${semMapping.length} slug(s) com seed JSON mas SEM entrada em article-mappings.json:\x1b[0m`);
  for (const s of semMapping.slice(0, 20)) console.error(`  - ${s}`);
  if (semMapping.length > 20) console.error(`  ... e mais ${semMapping.length - 20}`);
  console.error('');
  console.error("Consequência em prod: artigo importado com trail_id='legacy-auto', hub_id='legacy',");
  console.error('xp=10, read_time=5 — fora da trilha real. Não dá erro, só desaparece do lugar certo.');
  console.error('Fix: cd frontend && npx tsx ../scripts/import-blocks/src/extract-curriculum.ts');
  process.exit(1);
}

ok(`${mappedSlugs.size} slugs em article-mappings.json — todo seed tem mapping`);

const mappingSemTrilha = mappings.filter(m => !m.trail_id).map(m => m.slug);
if (mappingSemTrilha.length > 0) {
  fail(`${mappingSemTrilha.length} entrada(s) em article-mappings.json sem trail_id: ${mappingSemTrilha.slice(0, 5).join(', ')}`);
}

if (orphanSeeds.length > 0) {
  warn(`${orphanSeeds.length} JSONs em seeds/ NÃO referenciados em curriculum.ts (não-bloqueador):`);
  for (const s of orphanSeeds.slice(0, 10)) {
    warn(`  - ${s}`);
  }
  if (orphanSeeds.length > 10) {
    warn(`  ... e mais ${orphanSeeds.length - 10}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Título e descrição não podem prometer um número que o conteúdo não entrega
// ─────────────────────────────────────────────────────────────────────────────
//
// Existe por causa de um caso real: o fechamento do DVA-C02 se chamava
// "simulado DVA-C02 comentado (15 questões)" e a descrição prometia "simulado de
// 15 questões com explicações completas". O conteúdo tinha 3, e dizia isso com
// todas as letras — "estas 3 questões são amostra" — apontando para /simulados
// para o simulado real.
//
// Nada estava quebrado: o módulo era honesto por dentro. A promessa estava no
// índice, que é justamente o que a pessoa lê ANTES de decidir estudar. Título que
// promete mais do que entrega é o tipo de defeito que ninguém reporta como bug e
// que corrói confiança em silêncio — e numa trilha de certificação paga, corrói
// a confiança justamente onde ela é o produto.
//
// A checagem é estreita de propósito: só olha promessa NUMÉRICA de questões, que
// é objetivamente verificável. Promessa qualitativa ("completo", "profundo") não
// dá para conferir por script, e fingir que dá seria pior que não checar.
//
// E precisa ser estreita numa segunda dimensão. A primeira versão desta regra
// acusou `dva-c02-intro` e `sap-c03-intro` — ambos falsos positivos: eles dizem
// "65 questões, 130 min, passing 720/1000", descrevendo o FORMATO DO EXAME, não
// o próprio módulo. Contar todo número seguido de "questões" transformaria a
// regra num gerador de ruído, e gate ruidoso acaba desligado.
//
// Duas defesas, portanto: o número só conta quando a frase atribui as questões
// ao módulo ("simulado de N questões", "(N questões)", "N questões comentadas"),
// e a promessa é descartada se o texto ao redor traz marcas de descrição de
// prova (duração, nota de corte). Um gate que erra é pior que gate nenhum,
// porque ensina o time a ignorar o vermelho.

// Delimitar cada entrada pelo PRÓXIMO `slug:`, e não por um lookahead com janela
// fixa. A primeira versão usava `[\s\S]{0,900}?(?=slug:)`, que exige outra
// entrada logo adiante — e por isso pulava em silêncio o ÚLTIMO módulo de cada
// trilha, que é justamente onde ficam os fechamentos e capstones: a classe de
// módulo que motivou esta regra. O gate passava verde sobre o único caso que
// existia para pegar. Descoberto por prova negativa: restaurei o título antigo,
// esperei vermelho e recebi verde.
const posicoes = [...curriculumSrc.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g)];

const mentiras = [];
for (let i = 0; i < posicoes.length; i++) {
  const slug = posicoes[i][1];
  if (!seedSlugs.has(slug)) continue;
  const ini = posicoes[i].index;
  const fim = i + 1 < posicoes.length ? posicoes[i + 1].index : curriculumSrc.length;
  const bloco = curriculumSrc.slice(ini, fim);

  const texto = (bloco.match(/title:\s*'([^']*)'/)?.[1] ?? '') + ' ' +
                (bloco.match(/desc:\s*'([^']*)'/)?.[1] ?? '');
  // Só conta quando a frase ATRIBUI as questões ao módulo.
  const promete = texto.match(
    /(?:simulado de|contendo|traz|com)\s+(\d+)\s*(?:quest[õo]es|quizzes)|\((\d+)\s*(?:quest[õo]es|quizzes)\)|(\d+)\s*(?:quest[õo]es|quizzes)\s+comentad/i,
  );
  if (!promete) continue;

  // Descrição de prova, não do módulo: "65 questões, 130 min, passing 720".
  if (/\b\d+\s*min|passing|nota de corte|aprova[çc][ãa]o\s*\d/i.test(texto)) continue;

  const doc = JSON.parse(readFileSync(join(SEEDS_DIR, `${slug}.json`), 'utf8'));
  let quizzes = 0;
  const andar = bs => {
    for (const b of bs) {
      if (b.type === 'quiz') quizzes++;
      andar(b.children ?? []);
    }
  };
  andar(doc.blocks);

  const n = Number(promete[1] ?? promete[2] ?? promete[3]);
  if (quizzes < n) {
    mentiras.push(`${slug}: promete ${n} questões, o seed tem ${quizzes}`);
  }
}

if (mentiras.length > 0) {
  console.error('');
  console.error(`\x1b[31m${mentiras.length} módulo(s) prometendo mais questões do que entregam:\x1b[0m`);
  for (const m of mentiras) console.error(`  - ${m}`);
  console.error('');
  console.error('Fix: ou escreva as questões, ou ajuste o título e a descrição para o');
  console.error('que o módulo realmente entrega. A segunda opção é legítima — o que');
  console.error('não é legítimo é o índice prometer o que o conteúdo não cumpre.');
  process.exit(1);
}

ok('nenhum título ou descrição promete mais questões do que o seed entrega');

console.log('');
ok('curriculum/trails/ ↔ scripts/seeds/articles/ em sincronia');
