# CLAUDE.md

## Visão Geral

**FFV Academy** — Blog técnico gamificado sobre IA, AWS, engenharia de software e Claude/Anthropic.
Site: https://fernandofrancovalle.com · Autor: Fernando Franco Valle.

**Conceito:** Cada artigo dá XP, tem quiz e faz o leitor evoluir de nível. Zero hype, zero clickbait — arquitetura real, dados públicos, conteúdo para devs e curiosos sérios. 100% gratuito, sem cadastro, sem backend.

---

## Stack & Comandos

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- **shadcn/ui sobre `@base-ui/react/*`** (NÃO é Radix — ver Gotchas)
- **`output: "export"`** → site 100% estático (HTML/CSS/JS) hospedado na Hostinger
- **localStorage** (`ffv_academy`) — todo estado do usuário é client-side

```bash
npm run dev      # dev server localhost:3000
npm run build    # build estático em out/
npm run lint     # ESLint
```

**Gotcha: processos órfãos** — se dev server tiver comportamento estranho:
```bash
pkill -f "next-server"; rm -rf .next && npm run dev
```

---

## Deploy (Hostinger)

Quando o usuário disser **"quero o zip"**, **"gera o zip"** ou variação — execute sem pedir confirmação:

```bash
npm run build && bash scripts/deploy-hostinger.sh
```

O script `scripts/deploy-hostinger.sh` converte `out/` → `hostinger/` (Next.js gera `rota.html`, Hostinger precisa de `rota/index.html`) e gera `ffv-academy-hostinger.zip`.

**Upload manual:** File Manager → `public_html` → deletar tudo → upload zip → extrair → mover conteúdo de `hostinger/` para raiz → limpar.

**Ao adicionar nova rota de página**, atualize o array `for route in ...` dentro do `scripts/deploy-hostinger.sh`.

---

## Arquitetura

### Rotas

```
/                         → Home (editorial: hero, hábito, featured, hubs, trilhas, posts)
/ia | /aws | /engenharia | /claude-anthropic  → Hubs (4 agrupadores temáticos)
/progresso                → Dashboard do usuário (XP, streak, badges, por hub/trilha)
/<trilha-slug>            → Listagem de artigos da trilha (TrailBlogClient)
/aprenda/<artigo-slug>    → Artigo + quiz + XP (ModuleLayout)
/revisar                  → Fila SRS (revisão espaçada card-by-card)
```

### Hubs (definidos em `HUBS` de `curriculum.ts`)

| Hub | Rota | Trilhas |
|-----|------|---------|
| Inteligência Artificial | `/ia` | trail1, trail2, trail3, trail9 |
| AWS Cloud | `/aws` | trail4, trail5 |
| Engenharia de Software | `/engenharia` | trail7, trail8, trail10, trail11 |
| Claude & Anthropic | `/claude-anthropic` | trail13, trail17 |

O nav do GameHUD mostra hubs + Progresso. O CommandPalette (Cmd/Ctrl+K) navega por tudo.

### Currículo

**Fonte da verdade:** `src/lib/curriculum.ts` — constante `CURRICULUM` (array de `Trail` com `modules`). **Não duplique slugs/títulos aqui** — leia do código.

16 trilhas ativas: trail1–5, trail7–17 (trail6 removida). ~140 artigos. Cada módulo tem `slug`, `title`, `icon`, `xp`, `readTime`, `desc`, `seoDesc`, `keywords`.

**Slugs são IDs permanentes no localStorage** — nunca renomear sem migração.

---

## Gamificação

Estado em `localStorage` sob chave `ffv_academy` (interface `GameState` em `useGameState.ts`).

**Níveis:** Curioso (0) → Aprendiz (100) → Praticante (250) → Desenvolvedor (500) → Especialista (800) → Arquiteto (1200) → Mestre (1800+)

**SRS:** SM-2 simplificado em `src/lib/srs.ts` (funções puras). Cards criados no quiz, revisados em `/revisar`. Quality: again(0) hard(3) good(4) easy(5). XP por review: again(0) hard(1) good(2) easy(4).

