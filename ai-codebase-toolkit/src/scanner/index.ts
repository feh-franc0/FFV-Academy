import * as path from 'path';
import { AIToolPresence, ScanResult } from '../core/types';
import { pathExists } from '../utils/fs';
import { detectConventions } from './convention-detector';
import { analyzeGitHistory } from './git-history';
import { detectMonorepo } from './monorepo';
import { applyOverrides, loadOverrides } from './overrides';
import { detectStack } from './stack-detector';
import { analyzeStructure } from './structure-analyzer';
import { findUncoveredFiles } from './test-coverage-gap';

export { computeReadiness } from './readiness-score';

export async function scanProject(rootPath: string): Promise<ScanResult> {
  const [stack, structure, conventions, detectedAITools, gitHistory, monorepo, overrides] =
    await Promise.all([
      detectStack(rootPath),
      analyzeStructure(rootPath),
      detectConventions(rootPath),
      detectAITools(rootPath),
      analyzeGitHistory(rootPath),
      detectMonorepo(rootPath),
      loadOverrides(rootPath),
    ]);

  // Compute coverage gaps only when there's a test setup to compare against
  if (structure.hasTests) {
    const uncovered = await findUncoveredFiles(rootPath, structure.sourceRoot);
    structure.uncoveredFilesCount = uncovered.length;
  } else {
    structure.uncoveredFilesCount = 0;
  }

  const scanResult: ScanResult = {
    rootPath,
    stack,
    structure,
    conventions,
    detectedAITools,
    gitHistory,
    monorepo,
  };

  return applyOverrides(scanResult, overrides);
}

async function detectAITools(rootPath: string): Promise<AIToolPresence> {
  const [claude, cursor, copilot, amazonq, agents] = await Promise.all([
    pathExists(path.join(rootPath, 'CLAUDE.md')),
    pathExists(path.join(rootPath, '.cursorrules')),
    pathExists(path.join(rootPath, '.github', 'copilot-instructions.md')),
    pathExists(path.join(rootPath, '.amazonq', 'rules')),
    pathExists(path.join(rootPath, 'AGENTS.md')),
  ]);
  return { claude, cursor, copilot, amazonq, agents };
}
