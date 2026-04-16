# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Visão Geral do Projeto

**FFV Academy** — Blog tech gamificado sobre Inteligência Artificial.
Site: https://fernandofrancovalle.com
Autor: Fernando Franco Valle — programador desde os 13 anos.

### Conceito
"Blog · Learn · Game" — cada artigo é um post de blog que dá XP, tem quiz e faz o leitor evoluir de nível. O objetivo é desmistificar a IA, parar de vender medo e mostrar que ela amplifica a capacidade humana.

---

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** — estilização
- **shadcn/ui** (base-ui) — componentes de UI
- **localStorage** — estado de gamificação 100% client-side (sem backend, sem auth)
- **`output: "export"`** no next.config.ts — gera site 100% estático

### Fontes
- **Inter** — corpo do texto (legibilidade)
- **Poppins** — títulos e headlines
- **Roboto Mono** — blocos de código

### Legado
Os arquivos HTML/CSS/JS originais estão em `_legacy/` como referência de conteúdo.

---

## Comandos

```bash
npm run dev      # servidor local em http://localhost:3000
npm run build    # gera build estático na pasta out/
npm run lint     # lint
```

---

## Gatilho de Deploy

Quando o usuário disser algo como **"quero o zip"**, **"gera o zip"**, **"deploy na hostinger"** ou qualquer variação — execute os 3 comandos abaixo em sequência, sem pedir confirmação:

```bash
npm run build
```
```bash
rm -rf hostinger && mkdir -p hostinger
OUT="out"; DEST="hostinger"
cp -r "$OUT/_next" "$DEST/"
cp "$OUT/favicon.ico" "$DEST/" 2>/dev/null || true
cp "$OUT/index.html" "$DEST/index.html"
cp "$OUT/404.html" "$DEST/404.html"
mkdir -p "$DEST/fundamentos-da-ia"
cp "$OUT/fundamentos-da-ia.html" "$DEST/fundamentos-da-ia/index.html"
mkdir -p "$DEST/ia-alem-do-llm"
cp "$OUT/ia-alem-do-llm.html" "$DEST/ia-alem-do-llm/index.html"
mkdir -p "$DEST/ferramentas-ia-codigo"
cp "$OUT/ferramentas-ia-codigo.html" "$DEST/ferramentas-ia-codigo/index.html"
for f in "$OUT/aprenda/"*.html; do
  slug=$(basename "$f" .html)
  mkdir -p "$DEST/aprenda/$slug"
  cp "$f" "$DEST/aprenda/$slug/index.html"
done
cp hostinger/.htaccess "$DEST/" 2>/dev/null || true
```
```bash
rm -f ffv-academy-hostinger.zip
zip -r ffv-academy-hostinger.zip hostinger/ -x "*.DS_Store"
```

Ao final, confirme: **"ZIP gerado: `ffv-academy-hostinger.zip`"** e lembre o usuário de fazer upload na Hostinger seguindo o passo 4 da seção de deploy.

---

## Fluxo de Deploy (Hostinger)

### 1. Gerar o build
```bash
npm run build
# Gera a pasta out/ com todos os HTMLs estáticos
```

### 2. Rodar o script de deploy
```bash
# Remove build anterior e recria a pasta hostinger/
rm -rf hostinger && mkdir -p hostinger

OUT="out"
DEST="hostinger"

cp -r "$OUT/_next" "$DEST/"
cp "$OUT/favicon.ico" "$DEST/" 2>/dev/null || true
cp "$OUT/index.html" "$DEST/index.html"
cp "$OUT/404.html" "$DEST/404.html"

mkdir -p "$DEST/fundamentos-da-ia"
cp "$OUT/fundamentos-da-ia.html" "$DEST/fundamentos-da-ia/index.html"

mkdir -p "$DEST/ia-alem-do-llm"
cp "$OUT/ia-alem-do-llm.html" "$DEST/ia-alem-do-llm/index.html"

mkdir -p "$DEST/ferramentas-ia-codigo"
cp "$OUT/ferramentas-ia-codigo.html" "$DEST/ferramentas-ia-codigo/index.html"

for f in "$OUT/aprenda/"*.html; do
  slug=$(basename "$f" .html)
  mkdir -p "$DEST/aprenda/$slug"
  cp "$f" "$DEST/aprenda/$slug/index.html"
done
```

