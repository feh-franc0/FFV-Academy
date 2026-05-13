import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-app-completo-ssr');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o entregável mínimo para esse capstone valer como portfolio peça?',
    options: [
      'Repo com componentes bonitos',
      'App real deployado (dashboard, blog ou e-commerce mínimo), Next.js App Router com RSC + Server Actions, CSS moderno (layers + container queries + :has), a11y AA auditada, Lighthouse > 95 em LCP/INP/CLS, bundle inicial < 200kb, RUM em prod, README explicando decisões',
      'Tailwind bonito',
      'Screenshot',
    ],
    correct: 1,
    explanation: 'Portfolio piece impressiona por rigor mensurável: números concretos de Lighthouse, bundle size medido, a11y auditada com ferramenta (axe, Accessibility Insights), RUM rodando. Código bonito sem métrica é decoração; com métrica vira evidência de engenharia.',
  },
  {
    question: 'Por que incluir a11y AA auditada e não só "tentar ser acessível"?',
    options: [
      'É opcional',
      'Porque AA é padrão mínimo legal em muitos países (EAA na UE 2025, ADA nos EUA por jurisprudência), recrutador técnico sênior sabe reconhecer, e ferramenta (axe-core, Pa11y) dá relatório reproduzível. "Tentar" não é evidência — relatório axe com 0 violations no CI é',
      'Só estética',
      'Só bibliotecas',
    ],
    correct: 1,
    explanation: 'A11y mensurada = a11y séria. EAA (European Accessibility Act) entrou em vigor em 2025 e torna AA obrigatório em produto B2C na UE. axe-core integrado em CI ou Pa11y gerando HTML report é o diferencial. Mostra que você entende o que é WCAG, não só "coloquei aria-label".',
  },
  {
    question: 'Por que escrever README com "por que" em vez de só "como rodar"?',
    options: [
      'README é obsoleto',
      'Porque recrutador/tech lead quer ver como você PENSA, não só o que fez. README com decisões (por que App Router, por que Server Actions vs API routes, trade-offs de CSS moderno vs Tailwind, como mediu performance) demonstra autoria e critério. "How to run" é commodity; "why these choices" é sinal',
      'Só para juniores',
      'Não importa',
    ],
    correct: 1,
    explanation: 'Writeup de decisões é o diferencial. Mostra autoria, trade-offs ponderados, reconhecimento de limitações. Recrutador sênior lê README antes de abrir código — se README é só setup, assume que pensamento também é só setup. README bom compra atenção para o código.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-app-completo-ssr"
      title="Capstone: app completo com SSR + streaming + perf"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Frontend Moderno — HTML, CSS, JS e React"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Objetivo do capstone" accent={accent}>
        <p>
          Entregar app real, deployado e medido, que consolida os 7 módulos: HTML semântico, CSS moderno, JS ES2024+, React fiber, Server Components, Server Actions, Core Web Vitals. Serve como peça central de portfolio para vagas de frontend sênior ou fullstack.
        </p>
      </Section>

      <Section title="Escolha do domínio" accent={accent}>
        <CodeBlock lang="markdown">{`## Três domínios válidos (escolha um)

### A) Blog técnico com autor
- Lista de posts, post individual com MDX, tags, busca
- Comentários ou likes com Server Actions
- RSS feed, sitemap, metadata OG
- Dark/light mode com light-dark() CSS

### B) Mini e-commerce (1 categoria real)
- Catálogo com filtros (container queries nos cards!)
- Carrinho persistido (cookie + Server Action)
- Checkout mock (sem gateway real — stub)
- Página de produto com imagens otimizadas (AVIF + srcset)

### C) Dashboard (dados públicos)
- Ex: dashboard de moedas, clima de cidades, stats do GitHub
- Tabelas com filtros, gráfico (recharts ou visx)
- Filtros com URL como source of truth (useSearchParams)
- Streaming Suspense para cada widget`}</CodeBlock>
      </Section>

      <Section title="Stack obrigatória" accent={accent}>
        <CodeBlock lang="yaml">{`framework: Next.js 15+ (App Router)
linguagem: TypeScript estrito
estilo:
  - CSS Modules OU Tailwind 4 com @layer
  - usar: Grid, Subgrid em ao menos 1 lugar, Container queries, :has(), light-dark()
dados:
  - pelo menos 1 Server Component async fazendo fetch
  - pelo menos 1 Server Action de mutação
  - pelo menos 1 Suspense com streaming
a11y:
  - dialog nativo OU popover para 1 feature
  - form com validação nativa + :user-invalid
  - landmarks, heading hierarchy, alt em imagens
perf:
  - hero image com AVIF + srcset + fetchpriority=high
  - font preload + font-display swap
  - Lighthouse > 95 em Performance E Accessibility em mobile
  - INP medido em RUM (web-vitals.js + beacon em /rum)
ci:
  - tsc --noEmit, eslint, test (se aplicável)
  - Lighthouse CI com budget
  - axe-core rodando em CI (ex: @axe-core/playwright)
deploy:
  - Vercel ou Cloudflare Pages (ambos gratuitos para portfólio)
  - dominio .dev ou subdomínio`}</CodeBlock>
      </Section>

      <Section title="Timeline de 2 semanas" accent={accent}>
        <CodeBlock lang="markdown">{`## Semana 1 — esqueleto e dados

### Dia 1: spec + escolher domínio
- README inicial com visão e não-metas
- Wireframe de 3 telas principais

### Dia 2-3: layout com App Router
- app/layout.tsx, app/page.tsx
- Grid macro (header/sidebar/main/footer)
- CSS Modules com @layer reset, base, components

### Dia 4-5: dados reais
- Server Components fazendo fetch em API real ou SQLite local
- 1 Server Action funcional (com Zod validando input)
- Suspense em 1 widget pesado

### Dia 6-7: interatividade
- Client Component mínimo (form de busca, quantidade)
- useOptimistic em ao menos 1 interação
- Container queries em componente Card

## Semana 2 — polimento e medição

### Dia 8-9: a11y e HTML semântico
- Auditoria axe em cada rota
- <dialog> ou popover em 1 feature
- Form com validação nativa + :user-invalid
- Corrigir todas as violações reportadas

### Dia 10-11: performance
- AVIF + srcset no hero
- Font preload + size-adjust
- Lighthouse CI no PR + budget.json
- Medir e corrigir até > 95

### Dia 12: RUM + deploy
- web-vitals.js em prod
- Deploy Vercel
- Dashboard simples de RUM (Posthog ou Vercel Analytics)

### Dia 13-14: writeup
- README reescrito com DECISÕES (não só setup)
- Screenshot do Lighthouse
- Vídeo 60s mostrando a11y (keyboard nav, screen reader opcional)`}</CodeBlock>
      </Section>

      <Section title="README que chama atenção" accent={accent}>
        <CodeBlock lang="markdown">{`# [Nome do app]

[Screenshot ou GIF]

## TL;DR
App [dashboard/blog/e-commerce] construído para explorar RSC + CSS moderno + perf budget.
Lighthouse mobile: LCP 1.4s, INP 120ms, CLS 0.02. Bundle inicial: 140kb. 0 axe violations.

## Live
- App: https://...
- Repo: https://github.com/.../app-capstone

## Por que essas escolhas

### Arquitetura: Server Components por default
Páginas são SC; ilhas interativas ("use client") só em QuantityInput, FilterBar e LikeButton.
Bundle inicial caiu de 340kb (versão toda client) para 140kb.

### CSS: Modules + @layer vs Tailwind
Optei por CSS Modules + Cascade Layers porque queria exercitar :has(), container queries
e view transitions sem brinco de Tailwind. Trade-off: menos velocidade de prototipagem.

### Server Actions vs API Routes
Mutações internas (createOrder, toggleLike) usam Server Actions — zero boilerplate e
progressive enhancement funciona. API Route só para webhook público.

### A11y
<dialog> nativo para modal de confirmação, form com validação nativa + :user-invalid,
landmark correto (header/nav/main/aside/footer), headings sem pular nível.
Axe-core roda em CI: 0 violations em todas as rotas.

### Perf
Hero image AVIF 720p (42kb), srcset 480/768/1200, fetchpriority=high.
Font Inter preload + size-adjust.
useTransition no filtro pesado, Worker para parse de CSV do dashboard.

## Métricas (Lighthouse CI, mobile throttled)
| rota       | LCP   | INP   | CLS  | bundle |
| /          | 1.2s  | 85ms  | 0.01 | 140kb  |
| /dashboard | 1.4s  | 120ms | 0.02 | 165kb  |

## Stack
Next.js 15, TypeScript, CSS Modules, Zod, web-vitals.js, axe-core, Lighthouse CI.

## Limitações conhecidas
- Filtro do dashboard não suporta > 10k itens sem virtualização (TODO)
- Dark mode usa light-dark() — Firefox abaixo de 120 cai no light
- ...

## Rodando local
npm i && npm run dev (docs extras em /docs/)`}</CodeBlock>
      </Section>

      <Section title="Entregáveis checklist" accent={accent}>
        <Callout tone="success" icon="✅">
          App deployado em URL pública, repo com README forte (decisões, não só setup), screenshot Lighthouse &gt; 95, axe CI com 0 violations, RUM rodando em prod, bundle inicial &lt; 200kb, vídeo curto mostrando keyboard nav e Server Action em ação, documento de trade-offs honesto com limitações. Esse combo vira peça que gera conversa em entrevista técnica — e é o padrão que distingue frontend senior de frontend "genérico" em 2026.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
