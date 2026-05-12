import { describe, expect, it } from 'vitest';
import { renderClaude } from '../../src/generators/instructions/claude';
import { generateInstructions } from '../../src/generators/instructions';
import { AIInsights, ScanResult } from '../../src/core/types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeScan(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    rootPath: '/tmp/test',
    stack: {
      language: 'typescript',
      frameworks: [],
      packageManager: 'npm',
      scripts: { test: 'vitest', lint: 'eslint' },
      hasTypeScript: true,
      isMonorepo: false,
    },
    structure: {
      rootFolders: ['src'],
      sourceRoot: 'src',
      hasTests: true,
      hasDocs: false,
      hasAdr: false,
      hasSpecs: false,
      fileCount: 30,
      largeFolders: [],
    },
    conventions: { fileNaming: 'kebab-case', consistency: 0.95, importStyle: 'relative' },
    detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
    ...overrides,
  };
}

function makeInsights(overrides: Partial<AIInsights> = {}): AIInsights {
  return {
    modelId: 'claude-3-5-sonnet',
    analyzedAt: '2026-04-26T15:00:00.000Z',
    architecturalStyle: 'layered: services in src/services/, controllers in src/controllers/',
    errorHandling: 'centralized middleware in src/middleware/error.ts',
    asyncPattern: 'async/await throughout',
    validationPattern: 'Zod schemas at route layer',
    internalNaming: 'camelCase functions, PascalCase classes, UPPER_SNAKE_CASE constants',
    knownDebt: [],
    additionalPatterns: '',
    ...overrides,
  };
}

// ─── renderClaude without insights ───────────────────────────────────────────

describe('renderClaude — without insights', () => {
  it('output path is always CLAUDE.md', () => {
    const { path } = renderClaude(makeScan());
    expect(path).toBe('CLAUDE.md');
  });

  it('output does NOT contain the AI-Detected Patterns section', () => {
    const { content } = renderClaude(makeScan());
    expect(content).not.toContain('## AI-Detected Patterns');
  });

  it('output contains the Stack section', () => {
    const { content } = renderClaude(makeScan());
    expect(content).toContain('## Stack');
  });

  it('output contains the Conventions section', () => {
    const { content } = renderClaude(makeScan());
    expect(content).toContain('## Conventions');
  });

  it('output contains the Commands section', () => {
    const { content } = renderClaude(makeScan());
    expect(content).toContain('## Commands');
  });

  it('output ends with a newline', () => {
    const { content } = renderClaude(makeScan());
    expect(content.endsWith('\n')).toBe(true);
  });
});

// ─── renderClaude with insights ──────────────────────────────────────────────

