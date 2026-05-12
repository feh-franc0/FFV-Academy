import { AIInsights, GeneratedFile, ScanResult } from '../../core/types';
import { HEADER_NOTE, buildContext, entryPointHints, frameworkAgreements } from './shared';

/**
 * AGENTS.md — convention adopted by Cline, Continue, Aider, Cody and others.
 */
export function renderAgents(scan: ScanResult, insights?: AIInsights): GeneratedFile {
  const ctx = buildContext(scan);
  const hints = entryPointHints(scan);
  const fwRules = frameworkAgreements(scan.stack.frameworks);
  const lines: string[] = [
    HEADER_NOTE,
    ctx.manifestTag,
    '',
    '# AGENTS.md',
    '',
    'A vendor-neutral context file for any AI coding agent.',
    '',
    '## TL;DR',
    `${ctx.stackLine} project using ${ctx.frameworksLine}.`,
    '',
    '## Layout',
    ctx.structureBlock,
  ];

  if (hints.length > 0) {
    lines.push('', '## Entry points', ...hints);
  }

  lines.push(
    '',
    '## How to run',
    ctx.scriptsBlock,
    '',
    '## Conventions',
    ctx.conventionsBlock,
    '',
    '## Definition of done',
    '- Tests added or updated.',
    `- Lint passes (\`${scan.stack.scripts.lint ? scan.stack.packageManager + ' run lint' : '<no lint script>'}\`).`,
    '- No dead code, no commented-out code.',
    '- Public APIs documented inline.',
    ...fwRules,
  );

  if (insights) {
    lines.push(
      '',
      '## AI-Detected Patterns',
      `> Analyzed by \`${insights.modelId}\` on ${insights.analyzedAt.slice(0, 10)}`,
      '',
      `**Architecture:** ${insights.architecturalStyle}`,
      `**Error handling:** ${insights.errorHandling}`,
      `**Async:** ${insights.asyncPattern}`,
      `**Validation:** ${insights.validationPattern}`,
      `**Naming:** ${insights.internalNaming}`,
    );
    if (insights.knownDebt.length > 0) {
      lines.push('', '**Known debt:**');
      for (const d of insights.knownDebt) lines.push(`- ${d}`);
    }
    if (insights.additionalPatterns) {
      lines.push('', `**Additional:** ${insights.additionalPatterns}`);
    }
  }

  return { path: 'AGENTS.md', content: lines.join('\n') + '\n' };
}
