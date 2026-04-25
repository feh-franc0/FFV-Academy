import { describe, expect, it } from 'vitest';
import { generateInstructions } from '../src/generators/instructions';
import { generateSddSpec } from '../src/generators/sdd';
import { generateAdr } from '../src/generators/adr';
import { generateTestSuite } from '../src/generators/test-suite';
import { generateDocsSite } from '../src/generators/docs-site';
import { ScanResult } from '../src/core/types';

const scan: ScanResult = {
  rootPath: '/tmp/x',
  stack: {
    language: 'typescript',
    frameworks: ['nest'],
    packageManager: 'pnpm',
    scripts: { test: 'vitest' },
    hasTypeScript: true,
    isMonorepo: false,
    testFramework: 'vitest',
  },
  structure: {
    rootFolders: ['src'],
    sourceRoot: 'src',
    hasTests: true,
    hasDocs: false,
    hasAdr: false,
    hasSpecs: false,
    fileCount: 50,
    largeFolders: [],
  },
  conventions: { fileNaming: 'kebab-case', consistency: 0.9, importStyle: 'absolute' },
  detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
};

describe('generators', () => {
  it('generates all instruction targets', () => {
    const files = generateInstructions(scan, ['claude', 'cursor', 'copilot', 'amazonq', 'agents']);
    expect(files.map((f) => f.path)).toEqual([
      'CLAUDE.md',
      '.cursorrules',
      '.github/copilot-instructions.md',
      '.amazonq/rules/project.md',
      'AGENTS.md',
    ]);
    for (const f of files) expect(f.content.length).toBeGreaterThan(50);
  });

  it('generates a numbered SDD spec', () => {
    const f = generateSddSpec({ title: 'Checkout flow', folder: 'docs/specs', number: 3 });
    expect(f.path).toBe('docs/specs/0003-checkout-flow.md');
    expect(f.content).toContain('# SPEC-0003 — Checkout flow');
    expect(f.content).toContain('Acceptance criteria');
  });

  it('generates a numbered ADR', () => {
    const f = generateAdr({ title: 'Use Postgres', folder: 'docs/adr', number: 7 });
    expect(f.path).toBe('docs/adr/0007-use-postgres.md');
    expect(f.content).toContain('# 0007. Use Postgres');
  });

  it('generates a multi-layer test suite for TypeScript', () => {
    const files = generateTestSuite({ scan, targetFile: 'src/checkout/checkout.service.ts' });
    const layers = files.map((f) => f.path);
    expect(layers.some((p) => p.includes('unit'))).toBe(true);
    expect(layers.some((p) => p.includes('integration'))).toBe(true);
    expect(layers.some((p) => p.includes('contract'))).toBe(true);
    expect(layers.some((p) => p.includes('e2e'))).toBe(true);
    expect(layers.some((p) => p.includes('fixture'))).toBe(true);
  });

  it('generates a runnable VitePress docs site', () => {
    const files = generateDocsSite(scan);
    const paths = files.map((f) => f.path);
    expect(paths).toContain('docs/package.json');
    expect(paths).toContain('docs/.vitepress/config.ts');
    expect(paths).toContain('docs/index.md');
    expect(paths).toContain('docs/architecture/overview.md');
    expect(paths).toContain('docs/reference/api.md');
  });
});
