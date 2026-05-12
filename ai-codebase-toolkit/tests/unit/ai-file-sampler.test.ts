import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import {
  buildPromptBlock,
  fallback,
  parseAIInsightsResponse,
  sampleProjectFiles,
  SampledFile,
} from '../../src/ai/file-sampler';
import { ScanResult } from '../../src/core/types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeScan(rootPath: string, sourceRoot = 'src'): ScanResult {
  return {
    rootPath,
    stack: {
      language: 'typescript',
      frameworks: [],
      packageManager: 'npm',
      scripts: {},
      hasTypeScript: true,
      isMonorepo: false,
    },
    structure: {
      rootFolders: [sourceRoot],
      sourceRoot,
      hasTests: false,
      hasDocs: false,
      hasAdr: false,
      hasSpecs: false,
      fileCount: 0,
      largeFolders: [],
    },
    conventions: { fileNaming: 'kebab-case', consistency: 1, importStyle: 'relative' },
    detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
  };
}

const MAX_FILE_BYTES = 6 * 1024;
const MAX_TOTAL_BYTES = 32 * 1024;
const MAX_FILES = 8;

// ─── buildPromptBlock ─────────────────────────────────────────────────────────

describe('buildPromptBlock', () => {
  it('wraps a single file with its header', () => {
    const files: SampledFile[] = [{ rel: 'package.json', content: '{"name":"x"}' }];
    const block = buildPromptBlock(files);
    expect(block).toBe('=== package.json ===\n{"name":"x"}');
  });

  it('separates multiple files with a blank line', () => {
    const files: SampledFile[] = [
      { rel: 'package.json', content: 'A' },
      { rel: 'src/index.ts', content: 'B' },
    ];
    const block = buildPromptBlock(files);
    expect(block).toBe('=== package.json ===\nA\n\n=== src/index.ts ===\nB');
  });

  it('returns empty string for an empty array', () => {
    expect(buildPromptBlock([])).toBe('');
  });

  it('preserves content containing backticks, $, braces, and quotes verbatim', () => {
    const tricky = '`template ${literal}` & {"key": "val"}';
    const files: SampledFile[] = [{ rel: 'x.ts', content: tricky }];
    expect(buildPromptBlock(files)).toContain(tricky);
  });
});

// ─── parseAIInsightsResponse ──────────────────────────────────────────────────

