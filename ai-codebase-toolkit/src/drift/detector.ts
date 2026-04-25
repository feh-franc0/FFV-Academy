import * as path from 'path';
import { ScanResult } from '../core/types';
import { pathExists, readText } from '../utils/fs';
import { computeManifest, extractManifest } from './manifest';

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
  status: 'in-sync' | 'stale' | 'missing' | 'untagged';
  manifest: string | null;
}

export async function detectDrift(scan: ScanResult): Promise<DriftReport> {
  const currentManifest = computeManifest(scan);
  const files: DriftFile[] = [];

  for (const { target, relPath } of TRACKED_FILES) {
    const abs = path.join(scan.rootPath, relPath);
    if (!(await pathExists(abs))) {
      files.push({ target, relPath, status: 'missing', manifest: null });
      continue;
    }
    const content = (await readText(abs)) ?? '';
    const found = extractManifest(content);
    if (!found) {
      files.push({ target, relPath, status: 'untagged', manifest: null });
    } else if (found !== currentManifest) {
      files.push({ target, relPath, status: 'stale', manifest: found });
    } else {
      files.push({ target, relPath, status: 'in-sync', manifest: found });
    }
  }

  return {
    currentManifest,
    files,
    staleCount: files.filter((f) => f.status === 'stale').length,
    missingCount: files.filter((f) => f.status === 'missing').length,
  };
}
