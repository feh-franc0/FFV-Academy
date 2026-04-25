import { GeneratedFile, ScanResult } from '../../core/types';
import { HEADER_NOTE, buildContext } from './shared';

export function renderCopilot(scan: ScanResult): GeneratedFile {
  const ctx = buildContext(scan);
  const content = `${HEADER_NOTE}
${ctx.manifestTag}

# GitHub Copilot Instructions

This is a ${ctx.stackLine} project (${ctx.frameworksLine}).

## Code style
${ctx.conventionsBlock}

## Project layout
${ctx.structureBlock}

## When generating code
- Prefer the existing test framework (${scan.stack.testFramework ?? 'detect from neighbors'}).
- Place new files following the same naming style as siblings.
- Keep imports consistent with the surrounding files.
- Avoid adding configuration unless explicitly requested.

## Commands
${ctx.scriptsBlock}
`;

  return { path: '.github/copilot-instructions.md', content };
}
