import * as path from 'path';
import { GeneratedFile, ScanResult } from '../core/types';

export interface FeatureScaffoldInput {
  scan: ScanResult;
  parentDir: string; // absolute path of folder where to create the feature
  featureName: string;
}

/**
 * Creates a feature folder with idiomatic files for the detected stack.
 * Files contain TODO(ai) markers — the user's AI fills them in.
 */
export function generateFeatureScaffold(input: FeatureScaffoldInput): GeneratedFile[] {
  const { scan, parentDir, featureName } = input;
  const lang = scan.stack.language;
  const root = path.join(parentDir, featureName);

  if (lang === 'typescript' || lang === 'javascript') {
    return tsScaffold(root, featureName);
  }
  if (lang === 'python') {
    return pyScaffold(root, featureName);
  }
  return tsScaffold(root, featureName);
}

function tsScaffold(root: string, name: string): GeneratedFile[] {
  const cap = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  return [
    {
      path: path.join(root, 'index.ts'),
      content: `export * from './${name}.service';\nexport * from './${name}.types';\n`,
    },
    {
      path: path.join(root, `${name}.types.ts`),
      content: `// TODO(ai): define the ${cap} domain types here.\nexport interface ${cap} {\n  id: string;\n}\n`,
    },
    {
      path: path.join(root, `${name}.service.ts`),
      content: `import { ${cap} } from './${name}.types';\n\n// TODO(ai): implement the ${cap}Service following the pattern of sibling features.\nexport class ${cap}Service {\n  async getById(_id: string): Promise<${cap} | null> {\n    throw new Error('not implemented');\n  }\n}\n`,
    },
    {
      path: path.join(root, `${name}.controller.ts`),
      content: `// TODO(ai): wire HTTP / RPC layer for ${cap}Service.\n`,
    },
    {
      path: path.join(root, '__tests__', `${name}.service.test.ts`),
      content: `import { describe, it, expect } from 'vitest';\nimport { ${cap}Service } from '../${name}.service';\n\ndescribe('${cap}Service', () => {\n  it('returns null when entity is missing', async () => {\n    const svc = new ${cap}Service();\n    await expect(svc.getById('missing')).rejects.toThrow();\n  });\n});\n`,
    },
    {
      path: path.join(root, 'README.md'),
      content: `# ${cap}\n\n_TODO(ai): describe the responsibility, public API, and dependencies of this feature._\n`,
    },
  ];
}

function pyScaffold(root: string, name: string): GeneratedFile[] {
  return [
    { path: path.join(root, '__init__.py'), content: `from .service import ${cap(name)}Service\n` },
    { path: path.join(root, 'types.py'), content: `# TODO(ai): define ${name} domain types\n` },
    {
      path: path.join(root, 'service.py'),
      content: `# TODO(ai): implement ${name} service\n\nclass ${cap(name)}Service:\n    async def get_by_id(self, _id: str):\n        raise NotImplementedError\n`,
    },
    {
      path: path.join(root, 'tests', `test_${name.replace(/-/g, '_')}_service.py`),
      content: `import pytest\n\ndef test_placeholder():\n    assert True\n`,
    },
    { path: path.join(root, 'README.md'), content: `# ${name}\n\n_TODO(ai): describe this feature._\n` },
  ];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
