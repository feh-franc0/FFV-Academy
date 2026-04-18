# Pipeline de Geração e Validação de Diagramas AWS

> **Versão:** 1.0 — Abril 2026  
> **Status:** Ativo  
> **Score atual do diagrama principal:** 93/100 ✅

---

## 1. Visão Geral do Sistema

O pipeline resolve um problema clássico de automação de qualidade: diagramas gerados mecanicamente não têm garantia de que atendem padrões visuais e arquiteturais. Sem critério objetivo de "pronto", toda revisão é subjetiva e o ciclo nunca fecha.

**Solução:** Loop fechado com scoring numérico mensurável no XML + auto-fix + feedback estruturado.

### Componentes do sistema

| Componente | Arquivo | Responsabilidade |
|-----------|---------|-----------------|
| **Gerador** | skill `/aws-arch` | Descobre requisitos e gera XML inicial |
| **Scorer** | `scripts/drawio/aws-arch-scorer.py` | Avalia o XML contra rubrica 0-100 |
| **Fixer** | `scripts/drawio/aws-arch-fixer.py` | Aplica correções AUTO no XML |
| **Revisor** | skill `/draw-review` | Análise manual pontual (ad-hoc) |
| **Orquestrador** | skill `/aws-arch-pipeline` | Executa o loop, decide convergência |
| **MCP draw.io** | `mcp__drawio__open_drawio_xml` | Abre o diagrama final no browser |

### Fluxo de dependências

```
/aws-arch → [arquivo.drawio] → /aws-arch-pipeline
                                      │
                    ┌─────────────────┘
                    ▼
             aws-arch-scorer.py → score + issues JSON
                    │
             score ≥ 80? ──────────────────────────▶ PASS
                    │ não                              │
                    ▼                                  ▼
             aws-arch-fixer.py               mcp__drawio__open_drawio_xml
                    │                         + Relatório Final
                    ▼
             [XML corrigido] → scorer (próxima iteração)
```

---

## 2. Fluxo de Execução Completo

```
╔═══════════════════════════════════════════════════════════════════╗
║                    /aws-arch-pipeline                             ║
╚═══════════════════════════════════════════════════════════════════╝

Entrada: arquivo.drawio (gerado por /aws-arch ou existente)

│
├─── ITERAÇÃO 1 ──────────────────────────────────────────────────
│    │
│    ├── [1] Lê XML do arquivo
│    ├── [2] aws-arch-scorer.py → {score, breakdown, issues}
│    │
│    ├── score ≥ 80? ──▶ SIM ──▶ [PASS] → abrir MCP + relatório
│    │                    │
│    │                   NÃO
│    │                    │
│    ├── [3] Gera feedback estruturado (top 5 issues por impacto)
│    ├── [4] Emite alertas ALERT ao usuário (não auto-corrigíveis)
│    ├── [5] aws-arch-fixer.py → aplica fixes AUTO
│    └── [6] Salva XML corrigido → próxima iteração
│
├─── ITERAÇÃO 2, 3, 4 (mesmo fluxo) ──────────────────────────────
│
└─── ITERAÇÃO 5 ──────────────────────────────────────────────────
     │
     ├── score ≥ 80? ──▶ SIM ──▶ [PASS] → abrir MCP + relatório
     │
     └── NÃO ──▶ [FAIL] → abrir MCP (inspeção) + relatório de falha
                           + lista de próximos passos manuais
```

### Estados possíveis do pipeline

| Estado | Condição | Ação |
|--------|----------|------|
| **PASS** | `score >= 80` | Abre draw.io, emite relatório de aprovação |
| **FIX** | `score < 80 AND iter < 5` | Aplica fixes, continua loop |
| **FAIL** | `score < 80 AND iter = 5` | Abre draw.io, emite relatório com issues restantes |

---

## 3. Rubrica de Score — Referência Completa

### Visão geral (0-100 pts)

```
D1 — Labels e Tipografia    ██████████ 25 pts
D2 — Ícones AWS             ████████   20 pts
D3 — Estrutura              ████████   20 pts
D4 — Arestas e Fluxo        ██████     15 pts
D5 — Cores e Padrões        ████       10 pts
D6 — Opacidade/Sobreposição ██          5 pts
D7 — Completude Arquitetural ██          5 pts
```

---

### D1 — Labels e Tipografia (25 pts)

