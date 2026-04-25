import * as path from 'path';
import { AIToolPresence, ScanResult } from '../core/types';
import { pathExists } from '../utils/fs';
import { detectConventions } from './convention-detector';
import { detectStack } from './stack-detector';
import { analyzeStructure } from './structure-analyzer';

export { computeReadiness } from './readiness-score';

export async function scanProject(rootPath: string): Promise<ScanResult> {
  const [stack, structure, conventions, detectedAITools] = await Promise.all([
    detectStack(rootPath),
    analyzeStructure(rootPath),
    detectConventions(rootPath),
    detectAITools(rootPath),
  ]);

  return { rootPath, stack, structure, conventions, detectedAITools };
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
