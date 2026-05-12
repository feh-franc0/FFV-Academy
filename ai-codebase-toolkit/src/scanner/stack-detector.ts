import * as fs from 'fs/promises';
import * as path from 'path';
import { Framework, Language, PackageManager, ProjectScripts, StackInfo } from '../core/types';
import { pathExists, readJson, readText } from '../utils/fs';

interface PackageJson {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: unknown;
}

const FRAMEWORK_MAP: Array<{ dep: string; framework: Framework }> = [
  { dep: 'next', framework: 'next' },
  { dep: '@remix-run/node', framework: 'remix' },
  { dep: '@remix-run/react', framework: 'remix' },
  { dep: '@angular/core', framework: 'angular' },
  { dep: 'react-native', framework: 'react-native' },
  { dep: 'expo', framework: 'expo' },
  { dep: 'react', framework: 'react' },
  { dep: 'vue', framework: 'vue' },
  { dep: 'svelte', framework: 'svelte' },
  { dep: '@sveltejs/kit', framework: 'svelte' },
  { dep: '@nestjs/core', framework: 'nest' },
  { dep: 'fastify', framework: 'fastify' },
  { dep: 'express', framework: 'express' },
  { dep: 'hono', framework: 'hono' },
  { dep: 'vite', framework: 'vite' },
];

const TEST_FRAMEWORKS = ['vitest', 'jest', 'mocha', 'ava', '@playwright/test', 'cypress'];

export async function detectStack(rootPath: string): Promise<StackInfo> {
  const pkgPath = path.join(rootPath, 'package.json');
  const pyProject = path.join(rootPath, 'pyproject.toml');
  const requirements = path.join(rootPath, 'requirements.txt');
  const goMod = path.join(rootPath, 'go.mod');
  const cargo = path.join(rootPath, 'Cargo.toml');
  const composer = path.join(rootPath, 'composer.json');

  if (await pathExists(pkgPath)) return parseNodeStack(rootPath, pkgPath);

  if ((await pathExists(pyProject)) || (await pathExists(requirements))) {
    return detectPythonStack(rootPath, (await pathExists(pyProject)) ? 'poetry' : 'pip');
  }

  if (await pathExists(goMod)) return basicStack('go', 'go');
  if (await pathExists(cargo)) return basicStack('rust', 'cargo');
  if (await pathExists(composer)) return basicStack('php', 'composer');

  // Java — Maven or Gradle
  const pomXml = path.join(rootPath, 'pom.xml');
  const buildGradleKts = path.join(rootPath, 'build.gradle.kts');
  const buildGradle = path.join(rootPath, 'build.gradle');
  if (await pathExists(pomXml)) return detectJavaStack(pomXml, 'maven');
  if (await pathExists(buildGradleKts)) return detectJavaStack(buildGradleKts, 'gradle');
  if (await pathExists(buildGradle)) return detectJavaStack(buildGradle, 'gradle');

  // C# — any .csproj in the root
  const csprojFile = await findFileWithExtension(rootPath, '.csproj');
  if (csprojFile) return detectCSharpStack(csprojFile);

  // C++
  if (await pathExists(path.join(rootPath, 'CMakeLists.txt'))) return basicStack('cpp', 'cmake');

  // C (Makefile as last resort — many other ecosystems also have Makefiles)
  if (await pathExists(path.join(rootPath, 'Makefile'))) return basicStack('c', 'make');

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

async function detectPythonStack(rootPath: string, pm: PackageManager): Promise<StackInfo> {
  const frameworks: Framework[] = [];
  const requirementsContent = await readText(path.join(rootPath, 'requirements.txt')) ?? '';
  const pyprojectContent = await readText(path.join(rootPath, 'pyproject.toml')) ?? '';
  const combined = requirementsContent + pyprojectContent;
  if (/\bdjango\b/i.test(combined)) frameworks.push('django');
  if (/\bfastapi\b/i.test(combined)) frameworks.push('fastapi');
  else if (/\bflask\b/i.test(combined)) frameworks.push('flask');
  return { ...basicStack('python', pm), frameworks };
}

async function detectJavaStack(buildFile: string, pm: PackageManager): Promise<StackInfo> {
  const content = await readText(buildFile) ?? '';
  const frameworks: Framework[] = [];
  if (content.includes('spring-boot') || content.includes('org.springframework')) {
    frameworks.push('spring');
  }
  if (
    content.includes('io.quarkus') ||
    content.includes('quarkus-bom') ||
    content.includes('quarkus-universe')
  ) {
    frameworks.push('quarkus');
  }
  const scripts: ProjectScripts =
    pm === 'maven'
      ? { build: 'mvn package', test: 'mvn test' }
      : { build: './gradlew build', test: './gradlew test' };
  return { language: 'java', frameworks, packageManager: pm, scripts, hasTypeScript: false, isMonorepo: false };
}

async function detectCSharpStack(csprojPath: string): Promise<StackInfo> {
  const content = await readText(csprojPath) ?? '';
  const frameworks: Framework[] = [];
  if (content.includes('Microsoft.AspNetCore.Components')) {
    frameworks.push('blazor');
  } else if (
    content.includes('Microsoft.AspNetCore') ||
    content.includes('Microsoft.NET.Sdk.Web')
  ) {
    frameworks.push('aspnet');
  }
  return {
    language: 'csharp',
    frameworks,
    packageManager: 'dotnet',
    scripts: { build: 'dotnet build', test: 'dotnet test' },
    hasTypeScript: false,
    isMonorepo: false,
  };
}

async function findFileWithExtension(dir: string, ext: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith(ext)) return path.join(dir, e.name);
    }
  } catch {
    // ignore
  }
  return null;
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
