import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { findUncoveredFiles } from '../../src/scanner/test-coverage-gap';

async function mkdir(p: string): Promise<void> {
  await fs.mkdir(p, { recursive: true });
}

describe('findUncoveredFiles', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-coverage-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('returns empty array when source root does not exist', async () => {
    const result = await findUncoveredFiles(tmp, 'nonexistent');
    expect(result).toEqual([]);
  });

  it('returns empty array when all source files have test files', async () => {
    const src = path.join(tmp, 'src');
    await mkdir(src);
    await fs.writeFile(path.join(src, 'user.ts'), 'export class User {}');
    await fs.writeFile(path.join(src, 'user.test.ts'), "import { User } from './user'");
    const result = await findUncoveredFiles(tmp, 'src');
    expect(result).toEqual([]);
  });

  it('returns source files without corresponding test files', async () => {
    const src = path.join(tmp, 'src');
    await mkdir(src);
    await fs.writeFile(path.join(src, 'user.ts'), 'export class User {}');
    const result = await findUncoveredFiles(tmp, 'src');
    expect(result.some((f) => f.includes('user.ts'))).toBe(true);
  });

  it('does not include test files themselves in the output', async () => {
    const src = path.join(tmp, 'src');
    await mkdir(src);
    await fs.writeFile(path.join(src, 'user.ts'), 'export class User {}');
    await fs.writeFile(path.join(src, 'user.test.ts'), 'it("x", () => {})');
    const result = await findUncoveredFiles(tmp, 'src');
    expect(result.some((f) => f.includes('user.test.ts'))).toBe(false);
  });

  it('detects Go test files (_test.go)', async () => {
    const src = path.join(tmp, 'pkg');
    await mkdir(src);
    await fs.writeFile(path.join(src, 'auth.go'), 'package pkg');
    await fs.writeFile(path.join(src, 'auth_test.go'), 'package pkg');
    const result = await findUncoveredFiles(tmp, 'pkg');
    expect(result.some((f) => f.includes('auth.go'))).toBe(false);
  });

  it('detects Python test files (test_*.py)', async () => {
    const src = path.join(tmp, 'app');
    await mkdir(src);
    await fs.writeFile(path.join(src, 'models.py'), 'class User: pass');
    await fs.writeFile(path.join(src, 'test_models.py'), 'def test_user(): pass');
    const result = await findUncoveredFiles(tmp, 'app');
    expect(result.some((f) => f.includes('models.py'))).toBe(false);
  });

  it('returns relative paths from rootPath', async () => {
    const src = path.join(tmp, 'src');
    await mkdir(src);
    await fs.writeFile(path.join(src, 'service.ts'), 'export class Service {}');
    const result = await findUncoveredFiles(tmp, 'src');
    for (const f of result) {
      expect(path.isAbsolute(f)).toBe(false);
    }
  });
});