describe('parseAIInsightsResponse', () => {
  const validPayload = {
    architecturalStyle: 'layered',
    errorHandling: 'centralized middleware',
    asyncPattern: 'async/await',
    validationPattern: 'Zod',
    internalNaming: 'camelCase functions, PascalCase classes',
    knownDebt: ['TODO in legacy/', 'mixed patterns in utils/'],
    additionalPatterns: 'uses Prisma ORM',
  };

  it('parses a complete, valid JSON string', () => {
    const result = parseAIInsightsResponse(JSON.stringify(validPayload), 'gpt-4o');
    expect(result.architecturalStyle).toBe('layered');
    expect(result.errorHandling).toBe('centralized middleware');
    expect(result.asyncPattern).toBe('async/await');
    expect(result.validationPattern).toBe('Zod');
    expect(result.internalNaming).toBe('camelCase functions, PascalCase classes');
    expect(result.knownDebt).toEqual(['TODO in legacy/', 'mixed patterns in utils/']);
    expect(result.additionalPatterns).toBe('uses Prisma ORM');
  });

  it('modelId always comes from the parameter, not from the JSON payload', () => {
    const json = JSON.stringify({ ...validPayload, modelId: 'injected-model' });
    const result = parseAIInsightsResponse(json, 'real-model');
    expect(result.modelId).toBe('real-model');
  });

  it('analyzedAt is a valid ISO 8601 timestamp', () => {
    const result = parseAIInsightsResponse(JSON.stringify(validPayload), 'm');
    expect(result.analyzedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(Number.isNaN(Date.parse(result.analyzedAt))).toBe(false);
  });

  it('strips ```json ... ``` code fences', () => {
    const fenced = '```json\n' + JSON.stringify(validPayload) + '\n```';
    const result = parseAIInsightsResponse(fenced, 'm');
    expect(result.architecturalStyle).toBe('layered');
  });

  it('strips plain ``` ... ``` fences (no language tag)', () => {
    const fenced = '```\n' + JSON.stringify(validPayload) + '\n```';
    const result = parseAIInsightsResponse(fenced, 'm');
    expect(result.architecturalStyle).toBe('layered');
  });

  it('handles leading and trailing whitespace around the JSON', () => {
    const result = parseAIInsightsResponse('   \n' + JSON.stringify(validPayload) + '\n  ', 'm');
    expect(result.architecturalStyle).toBe('layered');
  });

  it('returns fallback on completely invalid input', () => {
    const result = parseAIInsightsResponse('not json at all', 'fallback-model');
    expect(result.architecturalStyle).toBe('analysis unavailable');
    expect(result.modelId).toBe('fallback-model');
  });

  it('returns fallback when input is a JSON array, not an object', () => {
    const result = parseAIInsightsResponse('[1, 2, 3]', 'm');
    expect(result.architecturalStyle).toBe('analysis unavailable');
  });

  it('returns fallback on empty input string', () => {
    const result = parseAIInsightsResponse('', 'm');
    expect(result.architecturalStyle).toBe('analysis unavailable');
  });

  it('fills all string fields with "unknown" for an empty JSON object {}', () => {
    const result = parseAIInsightsResponse('{}', 'm');
    expect(result.architecturalStyle).toBe('unknown');
    expect(result.errorHandling).toBe('unknown');
    expect(result.asyncPattern).toBe('unknown');
    expect(result.validationPattern).toBe('unknown');
    expect(result.internalNaming).toBe('unknown');
  });

  it('additionalPatterns defaults to empty string when field is absent', () => {
    const result = parseAIInsightsResponse('{}', 'm');
    expect(result.additionalPatterns).toBe('');
  });

  it('additionalPatterns is preserved as empty string when explicitly ""', () => {
    const json = JSON.stringify({ ...validPayload, additionalPatterns: '' });
    const result = parseAIInsightsResponse(json, 'm');
    expect(result.additionalPatterns).toBe('');
  });

  it('knownDebt filters out non-string elements from a mixed array', () => {
    const json = JSON.stringify({ ...validPayload, knownDebt: ['ok', 42, null, true, 'also ok'] });
    const result = parseAIInsightsResponse(json, 'm');
    expect(result.knownDebt).toEqual(['ok', 'also ok']);
  });

  it('knownDebt returns [] when the field is null', () => {
    const json = JSON.stringify({ ...validPayload, knownDebt: null });
    const result = parseAIInsightsResponse(json, 'm');
    expect(result.knownDebt).toEqual([]);
  });

  it('knownDebt returns [] when the field is a string, not an array', () => {
    const json = JSON.stringify({ ...validPayload, knownDebt: 'some debt' });
    const result = parseAIInsightsResponse(json, 'm');
    expect(result.knownDebt).toEqual([]);
  });

  it('knownDebt returns [] when the field is a plain object', () => {
    const json = JSON.stringify({ ...validPayload, knownDebt: { key: 'val' } });
    const result = parseAIInsightsResponse(json, 'm');
    expect(result.knownDebt).toEqual([]);
  });
});

// ─── fallback ─────────────────────────────────────────────────────────────────

describe('fallback', () => {
  it('sets all string fields to "analysis unavailable"', () => {
    const f = fallback('any-model');
    expect(f.architecturalStyle).toBe('analysis unavailable');
    expect(f.errorHandling).toBe('analysis unavailable');
    expect(f.asyncPattern).toBe('analysis unavailable');
    expect(f.validationPattern).toBe('analysis unavailable');
    expect(f.internalNaming).toBe('analysis unavailable');
  });

  it('knownDebt is an empty array', () => {
    expect(fallback('m').knownDebt).toEqual([]);
  });

  it('additionalPatterns is an empty string', () => {
    expect(fallback('m').additionalPatterns).toBe('');
  });

  it('modelId matches the provided parameter', () => {
    expect(fallback('my-model').modelId).toBe('my-model');
  });

  it('analyzedAt is a valid ISO timestamp', () => {
    const f = fallback('m');
    expect(Number.isNaN(Date.parse(f.analyzedAt))).toBe(false);
  });
});

// ─── sampleProjectFiles ───────────────────────────────────────────────────────

describe('sampleProjectFiles', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-sampler-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('returns [] when the project directory is completely empty', async () => {
    const files = await sampleProjectFiles(tmp, makeScan(tmp));
    expect(files).toEqual([]);
  });

  it('includes package.json as a high-priority config file', async () => {
    await fs.writeFile(path.join(tmp, 'package.json'), '{"name":"x"}');
    const files = await sampleProjectFiles(tmp, makeScan(tmp));
    expect(files.some((f) => f.rel === 'package.json')).toBe(true);
  });

  it('includes tsconfig.json as a high-priority config file', async () => {
    await fs.writeFile(path.join(tmp, 'tsconfig.json'), '{}');
    const files = await sampleProjectFiles(tmp, makeScan(tmp));
    expect(files.some((f) => f.rel === 'tsconfig.json')).toBe(true);
  });

  it('includes entry points (index.ts) from the source root', async () => {
    await fs.mkdir(path.join(tmp, 'src'));
    await fs.writeFile(path.join(tmp, 'src', 'index.ts'), 'export const x = 1;');
    const files = await sampleProjectFiles(tmp, makeScan(tmp, 'src'));
    expect(files.some((f) => f.rel === path.join('src', 'index.ts'))).toBe(true);
  });

  it.each([
    ['service', 'auth.service.ts'],
    ['handler', 'request.handler.ts'],
    ['model', 'user.model.ts'],
    ['controller', 'auth.controller.ts'],
    ['repo', 'user.repo.ts'],
    ['repository', 'order.repository.ts'],
    ['store', 'cart.store.ts'],
  ])('includes files containing domain keyword "%s"', async (_keyword, filename) => {
    await fs.mkdir(path.join(tmp, 'src'));
    await fs.writeFile(path.join(tmp, 'src', filename), `export class X {}`);
    const files = await sampleProjectFiles(tmp, makeScan(tmp, 'src'));
    expect(files.some((f) => f.rel.endsWith(filename))).toBe(true);
  });

  it('never adds the same relative path twice', async () => {
    await fs.writeFile(path.join(tmp, 'package.json'), '{}');
    await fs.mkdir(path.join(tmp, 'src'));
    await fs.writeFile(path.join(tmp, 'src', 'index.ts'), 'export {}');
    await fs.writeFile(path.join(tmp, 'src', 'user.service.ts'), 'export class UserService {}');
    const files = await sampleProjectFiles(tmp, makeScan(tmp, 'src'));
    const rels = files.map((f) => f.rel);
    expect(new Set(rels).size).toBe(rels.length);
  });

  it(`never exceeds ${MAX_FILES} files`, async () => {
    await fs.writeFile(path.join(tmp, 'package.json'), '{}');
    await fs.writeFile(path.join(tmp, 'tsconfig.json'), '{}');
    await fs.mkdir(path.join(tmp, 'src'));
    for (let i = 0; i < 10; i++) {
      await fs.writeFile(path.join(tmp, 'src', `svc${i}.service.ts`), `export class S${i} {}`);
    }
    const files = await sampleProjectFiles(tmp, makeScan(tmp, 'src'));
    expect(files.length).toBeLessThanOrEqual(MAX_FILES);
  });

  it(`total bytes across all sampled files never exceeds ${MAX_TOTAL_BYTES}`, async () => {
    const big = 'a'.repeat(5 * 1024);
    for (const name of ['package.json', 'tsconfig.json', 'go.mod', 'pyproject.toml', 'Cargo.toml', 'composer.json']) {
      await fs.writeFile(path.join(tmp, name), big);
    }
    const files = await sampleProjectFiles(tmp, makeScan(tmp));
    const totalBytes = files.reduce((sum, f) => sum + Buffer.byteLength(f.content, 'utf-8'), 0);
    expect(totalBytes).toBeLessThanOrEqual(MAX_TOTAL_BYTES);
  });

  it(`truncates files over ${MAX_FILE_BYTES} bytes and appends [truncated] marker`, async () => {
    const big = 'x'.repeat(8 * 1024);
    await fs.writeFile(path.join(tmp, 'package.json'), big);
    const files = await sampleProjectFiles(tmp, makeScan(tmp));
    const pkg = files.find((f) => f.rel === 'package.json');
    expect(pkg).toBeDefined();
    expect(pkg!.content).toContain('[truncated]');
    expect(Buffer.byteLength(pkg!.content, 'utf-8')).toBeLessThanOrEqual(MAX_FILE_BYTES + 20);
  });

  it('does not crash when the source root directory does not exist', async () => {
    await fs.writeFile(path.join(tmp, 'package.json'), '{}');
    const scan = makeScan(tmp, 'nonexistent-src');
    const files = await sampleProjectFiles(tmp, scan);
    expect(files.some((f) => f.rel === 'package.json')).toBe(true);
  });

  it('returns relative paths (not absolute paths)', async () => {
    await fs.writeFile(path.join(tmp, 'package.json'), '{}');
    await fs.mkdir(path.join(tmp, 'src'));
    await fs.writeFile(path.join(tmp, 'src', 'auth.service.ts'), 'export class A {}');
    const files = await sampleProjectFiles(tmp, makeScan(tmp, 'src'));
    for (const f of files) {
      expect(path.isAbsolute(f.rel)).toBe(false);
    }
  });

  it('config files have higher priority than domain files', async () => {
    // Create 6 config files (fills 6 out of 8 slots)
    await fs.writeFile(path.join(tmp, 'package.json'), '{}');
    await fs.writeFile(path.join(tmp, 'tsconfig.json'), '{}');
    await fs.writeFile(path.join(tmp, 'go.mod'), 'module x');
    await fs.writeFile(path.join(tmp, 'pyproject.toml'), '[tool]');
    await fs.writeFile(path.join(tmp, 'Cargo.toml'), '[package]');
    await fs.writeFile(path.join(tmp, 'composer.json'), '{}');
    // Create 5 domain files to exceed MAX_FILES (6 + 5 = 11 total)
    await fs.mkdir(path.join(tmp, 'src'));
    for (let i = 0; i < 5; i++) {
      await fs.writeFile(path.join(tmp, 'src', `svc${i}.service.ts`), `export class S${i} {}`);
    }

    const files = await sampleProjectFiles(tmp, makeScan(tmp, 'src'));
    // Must not exceed MAX_FILES
    expect(files.length).toBeLessThanOrEqual(MAX_FILES);
    // All 6 config files must be present
    const configRels = ['package.json', 'tsconfig.json', 'go.mod', 'pyproject.toml', 'Cargo.toml', 'composer.json'];
    for (const cfg of configRels) {
      expect(files.some((f) => f.rel === cfg)).toBe(true);
    }
  });
});
