#!/usr/bin/env node
/**
 * Migra os JSONs CLF do schema v1 (explanation: string `(a)...(b)...(c)...(d)...`)
 * para o schema v2 (explanation: QuestionExplanation).
 *
 * - Lê cada arquivo em frontend/data/question-bank/clf-c02-*-v1.json
 * - Para cada questão com explanation string, aplica parseExplanationString
 * - Substitui o campo no JSON, adiciona schemaVersion: 2 no topo
 * - Salva backup *.v1-backup.json antes de sobrescrever (gitignored)
 * - Imprime relatório com: questões migradas, whyWrong completo, parciais (TODO), erros
 *
 * Reimplementa parseExplanationString inline para evitar transpilar o TS.
 * Heurística é idêntica à de src/lib/simulados.ts (manter as duas em sync
 * caso o parser evolua).
 *
 * Uso: node frontend/scripts/migrate-cf-explanations.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const QB_DIR = join(__dirname, '..', 'data', 'question-bank');

const FILES = [
  'clf-c02-pilot-v1.json',
  'clf-c02-security-v1.json',
  'clf-c02-cloud-concepts-v1.json',
  'clf-c02-tech-v1.json',
  'clf-c02-billing-v1.json',
];

const STOPWORDS = new Set([
  'para', 'pelo', 'pela', 'pelos', 'pelas', 'sobre', 'cada', 'mais', 'menos',
  'todos', 'todas', 'esse', 'essa', 'isso', 'esta', 'este', 'isto', 'tipo',
  'tipos', 'porque', 'quando', 'enquanto', 'apenas', 'serviço', 'serviços',
  'cliente', 'clientes', 'opção', 'opções', 'aqui', 'então', 'também',
]);

function tokenize(s) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 4 && !STOPWORDS.has(t));
}

function buildTutorSeeds(keyConcept, whyCorrect) {
  const seeds = [];
  const concept = keyConcept.replace(/\.$/, '').trim();
  if (concept) {
    seeds.push(`Pode explicar com mais detalhe: ${concept}?`);
    seeds.push(`Quais cenários reais aplicam ${concept}?`);
  }
  const awsTerms = Array.from(
    new Set(whyCorrect.match(/\b(?:AWS\s+[A-Z][\w-]+|Amazon\s+[A-Z][\w-]+|[A-Z]{2,}[\w-]*)\b/g) ?? []),
  ).slice(0, 1);
  if (awsTerms[0]) {
    seeds.push(`Como ${awsTerms[0]} se compara com alternativas?`);
  }
  return seeds.slice(0, 3);
}

function parseExplanationString(raw, optionIds, correctId, optionTexts) {
  const a = /\(a\)\s*([\s\S]*?)\s*\(b\)/i.exec(raw);
  const b = /\(b\)\s*([\s\S]*?)\s*\(c\)/i.exec(raw);
  const c = /\(c\)\s*([\s\S]*?)(?:\s*\(d\)|\s*$)/i.exec(raw);
  if (!a || !b || !c) return null;

  const whyCorrect = a[1].trim();
  const wrongBlock = b[1].trim();
  const keyConcept = c[1].trim();

  const firstSentence =
    /^[\s\S]*?[.!?](?=\s|$)/.exec(whyCorrect)?.[0]?.trim() ?? whyCorrect;
  const summary = firstSentence.length > 280
    ? firstSentence.slice(0, 277) + '...'
    : firstSentence;

  // Split em sentenças/cláusulas: ponto+espaço+maiúscula, ponto-e-vírgula,
  // travessão " — " (usado pelos autores para separar ideias). Também trata
  // o caso de uma única "frase longa" com várias cláusulas independentes.
  const sentences = wrongBlock
    .split(/(?<=[.!?])\s+(?=[A-ZÁÊÉÍÓÔÚÇ])|;\s+|\s+—\s+/)
    .map(s => s.trim().replace(/^[,.;:]\s*/, ''))
    .filter(s => s.length > 0);

  const distractors = optionIds.filter(id => id !== correctId);
  const whyWrong = {};

  const distractorTokens = new Map();
  for (const id of distractors) {
    const text = (optionTexts && optionTexts[id]) || '';
    distractorTokens.set(id, new Set(tokenize(text)));
  }

  const buckets = new Map();
  const unmatched = [];

  for (const sent of sentences) {
    const sentToks = new Set(tokenize(sent));
    let best = null;
    for (const id of distractors) {
      const dToks = distractorTokens.get(id);
      let score = 0;
      for (const t of dToks) if (sentToks.has(t)) score++;
      if (score > 0 && (!best || score > best.score)) {
        best = { id, score };
      }
    }
    if (best) {
      if (!buckets.has(best.id)) buckets.set(best.id, []);
      buckets.get(best.id).push(sent);
    } else {
      unmatched.push(sent);
    }
  }

  for (const id of distractors) {
    const bucket = buckets.get(id);
    if (bucket && bucket.length > 0) {
      whyWrong[id] = bucket.join(' ');
    }
  }

  if (unmatched.length > 0) {
    const emptyTarget = distractors.find(id => !whyWrong[id]);
    if (emptyTarget) {
      whyWrong[emptyTarget] = `TODO_REVIEW: ${unmatched.join(' ')}`;
    } else if (distractors[0]) {
      whyWrong[distractors[0]] =
        (whyWrong[distractors[0]] ?? '') + ` [extra: ${unmatched.join(' ')}]`;
    }
  }

  for (const id of distractors) {
    if (!whyWrong[id]) {
      whyWrong[id] = `TODO_REVIEW: distractor sem explicação específica no bloco (b). Contexto geral: ${wrongBlock}`;
    }
  }

  return {
    summary,
    whyCorrect,
    whyWrong,
    keyConcept,
    tutorSeeds: buildTutorSeeds(keyConcept, whyCorrect),
  };
}

