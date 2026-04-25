import * as path from 'path';
import { StructureInfo } from '../core/types';
import { listTopLevelDirs, pathExists, walk } from '../utils/fs';

const SOURCE_CANDIDATES = ['src', 'app', 'lib', 'packages'];
const TEST_HINTS = ['test', 'tests', '__tests__', 'spec', 'specs', 'e2e'];
const DOC_HINTS = ['docs', 'documentation'];
const ADR_HINTS = ['adr', 'decisions'];
const SPEC_HINTS = ['specs', 'sdd'];

export async function analyzeStructure(rootPath: string): Promise<StructureInfo> {
  const rootFolders = await listTopLevelDirs(rootPath);

  const sourceRoot =
    SOURCE_CANDIDATES.find((c) => rootFolders.includes(c)) ?? rootFolders[0] ?? '.';

  const hasTests = rootFolders.some((f) =>
    TEST_HINTS.some((h) => f.toLowerCase().includes(h))
  );
  const hasDocs = rootFolders.some((f) => DOC_HINTS.includes(f.toLowerCase()));

  const hasAdr =
    (await pathExists(path.join(rootPath, 'docs', 'adr'))) ||
    rootFolders.some((f) => ADR_HINTS.some((h) => f.toLowerCase().includes(h)));

  const hasSpecs =
    (await pathExists(path.join(rootPath, 'docs', 'specs'))) ||
    rootFolders.some((f) => SPEC_HINTS.includes(f.toLowerCase()));

  const allFiles = await walk(rootPath, { maxDepth: 6 });

  const folderCounts = new Map<string, number>();
  for (const file of allFiles) {
    const dir = path.relative(rootPath, path.dirname(file));
    folderCounts.set(dir, (folderCounts.get(dir) ?? 0) + 1);
  }

  const largeFolders = [...folderCounts.entries()]
    .filter(([, count]) => count > 30)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([p, count]) => ({ path: p, count }));

  return {
    rootFolders,
    sourceRoot,
    hasTests,
    hasDocs,
    hasAdr,
    hasSpecs,
    fileCount: allFiles.length,
    largeFolders,
  };
}
