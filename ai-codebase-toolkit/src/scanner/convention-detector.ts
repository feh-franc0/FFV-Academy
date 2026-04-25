import * as path from 'path';
import { ConventionInfo, NamingConvention } from '../core/types';
import { walk } from '../utils/fs';

const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.java', '.rs', '.php', '.rb']);

export async function detectConventions(rootPath: string): Promise<ConventionInfo> {
  const files = await walk(rootPath, { maxDepth: 6 });
  const codeFiles = files.filter((f) => CODE_EXT.has(path.extname(f)));

  const counts: Record<NamingConvention, number> = {
    'kebab-case': 0,
    camelCase: 0,
    PascalCase: 0,
    snake_case: 0,
    mixed: 0,
  };

  for (const file of codeFiles) {
    const base = path.basename(file, path.extname(file));
    counts[classify(base)]++;
  }

  const total = codeFiles.length || 1;
  const winner = (Object.entries(counts) as [NamingConvention, number][]).sort(
    ([, a], [, b]) => b - a
  )[0];

  const fileNaming: NamingConvention = winner ? winner[0] : 'mixed';
  const consistency = winner ? winner[1] / total : 0;

  return {
    fileNaming,
    consistency: Number(consistency.toFixed(2)),
    importStyle: 'mixed',
  };
}

function classify(name: string): NamingConvention {
  if (/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(name)) return 'kebab-case';
  if (/^[a-z][a-zA-Z0-9]*$/.test(name) && /[A-Z]/.test(name)) return 'camelCase';
  if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) return 'PascalCase';
  if (/^[a-z][a-z0-9_]*$/.test(name) && name.includes('_')) return 'snake_case';
  return 'mixed';
}
