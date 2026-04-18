#!/usr/bin/env python3
"""
aws-arch-scorer.py — Avaliador de diagramas AWS draw.io
Rubrica baseada em TODAS as 7 imagens de referência em:
  docs/architecture/exemples_draws/   ← TODAS são 100pts

Padrões UNIVERSAIS extraídos das 7 imagens (presentes em todas):
  - Labels SEMPRE abaixo dos ícones (nunca sobrepostos)
  - Ícone AWS real específico por serviço (da biblioteca icons.png)
  - Fundo branco limpo, sem textura ou grid
  - Setas direcionais mostrando fluxo
  - Espaçamento generoso entre ícones

Padrões SITUACIONAIS (presentes em parte das imagens):
  - Containers com títulos (example_draw_100, 3.png, 001_reinforce)
  - Setas numeradas em círculos (example_draw_100, 1.png, 001_reinforce)
  - Atores externos separados (example_draw, example_draw_100)
  - Logo AWS + header "AWS Cloud" (3.png, 001_reinforce)
  - Hierarquia Region > VPC (1.png, 3.png)
  - Labels em negrito (6.png)
  - Multi-account com sub-flows (001_reinforce)
  - Flow puro sem containers (6.png — também é 100pts)

Uso:
  python3 aws-arch-scorer.py arquivo.drawio
  python3 aws-arch-scorer.py arquivo.drawio --json
  python3 aws-arch-scorer.py arquivo.drawio --quiet
"""

import re
import sys
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import defaultdict


# ─── Helpers ────────────────────────────────────────────────────────────────

def parse_drawio(path: str):
    content = Path(path).read_text(encoding="utf-8")
    root = ET.fromstring(content)
    return root, content


def get_cells(root):
    return root.findall(".//mxCell")


def get_geometry(cell):
    geo = cell.find("mxGeometry")
    if geo is None:
        return None
    return (
        float(geo.get("x", 0)),
        float(geo.get("y", 0)),
        float(geo.get("width", 0)),
        float(geo.get("height", 0)),
    )


def is_aws_icon(cell):
    style = cell.get("style", "")
    return "mxgraph.aws4.resourceIcon" in style or "mxgraph.aws4.user" in style


def is_edge(cell):
    return cell.get("edge") == "1"


def get_res_icon(style: str) -> str:
    m = re.search(r"resIcon=mxgraph\.aws4\.(\w+)", style)
    return m.group(1).lower() if m else ""


def get_style_value(style: str, key: str):
    m = re.search(rf"{re.escape(key)}=([^;\"]+)", style)
    return m.group(1) if m else None


# ─── D1 — Ícones AWS Corretos e Legíveis (20 pts) ───────────────────────────
# Referência: ambas as imagens usam ícones AWS modernos (quadrados, coloridos)
# com resIcon específico por serviço. Nenhum retângulo genérico para serviços AWS.

COMPUTE_ICONS = {"lambda", "ec2", "ecs", "fargate", "apprunner", "beanstalk",
                 "batch", "eks", "lightsail"}
DATABASE_ICONS = {"dynamodb", "rds", "aurora", "elasticache", "redshift",
                  "neptune", "timestream", "documentdb"}
SECURITY_ICONS = {"iam", "waf", "cognito", "secrets_manager", "shield",
                  "inspector", "macie", "guardduty", "identity_and_access_management"}
MESSAGING_ICONS = {"sqs", "sns", "eventbridge", "kinesis", "mq"}
STORAGE_ICONS = {"s3", "efs", "fsx", "storage_gateway"}
NETWORK_ICONS = {"cloudfront", "api_gateway", "alb", "nlb", "elb", "route53",
                 "vpn", "direct_connect", "transit_gateway"}
AI_ICONS = {"bedrock", "sagemaker", "comprehend", "rekognition", "textract",
            "polly", "transcribe", "translate", "lex"}

KNOWN_ICONS = (COMPUTE_ICONS | DATABASE_ICONS | SECURITY_ICONS |
               MESSAGING_ICONS | STORAGE_ICONS | NETWORK_ICONS | AI_ICONS)

CORRECT_COLORS = {
    "compute":   {"#ff9900", "#e8871a"},
    "database":  {"#1a9c3e", "#3f8624", "#2d8c4e"},
    "security":  {"#dd344c", "#b0084d", "#bf0816"},
    "messaging": {"#e7157b", "#c71585"},
    "storage":   {"#3f8624", "#1a9c3e", "#277116"},
    "network":   {"#8c4fff", "#232f3e", "#e7157b"},
}


