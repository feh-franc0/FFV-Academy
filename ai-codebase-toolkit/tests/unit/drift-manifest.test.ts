import { describe, expect, it } from 'vitest';
import { computeManifest, extractManifest, manifestComment } from '../../src/drift/manifest';
import { ScanResult } from '../../src/core/types';

const base: ScanResult = {
  rootPath: '/p',
  stack: { language: 'typescript', frameworks: ['next'], packageManager: 'pnpm', scripts: { test: 'vitest' }, hasTypeScript: true, isMonorepo: false, testFramework: 'vitest' },
  structure: { rootFolders: ['src'], sourceRoot: 'src', hasTests: true, hasDocs: false, hasAdr: false, hasSpecs: false, fileCount: 100, largeFolders: [] },
  conventions: { fileNaming: 'kebab-case', consistency: 0.9, importStyle: 'absolute' },
  detectedAITools: { claude: true, cursor: false, copilot: false, amazonq: false, agents: false },
};

describe('manifest', () => {
  it('produces stable hash for the same scan', () => {
    expect(computeManifest(base)).toBe(computeManifest(base));
  });

  it('changes when a tracked field changes', () => {
    const a = computeManifest(base);
    const b = computeManifest({ ...base, stack: { ...base.stack, frameworks: ['next', 'react'] } });
    expect(a).not.toBe(b);
  });

  it('does NOT change when only volatile fields change', () => {
    const a = computeManifest(base);
    const b = computeManifest({
      ...base,
      structure: { ...base.structure, fileCount: 999, largeFolders: [{ path: 'x', count: 50 }] },
      detectedAITools: { ...base.detectedAITools, claude: false },
    });
    expect(a).toBe(b);
  });

  it('embeds and extracts the hash via comment', () => {
    const h = computeManifest(base);
    const tag = manifestComment(h);
    expect(extractManifest(`# Title\n${tag}\n\nbody`)).toBe(h);
  });

  it('returns null when no tag present', () => {
    expect(extractManifest('# plain markdown')).toBeNull();
  });
});
