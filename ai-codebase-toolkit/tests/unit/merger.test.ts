import { describe, expect, it } from 'vitest';
import { mergeWithExisting, generateSection } from '../../src/generators/instructions/merger';

function toolBlock(id: string, content: string): string {
  return `<!-- aitk:section:${id} -->\n${content}\n<!-- /aitk:section:${id} -->`;
}

describe('mergeWithExisting — V1 files (no markers)', () => {
  it('marks wasV1=true for a plain file', () => {
    const result = mergeWithExisting(toolBlock('stack', '## Stack'), '# Old content');
    expect(result.wasV1).toBe(true);
  });

  it('preserves original content inside a user block', () => {
    const result = mergeWithExisting(toolBlock('stack', '## Stack'), '# Old content');
    expect(result.content).toContain('# Old content');
    expect(result.content).toContain('<!-- aitk:user -->');
  });

  it('prepends generated content before the user block', () => {
    const generated = toolBlock('stack', '## Stack');
    const result = mergeWithExisting(generated, 'old content');
    const newIdx = result.content.indexOf('## Stack');
    const oldIdx = result.content.indexOf('old content');
    expect(newIdx).toBeLessThan(oldIdx);
  });

  it('adds all generated section IDs to the added list', () => {
    const generated = [toolBlock('stack', 'a'), toolBlock('commands', 'b')].join('\n\n');
    const result = mergeWithExisting(generated, 'old');
    expect(result.added).toContain('stack');
    expect(result.added).toContain('commands');
    expect(result.updated).toEqual([]);
  });
});

describe('mergeWithExisting — V2 files (with markers)', () => {
  it('marks wasV1=false for a file with markers', () => {
    const existing = toolBlock('stack', '## Stack old');
    const generated = toolBlock('stack', '## Stack new');
    const result = mergeWithExisting(generated, existing);
    expect(result.wasV1).toBe(false);
  });

  it('replaces a tool section with the new version', () => {
    const existing = toolBlock('stack', '## Stack OLD');
    const generated = toolBlock('stack', '## Stack NEW');
    const result = mergeWithExisting(generated, existing);
    expect(result.content).toContain('## Stack NEW');
    expect(result.content).not.toContain('## Stack OLD');
  });

  it('lists replaced section id in updated', () => {
    const existing = toolBlock('stack', 'old');
    const generated = toolBlock('stack', 'new');
    const result = mergeWithExisting(generated, existing);
    expect(result.updated).toContain('stack');
    expect(result.added).toEqual([]);
  });

  it('preserves user block content', () => {
    const existing = [
      toolBlock('stack', 'old'),
      '<!-- aitk:user -->\nmy custom section\n<!-- /aitk:user -->',
    ].join('\n\n');
    const generated = toolBlock('stack', 'new');
    const result = mergeWithExisting(generated, existing);
    expect(result.content).toContain('my custom section');
  });

  it('appends new sections not in the existing file', () => {
    const existing = toolBlock('stack', 'old');
    const generated = [toolBlock('stack', 'new'), toolBlock('commands', 'npm run build')].join('\n\n');
    const result = mergeWithExisting(generated, existing);
    expect(result.content).toContain('npm run build');
    expect(result.added).toContain('commands');
    expect(result.updated).toContain('stack');
  });

  it('does not duplicate sections', () => {
    const existing = toolBlock('stack', 'a');
    const generated = toolBlock('stack', 'b');
    const result = mergeWithExisting(generated, existing);
    const count = (result.content.match(/aitk:section:stack/g) ?? []).length;
    expect(count).toBe(2); // one open, one close
  });
});

describe('generateSection', () => {
  it('wraps lines with section markers', () => {
    const result = generateSection('stack', ['## Stack', 'TypeScript']);
    expect(result).toContain('<!-- aitk:section:stack -->');
    expect(result).toContain('## Stack');
    expect(result).toContain('TypeScript');
    expect(result).toContain('<!-- /aitk:section:stack -->');
  });
});
