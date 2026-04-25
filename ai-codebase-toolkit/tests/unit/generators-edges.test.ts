import { describe, expect, it } from 'vitest';
import { generateAdr } from '../../src/generators/adr';
import { generateSddSpec } from '../../src/generators/sdd';
import { generateTestSuite } from '../../src/generators/test-suite';
import { generateFeatureScaffold } from '../../src/generators/feature-scaffold';
import { ScanResult } from '../../src/core/types';

const tsScan: ScanResult = {
  rootPath: '/p',
  stack: {
    language: 'typescript',
    frameworks: [],
    packageManager: 'npm',
    scripts: {},
    hasTypeScript: true,
    isMonorepo: false,
    testFramework: 'vitest',
  },
  structure: { rootFolders: [], sourceRoot: 'src', hasTests: false, hasDocs: false, hasAdr: false, hasSpecs: false, fileCount: 0, largeFolders: [] },
  conventions: { fileNaming: 'kebab-case', consistency: 1, importStyle: 'absolute' },
  detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
};

const pyScan: ScanResult = { ...tsScan, stack: { ...tsScan.stack, language: 'python', packageManager: 'poetry', testFramework: 'pytest', hasTypeScript: false } };

describe('SDD edge cases', () => {
  it('pads number to 4 digits', () => {
    const f = generateSddSpec({ title: 'X', folder: 'docs/specs', number: 1 });
    expect(f.path).toBe('docs/specs/0001-x.md');
  });

  it('slugifies titles with special chars', () => {
    const f = generateSddSpec({ title: 'Hello, World! 2026?', folder: 'd', number: 12 });
    expect(f.path).toBe('d/0012-hello-world-2026.md');
  });

  it('handles large numbers', () => {
    const f = generateSddSpec({ title: 'X', folder: 'd', number: 9999 });
    expect(f.path).toBe('d/9999-x.md');
  });
});

describe('ADR edge cases', () => {
  it('keeps unicode-free slugs', () => {
    const f = generateAdr({ title: 'Café & 日本語', folder: 'd', number: 2 });
    expect(f.path).toMatch(/^d\/0002-/);
  });
});

describe('test-suite by language', () => {
  it('emits TS suite with all 4 layers + fixture', () => {
    const files = generateTestSuite({ scan: tsScan, targetFile: 'src/x/y.ts' });
    expect(files).toHaveLength(5);
    const paths = files.map((f) => f.path.replace(/\\/g, '/'));
    expect(paths.some((p) => p === 'tests/e2e/y.e2e.test.ts')).toBe(true);
    expect(paths.some((p) => p.endsWith('y.unit.test.ts'))).toBe(true);
    expect(paths.some((p) => p.includes('__fixtures__'))).toBe(true);
  });

  it('emits Python suite with 3 layers (no contract/fixture)', () => {
    const files = generateTestSuite({ scan: pyScan, targetFile: 'src/x/y.py' });
    expect(files).toHaveLength(3);
    expect(files.every((f) => f.path.endsWith('.py'))).toBe(true);
  });
});

describe('feature scaffold by language', () => {
  it('emits 6 TS files including index, types, service, controller, test, README', () => {
    const files = generateFeatureScaffold({ scan: tsScan, parentDir: '/abs/src/features', featureName: 'checkout' });
    const names = files.map((f) => f.path.replace(/\\/g, '/').split('/').pop());
    expect(names).toEqual(expect.arrayContaining(['index.ts', 'checkout.types.ts', 'checkout.service.ts', 'checkout.controller.ts', 'checkout.service.test.ts', 'README.md']));
  });

  it('emits 5 Python files for python projects', () => {
    const files = generateFeatureScaffold({ scan: pyScan, parentDir: '/abs/src', featureName: 'checkout' });
    expect(files.some((f) => f.path.endsWith('__init__.py'))).toBe(true);
    expect(files.some((f) => f.path.endsWith('service.py'))).toBe(true);
  });
});

