import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { validateStructural } from '../../src/ai/validators/structural';
import { validateLength, validateLengthAgainstOriginal } from '../../src/ai/validators/length';
import { validatePaths } from '../../src/ai/validators/path-existence';

const MANIFEST_TAG = '<!-- aitk-manifest: abc123def456 -->';

function makeFile(filePath: string, content: string) {
  return { path: filePath, content };
}

// ─── validateStructural ───────────────────────────────────────────────────────

describe('validateStructural', () => {
  it('accepts CLAUDE.md with manifest and required sections', async () => {
    const content = [
      MANIFEST_TAG,
      '## Stack',
      '## Conventions',
      '## Commands',
    ].join('\n');
    const result = await validateStructural(makeFile('CLAUDE.md', content), '/root');
    expect(result.valid).toBe(true);
  });

  it('rejects CLAUDE.md missing the manifest tag', async () => {
    const content = '## Stack\n## Conventions\n## Commands';
    const result = await validateStructural(makeFile('CLAUDE.md', content), '/root');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('manifest tag');
  });

  it('rejects CLAUDE.md missing a required section', async () => {
    const content = [MANIFEST_TAG, '## Stack', '## Conventions'].join('\n');
    const result = await validateStructural(makeFile('CLAUDE.md', content), '/root');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('## Commands');
  });

  it('accepts a non-instruction file without any checks', async () => {
    const result = await validateStructural(makeFile('tests/my.test.ts', 'short content'), '/root');
    expect(result.valid).toBe(true);
  });

  it('accepts .cursorrules with manifest and required sections', async () => {
    const content = [MANIFEST_TAG, '## Conventions', '## Commands'].join('\n');
    const result = await validateStructural(makeFile('.cursorrules', content), '/root');
    expect(result.valid).toBe(true);
  });
});

// ─── validateLength ───────────────────────────────────────────────────────────

describe('validateLength', () => {
  it('accepts content with 20+ chars', async () => {
    const result = await validateLength(makeFile('CLAUDE.md', 'a'.repeat(25)), '/root');
    expect(result.valid).toBe(true);
  });

  it('rejects content shorter than 20 chars', async () => {
    const result = await validateLength(makeFile('CLAUDE.md', 'short'), '/root');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('too short');
  });

  it('rejects empty content', async () => {
    const result = await validateLength(makeFile('CLAUDE.md', ''), '/root');
    expect(result.valid).toBe(false);
  });

  it('ignores leading/trailing whitespace when checking length', async () => {
    const result = await validateLength(makeFile('CLAUDE.md', '   ' + 'a'.repeat(25) + '   '), '/root');
    expect(result.valid).toBe(true);
  });
});

describe('validateLengthAgainstOriginal', () => {
  it('accepts improved content that is at least 20% of original', () => {
    const original = 'a'.repeat(1000);
    const improved = 'a'.repeat(200); // exactly 20%
    expect(validateLengthAgainstOriginal(improved, original).valid).toBe(true);
  });

  it('rejects content below 20% of original', () => {
    const original = 'a'.repeat(1000);
    const improved = 'a'.repeat(50); // 5%
    const result = validateLengthAgainstOriginal(improved, original);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('truncated');
  });

  it('accepts anything when original is empty', () => {
    expect(validateLengthAgainstOriginal('anything', '').valid).toBe(true);
  });
});

// ─── validatePaths ────────────────────────────────────────────────────────────

describe('validatePaths', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-validator-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('accepts a CLAUDE.md with no backtick file references', async () => {
    const content = [MANIFEST_TAG, '## Stack\nTypeScript\n## Conventions\n## Commands'].join('\n');
    const result = await validatePaths(makeFile('CLAUDE.md', content), tmp);
    expect(result.valid).toBe(true);
  });

  it('accepts up to 3 non-existent paths', async () => {
    const content = '`a.ts` `b.ts` `c.ts`';
    const result = await validatePaths(makeFile('CLAUDE.md', content), tmp);
    expect(result.valid).toBe(true);
  });

  it('rejects when more than 3 paths are invented', async () => {
    const content = '`a.ts` `b.ts` `c.ts` `d.ts`';
    const result = await validatePaths(makeFile('CLAUDE.md', content), tmp);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('invented paths');
  });

  it('accepts existing paths on disk', async () => {
    await fs.writeFile(path.join(tmp, 'real.ts'), 'export {}');
    const content = '`real.ts`';
    const result = await validatePaths(makeFile('CLAUDE.md', content), tmp);
    expect(result.valid).toBe(true);
  });

  it('skips path validation for non-instruction files', async () => {
    const content = '`a.ts` `b.ts` `c.ts` `d.ts` `e.ts`';
    const result = await validatePaths(makeFile('tests/spec.test.ts', content), tmp);
    expect(result.valid).toBe(true);
  });
});
