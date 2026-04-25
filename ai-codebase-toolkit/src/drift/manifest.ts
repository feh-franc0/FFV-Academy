import * as crypto from 'crypto';
import { ScanResult } from '../core/types';

/**
 * A "manifest" is a deterministic fingerprint of the project state that
 * matters for AI-instruction files. When this hash changes, the generated
 * CLAUDE.md / .cursorrules / etc. are likely stale.
 *
 * We hash a stable subset of the scan: stack identity, scripts, top-level
 * structure, naming convention. Volatile data (file counts, timestamps) is
 * excluded so the hash doesn't flap on every save.
 */
export function computeManifest(scan: ScanResult): string {
  const subset = {
    language: scan.stack.language,
    frameworks: [...scan.stack.frameworks].sort(),
    packageManager: scan.stack.packageManager,
    scripts: scan.stack.scripts,
    hasTypeScript: scan.stack.hasTypeScript,
    isMonorepo: scan.stack.isMonorepo,
    testFramework: scan.stack.testFramework ?? null,
    sourceRoot: scan.structure.sourceRoot,
    rootFolders: [...scan.structure.rootFolders].sort(),
    fileNaming: scan.conventions.fileNaming,
  };
  const json = JSON.stringify(subset);
  return crypto.createHash('sha256').update(json).digest('hex').slice(0, 16);
}

const MANIFEST_TAG = 'aitk-manifest';

export function manifestComment(hash: string): string {
  return `<!-- ${MANIFEST_TAG}: ${hash} -->`;
}

export function extractManifest(content: string): string | null {
  const m = new RegExp(`<!--\\s*${MANIFEST_TAG}:\\s*([a-f0-9]+)\\s*-->`).exec(content);
  return m ? m[1] : null;
}
