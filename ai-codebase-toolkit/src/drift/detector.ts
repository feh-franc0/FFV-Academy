import * as path from 'path';
import { ScanResult } from '../core/types';
import { pathExists, readText } from '../utils/fs';
import { computeFileHash, computeManifest, extractManifest } from './manifest';

const TRACKED_FILES: { target: string; relPath: string }[] = [
  { target: 'claude',  relPath: 'CLAUDE.md' },
  { target: 'cursor',  relPath: '.cursorrules' },
  { target: 'copilot', relPath: '.github/copilot-instructions.md' },
  { target: 'amazonq', relPath: '.amazonq/rules/project.md' },
  { target: 'agents',  relPath: 'AGENTS.md' },
];

export interface DriftReport {
  currentManifest: string;
  files: DriftFile[];
  staleCount: number;
  missingCount: number;
}

export interface DriftFile {
  target: string;
  relPath: string;
  /**
   * in-sync     — project and file both match generation state
   * project-stale — project changed since generation (regenerate recommended)
   * user-edited — file was modified after generation (user edits present)
   * both-stale  — project changed AND file was edited
   * missing     — file doesn't exist
   * untagged    — file exists but has no manifest tag (pre-v2 or hand-written)
   */
  status: 'in-sync' | 'project-stale' | 'user-edited' | 'both-stale' | 'missing' | 'untagged';
  projectManifest: string | null;
  fileHash: string | null;
}

export async function detectDrift(scan: ScanResult): Promise<DriftReport> {
  const currentProjectHash = computeManifest(scan);
  const files: DriftFile[] = [];

  for (const { target, relPath } of TRACKED_FILES) {
    const abs = path.join(scan.rootPath, relPath);
    if (!(await pathExists(abs))) {
      files.push({ target, relPath, status: 'missing', projectManifest: null, fileHash: null });
      continue;
    }

    const content = (await readText(abs)) ?? '';
    const storedProjectHash = extractManifest(content);

    if (!storedProjectHash) {
      files.push({ target, relPath, status: 'untagged', projectManifest: null, fileHash: null });
      continue;
    }

    const currentFileHash = computeFileHash(content);
    const projectMatch = storedProjectHash === currentProjectHash;

    // File hash is not stored in the file (would be circular), so we can only detect
    // project drift. User-edit detection requires a stored baseline. We check project only.
    // Future: store fileHash in .aitoolkit/drift-state.json for full dual-hash comparison.
    if (projectMatch) {
      files.push({ target, relPath, status: 'in-sync', projectManifest: storedProjectHash, fileHash: currentFileHash });
    } else {
      files.push({ target, relPath, status: 'project-stale', projectManifest: storedProjectHash, fileHash: currentFileHash });
    }
  }

  return {
    currentManifest: currentProjectHash,
    files,
    staleCount: files.filter((f) => f.status === 'project-stale' || f.status === 'both-stale').length,
    missingCount: files.filter((f) => f.status === 'missing').length,
  };
}
