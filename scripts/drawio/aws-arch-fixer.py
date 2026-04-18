#!/usr/bin/env python3
"""
aws-arch-fixer.py — Corretor automático de diagramas AWS draw.io
Recebe issues do scorer e aplica fixes AUTO. Retorna JSON com audit.

Uso:
  python3 aws-arch-fixer.py arquivo.drawio                  # auto-fix completo
  python3 aws-arch-fixer.py arquivo.drawio --issues '[...]' # só os issues passados
  python3 aws-arch-fixer.py arquivo.drawio --dry-run        # simula sem salvar
"""

import re
import sys
import json
from pathlib import Path


# ─── Fixes AUTO ─────────────────────────────────────────────────────────────

def fix_style(style: str) -> tuple[str, list[str]]:
    """Aplica todas as correções AUTO no style string. Retorna (novo_style, fixes[])."""
    original = style
    applied = []

    # D1.1 — label abaixo do ícone AWS
    if ("mxgraph.aws4.resourceIcon" in style or "mxgraph.aws4.user" in style):
        if "verticalLabelPosition=bottom" not in style:
            style = re.sub(r";?verticalAlign=[^;\"]+", "", style)
            style = re.sub(r";?labelPosition=[^;\"]+", "", style)
            style = re.sub(r";?verticalLabelPosition=[^;\"]+", "", style)
            style = style.rstrip(";")
            style += ";labelPosition=center;verticalLabelPosition=bottom;verticalAlign=top"
            applied.append("D1.1: label reposicionado abaixo do ícone")

    # D1.2 — remove caixa branca sobre ícone
    if "labelBackgroundColor=#ffffff" in style.lower():
        style = re.sub(r";?labelBackgroundColor=#ffffff", "", style, flags=re.IGNORECASE)
        style = re.sub(r"labelBackgroundColor=#ffffff;?", "", style, flags=re.IGNORECASE)
        applied.append("D1.2: labelBackgroundColor branco removido")

    # D1.3 — fontSize mínimo 11
    def bump_fontsize(m):
        val = int(m.group(1))
        if val < 11:
            return f"fontSize=11"
        return m.group(0)
    new_style = re.sub(r"fontSize=(\d+)", bump_fontsize, style)
    if new_style != style:
        style = new_style
        applied.append("D1.3: fontSize aumentado para mínimo 11")

    # D4.2 — arestas de monitoramento sem dashed=1
    # (aplicado separadamente via fix_monitoring_edges)

    # D5.1 — Compute com laranja AWS
    if any(icon in style for icon in ["lambda", "ec2", "ecs", "fargate", "apprunner"]):
        fill = re.search(r"fillColor=([^;\"]+)", style)
        if fill and fill.group(1).lower() not in {"#ff9900", "#e8871a"}:
            style = re.sub(r"fillColor=[^;\"]+", "fillColor=#FF9900", style)
            applied.append("D5.1: fillColor de Compute corrigido para laranja AWS")

    # D5.2 — Database com verde AWS
    if any(icon in style for icon in ["dynamodb", "rds", "aurora", "elasticache"]):
        fill = re.search(r"fillColor=([^;\"]+)", style)
        if fill and fill.group(1).lower() not in {"#1a9c3e", "#3f8624", "#2d8c4e"}:
            style = re.sub(r"fillColor=[^;\"]+", "fillColor=#1A9C3E", style)
            applied.append("D5.2: fillColor de Database corrigido para verde AWS")

    # D5.3 — Segurança com vermelho AWS
    if any(icon in style for icon in ["iam", "waf", "secrets_manager", "shield"]):
        fill = re.search(r"fillColor=([^;\"]+)", style)
        if fill and fill.group(1).lower() not in {"#dd344c", "#b0084d"}:
            style = re.sub(r"fillColor=[^;\"]+", "fillColor=#DD344C", style)
            applied.append("D5.3: fillColor de Segurança corrigido para vermelho AWS")

    # D5.4 — Mensageria com rosa AWS
    if any(icon in style for icon in [";sqs;", ";sns;", "eventbridge", "kinesis"]):
        fill = re.search(r"fillColor=([^;\"]+)", style)
        if fill and fill.group(1).lower() not in {"#e7157b", "#c71585"}:
            style = re.sub(r"fillColor=[^;\"]+", "fillColor=#E7157B", style)
            applied.append("D5.4: fillColor de Mensageria corrigido para rosa AWS")

    # D2.4 — negrito nos labels de ícones AWS (referência: 6.png.webp — labels em bold)
    if "mxgraph.aws4.resourceIcon" in style and "fontStyle=" not in style:
        style = style.rstrip(";") + ";fontStyle=1"
        applied.append("D2.4: fontStyle=1 (bold) adicionado ao ícone AWS")
    elif "mxgraph.aws4.resourceIcon" in style and re.search(r"fontStyle=0\b", style):
        style = re.sub(r"fontStyle=0\b", "fontStyle=1", style)
        applied.append("D2.4: fontStyle corrigido para 1 (bold)")

    # D6.1 — opacidade de zonas > 35
    def clamp_opacity(m):
        val = int(m.group(1))
        if val > 35:
            return "opacity=35"
        return m.group(0)
    new_style = re.sub(r"opacity=(\d+)", clamp_opacity, style)
    if new_style != style:
        style = new_style
        applied.append("D6.1: opacity de zona reduzida para 35")

    # D2.2 — garante que não há atributo width/height no style < 60 (style-based)
    # (geometry é no XML de mxGeometry, tratado em fix_geometries)

    return style, applied


