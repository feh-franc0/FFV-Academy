import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { ensureDir, listTopLevelDirs, pathExists, readJson, readText, walk, writeFiles } from '../../src/utils/fs';

let tmp: string;

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-fs-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

describe('fs utils', () => {
  it('pathExists returns true/false correctly', async () => {
    expect(await pathExists(tmp)).toBe(true);
    expect(await pathExists(path.join(tmp, 'nope'))).toBe(false);
  });

  it('readJson returns null for missing or invalid files', async () => {
    expect(await readJson(path.join(tmp, 'missing.json'))).toBeNull();
    await fs.writeFile(path.join(tmp, 'bad.json'), 'not-json');
    expect(await readJson(path.join(tmp, 'bad.json'))).toBeNull();
  });

  it('readJson parses valid JSON', async () => {
    await fs.writeFile(path.join(tmp, 'p.json'), JSON.stringify({ a: 1 }));
    expect(await readJson<{ a: number }>(path.join(tmp, 'p.json'))).toEqual({ a: 1 });
  });

  it('readText returns null when file missing', async () => {
    expect(await readText(path.join(tmp, 'x.txt'))).toBeNull();
  });

  it('ensureDir creates nested directories', async () => {
    const nested = path.join(tmp, 'a', 'b', 'c');
    await ensureDir(nested);
    expect(await pathExists(nested)).toBe(true);
  });

  it('writeFiles writes both relative and absolute paths', async () => {
    const written = await writeFiles(tmp, [
      { path: 'rel/file.txt', content: 'one' },
      { path: path.join(tmp, 'abs.txt'), content: 'two' },
    ]);
    expect(written).toHaveLength(2);
    expect(await readText(path.join(tmp, 'rel/file.txt'))).toBe('one');
    expect(await readText(path.join(tmp, 'abs.txt'))).toBe('two');
  });

  it('walk skips ignored directories and dotfiles', async () => {
    await ensureDir(path.join(tmp, 'src'));
    await ensureDir(path.join(tmp, 'node_modules'));
    await ensureDir(path.join(tmp, '.git'));
    await fs.writeFile(path.join(tmp, 'src', 'a.ts'), '');
    await fs.writeFile(path.join(tmp, 'node_modules', 'b.ts'), '');
    await fs.writeFile(path.join(tmp, '.git', 'c.ts'), '');

    const found = await walk(tmp);
    expect(found.some((f) => f.endsWith('a.ts'))).toBe(true);
    expect(found.some((f) => f.includes('node_modules'))).toBe(false);
    expect(found.some((f) => f.includes('.git'))).toBe(false);
  });

  it('walk respects maxDepth', async () => {
    await ensureDir(path.join(tmp, 'a', 'b', 'c'));
    await fs.writeFile(path.join(tmp, 'a', 'b', 'c', 'deep.ts'), '');
    const shallow = await walk(tmp, { maxDepth: 1 });
    expect(shallow).toHaveLength(0);
  });

  it('listTopLevelDirs ignores hidden and ignored', async () => {
    await ensureDir(path.join(tmp, 'src'));
    await ensureDir(path.join(tmp, 'node_modules'));
    await ensureDir(path.join(tmp, '.cache'));
    const dirs = await listTopLevelDirs(tmp);
    expect(dirs).toEqual(['src']);
  });
});
