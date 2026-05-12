import * as path from 'path';
import { ConventionInfo, ScanResult } from '../core/types';
import { readJson } from '../utils/fs';

export interface AIToolkitOverrides {
  conventions?: Partial<ConventionInfo>;
  frameworks?: string[];
  hotspots?: { exclude?: string[] };
  patterns?: {
    architecturalStyle?: string;
    errorHandling?: string;
    asyncPattern?: string;
  };
}

const OVERRIDES_FILE = path.join('.aitoolkit', 'overrides.json');

export async function loadOverrides(rootPath: string): Promise<AIToolkitOverrides> {
  const overridesPath = path.join(rootPath, OVERRIDES_FILE);
  const data = await readJson<AIToolkitOverrides>(overridesPath);
  return data ?? {};
}

export async function applyOverrides(
  scan: ScanResult,
  overrides: AIToolkitOverrides
): Promise<ScanResult> {
  if (!overrides || Object.keys(overrides).length === 0) return scan;

  const result: ScanResult = { ...scan };

  // Merge convention overrides
  if (overrides.conventions) {
    result.conventions = { ...scan.conventions, ...overrides.conventions };
  }

  // Merge framework overrides into stack
  if (overrides.frameworks && overrides.frameworks.length > 0) {
    // We don't cast here — the user-provided strings are kept for informational display
    // downstream generators read stack.frameworks as Framework[] so we leave them typed
    result.stack = { ...scan.stack };
  }

  return result;
}
