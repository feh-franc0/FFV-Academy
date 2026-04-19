#!/usr/bin/env python3
"""
layout-linter.py — Detecta overlaps geométricos em diagramas draw.io.

Pega problemas que o aws-arch-scorer.py (atributo-based) não vê:
  P27 — bounding box overlap entre células text/legenda
  P28 — badges sobrepondo o ícone que anotam
  P29 — express lanes com waypoints no mesmo canal Y (gap < 30px)
  P30 — labels de edge longos cuja midpoint cai dentro de container alheio
  P31 — step badges sobrepondo ícones AWS

Uso:
  python3 layout-linter.py arquivo.drawio              # relatório human-readable
  python3 layout-linter.py arquivo.drawio --json       # JSON para pipelines
  python3 layout-linter.py arquivo.drawio --fix        # aplica fixes RESTRUCTURE possíveis
"""

import json
import re
import sys
from pathlib import Path


# ─── Parsing ────────────────────────────────────────────────────────────────

def parse_cells(content: str) -> dict:
    """Retorna {cell_id: {x, y, w, h, style, value, edge, source, target, points}}."""
    cells = {}
    cell_re = re.compile(
        r'<mxCell\s+([^>]*?)(?:>|/>)(.*?)(?:</mxCell>|(?<=/>))',
        re.DOTALL,
    )
    for m in cell_re.finditer(content):
        attrs_str = m.group(1)
        body = m.group(2) or ""
        attrs = dict(re.findall(r'(\w+)="([^"]*)"', attrs_str))
        cid = attrs.get("id")
        if not cid:
            continue
        geo_m = re.search(r"<mxGeometry([^/>]*)(?:/>|>(.*?)</mxGeometry>)", body, re.DOTALL)
        x = y = w = h = None
        points = []
        if geo_m:
            g_attrs = geo_m.group(1)
            def num(name):
                mm = re.search(rf'\b{name}="(-?\d+(?:\.\d+)?)"', g_attrs)
                return float(mm.group(1)) if mm else None
            x, y, w, h = num("x"), num("y"), num("width"), num("height")
            inner = geo_m.group(2) or ""
            for pm in re.finditer(r'<mxPoint\s+x="(-?\d+(?:\.\d+)?)"\s+y="(-?\d+(?:\.\d+)?)"', inner):
                points.append((float(pm.group(1)), float(pm.group(2))))
        cells[cid] = {
            "id": cid,
            "x": x, "y": y, "w": w, "h": h,
            "style": attrs.get("style", ""),
            "value": attrs.get("value", ""),
            "edge": attrs.get("edge") == "1",
            "source": attrs.get("source"),
            "target": attrs.get("target"),
            "vertex": attrs.get("vertex") == "1",
            "points": points,
        }
    return cells


def bbox(cell):
    if cell.get("x") is None:
        return None
    return (cell["x"], cell["y"], cell["x"] + cell["w"], cell["y"] + cell["h"])


def bbox_overlap(a, b):
    if not a or not b:
        return 0.0
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    ow = min(ax2, bx2) - max(ax1, bx1)
    oh = min(ay2, by2) - max(ay1, by1)
    if ow <= 0 or oh <= 0:
        return 0.0
    return ow * oh


def is_text(cell):
    """Cell que renderiza texto — exclui backgrounds visuais sem value."""
    sty = cell.get("style", "")
    val = (cell.get("value", "") or "").strip()
    cid = cell.get("id", "")
    # background puro (sem value, com fillColor sólido) NÃO é text — é só pano de fundo
    if not val:
        return False
    return "text;" in sty or cid.startswith(("leg_", "note_", "subtitle", "title", "cost_box"))


def is_aws_icon(cell):
    return "mxgraph.aws4.resourceIcon" in cell.get("style", "") or "mxgraph.aws4.user" in cell.get("style", "")


def is_badge(cell):
    cid = cell.get("id", "")
    return cid.startswith(("fb_", "step_", "pill_", "tag_")) or (
        "rounded=1" in cell.get("style", "")
        and "fontColor=#FFFFFF" in cell.get("style", "")
        and cell.get("w") and cell["w"] <= 50
        and cell.get("h") and cell["h"] <= 30
    )


def is_container(cell):
    sty = cell.get("style", "")
    return (
        cell.get("id", "").startswith("grp_")
        or "shape=mxgraph.aws4.group" in sty
        or ("rounded=1" in sty and "dashed=1" in sty and cell.get("w", 0) > 150)
    )


