/**
 * CLI: parseia 1 módulo ou TODOS os 915 de uma vez.
 *
 * Uso:
 *   npx tsx src/cli.ts <slug>        # 1 módulo
 *   npx tsx src/cli.ts --all         # todos os 915
 *   npx tsx src/cli.ts --all --json  # output silencioso
 *
 * Saída:
 *   scripts/seeds/articles/<slug>.json
 *   scripts/seeds/_parse_report.json (sumário)
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseModuleFile } from './parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../..');
const APRENDA_DIR = join(REPO_ROOT, 'frontend/src/app/aprenda');
const SEEDS_DIR = join(REPO_ROOT, 'scripts/seeds/articles');
const REPORT_FILE = join(REPO_ROOT, 'scripts/seeds/_parse_report.json');

interface Report {
  total: number;
  parsed: number;
  empty: number;
  errors: number;
  warnings_total: number;
  failures: Array<{ slug: string; error: string }>;
  empty_modules: string[];
  warning_summary: Record<string, number>;
}

function listSlugs(): string[] {
  const entries = readdirSync(APRENDA_DIR);
  const slugs: string[] = [];
  for (const entry of entries) {
    const fullPath = join(APRENDA_DIR, entry);
    if (statSync(fullPath).isDirectory()) {
      const pageFile = join(fullPath, 'page.tsx');
      if (existsSync(pageFile)) {
        slugs.push(entry);
      }
    }
  }
  return slugs.sort();
}

function processSlug(slug: string, report: Report): void {
  const file = join(APRENDA_DIR, slug, 'page.tsx');
  try {
    const source = readFileSync(file, 'utf-8');
    const result = parseModuleFile(source, slug);

    // Atualiza warning summary
    for (const w of result.warnings) {
      // Normaliza: "tipo não suportado: X" → "unsupported:X"
      const key = w.startsWith('tipo não suportado pelo parser: ')
        ? `unsupported:${w.split(': ')[1]}`
        : w.split(' ')[0];
      report.warning_summary[key] = (report.warning_summary[key] ?? 0) + 1;
    }
    report.warnings_total += result.warnings.length;

    if (result.blocks.length === 0) {
      report.empty++;
      report.empty_modules.push(slug);
      return;
    }

    if (!existsSync(SEEDS_DIR)) mkdirSync(SEEDS_DIR, { recursive: true });

    const output = {
      slug: result.slug,
      title: result.title,
      blocks: result.blocks,
    };
    writeFileSync(join(SEEDS_DIR, `${slug}.json`), JSON.stringify(output, null, 2));

    report.parsed++;
  } catch (err) {
    report.errors++;
    report.failures.push({ slug, error: (err as Error).message });
  }
}

function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const jsonOnly = args.includes('--json');
  const slugArg = args.find(a => !a.startsWith('--'));

  const report: Report = {
    total: 0,
    parsed: 0,
    empty: 0,
    errors: 0,
    warnings_total: 0,
    failures: [],
    empty_modules: [],
    warning_summary: {},
  };

  if (all) {
    const slugs = listSlugs();
    report.total = slugs.length;
    if (!jsonOnly) console.log(`Parseando ${slugs.length} módulos…`);
    for (const slug of slugs) {
      processSlug(slug, report);
    }
  } else if (slugArg) {
    report.total = 1;
    processSlug(slugArg, report);
  } else {
    console.error('Uso: tsx src/cli.ts <slug> | --all');
    process.exit(1);
  }

  // Salva relatório
  if (!existsSync(dirname(REPORT_FILE))) mkdirSync(dirname(REPORT_FILE), { recursive: true });
  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  if (jsonOnly) {
    console.log(JSON.stringify({
      total: report.total,
      parsed: report.parsed,
      empty: report.empty,
      errors: report.errors,
    }));
    return;
  }

  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  Parser TSX → JSON — sumário`);
  console.log(`═══════════════════════════════════════════════`);
  console.log(`Total módulos:            ${report.total}`);
  console.log(`Parseados com sucesso:    ${report.parsed} (${((report.parsed/report.total)*100).toFixed(1)}%)`);
  console.log(`Vazios (0 blocos):        ${report.empty}`);
  console.log(`Erros de parsing:         ${report.errors}`);
  console.log(`Warnings totais:          ${report.warnings_total}`);
  console.log(``);
  if (Object.keys(report.warning_summary).length > 0) {
    console.log(`Top warnings:`);
    const sorted = Object.entries(report.warning_summary).sort((a, b) => b[1] - a[1]).slice(0, 10);
    for (const [k, v] of sorted) {
      console.log(`  ${v.toString().padStart(5)} × ${k}`);
    }
  }
  if (report.errors > 0) {
    console.log(`\nFirst 5 errors:`);
    for (const f of report.failures.slice(0, 5)) {
      console.log(`  - ${f.slug}: ${f.error.slice(0, 100)}`);
    }
  }
  console.log(``);
  console.log(`JSONs gerados em: ${SEEDS_DIR}`);
  console.log(`Relatório em:     ${REPORT_FILE}`);
}

main();