def score_d1(cells) -> dict:
    """
    D1 — Ícones AWS Corretos (20 pts)
    Referência: cada serviço tem seu ícone específico AWS, não retângulo genérico.
    - D1.1 (10): % de nós de serviço com resourceIcon real
    - D1.2  (5): resIcon específico presente (não genérico)
    - D1.3  (5): cores corretas por categoria (laranja=Compute, verde=DB, etc.)
    """
    issues = []
    score = 0

    service_nodes = [
        c for c in cells
        if c.get("vertex") == "1"
        and not is_edge(c)
        and c.get("id") not in ("0", "1")
        and c.get("value", "").strip()
        and len(c.get("value", "").strip()) > 1
        and "text;" not in c.get("style", "")
        and c.get("edge") != "1"
    ]

    # Filtrar: manter apenas nós que PARECEM ser serviços/componentes AWS
    # Excluir: containers de fundo, badges de fase, caixas de texto, legendas, info boxes
    NON_SERVICE_PREFIXES = ("💰", "💡", "🔑", "─", "Legenda", "Borda", "✦", "F1", "F2", "F3")
    service_nodes = [
        c for c in service_nodes
        # Não é swimlane
        if "swimlane" not in c.get("style", "")
        # Não é zona de fundo (tem opacity)
        and "opacity=" not in c.get("style", "")
        # Não é caixa de texto/info (align=left sem ícone AWS)
        and not ("align=left" in c.get("style", "")
                 and "resourceIcon" not in c.get("style", "")
                 and "mxgraph.aws4.user" not in c.get("style", ""))
        # Não é badge de legenda/fase (texto branco sobre cor sólida)
        and not ("fontColor=#ffffff" in c.get("style", "")
                 and "fillColor=" in c.get("style", "")
                 and "resourceIcon" not in c.get("style", "")
                 and "mxgraph.aws4.user" not in c.get("style", ""))
        # Não é caixa de rodapé (fillColor info-box)
        and not (c.get("style", "").startswith("rounded=1;fillColor=#f")
                 and "resourceIcon" not in c.get("style", ""))
        # Não começa com prefix de não-serviço
        and not c.get("value", "").startswith(NON_SERVICE_PREFIXES)
    ]

    # shape=mxgraph.aws4.user é um ícone AWS válido (conta como aws_node mesmo sem resourceIcon)
    aws_user_nodes = [c for c in service_nodes if "mxgraph.aws4.user" in c.get("style", "")]

    # shape=mxgraph.aws4.user conta como ícone AWS válido
    aws_nodes = [c for c in service_nodes
                 if "resourceIcon" in c.get("style", "") or "mxgraph.aws4.user" in c.get("style", "")]
    total = len(service_nodes)

    # D1.1 — proporção com ícone AWS real (10 pts)
    if total > 0:
        ratio = len(aws_nodes) / total
        d1_1 = round(10 * ratio)
    else:
        ratio = 0
        d1_1 = 0
    score += d1_1
    if ratio < 1.0:
        non_icon = [c.get("id", "?") for c in service_nodes
                    if "resourceIcon" not in c.get("style", "")
                    and "mxgraph.aws4.user" not in c.get("style", "")][:5]
        issues.append({
            "id": "D1.1",
            "description": f"{len(aws_nodes)}/{total} nós usam ícone AWS real ({int(ratio*100)}%). "
                           f"Referência: todos os serviços devem usar shape=mxgraph.aws4.resourceIcon",
            "affected_ids": non_icon,
            "points_lost": 10 - d1_1,
            "fix_type": "ALERT",
            "reference": "Ver example_draw_100.png — todos serviços têm ícone AWS colorido",
        })

    # D1.2 — resIcon específico presente (5 pts)
    # mxgraph.aws4.user é um shape autônomo, não usa resIcon — excluir do check
    no_resicon = [c.get("id", "?") for c in aws_nodes
                  if "resIcon=mxgraph.aws4." not in c.get("style", "")
                  and "mxgraph.aws4.user" not in c.get("style", "")]
    d1_2_penalty = min(5, len(no_resicon))
    if no_resicon:
        issues.append({
            "id": "D1.2",
            "description": f"{len(no_resicon)} ícone(s) sem resIcon específico de serviço",
            "affected_ids": no_resicon,
            "points_lost": d1_2_penalty,
            "fix_type": "ALERT",
        })
    score += max(0, 5 - d1_2_penalty)

    # D1.3 — cores corretas por categoria (5 pts)
    wrong_colors = []
    for c in aws_nodes:
        style = c.get("style", "")
        icon = get_res_icon(style)
        fill = (get_style_value(style, "fillColor") or "").lower()
        if not fill:
            continue
        if icon in COMPUTE_ICONS and fill not in CORRECT_COLORS["compute"]:
            wrong_colors.append(c.get("id", "?"))
        elif icon in DATABASE_ICONS and fill not in CORRECT_COLORS["database"]:
            wrong_colors.append(c.get("id", "?"))
        elif icon in SECURITY_ICONS and fill not in CORRECT_COLORS["security"]:
            wrong_colors.append(c.get("id", "?"))
        elif icon in MESSAGING_ICONS and fill not in CORRECT_COLORS["messaging"]:
            wrong_colors.append(c.get("id", "?"))
    d1_3_penalty = min(5, len(wrong_colors))
    if wrong_colors:
        issues.append({
            "id": "D1.3",
            "description": f"{len(wrong_colors)} ícone(s) com cor incorreta para sua categoria. "
                           f"Referência: 🟠Compute=#FF9900 🟢DB=#1A9C3E 🔴Seg=#DD344C 🔴Msg=#E7157B",
            "affected_ids": wrong_colors,
            "points_lost": d1_3_penalty,
            "fix_type": "AUTO",
        })
    score += max(0, 5 - d1_3_penalty)

    return {"score": score, "max": 20, "issues": issues}


