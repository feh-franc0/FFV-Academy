import * as path from 'path';
import { Framework, Language, PackageManager, ProjectScripts, StackInfo } from '../core/types';
import { pathExists, readJson } from '../utils/fs';

interface PackageJson {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: unknown;
}

const FRAMEWORK_MAP: Array<{ dep: string; framework: Framework }> = [
  { dep: 'next', framework: 'next' },
  { dep: 'react-native', framework: 'react-native' },
  { dep: 'expo', framework: 'expo' },
  { dep: 'react', framework: 'react' },
  { dep: 'vue', framework: 'vue' },
  { dep: 'svelte', framework: 'svelte' },
  { dep: '@nestjs/core', framework: 'nest' },
  { dep: 'fastify', framework: 'fastify' },
  { dep: 'express', framework: 'express' },
];

const TEST_FRAMEWORKS = ['vitest', 'jest', 'mocha', 'ava', '@playwright/test', 'cypress'];

export async function detectStack(rootPath: string): Promise<StackInfo> {
  const pkgPath = path.join(rootPath, 'package.json');
  const pyProject = path.join(rootPath, 'pyproject.toml');
  const requirements = path.join(rootPath, 'requirements.txt');
  const goMod = path.join(rootPath, 'go.mod');
  const cargo = path.join(rootPath, 'Cargo.toml');
  const composer = path.join(rootPath, 'composer.json');

  if (await pathExists(pkgPath)) {
    return parseNodeStack(rootPath, pkgPath);
  }

  if ((await pathExists(pyProject)) || (await pathExists(requirements))) {
    return basicStack('python', (await pathExists(pyProject)) ? 'poetry' : 'pip');
  }

  if (await pathExists(goMod)) return basicStack('go', 'go');
  if (await pathExists(cargo)) return basicStack('rust', 'cargo');
  if (await pathExists(composer)) return basicStack('php', 'composer');

  return basicStack('unknown', 'unknown');
}

function basicStack(language: Language, pm: PackageManager): StackInfo {
  return {
    language,
    frameworks: [],
    packageManager: pm,
    scripts: {},
    hasTypeScript: false,
    isMonorepo: false,
  };
}

async function parseNodeStack(rootPath: string, pkgPath: string): Promise<StackInfo> {
  const pkg = (await readJson<PackageJson>(pkgPath)) ?? {};
  const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

  const frameworks: Framework[] = [];
  for (const { dep, framework } of FRAMEWORK_MAP) {
    if (allDeps[dep] && !frameworks.includes(framework)) frameworks.push(framework);
  }

  const hasTypeScript =
    Boolean(allDeps['typescript']) || (await pathExists(path.join(rootPath, 'tsconfig.json')));

  const testFramework = TEST_FRAMEWORKS.find((t) => allDeps[t]);

  const scripts: ProjectScripts = pickScripts(pkg.scripts ?? {});

  return {
    language: hasTypeScript ? 'typescript' : 'javascript',
    frameworks,
    packageManager: await detectPackageManager(rootPath),
    scripts,
    hasTypeScript,
    isMonorepo: Boolean(pkg.workspaces),
    testFramework,
  };
}

function pickScripts(scripts: Record<string, string>): ProjectScripts {
  return {
    build: scripts['build'],
    test: scripts['test'],
    lint: scripts['lint'],
    format: scripts['format'],
    dev: scripts['dev'],
    start: scripts['start'],
  };
}

async function detectPackageManager(rootPath: string): Promise<PackageManager> {
  if (await pathExists(path.join(rootPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await pathExists(path.join(rootPath, 'yarn.lock'))) return 'yarn';
  if (await pathExists(path.join(rootPath, 'bun.lockb'))) return 'bun';
  return 'npm';
}
