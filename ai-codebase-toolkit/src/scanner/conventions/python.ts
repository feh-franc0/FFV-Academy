import * as path from 'path';
import { ConventionInfo } from '../../core/types';
import { readText, walk } from '../../utils/fs';

export async function detectPythonConventions(
  rootPath: string
): Promise<Partial<ConventionInfo>> {
  const result: Partial<ConventionInfo> = {};

  // Check pyproject.toml for black/ruff
  const pyprojectContent = await readText(path.join(rootPath, 'pyproject.toml'));
  if (pyprojectContent) {
    if (/\[tool\.black\]/i.test(pyprojectContent)) {
      result.formatter = 'black';
    } else if (/\[tool\.ruff\]/i.test(pyprojectContent)) {
      result.formatter = 'ruff';
    }
  }

  // Check setup.cfg or tox.ini for flake8 / black config
  if (!result.formatter) {
    const setupCfg = await readText(path.join(rootPath, 'setup.cfg'));
    if (setupCfg && /\[tool:black\]/i.test(setupCfg)) {
      result.formatter = 'black';
    }
  }

  // Check file names for snake_case convention
  const files = await walk(rootPath, { maxDepth: 4 });
  const pyFiles = files.filter((f) => f.endsWith('.py'));
  const snakeCaseCount = pyFiles.filter((f) => {
    const base = path.basename(f, '.py');
    return /^[a-z][a-z0-9_]*$/.test(base);
  }).length;

  if (pyFiles.length > 0) {
    const ratio = snakeCaseCount / pyFiles.length;
    if (ratio >= 0.8) {
      result.identifierNaming = 'snake_case functions/vars, PascalCase classes, UPPER_SNAKE constants';
    }
  }

  return result;
}