# ─── D2 — Labels Abaixo dos Ícones (15 pts) ─────────────────────────────────
# Referência: em AMBAS as imagens, o texto está sempre ABAIXO do ícone.
# Nunca há texto dentro/em cima do ícone. Este é o critério mais básico
# e mais impactante visualmente.

def score_d2(cells) -> dict:
    """
    D2 — Labels Abaixo dos Ícones (15 pts)
    - D2.1 (10): verticalLabelPosition=bottom em todos ícones AWS
    - D2.2  (3): sem labelBackgroundColor branco (caixa sobre ícone)
    - D2.3  (2): fontSize >= 11 (legibilidade mínima)
    """
    issues = []
    score = 0

    aws_resourceIcon = [c for c in cells if "resourceIcon" in c.get("style", "")]

    # D2.1 — verticalLabelPosition=bottom (10 pts)
    violators = [c for c in aws_resourceIcon
                 if "verticalLabelPosition=bottom" not in c.get("style", "")]
    if not violators:
        score += 10
    else:
        penalty = min(10, len(violators) * 2)
        score += max(0, 10 - penalty)
        issues.append({
            "id": "D2.1",
            "description": f"{len(violators)} ícone(s) com label sobreposto ao ícone. "
                           f"Referência: em example_draw_100.png TODOS os labels estão abaixo.",
            "affected_ids": [c.get("id", "?") for c in violators],
            "points_lost": penalty,
            "fix_type": "AUTO",
            "reference": "Adicionar: labelPosition=center;verticalLabelPosition=bottom;verticalAlign=top",
        })

    # D2.2 — sem caixa branca sobre ícone (3 pts)
    white_bg = [c.get("id", "?") for c in cells
                if "labelBackgroundColor=#ffffff" in c.get("style", "").lower()]
    if not white_bg:
        score += 3
    else:
        issues.append({
            "id": "D2.2",
            "description": f"{len(white_bg)} nó(s) com retângulo branco sobre o ícone (labelBackgroundColor=#ffffff)",
            "affected_ids": white_bg,
            "points_lost": 3,
            "fix_type": "AUTO",
        })

    # D2.3 — fontSize >= 11 em todos elementos (1 pt)
    small = [c.get("id", "?") for c in cells
             if re.search(r"fontSize=([1-9]|10)\b", c.get("style", ""))]
    if not small:
        score += 1
    else:
        issues.append({
            "id": "D2.3",
            "description": f"{len(small)} elemento(s) com fontSize < 11 (ilegível)",
            "affected_ids": small[:5],
            "points_lost": 1,
            "fix_type": "AUTO",
        })

    # D2.4 — labels em negrito nos ícones AWS (1 pt)
    # Referência 6.png.webp: "S3 Bucket", "Lambda Function" em bold (fontStyle=1)
    aws_icon_cells = [c for c in cells if "resourceIcon" in c.get("style", "")]
    non_bold = [c.get("id", "?") for c in aws_icon_cells
                if "fontStyle=1" not in c.get("style", "")]
    if len(non_bold) <= len(aws_icon_cells) * 0.2:  # até 20% sem bold é aceitável
        score += 1
    else:
        issues.append({
            "id": "D2.4",
            "description": f"{len(non_bold)} ícone(s) com label sem negrito. "
                           f"Referência 6.png.webp: labels em bold (fontStyle=1) são padrão.",
            "affected_ids": non_bold[:5],
            "points_lost": 1,
            "fix_type": "AUTO",
        })

    return {"score": score, "max": 15, "issues": issues}


# ─── D3 — Containers e Agrupamento Lógico (20 pts) ───────────────────────────
# Referência PRINCIPAL: example_draw_100.png mostra claramente
# containers com nomes ("front end", "backend", "region", "VPC")
# com bordas coloridas (laranja para região AWS, roxo/azul para outros).
# example_draw.png mostra "Clients" e "BackOffice VMs" como containers externos.

