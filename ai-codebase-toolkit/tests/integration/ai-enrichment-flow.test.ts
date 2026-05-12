/**
 * Integration tests for the AI enrichment flow.
 *
 * These tests exercise the full non-vscode pipeline:
 *   sampleProjectFiles → buildPromptBlock → PATTERN_ANALYSIS_PROMPT
 *                     → parseAIInsightsResponse → renderClaude
 *
 * No vscode runtime is required — lm-client.ts is the only module
 * that depends on vscode and is deliberately excluded from this suite.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { buildPromptBlock, fallback, parseAIInsightsResponse, sampleProjectFiles } from '../../src/ai/file-sampler';
import { PATTERN_ANALYSIS_PROMPT } from '../../src/ai/prompts';
import { renderClaude } from '../../src/generators/instructions/claude';
import { generateInstructions } from '../../src/generators/instructions';
import { ScanResult } from '../../src/core/types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeScan(rootPath: string, sourceRoot = 'src'): ScanResult {
  return {
    rootPath,
    stack: {
      language: 'typescript',
      frameworks: [],
      packageManager: 'npm',
      scripts: { test: 'vitest' },
      hasTypeScript: true,
      isMonorepo: false,
    },
    structure: {
      rootFolders: [sourceRoot],
      sourceRoot,
      hasTests: true,
      hasDocs: false,
      hasAdr: false,
      hasSpecs: false,
      fileCount: 10,
      largeFolders: [],
    },
    conventions: { fileNaming: 'kebab-case', consistency: 1, importStyle: 'relative' },
    detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
  };
}

const MOCK_AI_RESPONSE = JSON.stringify({
  architecturalStyle: 'layered: services + controllers',
  errorHandling: 'try/catch in route handlers',
  asyncPattern: 'async/await',
  validationPattern: 'Zod at route layer',
  internalNaming: 'camelCase',
  knownDebt: ['TODOs in auth module'],
  additionalPatterns: 'uses Redis for session caching',
});

// ─── tests ───────────────────────────────────────────────────────────────────

describe('AI enrichment flow — integration', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-flow-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('sampleProjectFiles → buildPromptBlock produces a block containing sampled file headers', async () => {
    await fs.writeFile(path.join(tmp, 'package.json'), '{"name":"myapp"}');
    await fs.mkdir(path.join(tmp, 'src'));
    await fs.writeFile(path.join(tmp, 'src', 'index.ts'), 'export const app = 1;');

    const scan = makeScan(tmp, 'src');
    const files = await sampleProjectFiles(tmp, scan);
    const block = buildPromptBlock(files);

    expect(block).toContain('=== package.json ===');
    expect(block).toContain('{"name":"myapp"}');
    expect(block).toContain('=== src/index.ts ===');
    expect(block).toContain('export const app = 1;');
  });

  it('PATTERN_ANALYSIS_PROMPT wraps the file block in the full prompt', async () => {
    await fs.writeFile(path.join(tmp, 'package.json'), '{"name":"myapp"}');

    const scan = makeScan(tmp, 'src');
    const files = await sampleProjectFiles(tmp, scan);
    const block = buildPromptBlock(files);
    const prompt = PATTERN_ANALYSIS_PROMPT(block);

    expect(prompt).toContain('PROJECT FILES:');
    expect(prompt).toContain('package.json');
    expect(prompt).toContain('"architecturalStyle"');
  });

  it('parseAIInsightsResponse(mockResponse) → renderClaude → CLAUDE.md has AI-Detected Patterns', async () => {
    const scan = makeScan(tmp, 'src');
    const insights = parseAIInsightsResponse(MOCK_AI_RESPONSE, 'claude-3-5-sonnet');
    const { content } = renderClaude(scan, insights);

    expect(content).toContain('## AI-Detected Patterns');
    expect(content).toContain('layered: services + controllers');
    expect(content).toContain('try/catch in route handlers');
    expect(content).toContain('TODOs in auth module');
    expect(content).toContain('uses Redis for session caching');
  });

  it('fallback insights path → CLAUDE.md section contains "analysis unavailable"', async () => {
    const scan = makeScan(tmp, 'src');
    const insights = fallback('claude-3-5-sonnet');
    const { content } = renderClaude(scan, insights);

    expect(content).toContain('## AI-Detected Patterns');
    expect(content).toContain('analysis unavailable');
  });

  it('full flow with realistic project layout: config + entry + service file all sampled', async () => {
    await fs.writeFile(path.join(tmp, 'package.json'), '{"name":"api","dependencies":{"express":"^4"}}');
    await fs.writeFile(path.join(tmp, 'tsconfig.json'), '{"compilerOptions":{"strict":true}}');
    await fs.mkdir(path.join(tmp, 'src'));
    await fs.writeFile(path.join(tmp, 'src', 'index.ts'), 'import express from "express";');
    await fs.writeFile(path.join(tmp, 'src', 'auth.service.ts'), 'export class AuthService { login() {} }');

    const scan = makeScan(tmp, 'src');
    const files = await sampleProjectFiles(tmp, scan);
    const block = buildPromptBlock(files);

    expect(files.some((f) => f.rel === 'package.json')).toBe(true);
    expect(files.some((f) => f.rel === 'tsconfig.json')).toBe(true);
    expect(files.some((f) => f.rel.endsWith('index.ts'))).toBe(true);
    expect(files.some((f) => f.rel.endsWith('auth.service.ts'))).toBe(true);
    expect(block).toContain('AuthService');
  });

  it('total prompt length for a typical small project is under 32 KB', async () => {
    await fs.writeFile(path.join(tmp, 'package.json'), '{"name":"app"}');
    await fs.writeFile(path.join(tmp, 'tsconfig.json'), '{}');
    await fs.mkdir(path.join(tmp, 'src'));
    await fs.writeFile(path.join(tmp, 'src', 'index.ts'), 'export {}');
    await fs.writeFile(path.join(tmp, 'src', 'auth.service.ts'), 'export class A {}');

    const scan = makeScan(tmp, 'src');
    const files = await sampleProjectFiles(tmp, scan);
    const block = buildPromptBlock(files);
    const prompt = PATTERN_ANALYSIS_PROMPT(block);

    expect(Buffer.byteLength(prompt, 'utf-8')).toBeLessThan(32 * 1024);
  });

  it('completely empty project → graceful flow with no crash and valid (empty) output files', async () => {
    const scan = makeScan(tmp, 'src');
    const files = await sampleProjectFiles(tmp, scan);
    const block = buildPromptBlock(files);
    const prompt = PATTERN_ANALYSIS_PROMPT(block);
    const insights = fallback('m');

    const generated = generateInstructions(scan, ['claude'], insights);
    expect(generated).toHaveLength(1);
    expect(generated[0].path).toBe('CLAUDE.md');
    expect(generated[0].content).toContain('## AI-Detected Patterns');
    expect(files).toHaveLength(0);
    expect(block).toBe('');
    expect(prompt.length).toBeGreaterThan(0);
  });
});
