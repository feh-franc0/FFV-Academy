#!/usr/bin/env python3
"""
Validador de block JSON para os seeds de artigo do Bedrock.

Espelha (a) os schemas Zod ESTRITOS de frontend/src/components/article/blocks/schemas.ts
(que fazem o BlockRenderer DROPAR o bloco se falharem) e (b) os shapes exigidos
pelos ADAPTERS em BlockRenderer.tsx (que renderizam null/vazio se o campo faltar).

Uso: python3 scripts/validate_bedrock_blocks.py [glob]
"""
import json
import sys
import glob
import re
from pathlib import Path

ALLOWED_TYPES = {
    'section', 'paragraph', 'callout', 'code_block',
    'comparison_table', 'decision_box', 'flow_diagram',
    'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
    'node_graph', 'annotated_formula', 'quiz', 'image',
    'qa_item', 'key_value', 'list',
    'hierarchy_diagram', 'comparison_flow', 'split_flow',
    'layer_stack', 'mind_map', 'exam_domain_badge',
    'arch_diagram', 'aws_diagram',
}

# Chaves de serviço aceitas — LIDAS do catálogo de ícones em tempo de execução.
#
# Antes isso era um set copiado à mão aqui. As duas listas dessincronizaram: o
# catálogo cresceu para 101 serviços (ganhou os ícones genéricos de categoria —
# 'ai', 'security', 'storage', etc.) e o validador continuou com 91, então
# passou a acusar como "fora do catálogo" ícone que existe e funciona. Derivar
# da fonte elimina a classe de erro em vez de corrigir a cópia.
ICON_CATALOG = (
    Path(__file__).resolve().parent.parent
    / 'frontend' / 'src' / 'components' / 'article' / 'AwsIcon.tsx'
)


def _carregar_servicos() -> set:
    if not ICON_CATALOG.exists():
        raise SystemExit(f'catálogo de ícones não encontrado: {ICON_CATALOG}')
    fonte = ICON_CATALOG.read_text(encoding='utf-8')
    # entradas do catálogo: duas espaços de indentação, chave, abre objeto
    chaves = set(re.findall(r'^\s{2}([a-z0-9_]+):\s*\{', fonte, re.M))
    if len(chaves) < 50:
        raise SystemExit(
            f'só {len(chaves)} serviços extraídos de AwsIcon.tsx — o regex quebrou? '
            'Verifique se o formato do catálogo mudou antes de confiar neste validador.'
        )
    return chaves


AWS_SERVICES = _carregar_servicos()

errors = []
warnings = []
seen_ids = {}


def err(f, path, msg):
    errors.append(f"[{f}] {path}: {msg}")


def warn(f, path, msg):
    warnings.append(f"[{f}] {path}: {msg}")


def is_str(x):
    return isinstance(x, str)


def nonempty_str(x):
    return isinstance(x, str) and len(x) >= 1