def score_d3(cells) -> dict:
    """
    D3 — Containers e Agrupamento (20 pts)
    - D3.1  (8): Containers nomeados com título (como front end/backend/VPC na referência)
    - D3.2  (5): Pelo menos 3 grupos lógicos distintos detectados
    - D3.3  (4): Legenda presente com texto "Legenda"
    - D3.4  (3): Fluxo com pelo menos 3 bandas X ou Y distintas (layout direcional)
    """
    issues = []
    score = 0

    all_cells = cells

    # D3.1 — Containers/grupos nomeados (8 pts)
    # Referência: os containers têm título ("front end", "backend", "VPC", "region")
    # No draw.io: swimlane OU container=1 OU célula com fillColor+opacity como zona de fundo nomeada
    containers = []
    for c in all_cells:
        style = c.get("style", "")
        value = c.get("value", "").strip()
        if not value or c.get("id") in ("0", "1"):
            continue
        is_container = (
            "swimlane" in style
            or "container=1" in style
            or "shape=pool" in style
            # Zonas de fundo com nome são containers visuais
            or ("fillColor=" in style and "opacity=" in style and len(value) > 2
                and c.get("vertex") == "1" and not is_edge(c))
        )
        if is_container:
            containers.append(c)

    if len(containers) >= 3:
        score += 8
    elif len(containers) >= 1:
        score += 4
        issues.append({
            "id": "D3.1",
            "description": f"Apenas {len(containers)} container(s) detectado(s). "
                           f"Referência: example_draw_100.png tem 4+ grupos (front end, backend, VPC, region).",
            "affected_ids": [],
            "points_lost": 4,
            "fix_type": "GENERATE",
            "reference": "Adicionar containers com swimlane ou grupos de fundo nomeados",
        })
    else:
        issues.append({
            "id": "D3.1",
            "description": "Nenhum container/agrupamento detectado. "
                           "Referência: separar serviços em grupos lógicos (frontend/backend/data/security).",
            "affected_ids": [],
            "points_lost": 8,
            "fix_type": "GENERATE",
            "reference": "Ver example_draw_100.png: front end, backend, region, VPC",
        })

    # D3.2 — Pelo menos 3 grupos distintos (5 pts)
    if len(containers) >= 3:
        score += 5
    elif len(containers) >= 2:
        score += 2
        issues.append({
            "id": "D3.2",
            "description": f"Apenas {len(containers)} grupos. Mínimo 3 para separação lógica adequada.",
            "affected_ids": [],
            "points_lost": 3,
            "fix_type": "GENERATE",
        })
    else:
        issues.append({
            "id": "D3.2",
            "description": "Grupos insuficientes para representar separação de responsabilidades.",
            "affected_ids": [],
            "points_lost": 5,
            "fix_type": "GENERATE",
        })

    # D3.3 — Legenda com texto "Legenda" (4 pts)
    has_legend = any(
        "legenda" in c.get("value", "").lower() or "legend" in c.get("value", "").lower()
        for c in all_cells
    )
    if has_legend:
        score += 4
    else:
        issues.append({
            "id": "D3.3",
            "description": "Legenda ausente. Adicionar célula com texto 'Legenda:' explicando cores e tipos de seta.",
            "affected_ids": [],
            "points_lost": 4,
            "fix_type": "GENERATE",
        })

    # D3.4 — Distribuição direcional (3 pts)
    # Referência: example_draw_100.png tem fluxo claramente da esquerda para direita
    aws_cells = [c for c in all_cells if "resourceIcon" in c.get("style", "")]
    xs = [get_geometry(c)[0] for c in aws_cells if get_geometry(c)]

    if xs:
        x_range = max(xs) - min(xs)
        # Diagrama com spread horizontal mínimo de 400px = tem layout direcional
        if x_range >= 400:
            score += 3
        else:
            issues.append({
                "id": "D3.4",
                "description": f"Serviços muito agrupados horizontalmente (spread X={int(x_range)}px). "
                               f"Referência: layout direcional claro (esq→dir ou cima→baixo).",
                "affected_ids": [],
                "points_lost": 3,
                "fix_type": "ALERT",
            })
    else:
        score += 3  # sem ícones AWS, não penalizar

    return {"score": score, "max": 20, "issues": issues}


# ─── D4 — Fluxo Numerado e Rotulado (20 pts) ─────────────────────────────────
# Referência PRINCIPAL: example_draw_100.png tem setas NUMERADAS (1-14)
# com círculos nos conectores mostrando a sequência exata do fluxo.
# Cada seta tem um label ou número identificando o passo.
# example_draw.png também tem setas rotuladas com nomes de serviços.

