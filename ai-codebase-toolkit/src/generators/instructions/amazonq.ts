import { AIInsights, GeneratedFile, ScanResult } from '../../core/types';
import { HEADER_NOTE, buildContext, entryPointHints, frameworkAgreements } from './shared';

export function renderAmazonQ(scan: ScanResult, insights?: AIInsights): GeneratedFile {
  const ctx = buildContext(scan);
  const hints = entryPointHints(scan);
  const fwRules = frameworkAgreements(scan.stack.frameworks);
  const lines: string[] = [
    HEADER_NOTE,
    ctx.manifestTag,
    '',
    '# Amazon Q Developer — Project Rules',
    '',
    '## Project',
    `- Stack: ${ctx.stackLine}`,
    `- Frameworks: ${ctx.frameworksLine}`,
    '',
    '## Layout',
    ctx.structureBlock,
    '',
    '## Conventions',
    ctx.conventionsBlock,
    '',
    '## Build & test',
    ctx.scriptsBlock,
  ];

  if (hints.length > 0) {
    lines.push('', '## Entry points', ...hints);
  }

  lines.push(
    '',
    '## Guardrails',
    '- Do not invent libraries that are not already in dependencies.',
    '- When unsure of a pattern, look at the closest sibling file first.',
    '- Keep PRs focused; one concern per change.',
    ...fwRules,
  );

  if (insights) {
    lines.push(
      '',
      '## AI-Detected Patterns',
      `> Analyzed by \`${insights.modelId}\` on ${insights.analyzedAt.slice(0, 10)}`,
      '',
      `- Architecture: ${insights.architecturalStyle}`,
      `- Error handling: ${insights.errorHandling}`,
      `- Async pattern: ${insights.asyncPattern}`,
      `- Validation: ${insights.validationPattern}`,
      `- Internal naming: ${insights.internalNaming}`,
    );
    if (insights.knownDebt.length > 0) {
      lines.push('', '### Known debt');
      for (const d of insights.knownDebt) lines.push(`- ${d}`);
    }
  }

  return { path: '.amazonq/rules/project.md', content: lines.join('\n') + '\n' };
}