def validate_strict(f, path, t, d):
    """Espelha os schemas Zod estritos — falha aqui = bloco DROPADO em runtime."""
    if t == 'section':
        if not (nonempty_str(d.get('title')) and len(d['title']) <= 200):
            err(f, path, "section.data.title deve ser string 1..200")
    elif t == 'paragraph':
        c = d.get('content')
        if not (isinstance(c, list) and len(c) >= 1):
            err(f, path, "paragraph.data.content deve ser array com >=1 nós")
        else:
            for i, n in enumerate(c):
                if not (isinstance(n, dict) and is_str(n.get('text'))):
                    err(f, path, f"content[{i}].text deve ser string")
                for k in ('bold', 'italic', 'code'):
                    if k in n and not isinstance(n[k], bool):
                        err(f, path, f"content[{i}].{k} deve ser bool")
                if 'link' in n and not is_safe_url(n['link']):
                    err(f, path, f"content[{i}].link protocolo inválido: {n['link']}")
    elif t == 'callout':
        if d.get('variant') not in ('info', 'warning', 'danger', 'success'):
            err(f, path, f"callout.variant inválido: {d.get('variant')}")
        if 'title' in d and d['title'] is not None and not (is_str(d['title']) and len(d['title']) <= 120):
            err(f, path, "callout.title deve ser string <=120")
        if not nonempty_str(d.get('content')):
            err(f, path, "callout.content deve ser string >=1")
    elif t == 'code_block':
        if not (nonempty_str(d.get('language')) and len(d['language']) <= 40):
            err(f, path, "code_block.language deve ser string 1..40")
        if not (nonempty_str(d.get('code')) and len(d['code']) <= 50000):
            err(f, path, "code_block.code deve ser string 1..50000")
        if 'filename' in d and not (is_str(d['filename']) and len(d['filename']) <= 200):
            err(f, path, "code_block.filename deve ser string <=200")
    elif t == 'comparison_table':
        cols = d.get('columns')
        rows = d.get('rows')
        # 2..8: acompanha o cap do ComparisonTableSchema em schemas.ts. Os dois
        # tinham que casar e não casavam — o Zod aceitava 8 e este validador
        # continuava reprovando em 6.
        if not (isinstance(cols, list) and 2 <= len(cols) <= 8 and all(nonempty_str(c) for c in cols)):
            err(f, path, "comparison_table.columns deve ser 2..8 strings não-vazias")
        if not (isinstance(rows, list) and len(rows) >= 1):
            err(f, path, "comparison_table.rows deve ser array com >=1 linha")
        else:
            for i, r in enumerate(rows):
                if not (isinstance(r, list) and all(is_str(c) for c in r)):
                    err(f, path, f"rows[{i}] deve ser array de strings")
                elif isinstance(cols, list) and len(r) != len(cols):
                    warn(f, path, f"rows[{i}] tem {len(r)} células, columns tem {len(cols)}")
    elif t == 'quiz':
        if not nonempty_str(d.get('question')):
            err(f, path, "quiz.question deve ser string >=1")
        opts = d.get('options')
        if not (isinstance(opts, list) and 2 <= len(opts) <= 8 and all(is_str(o) for o in opts)):
            err(f, path, "quiz.options deve ser 2..8 strings")
        ci = d.get('correctIndex')
        if not (isinstance(ci, int) and ci >= 0):
            err(f, path, "quiz.correctIndex deve ser int >=0")
        elif isinstance(opts, list) and ci >= len(opts):
            err(f, path, f"quiz.correctIndex {ci} fora do range de options ({len(opts)})")
        if 'explanation' in d and not is_str(d['explanation']):
            err(f, path, "quiz.explanation deve ser string")
    elif t == 'image':
        err(f, path, "image: evitar (CSP/allowlist). Use diagramas.")
    elif t in ('arch_diagram', 'aws_diagram'):
        validate_arch_diagram(f, path, d)


def validate_arch_diagram(f, path, d):
    """O erro que mais dói aqui é aresta apontando para nó inexistente:
    ela some no render sem aviso e o diagrama fica mudo. Falhe cedo."""
    grupos = d.get('groups')
    if not (isinstance(grupos, list) and 1 <= len(grupos) <= 8):
        err(f, path, "arch_diagram.groups deve ser lista de 1 a 8 grupos")
        return

    ids = set()
    for gi, g in enumerate(grupos):
        if not isinstance(g, dict):
            err(f, path, f"groups[{gi}] deve ser objeto")
            continue
        if 'kind' in g and g['kind'] not in ('account', 'vpc', 'region', 'plain'):
            err(f, path, f"groups[{gi}].kind inválido: {g['kind']}")
        nos = g.get('nodes')
        if not (isinstance(nos, list) and nos):
            err(f, path, f"groups[{gi}].nodes ausente/vazio")
            continue
        for ni, n in enumerate(nos):
            p = f"{path}.groups[{gi}].nodes[{ni}]"
            if not (isinstance(n, dict) and nonempty_str(n.get('id'))):
                err(f, p, "node.id obrigatório")
                continue
            if n['id'] in ids:
                err(f, p, f"id de nó duplicado no diagrama: {n['id']}")
            ids.add(n['id'])
            svc = n.get('service')
            if not nonempty_str(svc):
                err(f, p, "node.service obrigatório")
            elif svc not in AWS_SERVICES:
                warn(f, p, f"service '{svc}' fora do catálogo de ícones (cai no genérico)")

    for ei, e in enumerate(d.get('edges') or []):
        p = f"{path}.edges[{ei}]"
        if not isinstance(e, dict):
            err(f, p, "edge deve ser objeto")
            continue
        for lado in ('from', 'to'):
            alvo = e.get(lado)
            if not nonempty_str(alvo):
                err(f, p, f"edge.{lado} obrigatório")
            elif alvo not in ids:
                err(f, p, f"edge.{lado} '{alvo}' não existe entre os nós => aresta sumiria no render")
        if 'style' in e and e['style'] not in ('solid', 'dashed'):
            err(f, p, f"edge.style inválido: {e['style']}")

    passos = d.get('steps') or []
    if len(passos) > 12:
        err(f, path, f"arch_diagram.steps: {len(passos)} passos (máximo 12)")
    pares = {f"{e.get('from')}>{e.get('to')}" for e in (d.get('edges') or []) if isinstance(e, dict)}
    for si, s in enumerate(passos):
        p = f"{path}.steps[{si}]"
        if not (isinstance(s, dict) and nonempty_str(s.get('label'))):
            err(f, p, "step.label obrigatório")
            continue
        for nid in (s.get('nodes') or []):
            if nid not in ids:
                err(f, p, f"step.nodes '{nid}' não existe entre os nós")
        for ref in (s.get('edges') or []):
            if ref not in pares:
                err(f, p, f"step.edges '{ref}' não corresponde a nenhuma aresta declarada")


