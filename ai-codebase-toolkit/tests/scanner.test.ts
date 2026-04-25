import { describe, expect, it } from 'vitest';
import { computeReadiness } from '../src/scanner/readiness-score';
import { ScanResult } from '../src/core/types';

function baseScan(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    rootPath: '/tmp/x',
    stack: {
      language: 'typescript',
      frameworks: ['next'],
      packageManager: 'pnpm',
      scripts: { test: 'vitest', lint: 'eslint .', build: 'next build' },
      hasTypeScript: true,
      isMonorepo: false,
      testFramework: 'vitest',
    },
    structure: {
      rootFolders: ['src', 'tests', 'docs'],
      sourceRoot: 'src',
      hasTests: true,
      hasDocs: true,
      hasAdr: true,
      hasSpecs: true,
      fileCount: 120,
      largeFolders: [],
    },
    conventions: { fileNaming: 'kebab-case', consistency: 0.95, importStyle: 'absolute' },
    detectedAITools: { claude: true, cursor: true, copilot: true, amazonq: true, agents: true },
    ...overrides,
  };
}

describe('computeReadiness', () => {
  it('gives high score for a well-prepared project', () => {
    const report = computeReadiness(baseScan());
    expect(report.score).toBeGreaterThanOrEqual(95);
    expect(report.issues).toHaveLength(0);
  });

  it('drops score and reports issues for a bare project', () => {
    const report = computeReadiness(
      baseScan({
        detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
        structure: {
          rootFolders: ['src'],
          sourceRoot: 'src',
          hasTests: false,
          hasDocs: false,
          hasAdr: false,
          hasSpecs: false,
          fileCount: 10,
          largeFolders: [{ path: 'src/utils', count: 80 }],
        },
        conventions: { fileNaming: 'mixed', consistency: 0.4, importStyle: 'mixed' },
      })
    );
    expect(report.score).toBeLessThan(50);
    expect(report.issues.some((i) => i.id === 'has-claude-md')).toBe(true);
    expect(report.issues.some((i) => i.severity === 'critical')).toBe(true);
  });
});
