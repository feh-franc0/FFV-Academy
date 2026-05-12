import { describe, expect, it } from 'vitest';
import { generatePRContext } from '../../src/generators/pr-context';
import { ScanResult } from '../../src/core/types';

function makeScan(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    rootPath: '/project',
    stack: {
      language: 'typescript',
      frameworks: ['express'],
      packageManager: 'npm',
      scripts: { test: 'vitest', lint: 'eslint src' },
      hasTypeScript: true,
      isMonorepo: false,
    },
    structure: {
      rootFolders: ['src', 'tests'],
      sourceRoot: 'src',
      hasTests: true,
      hasDocs: false,
      hasAdr: false,
      hasSpecs: false,
      fileCount: 25,
      largeFolders: [],
    },
    conventions: { fileNaming: 'kebab-case', consistency: 0.9, importStyle: 'relative' },
    detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
    ...overrides,
  };
}

describe('generatePRContext', () => {
  it('returns path .aitoolkit/pr-brief.md', () => {
    const file = generatePRContext(makeScan(), '1 file changed', 'feature/login');
    expect(file.path).toBe('.aitoolkit/pr-brief.md');
  });

  it('includes the branch name in the heading', () => {
    const file = generatePRContext(makeScan(), '', 'feature/my-branch');
    expect(file.content).toContain('feature/my-branch');
  });

  it('includes the diff stat in a code block', () => {
    const file = generatePRContext(makeScan(), '10 insertions, 2 deletions', 'main');
    expect(file.content).toContain('10 insertions, 2 deletions');
    expect(file.content).toContain('```');
  });

  it('includes naming convention in checklist', () => {
    const file = generatePRContext(makeScan(), '', 'main');
    expect(file.content).toContain('kebab-case');
  });

  it('infers Authentication section from auth path in diff', () => {
    const file = generatePRContext(makeScan(), 'src/auth.service.ts', 'feature/auth');
    expect(file.content).toContain('Authentication');
  });

  it('infers Testing section from test path in diff', () => {
    const file = generatePRContext(makeScan(), 'tests/login.test.ts', 'fix/bug');
    expect(file.content).toContain('Testing');
  });

  it('infers Dependencies section from package.json change', () => {
    const file = generatePRContext(makeScan(), 'package.json', 'chore/deps');
    expect(file.content).toContain('Dependencies');
  });

  it('adds TypeScript checklist item when hasTypeScript=true', () => {
    const file = generatePRContext(makeScan(), '', 'main');
    expect(file.content).toContain('TypeScript');
  });

  it('adds conventional commits item when detected', () => {
    const scan = makeScan({ gitHistory: { isGitRepo: true, hotFiles: [], commitFrequency: 'medium', conventionalCommits: true, lastActivity: '2026-01-01', totalCommits: 20 } });
    const file = generatePRContext(scan, '', 'main');
    expect(file.content).toContain('Conventional Commits');
  });

  it('adds all existing tests checklist when hasTests=true', () => {
    const file = generatePRContext(makeScan(), '', 'main');
    expect(file.content).toContain('All existing tests pass');
  });

  it('handles empty diff stat without crashing', () => {
    expect(() => generatePRContext(makeScan(), '', 'main')).not.toThrow();
  });
});