| ID | Critério | Pts | Como medir no XML | Fix |
|----|----------|-----|-------------------|-----|
| D1.1 | `verticalLabelPosition=bottom` em todos ícones AWS | 10 | `shape=mxgraph.aws4.resourceIcon` sem `verticalLabelPosition=bottom` → -2/nó, max -10 | AUTO |
| D1.2 | Sem `labelBackgroundColor=#ffffff` | 5 | Regex no style | AUTO |
| D1.3 | `fontSize >= 11` em todos elementos | 5 | Regex `fontSize=([1-9]|10)\b` → -1/ocorrência | AUTO |
| D1.4 | Título com `fontSize >= 18` e `fontStyle=1` (bold) | 5 | Ausência = -5 | GENERATE |

**Exemplo de style correto (D1.1):**
```
style="...;shape=mxgraph.aws4.resourceIcon;labelPosition=center;
       verticalLabelPosition=bottom;verticalAlign=top"
```

**Exemplo incorreto:**
```
style="...;shape=mxgraph.aws4.resourceIcon"  ← sem verticalLabelPosition
```

---

### D2 — Ícones AWS (20 pts)

| ID | Critério | Pts | Como medir | Fix |
|----|----------|-----|------------|-----|
| D2.1 | Proporção de nós com `resourceIcon` (vs retângulos genéricos) | 10 | `score = 10 × (aws_count/total_count)` | ALERT |
| D2.2 | width e height ≥ 60px em todos ícones | 5 | `<mxGeometry width="X"` com X < 60 → -1/ícone | AUTO |
| D2.3 | `resIcon=mxgraph.aws4.*` presente em todos | 5 | Ausência → -1/ícone | ALERT |

---

### D3 — Estrutura e Agrupamento (20 pts)

| ID | Critério | Pts | Como medir | Fix |
|----|----------|-----|------------|-----|
| D3.1 | Zonas de fundo (`bg_*`, swimlane, container) | 8 | Ausência total = -8 | GENERATE |
| D3.2 | Legenda presente (texto com "Legenda" ou "Legend") | 7 | Ausência = -7 | GENERATE |
| D3.3 | ≥ 3 bandas Y distintas (Internet/Compute/Data separadas) | 5 | Clusters Y com gap > 80px | ALERT |

**XML de legenda mínima (GENERATE):**
```xml
<mxCell id="leg" value="Legenda: 🟠 Compute  🟢 Banco  🔴 Segurança  ─── principal  - - - monitoramento"
  style="text;html=1;strokeColor=#666666;fillColor=#f5f5f5;align=left;fontSize=11;spacingLeft=8;"
  vertex="1" parent="1">
  <mxGeometry x="20" y="[Y_RODAPE]" width="900" height="40" as="geometry"/>
</mxCell>
```

---

### D4 — Arestas e Fluxo (15 pts)

| ID | Critério | Pts | Como medir | Fix |
|----|----------|-----|------------|-----|
| D4.1 | % de arestas com `value` não vazio | 10 | `score = 10 × (labeled/total)` | ALERT |
| D4.2 | Arestas de monitoramento com `dashed=1` | 5 | Keywords: cloudwatch, xray, alert, monitora, tracing → -1/aresta | AUTO |

**Keywords de monitoramento (D4.2):** `cloudwatch`, `x-ray`, `xray`, `alert`, `log`, `metric`, `monitora`, `tracing`, `observ`

---

### D5 — Cores e Padrões Visuais (10 pts)

| ID | Categoria | Cor esperada | HEX | Pts | Fix |
|----|-----------|-------------|-----|-----|-----|
| D5.1 | Compute (Lambda, EC2, ECS, Fargate) | Laranja AWS | `#FF9900` | 3 | AUTO |
| D5.2 | Database (DynamoDB, RDS, Aurora, ElastiCache) | Verde AWS | `#1A9C3E` | 3 | AUTO |
| D5.3 | Segurança (IAM, WAF, Secrets Manager, Shield) | Vermelho AWS | `#DD344C` | 2 | AUTO |
| D5.4 | Mensageria (SQS, SNS, EventBridge, Kinesis) | Rosa AWS | `#E7157B` | 2 | AUTO |

---

### D6 — Opacidade e Sobreposição (5 pts)

| ID | Critério | Pts | Como medir | Fix |
|----|----------|-----|------------|-----|
| D6.1 | `opacity <= 35` em todas zonas de fundo | 3 | `opacity=(\d+)` > 35 → -1/zona, max -3 | AUTO |
| D6.2 | Sem nós sobrepostos (y-diff < 130px, x-diff ≤ 20px) | 2 | -1/par detectado, max -2 | ALERT |

---

### D7 — Completude Arquitetural (5 pts)

