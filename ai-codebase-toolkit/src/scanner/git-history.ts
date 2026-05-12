import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import { GitHistoryInfo } from '../core/types';

const execAsync = promisify(exec);

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', '.next', '.nuxt', '.cache', 'coverage']);

async function runGit(args: string, cwd: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`git ${args}`, { cwd, maxBuffer: 20 * 1024 * 1024 });
    return stdout.trim();
  } catch {
    return null;
  }
}

function shouldSkipFile(filePath: string): boolean {
  const parts = filePath.split('/');
  return parts.some((p) => SKIP_DIRS.has(p));
}

const CONVENTIONAL_TYPES = /^(feat|fix|docs|chore|refactor|test|style|perf|ci)(\([^)]*\))?:/;

export async function analyzeGitHistory(rootPath: string): Promise<GitHistoryInfo> {
  const failureResult: GitHistoryInfo = {
    isGitRepo: false,
    hotFiles: [],
    commitFrequency: 'low',
    conventionalCommits: false,
    lastActivity: new Date().toISOString(),
    totalCommits: 0,
  };

  try {
    // Check if it's a git repo
    const isRepo = await runGit('rev-parse --is-inside-work-tree', rootPath);
    if (isRepo !== 'true') return failureResult;

    // Get total commit count
    const countRaw = await runGit('rev-list --count HEAD', rootPath);
    const totalCommits = countRaw ? parseInt(countRaw, 10) : 0;
    if (isNaN(totalCommits)) return { ...failureResult, isGitRepo: true };

    // Get last activity (ISO date of HEAD commit)
    const lastActivityRaw = await runGit('log -1 --format="%cI"', rootPath);
    const lastActivity = lastActivityRaw ? lastActivityRaw.replace(/"/g, '') : new Date().toISOString();

    // Compute commit frequency: commits per month over the last 100 commits
    const firstCommitDateRaw = await runGit('log --format="%cI" --no-merges -n 100 | tail -1', rootPath);
    let commitsPerMonth = 0;
    if (firstCommitDateRaw && lastActivity) {
      const first = new Date(firstCommitDateRaw.replace(/"/g, ''));
      const last = new Date(lastActivity);
      const diffMs = last.getTime() - first.getTime();
      const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);
      const recentCommits = Math.min(totalCommits, 100);
      commitsPerMonth = diffMonths > 0 ? recentCommits / diffMonths : recentCommits;
    }
    const commitFrequency: 'high' | 'medium' | 'low' =
      commitsPerMonth > 20 ? 'high' : commitsPerMonth > 5 ? 'medium' : 'low';

    // Get recent commits with numstat to find hot files
    const logRaw = await runGit(
      'log --format="COMMIT %H %s" --numstat --no-merges -n 100',
      rootPath
    );

    const fileCounts: Map<string, number> = new Map();
    const commitSubjects: string[] = [];
    let inCommit = false;

    if (logRaw) {
      for (const line of logRaw.split('\n')) {
        if (line.startsWith('COMMIT ')) {
          inCommit = true;
          // Extract subject: everything after the hash
          const rest = line.slice('COMMIT '.length);
          const spaceIdx = rest.indexOf(' ');
          if (spaceIdx !== -1) {
            commitSubjects.push(rest.slice(spaceIdx + 1).trim());
          }
          continue;
        }
        if (!inCommit) continue;
        if (!line.trim()) continue;

        // numstat lines: "additions\tdeletions\tfilepath"
        const parts = line.split('\t');
        if (parts.length === 3) {
          const filePath = parts[2].trim();
          if (filePath && !shouldSkipFile(filePath)) {
            const rel = path.normalize(filePath);
            fileCounts.set(rel, (fileCounts.get(rel) ?? 0) + 1);
          }
        }
      }
    }

    // Top 10 hot files
    const hotFiles = [...fileCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([f]) => f);

    // Check conventional commits: >70% of subjects match pattern
    let conventionalCommits = false;
    if (commitSubjects.length > 0) {
      const matchCount = commitSubjects.filter((s) => CONVENTIONAL_TYPES.test(s)).length;
      conventionalCommits = matchCount / commitSubjects.length > 0.7;
    }

    return {
      isGitRepo: true,
      hotFiles,
      commitFrequency,
      conventionalCommits,
      lastActivity,
      totalCommits,
    };
  } catch {
    return failureResult;
  }
}
