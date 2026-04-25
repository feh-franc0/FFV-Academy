import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runGit(args: string, cwd: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`git ${args}`, { cwd, maxBuffer: 10 * 1024 * 1024 });
    return stdout.trim();
  } catch {
    return null;
  }
}

export async function isGitRepo(cwd: string): Promise<boolean> {
  return (await runGit('rev-parse --is-inside-work-tree', cwd)) === 'true';
}

export async function currentBranch(cwd: string): Promise<string | null> {
  return runGit('rev-parse --abbrev-ref HEAD', cwd);
}

export async function diffAgainst(base: string, cwd: string): Promise<string | null> {
  return runGit(`diff ${base}...HEAD`, cwd);
}

export async function logAgainst(base: string, cwd: string): Promise<string | null> {
  return runGit(`log ${base}...HEAD --oneline`, cwd);
}

export async function defaultBaseBranch(cwd: string): Promise<string> {
  const remoteHead = await runGit('symbolic-ref refs/remotes/origin/HEAD', cwd);
  if (remoteHead) {
    const parts = remoteHead.split('/');
    return parts[parts.length - 1];
  }
  return 'main';
}
