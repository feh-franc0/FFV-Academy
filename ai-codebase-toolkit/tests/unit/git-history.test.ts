import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { analyzeGitHistory } from '../../src/scanner/git-history';

describe('analyzeGitHistory', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-git-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('returns isGitRepo=false for a non-git directory', async () => {
    const result = await analyzeGitHistory(tmp);
    expect(result.isGitRepo).toBe(false);
    expect(result.hotFiles).toEqual([]);
    expect(result.totalCommits).toBe(0);
  });

  it('returns isGitRepo=true for a git repository', async () => {
    execSync('git init', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: tmp, stdio: 'ignore' });
    await fs.writeFile(path.join(tmp, 'README.md'), '# test');
    execSync('git add .', { cwd: tmp, stdio: 'ignore' });
    execSync('git commit -m "feat: initial commit"', { cwd: tmp, stdio: 'ignore' });

    const result = await analyzeGitHistory(tmp);
    expect(result.isGitRepo).toBe(true);
    expect(result.totalCommits).toBe(1);
  });

  it('detects conventional commits when >70% match the pattern', async () => {
    execSync('git init', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: tmp, stdio: 'ignore' });

    const commits = [
      'feat: add login',
      'fix: correct typo',
      'chore: update deps',
      'refactor: clean up',
      'docs: update readme',
    ];
    for (let i = 0; i < commits.length; i++) {
      await fs.writeFile(path.join(tmp, `file${i}.ts`), `// ${i}`);
      execSync('git add .', { cwd: tmp, stdio: 'ignore' });
      execSync(`git commit -m "${commits[i]}"`, { cwd: tmp, stdio: 'ignore' });
    }

    const result = await analyzeGitHistory(tmp);
    expect(result.conventionalCommits).toBe(true);
  });

  it('detects non-conventional commits when <70% match', async () => {
    execSync('git init', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: tmp, stdio: 'ignore' });

    const commits = ['random stuff', 'more changes', 'wip', 'feat: one good commit'];
    for (let i = 0; i < commits.length; i++) {
      await fs.writeFile(path.join(tmp, `file${i}.ts`), `// ${i}`);
      execSync('git add .', { cwd: tmp, stdio: 'ignore' });
      execSync(`git commit -m "${commits[i]}"`, { cwd: tmp, stdio: 'ignore' });
    }

    const result = await analyzeGitHistory(tmp);
    expect(result.conventionalCommits).toBe(false);
  });

  it('identifies the most changed file as a hot file', async () => {
    execSync('git init', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: tmp, stdio: 'ignore' });

    await fs.writeFile(path.join(tmp, 'hot.ts'), 'v1');
    execSync('git add .', { cwd: tmp, stdio: 'ignore' });
    execSync('git commit -m "feat: init"', { cwd: tmp, stdio: 'ignore' });

    for (let i = 0; i < 4; i++) {
      await fs.writeFile(path.join(tmp, 'hot.ts'), `v${i + 2}`);
      execSync('git add .', { cwd: tmp, stdio: 'ignore' });
      execSync(`git commit -m "fix: update hot ${i}"`, { cwd: tmp, stdio: 'ignore' });
    }

    const result = await analyzeGitHistory(tmp);
    expect(result.hotFiles).toContain('hot.ts');
  });

  it('lastActivity is a parseable date string', async () => {
    execSync('git init', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: tmp, stdio: 'ignore' });
    await fs.writeFile(path.join(tmp, 'f.ts'), 'x');
    execSync('git add .', { cwd: tmp, stdio: 'ignore' });
    execSync('git commit -m "feat: init"', { cwd: tmp, stdio: 'ignore' });

    const result = await analyzeGitHistory(tmp);
    expect(Number.isNaN(Date.parse(result.lastActivity))).toBe(false);
  });
});