def fix_geometries(content: str) -> tuple[str, list[str]]:
    """Corrige mxGeometry de ícones AWS com width/height < 60."""
    applied = []

    def fix_geo(m):
        attrs = m.group(0)
        # Só aplica se o nó pai for resourceIcon (verificado pelo contexto)
        w = re.search(r'width="(\d+(?:\.\d+)?)"', attrs)
        h = re.search(r'height="(\d+(?:\.\d+)?)"', attrs)
        changed = False
        if w and float(w.group(1)) < 60:
            attrs = attrs.replace(w.group(0), 'width="60"')
            changed = True
        if h and float(h.group(1)) < 60:
            attrs = attrs.replace(h.group(0), 'height="60"')
            changed = True
        if changed:
            applied.append("D2.2: geometry de ícone redimensionado para 60x60")
        return attrs

    # Aplica fix de geometry em mxCell com resourceIcon seguido de mxGeometry
    # Usa regex multiline simples (não parse XML completo para evitar rewrite)
    # Padrão: bloco de mxCell com resourceIcon que contém mxGeometry com width/height pequenos
    pattern = r'(<mxCell[^>]*resourceIcon[^>]*>.*?<mxGeometry[^>]*>)'
    new_content = re.sub(pattern, lambda m: fix_geo(m) if 'resourceIcon' in m.group(0) else m.group(0),
                         content, flags=re.DOTALL)

    # Abordagem mais simples e robusta: regex diretamente no content
    # Encontra mxGeometry com width < 60 ou height < 60 em contexto de resourceIcon
    def fix_resource_icon_geo(full_content):
        lines = full_content.split('\n')
        result = []
        in_resource_icon = False
        fixed = []
        for line in lines:
            if 'resourceIcon' in line:
                in_resource_icon = True
            if in_resource_icon and '<mxGeometry' in line:
                in_resource_icon = False
                w = re.search(r'width="(\d+(?:\.\d+)?)"', line)
                h = re.search(r'height="(\d+(?:\.\d+)?)"', line)
                if w and float(w.group(1)) < 60:
                    line = line.replace(w.group(0), 'width="60"')
                    fixed.append("D2.2: ícone redimensionado para 60px")
                if h and float(h.group(1)) < 60:
                    line = line.replace(h.group(0), 'height="60"')
                    if "D2.2: ícone redimensionado para 60px" not in fixed:
                        fixed.append("D2.2: ícone redimensionado para 60px")
            result.append(line)
        return '\n'.join(result), fixed

    fixed_content, geo_fixes = fix_resource_icon_geo(content)
    applied.extend(list(set(geo_fixes)))
    return fixed_content, applied


