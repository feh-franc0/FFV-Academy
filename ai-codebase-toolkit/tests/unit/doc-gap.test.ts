import { describe, expect, it } from 'vitest';
import { analyzeDocGaps } from '../../src/analyzers/doc-gap';
import { ScanResult } from '../../src/core/types';

function makeScan(overrides: Partial<ScanResult['stack']> = {}): ScanResult {
  return {
    rootPath: '/nonexistent-root',
    stack: {
      language: 'typescript',
      frameworks: [],
      packageManager: 'npm',
      scripts: {},
      hasTypeScript: true,
      isMonorepo: false,
      ...overrides,
    },
    structure: {
      rootFolders: ['src'],
      sourceRoot: 'src',
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

describe('analyzeDocGaps — phantom-path', () => {
  it('flags a backtick path that does not exist on disk', async () => {
    const doc = 'See `src/nonexistent.ts` for details.';
    const { gaps } = await analyzeDocGaps(makeScan(), doc);
    const phantom = gaps.find((g) => g.type === 'phantom-path');
    expect(phantom).toBeDefined();
    expect(phantom!.description).toContain('src/nonexistent.ts');
  });

  it('does not flag plain text tokens', async () => {
    const doc = 'Use `npm install` to install dependencies.';
    const { gaps } = await analyzeDocGaps(makeScan(), doc);
    const phantom = gaps.find((g) => g.type === 'phantom-path');
    expect(phantom).toBeUndefined();
  });
});

describe('analyzeDocGaps — missing-framework', () => {
  it('flags a framework detected but not mentioned', async () => {
    const scan = makeScan({ frameworks: ['react'] });
    const doc = '## Stack\nNode.js project with Express.';
    const { gaps } = await analyzeDocGaps(scan, doc);
    const fw = gaps.find((g) => g.type === 'missing-framework');
    expect(fw).toBeDefined();
    expect(fw!.description).toContain('react');
  });

  it('does not flag frameworks already mentioned in the doc', async () => {
    const scan = makeScan({ frameworks: ['express'] });
    const doc = '## Stack\nExpress.js API.';
    const { gaps } = await analyzeDocGaps(scan, doc);
    const fw = gaps.find((g) => g.type === 'missing-framework' && fw?.description.includes('express'));
    expect(fw).toBeUndefined();
  });

  it('skips unknown framework value', async () => {
    const scan = makeScan({ frameworks: ['unknown' as never] });
    const doc = 'no frameworks mentioned';
    const { gaps } = await analyzeDocGaps(scan, doc);
    expect(gaps.filter((g) => g.type === 'missing-framework')).toHaveLength(0);
  });
});

describe('analyzeDocGaps — stale-script', () => {
  it('flags scripts not mentioned in the doc', async () => {
    const scan = makeScan({ scripts: { build: 'tsc', test: 'vitest' } });
    const doc = '## Commands\nRun `build` to compile.';
    const { gaps } = await analyzeDocGaps(scan, doc);
    const stale = gaps.filter((g) => g.type === 'stale-script');
    expect(stale.some((g) => g.description.includes('test'))).toBe(true);
  });

  it('does not flag scripts that are mentioned', async () => {
    const scan = makeScan({ scripts: { build: 'tsc', test: 'vitest' } });
    const doc = 'Run `build` and `test` commands.';
    const { gaps } = await analyzeDocGaps(scan, doc);
    const stale = gaps.filter((g) => g.type === 'stale-script');
    expect(stale).toHaveLength(0);
  });
});

describe('analyzeDocGaps — score', () => {
  it('returns 100 when there are no gaps', async () => {
    const { score } = await analyzeDocGaps(makeScan(), '## Stack\nTypeScript project.');
    expect(score).toBe(100);
  });

  it('deducts for warning-level gaps', async () => {
    const scan = makeScan({ frameworks: ['react', 'vue'] });
    const { score } = await analyzeDocGaps(scan, 'no frameworks');
    expect(score).toBeLessThan(100);
  });

  it('score never goes below 0', async () => {
    const scan = makeScan({ frameworks: ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'remix', 'astro', 'solid', 'qwik'] });
    const { score } = await analyzeDocGaps(scan, '');
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