**Por que esse script?** O Next.js export gera `fundamentos-da-ia.html` mas a Hostinger precisa de `fundamentos-da-ia/index.html`. O script converte cada rota para a estrutura correta de pastas.

### 3. Gerar o ZIP
```bash
rm -f ffv-academy-hostinger.zip
zip -r ffv-academy-hostinger.zip hostinger/ -x "*.DS_Store"
```

### 4. Subir na Hostinger
1. Acesse o **File Manager** da Hostinger
2. Vá em `public_html`
3. **Delete tudo** que estiver lá
4. Faça **upload do `ffv-academy-hostinger.zip`**
5. Clique com botão direito → **Extract**
6. **Mova o conteúdo** da pasta `hostinger/` para a raiz do `public_html`
7. Delete o zip e a pasta `hostinger/` vazia

### Estrutura final no public_html
```
public_html/
├── .htaccess                     ← roteamento
├── index.html                    ← home
├── 404.html
├── _next/                        ← CSS/JS (não mexer)
├── fundamentos-da-ia/
│   └── index.html
├── ia-alem-do-llm/
│   └── index.html
├── ferramentas-ia-codigo/
│   └── index.html
└── aprenda/
    ├── o-que-e-ia/index.html
    ├── dados-o-combustivel/index.html
    ├── como-ia-aprende/index.html
    ├── redes-neurais/index.html
    ├── o-que-e-llm/index.html
    ├── tokens/index.html
    ├── transformers/index.html
    ├── kv-cache/index.html
    ├── mixture-of-experts/index.html
    └── tool-calling/index.html
```

### .htaccess (já incluído no script)
```apache
Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule ^ index.html [L]
</IfModule>
```

---

## Arquitetura de Páginas

```
/                        → Home pessoal (storytelling + 2 cards de blog)
/fundamentos-da-ia       → Blog 01 — listagem dos artigos da Trilha 1
/ia-alem-do-llm          → Blog 02 — listagem dos artigos da Trilha 2
/aprenda/[slug]          → Artigo individual com conteúdo + quiz + XP
```

---

## Arquitetura de Gamificação

Todo o estado do usuário vive em `localStorage` sob a chave `ffv_academy`.

```ts
interface GameState {
  xp: number
  level: number
  streak: number
  lastStudyDate: string | null
  completedModules: string[]   // slugs
  quizScores: Record<string, { score: number; total: number; perfect: boolean }>
  badges: string[]
  totalStudyTime: number
  startedAt: string | null
}
```

### Arquivos chave
- `src/lib/curriculum.ts` — currículo completo (trilhas, módulos, XP, slugs)
- `src/lib/engine.ts` — funções de XP, badges, streak, localStorage
- `src/hooks/useGameState.ts` — hook React para qualquer componente
- `src/components/GameHUD.tsx` — barra fixa do topo (XP, nível, streak, badges)
- `src/components/ModuleLayout.tsx` — template de artigo com quiz
- `src/components/TrailBlogClient.tsx` — listagem de artigos por trilha
- `src/components/HomeClient.tsx` — home page completa

### Níveis de evolução
1. 🌱 Curioso (0–100 XP)
2. 📚 Aprendiz (100–250 XP)
3. ⚡ Praticante (250–500 XP)
4. 🔧 Desenvolvedor (500–800 XP)
5. 🧠 Especialista (800–1200 XP)
6. 🏗️ Arquiteto de IA (1200–1800 XP)
7. 🚀 Mestre da IA (1800+ XP)

---

## Currículo — Trilhas e Módulos

### Trilha 1 — Fundamentos da IA (cor: #58a6ff)
Rota: `/fundamentos-da-ia`

| Slug | Título | XP |
|------|--------|----|
| `o-que-e-ia` | O que é Inteligência Artificial? | 30 |
| `dados-o-combustivel` | Dados: o Combustível da IA | 30 |
| `como-ia-aprende` | Como a IA Aprende (Machine Learning) | 40 |
| `redes-neurais` | Redes Neurais: o Cérebro Artificial | 50 |
| `o-que-e-llm` | O que é um LLM? | 50 |
| `tokens` | Tokens e Tokenização | 40 |
| `transformers` | Transformers e Mecanismo de Atenção | 60 |

