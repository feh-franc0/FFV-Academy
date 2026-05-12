import * as fs from 'fs/promises';
import * as path from 'path';
import { GeneratedFile } from '../core/types';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  '.turbo',
  '.cache',
  'coverage',
  '__pycache__',
  '.venv',
  'venv',
  'target',
  'vendor',
]);

interface GitignoreRule {
  matcher: (rel: string, isDir: boolean) => boolean;
  negate: boolean;
}

export function parseGitignoreRules(content: string): GitignoreRule[] {
  const rules: GitignoreRule[] = [];
  for (const line of content.split('\n')) {
    let p = line.trim();
    if (!p || p.startsWith('#')) continue;

    const negate = p.startsWith('!');
    if (negate) p = p.slice(1).trim();

    const dirOnly = p.endsWith('/');
    if (dirOnly) p = p.slice(0, -1);
    if (!p) continue;

    // **/foo matches foo in any subdirectory — treat as unanchored after stripping prefix
    if (p.startsWith('**/')) p = p.slice(3);

    // A pattern is anchored to the root if it contains '/' (other than a leading one)
    const anchored = p.startsWith('/') || p.includes('/');
    if (p.startsWith('/')) p = p.slice(1);

    const regexStr = p
      .split('**')
      .map((part) =>
        part
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '[^/]*')
          .replace(/\?/g, '[^/]')
      )
      .join('.*');

    let regex: RegExp;
    try {
      regex = anchored
        ? new RegExp(`^${regexStr}($|/)`)
        : new RegExp(`(^|/)${regexStr}($|/)`);
    } catch {
      continue;
    }

    rules.push({
      negate,
      matcher: (rel: string, isDir: boolean) => {
        if (dirOnly && !isDir) return false;
        return regex.test(rel);
      },
    });
  }
  return rules;
}

function isIgnoredByRules(rules: GitignoreRule[], rel: string, isDir: boolean): boolean {
  let ignored = false;
  for (const rule of rules) {
    if (rule.matcher(rel, isDir)) {
      ignored = !rule.negate;
    }
  }
  return ignored;
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function readText(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function writeFileSafe(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function writeFiles(rootPath: string, files: GeneratedFile[]): Promise<string[]> {
  const normalRoot = path.resolve(rootPath);
  const written: string[] = [];
  for (const f of files) {
    const absolute = path.resolve(
      path.isAbsolute(f.path) ? f.path : path.join(normalRoot, f.path)
    );
    // Reject any path that escapes the workspace root
    if (!absolute.startsWith(normalRoot + path.sep) && absolute !== normalRoot) {
      throw new Error(`Path traversal detected: "${f.path}" resolves outside workspace.`);
    }
    await writeFileSafe(absolute, f.content);
    written.push(absolute);
  }
  return written;
}

export interface WalkOptions {
  maxDepth?: number;
  ignored?: Set<string>;
  useGitignore?: boolean;
}

export async function walk(
  rootPath: string,
  opts: WalkOptions = {}
): Promise<string[]> {
  const ignored = opts.ignored ?? IGNORED_DIRS;
  const maxDepth = opts.maxDepth ?? 8;
  const useGitignore = opts.useGitignore !== false;
  const results: string[] = [];

  let gitignoreRules: GitignoreRule[] = [];
  if (useGitignore) {
    try {
      const content = await fs.readFile(path.join(rootPath, '.gitignore'), 'utf-8');
      gitignoreRules = parseGitignoreRules(content);
    } catch {
      // no .gitignore — proceed without it
    }
  }

  async function recur(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (ignored.has(entry.name) || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) continue; // skip symlinks to avoid infinite loops
      const isDir = entry.isDirectory();
      const rel = path.relative(rootPath, full);
      if (gitignoreRules.length > 0 && isIgnoredByRules(gitignoreRules, rel, isDir)) continue;
      if (isDir) {
        await recur(full, depth + 1);
      } else if (entry.isFile()) {
        results.push(full);
      }
    }
  }

  await recur(rootPath, 0);
  return results;
}

export async function listTopLevelDirs(rootPath: string): Promise<string[]> {
  let gitignoreRules: GitignoreRule[] = [];
  try {
    const content = await fs.readFile(path.join(rootPath, '.gitignore'), 'utf-8');
    gitignoreRules = parseGitignoreRules(content);
  } catch {
    // no .gitignore
  }

  try {
    const entries = await fs.readdir(rootPath, { withFileTypes: true });
    return entries
      .filter((e) => {
        if (!e.isDirectory() || IGNORED_DIRS.has(e.name) || e.name.startsWith('.')) return false;
        if (gitignoreRules.length > 0 && isIgnoredByRules(gitignoreRules, e.name, true)) return false;
        return true;
      })
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * Idempotently adds `entry` to the root `.gitignore`.
 * Creates the file if it doesn't exist. No-ops if the entry is already present.
 */
export async function ensureGitignoreEntry(rootPath: string, entry: string): Promise<void> {
  const gitignorePath = path.join(rootPath, '.gitignore');
  let existing = '';
  try {
    existing = await fs.readFile(gitignorePath, 'utf-8');
  } catch {
    // file doesn't exist yet — we'll create it
  }
  const lines = existing.split('\n').map((l) => l.trim());
  if (lines.includes(entry)) return;
  const newContent = existing.trimEnd() + (existing ? '\n' : '') + entry + '\n';
  await fs.writeFile(gitignorePath, newContent, 'utf-8');
}

export { IGNORED_DIRS };