describe('renderClaude — with insights', () => {
  it('output contains the ## AI-Detected Patterns header', () => {
    const { content } = renderClaude(makeScan(), makeInsights());
    expect(content).toContain('## AI-Detected Patterns');
  });

  it('rendered header quotes the modelId in backticks', () => {
    const { content } = renderClaude(makeScan(), makeInsights({ modelId: 'gpt-4o' }));
    expect(content).toContain('`gpt-4o`');
  });

  it('rendered header shows the date portion of analyzedAt (YYYY-MM-DD)', () => {
    const { content } = renderClaude(makeScan(), makeInsights({ analyzedAt: '2026-04-26T15:00:00.000Z' }));
    expect(content).toContain('2026-04-26');
    expect(content).not.toContain('T15:00:00');
  });

  it('architecturalStyle value appears in the output', () => {
    const style = 'hexagonal: ports in src/ports/, adapters in src/adapters/';
    const { content } = renderClaude(makeScan(), makeInsights({ architecturalStyle: style }));
    expect(content).toContain(style);
  });

  it('errorHandling value appears in the output', () => {
    const handling = 'Result<T, E> pattern throughout';
    const { content } = renderClaude(makeScan(), makeInsights({ errorHandling: handling }));
    expect(content).toContain(handling);
  });

  it('asyncPattern value appears in the output', () => {
    const pattern = 'callback-based with promisify wrappers';
    const { content } = renderClaude(makeScan(), makeInsights({ asyncPattern: pattern }));
    expect(content).toContain(pattern);
  });

  it('validationPattern value appears in the output', () => {
    const validation = 'class-validator DTOs with NestJS pipes';
    const { content } = renderClaude(makeScan(), makeInsights({ validationPattern: validation }));
    expect(content).toContain(validation);
  });

  it('internalNaming value appears in the output', () => {
    const naming = 'snake_case variables, PascalCase types, SCREAMING_SNAKE constants';
    const { content } = renderClaude(makeScan(), makeInsights({ internalNaming: naming }));
    expect(content).toContain(naming);
  });

  it('does NOT render ### Known debt section when knownDebt is empty', () => {
    const { content } = renderClaude(makeScan(), makeInsights({ knownDebt: [] }));
    expect(content).not.toContain('### Known debt');
  });

  it('renders ### Known debt section when knownDebt has items', () => {
    const debt = ['TODO comments in src/legacy/', 'inconsistent error handling in utils/'];
    const { content } = renderClaude(makeScan(), makeInsights({ knownDebt: debt }));
    expect(content).toContain('### Known debt');
  });

  it('each knownDebt item is rendered as a markdown bullet (- item)', () => {
    const debt = ['first debt item', 'second debt item'];
    const { content } = renderClaude(makeScan(), makeInsights({ knownDebt: debt }));
    expect(content).toContain('- first debt item');
    expect(content).toContain('- second debt item');
  });

  it('does NOT render ### Additional patterns when additionalPatterns is empty string', () => {
    const { content } = renderClaude(makeScan(), makeInsights({ additionalPatterns: '' }));
    expect(content).not.toContain('### Additional patterns');
  });

  it('renders ### Additional patterns when additionalPatterns is non-empty', () => {
    const extra = 'uses custom event bus for cross-service communication';
    const { content } = renderClaude(makeScan(), makeInsights({ additionalPatterns: extra }));
    expect(content).toContain('### Additional patterns');
    expect(content).toContain(extra);
  });

  it('AI section appears AFTER the Specs section', () => {
    const { content } = renderClaude(makeScan(), makeInsights());
    const specsIdx = content.indexOf('## Specs');
    const aiIdx = content.indexOf('## AI-Detected Patterns');
    expect(specsIdx).toBeGreaterThan(-1);
    expect(aiIdx).toBeGreaterThan(specsIdx);
  });

  it('fallback insights (all "analysis unavailable") still render the section', () => {
    const insights: AIInsights = {
      modelId: 'claude-3-5-sonnet',
      analyzedAt: new Date().toISOString(),
      architecturalStyle: 'analysis unavailable',
      errorHandling: 'analysis unavailable',
      asyncPattern: 'analysis unavailable',
      validationPattern: 'analysis unavailable',
      internalNaming: 'analysis unavailable',
      knownDebt: [],
      additionalPatterns: '',
    };
    const { content } = renderClaude(makeScan(), insights);
    expect(content).toContain('## AI-Detected Patterns');
    expect(content).toContain('analysis unavailable');
  });
});

// ─── generateInstructions with insights ──────────────────────────────────────

describe('generateInstructions — insights routing', () => {
  it('claude target + insights → CLAUDE.md contains AI-Detected Patterns section', () => {
    const [file] = generateInstructions(makeScan(), ['claude'], makeInsights());
    expect(file.path).toBe('CLAUDE.md');
    expect(file.content).toContain('## AI-Detected Patterns');
  });

  it('cursor target + insights → .cursorrules contains AI-Detected Patterns', () => {
    const [file] = generateInstructions(makeScan(), ['cursor'], makeInsights());
    expect(file.path).toBe('.cursorrules');
    expect(file.content).toContain('## AI-Detected Patterns');
  });

  it('copilot target + insights → copilot-instructions contains AI-Detected Patterns', () => {
    const [file] = generateInstructions(makeScan(), ['copilot'], makeInsights());
    expect(file.path).toBe('.github/copilot-instructions.md');
    expect(file.content).toContain('## AI-Detected Patterns');
  });

  it('amazonq target + insights → amazonq rules file contains AI-Detected Patterns', () => {
    const [file] = generateInstructions(makeScan(), ['amazonq'], makeInsights());
    expect(file.path).toBe('.amazonq/rules/project.md');
    expect(file.content).toContain('## AI-Detected Patterns');
  });

  it('agents target + insights → AGENTS.md contains AI-Detected Patterns', () => {
    const [file] = generateInstructions(makeScan(), ['agents'], makeInsights());
    expect(file.path).toBe('AGENTS.md');
    expect(file.content).toContain('## AI-Detected Patterns');
  });

  it('all targets without insights → no file has AI-Detected Patterns section', () => {
    const files = generateInstructions(makeScan(), ['claude', 'cursor', 'copilot', 'amazonq', 'agents']);
    for (const f of files) {
      expect(f.content).not.toContain('## AI-Detected Patterns');
    }
  });

  it('all targets with insights → every file has the AI section', () => {
    const files = generateInstructions(
      makeScan(),
      ['claude', 'cursor', 'copilot', 'amazonq', 'agents'],
      makeInsights()
    );
    for (const f of files) {
      expect(f.content).toContain('## AI-Detected Patterns');
    }
  });

  it('produces exactly one file per target', () => {
    const targets = ['claude', 'cursor', 'copilot', 'amazonq', 'agents'] as const;
    const files = generateInstructions(makeScan(), [...targets], makeInsights());
    expect(files).toHaveLength(targets.length);
  });
});
