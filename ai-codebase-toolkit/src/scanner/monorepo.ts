import * as fs from 'fs/promises';
import * as path from 'path';
import { Language, MonorepoInfo, MonorepoPackage } from '../core/types';
import { pathExists, readJson, readText } from '../utils/fs';

interface PackageJson {
  name?: string;
  workspaces?: string[] | { packages?: string[] };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface TurboJson {
  pipeline?: Record<string, unknown>;
  tasks?: Record<string, unknown>;
}

interface NxJson {
  version?: number;
  projects?: Record<string, unknown>;
}

interface LernaJson {
  version?: string;
  packages?: string[];
}

async function detectLanguageAtPath(pkgPath: string): Promise<Language> {
  const [hasTsconfig, hasGoMod, hasCargo, hasPyProject, hasRequirements, hasPomXml, hasPkgJson] =
    await Promise.all([
      pathExists(path.join(pkgPath, 'tsconfig.json')),
      pathExists(path.join(pkgPath, 'go.mod')),
      pathExists(path.join(pkgPath, 'Cargo.toml')),
      pathExists(path.join(pkgPath, 'pyproject.toml')),
      pathExists(path.join(pkgPath, 'requirements.txt')),
      pathExists(path.join(pkgPath, 'pom.xml')),
      pathExists(path.join(pkgPath, 'package.json')),
    ]);

  if (hasTsconfig || (hasPkgJson && (await isTypeScriptPackage(pkgPath)))) return 'typescript';
  if (hasPkgJson) return 'javascript';
  if (hasGoMod) return 'go';
  if (hasCargo) return 'rust';
  if (hasPyProject || hasRequirements) return 'python';
  if (hasPomXml) return 'java';
  return 'unknown';
}

async function isTypeScriptPackage(pkgPath: string): Promise<boolean> {
  const pkg = await readJson<PackageJson>(path.join(pkgPath, 'package.json'));
  if (!pkg) return false;
  const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  return Boolean(allDeps['typescript']);
}

async function expandGlob(rootPath: string, pattern: string): Promise<string[]> {
  // Simple glob expansion: supports trailing /* or /**
  // We handle patterns like "packages/*", "apps/*", etc.
  const normalized = pattern.replace(/\\/g, '/');

  if (normalized.endsWith('/*') || normalized.endsWith('/**')) {
    const dirPattern = normalized.slice(0, normalized.lastIndexOf('/'));
    const parentDir = path.join(rootPath, dirPattern);
    try {
      const entries = await fs.readdir(parentDir, { withFileTypes: true });
      return entries
        .filter((e) => e.isDirectory())
        .map((e) => path.join(parentDir, e.name));
    } catch {
      return [];
    }
  }

  // Literal path
  const full = path.join(rootPath, normalized);
  const exists = await pathExists(full);
  return exists ? [full] : [];
}

async function packagesFromWorkspaceGlobs(
  rootPath: string,
  globs: string[]
): Promise<MonorepoPackage[]> {
  const packages: MonorepoPackage[] = [];
  for (const glob of globs) {
    const dirs = await expandGlob(rootPath, glob);
    for (const dir of dirs) {
      const pkgJsonPath = path.join(dir, 'package.json');
      const pkgJson = await readJson<PackageJson>(pkgJsonPath);
      const name = pkgJson?.name ?? path.relative(rootPath, dir);
      const language = await detectLanguageAtPath(dir);
      packages.push({ name, path: path.relative(rootPath, dir), language });
    }
  }
  return packages;
}

async function findFilesNamed(rootPath: string, filename: string, maxDepth = 3): Promise<string[]> {
  const results: string[] = [];

  async function recur(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'vendor') {
        continue;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await recur(full, depth + 1);
      } else if (entry.isFile() && entry.name === filename) {
        results.push(full);
      }
    }
  }

  await recur(rootPath, 0);
  return results;
}