SAFE_URL = re.compile(r'^(https?:|/|#|mailto:)', re.I)


def is_safe_url(u):
    return isinstance(u, str) and bool(SAFE_URL.match(u))


def validate_adapter_shape(f, path, t, d):
    """Shapes exigidos pelos adapters (não-estrito): faltar => render null/vazio."""
    if t == 'decision_box':
        for k in ('scenario', 'winner', 'why'):
            if not nonempty_str(d.get(k)):
                warn(f, path, f"decision_box.{k} vazio (adapter espera scenario/winner/why)")
        if not isinstance(d.get('alternatives'), list):
            warn(f, path, "decision_box.alternatives deve ser lista de {name,downside}")
    elif t == 'flow_diagram':
        steps = d.get('steps')
        if not (isinstance(steps, list) and len(steps) >= 1):
            err(f, path, "flow_diagram.data.steps ausente/vazio => render null (adapter usa 'steps', não 'nodes')")
    elif t == 'stack_flow':
        if not (isinstance(d.get('items'), list) and d['items']):
            err(f, path, "stack_flow.items ausente/vazio => render null")
    elif t == 'arch_flow':
        cols = d.get('columns')
        if not (isinstance(cols, list) and cols):
            err(f, path, "arch_flow.columns ausente/vazio => render null (cada col {title, items[]})")
    elif t == 'timeline':
        if not (isinstance(d.get('events'), list) and d['events']):
            err(f, path, "timeline.events ausente/vazio => render null")
    elif t == 'key_value':
        if not (isinstance(d.get('items'), list) and d['items']):
            warn(f, path, "key_value.items vazio")
    elif t == 'list':
        if not (isinstance(d.get('items'), list) and d['items']):
            err(f, path, "list.items ausente/vazio")
    elif t == 'qa_item':
        if not nonempty_str(d.get('question')) or not nonempty_str(d.get('answer')):
            warn(f, path, "qa_item espera {question, answer}")
    elif t == 'node_graph':
        if not (isinstance(d.get('columns'), list) and d['columns']):
            err(f, path, "node_graph.columns ausente/vazio => render null")
    elif t == 'hierarchy_diagram':
        if not (isinstance(d.get('levels'), list) and d['levels']):
            err(f, path, "hierarchy_diagram.levels ausente/vazio => render null")
    elif t == 'layer_stack':
        if not (isinstance(d.get('layers'), list) and d['layers']):
            err(f, path, "layer_stack.layers ausente/vazio => render null")
    elif t == 'matrix_diagram':
        if not (isinstance(d.get('matrix'), list) and d['matrix']):
            err(f, path, "matrix_diagram.matrix ausente/vazio => render null")
    elif t == 'annotated_formula':
        if not nonempty_str(d.get('formula')):
            warn(f, path, "annotated_formula.formula vazio")
    elif t == 'mind_map':
        if not (isinstance(d.get('branches'), list) and d['branches']):
            warn(f, path, "mind_map.branches vazio")
    elif t == 'exam_domain_badge':
        if not nonempty_str(d.get('domain')):
            warn(f, path, "exam_domain_badge.domain vazio")
    elif t == 'comparison_flow':
        if not (isinstance(d.get('left'), list) and d['left'] and isinstance(d.get('right'), list) and d['right']):
            err(f, path, "comparison_flow.left/right devem ser listas não-vazias => senão render null")
    elif t == 'split_flow':
        pass  # normaliza qualquer shape


