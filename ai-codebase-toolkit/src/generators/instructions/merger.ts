/**
 * Non-destructive merge of generated instruction files.
 *
 * Strategy:
 * - If existing file has no aitk markers (v1 / hand-written): treat the entire
 *   content as user-owned and PREPEND the new generated sections above it.
 *   The user is not asked — their content is always preserved.
 * - If existing file has markers: replace each tool section with the regenerated
 *   version; preserve user and prose sections untouched.
 * - New sections from the generated output that don't yet exist in the file are
 *   APPENDED after the last tool section.
 */

import { Section, hasMarkers, parseSections, wrapSection } from './sections';

export interface MergeResult {
  content: string;
  /** true if the existing file had no markers (first migration) */
  wasV1: boolean;
  /** section IDs that were updated */
  updated: string[];
  /** section IDs that were added (didn't exist before) */
  added: string[];
}

/**
 * Merge a newly generated file with the existing file on disk.
 * @param generated  The fully rendered new file (with markers)
 * @param existing   The current file content on disk (may or may not have markers)
 */
export function mergeWithExisting(generated: string, existing: string): MergeResult {
  if (!hasMarkers(existing)) {
    // V1 file: prepend generated content, keep old content as user block
    const userBlock = `<!-- aitk:user -->\n${existing.trim()}\n<!-- /aitk:user -->`;
    return {
      content: generated.trim() + '\n\n' + userBlock + '\n',
      wasV1: true,
      updated: [],
      added: extractToolIds(generated),
    };
  }

  const existingSections = parseSections(existing);
  const newSections = parseSections(generated);

  // Build a map of new tool sections by ID
  const newToolMap = new Map<string, Section>();
  for (const s of newSections) {
    if (s.type === 'tool' && s.id) newToolMap.set(s.id, s);
  }

  const updated: string[] = [];
  const resultSections: Section[] = [];
  const seenIds = new Set<string>();

  for (const s of existingSections) {
    if (s.type === 'tool' && s.id && newToolMap.has(s.id)) {
      // Replace with new version
      const replacement = newToolMap.get(s.id)!;
      resultSections.push(replacement);
      seenIds.add(s.id);
      updated.push(s.id);
    } else {
      // Keep as-is (user, prose, or unknown tool section)
      resultSections.push(s);
      if (s.type === 'tool' && s.id) seenIds.add(s.id);
    }
  }

  // Append new sections that weren't in the existing file
  const added: string[] = [];
  for (const [id, s] of newToolMap) {
    if (!seenIds.has(id)) {
      resultSections.push(s);
      added.push(id);
    }
  }

  const content = resultSections.map((s) => s.content).join('\n\n').trimEnd() + '\n';
  return { content, wasV1: false, updated, added };
}

/** Extract all tool section IDs from a generated string. */
function extractToolIds(content: string): string[] {
  const ids: string[] = [];
  const re = /<!-- aitk:section:([a-z0-9-]+) -->/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) ids.push(m[1]);
  return ids;
}

/** Generate a section block to be inserted into a markdown file. */
export function generateSection(id: string, content: string | string[]): string {
  return wrapSection(id, Array.isArray(content) ? content.join('\n') : content);
}
