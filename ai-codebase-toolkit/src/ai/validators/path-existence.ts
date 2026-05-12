import * as path from 'path';
import { GeneratedFile } from '../../core/types';
import { pathExists } from '../../utils/fs';
import { ValidationResult } from './index';

// Match backtick-quoted paths that look like file paths
const PATH_RE = /`([a-zA-Z0-9_./-]+\.[a-zA-Z]{1,6})`/g;

// Extensions that suggest the string is a file path (not a command or URL)
const FILE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'json', 'md', 'go', 'py', 'java', 'kt', 'cs',
  'cpp', 'c', 'h', 'rs', 'toml', 'yaml', 'yml', 'env', 'txt', 'sh', 'sql',
]);

export async function validatePaths(
  file: GeneratedFile,
  rootPath: string
): Promise<ValidationResult> {
  // Only validate instruction files — source code might reference paths that don't exist yet
  const base = file.path.split('/').pop() ?? '';
  if (
    base !== 'CLAUDE.md' &&
    base !== '.cursorrules' &&
    base !== 'AGENTS.md' &&
    !base.includes('copilot-instructions') &&
    base !== 'project.md'
  ) {
    return { valid: true };
  }

  const invented: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(PATH_RE.source, 'g');

  while ((match = re.exec(file.content)) !== null) {
    const p = match[1];
    const ext = p.split('.').pop()?.toLowerCase() ?? '';
    if (!FILE_EXTENSIONS.has(ext)) continue;
    if (p.startsWith('http') || p.startsWith('www')) continue;

    const abs = path.join(rootPath, p);
    const exists = await pathExists(abs);
    if (!exists) invented.push(p);
  }

  // Allow up to 3 non-existent paths (the AI may reference future files)
  if (invented.length > 3) {
    return {
      valid: false,
      reason: `too many invented paths (${invented.length}): ${invented.slice(0, 3).join(', ')}…`,
    };
  }

  return { valid: true };
}