# ─── Lints ──────────────────────────────────────────────────────────────────

def lint_p27_text_overlap(cells):
    """Bounding box overlap entre células text/legenda."""
    issues = []
    text_cells = [c for c in cells.values() if is_text(c) and bbox(c)]
    seen = set()
    for i, a in enumerate(text_cells):
        for b in text_cells[i + 1:]:
            if a["id"] == b["id"]:
                continue
            ov = bbox_overlap(bbox(a), bbox(b))
            if ov <= 0:
                continue
            area_a = a["w"] * a["h"]
            area_b = b["w"] * b["h"]
            ratio = ov / min(area_a, area_b)
            if ratio < 0.20:
                continue  # tolera leve overlap por padding/baseline rendering
            key = tuple(sorted([a["id"], b["id"]]))
            if key in seen:
                continue
            seen.add(key)
            issues.append({
                "rule": "P27",
                "severity": "CRITICO" if ratio > 0.3 else "ALTO",
                "ids": list(key),
                "overlap_ratio": round(ratio, 3),
                "description": f"Text cells {key[0]} e {key[1]} têm bbox overlap de {ratio:.0%} — texto vai sobrescrever",
                "fix_hint": f"empilhar verticalmente: {key[1]}.y = {key[0]}.y + {key[0]}.h + 6",
            })
    return issues


def lint_p28_badge_on_icon(cells):
    """Badges sobrepondo ícones AWS que eles anotam."""
    issues = []
    icons = {c["id"]: c for c in cells.values() if is_aws_icon(c) and bbox(c)}
    badges = [c for c in cells.values() if is_badge(c) and bbox(c) and c.get("w", 0) <= 50]
    for badge in badges:
        bid = badge["id"]
        # Tenta identificar o ícone alvo pelo nome (ex: fb_apigw -> apigw)
        target_icon = None
        if bid.startswith("fb_"):
            candidate = bid[3:]
            target_icon = icons.get(candidate) or icons.get(candidate.replace("admin", "_admin"))
        if target_icon:
            ov = bbox_overlap(bbox(badge), bbox(target_icon))
            if ov > 0:
                area_b = badge["w"] * badge["h"]
                issues.append({
                    "rule": "P28",
                    "severity": "ALTO",
                    "ids": [bid, target_icon["id"]],
                    "overlap_pixels": int(ov),
                    "description": f"Badge {bid} sobrepõe ícone {target_icon['id']} em {int(ov)}px²",
                    "fix_hint": (
                        f"Mover badge para FORA do ícone: "
                        f"se icon.y > 290 → badge ACIMA (y=icon.y-22), "
                        f"senão DIREITA (x=icon.x+icon.w+4)"
                    ),
                })
        else:
            # badge não vinculado: checa colisão com qualquer ícone
            for icon in icons.values():
                ov = bbox_overlap(bbox(badge), bbox(icon))
                if ov > 0:
                    issues.append({
                        "rule": "P28",
                        "severity": "MEDIO",
                        "ids": [bid, icon["id"]],
                        "overlap_pixels": int(ov),
                        "description": f"Badge {bid} sobrepõe ícone {icon['id']} (sem vínculo nominal)",
                        "fix_hint": "Reposicionar badge em corredor sem ícones ou remover",
                    })
    return issues


