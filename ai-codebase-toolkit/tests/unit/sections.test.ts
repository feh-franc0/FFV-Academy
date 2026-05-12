import { describe, expect, it } from 'vitest';
import { hasMarkers, parseSections, wrapSection } from '../../src/generators/instructions/sections';

describe('wrapSection', () => {
  it('wraps content with open and close markers', () => {
    const result = wrapSection('stack', 'content here');
    expect(result).toBe('<!-- aitk:section:stack -->\ncontent here\n<!-- /aitk:section:stack -->');
  });

  it('uses the provided id in both markers', () => {
    const result = wrapSection('git-hotspots', 'data');
    expect(result).toContain('<!-- aitk:section:git-hotspots -->');
    expect(result).toContain('<!-- /aitk:section:git-hotspots -->');
  });
});

describe('hasMarkers', () => {
  it('returns true when file contains a tool section marker', () => {
    expect(hasMarkers('<!-- aitk:section:stack -->\n## Stack\n<!-- /aitk:section:stack -->')).toBe(true);
  });

  it('returns true when file contains user block marker', () => {
    expect(hasMarkers('<!-- aitk:user -->\nsome content\n<!-- /aitk:user -->')).toBe(true);
  });

  it('returns false for a plain file with no markers', () => {
    expect(hasMarkers('# My Project\n\nSome content')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(hasMarkers('')).toBe(false);
  });
});

describe('parseSections', () => {
  it('parses a single tool section', () => {
    const content = '<!-- aitk:section:stack -->\n## Stack\nTypeScript\n<!-- /aitk:section:stack -->';
    const sections = parseSections(content);
    expect(sections).toHaveLength(1);
    expect(sections[0].type).toBe('tool');
    expect(sections[0].id).toBe('stack');
    expect(sections[0].content).toContain('## Stack');
  });

  it('parses a user block', () => {
    const content = '<!-- aitk:user -->\nmy custom notes\n<!-- /aitk:user -->';
    const sections = parseSections(content);
    expect(sections).toHaveLength(1);
    expect(sections[0].type).toBe('user');
    expect(sections[0].content).toContain('my custom notes');
  });

  it('parses prose between sections', () => {
    const content = '# Title\n\nSome prose here.\n\n<!-- aitk:section:stack -->\n## Stack\n<!-- /aitk:section:stack -->';
    const sections = parseSections(content);
    const toolSections = sections.filter((s) => s.type === 'tool');
    expect(toolSections).toHaveLength(1);
    expect(toolSections[0].id).toBe('stack');
  });

  it('parses multiple tool sections preserving order', () => {
    const content = [
      '<!-- aitk:section:stack -->',
      '## Stack',
      '<!-- /aitk:section:stack -->',
      '<!-- aitk:section:commands -->',
      '## Commands',
      '<!-- /aitk:section:commands -->',
    ].join('\n');
    const sections = parseSections(content);
    const toolIds = sections.filter((s) => s.type === 'tool').map((s) => s.id);
    expect(toolIds).toEqual(['stack', 'commands']);
  });

  it('returns empty array for empty input', () => {
    expect(parseSections('')).toEqual([]);
  });

  it('treats a plain file as prose', () => {
    const sections = parseSections('# Hello\n\nWorld');
    expect(sections.every((s) => s.type === 'prose')).toBe(true);
  });
});
