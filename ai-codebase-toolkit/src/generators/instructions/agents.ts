import { GeneratedFile, ScanResult } from '../../core/types';
import { HEADER_NOTE, buildContext } from './shared';

/**
 * AGENTS.md — convention adopted by Cline, Continue, Aider, Cody and others.
 */
export function renderAgents(scan: ScanResult): GeneratedFile {
  const ctx = buildContext(scan);
  const content = `${HEADER_NOTE}
${ctx.manifestTag}

# AGENTS.md

A vendor-neutral context file for any AI coding agent.

## TL;DR
${ctx.stackLine} project using ${ctx.frameworksLine}.

## Layout
${ctx.structureBlock}

## How to run
${ctx.scriptsBlock}

## Conventions
${ctx.conventionsBlock}

## Definition of done
- Tests added or updated.
- Lint passes (\`${scan.stack.scripts.lint ? scan.stack.packageManager + ' run lint' : '<no lint script>'}\`).
- No dead code, no commented-out code.
- Public APIs documented inline.
`;

  return { path: 'AGENTS.md', content };
}
