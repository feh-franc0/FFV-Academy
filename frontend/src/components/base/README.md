# KnowledgeBaseHome + BaseModule — bases de conhecimento unificadas

Sistema único pra renderizar a página índice (`/<base>`) e as páginas de
módulo (`/<base>/<slug>`) de **qualquer base** — tecnologia, medicina
veterinária, direito, design, etc.

> **Editar uma section = altera em TODAS as bases automaticamente.**

## Como funciona

- `KnowledgeBaseHome` orquestra as sections em ordem fixa.
- Cada section vive em `src/components/home/*` (Hero, Explorar, ComecarAqui, etc.).
- Sections aceitam dados via props com defaults pra `/tecnologia` (zero churn).
- Tema é aplicado via override de CSS vars (`--ffv-blue`, `--ffv-bg2`, etc.)
  num wrapper — sections continuam usando `var(--ffv-*)` como sempre.

## Sections compartilhadas

| Section | Arquivo | Props chave |
|---------|---------|-------------|
| Hero | `home/Hero.tsx` | `kicker, badge, title, description, ctas, stats, showGameDemo` |
| SocialProofBar | `home/SocialProofBar.tsx` | (global) |
| HowItWorks | `home/HowItWorks.tsx` | (global, gamificação) |
| ComecarAqui | `home/ComecarAqui.tsx` | `paths, heading, subheading` |
| Explorar | `home/Explorar.tsx` | `hubs, playlists, mapHref, heading, subheading` |
| HomeRanking | `home/HomeRanking.tsx` | (global — ranking é único da plataforma) |
| ComunidadeAutor | `home/ComunidadeAutor.tsx` | (global) |
| FinalCta | `home/FinalCta.tsx` | `kicker, title, description, ctaHref, ctaLabel, footnote` |

## Adicionar nova base (ex.: `/direito`)

### 1. Dados em `src/lib/bases/direito/`

```
src/lib/bases/direito/
├── index.ts            ← DIREITO_BASE com trails + hubs
├── theme.ts            ← DIREITO_THEME (BaseTheme — paleta)
├── adapters.ts         ← DIREITO_HUBS, DIREITO_PATHS (shapes shared)
└── trilha-X-modules.ts ← módulos
```

### 2. Theme (`theme.ts`)

```ts
import type { BaseTheme } from '../theme';

export const DIREITO_THEME: BaseTheme = {
  ink: '#0c1429', paper: '#fafaf5', cream: '#ffffff',
  border: '#d6cdb8', muted: '#52525b',
  accent: '#7c2d12',        // bordeaux (substitui o navy padrão)
  accentLight: '#f59e0b',
  success: '#15803d',
  hubColors: ['#1e3a8a', '#7c2d12', '#15803d', '#a16207'],
};
```

### 3. Adapters (`adapters.ts`)

Converte `DIREITO_BASE.hubs` → `HubCardData[]` que o `Explorar` aceita.
Converte hubs → `ComecarPath[]` pro `ComecarAqui`. Ver `medvet/adapters.ts`.

### 4. Page (`app/direito/page.tsx`)

```tsx
import { KnowledgeBaseHome } from '@/components/base/KnowledgeBaseHome';
import { DIREITO_THEME } from '@/lib/bases/direito/theme';
import { DIREITO_HUBS, DIREITO_PATHS, ... } from '@/lib/bases/direito/adapters';

export default function DireitoPage() {
  return (
    <KnowledgeBaseHome
      theme={DIREITO_THEME}
      hero={{ kicker: 'Direito · ...', badgeText: '...', title: ..., ctas: [...] }}
      hubs={DIREITO_HUBS}
      paths={DIREITO_PATHS}
      playlists={[]}
      finalCta={{ ctaHref: '/#solicitar-base', ctaLabel: 'Criar minha base →' }}
    />
  );
}
```

### 5. Module page (`app/direito/[slug]/page.tsx`)

Usa `BaseModule` igual `/medicina-veterinaria/[slug]/page.tsx`.

### 6. Backend

Em `backend/internal/interfaces/http/handlers/bases_handler.go`, mudar status
do slug `direito` pra `"live"`.

## Chrome (header/footer)

Todas as bases agora usam o **app chrome** (`GameHUD` + `SiteFooter`) — não
o chrome editorial da landing. Configurado em `src/components/AppChrome.tsx`
via `MARKETING_PREFIXES`. Significa que XP/streak/ranking aparecem em todas.
