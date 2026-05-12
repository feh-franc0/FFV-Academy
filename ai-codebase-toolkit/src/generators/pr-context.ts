import { GeneratedFile, ScanResult } from '../core/types';

/**
 * Generates a PR brief markdown file (`.aitoolkit/pr-brief.md`) from a diff stat
 * and branch name, with relevant CLAUDE.md section hints and a checklist derived
 * from the project's conventions.
 */
export function generatePRContext(
  scan: ScanResult,
  diffStat: string,
  branch: string
): GeneratedFile {
  const naming = scan.conventions.fileNaming;
  const relevantSections = inferRelevantSections(diffStat);
  const additionalItems = buildAdditionalChecklist(scan);

  const content = `# PR Brief — ${branch}

## Changes

\`\`\`
${diffStat.trim()}
\`\`\`

## Relevant CLAUDE.md sections

${relevantSections.length > 0 ? relevantSections.map((s) => `- ${s}`).join('\n') : '- (none detected automatically — review CLAUDE.md manually)'}

## Checklist

- [ ] Tests added or updated
- [ ] Lint passes
- [ ] Naming follows ${naming}
${additionalItems.map((item) => `- [ ] ${item}`).join('\n')}
`;

  return { path: '.aitoolkit/pr-brief.md', content };
}

/**
 * Infers which CLAUDE.md sections might be affected based on paths in the diff stat.
 * Uses simple heuristics on path segments.
 */
function inferRelevantSections(diffStat: string): string[] {
  const sections: Set<string> = new Set();

  const pathPattern = /[\w./-]+\.[a-zA-Z0-9]+/g;
  const paths = diffStat.match(pathPattern) ?? [];

  for (const p of paths) {
    const lower = p.toLowerCase();

    if (lower.includes('test') || lower.includes('spec')) {
      sections.add('Testing');
    }
    if (lower.includes('auth') || lower.includes('login') || lower.includes('session')) {
      sections.add('Authentication / Security');
    }
    if (lower.includes('api') || lower.includes('route') || lower.includes('handler') || lower.includes('endpoint')) {
      sections.add('API / Routes');
    }
    if (lower.includes('model') || lower.includes('schema') || lower.includes('migration') || lower.includes('db')) {
      sections.add('Data Model / Database');
    }
    if (lower.includes('config') || lower.includes('env') || lower.includes('.env')) {
      sections.add('Configuration');
    }
    if (lower.includes('package.json') || lower.includes('go.mod') || lower.includes('pyproject')) {
      sections.add('Dependencies');
    }
    if (lower.includes('docker') || lower.includes('ci') || lower.includes('workflow') || lower.includes('github/workflows')) {
      sections.add('CI / Deployment');
    }
    if (lower.includes('readme') || lower.includes('claude.md') || lower.includes('docs/')) {
      sections.add('Documentation');
    }
    if (lower.includes('component') || lower.includes('ui/') || lower.includes('page') || lower.includes('view')) {
      sections.add('UI Components');
    }
  }

  return [...sections].sort();
}

/**
 * Builds additional checklist items based on scan conventions and stack.
 */
function buildAdditionalChecklist(scan: ScanResult): string[] {
  const items: string[] = [];

  if (scan.conventions.formatter) {
    items.push(`Formatter (${scan.conventions.formatter}) was run`);
  }

  if (scan.conventions.importStyle && scan.conventions.importStyle !== 'mixed') {
    items.push(`Imports use ${scan.conventions.importStyle} style`);
  }

  if (scan.gitHistory?.conventionalCommits) {
    items.push('Commit messages follow Conventional Commits format');
  }

  if (scan.stack.hasTypeScript) {
    items.push('TypeScript build passes without errors (`tsc --noEmit`)');
  }

  if (scan.structure.hasTests) {
    items.push('All existing tests pass');
  }

  return items;
}
