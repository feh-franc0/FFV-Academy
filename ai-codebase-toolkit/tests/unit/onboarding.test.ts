import { describe, expect, it } from 'vitest';
import { generateOnboarding } from '../../src/generators/onboarding';
import { ScanResult } from '../../src/core/types';

function makeScan(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    rootPath: '/project',
    stack: {
      language: 'typescript',
      frameworks: ['express'],
      packageManager: 'npm',
      scripts: { dev: 'ts-node src/index.ts', test: 'vitest', lint: 'eslint src' },
      hasTypeScript: true,
      isMonorepo: false,
    },
    structure: {
      rootFolders: ['src', 'tests', 'docs'],
      sourceRoot: 'src',
      hasTests: true,
      hasDocs: true,
      hasAdr: false,
      hasSpecs: false,
      fileCount: 30,
      largeFolders: [],
    },
    conventions: { fileNaming: 'kebab-case', consistency: 0.9, importStyle: 'relative' },
    detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
    ...overrides,
  };
}

describe('generateOnboarding', () => {
  it('returns path ONBOARDING.md', () => {
    const file = generateOnboarding(makeScan());
    expect(file.path).toBe('ONBOARDING.md');
  });

  it('includes manifest hash for drift detection', () => {
    const file = generateOnboarding(makeScan());
    expect(file.content).toMatch(/<!-- aitk-manifest: [a-f0-9]+ -->/);
  });

  it('includes the detected language', () => {
    const file = generateOnboarding(makeScan());
    expect(file.content.toLowerCase()).toContain('typescript');
  });

  it('includes prerequisites for Node.js projects', () => {
    const file = generateOnboarding(makeScan());
    expect(file.content).toContain('Node.js');
  });

  it('includes npm install for npm package manager', () => {
    const file = generateOnboarding(makeScan());
    expect(file.content).toContain('npm install');
  });

  it('includes dev script in running section', () => {
    const file = generateOnboarding(makeScan());
    expect(file.content).toContain('ts-node src/index.ts');
  });

  it('includes test script in testing section', () => {
    const file = generateOnboarding(makeScan());
    expect(file.content).toContain('vitest');
  });

  it('includes file naming convention', () => {
    const file = generateOnboarding(makeScan());
    expect(file.content).toContain('kebab-case');
  });

  it('mentions has-tests agreement when hasTests=true', () => {
    const file = generateOnboarding(makeScan());
    expect(file.content).toContain('tests');
  });

  it('mentions conventional commits when detected', () => {
    const scan = makeScan({ gitHistory: { isGitRepo: true, hotFiles: [], commitFrequency: 'medium', conventionalCommits: true, lastActivity: '2026-01-01', totalCommits: 10 } });
    const file = generateOnboarding(scan);
    expect(file.content.toLowerCase()).toContain('conventional commit');
  });

  it('uses hot files as key files when git history is available', () => {
    const scan = makeScan({ gitHistory: { isGitRepo: true, hotFiles: ['src/auth.ts', 'src/db.ts'], commitFrequency: 'high', conventionalCommits: true, lastActivity: '2026-01-01', totalCommits: 50 } });
    const file = generateOnboarding(scan);
    expect(file.content).toContain('src/auth.ts');
    expect(file.content).toContain('src/db.ts');
  });

  it('falls back to entry points when no git history', () => {
    const file = generateOnboarding(makeScan());
    expect(file.content).toContain('src/index.ts');
  });

  it('handles Go projects correctly', () => {
    const scan = makeScan({
      stack: {
        language: 'go',
        frameworks: [],
        packageManager: 'go',
        scripts: { test: 'go test ./...' },
        hasTypeScript: false,
        isMonorepo: false,
      },
    });
    const file = generateOnboarding(scan);
    expect(file.content).toContain('Go');
    expect(file.content).toContain('go mod download');
  });
});
