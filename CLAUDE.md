# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Visão Geral do Projeto

**FFV Academy** — Blog tech gamificado sobre Inteligência Artificial.
Site: https://fernandofrancovalle.com

### Objetivo do produto
Criar uma experiência de aprendizado gamificada onde o leitor não apenas lê — ele progride, ganha XP, desbloqueia badges e sente evolução real. O diferencial é que parece um jogo, não um blog.

---

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** — estilização
- **shadcn/ui** — componentes de UI profissionais
- **localStorage** — estado de gamificação 100% client-side (sem backend, sem auth)

### Legado
Os arquivos HTML/CSS/JS originais estão em `_legacy/` como referência de conteúdo e design.

---

## Comandos

```bash
npm run dev      # servidor local em http://localhost:3000
npm run build    # build de produção
npm run lint     # lint
```

---

## Arquitetura de gamificação

Todo o estado do usuário vive em `localStorage` sob a chave `ffv_academy`.

**Estrutura de estado:**
```ts
{
  xp: number
  level: number
  streak: number
  lastStudyDate: string | null
  completedModules: string[]   // slugs
  quizScores: Record<string, { score: number; total: number; perfect: boolean }>
  badges: string[]
  totalStudyTime: number       // minutos
  startedAt: string | null
}
```

**Progressão de níveis:**
1. Curioso (0–100 XP)
2. Aprendiz (100–250 XP)
3. Praticante (250–500 XP)
4. Desenvolvedor (500–800 XP)
5. Especialista (800–1200 XP)
6. Arquiteto de IA (1200–1800 XP)
7. Mestre da IA (1800+ XP)

---

## Currículo — Trilhas e módulos

### Trilha 1 — Fundamentos da IA (desbloqueada por padrão)
Slugs em ordem: `o-que-e-ia` → `dados-o-combustivel` → `como-ia-aprende` → `redes-neurais` → `o-que-e-llm` → `tokens` → `transformers`

### Trilha 2 — IA Além do LLM (unlock após completar Trilha 1)
Slugs: `kv-cache` → `mixture-of-experts` → `tool-calling` → `ia-alem-do-llm` → `como-avaliar-modelos`

### Módulos futuros (planejados)
- **AWS** — módulo separado, ainda sem prazo

Cada módulo tem: `slug`, `title`, `icon`, `xp`, `readTime`, `desc`, `seoDesc`, `keywords`

---

## Design System

Tema dark (inspirado no GitHub):
```
bg:     #0d1117
bg2:    #161b22
bg3:    #21262d
border: #30363d
blue:   #58a6ff  ← accent principal (Trilha 1)
green:  #3fb950
purple: #d2a8ff  ← accent Trilha 2
orange: #ffa657
```

Referências de UX: Linear, Vercel (navegação/layout), Duolingo/Codecademy (gamificação).

---

## Convenções importantes

- **Slugs são IDs permanentes** no localStorage — nunca renomear sem migração de dados
- Trilha 2 bloqueada até `trail1` estar 100% completa
- Idioma: **Português brasileiro** em todo o conteúdo e UI
- SEO: cada módulo tem `seoDesc` e `keywords` — manter em metadata do Next.js
- 100% gratuito, sem cadastro obrigatório
