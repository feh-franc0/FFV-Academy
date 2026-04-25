import { GeneratedFile, ScanResult } from '../../core/types';
import { HEADER_NOTE, buildContext } from './shared';

export function renderClaude(scan: ScanResult): GeneratedFile {
  const ctx = buildContext(scan);
  const content = `${HEADER_NOTE}
${ctx.manifestTag}

# Project Context for Claude

## Stack
- Language: ${ctx.stackLine}
- Frameworks: ${ctx.frameworksLine}
- Package manager: ${scan.stack.packageManager}
- Monorepo: ${scan.stack.isMonorepo ? 'yes' : 'no'}

## Structure
${ctx.structureBlock}

## Conventions
${ctx.conventionsBlock}

## Commands
${ctx.scriptsBlock}

## Working agreements
- Always run \`${scan.stack.scripts.test ? scan.stack.packageManager + ' run test' : '<no test script>'}\` after non-trivial changes.
- Match existing file naming (\`${scan.conventions.fileNaming}\`) when creating new files.
- Prefer editing existing modules to creating new ones.
- Keep functions small; extract when a function exceeds ~40 lines.
- Add or update tests in the same change set as the implementation.

## Architecture decisions
${scan.structure.hasAdr ? 'See `docs/adr/` for ADRs. Respect prior decisions; propose a new ADR before reversing one.' : 'No ADRs yet — propose one for non-trivial decisions.'}

## Specs
${scan.structure.hasSpecs ? 'See `docs/specs/` for SDD specs. Treat them as the source of truth for behavior.' : 'No SDD specs yet — propose one before implementing complex features.'}
`;

  return { path: 'CLAUDE.md', content };
}
