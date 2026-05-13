/**
 * Extrai HUBS e CURRICULUM de frontend/src/lib/curriculum.ts e gera:
 *   - scripts/seeds/hubs.json
 *   - scripts/seeds/trails.json
 *   - scripts/seeds/article-mappings.json  (slug → trail_id + hub_id + xp + readTime + ordem)
 *
 * Como o curriculum.ts é TypeScript, usamos eval JS removendo apenas tipos.
 * Funciona porque o conteúdo é dados estáticos puros.
 */

import { parse } from '@babel/parser';
import traverseDefault from '@babel/traverse';
import * as t from '@babel/types';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const traverse = (traverseDefault as unknown as { default: typeof traverseDefault }).default ?? traverseDefault;

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../..');
const CURRICULUM_PATH = join(REPO_ROOT, 'frontend/src/lib/curriculum.ts');
const SEEDS_DIR = join(REPO_ROOT, 'scripts/seeds');

// ─── Helpers ──────────────────────────────────────────────────────────────

function objToJSON(node: t.ObjectExpression): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const prop of node.properties) {
    if (!t.isObjectProperty(prop)) continue;
    let key: string;
    if (t.isIdentifier(prop.key)) key = prop.key.name;
    else if (t.isStringLiteral(prop.key)) key = prop.key.value;
    else continue;
    obj[key] = valueToJSON(prop.value as t.Expression);
  }
  return obj;
}

function valueToJSON(node: t.Expression | t.PatternLike): unknown {
  if (t.isStringLiteral(node)) return node.value;
  if (t.isNumericLiteral(node)) return node.value;
  if (t.isBooleanLiteral(node)) return node.value;
  if (t.isNullLiteral(node)) return null;
  if (t.isUnaryExpression(node) && node.operator === '-' && t.isNumericLiteral(node.argument)) {
    return -node.argument.value;
  }
  if (t.isTemplateLiteral(node) && node.expressions.length === 0) {
    return node.quasis[0].value.cooked ?? '';
  }
  if (t.isObjectExpression(node)) return objToJSON(node);
  if (t.isArrayExpression(node)) {
    return node.elements.map(el => (el ? valueToJSON(el as t.Expression) : null));
  }
  return null;
}

// ─── Extração ──────────────────────────────────────────────────────────────

interface ExtractResult {
  hubs: Record<string, unknown>[];
  trails: Record<string, unknown>[];
  articles: Record<string, unknown>[];
}

function extract(): ExtractResult {
  const source = readFileSync(CURRICULUM_PATH, 'utf-8');
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  const result: ExtractResult = { hubs: [], trails: [], articles: [] };

  traverse(ast, {
    ExportNamedDeclaration(path) {
      const decl = path.node.declaration;
      if (!t.isVariableDeclaration(decl)) return;
      for (const declarator of decl.declarations) {
        if (!t.isIdentifier(declarator.id)) continue;
        const name = declarator.id.name;
        const init = declarator.init;

        if (name === 'HUBS' && init && t.isArrayExpression(init)) {
          for (const el of init.elements) {
            if (t.isObjectExpression(el)) result.hubs.push(objToJSON(el));
          }
        }

        if (name === 'CURRICULUM' && init && t.isArrayExpression(init)) {
          // Cada elemento é uma Trail; vamos pegar metadata + modules
          for (const trailEl of init.elements) {
            if (!t.isObjectExpression(trailEl)) continue;
            const trail = objToJSON(trailEl);
            result.trails.push(trail);

            // Extrai módulos da trilha
            const trailId = trail.id as string;
            const modules = trail.modules as Record<string, unknown>[] | undefined;
            if (Array.isArray(modules)) {
              modules.forEach((mod, order) => {
                result.articles.push({ ...mod, trail_id: trailId, order });
              });
            }
          }
        }
      }
    },
  });

  return result;
}

function main() {
  console.log(`Extraindo de ${CURRICULUM_PATH}...`);
  const { hubs, trails, articles } = extract();

  console.log(`✓ ${hubs.length} hubs`);
  console.log(`✓ ${trails.length} trails`);
  console.log(`✓ ${articles.length} módulos (com mapeamento hub_id+trail_id)`);

  writeFileSync(join(SEEDS_DIR, 'hubs.json'), JSON.stringify(hubs, null, 2));
  writeFileSync(join(SEEDS_DIR, 'trails.json'), JSON.stringify(trails, null, 2));
  writeFileSync(join(SEEDS_DIR, 'article-mappings.json'), JSON.stringify(articles, null, 2));

  console.log(`\nSalvos em ${SEEDS_DIR}/`);
}

main();
