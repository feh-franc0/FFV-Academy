import * as path from 'path';
import { AIInsights, GeneratedFile, ScanResult } from '../../core/types';
import { HEADER_NOTE, buildContext, entryPointHints, frameworkAgreements } from './shared';
import { generateSection } from './merger';

export function renderClaude(scan: ScanResult, insights?: AIInsights): GeneratedFile {
  const ctx = buildContext(scan);
  const pm = scan.stack.packageManager;
  const testCmd = scan.stack.scripts.test ? `${pm} run test` : null;
  const lintCmd = scan.stack.scripts.lint ? `${pm} run lint` : null;
  const fwAgreements = frameworkAgreements(scan.stack.frameworks);
  const entryHints = entryPointHints(scan);
  const hotspots = hotspotsSection(scan);

  const sections: string[] = [
    // Header: not a section, always at top
    [HEADER_NOTE, ctx.manifestTag, '', '# Project Context for Claude'].join('\n'),

    generateSection('stack', [
      '## Stack',
      `- Language: ${ctx.stackLine}`,
      `- Frameworks: ${ctx.frameworksLine}`,
      `- Package manager: ${pm}`,
      ...(scan.stack.isMonorepo ? ['- Monorepo: yes (multiple packages in one repo)'] : []),
      ...(scan.stack.testFramework ? [`- Test framework: ${scan.stack.testFramework}`] : []),
    ].join('\n')),

    generateSection('structure', [
      '## Structure',
      ctx.structureBlock,
    ].join('\n')),

    ...(entryHints.length > 0
      ? [generateSection('entrypoints', ['## Entry points', ...entryHints].join('\n'))]
      : []),

    ...(hotspots.length > 0
      ? [generateSection('hotspots', ['## Git hotspots', ...hotspots].join('\n'))]
      : []),

    generateSection('conventions', ['## Conventions', ctx.conventionsBlock].join('\n')),

    generateSection('commands', ['## Commands', ctx.scriptsBlock].join('\n')),

    generateSection('agreements', [
      '## Working agreements',
      testCmd
        ? `- Always run \`${testCmd}\` after non-trivial changes.`
        : '- No test script configured — propose adding one before implementing features.',
      ...(lintCmd
        ? [`- Always run \`${lintCmd}\` before finishing; fix all lint errors, never suppress warnings without justification.`]
        : []),
      `- Match existing file naming (\`${scan.conventions.fileNaming}\`) when creating new files.`,
      '- Prefer editing existing modules to creating new ones — check if something similar exists before scaffolding.',
      '- Keep functions focused; extract when a function exceeds ~40 lines or has more than one responsibility.',
      '- Add or update tests in the same commit as the implementation, not as a follow-up.',
      `- Imports: prefer ${scan.conventions.importStyle} imports to match the existing style.`,
      ...fwAgreements,
    ].join('\n')),

    generateSection('adr', [
      '## Architecture decisions',
      scan.structure.hasAdr
        ? 'See `docs/adr/` for ADRs. Respect prior decisions; open a new ADR before reversing one.'
        : 'No ADRs yet — propose one before making non-trivial architectural choices.',
    ].join('\n')),

    generateSection('specs', [
      '## Specs',
      scan.structure.hasSpecs
        ? 'See `docs/specs/` for SDD specs. Treat them as the source of truth for behavior; do not implement features that contradict a spec without updating the spec first.'
        : 'No SDD specs yet — propose one before implementing complex features.',
    ].join('\n')),

    ...(insights ? [generateSection('ai-patterns', aiInsightsBlock(insights))] : []),
  ];

  return { path: 'CLAUDE.md', content: sections.join('\n\n') + '\n' };
}

function hotspotsSection(scan: ScanResult): string[] {
  const hot = scan.gitHistory?.hotFiles ?? [];
  if (hot.length === 0) return [];
  const top = hot.slice(0, 5);
  return [
    '> Files most frequently changed — read these first to understand the core:',
    ...top.map((f) => `- \`${path.normalize(f)}\``),
  ];
}

function aiInsightsBlock(insights: AIInsights): string {
  const lines: string[] = [
    '## AI-Detected Patterns',
    '',
    `> Analyzed by \`${insights.modelId}\` on ${insights.analyzedAt.slice(0, 10)}`,
    '',
    '### Architectural style',
    insights.architecturalStyle,
    '',
    '### Error handling',
    insights.errorHandling,
    '',
    '### Async convention',
    insights.asyncPattern,
    '',
    '### Validation',
    insights.validationPattern,
    '',
    '### Internal naming',
    insights.internalNaming,
  ];

  if (insights.knownDebt.length > 0) {
    lines.push('', '### Known debt');
    for (const item of insights.knownDebt) lines.push(`- ${item}`);
  }

  if (insights.additionalPatterns) {
    lines.push('', '### Additional patterns', insights.additionalPatterns);
  }

  return lines.join('\n');
}

