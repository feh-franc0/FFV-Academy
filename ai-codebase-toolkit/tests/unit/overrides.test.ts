import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { loadOverrides, applyOverrides } from '../../src/scanner/overrides';
import { ScanResult } from '../../src/core/types';

function makeScan(rootPath: string): ScanResult {
  return {
    rootPath,
    stack: {
      language: 'typescript',
      frameworks: ['express'],
      packageManager: 'npm',
      scripts: {},
      hasTypeScript: true,
      isMonorepo: false,
    },
    structure: {
      rootFolders: ['src'],
      sourceRoot: 'src',
      hasTests: true,
      hasDocs: false,
      hasAdr: false,
      hasSpecs: false,
      fileCount: 10,
      largeFolders: [],
    },
    conventions: { fileNaming: 'kebab-case', consistency: 1, importStyle: 'relative' },
    detectedAITools: { claude: false, cursor: false, copilot: false, amazonq: false, agents: false },
  };
}

describe('loadOverrides', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-overrides-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('returns empty object when overrides file does not exist', async () => {
    const overrides = await loadOverrides(tmp);
    expect(overrides).toEqual({});
  });

  it('reads conventions from overrides file', async () => {
    const overridesPath = path.join(tmp, '.aitoolkit', 'overrides.json');
    await fs.mkdir(path.dirname(overridesPath), { recursive: true });
    await fs.writeFile(overridesPath, JSON.stringify({ conventions: { fileNaming: 'camelCase' } }));
    const overrides = await loadOverrides(tmp);
    expect(overrides.conventions?.fileNaming).toBe('camelCase');
  });

  it('returns empty object for invalid JSON', async () => {
    const overridesPath = path.join(tmp, '.aitoolkit', 'overrides.json');
    await fs.mkdir(path.dirname(overridesPath), { recursive: true });
    await fs.writeFile(overridesPath, 'not-json');
    const overrides = await loadOverrides(tmp);
    expect(overrides).toEqual({});
  });
});

describe('applyOverrides', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-apply-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('returns original scan when overrides is empty', async () => {
    const scan = makeScan(tmp);
    const result = await applyOverrides(scan, {});
    expect(result).toBe(scan);
  });

  it('merges convention overrides into the scan', async () => {
    const scan = makeScan(tmp);
    const result = await applyOverrides(scan, { conventions: { fileNaming: 'camelCase' } });
    expect(result.conventions.fileNaming).toBe('camelCase');
  });

  it('preserves existing convention fields when overriding only one', async () => {
    const scan = makeScan(tmp);
    const result = await applyOverrides(scan, { conventions: { fileNaming: 'camelCase' } });
    expect(result.conventions.importStyle).toBe('relative');
  });

  it('does not mutate the original scan', async () => {
    const scan = makeScan(tmp);
    await applyOverrides(scan, { conventions: { fileNaming: 'camelCase' } });
    expect(scan.conventions.fileNaming).toBe('kebab-case');
  });
});
