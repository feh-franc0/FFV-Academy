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
  const written: string[] = [];
  for (const f of files) {
    const absolute = path.isAbsolute(f.path) ? f.path : path.join(rootPath, f.path);
    await writeFileSafe(absolute, f.content);
    written.push(absolute);
  }
  return written;
}

export interface WalkOptions {
  maxDepth?: number;
  ignored?: Set<string>;
}

export async function walk(
  rootPath: string,
  opts: WalkOptions = {}
): Promise<string[]> {
  const ignored = opts.ignored ?? IGNORED_DIRS;
  const maxDepth = opts.maxDepth ?? 8;
  const results: string[] = [];

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
      if (entry.isDirectory()) {
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
  try {
    const entries = await fs.readdir(rootPath, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && !IGNORED_DIRS.has(e.name) && !e.name.startsWith('.'))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

export { IGNORED_DIRS };
