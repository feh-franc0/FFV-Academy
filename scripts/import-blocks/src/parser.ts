/**
 * Parser TSX → JSON Blocks.
 *
 * Lê src/app/aprenda/<slug>/page.tsx e extrai uma árvore de blocks JSON
 * compatível com o schema do backend (module_blocks).
 *
 * Estratégia:
 *   1. Parse AST com @babel/parser (suporta TS + JSX)
 *   2. Encontrar o `export default function` que é o ModulePage
 *   3. Encontrar o `return ( ... )` desse função
 *   4. Walk recursivo no JSXElement raiz extraindo blocos
 *   5. Mapear primitives conhecidos → block types
 *
 * Casos não-cobertos viram block type "unknown" com payload original,
 * pra revisão manual depois.
 */

import { parse } from '@babel/parser';
import traverseDefault from '@babel/traverse';
import * as t from '@babel/types';
import { randomUUID } from 'node:crypto';

// CommonJS interop pro traverse
const traverse = (traverseDefault as unknown as { default: typeof traverseDefault }).default ?? traverseDefault;

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface ParsedBlock {
  id: string;
  type: string;
  position: number;
  data: Record<string, unknown>;
  children?: ParsedBlock[];
}

export interface ParseResult {
  slug: string;
  title: string | null;
  blocks: ParsedBlock[];
  warnings: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getJSXName(node: t.JSXElement): string {
  const open = node.openingElement.name;
  if (t.isJSXIdentifier(open)) return open.name;
  if (t.isJSXMemberExpression(open)) return 'Member.' + (t.isJSXIdentifier(open.property) ? open.property.name : '?');
  return 'Unknown';
}

function getAttr(node: t.JSXElement, name: string): t.JSXAttribute | null {
  for (const attr of node.openingElement.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === name) {
      return attr;
    }
  }
  return null;
}

function getStringAttr(node: t.JSXElement, name: string): string | null {
  const attr = getAttr(node, name);
  if (!attr || !attr.value) return null;
  if (t.isStringLiteral(attr.value)) return attr.value.value;
  if (t.isJSXExpressionContainer(attr.value) && t.isStringLiteral(attr.value.expression)) {
    return attr.value.expression.value;
  }
  return null;
}

function getExpressionAttr(node: t.JSXElement, name: string): t.Expression | null {
  const attr = getAttr(node, name);
  if (!attr || !attr.value) return null;
  if (t.isJSXExpressionContainer(attr.value) && t.isExpression(attr.value.expression)) {
    return attr.value.expression;
  }
  return null;
}

/** Extrai literal de array de strings em uma prop JSX */
function getStringArrayAttr(node: t.JSXElement, name: string): string[] | null {
  const expr = getExpressionAttr(node, name);
  if (!expr || !t.isArrayExpression(expr)) return null;
  const items: string[] = [];
  for (const el of expr.elements) {
    if (t.isStringLiteral(el)) items.push(el.value);
    else if (t.isTemplateLiteral(el) && el.expressions.length === 0) items.push(el.quasis[0].value.cooked ?? '');
    else return null;
  }
  return items;
}

/** Extrai array de array de strings (matriz pra ComparisonTable rows) */
function getStringMatrixAttr(node: t.JSXElement, name: string): string[][] | null {
  const expr = getExpressionAttr(node, name);
  if (!expr || !t.isArrayExpression(expr)) return null;
  const matrix: string[][] = [];
  for (const row of expr.elements) {
    if (!t.isArrayExpression(row)) return null;
    const cols: string[] = [];
    for (const cell of row.elements) {
      if (t.isStringLiteral(cell)) cols.push(cell.value);
      else if (t.isTemplateLiteral(cell) && cell.expressions.length === 0) cols.push(cell.quasis[0].value.cooked ?? '');
      else cols.push(''); // ignora ReactNode complexos
    }
    matrix.push(cols);
  }
  return matrix;
}