function isTodoEntry(s) {
  return typeof s === 'string' && s.startsWith('TODO_REVIEW');
}

function migrateFile(filename) {
  const filepath = join(QB_DIR, filename);
  const raw = readFileSync(filepath, 'utf8');
  const data = JSON.parse(raw);

  if (data.schemaVersion === 2) {
    return { filename, skipped: true, reason: 'already at schemaVersion 2' };
  }

  const backupPath = filepath.replace(/\.json$/, '.v1-backup.json');
  if (!existsSync(backupPath)) {
    writeFileSync(backupPath, raw, 'utf8');
  }

  const report = {
    filename,
    total: 0,
    migrated: 0,
    fullCoverage: 0,
    partialCoverage: 0,
    errors: [],
  };

  for (const q of data.questions ?? []) {
    report.total++;
    if (typeof q.explanation !== 'string') continue;

    const optionIds = q.options.map(o => o.id);
    const optionTexts = Object.fromEntries(q.options.map(o => [o.id, o.text]));
    const parsed = parseExplanationString(q.explanation, optionIds, q.correctId, optionTexts);

    if (!parsed) {
      report.errors.push({
        id: q.id,
        reason: 'parse-failed: missing one of (a)/(b)/(c) blocks',
      });
      // Mantém explanation original como fallback
      continue;
    }

    q.explanation = parsed;
    report.migrated++;

    const distractors = optionIds.filter(id => id !== q.correctId);
    const hasTodo = distractors.some(id => isTodoEntry(parsed.whyWrong[id]));
    if (hasTodo) report.partialCoverage++;
    else report.fullCoverage++;
  }

  // Inserir schemaVersion no topo (preservando ordem das chaves visualmente
  // não é trivial em JSON — JSON.stringify usa ordem de inserção).
  const ordered = { schemaVersion: 2, ...data };
  writeFileSync(filepath, JSON.stringify(ordered, null, 2) + '\n', 'utf8');

  return report;
}

function printReport(reports) {
  console.log('\n=== Relatório de migração CLF v1 → v2 ===\n');
  console.log(
    'Arquivo                                | Total | Migradas | Full | Parcial | Erros',
  );
  console.log(
    '-'.repeat(95),
  );
  let totals = { total: 0, migrated: 0, full: 0, partial: 0, errors: 0 };
  for (const r of reports) {
    if (r.skipped) {
      console.log(`${r.filename.padEnd(38)} | SKIPPED (${r.reason})`);
      continue;
    }
    console.log(
      [
        r.filename.padEnd(38),
        String(r.total).padStart(5),
        String(r.migrated).padStart(8),
        String(r.fullCoverage).padStart(4),
        String(r.partialCoverage).padStart(7),
        String(r.errors.length).padStart(5),
      ].join(' | '),
    );
    totals.total += r.total;
    totals.migrated += r.migrated;
    totals.full += r.fullCoverage;
    totals.partial += r.partialCoverage;
    totals.errors += r.errors.length;
  }
  console.log('-'.repeat(95));
  console.log(
    [
      'TOTAL'.padEnd(38),
      String(totals.total).padStart(5),
      String(totals.migrated).padStart(8),
      String(totals.full).padStart(4),
      String(totals.partial).padStart(7),
      String(totals.errors).padStart(5),
    ].join(' | '),
  );

  for (const r of reports) {
    if (r.skipped || !r.errors || r.errors.length === 0) continue;
    console.log(`\nErros em ${r.filename}:`);
    for (const e of r.errors) console.log(`  - ${e.id}: ${e.reason}`);
  }
}

const reports = FILES.map(migrateFile);
printReport(reports);
