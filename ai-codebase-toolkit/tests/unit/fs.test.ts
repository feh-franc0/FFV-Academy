import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { ensureDir, listTopLevelDirs, parseGitignoreRules, pathExists, readJson, readText, walk, writeFiles } from '../../src/utils/fs';

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

describe('parseGitignoreRules', () => {
  it('ignores comments and blank lines', () => {
    const rules = parseGitignoreRules('# comment\n\n  \nfoo');
    expect(rules).toHaveLength(1);
  });

  it('matches simple name pattern against basename and nested paths', () => {
    const rules = parseGitignoreRules('hostinger');
    expect(rules[0].matcher('hostinger', true)).toBe(true);
    expect(rules[0].matcher('sub/hostinger', true)).toBe(true);
    expect(rules[0].matcher('other', true)).toBe(false);
  });

  it('respects leading slash as root-anchored', () => {
    const rules = parseGitignoreRules('/hostinger');
    expect(rules[0].matcher('hostinger', true)).toBe(true);
    expect(rules[0].matcher('sub/hostinger', true)).toBe(false);
  });

  it('respects trailing slash as directory-only', () => {
    const rules = parseGitignoreRules('dist/');
    expect(rules[0].matcher('dist', true)).toBe(true);
    expect(rules[0].matcher('dist', false)).toBe(false);
  });

  it('handles negation rules', () => {
    const rules = parseGitignoreRules('*.log\n!important.log');
    const isIgnored = (rel: string) => {
      let ignored = false;
      for (const r of rules) {
        if (r.matcher(rel, false)) ignored = !r.negate;
      }
      return ignored;
    };
    expect(isIgnored('debug.log')).toBe(true);
    expect(isIgnored('important.log')).toBe(false);
  });

  it('handles ** glob', () => {
    const rules = parseGitignoreRules('**/build');
    expect(rules[0].matcher('build', true)).toBe(true);
    expect(rules[0].matcher('a/b/build', true)).toBe(true);
  });
});

describe('walk with .gitignore', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-gitignore-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('excludes directories listed in .gitignore', async () => {
    await fs.writeFile(path.join(tmp, '.gitignore'), '/hostinger\n');
    await ensureDir(path.join(tmp, 'src'));
    await ensureDir(path.join(tmp, 'hostinger'));
    await fs.writeFile(path.join(tmp, 'src', 'index.ts'), '');
    await fs.writeFile(path.join(tmp, 'hostinger', 'index.html'), '');

    const found = await walk(tmp);
    expect(found.some((f) => f.includes('hostinger'))).toBe(false);
    expect(found.some((f) => f.endsWith('index.ts'))).toBe(true);
  });

  it('excludes files matching wildcard patterns', async () => {
    await fs.writeFile(path.join(tmp, '.gitignore'), '*.zip\n');
    await ensureDir(path.join(tmp, 'src'));
    await fs.writeFile(path.join(tmp, 'src', 'app.ts'), '');
    await fs.writeFile(path.join(tmp, 'archive.zip'), '');

    const found = await walk(tmp);
    expect(found.some((f) => f.endsWith('.zip'))).toBe(false);
    expect(found.some((f) => f.endsWith('app.ts'))).toBe(true);
  });

  it('includes everything when useGitignore is false', async () => {
    await fs.writeFile(path.join(tmp, '.gitignore'), '/deploy\n');
    await ensureDir(path.join(tmp, 'deploy'));
    await fs.writeFile(path.join(tmp, 'deploy', 'run.sh'), '');

    const found = await walk(tmp, { useGitignore: false });
    expect(found.some((f) => f.includes('deploy'))).toBe(true);
  });

  it('works fine when no .gitignore exists', async () => {
    await ensureDir(path.join(tmp, 'src'));
    await fs.writeFile(path.join(tmp, 'src', 'a.ts'), '');
    const found = await walk(tmp);
    expect(found).toHaveLength(1);
  });
});

describe('listTopLevelDirs with .gitignore', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-gitignore-dirs-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('excludes directories listed in .gitignore', async () => {
    await fs.writeFile(path.join(tmp, '.gitignore'), '/hostinger\n/out\n');
    await ensureDir(path.join(tmp, 'src'));
    await ensureDir(path.join(tmp, 'hostinger'));
    await ensureDir(path.join(tmp, 'out'));

    const dirs = await listTopLevelDirs(tmp);
    expect(dirs).toContain('src');
    expect(dirs).not.toContain('hostinger');
    expect(dirs).not.toContain('out');
  });
});
