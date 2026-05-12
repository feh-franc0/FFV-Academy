import { AIInsights, GeneratedFile, ScanResult } from '../../core/types';
import { HEADER_NOTE, buildContext, entryPointHints, frameworkAgreements } from './shared';

export function renderCopilot(scan: ScanResult, insights?: AIInsights): GeneratedFile {
  const ctx = buildContext(scan);
  const hints = entryPointHints(scan);
  const fwRules = frameworkAgreements(scan.stack.frameworks);
  const lines: string[] = [
    HEADER_NOTE,
    ctx.manifestTag,
    '',
    '# GitHub Copilot Instructions',
    '',
    `This is a ${ctx.stackLine} project (${ctx.frameworksLine}).`,
    '',
    '## Code style',
    ctx.conventionsBlock,
    '',
    '## Project layout',
    ctx.structureBlock,
    '',
    '## When generating code',
    `- Prefer the existing test framework (${scan.stack.testFramework ?? 'detect from neighbors'}).`,
    '- Place new files following the same naming style as siblings.',
    '- Keep imports consistent with the surrounding files.',
    '- Avoid adding configuration unless explicitly requested.',
    ...fwRules,
    '',
    '## Commands',
    ctx.scriptsBlock,
  ];

  if (hints.length > 0) {
    lines.push('', '## Entry points', ...hints);
  }

  if (insights) {
    lines.push(
      '',
      '## AI-Detected Patterns',
      `> Analyzed by \`${insights.modelId}\` on ${insights.analyzedAt.slice(0, 10)}`,
      '',
      `**Architecture:** ${insights.architecturalStyle}`,
      '',
      `**Error handling:** ${insights.errorHandling}`,
      '',
      `**Async:** ${insights.asyncPattern}`,
      '',
      `**Naming:** ${insights.internalNaming}`,
    );
    if (insights.knownDebt.length > 0) {
      lines.push('', '**Known debt:**');
      for (const d of insights.knownDebt) lines.push(`- ${d}`);
    }
  }

  return { path: '.github/copilot-instructions.md', content: lines.join('\n') + '\n' };
}
