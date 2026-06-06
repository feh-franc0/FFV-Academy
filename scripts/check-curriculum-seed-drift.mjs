#!/usr/bin/env node
/**
 * Drift check entre frontend/src/lib/curriculum.ts e scripts/seeds/articles/.
 *
 * Falha o CI se:
 *   - Um slug declarado em curriculum.ts NÃO tem JSON correspondente em
 *     scripts/seeds/articles/<slug>.json. Resultado: usuário acessa
 *     /aprenda/<slug> e pega 404 porque o importer não tem o que persistir.
 *
 * Não falha:
 *   - JSON órfão (seed sem entrada no curriculum.ts) — apenas WARN. Pode
 *     acontecer durante refatorações; conteúdo extra no banco não quebra
 *     nada (frontend só renderiza o que tá no curriculum.ts).
 *
 * Uso: `node scripts/check-curriculum-seed-drift.mjs`
 * No CI: roda como step antes do build, exit 1 = bloqueia merge.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CURRICULUM_PATH = join(ROOT, 'frontend', 'src', 'lib', 'curriculum.ts');
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

// 1. Extrai slugs do curriculum.ts
if (!existsSync(CURRICULUM_PATH)) {
  fail(`curriculum.ts não encontrado em ${CURRICULUM_PATH}`);
}

const curriculumSrc = readFileSync(CURRICULUM_PATH, 'utf8');
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

// Allowlist conhecida: slugs intencionais sem conteúdo ainda (trilhas em
// construção). Frontend mostra fallback decente; backend retorna 404 mas o
// usuário sabe que tá vindo. Adicionar slug aqui = decisão consciente.
//
// REGRA: cada entrada aqui é DÉBIT TÉCNICO — precisa ser zerada quando o
// conteúdo dessas trilhas for produzido. Não deixe crescer.
const KNOWN_MISSING_ALLOWLIST = new Set([
  // Hubs landing (não são módulos — slug usado em href de hub na home)
  'aws', 'claude-anthropic', 'construcao', 'dados', 'engenharia',
  'fundamentos', 'ia', 'programacao',
  // Hubs do Profissional Digital (split do antigo hub-profissional-digital)
  'carreira', 'comunicacao', 'marketing', 'conteudo',
  'empreendedorismo', 'ingles',
  // Hubs das bases novas (jun/2026)
  'cinematografia', 'vendas', 'psicologia-do-consumo',
  // Trilha AWS AI Practitioner (módulos planejados, conteúdo pendente)
  'aif-intro', 'aif-ai-ml-fundamentos', 'aif-genai-conceitos',
  'aif-prompt-engineering', 'aif-sagemaker-overview', 'aif-fine-tuning-eval',
  'aif-mlops-monitoramento', 'aif-security-governance', 'aif-responsible-ai',
  'aif-simulado-final',
  // Trilha Anthropic AI Practitioner (módulos planejados, conteúdo pendente)
  'anthropic-ai-intro', 'anthropic-ai-claude-family', 'anthropic-ai-messages-api',
  'anthropic-ai-prompt-engineering', 'anthropic-ai-context-engineering',
  'anthropic-ai-prompt-caching', 'anthropic-ai-tool-use', 'anthropic-ai-extended-thinking',
  'anthropic-ai-mcp', 'anthropic-ai-claude-code', 'anthropic-ai-agent-sdk',
  'anthropic-ai-evals', 'anthropic-ai-safety-deploy', 'anthropic-ai-simulado-final',
  // Trilha AIF Bedrock (módulos novos, conteúdo pendente)
  'aif-bedrock-agents', 'aif-bedrock-knowledge-bases', 'aif-bedrock-overview',
  // Misc — slugs declarados sem JSON ainda
  'seguranca-hardware-hacking',
]);

// Allowlist por PREFIXO — pras bases novas (jun/2026) onde o conteúdo de
// todos os módulos vai ser gerado pelo pipeline FFV (user-generated learning),
// e não escrito à mão. Listar 250+ slugs individualmente seria ruído.
//
// Cada entrada AQUI representa uma trilha completa marcada como "conteúdo
// pendente do pipeline". Quando o pipeline gerar o JSON do slug, ele sai
// da exceção automaticamente.
//
// REGRA: só adicione prefixo se for uma trilha NOVA inteira aguardando o
// pipeline. Pra slugs individuais soltos, use KNOWN_MISSING_ALLOWLIST.
const KNOWN_MISSING_PREFIX_ALLOWLIST = [
  // Base Cinema (10 trilhas, jun/2026)
  'cinema-linguagem-', 'cinema-roteiro-', 'cinema-storytelling-',
  'cinema-camera-', 'cinema-dp-', 'cinema-direcao-',
  'cinema-edicao-', 'cinema-som-', 'cinema-producao-', 'cinema-vlog-',
  // Base Vendas (3 trilhas, jun/2026)
  'vendas-consultivas-', 'vendas-fechamento-', 'vendas-cerebro-',
  // Base Psicologia do Consumo (6 trilhas, jun/2026)
  'psicologia-cialdini-', 'psicologia-neuro-',
  'cerebro-', 'poder-', 'influencia-', 'riqueza-',
  // Marketing — trilhas novas (jun/2026)
  'marketing-posicionamento-', 'marketing-growth-', 'marketing-neuro-',
  // Inglês — trilhas de fluxo conversacional (jun/2026)
  'ingles-fluxo-', 'ingles-social-', 'ingles-emerg-',
];

function isAllowedMissing(slug) {
  if (KNOWN_MISSING_ALLOWLIST.has(slug)) return true;
  return KNOWN_MISSING_PREFIX_ALLOWLIST.some(prefix => slug.startsWith(prefix));
}

const STRICT = process.argv.includes('--strict');

if (missingSeeds.length > 0) {
  // Separa em "esperado faltar" (allowlist) vs "regressão real" (novo gap).
  const unexpected = missingSeeds.filter(s => !isAllowedMissing(s));
  const expected   = missingSeeds.filter(s =>  isAllowedMissing(s));

  if (expected.length > 0) {
    warn(`${expected.length} slugs faltam (mas estão na allowlist — débito conhecido):`);
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
    console.error('Fix (2): se for slug temporário, adicionar a KNOWN_MISSING_ALLOWLIST neste script');
    process.exit(1);
  }

  // Modo strict (CI futuro quando débito for zerado): falha mesmo allowlist.
  if (STRICT) {
    console.error('');
    console.error(`\x1b[31mMODO STRICT: ${expected.length} slug(s) na allowlist ainda existem.\x1b[0m`);
    console.error('Remova-os do curriculum.ts ou produza conteúdo.');
    process.exit(1);
  }
} else {
  ok('todos os slugs do curriculum têm seed JSON');
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

console.log('');
ok('curriculum.ts ↔ scripts/seeds/articles/ em sincronia');
