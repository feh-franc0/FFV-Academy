import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { scanProject } from '../../src/scanner';

let tmp: string;

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-scan-'));
});

afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

async function seedNextProject(): Promise<void> {
  await fs.writeFile(
    path.join(tmp, 'package.json'),
    JSON.stringify({
      name: 'demo',
      scripts: { dev: 'next dev', build: 'next build', test: 'vitest', lint: 'eslint .' },
      dependencies: { next: '14.0.0', react: '18.0.0' },
      devDependencies: { typescript: '5.0.0', vitest: '1.0.0' },
    })
  );
  await fs.writeFile(path.join(tmp, 'tsconfig.json'), '{}');
  await fs.writeFile(path.join(tmp, 'pnpm-lock.yaml'), '');
  await fs.mkdir(path.join(tmp, 'src', 'features'), { recursive: true });
  await fs.mkdir(path.join(tmp, 'tests'), { recursive: true });
  await fs.mkdir(path.join(tmp, 'docs', 'adr'), { recursive: true });
  for (const f of ['user-service.ts', 'user-controller.ts', 'order-service.ts']) {
    await fs.writeFile(path.join(tmp, 'src', 'features', f), '');
  }
}

describe('scanProject (integration)', () => {
  it('detects Next.js + TypeScript + pnpm + vitest from a real folder', async () => {
    await seedNextProject();
    const scan = await scanProject(tmp);

    expect(scan.stack.language).toBe('typescript');
    expect(scan.stack.frameworks).toContain('next');
    expect(scan.stack.frameworks).toContain('react');
    expect(scan.stack.packageManager).toBe('pnpm');
    expect(scan.stack.testFramework).toBe('vitest');
    expect(scan.stack.hasTypeScript).toBe(true);

    expect(scan.structure.sourceRoot).toBe('src');
    expect(scan.structure.hasTests).toBe(true);
    expect(scan.structure.hasAdr).toBe(true);
    expect(scan.structure.hasDocs).toBe(true);

    expect(scan.conventions.fileNaming).toBe('kebab-case');
    expect(scan.conventions.consistency).toBeGreaterThan(0.9);
  });

  it('handles empty folder gracefully', async () => {
    const scan = await scanProject(tmp);
    expect(scan.stack.language).toBe('unknown');
    expect(scan.structure.fileCount).toBe(0);
  });

  it('detects existing AI tool files', async () => {
    await fs.writeFile(path.join(tmp, 'CLAUDE.md'), '# x');
    await fs.writeFile(path.join(tmp, '.cursorrules'), 'x');
    await fs.mkdir(path.join(tmp, '.amazonq', 'rules'), { recursive: true });
    const scan = await scanProject(tmp);
    expect(scan.detectedAITools.claude).toBe(true);
    expect(scan.detectedAITools.cursor).toBe(true);
    expect(scan.detectedAITools.amazonq).toBe(true);
    expect(scan.detectedAITools.copilot).toBe(false);
  });
});
