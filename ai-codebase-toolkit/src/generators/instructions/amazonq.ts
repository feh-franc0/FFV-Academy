import { GeneratedFile, ScanResult } from '../../core/types';
import { HEADER_NOTE, buildContext } from './shared';

export function renderAmazonQ(scan: ScanResult): GeneratedFile {
  const ctx = buildContext(scan);
  const content = `${HEADER_NOTE}
${ctx.manifestTag}

# Amazon Q Developer — Project Rules

## Project
- Stack: ${ctx.stackLine}
- Frameworks: ${ctx.frameworksLine}

## Layout
${ctx.structureBlock}

## Conventions
${ctx.conventionsBlock}

## Build & test
${ctx.scriptsBlock}

## Guardrails
- Do not invent libraries that are not already in dependencies.
- When unsure of a pattern, look at the closest sibling file first.
- Keep PRs focused; one concern per change.
`;

  return { path: '.amazonq/rules/project.md', content };
}