export async function detectMonorepo(rootPath: string): Promise<MonorepoInfo> {
  const none: MonorepoInfo = { type: 'none', packages: [] };

  // Check for multiple go.mod (go-multi)
  const goMods = await findFilesNamed(rootPath, 'go.mod', 3);
  if (goMods.length > 1) {
    const packages: MonorepoPackage[] = goMods.map((modPath) => {
      const dir = path.dirname(modPath);
      const relDir = path.relative(rootPath, dir);
      return {
        name: relDir || path.basename(dir),
        path: relDir || '.',
        language: 'go' as Language,
      };
    });
    return { type: 'go-multi', packages };
  }

  // Check for multiple pom.xml (maven-multi)
  const pomXmls = await findFilesNamed(rootPath, 'pom.xml', 3);
  if (pomXmls.length > 1) {
    const packages: MonorepoPackage[] = pomXmls
      .filter((p) => path.dirname(p) !== rootPath)
      .map((pomPath) => {
        const dir = path.dirname(pomPath);
        const relDir = path.relative(rootPath, dir);
        return {
          name: relDir,
          path: relDir,
          language: 'java' as Language,
        };
      });
    return { type: 'maven-multi', packages };
  }

  // Check package.json for workspaces
  const pkgJson = await readJson<PackageJson>(path.join(rootPath, 'package.json'));
  const workspaces = pkgJson?.workspaces;
  let workspaceGlobs: string[] = [];
  if (Array.isArray(workspaces)) {
    workspaceGlobs = workspaces;
  } else if (workspaces && typeof workspaces === 'object' && Array.isArray(workspaces.packages)) {
    workspaceGlobs = workspaces.packages;
  }

  // Determine monorepo type by config files (turbo > nx > lerna > npm-workspaces)
  const [hasTurbo, hasNx, hasLerna] = await Promise.all([
    pathExists(path.join(rootPath, 'turbo.json')),
    pathExists(path.join(rootPath, 'nx.json')),
    pathExists(path.join(rootPath, 'lerna.json')),
  ]);

  if (hasTurbo) {
    const turboJson = await readJson<TurboJson>(path.join(rootPath, 'turbo.json'));
    // Turborepo typically uses npm/pnpm workspaces for package discovery
    // Augment globs from lerna.json if present, otherwise use workspace globs
    let globs = workspaceGlobs;
    if (!globs.length) globs = ['packages/*', 'apps/*'];
    const packages = await packagesFromWorkspaceGlobs(rootPath, globs);
    void turboJson; // used only for type checking
    return { type: 'turborepo', packages };
  }

  if (hasNx) {
    const nxJson = await readJson<NxJson>(path.join(rootPath, 'nx.json'));
    let globs = workspaceGlobs;
    if (!globs.length && nxJson?.projects) {
      // nx.json may list projects directly
      const packages: MonorepoPackage[] = [];
      for (const [name, projConfig] of Object.entries(nxJson.projects)) {
        const projPath =
          typeof projConfig === 'string'
            ? projConfig
            : typeof projConfig === 'object' && projConfig !== null && 'root' in projConfig
              ? String((projConfig as Record<string, unknown>)['root'])
              : name;
        const absPath = path.join(rootPath, projPath);
        const language = await detectLanguageAtPath(absPath);
        packages.push({ name, path: projPath, language });
      }
      return { type: 'nx', packages };
    }
    if (!globs.length) globs = ['packages/*', 'apps/*', 'libs/*'];
    const packages = await packagesFromWorkspaceGlobs(rootPath, globs);
    return { type: 'nx', packages };
  }

  if (hasLerna) {
    const lernaJson = await readJson<LernaJson>(path.join(rootPath, 'lerna.json'));
    const globs = lernaJson?.packages ?? workspaceGlobs;
    const finalGlobs = globs.length ? globs : ['packages/*'];
    const packages = await packagesFromWorkspaceGlobs(rootPath, finalGlobs);
    return { type: 'lerna', packages };
  }

  if (workspaceGlobs.length > 0) {
    const packages = await packagesFromWorkspaceGlobs(rootPath, workspaceGlobs);
    if (packages.length > 0) {
      return { type: 'npm-workspaces', packages };
    }
  }

  // Check pyproject.toml for tool.hatch or similar (not in spec, just return none)
  return none;
}

async function detectNxWorkspacesFromFile(rootPath: string): Promise<string[] | null> {
  const workspacePath = path.join(rootPath, 'workspace.json');
  const content = await readText(workspacePath);
  if (!content) return null;
  try {
    const json = JSON.parse(content) as { projects?: Record<string, unknown> };
    if (json.projects) return Object.keys(json.projects);
  } catch {
    // ignore
  }
  return null;
}

// Re-export for use in tests
export { detectNxWorkspacesFromFile };
