import * as path from 'path';
import { ScanResult } from '../core/types';
import { pathExists } from '../utils/fs';

export interface DocGap {
  type: 'phantom-path' | 'missing-framework' | 'stale-script';
  description: string;
  severity: 'warning' | 'info';
}

export interface DocGapReport {
  gaps: DocGap[];
  score: number; // 0-100 (100 = no gaps)
}

/**
 * Analyzes a CLAUDE.md (or equivalent context file) for gaps relative to the
 * actual project state reported in the scan result.
 *
 * Checks:
 *  1. phantom-path — backtick-quoted paths that look like files but don't exist
 *  2. missing-framework — frameworks detected in scan but not mentioned in the doc
 *  3. stale-script — scripts detected but not mentioned in the doc (info-level)
 */
export async function analyzeDocGaps(
  scan: ScanResult,
  claudeMdContent: string
): Promise<DocGapReport> {
  const gaps: DocGap[] = [];

  // 1. phantom-path — find backtick-quoted tokens that look like file paths
  const backtickPattern = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  const checkedPaths = new Set<string>();

  while ((match = backtickPattern.exec(claudeMdContent)) !== null) {
    const token = match[1];
    if (looksLikeFilePath(token) && !checkedPaths.has(token)) {
      checkedPaths.add(token);
      const abs = path.resolve(scan.rootPath, token.replace(/^\//, ''));
      const exists = await pathExists(abs);
      if (!exists) {
        gaps.push({
          type: 'phantom-path',
          description: `Path \`${token}\` is referenced in the doc but does not exist on disk.`,
          severity: 'warning',
        });
      }
    }
  }

  // 2. missing-framework — frameworks in scan not mentioned in the doc
  for (const fw of scan.stack.frameworks) {
    if (fw === 'unknown') continue;
    if (!claudeMdContent.toLowerCase().includes(fw.toLowerCase())) {
      gaps.push({
        type: 'missing-framework',
        description: `Framework \`${fw}\` is detected in the project but not mentioned in the doc.`,
        severity: 'warning',
      });
    }
  }

  // 3. stale-script — scripts that exist but aren't mentioned in the doc
  const scriptEntries = Object.entries(scan.stack.scripts) as [string, string | undefined][];
  for (const [key] of scriptEntries) {
    if (!key) continue;
    // Check if the script key appears anywhere in the doc
    if (!claudeMdContent.includes(key)) {
      gaps.push({
        type: 'stale-script',
        description: `Script \`${key}\` exists in the project but is not mentioned in the doc.`,
        severity: 'info',
      });
    }
  }

  const score = computeScore(gaps);
  return { gaps, score };
}

/**
 * Heuristic: a backtick-quoted token looks like a file path if it contains a
 * dot (suggesting an extension) or a slash (suggesting a directory separator),
 * and is not too long to be a realistic path.
 */
function looksLikeFilePath(token: string): boolean {
  if (token.length > 120) return false;
  if (token.includes(' ') && !token.startsWith('./') && !token.startsWith('/')) return false;
  // Must contain a slash or look like filename.ext
  const hasSlash = token.includes('/') || token.includes('\\');
  const hasExtension = /\.\w{1,6}$/.test(token);
  return hasSlash || hasExtension;
}

/**
 * Score: start at 100, deduct for each gap by severity.
 * Warnings cost more than info items.
 */
function computeScore(gaps: DocGap[]): number {
  const warningCost = 10;
  const infoCost = 3;

  let deduction = 0;
  for (const g of gaps) {
    deduction += g.severity === 'warning' ? warningCost : infoCost;
  }
  return Math.max(0, 100 - deduction);
}
