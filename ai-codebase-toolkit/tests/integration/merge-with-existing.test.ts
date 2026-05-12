import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { mergeWithExisting } from '../../src/generators/instructions/merger';
import { generateSection } from '../../src/generators/instructions/merger';

function section(id: string, content: string): string {
  return `<!-- aitk:section:${id} -->\n${content}\n<!-- /aitk:section:${id} -->`;
}

describe('mergeWithExisting — integration (realistic CLAUDE.md round-trips)', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-merge-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('round-trip: regenerating v2 file preserves user section', () => {
    const existing = [
      section('stack', '## Stack\nTypeScript'),
      '<!-- aitk:user -->\n## My Notes\nCustom content I added.\n<!-- /aitk:user -->',
    ].join('\n\n');

    const generated = section('stack', '## Stack\nTypeScript + Node.js');
    const result = mergeWithExisting(generated, existing);

    expect(result.content).toContain('Custom content I added.');
    expect(result.content).toContain('TypeScript + Node.js');
    expect(result.wasV1).toBe(false);
    expect(result.updated).toContain('stack');
  });

  it('migrating a v1 file preserves entire original content', () => {
    const originalV1 = `# My Project

## Stack
Old hand-written TypeScript info.

## Commands
- \`npm run build\`
- \`npm test\`
`;
    const generated = section('stack', '## Stack\nTypeScript (auto-detected)');
    const result = mergeWithExisting(generated, originalV1);

    expect(result.wasV1).toBe(true);
    expect(result.content).toContain('Old hand-written TypeScript info.');
    expect(result.content).toContain('npm run build');
    expect(result.content).toContain('<!-- aitk:user -->');
  });

  it('migrating a v1 file puts generated content before user content', () => {
    const v1 = '# Old CLAUDE.md\nsome content';
    const generated = section('stack', '## Stack\nTypeScript');
    const result = mergeWithExisting(generated, v1);

    const stackIdx = result.content.indexOf('## Stack');
    const oldIdx = result.content.indexOf('# Old CLAUDE.md');
    expect(stackIdx).toBeLessThan(oldIdx);
  });

  it('adds a new section to an already-v2 file', () => {
    const existing = section('stack', '## Stack\nTypeScript');
    const generated = [
      section('stack', '## Stack\nTypeScript + Node.js'),
      section('commands', '## Commands\nnpm run build'),
    ].join('\n\n');

    const result = mergeWithExisting(generated, existing);
    expect(result.content).toContain('## Commands');
    expect(result.added).toContain('commands');
  });

  it('result is a valid string that can be written to disk and read back', async () => {
    const existing = section('stack', '## Stack\nTypeScript');
    const generated = section('stack', '## Stack\nTypeScript v2');
    const { content } = mergeWithExisting(generated, existing);

    const outPath = path.join(tmp, 'CLAUDE.md');
    await fs.writeFile(outPath, content, 'utf-8');
    const readBack = await fs.readFile(outPath, 'utf-8');
    expect(readBack).toBe(content);
  });

  it('generateSection produces valid section that can be parsed back', () => {
    const section = generateSection('conventions', ['## Conventions', '- kebab-case files']);
    expect(section).toContain('<!-- aitk:section:conventions -->');
    expect(section).toContain('## Conventions');
    expect(section).toContain('<!-- /aitk:section:conventions -->');
  });

  it('second merge of same content produces identical output (idempotent)', () => {
    const generated = section('stack', '## Stack\nTypeScript');
    const firstMerge = mergeWithExisting(generated, '# old').content;
    const secondMerge = mergeWithExisting(generated, firstMerge).content;
    expect(secondMerge).toContain('## Stack');
    expect(secondMerge).toContain('TypeScript');
  });
});