| ID | Critério | Pts | Como medir | Fix |
|----|----------|-----|------------|-----|
| D7.1 | CloudWatch ou X-Ray presente | 3 | `resIcon=mxgraph.aws4.cloudwatch` ou `xray` | ALERT |
| D7.2 | IAM, Cognito, WAF ou Secrets Manager presente | 2 | Qualquer um dos auth/security icons | ALERT |

---

## 4. Scripts do Pipeline

### `scripts/drawio/aws-arch-scorer.py`

**Responsabilidade:** Avaliador puro — lê XML, calcula score, não modifica arquivos.

```
Entrada:  arquivo.drawio
Saídas:
  - Modo padrão: relatório formatado no terminal
  - --json: JSON completo {score, breakdown, issues, strategy}
  - --quiet: apenas o número do score (para CI/CD)

Interface JSON:
{
  "file": "path/to/arquivo.drawio",
  "score": 87,
  "max": 100,
  "approved": true,
  "strategy": "GENERAL_IMPROVEMENT",
  "breakdown": {
    "D1_labels_tipografia": {"score": 25, "max": 25},
    ...
  },
  "issues": [
    {
      "id": "D3.2",
      "description": "Legenda ausente",
      "affected_ids": [],
      "points_lost": 7,
      "fix_type": "GENERATE"
    }
  ],
  "auto_fixable_points": 0,
  "projected_after_auto": 87
}
```

### `scripts/drawio/aws-arch-fixer.py`

**Responsabilidade:** Aplicar apenas fixes do tipo AUTO. Nunca altera conteúdo semântico.

```
Entrada:  arquivo.drawio [--dry-run] [--issues '[...]'] [--json]
Saída:
  - Arquivo corrigido salvo em disco (a menos que --dry-run)
  - Log de fixes aplicados

Interface JSON (--json):
{
  "file": "path",
  "modified": true,
  "dry_run": false,
  "fixes_applied": ["D1.1: label reposicionado", "D6.1: opacity reduzida"],
  "fixes_count": 2
}
```

**Fixes AUTO implementados:**

| Fix | Dimensão | O que faz |
|-----|----------|-----------|
| Label abaixo do ícone | D1.1 | Adiciona `verticalLabelPosition=bottom;labelPosition=center;verticalAlign=top` |
| Remove caixa branca | D1.2 | Remove `labelBackgroundColor=#ffffff` |
| fontSize mínimo | D1.3 | Substitui `fontSize=N` (N<11) por `fontSize=11` |
| Redimensiona ícones | D2.2 | Força `width="60" height="60"` em geometries < 60px |
| Dashed em monitoramento | D4.2 | Adiciona `dashed=1` em arestas com keywords de observabilidade |
| Cores Compute | D5.1 | `fillColor=#FF9900` em Lambda/EC2/ECS/Fargate |
| Cores Database | D5.2 | `fillColor=#1A9C3E` em DynamoDB/RDS/Aurora |
| Cores Segurança | D5.3 | `fillColor=#DD344C` em IAM/WAF/Secrets Manager |
| Cores Mensageria | D5.4 | `fillColor=#E7157B` em SQS/SNS/EventBridge |
| Opacidade zonas | D6.1 | Clamp `opacity=N` para `opacity=35` quando N > 35 |

---

## 5. Exemplo Real — Score Inicial do Diagrama Principal

```
aws-arch-scorer.py docs/architecture/completo-todas-fases.drawio

============================================================
  ✅ APROVADO  |  Score: 93/100
  Estratégia: GENERAL_IMPROVEMENT
============================================================

D1_labels_tipografia  ████████████████████  25/25 (100%)
D2_icones_aws         ████████████████████  20/20 (100%)
D3_estrutura          █████████████░░░░░░░  13/20 (65%)
D4_arestas_fluxo      ████████████████████  15/15 (100%)
D5_cores_visuais      ████████████████████  10/10 (100%)
D6_opacidade_overlap  ████████████████████   5/5  (100%)
D7_completude         ████████████████████   5/5  (100%)

Issues encontrados (2):
  ✨ [D3.2] -7pts  Legenda ausente (texto "Legenda" não detectado)
  ⚠  [D2.1] -0pts  Nó "user" usa shape=user (não resourceIcon — esperado)
```

O diagrama perdeu 7 pontos em D3.2 porque a legenda usa `id="leg_f1"`, `id="leg_edge"` etc.  
mas nenhuma célula tem o texto "Legenda:" explicitamente. Fix: adicionar uma célula-título de legenda.

---

## 6. Evolução Planejada

### Fase atual (v1.0) — XML Analysis
- ✅ Score 0-100 calculado no XML
- ✅ Auto-fix para D1, D2, D4, D5, D6
- ✅ Alertas estruturados para D3, D4 (contexto de negócio)
- ✅ Loop iterativo com max 5 tentativas

