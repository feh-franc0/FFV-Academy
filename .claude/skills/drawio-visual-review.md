---
name: drawio-visual-review
description: Revisor visual de diagramas draw.io. Exporta o .drawio para PNG, compara com as 7 imagens de referência 100/100 em docs/architecture/exemples_draws/, e retorna relatório JSON com problemas que o scorer XML não detecta (overlap real, proporção visual, alinhamento, legibilidade, cruzamento de arestas). Use quando o usuário pedir para revisar visualmente, conferir se o diagrama "parece profissional", ou após rodar /aws-arch-pipeline para validar além do XML.
---

# Skill: drawio-visual-review

Revisor visual construtivo. Exporta o diagrama para PNG e compara com as 7 referências 100/100. Pega problemas que o scorer XML não enxerga: overlap real de labels, proporção visual, densidade, cruzamentos não-ortogonais, espaço morto, hierarquia visual.

## Invocação

```
/drawio-visual-review [arquivo.drawio]
/drawio-visual-review docs/architecture/completo-todas-fases.drawio
/drawio-visual-review                   ← usa completo-todas-fases.drawio
```

## Pré-requisitos

- **draw.io Desktop** instalado em `/Applications/draw.io.app/` (macOS)
- Script `scripts/drawio/export-png.sh` executável
- Imagens de referência em `docs/architecture/exemples_draws/` (7 PNGs)

## Fluxo de execução

### Passo 1 — Exportar PNG em alta resolução

```bash
bash scripts/drawio/export-png.sh [arquivo.drawio]
# Gera [arquivo].png (scale=2, border=20) no mesmo diretório
```

### Passo 2 — Revisão visual via subagent

Use o tool `Agent` com `subagent_type=general-purpose`, passando:
1. Caminho do PNG exportado
2. Caminhos das 7 imagens de referência
3. Instruções estruturadas de comparação

Prompt template para o subagent:

```
Você é um revisor visual de diagramas AWS draw.io. Sua tarefa é comparar um diagrama exportado com 7 imagens de referência que são padrão 100/100.

DIAGRAMA EM REVISÃO:
{caminho_png_atual}

REFERÊNCIAS 100/100 (leia todas):
- docs/architecture/exemples_draws/example_draw_100.png  (Distributed Load Testing on AWS)
- docs/architecture/exemples_draws/example_draw.png       (Vinci Retirement Services)
- docs/architecture/exemples_draws/1.png.webp             (Region/VPC close-up)
- docs/architecture/exemples_draws/3.png.webp             (AWS Cloud / CloudWatch)
- docs/architecture/exemples_draws/6.png.webp             (S3 → SNS → SQS → Lambda)
- docs/architecture/exemples_draws/001_reinforce2023_TDR352.png (Multi-account Forensic)
- docs/architecture/exemples_draws/icons.png              (catálogo oficial de ícones)

Use o tool Read para abrir cada imagem. O Read tool renderiza imagens visualmente — você CONSEGUE ver o conteúdo.

CRITÉRIOS DE REVISÃO (V1-V12, max 100 pts):

V1 — Proporção e densidade (10 pts)
  Conteúdo ocupa ≥70% do canvas? Áreas vazias são intencionais (legenda, rodapé) ou desperdício?
  Compare com 3.png.webp: canvas cheio sem aglomeração.

V2 — Hierarquia visual (10 pts)
  Título se destaca no topo? Subtítulo em cinza médio? Legenda no rodapé?
  Compare com example_draw_100.png: título bold grande + subtítulo descritivo.

V3 — Labels legíveis (12 pts)
  Todos os labels abaixo dos ícones estão LEGÍVEIS à primeira vista?
  Há labels cortados, truncados ou sobrepostos visualmente?
  Compare com example_draw.png: "Amazon CloudFront", "AWS Lambda" — zero ambiguidade.

V4 — Overlap de elementos (10 pts)
  Algum ícone sobrepõe outro? Labels batem uns nos outros?
  Compare com 6.png.webp: espaçamento generoso entre todos os nós.

V5 — Cruzamento de arestas (12 pts)
  Arestas se cruzam em pontos que confundem o fluxo?
  Arestas atravessam containers de fases não-relacionadas?
  Compare com example_draw_100.png: arestas seguem corredores, nunca atravessam zonas alheias.

V6 — Roteamento e ângulos (8 pts)
  Todas as arestas usam orthogonal routing (90° apenas)?
  Há arestas "frouxas" ou com loops estranhos?
  Compare com 1.png.webp: ortogonal limpo, sem desvios.

V7 — Contraste e cores (8 pts)
  Cores das categorias AWS seguem o padrão oficial (laranja Compute, verde Storage, etc.)?
  Algum texto ilegível por contraste baixo?
  Compare com icons.png: paleta oficial.

V8 — Containers nomeados (8 pts)
  Zonas (Edge, API, Compute, Data, Security) estão visualmente delimitadas com borda e título?
  Títulos dos containers são legíveis e em posição consistente?
  Compare com example_draw_100.png: "front end", "backend", "VPC", "region".

V9 — Atores externos visíveis (5 pts)
  Usuário/Browser/Cliente está claramente na borda do canvas, separado da AWS Cloud?
  Compare com example_draw.png: "Clients" em caixa isolada à esquerda.

V10 — Legenda completa e posicionada (7 pts)
  Legenda existe? Explica cores, estilos de edge, badges de fase?
  Está no rodapé sem invadir o conteúdo?

V11 — Consistência tipográfica (5 pts)
  Fontes e tamanhos são consistentes por hierarquia (título > subtítulo > label > nota)?
  Não há mix aleatório de fonts/sizes.

V12 — Profissionalismo geral (5 pts)
  Parece diagrama de apresentação corporativa, ou parece um rascunho?
  Pronto para reunião executiva?

FORMATO DE SAÍDA (JSON puro, sem markdown ao redor):

{
  "file": "caminho/do/arquivo.png",
  "visual_score": 87,
  "max": 100,
  "approved": true,
  "breakdown": {
    "V1_proporcao":              {"score": 9, "max": 10, "note": "..."},
    "V2_hierarquia_visual":      {"score": 10, "max": 10, "note": "..."},
    "V3_labels_legiveis":        {"score": 11, "max": 12, "note": "..."},
    "V4_overlap":                {"score": 10, "max": 10, "note": "..."},
    "V5_cruzamento_arestas":     {"score": 9, "max": 12, "note": "..."},
    "V6_roteamento":             {"score": 7, "max": 8, "note": "..."},
    "V7_contraste_cores":        {"score": 8, "max": 8, "note": "..."},
    "V8_containers":             {"score": 8, "max": 8, "note": "..."},
    "V9_atores_externos":        {"score": 5, "max": 5, "note": "..."},
    "V10_legenda":               {"score": 6, "max": 7, "note": "..."},
    "V11_tipografia":            {"score": 5, "max": 5, "note": "..."},
    "V12_profissionalismo":      {"score": 4, "max": 5, "note": "..."}
  },
  "critical_issues": [
    { "severity": "CRITICO", "dim": "V5", "description": "...", "fix_hint": "..." }
  ],
  "warnings": [
    { "severity": "ALTO",  "dim": "V3", "description": "...", "fix_hint": "..." },
    { "severity": "MEDIO", "dim": "V10", "description": "...", "fix_hint": "..." }
  ],
  "strengths": [
    "Título bold grande, hierarquia clara (como example_draw_100.png)",
    "Containers bem delimitados com cores distintas"
  ],
  "comparison_to_refs": {
    "most_similar": "example_draw_100.png",
    "gap_analysis": "Diferença principal: falta numeração de passos nas setas"
  }
}

REGRAS:
- Leia TODAS as 7 referências antes de julgar
- Use o Read tool para ver as imagens — você consegue enxergar conteúdo visual
- Seja específico nos "note" e "description" — aponte coordenadas/regiões quando possível
- Português brasileiro em todo output
- Severidade: CRITICO (corrompe compreensão) > ALTO (prejudica) > MEDIO (polish)
- NÃO execute scripts — apenas leia imagens e compare

Retorne APENAS o JSON, sem texto antes/depois.
```

