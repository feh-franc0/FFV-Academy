import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { detectMonorepo } from '../../src/scanner/monorepo';

async function mkdir(p: string): Promise<void> {
  await fs.mkdir(p, { recursive: true });
}

async function writeJson(p: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf-8');
}

describe('detectMonorepo', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-monorepo-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('returns type=none for a single-package project', async () => {
    await writeJson(path.join(tmp, 'package.json'), { name: 'single' });
    const result = await detectMonorepo(tmp);
    expect(result.type).toBe('none');
    expect(result.packages).toEqual([]);
  });

  it('detects npm-workspaces', async () => {
    await writeJson(path.join(tmp, 'package.json'), {
      name: 'root',
      workspaces: ['packages/*'],
    });
    await mkdir(path.join(tmp, 'packages', 'core'));
    await writeJson(path.join(tmp, 'packages', 'core', 'package.json'), { name: '@org/core' });

    const result = await detectMonorepo(tmp);
    expect(result.type).toBe('npm-workspaces');
    expect(result.packages.some((p) => p.name === '@org/core')).toBe(true);
  });

  it('detects turborepo', async () => {
    await writeJson(path.join(tmp, 'turbo.json'), { pipeline: {} });
    await writeJson(path.join(tmp, 'package.json'), {
      name: 'root',
      workspaces: ['packages/*'],
    });
    await mkdir(path.join(tmp, 'packages', 'ui'));
    await writeJson(path.join(tmp, 'packages', 'ui', 'package.json'), { name: '@org/ui' });

    const result = await detectMonorepo(tmp);
    expect(result.type).toBe('turborepo');
  });

  it('detects lerna', async () => {
    await writeJson(path.join(tmp, 'lerna.json'), { version: '1.0.0', packages: ['packages/*'] });
    await writeJson(path.join(tmp, 'package.json'), { name: 'root' });
    await mkdir(path.join(tmp, 'packages', 'logger'));
    await writeJson(path.join(tmp, 'packages', 'logger', 'package.json'), { name: 'logger' });

    const result = await detectMonorepo(tmp);
    expect(result.type).toBe('lerna');
    expect(result.packages.some((p) => p.name === 'logger')).toBe(true);
  });

  it('detects go-multi for multiple go.mod files', async () => {
    await fs.writeFile(path.join(tmp, 'go.mod'), 'module root');
    await mkdir(path.join(tmp, 'service-a'));
    await fs.writeFile(path.join(tmp, 'service-a', 'go.mod'), 'module service-a');

    const result = await detectMonorepo(tmp);
    expect(result.type).toBe('go-multi');
    expect(result.packages.every((p) => p.language === 'go')).toBe(true);
  });

  it('packages list is empty for an empty workspaces directory', async () => {
    await writeJson(path.join(tmp, 'package.json'), {
      name: 'root',
      workspaces: ['packages/*'],
    });
    await mkdir(path.join(tmp, 'packages'));

    const result = await detectMonorepo(tmp);
    expect(result.type).toBe('none');
    expect(result.packages).toHaveLength(0);
  });
});