### Fase 2 — CI/CD Integration

```yaml
# .github/workflows/architecture-quality.yml
name: Architecture Diagram Quality Gate

on:
  pull_request:
    paths:
      - 'docs/architecture/*.drawio'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Score Architecture Diagram
        run: |
          score=$(python3 scripts/drawio/aws-arch-scorer.py \
            docs/architecture/completo-todas-fases.drawio --quiet)
          echo "Architecture score: $score/100"
          echo "score=$score" >> $GITHUB_OUTPUT
          if [ "$score" -lt 80 ]; then
            python3 scripts/drawio/aws-arch-scorer.py \
              docs/architecture/completo-todas-fases.drawio
            exit 1
          fi
      - name: Comment score on PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              body: `## 🏗️ Architecture Score: ${{ steps.validate.outputs.score }}/100`
            })
```

### Fase 3 — Versionamento de Diagramas

```bash
# scripts/drawio/version-diagram.sh
#!/bin/bash
SCORE=$(python3 scripts/drawio/aws-arch-scorer.py \
  docs/architecture/completo-todas-fases.drawio --quiet)
DATE=$(date +%Y%m%d)
VERSION="v${DATE}-score${SCORE}"

mkdir -p docs/architecture/versoes
cp docs/architecture/completo-todas-fases.drawio \
   "docs/architecture/versoes/arch-${VERSION}.drawio"
echo "${DATE},${SCORE},${VERSION}" >> docs/architecture/score-history.csv
git tag "arch-${VERSION}"
echo "✅ Versão salva: arch-${VERSION}.drawio"
```

### Fase 4 — Score Visual (Screenshot + Vision)

```python
# Futuro: análise visual com Claude claude-opus-4-6
# Requer: Playwright para captura, base64 encoding, API Vision

async def score_visual(diagram_url: str) -> dict:
    screenshot = await capture_screenshot(diagram_url)
    response = await anthropic.messages.create(
        model="claude-opus-4-6",
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "data": screenshot}},
                {"type": "text", "text": VISUAL_SCORING_PROMPT}
            ]
        }]
    )
    return parse_visual_score(response)
```

### Fase 5 — Audit Trail Persistente

```csv
# docs/architecture/score-history.csv
timestamp,score,iterations,status,strategy,top_issue
2026-04-18T10:00:00Z,93,1,PASS,GENERAL_IMPROVEMENT,D3.2-legenda
2026-04-20T14:30:00Z,87,2,PASS,FOCUS_LABELS,D1.1-labels
2026-04-22T09:15:00Z,71,5,FAIL,FOCUS_EDGES,D4.1-arestas-sem-label
```

```python
# Append após cada pipeline run
def record_run(score, iterations, status, strategy, top_issue):
    entry = f"{datetime.utcnow().isoformat()},{score},{iterations},{status},{strategy},{top_issue}\n"
    Path("docs/architecture/score-history.csv").open("a").write(entry)
```

---

## 7. Referência Rápida — Comandos

```bash
# Avaliar diagrama
python3 scripts/drawio/aws-arch-scorer.py docs/architecture/completo-todas-fases.drawio

# Avaliar (JSON puro — para scripts)
python3 scripts/drawio/aws-arch-scorer.py docs/architecture/completo-todas-fases.drawio --json

# Avaliar (só o número — para CI/CD)
python3 scripts/drawio/aws-arch-scorer.py docs/architecture/completo-todas-fases.drawio --quiet

# Aplicar fixes automáticos
python3 scripts/drawio/aws-arch-fixer.py docs/architecture/completo-todas-fases.drawio

# Simular fixes sem salvar
python3 scripts/drawio/aws-arch-fixer.py docs/architecture/completo-todas-fases.drawio --dry-run

# Pipeline completo via Claude Code
/aws-arch-pipeline docs/architecture/completo-todas-fases.drawio
```

---

## 8. Princípios de Design do Sistema

1. **Score mensurável no XML** — não depende de rendering ou screenshot. Roda em CI headless.
2. **Fixes AUTO são seguros** — apenas reformatam, nunca removem conteúdo semântico.
3. **Separação de responsabilidades** — scorer é puro (sem side effects), fixer é isolado.
4. **Convergência garantida** — fixes AUTO têm ganho monotônico; 5 iterações é suficiente para qualquer diagrama com ≥ 60pts de base.
5. **Extensível** — adicionar nova dimensão = nova função `score_dN()` + entrada na rubrica. Zero alterações no orquestrador.
6. **CI/CD ready** — `--quiet` retorna int puro, adequado para `if [ $score -lt 80 ]`.