**Streak freeze:** ganhado em `streak % 7 === 0` (máx 2), consumido automaticamente antes de quebrar streak.

### Arquivos-chave

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/curriculum.ts` | Currículo completo (trilhas, módulos, hubs, helpers) |
| `src/lib/engine.ts` | XP, badges, streak, localStorage |
| `src/lib/srs.ts` | SM-2 puro (sem deps de localStorage) |
| `src/hooks/useGameState.ts` | Hook React para estado do jogo |
| `src/hooks/useTheme.ts` | Toggle dark/light |
| `src/components/ModuleLayout.tsx` | Template de artigo com quiz + TOC |
| `src/components/article/primitives.tsx` | Section, Callout, CodeBlock, ComparisonTable, DecisionBox |
| `src/components/GameHUD.tsx` | HUD fixo (nav, XP, streak, badges, tema) |
| `src/components/HomeClient.tsx` | Home completa (editorial) |
| `src/components/TrailBlogClient.tsx` | Listagem de artigos por trilha |
| `src/components/HubPageClient.tsx` | Página de hub |
| `src/components/ProgressoClient.tsx` | Dashboard `/progresso` |
| `src/components/CommandPalette.tsx` | Palette global Cmd/Ctrl+K |

---

## Tema Dark/Claro

Persistente via `localStorage.ffv_theme`. Script inline no `<head>` (layout.tsx) aplica `data-theme` antes do React → zero FOUC. Vars CSS em `globals.css`.

**Regras:**
- Sempre use `var(--ffv-*)` — nunca hardcode hex
- Para transparência: `color-mix(in srgb, var(--ffv-blue) 12%, transparent)`
- `<html>` tem `suppressHydrationWarning` por causa do script inline

---

## Como adicionar artigo

1. Adicionar módulo em `src/lib/curriculum.ts` (dentro da trilha correta)
2. Criar `src/app/aprenda/<slug>/page.tsx` usando `ModuleLayout` + primitivos
3. Quiz com 3 perguntas (distratores realistas, explanations que ensinam)

## Como adicionar trilha

1. `curriculum.ts` — novo `Trail` no `CURRICULUM` + badge `trailN_done` no `BADGES_DEF`
2. `HomeClient.tsx` — atualizar `hrefByTrailId` (mapa hardcoded trail.id → rota)
3. `src/app/<rota>/page.tsx` — wrapper com `TrailBlogClient trail={CURRICULUM[N]}`
4. `scripts/deploy-hostinger.sh` — adicionar rota no array `for route in ...`
5. Se for novo hub: atualizar `HUBS` em `curriculum.ts` + criar página com `HubPageClient`

---

## Convenções

- **Idioma:** Português brasileiro em todo conteúdo e UI
- **Fontes:** Inter (corpo) · Poppins (títulos) · Roboto Mono (código)
- **Não usar `next/image`** — desabilitado para export estático
- **Trilhas abertas** — sem bloqueio entre trilhas
- **SEO:** cada módulo tem `seoDesc` e `keywords`

---

## Gotchas

### 1. base-ui, não Radix
```tsx
// ❌ asChild não existe (Radix)
<TooltipTrigger asChild><button>...</button></TooltipTrigger>

// ✅ Usar render prop (base-ui)
<TooltipTrigger render={<button type="button" onClick={fn} />}>
  {children}
</TooltipTrigger>
```

### 2. Hidratação e localStorage
Nunca ler localStorage em componentes server. Usar `useEffect` + `mounted` state. Padrão em `useTheme.ts` e `useGameState.ts`.

### 3. TrailCard → rota hardcoded
`HomeClient.tsx` tem `hrefByTrailId` que mapeia `trail.id` → rota. **Sempre atualizar ao adicionar trilha.**

### 4. Índices do CURRICULUM
Rotas de trilha usam `CURRICULUM[N]`. Ao remover/inserir trilha, todos os índices subsequentes mudam — verificar todas as páginas de trilha.
