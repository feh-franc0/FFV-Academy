import * as fs from 'fs/promises';
import * as path from 'path';
import { AIInsights, ScanResult } from '../core/types';
import { pathExists, walk } from '../utils/fs';

const MAX_FILES = 8;
const MAX_TOTAL_BYTES = 32 * 1024;
const MAX_FILE_BYTES = 6 * 1024;

const CONFIG_FILES = [
  'package.json',
  'tsconfig.json',
  'go.mod',
  'pyproject.toml',
  'Cargo.toml',
  'composer.json',
];
const ENTRY_POINTS = [
  'index.ts', 'main.ts', 'app.ts', 'server.ts',
  'index.js', 'main.js', 'app.js',
];
const DOMAIN_KEYWORDS = [
  'service', 'handler', 'model', 'controller', 'repo', 'repository', 'store',
];

export interface SampledFile {
  rel: string;
  content: string;
}

export async function sampleProjectFiles(
  rootPath: string,
  scan: ScanResult
): Promise<SampledFile[]> {
  const sampled: SampledFile[] = [];
  let totalBytes = 0;

  async function tryAdd(rel: string): Promise<boolean> {
    if (sampled.length >= MAX_FILES) return false;
    if (sampled.some((f) => f.rel === rel)) return false;
    try {
      const abs = path.join(rootPath, rel);
      const raw = await fs.readFile(abs, 'utf-8');
      const content =
        raw.length > MAX_FILE_BYTES ? raw.slice(0, MAX_FILE_BYTES) + '\n... [truncated]' : raw;
      const bytes = Buffer.byteLength(content, 'utf-8');
      if (totalBytes + bytes > MAX_TOTAL_BYTES) return false;
      sampled.push({ rel, content });
      totalBytes += bytes;
      return true;
    } catch {
      return false;
    }
  }

  // Priority 1: config files
  for (const cfg of CONFIG_FILES) {
    await tryAdd(cfg);
  }

  // Priority 2: entry points inside the detected source root
  const src = scan.structure.sourceRoot;
  for (const ep of ENTRY_POINTS) {
    await tryAdd(path.join(src, ep));
  }

  // Priority 3: hot files from git history (3 slots) — skip test files and already-sampled
  const hotFiles = scan.gitHistory?.hotFiles ?? [];
  const HOT_SLOTS = 3;
  let hotAdded = 0;
  if (hotFiles.length > 0) {
    for (const rel of hotFiles) {
      if (hotAdded >= HOT_SLOTS) break;
      if (sampled.length >= MAX_FILES) break;
      // skip test files
      const base = path.basename(rel).toLowerCase();
      if (base.includes('.test.') || base.includes('.spec.') || rel.includes('__tests__')) continue;
      const added = await tryAdd(rel);
      if (added) hotAdded++;
    }
  }

  // Priority 4: domain files (service, handler, model, etc.) inside source root
  // Use all remaining slots when no hot files were available, else fill remaining 2 slots
  if (sampled.length < MAX_FILES) {
    const srcAbs = path.join(rootPath, src);
    if (await pathExists(srcAbs)) {
      const files = await walk(srcAbs, { maxDepth: 4 });
      const domainFiles = files
        .filter((f) => {
          const base = path.basename(f).toLowerCase();
          return DOMAIN_KEYWORDS.some((kw) => base.includes(kw));
        })
        .map((f) => path.relative(rootPath, f));
      for (const rel of domainFiles) {
        if (sampled.length >= MAX_FILES) break;
        await tryAdd(rel);
      }
    }
  }

  return sampled;
}

export function buildPromptBlock(files: SampledFile[]): string {
  return files.map((f) => `=== ${f.rel} ===\n${f.content}`).join('\n\n');
}

export function parseAIInsightsResponse(raw: string, modelId: string): AIInsights {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  try {
    const parsed = JSON.parse(cleaned) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return fallback(modelId);
    }
    const obj = parsed as Record<string, unknown>;
    return {
      modelId,
      analyzedAt: new Date().toISOString(),
      architecturalStyle: str(obj.architecturalStyle),
      errorHandling: str(obj.errorHandling),
      asyncPattern: str(obj.asyncPattern),
      validationPattern: str(obj.validationPattern),
      internalNaming: str(obj.internalNaming),
      knownDebt: strArr(obj.knownDebt),
      additionalPatterns: typeof obj.additionalPatterns === 'string' ? obj.additionalPatterns : '',
    };
  } catch {
    return fallback(modelId);
  }
}

export function fallback(modelId: string): AIInsights {
  return {
    modelId,
    analyzedAt: new Date().toISOString(),
    architecturalStyle: 'analysis unavailable',
    errorHandling: 'analysis unavailable',
    asyncPattern: 'analysis unavailable',
    validationPattern: 'analysis unavailable',
    internalNaming: 'analysis unavailable',
    knownDebt: [],
    additionalPatterns: '',
  };
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : 'unknown';
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}