def fix_monitoring_edges(content: str) -> tuple[str, list[str]]:
    """Adiciona dashed=1 em arestas de monitoramento sem ele."""
    applied = []
    monitor_keywords = ["cloudwatch", "x-ray", "xray", "alert", "log", "metric",
                        "monitora", "tracing", "observ"]

    def fix_edge(m):
        edge_xml = m.group(0)
        value_m = re.search(r'value="([^"]*)"', edge_xml)
        if not value_m:
            return edge_xml
        value = value_m.group(1).lower()
        if any(kw in value for kw in monitor_keywords):
            if "dashed=1" not in edge_xml:
                # Adiciona dashed=1 ao style
                edge_xml = re.sub(
                    r'(style="[^"]*)"',
                    lambda sm: sm.group(1).rstrip(";") + ";dashed=1\"",
                    edge_xml
                )
                applied.append("D4.2: dashed=1 adicionado em aresta de monitoramento")
        return edge_xml

    new_content = re.sub(
        r'<mxCell[^>]*edge="1"[^>]*>.*?</mxCell>|<mxCell[^>]*edge="1"[^/]*/\s*>',
        fix_edge,
        content,
        flags=re.DOTALL
    )
    return new_content, list(set(applied))


# ─── Orquestrador de fixes ───────────────────────────────────────────────────

def fix_diagram(path: str, dry_run: bool = False, issues_filter: list = None) -> dict:
    content = Path(path).read_text(encoding="utf-8")
    original = content
    all_fixes = []

    # Fix 1: styles (D1.1, D1.2, D1.3, D5.1-D5.4, D6.1)
    def apply_style_fix(m):
        style = m.group(1)
        new_style, fixes = fix_style(style)
        all_fixes.extend(fixes)
        return f'style="{new_style}"'

    content = re.sub(r'style="([^"]*)"', apply_style_fix, content)

    # Fix 2: geometries (D2.2)
    content, geo_fixes = fix_geometries(content)
    all_fixes.extend(geo_fixes)

    # Fix 3: monitoring edges (D4.2)
    content, edge_fixes = fix_monitoring_edges(content)
    all_fixes.extend(edge_fixes)

    # Deduplica fixes
    unique_fixes = list(dict.fromkeys(all_fixes))
    changed = content != original

    if changed and not dry_run:
        Path(path).write_text(content, encoding="utf-8")

    return {
        "file": path,
        "modified": changed,
        "dry_run": dry_run,
        "fixes_applied": unique_fixes,
        "fixes_count": len(unique_fixes),
    }


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    if not args:
        print("Uso: python3 aws-arch-fixer.py arquivo.drawio [--dry-run] [--issues '[...]']")
        sys.exit(1)

    path = args[0]
    dry_run = "--dry-run" in args
    json_mode = "--json" in args

    issues_filter = None
    if "--issues" in args:
        idx = args.index("--issues")
        if idx + 1 < len(args):
            issues_filter = json.loads(args[idx + 1])

    if not Path(path).exists():
        print(f"Erro: arquivo não encontrado: {path}", file=sys.stderr)
        sys.exit(1)

    result = fix_diagram(path, dry_run=dry_run, issues_filter=issues_filter)

    if json_mode:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return

    action = "SIMULADO (dry-run)" if dry_run else "APLICADO"
    print(f"\n{'='*55}")
    print(f"  aws-arch-fixer — {action}")
    print(f"  Arquivo: {Path(path).name}")
    print(f"{'='*55}")
    if result["fixes_applied"]:
        print(f"\n✅ {len(result['fixes_applied'])} tipo(s) de fix aplicado(s):")
        for fix in result["fixes_applied"]:
            print(f"  → {fix}")
    else:
        print("\n✅ Nenhuma correção AUTO necessária.")
    print()


if __name__ == "__main__":
    main()
