/**
 * Section marker utilities for non-destructive CLAUDE.md regeneration.
 *
 * Each generated section is wrapped with HTML comments so the merger can
 * update tool-owned sections without overwriting user-added content.
 *
 * Format:
 *   <!-- aitk:section:ID -->
 *   ...content...
 *   <!-- /aitk:section:ID -->
 *
 * User-owned content can be wrapped with:
 *   <!-- aitk:user -->
 *   ...content...
 *   <!-- /aitk:user -->
 *
 * Files without any markers are treated as fully user-owned (safe default).
 */

export type SectionType = 'tool' | 'user' | 'prose';

export interface Section {
  type: SectionType;
  id?: string;       // only for type === 'tool'
  content: string;   // raw content including surrounding newlines
}

const TOOL_OPEN_RE = /<!-- aitk:section:([a-z0-9-]+) -->/;
const USER_OPEN = '<!-- aitk:user -->';
const USER_CLOSE = '<!-- /aitk:user -->';

/** Parse a file into an ordered list of sections. */
export function parseSections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const toolMatch = TOOL_OPEN_RE.exec(line);

    if (toolMatch) {
      const id = toolMatch[1];
      const closeTag = `<!-- /aitk:section:${id} -->`;
      const start = i;
      i++;
      while (i < lines.length && !lines[i].includes(closeTag)) i++;
      const end = i; // points to close tag line (or past end)
      const inner = lines.slice(start, end + 1).join('\n');
      sections.push({ type: 'tool', id, content: inner });
      i++;
      continue;
    }

    if (line.includes(USER_OPEN)) {
      const start = i;
      i++;
      while (i < lines.length && !lines[i].includes(USER_CLOSE)) i++;
      const inner = lines.slice(start, i + 1).join('\n');
      sections.push({ type: 'user', content: inner });
      i++;
      continue;
    }

    // accumulate prose lines
    const proseLines: string[] = [];
    while (
      i < lines.length &&
      !TOOL_OPEN_RE.test(lines[i]) &&
      !lines[i].includes(USER_OPEN)
    ) {
      proseLines.push(lines[i]);
      i++;
    }
    const prose = proseLines.join('\n');
    if (prose.trim()) {
      sections.push({ type: 'prose', content: prose });
    } else if (proseLines.length > 0 && sections.length > 0) {
      // preserve blank lines between sections
      sections[sections.length - 1].content += '\n' + prose;
    }
  }

  return sections;
}

/** Wrap content in tool section markers. */
export function wrapSection(id: string, content: string): string {
  return `<!-- aitk:section:${id} -->\n${content}\n<!-- /aitk:section:${id} -->`;
}

/** Check if a file has any aitk markers (v2 format). */
export function hasMarkers(content: string): boolean {
  return content.includes('<!-- aitk:section:') || content.includes(USER_OPEN);
}