### Passo 3 — Parsear JSON e apresentar relatório

Depois que o subagent retorna o JSON:

```
╔══════════════════════════════════════════════════════════════════╗
║  🎨 REVISÃO VISUAL — comparando com 7 refs 100/100              ║
╠══════════════════════════════════════════════════════════════════╣
║  Score Visual: {visual_score}/100 {emoji}                       ║
║  Arquivo: {file}                                                ║
╠══════════════════════════════════════════════════════════════════╣
║  BREAKDOWN                                                      ║
║  V1  Proporção e densidade         ████████░░ 9/10              ║
║  V2  Hierarquia visual             ██████████ 10/10             ║
║  ...                                                            ║
╠══════════════════════════════════════════════════════════════════╣
║  PONTOS FORTES                                                  ║
║  ✅ {strength_1}                                                ║
║  ✅ {strength_2}                                                ║
╠══════════════════════════════════════════════════════════════════╣
║  ISSUES CRÍTICOS ({N})                                          ║
║  🔴 [V5] {description}                                          ║
║     → Fix: {fix_hint}                                           ║
╠══════════════════════════════════════════════════════════════════╣
║  COMPARAÇÃO COM REFS                                            ║
║  Mais similar a: {most_similar}                                 ║
║  Gap: {gap_analysis}                                            ║
╚══════════════════════════════════════════════════════════════════╝
```

### Passo 4 — Proposta de ação

Se `visual_score >= 80` e zero CRITICO:
  - **APROVADO** ✅ — emite relatório, encerra

Se `visual_score < 80` ou há CRITICO:
  - **RETROAÇÃO** — apresentar issues ao usuário
  - Perguntar: "Posso aplicar os fixes sugeridos?"
  - Se sim: aplicar via Edit no XML + re-exportar PNG + re-revisar (max 3 iter visuais)

## Princípios

- **XML passa ≠ visual passa.** O scorer XML pode dar 100 e o visual pegar overlap real, cruzamento feio, densidade ruim.
- **7 referências são a régua.** Toda crítica deve citar a ref específica que motivou.
- **Uma passada visual = 1 chamada Agent.** Não pedir múltiplas revisões pra mesma imagem.
- **Não inventar problemas.** Se o diagrama parece bom, reportar alto score. Não há obrigação de encontrar problemas.
- **Português brasileiro** em todo output.
- **Persistir o PNG** junto do .drawio (mesmo nome, extensão .png) para auditoria e comparação entre versões.
