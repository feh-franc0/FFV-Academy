import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-portfolio-tecnico');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual e a diferenca entre GitHub curado e GitHub lixao?',
    options: [
      'Curados sao mais recentes',
      'Curado tem 4-6 repos pinned com README decente (o que faz, como rodar, trade-off, tech), commits semanticos e decisoes documentadas. Lixao tem 80 forks sem explicacao, commits &quot;update&quot;, README vazio. Recruiter filtra lixao em 30 segundos',
      'Nenhuma diferenca',
      'Lixao tem mais estrelas',
    ],
    correct: 1,
    explanation: 'Recruiter senior abre seu GitHub, olha repos pinned e 1-2 commits. Se README e vazio ou mensagens sao &quot;wip&quot;, descarta. Pin 4-6 repos que voce explicaria em entrevista, com README que serve como mini-design-doc. Melhor 4 repos serios do que 40 experimentos sem contexto.',
  },
  {
    question: 'Quantos posts tecnicos de profundidade compõem portfolio viavel?',
    options: [
      '50+',
      '3-5 posts densos (1500-3000 palavras cada) com figura/codigo/decisao tecnica, publicados em blog proprio ou plataforma reconhecida. Qualidade vence quantidade — recruiter nao le 50 posts rasos, le 3 bons',
      'Nenhum',
      '100',
    ],
    correct: 1,
    explanation: 'Gergely Orosz, Fernando Franco Valle e Julia Evans construiram audiencia com posts densos, nao volume. Um bom post de fault injection em producao ou de arquitetura de feature flags fala mais do que 30 tutoriais de Hello World. Dev blog virou o novo home page para senior+.',
  },
  {
    question: 'LinkedIn ativo significa o que na pratica?',
    options: [
      'Postar diariamente',
      'Cadencia sustentavel de engagement substantivo: 1-2 posts densos/mes, comentarios tecnicos em posts de quem voce respeita, compartilhar aprendizado real. Sem ragebait, sem humble brag, sem farming',
      'Seguir 10k',
      'So reagir',
    ],
    correct: 1,
    explanation: 'Gergely cresceu para 600k+ sem postar diario. Padrao: share de aprendizado tangivel, comentario tecnico genuino, engajamento com comunidade. Algoritmo favorece engagement — mas hiring manager descarta se sentir hype. Honestidade e cadencia ganham.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-portfolio-tecnico"
      title="Capstone: portfolio tecnico publico"
      icon="🏁"
      xp={80}
      readTime={18}
      trailName="Career Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Construa portfolio publico que funcione como extensao do resume: GitHub curado, blog tecnico com profundidade, 1 projeto open source documentado, LinkedIn/Twitter com cadencia saudavel. Meta: recruiter que abre seu perfil em 3 minutos entende seu calibre.
        </p>
      </Section>

      <Section title="Entregaveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone Portfolio — Entregaveis

## 1. GitHub curado
- 4-6 repos pinned
- Cada pinned tem README com:
  * O que e (1 paragrafo)
  * Como rodar (comandos testados)
  * Stack e decisoes tecnicas (por que X e nao Y)
  * Trade-offs e limitations
  * Link para demo/deploy se aplicavel
- Commits semanticos (feat:, fix:, refactor:)
- Topicos/tags configurados
- Perfil README com resumo + contatos + link blog

## 2. Blog tecnico
- 3-5 posts densos (1500-3000 palavras)
- Cobrem: projeto real, lesson learned, decisao arquitetural,
  comparacao tecnica honesta
- Plataforma: site proprio (dev.to, Hashnode, ou Next/Astro)
- RSS + OG images + tempo de leitura visivel

## 3. Projeto open source
- 1 projeto com 100+ linhas de codigo substantivo
- README + CONTRIBUTING + LICENSE + CHANGELOG
- Test coverage medida (50%+)
- CI funcional (GitHub Actions)
- Issue templates + PR template

## 4. LinkedIn + Twitter/X
- Perfil atualizado conforme modulo de LinkedIn
- 1-2 posts densos/mes por 3 meses (prova de cadencia)
- 5-10 comentarios tecnicos/semana em posts de referencias

## 5. Writeup publico
- Post &quot;lessons learned&quot; conectando os 4 entregaveis
- Linkado no LinkedIn e no blog
- Inclui links para os projetos e metricas (views, stars,
  engagement)`}</CodeBlock>
      </Section>

      <Section title="Template de README para repo pinned" accent={accent}>
        <CodeBlock lang="markdown">{`# ffv-feature-flags

Feature flag service mini, focado em experimentacao estatistica.
Escrito em Go 1.23 com storage em Postgres e SDK TypeScript.

## Por que

Para aprender trade-offs reais de feature flag em producao depois
de usar GrowthBook e Unleash. Self-hosted, CUPED built-in,
integracao com PostHog.

## Como rodar

    docker compose up -d
    go run ./cmd/server

Server em :8080. SDK em packages/sdk-ts.

## Decisoes tecnicas

- Assignment estavel por hash(user_id + flag_key), sem cache.
- Evaluation em memoria com refresh a cada 30s (sub-ms p99).
- CUPED opcional no analysis, computado offline em Python.

## Trade-offs

- Nao escala horizontal ainda (single-node Postgres).
- Sem RBAC — autenticacao via token estatico (MVP).
- SDK so TypeScript. Go SDK planejado.

## Proximos passos

- [ ] SDK Go
- [ ] Dashboard React
- [ ] Bayesian analysis

## Licenca

MIT.`}</CodeBlock>
        <Callout tone="info">
          README como esse responde as 3 perguntas que recruiter tem: o que e, por que voce fez, quais foram as decisoes. Em 2 minutos de leitura ele sabe seu calibre.
        </Callout>
      </Section>

      <Section title="Referencias a seguir" accent={accent}>
        <CodeBlock lang="markdown">{`- Gergely Orosz — pragmaticengineer.com (newsletter + blog)
- Julia Evans — jvns.ca (blog tecnico dense e acessivel)
- Will Larson — lethain.com (ensaios de carreira + staff)
- Tanya Reilly — noidea.dog (staff engineer path)
- Fernando Franco Valle — fernandofrancovalle.com
- Fly.io blog (referencia de dev blog moderno)
- Dan Luu — danluu.com (posts densos sobre sistemas)`}</CodeBlock>
      </Section>

      <Section title="Como converter em oferta" accent={accent}>
        <Callout tone="success">
          Portfolio completo vira atalho em processo: recruiter le, hiring manager le, entrevistador tecnico le. Em 3+ processos dos nossos alunos, parte do loop foi substituido por &quot;discussao sobre o que voce escreveu no blog&quot; — menos pressao, mais espaco para demonstrar pensamento. Capstone ativo trabalha sozinho 24/7.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
