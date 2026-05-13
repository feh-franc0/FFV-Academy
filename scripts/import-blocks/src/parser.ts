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

/** Extrai array de objetos literais com props simples. Para FlowDiagram steps,
 *  Timeline events, KeyValue items, etc. */
function getObjectArrayAttr(node: t.JSXElement, name: string): Record<string, unknown>[] | null {
  const expr = getExpressionAttr(node, name);
  if (!expr || !t.isArrayExpression(expr)) return null;
  const items: Record<string, unknown>[] = [];
  for (const el of expr.elements) {
    if (t.isObjectExpression(el)) {
      const obj: Record<string, unknown> = {};
      for (const prop of el.properties) {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          const key = prop.key.name;
          const val = prop.value;
          if (t.isStringLiteral(val)) obj[key] = val.value;
          else if (t.isNumericLiteral(val)) obj[key] = val.value;
          else if (t.isBooleanLiteral(val)) obj[key] = val.value;
          else if (t.isTemplateLiteral(val) && val.expressions.length === 0) {
            obj[key] = val.quasis[0].value.cooked ?? '';
          } else if (t.isArrayExpression(val)) {
            const arr: unknown[] = [];
            for (const inner of val.elements) {
              if (t.isStringLiteral(inner)) arr.push(inner.value);
              else if (t.isObjectExpression(inner)) {
                const innerObj: Record<string, unknown> = {};
                for (const ip of inner.properties) {
                  if (t.isObjectProperty(ip) && t.isIdentifier(ip.key)) {
                    if (t.isStringLiteral(ip.value)) innerObj[ip.key.name] = ip.value.value;
                    else if (t.isNumericLiteral(ip.value)) innerObj[ip.key.name] = ip.value.value;
                    else if (t.isBooleanLiteral(ip.value)) innerObj[ip.key.name] = ip.value.value;
                    else if (t.isTemplateLiteral(ip.value) && ip.value.expressions.length === 0) {
                      innerObj[ip.key.name] = ip.value.quasis[0].value.cooked ?? '';
                    }
                  }
                }
                arr.push(innerObj);
              }
            }
            obj[key] = arr;
          } else if (t.isObjectExpression(val)) {
            // Recursão simples para 1 nível
            const innerObj: Record<string, unknown> = {};
            for (const ip of val.properties) {
              if (t.isObjectProperty(ip) && t.isIdentifier(ip.key)) {
                if (t.isStringLiteral(ip.value)) innerObj[ip.key.name] = ip.value.value;
              }
            }
            obj[key] = innerObj;
          }
        }
      }
      items.push(obj);
    } else if (t.isStringLiteral(el)) {
      items.push({ text: el.value });
    }
  }
  return items;
}

/** Extrai matrix de números (data de MatrixDiagram) */
function getNumberMatrixAttr(node: t.JSXElement, name: string): number[][] | null {
  const expr = getExpressionAttr(node, name);
  if (!expr || !t.isArrayExpression(expr)) return null;
  const matrix: number[][] = [];
  for (const row of expr.elements) {
    if (!t.isArrayExpression(row)) return null;
    const cols: number[] = [];
    for (const cell of row.elements) {
      if (t.isNumericLiteral(cell)) cols.push(cell.value);
      else if (t.isUnaryExpression(cell) && cell.operator === '-' && t.isNumericLiteral(cell.argument)) {
        cols.push(-cell.argument.value);
      } else cols.push(0);
    }
    matrix.push(cols);
  }
  return matrix;
}

