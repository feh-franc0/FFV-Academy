import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { detectDrift } from '../../src/drift/detector';
import { computeManifest, manifestComment } from '../../src/drift/manifest';
import { generateInstructions } from '../../src/generators/instructions';
import { ScanResult } from '../../src/core/types';

let tmp: string;

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-drift-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function makeScan(rootPath: string, frameworks: string[] = ['next']): ScanResult {
  return {
    rootPath,
    stack: { language: 'typescript', frameworks: frameworks as never, packageManager: 'pnpm', scripts: {}, hasTypeScript: true, isMonorepo: false, testFramework: 'vitest' },
    structure: { rootFolders: ['src'], sourceRoot: 'src', hasTests: true, hasDocs: false, hasAdr: false, hasSpecs: false, fileCount: 10, largeFolders: [] },
    conventions: { fileNaming: 'kebab-case', consistency: 1, importStyle: 'absolute' },
    detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
  };
}

describe('drift detection', () => {
  it('reports all targets as missing when nothing was generated', async () => {
    const report = await detectDrift(makeScan(tmp));
    expect(report.missingCount).toBe(5);
    expect(report.staleCount).toBe(0);
  });

  it('marks generated files as in-sync', async () => {
    const scan = makeScan(tmp);
    const files = generateInstructions(scan, ['claude', 'cursor', 'copilot', 'amazonq', 'agents']);
    for (const f of files) {
      await fs.mkdir(path.dirname(path.join(tmp, f.path)), { recursive: true });
      await fs.writeFile(path.join(tmp, f.path), f.content);
    }
    const report = await detectDrift(scan);
    expect(report.missingCount).toBe(0);
    expect(report.staleCount).toBe(0);
    expect(report.files.every((f) => f.status === 'in-sync')).toBe(true);
  });

  it('marks files as stale when project changes', async () => {
    const scanV1 = makeScan(tmp, ['next']);
    const files = generateInstructions(scanV1, ['claude']);
    for (const f of files) {
      await fs.mkdir(path.dirname(path.join(tmp, f.path)), { recursive: true });
      await fs.writeFile(path.join(tmp, f.path), f.content);
    }
    // Stack evolves — new framework added.
    const scanV2 = makeScan(tmp, ['next', 'react']);
    const report = await detectDrift(scanV2);
    expect(report.staleCount).toBe(1);
    const claude = report.files.find((f) => f.target === 'claude');
    expect(claude?.status).toBe('project-stale');
  });

  it('marks externally-edited (untagged) files', async () => {
    await fs.writeFile(path.join(tmp, 'CLAUDE.md'), '# manually written, no tag');
    const report = await detectDrift(makeScan(tmp));
    const claude = report.files.find((f) => f.target === 'claude');
    expect(claude?.status).toBe('untagged');
  });

  it('manifestComment + extract round-trip via real generator', () => {
    const scan = makeScan(tmp);
    const files = generateInstructions(scan, ['claude']);
    const claude = files[0].content;
    expect(claude).toContain(manifestComment(computeManifest(scan)));
  });
});
