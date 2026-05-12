import * as path from 'path';
import { pathExists, walk } from '../utils/fs';

const SOURCE_EXTENSIONS = new Set(['.ts', '.js', '.go', '.py', '.java']);

const TEST_FILE_INDICATORS = [
  '.test.',
  '.spec.',
  '_test.',
  '_spec.',
  'test_',
  'Test.',
  '__tests__',
];

function isTestFile(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return TEST_FILE_INDICATORS.some((indicator) => normalized.includes(indicator));
}

async function testFileExistsFor(filePath: string): Promise<boolean> {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);

  const candidates: string[] = [];

  if (ext === '.ts' || ext === '.js') {
    // TypeScript / JavaScript patterns
    candidates.push(
      path.join(dir, `${base}.test${ext}`),
      path.join(dir, `${base}.spec${ext}`),
      path.join(dir, '__tests__', `${base}.test${ext}`),
      path.join(dir, '__tests__', `${base}.spec${ext}`),
      // Also check .ts variant when source is .js and vice versa
      path.join(dir, `${base}.test.ts`),
      path.join(dir, `${base}.spec.ts`),
      path.join(dir, `${base}.test.js`),
      path.join(dir, `${base}.spec.js`),
    );
  } else if (ext === '.py') {
    // Python patterns
    candidates.push(
      path.join(dir, `test_${base}.py`),
      path.join(dir, `${base}_test.py`),
      path.join(path.dirname(dir), 'tests', `test_${base}.py`),
    );
  } else if (ext === '.go') {
    // Go patterns: test file lives in same package
    candidates.push(path.join(dir, `${base}_test.go`));
  } else if (ext === '.java') {
    // Java patterns: test class name is usually SomeClassTest.java
    const pascalBase = base.charAt(0).toUpperCase() + base.slice(1);
    candidates.push(
      path.join(dir, `${pascalBase}Test.java`),
      // Also look in sibling test directory (src/test/java mirror)
      filePath.replace('/main/', '/test/').replace(base + ext, `${pascalBase}Test${ext}`),
    );
  }

  for (const candidate of candidates) {
    if (await pathExists(candidate)) return true;
  }
  return false;
}

export async function findUncoveredFiles(
  rootPath: string,
  sourceRoot: string
): Promise<string[]> {
  const absSourceRoot = path.isAbsolute(sourceRoot)
    ? sourceRoot
    : path.join(rootPath, sourceRoot);

  const allFiles = await walk(absSourceRoot, { maxDepth: 8 });

  const sourceFiles = allFiles.filter((f) => {
    const ext = path.extname(f);
    if (!SOURCE_EXTENSIONS.has(ext)) return false;
    if (isTestFile(f)) return false;
    return true;
  });

  const uncovered: string[] = [];
  for (const file of sourceFiles) {
    if (uncovered.length >= 20) break;
    const hasCoverage = await testFileExistsFor(file);
    if (!hasCoverage) {
      uncovered.push(path.relative(rootPath, file));
    }
  }

  return uncovered;
}