def walk(f, blocks, prefix=''):
    if not isinstance(blocks, list):
        err(f, prefix or 'blocks', "deve ser array")
        return
    positions = []
    for i, b in enumerate(blocks):
        path = f"{prefix}[{i}]"
        if not isinstance(b, dict):
            err(f, path, "bloco deve ser objeto")
            continue
        bid = b.get('id')
        t = b.get('type')
        if not nonempty_str(bid):
            err(f, path, "id ausente")
        else:
            key = bid
            if key in seen_ids:
                err(f, path, f"id duplicado: {bid} (também em {seen_ids[key]})")
            seen_ids[key] = f"{f}{path}"
        if t not in ALLOWED_TYPES:
            err(f, path, f"type inválido: {t}")
            continue
        if 'position' not in b or not isinstance(b['position'], int):
            err(f, path, "position ausente/não-int")
        else:
            positions.append(b['position'])
        d = b.get('data')
        if not isinstance(d, dict):
            err(f, path, "data deve ser objeto")
            continue
        validate_strict(f, path + f".{t}", t, d)
        validate_adapter_shape(f, path + f".{t}", t, d)
        children = b.get('children')
        if children is not None:
            if t != 'section':
                warn(f, path, f"children em type '{t}' (só 'section' renderiza children)")
            walk(f, children, path + '.children')
    if positions and sorted(positions) != list(range(len(positions))):
        warn(f, prefix or 'blocks', f"positions não são 0..n contíguas: {positions}")


def main():
    # Sem argumento, valida TODOS os seeds. Antes o padrão era só 'bedrock-*',
    # o que deixava módulo novo de outra trilha fora do gate sem ninguém notar —
    # exatamente o tipo de cobertura silenciosamente parcial que faz o CI passar
    # verde sobre conteúdo não verificado. Passe um glob para restringir.
    pat = sys.argv[1] if len(sys.argv) > 1 else 'scripts/seeds/articles/*.json'
    files = sorted(f for f in glob.glob(pat) if not f.split('/')[-1].startswith('_'))
    if not files:
        print(f"nenhum arquivo em {pat}")
        sys.exit(1)
    for f in files:
        seen_ids.clear()  # unicidade por-arquivo
        try:
            d = json.load(open(f))
        except Exception as e:
            err(f, '', f"JSON inválido: {e}")
            continue
        short = f.split('/')[-1]
        if not is_str(d.get('slug')):
            err(short, '', "slug ausente")
        if 'title' in d and d['title'] is not None:
            warn(short, '', "title deve ser null (vem de trails.json)")
        walk(short, d.get('blocks', []), 'blocks')

    n = len(files)
    if errors:
        print(f"\n❌ {len(errors)} ERROS em {n} arquivos:\n")
        for e in errors:
            print("  " + e)
    if warnings:
        print(f"\n⚠️  {len(warnings)} avisos:\n")
        for w in warnings[:60]:
            print("  " + w)
    if not errors:
        total_blocks = sum(count_blocks(json.load(open(f)).get('blocks', [])) for f in files)
        print(f"\n✅ {n} arquivos OK — {total_blocks} blocos válidos, 0 erros.")
        sys.exit(0)
    sys.exit(2)


def count_blocks(blocks):
    n = 0
    for b in blocks:
        n += 1
        n += count_blocks(b.get('children') or [])
    return n


if __name__ == '__main__':
    main()
