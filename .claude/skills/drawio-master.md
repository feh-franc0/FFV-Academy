---
name: drawio-master
description: Pipeline completo orquestrado para diagramas draw.io — loop automatizado XML scorer + fixer + PNG export + visual review até atingir 95/100 visual com zero CRITICO. Inclui atualização automática das skills (draw-review.md com novos padrões Pxx) quando problemas recorrentes são detectados. Use quando o usuário pedir "quero 95+", "fluxo completo", "gera e valida drawio profissional", ou após /aws-arch criar um novo diagrama.
---

# Skill: drawio-master

Orquestrador end-to-end: **gera → score XML → fix AUTO → export PNG → revisão visual → se <95 aplica fixes + atualiza skills → repete até convergência ou max 5 iterações.**

## Invocação

```
/drawio-master [arquivo.drawio] [target=95]
/drawio-master docs/architecture/minha-arch.drawio
/drawio-master                             ← completo-todas-fases.drawio, target=95
/drawio-master arq.drawio 85               ← target mais permissivo
```

## Fluxo completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOOP ATÉ visual_score ≥ TARGET               │
│                                                                 │
│   ┌─────────┐  ┌────────┐  ┌─────────┐  ┌──────────────┐       │
│   │  XML    │──│  Fixer │──│  PNG    │──│ Visual       │       │
│   │ Scorer  │  │  AUTO  │  │ Export  │  │ Review Agent │       │
│   └─────────┘  └────────┘  └─────────┘  └──────┬───────┘       │
│                                                │                │
│                 ┌──────────────────────────────┘                │
│                 ▼                                               │
│          visual_score ≥ TARGET                                  │
│          AND zero CRITICO?                                      │
│           ├── SIM → PASS ✅ abre drawio, encerra               │
│           └── NÃO → 1. Aplica fixes (ranked)                    │
│                    2. Versiona vN                               │
│                    3. Se padrão recorrente → atualiza Pxx        │
│                    4. iter++; se iter<5, loop                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Passo a passo

### 0. Preparação

- Backup do arquivo original em `docs/architecture/versoes/v0-baseline-<score>.drawio`
- TodoWrite com tasks da iteração atual

### 1. Iter N — cabeçalho visível

```
╔══════════════════════════════════════════════════════════════╗
║  🔄 drawio-master — ITER N/5                                 ║
║  Arquivo: <path>                                             ║
║  Histórico: 58→72→86→91→<score_atual>                       ║
╚══════════════════════════════════════════════════════════════╝
```

### 2. Executar stack determinístico

```bash
# Scorer XML (atributos: cores, labels, ícones)
python3 scripts/drawio/aws-arch-scorer.py <arquivo> --json > /tmp/score.json

# Auto-fixer (idempotente — ok se não muda nada)
python3 scripts/drawio/aws-arch-fixer.py <arquivo>

# Layout linter (geometria: overlaps, express lanes, badges-on-icons)
# Detecta P27/P28/P29/P31. Exit code 1 se houver CRITICO.
python3 scripts/drawio/layout-linter.py <arquivo> --json > /tmp/layout.json

# Export PNG (scale=2, border=20) — só após scorer + linter passarem
bash scripts/drawio/export-png.sh <arquivo>
```

**Ordem importa:** o linter geométrico roda ANTES do export, porque detecta problemas de bbox que o scorer XML não enxerga (overlap real de células text, badges em cima de ícones, lanes paralelas sem gap). Se o linter retorna CRITICO, aplicar fixes RESTRUCTURE antes de gastar tempo no PNG + visual review.

### 3. Revisão visual via subagent

Invocar `Agent` com `subagent_type=general-purpose` e prompt detalhado em [drawio-visual-review.md](drawio-visual-review.md). Receber JSON com `visual_score`, `critical_issues`, `warnings`, `fixes_remaining_if_not_95`.

### 4. Decisão

```python
if visual_score >= TARGET and not critical_issues:
    # PASS
    print("APROVADO após N iterações")
    open_drawio_mcp(arquivo)
    commit_if_requested()
    STOP

elif iter >= 5:
    # Não convergiu
    invoke("/drawio-critico", arquivo)  # veredicto severo
    emit_manual_fixes_report(warnings + critical_issues)
    STOP

else:
    # Aplicar fixes ranked
    rank_fixes_by_impact(critical_issues + warnings)
    apply_fixes_via_edit_or_python_script()

    # Se padrão recorrente → atualizar skills
    if pattern_seen_across_iterations(issue):
        add_to_draw_review_md(next_Pxx_slot, issue_details)

    # Versionar
    cp arquivo versoes/vN-iterN.drawio
    cp arquivo.png versoes/vN-iterN.png

    iter += 1
    goto 1
```

### 5. Tipos de fix e quem aplica

| Tipo | Executor | Exemplos |
|------|----------|----------|
| `AUTO` | `aws-arch-fixer.py` | fontSize, labelBg, cores fora de paleta |
| `GENERATE` | Claude via Edit (XML block) | legenda faltante, título, container ausente |
| `RESTRUCTURE` | Claude via Edit (reposicionar) | mover nota de container alheio, espaçar express lanes, distribuir star pattern |
| `AGENT_HELPER` | script Python ad-hoc em /tmp | fixes batch em N células (debold edges, adicionar badges numerados) |

### 6. Atualização de skills quando problema é recorrente

Se a revisão visual aponta o **mesmo tipo de issue em 2+ iterações**, é sinal que a geração precisa aprender. Adicionar regra em ordem de prioridade:

1. `draw-review.md` — novo P2N com detecção + fix
2. `aws-arch.md` — regra preventiva na geração
3. `aws-arch-pipeline.md` — incluir no checklist

### 7. Relatório final

```
╔══════════════════════════════════════════════════════════════╗
║  ✅ APROVADO — visual_score: 96/100 em 4 iterações           ║
╠══════════════════════════════════════════════════════════════╣
║  Histórico: 58→72→86→91→93→96                                ║
║  Versões salvas: docs/architecture/versoes/v0..v5.{drawio,png}║
║  Skills atualizadas: draw-review.md (P21-P26), aws-arch.md   ║
║  Pontos fortes: numeração, legenda rica, hierarquia clara    ║
║  Detalhes: docs/architecture/PIPELINE.md                     ║
╚══════════════════════════════════════════════════════════════╝
```

## Princípios

- **Target é 95+.** Abaixo disso, loopar até 5 iterações.
- **Loop determinístico.** Mesmas mudanças no drawio = mesmo score XML. Revisão visual tem variação ~±2pts de subagent para subagent, tolerar.
- **Aprendizados são automáticos.** Issue recorrente → nova regra permanente nas skills.
- **Backup sempre.** Nenhuma iteração sem `cp → versoes/vN-*.drawio`. Permite A/B e rollback.
- **Skills são vivas.** O pipeline melhora a si próprio observando os gaps recorrentes.
- **5 iterações é limite.** Se não convergiu, é sinal de problema estrutural — invocar `/drawio-critico` pra diagnóstico profundo.
- **Português brasileiro** em todos os outputs.