function transformElement(node: t.JSXElement, warnings: string[]): ParsedBlock | null {
  const name = getJSXName(node);
  const id = randomUUID();

  switch (name) {
    // ─── Tipos originais (Sprint 1-2) ──────────────────────────────────────

    case 'Section': {
      const title = getStringAttr(node, 'title') ?? '';
      const children = transformChildren(node.children, warnings);
      return { id, type: 'section', position: 0, data: { title }, children };
    }

    case 'Callout': {
      const tone = getStringAttr(node, 'tone') ?? 'info';
      const variantMap: Record<string, string> = {
        info: 'info', tip: 'info', neutral: 'info',
        warn: 'warning', warning: 'warning',
        danger: 'danger', success: 'success',
      };
      const variant = variantMap[tone] ?? 'info';
      const content = extractTextFromChildren(node.children);
      return { id, type: 'callout', position: 0, data: { variant, title: '', content } };
    }

    case 'CodeBlock': {
      const language = getStringAttr(node, 'lang') ?? 'text';
      const filename = getStringAttr(node, 'filename') ?? undefined;
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
        id, type: 'code_block', position: 0,
        data: filename ? { language, code, filename } : { language, code },
      };
    }

    case 'ComparisonTable': {
      const headers = getStringArrayAttr(node, 'headers');
      const rows = getStringMatrixAttr(node, 'rows');
      if (!headers || !rows) return null;
      return { id, type: 'comparison_table', position: 0, data: { columns: headers, rows } };
    }

    case 'p': {
      const content = extractInlineNodes(node.children);
      if (content.length === 0) return null;
      return { id, type: 'paragraph', position: 0, data: { content } };
    }

    // ─── Tipos avançados (Sprint 2.5) ──────────────────────────────────────

    case 'QAItem': {
      const q = getStringAttr(node, 'q') ?? '';
      // a pode ser ReactNode complexo; tenta extrair texto
      let a = getStringAttr(node, 'a') ?? '';
      if (!a) {
        const expr = getExpressionAttr(node, 'a');
        if (expr) {
          // Tenta extrair JSX simples ou string literal
          if (t.isStringLiteral(expr)) a = expr.value;
          else if (t.isTemplateLiteral(expr) && expr.expressions.length === 0) {
            a = expr.quasis[0].value.cooked ?? '';
          } else if (t.isJSXElement(expr) || t.isJSXFragment(expr)) {
            const children = t.isJSXElement(expr) ? expr.children : expr.children;
            a = extractTextFromChildren(children);
          }
        }
      }
      return { id, type: 'qa_item', position: 0, data: { question: q, answer: a } };
    }

    case 'DecisionBox': {
      const scenario = getStringAttr(node, 'scenario') ?? '';
      const winner = getStringAttr(node, 'winner') ?? '';
      const why = getStringAttr(node, 'why') ?? '';
      const alternatives = getObjectArrayAttr(node, 'alternatives') ?? [];
      return {
        id, type: 'decision_box', position: 0,
        data: { scenario, winner, why, alternatives },
      };
    }

    case 'KeyValue': {
      const items = getObjectArrayAttr(node, 'items') ?? [];
      return { id, type: 'key_value', position: 0, data: { items } };
    }

    case 'FlowDiagram': {
      const title = getStringAttr(node, 'title') ?? '';
      const orientation = getStringAttr(node, 'orientation') ?? 'horizontal';
      const steps = getObjectArrayAttr(node, 'steps') ?? [];
      return {
        id, type: 'flow_diagram', position: 0,
        data: { title, orientation, steps },
      };
    }

    case 'StackFlow': {
      const title = getStringAttr(node, 'title') ?? '';
      const items = getObjectArrayAttr(node, 'items') ?? [];
      return { id, type: 'stack_flow', position: 0, data: { title, items } };
    }

    case 'ArchFlow': {
      const title = getStringAttr(node, 'title') ?? '';
      const columns = getObjectArrayAttr(node, 'columns') ?? [];
      return { id, type: 'arch_flow', position: 0, data: { title, columns } };
    }

    case 'NodeGraph': {
      const title = getStringAttr(node, 'title') ?? '';
      const columns = getObjectArrayAttr(node, 'columns') ?? [];
      const legend = getObjectArrayAttr(node, 'legend') ?? [];
      return { id, type: 'node_graph', position: 0, data: { title, columns, legend } };
    }

    case 'Timeline': {
      const title = getStringAttr(node, 'title') ?? '';
      const events = getObjectArrayAttr(node, 'events') ?? [];
      return { id, type: 'timeline', position: 0, data: { title, events } };
    }

    case 'HierarchyDiagram': {
      const title = getStringAttr(node, 'title') ?? '';
      const levels = getObjectArrayAttr(node, 'levels') ?? [];
      return { id, type: 'hierarchy_diagram', position: 0, data: { title, levels } };
    }

    case 'ComparisonFlow': {
      const title = getStringAttr(node, 'title') ?? '';
      const left = getObjectArrayAttr(node, 'left') ?? [];
      const right = getObjectArrayAttr(node, 'right') ?? [];
      return { id, type: 'comparison_flow', position: 0, data: { title, left, right } };
    }

    case 'SplitFlow': {
      const title = getStringAttr(node, 'title') ?? '';
      const left = getObjectArrayAttr(node, 'left') ?? [];
      const right = getObjectArrayAttr(node, 'right') ?? [];
      const center = getStringAttr(node, 'center') ?? '';
      return { id, type: 'split_flow', position: 0, data: { title, left, right, center } };
    }

    case 'LayerStack': {
      const title = getStringAttr(node, 'title') ?? '';
      const layers = getObjectArrayAttr(node, 'layers') ?? [];
      const separatorLabel = getStringAttr(node, 'separatorLabel') ?? '';
      const variant = getStringAttr(node, 'variant') ?? 'default';
      return {
        id, type: 'layer_stack', position: 0,
        data: { title, layers, separatorLabel, variant },
      };
    }

    case 'MindMap': {
      const root = getStringAttr(node, 'root') ?? '';
      const branches = getObjectArrayAttr(node, 'branches') ?? [];
      return { id, type: 'mind_map', position: 0, data: { root, branches } };
    }

    case 'MatrixDiagram': {
      const title = getStringAttr(node, 'title') ?? '';
      const rowLabels = getStringArrayAttr(node, 'rowLabels') ?? [];
      const colLabels = getStringArrayAttr(node, 'colLabels') ?? [];
      const data = getNumberMatrixAttr(node, 'data') ?? [];
      return {
        id, type: 'matrix_diagram', position: 0,
        data: { title, rowLabels, colLabels, matrix: data },
      };
    }

    case 'AnnotatedFormula': {
      const title = getStringAttr(node, 'title') ?? '';
      const formula = getStringAttr(node, 'formula') ?? '';
      const parts = getObjectArrayAttr(node, 'parts') ?? [];
      return { id, type: 'annotated_formula', position: 0, data: { title, formula, parts } };
    }

    case 'ExamDomainBadge': {
      const domain = getStringAttr(node, 'domain') ?? '';
      const weight = getStringAttr(node, 'weight') ?? '';
      return { id, type: 'exam_domain_badge', position: 0, data: { domain, weight } };
    }

    // ─── Listas HTML (ul/ol → list) ───────────────────────────────────────

    case 'ul':
    case 'ol': {
      const items: string[] = [];
      for (const child of node.children) {
        if (t.isJSXElement(child) && getJSXName(child) === 'li') {
          const text = extractTextFromChildren(child.children);
          if (text) items.push(text);
        }
      }
      if (items.length === 0) return null;
      return { id, type: 'list', position: 0, data: { items, ordered: name === 'ol' } };
    }

    // ─── Containers (passa direto) ────────────────────────────────────────

    case 'ModuleLayout':
    case 'Fragment':
    case 'div':
      return null;

    default:
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
