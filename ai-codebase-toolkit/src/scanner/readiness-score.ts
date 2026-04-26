import { ReadinessIssue, ReadinessReport, ScanResult } from '../core/types';

interface Rule {
  id: string;
  weight: number;
  evaluate(scan: ScanResult): { passed: boolean; issue: ReadinessIssue };
}

const RULES: Rule[] = [
  {
    id: 'has-claude-md',
    weight: 12,
    evaluate: (s) => ({
      passed: s.detectedAITools.claude,
      issue: {
        id: 'has-claude-md',
        severity: 'warning',
        title: 'CLAUDE.md missing',
        description: 'Claude Code reads CLAUDE.md as project context. Generate one to anchor the AI.',
        fixCommand: 'aiToolkit.generateInstructions',
      },
    }),
  },
  {
    id: 'has-amazonq-rules',
    weight: 10,
    evaluate: (s) => ({
      passed: s.detectedAITools.amazonq,
      issue: {
        id: 'has-amazonq-rules',
        severity: 'info',
        title: 'Amazon Q rules missing',
        description: 'Amazon Q Developer reads .amazonq/rules/ for context.',
        fixCommand: 'aiToolkit.generateInstructions',
      },
    }),
  },
  {
    id: 'has-copilot-instructions',
    weight: 8,
    evaluate: (s) => ({
      passed: s.detectedAITools.copilot,
      issue: {
        id: 'has-copilot-instructions',
        severity: 'info',
        title: 'Copilot instructions missing',
        description: 'GitHub Copilot honors .github/copilot-instructions.md.',
        fixCommand: 'aiToolkit.generateInstructions',
      },
    }),
  },
  {
    id: 'has-typescript',
    weight: 10,
    evaluate: (s) => ({
      passed: s.stack.hasTypeScript,
      issue: {
        id: 'has-typescript',
        severity: 'info',
        title: 'TypeScript not detected',
        description: 'Strong types reduce AI hallucinations — generated code matches real interfaces instead of guessing shapes.',
      },
    }),
  },
  {
    id: 'has-tests',
    weight: 12,
    evaluate: (s) => ({
      passed: s.structure.hasTests,
      issue: {
        id: 'has-tests',
        severity: 'warning',
        title: 'No tests folder detected',
        description: 'AI mirrors what it sees. Without tests, generated code rarely includes tests.',
        fixCommand: 'aiToolkit.generateTestSuite',
      },
    }),
  },
  {
    id: 'has-docs',
    weight: 8,
    evaluate: (s) => ({
      passed: s.structure.hasDocs,
      issue: {
        id: 'has-docs',
        severity: 'info',
        title: 'No docs/ folder',
        description: 'A documentation site gives AI a strong knowledge base.',
        fixCommand: 'aiToolkit.generateDocsSite',
      },
    }),
  },
  {
    id: 'has-adr',
    weight: 8,
    evaluate: (s) => ({
      passed: s.structure.hasAdr,
      issue: {
        id: 'has-adr',
        severity: 'info',
        title: 'No ADRs',
        description: 'Architecture Decision Records help AI respect past decisions.',
        fixCommand: 'aiToolkit.generateAdr',
      },
    }),
  },
  {
    id: 'has-specs',
    weight: 8,
    evaluate: (s) => ({
      passed: s.structure.hasSpecs,
      issue: {
        id: 'has-specs',
        severity: 'info',
        title: 'No SDD specs',
        description: 'Spec-Driven Development gives AI explicit acceptance criteria.',
        fixCommand: 'aiToolkit.generateSdd',
      },
    }),
  },
  {
    id: 'naming-consistency',
    weight: 12,
    evaluate: (s) => ({
      passed: s.conventions.consistency >= 0.9,
      issue: {
        id: 'naming-consistency',
        severity: s.conventions.consistency < 0.7 ? 'critical' : 'warning',
        title: `File naming consistency low (${Math.round(s.conventions.consistency * 100)}%)`,
        description: `Most files use ${s.conventions.fileNaming}. Align outliers so AI follows the same pattern.`,
      },
    }),
  },
  {
    id: 'no-large-folders',
    weight: 8,
    evaluate: (s) => ({
      passed: s.structure.largeFolders.length === 0,
      issue: {
        id: 'no-large-folders',
        severity: 'warning',
        title: 'Some folders are too large',
        description:
          s.structure.largeFolders
            .map((f) => `${f.path} (${f.count} files)`)
            .join('; ') || 'Sub-divide large folders for better AI comprehension.',
      },
    }),
  },
  {
    id: 'has-agents-md',
    weight: 6,
    evaluate: (s) => ({
      passed: s.detectedAITools.agents,
      issue: {
        id: 'has-agents-md',
        severity: 'info',
        title: 'AGENTS.md missing',
        description: 'Cline / Continue / Aider read AGENTS.md (vendor-neutral).',
        fixCommand: 'aiToolkit.generateInstructions',
      },
    }),
  },
  {
    id: 'has-test-script',
    weight: 4,
    evaluate: (s) => ({
      passed: Boolean(s.stack.scripts.test),
      issue: {
        id: 'has-test-script',
        severity: 'info',
        title: 'No "test" script',
        description: 'Document how to run tests so AI can verify its work.',
      },
    }),
  },
];

export function computeReadiness(scan: ScanResult): ReadinessReport {
  const passed: ReadinessIssue[] = [];
  const issues: ReadinessIssue[] = [];
  let score = 0;
  const total = RULES.reduce((acc, r) => acc + r.weight, 0);

  for (const rule of RULES) {
    const { passed: ok, issue } = rule.evaluate(scan);
    if (ok) {
      passed.push({ ...issue, severity: 'info' });
      score += rule.weight;
    } else {
      issues.push(issue);
    }
  }

  return {
    score: Math.round((score / total) * 100),
    passed,
    issues,
    scannedAt: new Date().toISOString(),
  };
}