/** Tenta extrair texto de children JSX simples */
function extractTextFromChildren(children: Array<t.JSXText | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXElement | t.JSXFragment>): string {
  let out = '';
  for (const child of children) {
    if (t.isJSXText(child)) {
      out += child.value;
    } else if (t.isJSXExpressionContainer(child)) {
      if (t.isStringLiteral(child.expression)) out += child.expression.value;
      else if (t.isTemplateLiteral(child.expression) && child.expression.expressions.length === 0) {
        out += child.expression.quasis[0].value.cooked ?? '';
      }
    } else if (t.isJSXElement(child)) {
      const name = getJSXName(child);
      // Inline elements: pega texto interno
      if (name === 'strong' || name === 'b' || name === 'em' || name === 'i' || name === 'code') {
        out += extractTextFromChildren(child.children);
      }
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Extrai inline marks (bold/italic/code/link) de children pra paragraph */
function extractInlineNodes(children: Array<t.JSXText | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXElement | t.JSXFragment>): Array<{ text: string; bold?: boolean; italic?: boolean; code?: boolean; link?: string }> {
  const nodes: Array<{ text: string; bold?: boolean; italic?: boolean; code?: boolean; link?: string }> = [];
  for (const child of children) {
    if (t.isJSXText(child)) {
      const text = child.value.replace(/\s+/g, ' ');
      if (text.trim()) nodes.push({ text });
    } else if (t.isJSXExpressionContainer(child)) {
      if (t.isStringLiteral(child.expression)) nodes.push({ text: child.expression.value });
      else if (t.isTemplateLiteral(child.expression) && child.expression.expressions.length === 0) {
        nodes.push({ text: child.expression.quasis[0].value.cooked ?? '' });
      }
    } else if (t.isJSXElement(child)) {
      const name = getJSXName(child);
      const text = extractTextFromChildren(child.children);
      if (!text) continue;
      if (name === 'strong' || name === 'b') nodes.push({ text, bold: true });
      else if (name === 'em' || name === 'i') nodes.push({ text, italic: true });
      else if (name === 'InlineCode' || name === 'code') nodes.push({ text, code: true });
      else if (name === 'a') {
        const href = getStringAttr(child, 'href') ?? '';
        nodes.push({ text, link: href });
      } else {
        nodes.push({ text }); // unknown inline → vira texto puro
      }
    }
  }
  // Junta nodes consecutivos sem mark
  const merged: typeof nodes = [];
  for (const n of nodes) {
    const prev = merged[merged.length - 1];
    if (prev && !prev.bold && !prev.italic && !prev.code && !prev.link && !n.bold && !n.italic && !n.code && !n.link) {
      prev.text += n.text;
    } else {
      merged.push({ ...n });
    }
  }
  return merged;
}

// ─── Transforms por primitive ───────────────────────────────────────────────

function transformElement(node: t.JSXElement, warnings: string[]): ParsedBlock | null {
  const name = getJSXName(node);
  const id = randomUUID();

  switch (name) {
    case 'Section': {
      const title = getStringAttr(node, 'title') ?? '';
      const children = transformChildren(node.children, warnings);
      return {
        id,
        type: 'section',
        position: 0,
        data: { title },
        children,
      };
    }

    case 'Callout': {
      const tone = getStringAttr(node, 'tone') ?? 'info';
      // tone → variant
      const variantMap: Record<string, string> = {
        info: 'info', tip: 'info', neutral: 'info',
        warn: 'warning', warning: 'warning',
        danger: 'danger',
        success: 'success',
      };
      const variant = variantMap[tone] ?? 'info';
      const content = extractTextFromChildren(node.children);
      return {
        id,
        type: 'callout',
        position: 0,
        data: { variant, title: '', content },
      };
    }

    case 'CodeBlock': {
      const language = getStringAttr(node, 'lang') ?? 'text';
      const filename = getStringAttr(node, 'filename') ?? undefined;
      // Children pode ser um template literal (string puro)
      let code = '';
      for (const child of node.children) {
        if (t.isJSXText(child)) code += child.value;
        else if (t.isJSXExpressionContainer(child)) {
          if (t.isStringLiteral(child.expression)) code += child.expression.value;
          else if (t.isTemplateLiteral(child.expression) && child.expression.expressions.length === 0) {
            code += child.expression.quasis[0].value.cooked ?? '';
          }
        }
      }
      code = code.trim();
      return {
        id,
        type: 'code_block',
        position: 0,
        data: filename ? { language, code, filename } : { language, code },
      };
    }

    case 'ComparisonTable': {
      const headers = getStringArrayAttr(node, 'headers');
      const rows = getStringMatrixAttr(node, 'rows');
      if (!headers || !rows) {
        warnings.push(`ComparisonTable sem headers/rows literais — pulando`);
        return null;
      }
      return {
        id,
        type: 'comparison_table',
        position: 0,
        data: { columns: headers, rows },
      };
    }

    case 'p': {
      const content = extractInlineNodes(node.children);
      if (content.length === 0) return null;
      return {
        id,
        type: 'paragraph',
        position: 0,
        data: { content },
      };
    }

    case 'ModuleLayout':
    case 'Fragment':
    case 'div':
      // Containers — extrai children diretamente, não cria bloco próprio
      return null;

    default:
      // Tipos avançados — ainda não implementados no parser, marca pra revisão
      warnings.push(`tipo não suportado pelo parser: ${name}`);
      return null;
  }
}

function transformChildren(children: t.JSXElement['children'], warnings: string[]): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  let position = 0;

  for (const child of children) {
    if (t.isJSXElement(child)) {
      const block = transformElement(child, warnings);
      if (block) {
        block.position = position++;
        blocks.push(block);
      } else {
        // Container (div, ModuleLayout, Fragment) — pega filhos
        const name = getJSXName(child);
        if (name === 'div' || name === 'ModuleLayout' || name === 'Fragment') {
          const innerBlocks = transformChildren(child.children, warnings);
          for (const ib of innerBlocks) {
            ib.position = position++;
            blocks.push(ib);
          }
        }
      }
    } else if (t.isJSXFragment(child)) {
      const innerBlocks = transformChildren(child.children, warnings);
      for (const ib of innerBlocks) {
        ib.position = position++;
        blocks.push(ib);
      }
    }
    // Ignora JSXText/JSXExpressionContainer top-level (geralmente whitespace)
  }

  return blocks;
}

// ─── API pública ────────────────────────────────────────────────────────────

export function parseModuleFile(source: string, slug: string): ParseResult {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
    errorRecovery: true,
  });

  let title: string | null = null;
  let returnElement: t.JSXElement | t.JSXFragment | null = null;

  // Estratégia: procura a função "Content" (padrão dos módulos), depois cai
  // para "export default" se não achar.
  traverse(ast, {
    // Captura metadata.title
    ObjectProperty(path) {
      if (t.isIdentifier(path.node.key) && path.node.key.name === 'title' &&
          t.isStringLiteral(path.node.value) && title === null) {
        title = path.node.value.value;
      }
    },
    // PRIORIDADE 1: função Content (padrão dos módulos FFV)
    FunctionDeclaration(path) {
      if (path.node.id?.name !== 'Content') return;
      if (returnElement) return;
      path.traverse({
        ReturnStatement(retPath) {
          if (returnElement) return;
          const arg = retPath.node.argument;
          if (t.isJSXElement(arg) || t.isJSXFragment(arg)) {
            returnElement = arg;
          } else if (arg && t.isParenthesizedExpression(arg) && (t.isJSXElement(arg.expression) || t.isJSXFragment(arg.expression))) {
            returnElement = arg.expression;
          }
        },
      });
    },
    // PRIORIDADE 2: export default (fallback se não tiver função Content)
    ExportDefaultDeclaration(path) {
      if (returnElement) return; // já achou Content, ignora
      const decl = path.node.declaration;
      if (t.isFunctionDeclaration(decl) || t.isArrowFunctionExpression(decl)) {
        path.traverse({
          ReturnStatement(retPath) {
            if (returnElement) return;
            const arg = retPath.node.argument;
            if (t.isJSXElement(arg) || t.isJSXFragment(arg)) {
              // Se o root é ModuleLayout que tem só <Content /> dentro, não usa
              const isContainerWithRef = t.isJSXElement(arg) &&
                getJSXName(arg) === 'ModuleLayout' &&
                arg.children.some(c => t.isJSXElement(c) && getJSXName(c) === 'Content');
              if (!isContainerWithRef) {
                returnElement = arg;
              }
            } else if (arg && t.isParenthesizedExpression(arg) && (t.isJSXElement(arg.expression) || t.isJSXFragment(arg.expression))) {
              returnElement = arg.expression;
            }
          },
        });
      }
    },
  });

  const warnings: string[] = [];
  let blocks: ParsedBlock[] = [];

  if (returnElement) {
    // returnElement é o root (ModuleLayout, geralmente)
    if (t.isJSXElement(returnElement)) {
      const rootName = getJSXName(returnElement);
      if (rootName === 'ModuleLayout' || rootName === 'div' || rootName === 'Fragment') {
        blocks = transformChildren(returnElement.children, warnings);
      } else {
        // Single element raiz
        const b = transformElement(returnElement, warnings);
        if (b) blocks = [b];
      }
    } else {
      blocks = transformChildren(returnElement.children, warnings);
    }
  } else {
    warnings.push('Não foi possível encontrar o JSX raiz no export default');
  }

  // Reordena positions sequencialmente
  blocks.forEach((b, i) => { b.position = i; });

  return { slug, title, blocks, warnings };
}