def score_d4(cells) -> dict:
    """
    D4 — Fluxo Numerado e Rotulado (20 pts)
    - D4.1 (10): % de arestas com label (protocolo, ação ou número de passo)
    - D4.2  (6): Setas de monitoramento/validação com dashed=1
    - D4.3  (4): Pelo menos 1 aresta com número de sequência (fluxo numerado)
    """
    issues = []
    score = 0

    edges = [c for c in cells if is_edge(c) and c.get("source") and c.get("target")]

    if not edges:
        issues.append({
            "id": "D4.0",
            "description": "Nenhuma aresta source→target detectada.",
            "affected_ids": [],
            "points_lost": 20,
            "fix_type": "ALERT",
        })
        return {"score": 0, "max": 20, "issues": issues}

    # D4.1 — proporção de arestas com label (10 pts)
    labeled = [e for e in edges if e.get("value", "").strip()]
    ratio = len(labeled) / len(edges)
    d4_1 = round(10 * ratio)
    score += d4_1

    unlabeled = [e.get("id", "?") for e in edges if not e.get("value", "").strip()]
    if unlabeled:
        issues.append({
            "id": "D4.1",
            "description": f"{len(unlabeled)}/{len(edges)} aresta(s) sem label ({int(ratio*100)}% rotuladas). "
                           f"Referência: example_draw_100.png tem TODAS as setas numeradas ou descritas.",
            "affected_ids": unlabeled,
            "points_lost": 10 - d4_1,
            "fix_type": "ALERT",
            "reference": "Adicionar label em cada seta: protocolo (HTTPS), ação (POST /rota) ou número do passo",
        })

    # D4.2 — arestas de monitoramento com dashed=1 (6 pts)
    monitor_keywords = {"cloudwatch", "x-ray", "xray", "alert", "log", "metric",
                        "monitora", "tracing", "observ", "alarm"}
    monitor_edges = [e for e in edges
                     if any(kw in e.get("value", "").lower() for kw in monitor_keywords)]
    wrong_monitor = [e.get("id", "?") for e in monitor_edges
                     if "dashed=1" not in e.get("style", "")]
    d4_2_penalty = min(6, len(wrong_monitor) * 2)
    if wrong_monitor:
        issues.append({
            "id": "D4.2",
            "description": f"{len(wrong_monitor)} aresta(s) de monitoramento sem dashed=1. "
                           f"Referência: setas de validação/monitoramento devem ser tracejadas.",
            "affected_ids": wrong_monitor,
            "points_lost": d4_2_penalty,
            "fix_type": "AUTO",
        })
    score += max(0, 6 - d4_2_penalty)

    # D4.3 — fluxo numerado (4 pts)
    # Referência example_draw_100.png: círculos LARANJA com números (1→14)
    # Referência 1.png.webp: círculos PRETOS com números (④ ⑫ ⑬ ⑭)
    # Referência 001_reinforce2023: quadrados COLORIDOS com números
    # Referência 3.png e 6.png: SEM numeração — flow linear/fanout dispensa números
    # → Numeração não é obrigatória se o layout for autoexplicativo (linear ou fanout)

    numbered_edges = [
        e for e in edges
        if re.match(r"^\s*\d+\s*$", e.get("value", ""))
        or re.search(r"[\①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]", e.get("value", ""))
    ]
    numbered_badges = [
        c for c in cells
        if re.match(r"^\s*\d+\s*$", c.get("value", ""))
        and ("ellipse" in c.get("style", "") or "rounded=1" in c.get("style", ""))
        and c.get("vertex") == "1"
        and get_geometry(c) is not None
        and get_geometry(c)[2] <= 40  # badge pequeno (≤ 40px)
    ]

    # Heurística: se o diagrama tem poucos edges (≤ 6) e fluxo linear,
    # a numeração é menos crítica (como em 3.png e 6.png)
    flow_is_linear = len(edges) <= 8

    if numbered_edges or numbered_badges:
        score += 4
    elif flow_is_linear:
        # Flow linear/fanout — numeração opcional (3.png, 6.png são 100pts sem ela)
        score += 2
        issues.append({
            "id": "D4.3",
            "description": f"Fluxo sem numeração de passos ({len(edges)} arestas). "
                           f"Para fluxos complexos (>8 setas), numeração é essencial.",
            "affected_ids": [],
            "points_lost": 2,
            "fix_type": "GENERATE",
            "reference": "example_draw_100.png e 1.png.webp: números em círculos (laranja ou preto) nas setas",
        })
    else:
        issues.append({
            "id": "D4.3",
            "description": f"Fluxo complexo ({len(edges)} arestas) sem numeração de passos. "
                           f"Referência: circles com números (①②③) tornam o fluxo compreensível.",
            "affected_ids": [],
            "points_lost": 4,
            "fix_type": "GENERATE",
            "reference": "Usar ellipse pequena (24x24) com número + fillColor=#FF9900 ou #232F3E",
        })

    return {"score": score, "max": 20, "issues": issues}


