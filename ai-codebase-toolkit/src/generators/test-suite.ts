import * as path from 'path';
import { GeneratedFile, ScanResult } from '../core/types';

export interface TestSuiteInput {
  scan: ScanResult;
  targetFile: string; // relative path of the module to be tested
}

/**
 * Generates a multi-layer test scaffold (unit, integration, contract, e2e)
 * following the testing pyramid. Picks framework based on scan.
 */
export function generateTestSuite(input: TestSuiteInput): GeneratedFile[] {
  const { scan, targetFile } = input;
  const lang = scan.stack.language;
  const framework = scan.stack.testFramework ?? defaultFramework(lang);
  const baseName = path.basename(targetFile, path.extname(targetFile));
  const dir = path.dirname(targetFile);

  if (lang === 'typescript' || lang === 'javascript') {
    return tsSuite(dir, baseName, framework);
  }
  if (lang === 'python') {
    return pySuite(dir, baseName);
  }
  return tsSuite(dir, baseName, framework);
}

function defaultFramework(lang: string): string {
  switch (lang) {
    case 'typescript':
    case 'javascript':
      return 'vitest';
    case 'python':
      return 'pytest';
    case 'go':
      return 'testing';
    default:
      return 'vitest';
  }
}

function tsSuite(dir: string, name: string, framework: string): GeneratedFile[] {
  const ext = framework === 'jest' ? 'test.ts' : 'test.ts';
  const importPath = `./${name}`;

  const unit = `import { describe, it, expect, beforeEach } from '${framework}';
import { /* TODO */ } from '${importPath}';

// Unit test — single responsibility, no I/O, no network.
describe('${name} (unit)', () => {
  beforeEach(() => {
    // arrange shared state
  });

  it('does the expected thing under happy path', () => {
    // Arrange
    // Act
    // Assert
    expect(true).toBe(true);
  });

  it('rejects invalid input', () => {
    expect(() => {
      // call with bad input
    }).toThrow();
  });
});
`;

  const integration = `import { describe, it, expect, beforeAll, afterAll } from '${framework}';

// Integration test — real collaborators (DB, queue, file system) but isolated env.
describe('${name} (integration)', () => {
  beforeAll(async () => {
    // spin up test container / migrate DB / seed
  });

  afterAll(async () => {
    // teardown
  });

  it('persists and retrieves the entity', async () => {
    expect(true).toBe(true);
  });
});
`;

  const contract = `import { describe, it, expect } from '${framework}';

// Contract test — pin the public shape (HTTP/JSON, message schemas).
describe('${name} (contract)', () => {
  it('matches the published response schema', () => {
    const response = { id: '1', name: 'x' };
    expect(response).toMatchObject({ id: expect.any(String), name: expect.any(String) });
  });
});
`;

  const e2e = `import { describe, it, expect } from '${framework}';

// E2E — full stack, user-facing flow. Keep few and slow-but-meaningful.
describe('${name} (e2e)', () => {
  it('completes the primary user journey', async () => {
    expect(true).toBe(true);
  });
});
`;

  const factory = `// Test data factory — keeps tests readable and resilient to schema changes.
export interface ${capitalize(name)}Fixture {
  id: string;
  name: string;
}

export function build${capitalize(name)}(overrides: Partial<${capitalize(name)}Fixture> = {}): ${capitalize(name)}Fixture {
  return { id: 'id-1', name: 'sample', ...overrides };
}
`;

  return [
    { path: path.join(dir, '__tests__', `${name}.unit.${ext}`), content: unit },
    { path: path.join(dir, '__tests__', `${name}.integration.${ext}`), content: integration },
    { path: path.join(dir, '__tests__', `${name}.contract.${ext}`), content: contract },
    { path: path.join('tests', 'e2e', `${name}.e2e.${ext}`), content: e2e },
    { path: path.join(dir, '__tests__', '__fixtures__', `${name}.fixture.ts`), content: factory },
  ];
}

function pySuite(dir: string, name: string): GeneratedFile[] {
  const unit = `import pytest
# from ${name.replace(/-/g, '_')} import ...

class TestUnit:
    def test_happy_path(self):
        assert True

    def test_invalid_input(self):
        with pytest.raises(ValueError):
            pass
`;
  const integration = `import pytest

@pytest.fixture(scope="module")
def db():
    # spin up test DB
    yield None

class TestIntegration:
    def test_persists(self, db):
        assert True
`;
  const e2e = `def test_primary_user_journey():
    assert True
`;

  return [
    { path: path.join(dir, 'tests', `test_${name}_unit.py`), content: unit },
    { path: path.join(dir, 'tests', `test_${name}_integration.py`), content: integration },
    { path: path.join('tests', 'e2e', `test_${name}_e2e.py`), content: e2e },
  ];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