### Trilha 2 — IA Além do LLM (cor: #d2a8ff)
Rota: `/ia-alem-do-llm`

| Slug | Título | XP |
|------|--------|----|
| `kv-cache` | KV Cache: Memória Eficiente | 60 |
| `mixture-of-experts` | Mixture of Experts (MoE) | 70 |
| `tool-calling` | Tool Calling e Agentes | 70 |
| `ia-alem-do-llm` | Harness: a Infraestrutura do Agente | 80 |
| `como-avaliar-modelos` | Como Avaliar Modelos de IA | 60 |

### Trilha 3 — Ferramentas de IA para Código (cor: #ffa657)
Rota: `/ferramentas-ia-codigo`

| Slug | Título | XP |
|------|--------|----|
| `coding-agents-panorama` | O Panorama dos Coding Agents | 50 |
| `claude-code-arquitetura` | Claude Code: Filosofia e Arquitetura | 70 |
| `openai-codex-cloud` | OpenAI Codex: o Agente na Nuvem | 65 |
| `cursor-copilot-ides` | Cursor, Copilot e os IDEs Aumentados | 60 |
| `amazon-q-kiro` | Amazon Q e Kiro: a Aposta da AWS | 60 |
| `qual-coding-agent-usar` | Qual Ferramenta Usar e Quando | 80 |

### Módulos futuros (planejados)
- Nenhum definido no momento

### Regra de slugs
**Slugs são IDs permanentes no localStorage** — nunca renomear um slug sem fazer migração de dados do usuário.

---

## Como adicionar um novo artigo

1. **Adicionar no currículo** (`src/lib/curriculum.ts`):
```ts
{
  slug: 'meu-novo-artigo',
  title: 'Título do Artigo',
  icon: '🔥',
  xp: 50,
  readTime: 8,
  desc: 'Descrição curta para o card do blog.',
  seoDesc: 'Descrição para SEO/meta tag.',
  keywords: 'palavras, chave, seo',
}
```

2. **Criar a página** em `src/app/aprenda/meu-novo-artigo/page.tsx`:
```tsx
import { ModuleLayout } from '@/components/ModuleLayout';

const quiz = [ /* 3 perguntas */ ];

export default function Page() {
  return (
    <ModuleLayout
      slug="meu-novo-artigo"
      title="Título"
      icon="🔥"
      xp={50}
      readTime={8}
      trailName="Nome da Trilha"
      trailColor="#58a6ff"
      nextSlug="proximo-artigo"
      nextTitle="Próximo Artigo"
      quiz={quiz}
    >
      {/* conteúdo JSX */}
    </ModuleLayout>
  );
}
```

3. **Rodar o deploy** — seguir o fluxo da seção "Fluxo de Deploy".

---

## Design System

Tema dark inspirado no GitHub. Variáveis CSS definidas em `src/app/globals.css`:

```css
--ffv-blue:   #58a6ff   /* accent Trilha 1, links */
--ffv-green:  #3fb950   /* sucesso, completo */
--ffv-purple: #d2a8ff   /* accent Trilha 2 */
--ffv-orange: #ffa657   /* streak, destaque */
--ffv-red:    #f78166   /* erro, destaque negativo */
--ffv-yellow: #e3b341   /* level up */
--ffv-bg:     #0d1117   /* fundo principal */
--ffv-bg2:    #161b22   /* cards, seções */
--ffv-bg3:    #21262d   /* inputs, badges */
--ffv-border: #30363d   /* bordas */
--ffv-muted:  #8b949e   /* texto secundário */
```

Referências visuais: Linear, Vercel, Raycast (layout/estilo), Duolingo/Codecademy (gamificação).

---

## Convenções

- Idioma: **Português brasileiro** em todo o conteúdo e UI
- Todas as trilhas são **abertas** — sem bloqueio entre trilhas
- SEO: cada módulo tem `seoDesc` e `keywords` — manter no `metadata` do Next.js
- 100% gratuito, sem cadastro obrigatório
- Não usar `next/image` (desabilitado para export estático — `images: { unoptimized: true }`)
