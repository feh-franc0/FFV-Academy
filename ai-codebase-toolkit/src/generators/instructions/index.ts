import { AIInsights, GeneratedFile, InstructionTarget, ScanResult } from '../../core/types';
import { renderAgents } from './agents';
import { renderAmazonQ } from './amazonq';
import { renderClaude } from './claude';
import { renderCopilot } from './copilot';
import { renderCursor } from './cursor';

export function generateInstructions(
  scan: ScanResult,
  targets: InstructionTarget[],
  insights?: AIInsights
): GeneratedFile[] {
  return targets.map((t) => {
    if (t === 'claude') return renderClaude(scan, insights);
    if (t === 'cursor') return renderCursor(scan, insights);
    if (t === 'copilot') return renderCopilot(scan, insights);
    if (t === 'amazonq') return renderAmazonQ(scan, insights);
    return renderAgents(scan, insights);
  });
}
