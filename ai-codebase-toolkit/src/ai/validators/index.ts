import { GeneratedFile } from '../../core/types';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface Validator {
  name: string;
  validate(file: GeneratedFile, rootPath: string): Promise<ValidationResult>;
}

export { validateStructural } from './structural';
export { validateLength } from './length';
export { validatePaths } from './path-existence';

import { validateStructural } from './structural';
import { validateLength } from './length';
import { validatePaths } from './path-existence';

const VALIDATORS: Validator[] = [
  { name: 'structural', validate: validateStructural },
  { name: 'length', validate: validateLength },
  { name: 'paths', validate: validatePaths },
];

/** Run all validators. Returns first failure or { valid: true }. */
export async function runValidators(
  file: GeneratedFile,
  rootPath: string
): Promise<ValidationResult> {
  for (const v of VALIDATORS) {
    const result = await v.validate(file, rootPath);
    if (!result.valid) return { valid: false, reason: `[${v.name}] ${result.reason}` };
  }
  return { valid: true };
}
