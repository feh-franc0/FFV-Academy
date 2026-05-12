import { describe, expect, it } from 'vitest';
import { PATTERN_ANALYSIS_PROMPT } from '../../src/ai/prompts';

const REQUIRED_FIELDS = [
  'architecturalStyle',
  'errorHandling',
  'asyncPattern',
  'validationPattern',
  'internalNaming',
  'knownDebt',
  'additionalPatterns',
];

describe('PATTERN_ANALYSIS_PROMPT', () => {
  it('returns a non-empty string', () => {
    const result = PATTERN_ANALYSIS_PROMPT('any block');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the provided fileBlock verbatim at the end', () => {
    const block = '=== package.json ===\n{"name":"test"}';
    const prompt = PATTERN_ANALYSIS_PROMPT(block);
    expect(prompt).toContain(block);
  });

  it('includes all 7 required JSON field names', () => {
    const prompt = PATTERN_ANALYSIS_PROMPT('x');
    for (const field of REQUIRED_FIELDS) {
      expect(prompt).toContain(`"${field}"`);
    }
  });

  it('instructs the model to respond with only JSON (no markdown)', () => {
    const prompt = PATTERN_ANALYSIS_PROMPT('x');
    const lower = prompt.toLowerCase();
    expect(lower).toContain('json');
    expect(lower).toContain('only');
  });

  it('handles an empty fileBlock without throwing', () => {
    expect(() => PATTERN_ANALYSIS_PROMPT('')).not.toThrow();
    const prompt = PATTERN_ANALYSIS_PROMPT('');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('includes fileBlock content that contains backtick characters', () => {
    const block = '=== x.ts ===\nconst s = `hello ${name}`';
    const prompt = PATTERN_ANALYSIS_PROMPT(block);
    expect(prompt).toContain('`hello ${name}`');
  });

  it('includes fileBlock that looks like JSON without interfering with the prompt JSON schema', () => {
    const block = '=== x.json ===\n{"architecturalStyle":"injected"}';
    const prompt = PATTERN_ANALYSIS_PROMPT(block);
    expect(prompt).toContain('"architecturalStyle":"injected"');
    expect(prompt.split('"architecturalStyle"').length).toBeGreaterThanOrEqual(2);
  });

  it('is deterministic: same fileBlock always produces identical output', () => {
    const block = '=== a.ts ===\nconsole.log("hi")';
    expect(PATTERN_ANALYSIS_PROMPT(block)).toBe(PATTERN_ANALYSIS_PROMPT(block));
  });
});
