# Skill: marketing-critico-ritmo

Recebe o output do `marketing-avaliador-retencao` (nota + red flags) e identifica **root cause** de cada problema, propondo edits especificos (arquivo:linha → mudanca) antes de delegar a aplicacao para `marketing-iterador`.

E o "detetive" do loop: se o avaliador diz "algo esta errado", o critico diz "o problema e X no arquivo Y, conserta com Z".

## Invocacao

```
/marketing-critico-ritmo <ShortA|ShortB|ShortC>
```

## Pre-requisitos

Avaliacao ja executada (`marketing-avaliador-retencao`) com red flags e notas por criterio.

## Protocolo de Critica

### Passo 1 — Mapear cada red flag ao root cause

| Red flag | Root cause provavel | Arquivo a editar |
|----------|---------------------|------------------|
| Frame estatico >2s | Beat com `durationFrames` muito longo, ou falta BeatMarker | config do short (`config/short-<tema>.ts`) — reduzir `durationFrames` ou dividir beat. ShortDemo.tsx — conferir triggers de BeatMarker |
| Caption cortada (safe zone) | `position` errado ou `SAFE_ZONE` apertado | Trocar `position: 'top'/'bottom'` na config OU ajustar `SAFE_ZONE.TOP/BOTTOM` em `styles/short-tokens.ts` |
| Contraste ruim | Caption branca em beat com fundo claro | Aumentar `textShadow` em `components/QuickCaption.tsx` OU mudar `theme` do beat em `scripts/record-beats.ts` para `dark` |
| Clique sem zoom | `zoomOnClick: true` mas manifest sem click mark | Conferir `markClickByText`/`markClick` no beat correspondente de `record-beats.ts`. Pode ser seletor que nao bateu — re-gravar com texto alternativo |
| Transicao sem flash | `BeatMarker` nao recebeu trigger | `ShortDemo.tsx` — ajustar calculo de `triggers` (depende de `beat.durationFrames`) |
| Hook fraco (seg 1-3) | Caption do hook tem fontSize menor, ou entra tarde | Config do short — aumentar `durationFrames` da caption hook OU trocar `style` para `'hook'`; `styles/short-tokens.ts` se fontSize do style `hook` estiver pequeno |
| CTA incompleto | Texto de `cta.primary`/`secondary` vazio ou truncado | Config do short — revisar `cta` |
| Demo sem valor visivel | Beat escolhido nao mostra acao clara (so pagina parada) | `scripts/record-beats.ts` — aumentar acoes no beat (mais clicks/scroll) OU substituir por beat melhor |

### Passo 2 — Priorizar edits

Ordenar por impacto:
1. **Critical**: hook fraco, CTA faltando, >3s estatico consecutivo (rejeita o short na distribuicao)
2. **High**: caption cortada, contraste ruim, clique sem zoom
3. **Medium**: transicao sem flash, ritmo marginal

Iteracao 1 ataca criticals. Iteracao 2 ataca highs. Iteracao 3 faz polimento final.

### Passo 3 — Propor edits (arquivo:linha → mudanca)

Para cada red flag priorizado:

```
### Red flag: [descricao]
**Root cause:** [uma frase explicando porque acontece]
**Arquivo:** marketing/src/short/config/short-quiz.ts:42
**Edit proposto:**
\`\`\`
ANTES:
  { text: 'você sabe?', slot: 'hook', style: 'normal' }

DEPOIS:
  { text: 'VOCÊ SABE?', slot: 'hook', style: 'hook', durationFrames: 75 }
\`\`\`
**Justificativa:** caption do hook precisa de `style: 'hook'` (fontSize 132) para dominar visualmente os primeiros 3s. Duracao 75 frames = 2.5s on-screen.
```

### Passo 4 — Output estruturado

```
## Critica ShortX — Root Cause Analysis

**Red flags analisados:** N
**Edits propostos:** M
**Prioridade:** [critical/high/medium distribution]

### Edits (ordem de aplicacao)
1. [arquivo:linha] [mudanca]
2. [arquivo:linha] [mudanca]
...

### Proximo passo
Delegar para /marketing-iterador para aplicar os M edits e re-renderizar.
```

---

## Principios

- **Root cause, nao sintoma** — "caption cortada" nao e o problema; "safe zone bottom apertada demais" e
- **Edit cirurgico** — uma mudanca = um arquivo:linha. Sem reescritas
- **Justificativa obrigatoria** — toda mudanca vem com *por que*, para o iterador poder julgar em caso de ambiguidade
- **Prioridade brutal** — critical antes de high, sempre. Polimento so depois que estrutura funciona
- **Conservador com recording** — re-gravar beat e operacao cara (abre browser, serve build). Preferir ajuste em config antes de re-gravar