# ─── D5 — Título, Subtítulo e Contexto (10 pts) ──────────────────────────────
# Referência: example_draw_100.png tem:
#   Título: "Distributed Load Testing on AWS" (bold, grande)
#   Subtítulo: "For the architecture description, refer to the full diagram."
#   Logo AWS no rodapé
# example_draw.png tem: "Vinci Retirement Services Topology" como título

def score_d5(cells) -> dict:
    """
    D5 — Título e Contexto (10 pts)
    - D5.1 (6): Título com fontSize >= 18 e fontStyle=1 (bold)
    - D5.2 (4): Subtítulo OU descrição OU rodapé informativo presente
    """
    issues = []
    score = 0

    # D5.1 — título bold grande (6 pts)
    title_cell = None
    for c in cells:
        style = c.get("style", "")
        value = c.get("value", "").strip()
        if not value or len(value) < 8 or is_edge(c):
            continue
        fsize = get_style_value(style, "fontSize")
        fstyle = get_style_value(style, "fontStyle")
        if fsize and int(fsize) >= 18 and fstyle == "1":
            title_cell = c
            break
    if title_cell:
        score += 6
    else:
        # Tentar título com fontSize >= 16 sem bold
        for c in cells:
            style = c.get("style", "")
            value = c.get("value", "").strip()
            if not value or len(value) < 8 or is_edge(c):
                continue
            fsize = get_style_value(style, "fontSize")
            if fsize and int(fsize) >= 16:
                score += 3
                issues.append({
                    "id": "D5.1",
                    "description": "Título presente mas sem bold (fontStyle=1). "
                                   "Referência: 'Distributed Load Testing on AWS' é bold.",
                    "affected_ids": [c.get("id", "?")],
                    "points_lost": 3,
                    "fix_type": "AUTO",
                })
                break
        else:
            issues.append({
                "id": "D5.1",
                "description": "Título executivo ausente. "
                               "Referência: exemplo tem título bold grande no topo (fontSize>=18, fontStyle=1).",
                "affected_ids": [],
                "points_lost": 6,
                "fix_type": "GENERATE",
            })

    # D5.2 — subtítulo / rodapé / descrição (4 pts)
    # Detecta: célula de texto menor que o título com valor descritivo (>20 chars)
    # OU legenda de rodapé OU caixa de custo
    has_context = False
    for c in cells:
        style = c.get("style", "")
        value = c.get("value", "").strip()
        if not value or len(value) < 20 or is_edge(c):
            continue
        if "text;" in style or "fillColor=#f5f5f5" in style or "fillColor=#fff2cc" in style:
            has_context = True
            break
    if has_context:
        score += 4
    else:
        issues.append({
            "id": "D5.2",
            "description": "Ausência de subtítulo, descrição ou caixa informativa. "
                           "Referência: exemplo tem subtítulo e logo AWS no rodapé.",
            "affected_ids": [],
            "points_lost": 4,
            "fix_type": "GENERATE",
        })

    return {"score": score, "max": 10, "issues": issues}


# ─── D6 — Atores Externos e Entidades Externas (8 pts) ───────────────────────
# Referência: example_draw.png tem caixa "Clients" e "BackOffice VMs" claramente
# separadas dos serviços AWS. example_draw_100.png tem o container externo com
# "web console" fora da infraestrutura AWS.

def score_d6(cells) -> dict:
    """
    D6 — Atores Externos (8 pts)
    - D6.1 (5): Pelo menos 1 ator externo (user, browser, cliente, parceiro)
    - D6.2 (3): Ator externo visualmente separado (fora dos containers AWS)
    """
    issues = []
    score = 0

    # Detectar ator externo
    external_patterns = [
        "mxgraph.aws4.user",
        "mxgraph.aws4.traditional_server",
        "shape=mxgraph.cisco",
        "shape=mxgraph.network",
    ]
    external_keywords = ["browser", "client", "cliente", "usuário", "usuario",
                         "partner", "parceiro", "mobile", "app", "web console",
                         "backoffice", "back office"]

    has_external_icon = any(
        any(p in c.get("style", "") for p in external_patterns)
        for c in cells
    )
    has_external_label = any(
        any(kw in c.get("value", "").lower() for kw in external_keywords)
        for c in cells
        if c.get("vertex") == "1" and not is_edge(c)
    )

    if has_external_icon or has_external_label:
        score += 5
        # D6.2 — verificar se está fora dos containers (heurística: x < 100 ou y < 100)
        ext_cells = [c for c in cells
                     if (any(p in c.get("style", "") for p in external_patterns)
                         or any(kw in c.get("value", "").lower() for kw in external_keywords))
                     and c.get("vertex") == "1"]
        if ext_cells:
            geo = get_geometry(ext_cells[0])
            if geo and (geo[0] < 200 or geo[0] > 1400):  # está nas bordas
                score += 3
            else:
                score += 2
                issues.append({
                    "id": "D6.2",
                    "description": "Ator externo pode não estar claramente separado dos serviços AWS. "
                                   "Referência: 'Clients' está em caixa separada à esquerda do diagrama.",
                    "affected_ids": [ext_cells[0].get("id", "?")],
                    "points_lost": 1,
                    "fix_type": "ALERT",
                })
    else:
        issues.append({
            "id": "D6.1",
            "description": "Nenhum ator externo detectado (Browser, Cliente, App, Usuário). "
                           "Referência: example_draw.png tem 'Clients' e 'BackOffice VMs' como entidades externas.",
            "affected_ids": [],
            "points_lost": 8,
            "fix_type": "GENERATE",
            "reference": "Adicionar shape=mxgraph.aws4.user ou caixa 'Cliente' conectada ao ponto de entrada",
        })

    return {"score": score, "max": 8, "issues": issues}


