/**
 * Extrai HUBS e CURRICULUM de frontend/src/lib/curriculum/ e gera:
 *   - scripts/seeds/hubs.json
 *   - scripts/seeds/trails.json
 *   - scripts/seeds/article-mappings.json  (slug → trail_id + hub_id + xp + readTime + ordem)
 *   - frontend/src/lib/content-manifest.json  (slugs que TÊM conteúdo escrito)
 *
 * O manifesto existe porque o sitemap precisa saber quais módulos têm conteúdo, e
 * não pode descobrir isso em runtime: `scripts/seeds/` fica na raiz do repo,
 * fora do contexto de build do Docker (o Dockerfile faz `COPY . .` de dentro de
 * frontend/). Sem o manifesto, o sitemap publicava as 415 URLs declaradas — 27
 * das quais respondem 404 e eram entregues ao Google.
 *
 * Como o curriculum.ts é TypeScript, usamos eval JS removendo apenas tipos.
 * Funciona porque o conteúdo é dados estáticos puros.
 */

import { parse } from '@babel/parser';
import traverseDefault from '@babel/traverse';
import * as t from '@babel/types';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const traverse = (traverseDefault as unknown as { default: typeof traverseDefault }).default ?? traverseDefault;

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../..');
// O currículo virou `curriculum/` em ago/2026: `hubs.ts` guarda HUBS e
// `trails/<trailId>.ts` guarda uma trilha cada. Não existe mais um literal
// `export const CURRICULUM = [...]` para o Babel encontrar — ele é montado por
// imports. Este extrator remonta uma fonte sintética equivalente, para não
// reescrever a travessia de AST que já funciona.
const DIR_CURRICULO = join(REPO_ROOT, 'frontend/src/lib/curriculum');
const DIR_TRILHAS = join(DIR_CURRICULO, 'trails');
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

/**
 * Reconstrói, em memória, o arquivo único que este extrator lia antes.
 *
 * A ordem vem de `trails/index.ts` — a mesma que o `CURRICULUM` em execução
 * usa. Derivá-la de `readdirSync` daria ordem alfabética e mudaria a sequência
 * das trilhas no importer sem que nada acusasse.
 */
function fonteSintetica(): string {
  const hubs = readFileSync(join(DIR_CURRICULO, 'hubs.ts'), 'utf-8');
  const indice = readFileSync(join(DIR_TRILHAS, 'index.ts'), 'utf-8');
  const ordem = [...indice.matchAll(/from '\.\/(trail[a-z0-9-]*)'/g)].map(m => m[1]);

  const literais = ordem.map(id => {
    const src = readFileSync(join(DIR_TRILHAS, `${id}.ts`), 'utf-8');
    const ini = src.indexOf('= {');
    const fim = src.lastIndexOf('};');
    if (ini < 0 || fim < 0) throw new Error(`trilha sem literal reconhecível: ${id}`);
    return src.slice(ini + 2, fim + 1);
  });

  return `${hubs}\n\nexport const CURRICULUM = [\n${literais.join(',\n')}\n];\n`;
}

function extract(): ExtractResult {
  const source = fonteSintetica();
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
  console.log(`Extraindo de ${DIR_CURRICULO}/ (hubs.ts + trails/)...`);
  const { hubs, trails, articles } = extract();

  console.log(`✓ ${hubs.length} hubs`);
  console.log(`✓ ${trails.length} trails`);
  console.log(`✓ ${articles.length} módulos (com mapeamento hub_id+trail_id)`);

  writeFileSync(join(SEEDS_DIR, 'hubs.json'), JSON.stringify(hubs, null, 2));
  writeFileSync(join(SEEDS_DIR, 'trails.json'), JSON.stringify(trails, null, 2));
  writeFileSync(join(SEEDS_DIR, 'article-mappings.json'), JSON.stringify(articles, null, 2));

  // Manifesto de conteúdo: só os slugs que têm seed escrito. Consumido pelo
  // sitemap para não publicar URL que responde 404.
  const comConteudo = articles
    .map(a => a.slug)
    .filter(slug => existsSync(join(SEEDS_DIR, 'articles', `${slug}.json`)))
    .sort();

  // Contagem de diagrama e quiz por trilha. Existe porque a home exibia
  // "29 diagramas interativos" como literal — correto por coincidência no dia em
  // que foi escrito, e sem nada que avisasse quando deixasse de ser. Número em
  // texto de marketing precisa vir do conteúdo, não da memória de quem escreveu.
  const porTrilha: Record<string, { modulos: number; diagramas: number; quizzes: number }> = {};

  for (const artigo of articles) {
    const trilha = String(artigo.trail_id ?? '');
    const slug = String(artigo.slug ?? '');
    const caminho = join(SEEDS_DIR, 'articles', `${slug}.json`);
    porTrilha[trilha] ??= { modulos: 0, diagramas: 0, quizzes: 0 };
    if (!existsSync(caminho)) continue;

    porTrilha[trilha].modulos += 1;
    const doc = JSON.parse(readFileSync(caminho, 'utf8')) as {
      blocks?: Array<Record<string, unknown>>;
    };

    const contar = (bs: Array<Record<string, unknown>> | undefined) => {
      for (const b of bs ?? []) {
        const tipo = b.type;
        // `aws_diagram` é o nome antigo, mantido como alias — os dois contam.
        if (tipo === 'arch_diagram' || tipo === 'aws_diagram') porTrilha[trilha].diagramas += 1;
        if (tipo === 'quiz') porTrilha[trilha].quizzes += 1;
        contar(b.children as Array<Record<string, unknown>> | undefined);
      }
    };
    contar(doc.blocks);
  }

  const manifesto = {
    _comentario:
      'GERADO por scripts/import-blocks/src/extract-curriculum.ts — não edite à mão. ' +
      'Lista os slugs com conteúdo escrito; o sitemap usa isso para não publicar 404. ' +
      '`porTrilha` alimenta os números exibidos na home (ver teste content-manifest-fresco).',
    geradoDe: 'scripts/seeds/articles/*.json',
    total: comConteudo.length,
    declarados: articles.length,
    slugs: comConteudo,
    porTrilha,
  };
  writeFileSync(
    join(REPO_ROOT, 'frontend/src/lib/content-manifest.json'),
    JSON.stringify(manifesto, null, 2) + '\n',
  );

  const semConteudo = articles.length - comConteudo.length;
  console.log(
    `✓ content-manifest.json: ${comConteudo.length} com conteúdo, ` +
      `${semConteudo} declarado(s) sem seed (fora do sitemap)`,
  );

  console.log(`\nSalvos em ${SEEDS_DIR}/`);
}

main();