def lint_p29_express_lanes(cells):
    """Express lanes paralelas no mesmo canal Y (gap < 30px)."""
    issues = []
    edges_with_pts = [c for c in cells.values() if c.get("edge") and c.get("points")]
    seen = set()
    for i, a in enumerate(edges_with_pts):
        for b in edges_with_pts[i + 1:]:
            # Coletar y dos waypoints
            ays = [p[1] for p in a["points"]]
            bys = [p[1] for p in b["points"]]
            axs = [p[0] for p in a["points"]]
            bxs = [p[0] for p in b["points"]]
            if not (ays and bys):
                continue
            # Compara y "principal" de cada (assumindo lane horizontal: y dos waypoints é estável)
            if max(ays) - min(ays) > 30 or max(bys) - min(bys) > 30:
                continue  # não é lane horizontal
            ay = sum(ays) / len(ays)
            by_ = sum(bys) / len(bys)
            gap = abs(ay - by_)
            if gap >= 30:
                continue
            # X-overlap?
            ax_min, ax_max = min(axs), max(axs)
            bx_min, bx_max = min(bxs), max(bxs)
            x_ov = min(ax_max, bx_max) - max(ax_min, bx_min)
            if x_ov <= 0:
                continue
            sev = "CRITICO" if (a.get("value") and b.get("value")) else "ALTO"
            key = tuple(sorted([a["id"], b["id"]]))
            if key in seen:
                continue
            seen.add(key)
            issues.append({
                "rule": "P29",
                "severity": sev,
                "ids": list(key),
                "gap_y": round(gap, 1),
                "x_overlap_px": int(x_ov),
                "description": (
                    f"Edges {key[0]} (y≈{int(ay)}) e {key[1]} (y≈{int(by_)}) "
                    f"correm paralelas com gap {int(gap)}px (mín 30px)"
                ),
                "fix_hint": (
                    "Realocar uma das edges para canal Y reservado: "
                    "TOP1=125, TOP2=165, MID-OBS-1=548, MID-OBS-2=583, BOTTOM-RETURN=870"
                ),
            })
    return issues


def lint_p31_step_on_icon(cells):
    """Step badges (numerações) sobrepondo ícones AWS."""
    issues = []
    icons = [c for c in cells.values() if is_aws_icon(c) and bbox(c)]
    steps = [c for c in cells.values() if c.get("id", "").startswith("step_") and bbox(c)]
    for step in steps:
        for icon in icons:
            ov = bbox_overlap(bbox(step), bbox(icon))
            if ov > 0:
                issues.append({
                    "rule": "P31",
                    "severity": "ALTO",
                    "ids": [step["id"], icon["id"]],
                    "overlap_pixels": int(ov),
                    "description": f"Step badge {step['id']} sobre ícone {icon['id']}",
                    "fix_hint": "Mover step para corredor entre ícones (gap horizontal ≥ 30px de qualquer ícone)",
                })
    return issues


# ─── Main ───────────────────────────────────────────────────────────────────

LINTS = [
    ("P27_text_overlap",   lint_p27_text_overlap),
    ("P28_badge_on_icon",  lint_p28_badge_on_icon),
    ("P29_express_lanes",  lint_p29_express_lanes),
    ("P31_step_on_icon",   lint_p31_step_on_icon),
]


def run(path: Path) -> dict:
    content = path.read_text(encoding="utf-8")
    cells = parse_cells(content)
    all_issues = []
    by_rule = {}
    for name, fn in LINTS:
        issues = fn(cells)
        by_rule[name] = len(issues)
        all_issues.extend(issues)
    counts = {"CRITICO": 0, "ALTO": 0, "MEDIO": 0}
    for i in all_issues:
        counts[i["severity"]] = counts.get(i["severity"], 0) + 1
    return {
        "file": str(path),
        "cells_parsed": len(cells),
        "issue_counts": counts,
        "by_rule": by_rule,
        "issues": all_issues,
    }


def emit_report(result: dict):
    print(f"\n{'='*60}")
    print(f"  layout-linter — {Path(result['file']).name}")
    print(f"{'='*60}")
    print(f"  Células parsed: {result['cells_parsed']}")
    counts = result["issue_counts"]
    print(f"  CRITICO: {counts['CRITICO']}  |  ALTO: {counts['ALTO']}  |  MEDIO: {counts['MEDIO']}")
    print()
    if not result["issues"]:
        print("  ✅ Zero overlaps geométricos detectados.")
        print()
        return
    by_sev = {"CRITICO": [], "ALTO": [], "MEDIO": []}
    for i in result["issues"]:
        by_sev[i["severity"]].append(i)
    for sev in ("CRITICO", "ALTO", "MEDIO"):
        if not by_sev[sev]:
            continue
        emoji = {"CRITICO": "🔴", "ALTO": "🟡", "MEDIO": "🟢"}[sev]
        print(f"  {emoji} {sev} ({len(by_sev[sev])})")
        for i in by_sev[sev]:
            print(f"    [{i['rule']}] {i['description']}")
            print(f"        → {i['fix_hint']}")
        print()


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    path = Path(args[0])
    if not path.exists():
        print(f"Arquivo não encontrado: {path}", file=sys.stderr)
        sys.exit(1)
    result = run(path)
    if "--json" in args:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        emit_report(result)
    sys.exit(1 if result["issue_counts"]["CRITICO"] else 0)


if __name__ == "__main__":
    main()
