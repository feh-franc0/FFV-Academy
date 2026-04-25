import { GeneratedFile, InstructionTarget, ScanResult } from '../../core/types';
import { renderAgents } from './agents';
import { renderAmazonQ } from './amazonq';
import { renderClaude } from './claude';
import { renderCopilot } from './copilot';
import { renderCursor } from './cursor';

const RENDERERS: Record<InstructionTarget, (s: ScanResult) => GeneratedFile> = {
  claude: renderClaude,
  cursor: renderCursor,
  copilot: renderCopilot,
  amazonq: renderAmazonQ,
  agents: renderAgents,
};

export function generateInstructions(
  scan: ScanResult,
  targets: InstructionTarget[]
): GeneratedFile[] {
  return targets.map((t) => RENDERERS[t](scan));
}