# ─── D7 — Qualidade Visual e Completude (7 pts) ──────────────────────────────
# Critérios de polish final: espaçamento, opacidade, observabilidade, segurança.

def score_d7(cells) -> dict:
    """
    D7 — Qualidade Visual e Completude (7 pts)
    - D7.1 (2): opacity <= 35 nas zonas de fundo
    - D7.2 (2): serviço de Observabilidade presente (CloudWatch/X-Ray)
    - D7.3 (2): serviço de Segurança/Auth presente (IAM/WAF/Cognito)
    - D7.4 (1): sem ícones sobrepostos (y-diff >= 130px na mesma coluna)
    """
    issues = []
    score = 0

    # D7.1 — opacidade (2 pts)
    high_opacity = [c.get("id", "?") for c in cells
                    if re.search(r"opacity=(\d+)", c.get("style", ""))
                    and int(re.search(r"opacity=(\d+)", c.get("style", "")).group(1)) > 35]
    if not high_opacity:
        score += 2
    else:
        issues.append({
            "id": "D7.1",
            "description": f"{len(high_opacity)} zona(s) com opacity > 35 (encobre ícones)",
            "affected_ids": high_opacity,
            "points_lost": min(2, len(high_opacity)),
            "fix_type": "AUTO",
        })
        score += max(0, 2 - len(high_opacity))

    # D7.2 — observabilidade (2 pts)
    all_resicons = {get_res_icon(c.get("style", "")) for c in cells}
    obs_icons = {"cloudwatch", "xray", "x_ray"}
    if obs_icons & all_resicons:
        score += 2
    else:
        issues.append({
            "id": "D7.2",
            "description": "Nenhum serviço de Observabilidade (CloudWatch, X-Ray). Arquitetura incompleta.",
            "affected_ids": [],
            "points_lost": 2,
            "fix_type": "ALERT",
        })

    # D7.3 — segurança (2 pts)
    auth_icons = {"cognito", "iam", "waf", "secrets_manager",
                  "identity_and_access_management", "shield"}
    if auth_icons & all_resicons:
        score += 2
    else:
        issues.append({
            "id": "D7.3",
            "description": "Nenhum serviço de Segurança/Auth (IAM, Cognito, WAF, Secrets Manager).",
            "affected_ids": [],
            "points_lost": 2,
            "fix_type": "ALERT",
        })

    # D7.4 — sem sobreposição de ícones (1 pt)
    aws_cells = [c for c in cells if "resourceIcon" in c.get("style", "")]
    overlapping = []
    for i, c1 in enumerate(aws_cells):
        g1 = get_geometry(c1)
        if not g1:
            continue
        for c2 in aws_cells[i + 1:]:
            g2 = get_geometry(c2)
            if g2 and abs(g1[0] - g2[0]) <= 20 and abs(g1[1] - g2[1]) < 130:
                overlapping.append(f"{c1.get('id','?')}↔{c2.get('id','?')}")
    if not overlapping:
        score += 1
    else:
        issues.append({
            "id": "D7.4",
            "description": f"{len(overlapping)} par(es) de ícones sobrepostos (y-diff < 130px, x similar)",
            "affected_ids": overlapping[:3],
            "points_lost": 1,
            "fix_type": "ALERT",
        })

    return {"score": score, "max": 7, "issues": issues}


# ─── Estratégia de convergência ──────────────────────────────────────────────

