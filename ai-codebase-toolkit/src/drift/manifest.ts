import * as crypto from 'crypto';
import { ScanResult } from '../core/types';

/**
 * Dual-hash strategy:
 *
 * projectHash — fingerprint of the PROJECT STATE (stack, structure, scripts).
 *   Changes when: new dependency installed, framework added, source root moved.
 *   Purpose: "has the project evolved since this file was generated?"
 *
 * fileHash — fingerprint of the GENERATED FILE CONTENT at write time.
 *   Changes when: the file is edited (by the tool or the user).
 *   Purpose: "has the file been modified since generation?" (to detect user edits)
 *
 * Both hashes are embedded in the file so detectDrift can compare them.
 */

const MANIFEST_TAG = 'aitk-manifest';

/** Compute a deterministic hash of the project state. */
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

/** Hash of a file's content — stored to detect user edits. */
export function computeFileHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/** Embed manifest tag in the file comment. */
export function manifestComment(projectHash: string): string {
  return `<!-- ${MANIFEST_TAG}: ${projectHash} -->`;
}

/** Extract the project hash embedded in a file. */
export function extractManifest(content: string): string | null {
  const m = new RegExp(`<!--\\s*${MANIFEST_TAG}:\\s*([a-f0-9]+)\\s*-->`).exec(content);
  return m ? m[1] : null;
}
