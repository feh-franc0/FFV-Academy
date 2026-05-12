import { GeneratedFile } from '../../core/types';
import { ValidationResult } from './index';

// Required section headers per file type
const REQUIRED_HEADERS: Record<string, string[]> = {
  'CLAUDE.md': ['## Stack', '## Conventions', '## Commands'],
  '.cursorrules': ['## Conventions', '## Commands'],
  'AGENTS.md': ['## How to run', '## Conventions'],
  'copilot-instructions.md': ['## Code style'],
  'project.md': ['## Conventions'],
};

const MANIFEST_TAG_RE = /<!-- aitk-manifest: [a-f0-9]+ -->/;

export async function validateStructural(
  file: GeneratedFile,
  _rootPath: string
): Promise<ValidationResult> {
  const base = file.path.split('/').pop() ?? '';
  const content = file.content;

  // Check manifest tag (only for generated instruction files)
  const isInstructionFile =
    base === 'CLAUDE.md' ||
    base === '.cursorrules' ||
    base === 'AGENTS.md' ||
    base.includes('copilot-instructions') ||
    base === 'project.md';

  if (isInstructionFile && !MANIFEST_TAG_RE.test(content)) {
    return { valid: false, reason: 'manifest tag missing — drift detection will break' };
  }

  // Check required headers
  const requiredHeaders = REQUIRED_HEADERS[base] ?? [];
  for (const header of requiredHeaders) {
    if (!content.includes(header)) {
      return { valid: false, reason: `required section "${header}" missing` };
    }
  }

  return { valid: true };
}