def classify_strategy(d1, d2, d3, d4, d5) -> str:
    if d2["score"] < 10:
        return "FOCUS_LABELS"  # labels sobrepostos — problema mais visível
    if d1["score"] < 12:
        return "FOCUS_ICONS"   # ícones genéricos
    if d4["score"] < 12:
        return "FOCUS_FLOW"    # setas sem label ou sem numeração
    if d3["score"] < 12:
        return "FOCUS_STRUCTURE"  # falta de containers
    if d5["score"] < 6:
        return "FOCUS_TITLE"
    return "GENERAL_IMPROVEMENT"


# ─── Orquestrador ────────────────────────────────────────────────────────────

def score_diagram(path: str) -> dict:
    root, content = parse_drawio(path)
    cells = get_cells(root)

    d1 = score_d1(cells)
    d2 = score_d2(cells)
    d3 = score_d3(cells)
    d4 = score_d4(cells)
    d5 = score_d5(cells)
    d6 = score_d6(cells)
    d7 = score_d7(cells)

    total = sum(d["score"] for d in [d1, d2, d3, d4, d5, d6, d7])
    all_issues = []
    for d in [d1, d2, d3, d4, d5, d6, d7]:
        all_issues.extend(d["issues"])
    all_issues.sort(key=lambda i: i["points_lost"], reverse=True)

    breakdown = {
        "D1_icones_aws":         {"score": d1["score"], "max": d1["max"]},
        "D2_labels_abaixo":      {"score": d2["score"], "max": d2["max"]},
        "D3_containers_grupos":  {"score": d3["score"], "max": d3["max"]},
        "D4_fluxo_numerado":     {"score": d4["score"], "max": d4["max"]},
        "D5_titulo_contexto":    {"score": d5["score"], "max": d5["max"]},
        "D6_atores_externos":    {"score": d6["score"], "max": d6["max"]},
        "D7_qualidade_visual":   {"score": d7["score"], "max": d7["max"]},
    }

    auto_pts = sum(i["points_lost"] for i in all_issues if i["fix_type"] == "AUTO")

    return {
        "file": path,
        "score": total,
        "max": 100,
        "approved": total >= 80,
        "strategy": classify_strategy(d1, d2, d3, d4, d5),
        "breakdown": breakdown,
        "issues": all_issues,
        "auto_fixable_points": auto_pts,
        "projected_after_auto": min(100, total + auto_pts),
        "reference_images": [
            "docs/architecture/exemples_draws/example_draw_100.png (= 100pts)",
            "docs/architecture/exemples_draws/example_draw.png (referência visual)",
        ],
    }


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    if not args:
        print("Uso: python3 aws-arch-scorer.py arquivo.drawio [--json|--quiet]")
        sys.exit(1)

    path = args[0]
    json_mode = "--json" in args
    quiet_mode = "--quiet" in args

    if not Path(path).exists():
        print(f"Erro: arquivo não encontrado: {path}", file=sys.stderr)
        sys.exit(1)

    result = score_diagram(path)

    if json_mode:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return

    if quiet_mode:
        print(result["score"])
        return

    status = "✅ APROVADO" if result["approved"] else "❌ REPROVADO"
    print(f"\n{'='*65}")
    print(f"  {status}  |  Score: {result['score']}/100")
    print(f"  Arquivo: {Path(path).name}")
    print(f"  Estratégia: {result['strategy']}")
    print(f"  Referência: example_draw_100.png = 100pts")
    print(f"{'='*65}")
    print("\n📊 Breakdown por dimensão (baseado nas imagens de referência):")
    for dim, vals in result["breakdown"].items():
        bar_filled = int((vals["score"] / vals["max"]) * 20)
        bar = "█" * bar_filled + "░" * (20 - bar_filled)
        pct = int(vals["score"] / vals["max"] * 100)
        print(f"  {dim:<30} [{bar}] {vals['score']:>2}/{vals['max']} ({pct}%)")

    if result["issues"]:
        print(f"\n🔍 Issues ({len(result['issues'])}) — ordenados por impacto:")
        for issue in result["issues"]:
            fix_icon = {"AUTO": "🔧", "ALERT": "⚠️ ", "GENERATE": "✨"}.get(issue["fix_type"], "?")
            ids_str = ""
            if issue.get("affected_ids"):
                ids_str = f"\n      IDs: {', '.join(str(i) for i in issue['affected_ids'][:4])}"
            ref_str = ""
            if issue.get("reference"):
                ref_str = f"\n      📌 {issue['reference']}"
            print(f"  {fix_icon} [{issue['id']}] -{issue['points_lost']}pts  {issue['description']}{ids_str}{ref_str}")
    else:
        print("\n✅ Nenhum issue encontrado!")

    print(f"\n💡 Auto-fix recupera: +{result['auto_fixable_points']} pts")
    print(f"   Score projetado após auto-fix: {result['projected_after_auto']}/100")
    if not result["approved"]:
        print(f"   Gap para aprovação (80pts): {80 - result['score']} pts")
    print()


if __name__ == "__main__":
    main()
