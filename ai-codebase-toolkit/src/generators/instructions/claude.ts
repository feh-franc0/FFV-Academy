import { Framework, GeneratedFile, ScanResult } from '../../core/types';
import { HEADER_NOTE, buildContext } from './shared';

export function renderClaude(scan: ScanResult): GeneratedFile {
  const ctx = buildContext(scan);
  const pm = scan.stack.packageManager;
  const testCmd = scan.stack.scripts.test ? `${pm} run test` : null;
  const lintCmd = scan.stack.scripts.lint ? `${pm} run lint` : null;
  const fwAgreements = frameworkAgreements(scan.stack.frameworks);
  const entryHints = entryPointHints(scan);

  const lines: string[] = [
    HEADER_NOTE,
    ctx.manifestTag,
    '',
    '# Project Context for Claude',
    '',
    '## Stack',
    `- Language: ${ctx.stackLine}`,
    `- Frameworks: ${ctx.frameworksLine}`,
    `- Package manager: ${pm}`,
    ...(scan.stack.isMonorepo ? ['- Monorepo: yes (multiple packages in one repo)'] : []),
    ...(scan.stack.testFramework ? [`- Test framework: ${scan.stack.testFramework}`] : []),
    '',
    '## Structure',
    ctx.structureBlock,
    ...(entryHints.length > 0 ? ['', '## Entry points', ...entryHints] : []),
    '',
    '## Conventions',
    ctx.conventionsBlock,
    '',
    '## Commands',
    ctx.scriptsBlock,
    '',
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
    '',
    '## Architecture decisions',
    scan.structure.hasAdr
      ? 'See `docs/adr/` for ADRs. Respect prior decisions; open a new ADR before reversing one.'
      : 'No ADRs yet — propose one before making non-trivial architectural choices.',
    '',
    '## Specs',
    scan.structure.hasSpecs
      ? 'See `docs/specs/` for SDD specs. Treat them as the source of truth for behavior; do not implement features that contradict a spec without updating the spec first.'
      : 'No SDD specs yet — propose one before implementing complex features.',
  ];

  return { path: 'CLAUDE.md', content: lines.join('\n') + '\n' };
}

function entryPointHints(scan: ScanResult): string[] {
  const frameworks = scan.stack.frameworks;
  const src = scan.structure.sourceRoot;

  if (frameworks.includes('next')) {
    return [
      `- Entry: \`${src}/app/\` (App Router) or \`${src}/pages/\` (Pages Router)`,
      '- API routes live in `app/api/` or `pages/api/` — keep them thin, move logic to services.',
    ];
  }
  if (frameworks.includes('nest')) {
    return [
      `- Entry: \`${src}/main.ts\` bootstraps the NestJS app`,
      '- Follow the module → controller → service → repository layering.',
      '- Use constructor injection; never instantiate services manually.',
    ];
  }
  if (frameworks.includes('svelte')) {
    return [`- Entry: \`${src}/routes/+page.svelte\` (SvelteKit) or \`${src}/main.ts\``];
  }
  if (frameworks.includes('vue')) {
    return [
      `- Entry: \`${src}/main.ts\` mounts the root Vue app`,
      '- Use Composition API (`<script setup>`); avoid Options API in new code.',
    ];
  }
  if (frameworks.includes('react') || frameworks.includes('react-native') || frameworks.includes('expo')) {
    return [
      `- Entry: \`${src}/main.tsx\` or \`${src}/index.tsx\``,
      '- Keep components presentational; push side effects into hooks or context.',
    ];
  }
  if (frameworks.includes('express') || frameworks.includes('fastify')) {
    return [
      `- Entry: \`${src}/index.ts\` or \`${src}/app.ts\``,
      '- Keep route handlers thin; delegate business logic to service modules.',
    ];
  }
  if (scan.stack.language === 'go') {
    return [
      '- Entry: `cmd/<app>/main.go`',
      '- Follow standard Go project layout (cmd/, internal/, pkg/).',
      '- Errors are values — handle them explicitly, never ignore.',
    ];
  }
  if (scan.stack.language === 'python') {
    return ['- Entry: `main.py` or check `[tool.poetry.scripts]` in pyproject.toml'];
  }
  if (scan.stack.language === 'rust') {
    return ['- Entry: `src/main.rs` or `src/lib.rs`'];
  }

  return [];
}

function frameworkAgreements(frameworks: Framework[]): string[] {
  const lines: string[] = [];

  if (frameworks.includes('next')) {
    lines.push('- Prefer Server Components; use `"use client"` only when interactivity is required.');
    lines.push('- Data fetching belongs in Server Components or Route Handlers, not in client components.');
  }
  if (frameworks.includes('nest')) {
    lines.push('- Decorate every public endpoint with the appropriate guard and pipe.');
    lines.push('- Validation goes in DTOs with `class-validator`; never validate in service methods.');
  }
  if (frameworks.includes('vue')) {
    lines.push('- Use `<script setup>` and Composition API; avoid mixins and Options API in new code.');
    lines.push('- State that crosses more than 2 components belongs in a Pinia store.');
  }
  if (frameworks.includes('svelte')) {
    lines.push('- Prefer `$state` and `$derived` runes (Svelte 5) over legacy reactive statements.');
  }
  if (frameworks.includes('express') || frameworks.includes('fastify')) {
    lines.push('- Validate all request inputs with a schema (zod, joi, or fastify schemas) at the route layer.');
    lines.push('- Errors propagate via a central error handler — never `res.send()` errors inline.');
  }
  if (frameworks.includes('react') || frameworks.includes('react-native') || frameworks.includes('expo')) {
    lines.push('- Co-locate hooks with the component that owns them unless reused in 3+ places.');
  }

  return lines;
}
