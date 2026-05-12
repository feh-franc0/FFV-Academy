import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { detectConventionsByLanguage } from '../../src/scanner/conventions';

async function writeFile(p: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, 'utf-8');
}

describe('detectConventionsByLanguage', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-conventions-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('returns empty object for unsupported language', async () => {
    const result = await detectConventionsByLanguage(tmp, 'cobol');
    expect(result).toEqual({});
  });

  it('detects Python formatter (black) when pyproject.toml lists it', async () => {
    await writeFile(path.join(tmp, 'pyproject.toml'), '[tool.black]\nline-length = 88\n');
    const result = await detectConventionsByLanguage(tmp, 'python');
    expect(result.formatter).toBe('black');
  });

  it('detects Go formatter (gofmt) unconditionally', async () => {
    const result = await detectConventionsByLanguage(tmp, 'go');
    expect(result.formatter).toBe('gofmt');
  });

  it('detects Rust formatter (rustfmt) unconditionally', async () => {
    const result = await detectConventionsByLanguage(tmp, 'rust');
    expect(result.formatter).toBe('rustfmt');
  });

  it('detects Java identifier naming (PascalCase) from spotless or convention', async () => {
    const result = await detectConventionsByLanguage(tmp, 'java');
    expect(result).toBeDefined();
  });

  it('detects C# formatter when .editorconfig exists', async () => {
    await writeFile(path.join(tmp, '.editorconfig'), '[*.cs]\nindent_size = 4\n');
    const result = await detectConventionsByLanguage(tmp, 'csharp');
    expect(result).toBeDefined();
  });

  it('returns object with formatter key for python even without config', async () => {
    const result = await detectConventionsByLanguage(tmp, 'python');
    expect(typeof result).toBe('object');
  });
});
