import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { generateArchitectureDiagram } from '../../src/generators/architecture-diagram';
import { ScanResult } from '../../src/core/types';

let tmp: string;

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-arch-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

describe('generateArchitectureDiagram', () => {
  it('produces a Mermaid graph TD with nodes for each folder', async () => {
    const src = path.join(tmp, 'src');
    await fs.mkdir(path.join(src, 'feature-a'), { recursive: true });
    await fs.mkdir(path.join(src, 'feature-b'), { recursive: true });
    await fs.writeFile(path.join(src, 'feature-a', 'a.ts'), '');
    await fs.writeFile(path.join(src, 'feature-a', 'b.ts'), '');
    await fs.writeFile(path.join(src, 'feature-b', 'c.ts'), '');

    const scan: ScanResult = {
      rootPath: tmp,
      stack: { language: 'typescript', frameworks: [], packageManager: 'npm', scripts: {}, hasTypeScript: true, isMonorepo: false },
      structure: { rootFolders: ['src'], sourceRoot: 'src', hasTests: false, hasDocs: false, hasAdr: false, hasSpecs: false, fileCount: 3, largeFolders: [] },
      conventions: { fileNaming: 'kebab-case', consistency: 1, importStyle: 'absolute' },
      detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
    };

    const file = await generateArchitectureDiagram(scan, 'docs/architecture');
    expect(file.path).toBe('docs/architecture/source-tree.md');
    expect(file.content).toContain('graph TD');
    expect(file.content).toContain('feature-a');
    expect(file.content).toContain('feature-b');
    expect(file.content).toMatch(/n\d+\["feature-a/);
    expect(file.content).toContain('Total source files: 3');
  });

  it('handles empty source tree', async () => {
    await fs.mkdir(path.join(tmp, 'src'), { recursive: true });
    const scan: ScanResult = {
      rootPath: tmp,
      stack: { language: 'typescript', frameworks: [], packageManager: 'npm', scripts: {}, hasTypeScript: true, isMonorepo: false },
      structure: { rootFolders: ['src'], sourceRoot: 'src', hasTests: false, hasDocs: false, hasAdr: false, hasSpecs: false, fileCount: 0, largeFolders: [] },
      conventions: { fileNaming: 'kebab-case', consistency: 1, importStyle: 'absolute' },
      detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
    };
    const file = await generateArchitectureDiagram(scan, 'docs/architecture');
    expect(file.content).toContain('Total source files: 0');
    expect(file.content).toContain('graph TD');
  });
});
