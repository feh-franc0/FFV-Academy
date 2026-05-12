import { GeneratedFile } from '../../core/types';
import { ValidationResult } from './index';

// If AI response is shorter than 20% of original, assume truncation
const MIN_RATIO = 0.20;
// If AI response is empty or tiny, always reject
const MIN_ABSOLUTE_CHARS = 20;

export async function validateLength(
  file: GeneratedFile,
  _rootPath: string
): Promise<ValidationResult> {
  const content = file.content.trim();

  if (content.length < MIN_ABSOLUTE_CHARS) {
    return { valid: false, reason: 'AI response is too short (< 20 chars) — likely empty or failed' };
  }

  return { valid: true };
}

/** Compare improved content against original to detect shrinkage. */
export function validateLengthAgainstOriginal(
  improved: string,
  original: string
): ValidationResult {
  if (original.trim().length === 0) return { valid: true };
  const ratio = improved.trim().length / original.trim().length;
  if (ratio < MIN_RATIO) {
    return {
      valid: false,
      reason: `improved content is only ${Math.round(ratio * 100)}% the size of original — likely truncated`,
    };
  }
  return { valid: true };
}
