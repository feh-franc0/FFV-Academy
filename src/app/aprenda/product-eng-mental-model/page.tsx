import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('product-eng-mental-model');

const accent = '#d946ef';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia product engineer de IC puro?',
    options: [
      'Escreve mais código',
      'DRI de métrica de produto: conhece usuário, hipótese, trade-off de negócio e mede impacto em métrica — não apenas ships feature descrita em ticket',
      'Trabalha mais horas',
      'Faz design também',
    ],
    correct: 1,
    explanation: 'Stripe, Airbnb e Shopify formalizaram o arquétipo: o product engineer é DRI (Directly Responsible Individual) por uma métrica (ativação, retenção, conversão). Ele refina o problema, desenha experimento, prioriza, mede e itera. IC puro recebe ticket pronto — product engineer define o ticket.',
  },
  {
    question: 'Qual é o sinal de que uma feature deveria ser um experimento, não um release?',
    options: [
      'Demora mais de 1 sprint',
      'Existe incerteza mensurável sobre o impacto na métrica (ativação, conversão, churn) e o custo de reverter é baixo — ship behind flag, medir, decidir',
      'Envolve frontend',
      'Toca em 3+ serviços',
    ],
    correct: 1,
    explanation: 'Se você sabe que precisa existir (login, billing, segurança), faça release comum atrás de flag operacional. Se você *acha* que vai melhorar uma métrica, faça experiment com hipótese, amostra e guardrails. Confundir os dois gera feature debt e paralisia.',
  },
  {
    question: 'Por que staff+ path cresce via produto em vez de só profundidade técnica?',
    options: [
      'Salário maior',
      'Escopo staff exige traduzir problema de negócio em sistema: escolher o que construir e o que não construir — isso é produto. Sem esse músculo, você vira technical deep specialist, não staff',
      'É menos código',
      'Tem mais reuniões',
    ],
    correct: 1,
    explanation: 'Gergely Orosz e Will Larson mapeiam staff engineer como multiplicador de escopo. Você avança decidindo o que o time constrói — requer entender usuário, métrica, trade-off de custo/risco. Deep specialist também existe (principal IC), mas é caminho mais estreito.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="product-eng-mental-model"
      title="Product engineering: o mindset"
      icon="🎯"
      xp={45}
      readTime={10}
      trailName="Product Engineering & Experimentation"
      trailColor={accent}
      nextSlug="feature-flags-growthbook"
      nextTitle="Feature flags: GrowthBook + Unleash"
      quiz={quiz}
    >
      <Section title="Quem é o product engineer" accent={accent}>
        <p>
          O arquétipo formalizado por Stripe, Airbnb e Shopify descreve engenheiro que é DRI de métrica — ativação, conversão, retenção, revenue per user. Ele não espera PM escrever ticket perfeito: define o problema, desenha experimento, mede e itera. Ferramenta e código são meio.
        </p>
        <Callout tone="info">
          DRI (Directly Responsible Individual) não quer dizer trabalhar sozinho. Quer dizer que se a métrica mover, você explica por que. Se não mover, você explica o que tentou e o próximo experimento.
        </Callout>
      </Section>

      <Section title="Três eixos do trabalho" accent={accent}>
        <ComparacaoEixos />
      </Section>

      <Section title="Release vs experiment vs permission flag" accent={accent}>
        <p>
          Três tipos de flag resolvem três problemas distintos. Confundir gera código morto e decisões ruins.
        </p>
        <CodeBlock lang="yaml">{`release-flag:
  objetivo: desacoplar deploy de launch
  duracao: dias a semanas
  descarte: remover apos 100% rollout estavel

experiment-flag:
  objetivo: medir impacto em metrica
  duracao: tempo necessario para power estatistico
  descarte: promover vencedor, remover flag

permission-flag:
  objetivo: gating por plano, beta, enterprise
  duracao: permanente
  descarte: nunca (vira logica de produto)`}</CodeBlock>
      </Section>

      <Section title="Trade-off que define o nivel" accent={accent}>
        <p>
          Staff+ decide o que NAO construir. Toda feature custa: manutencao, superficie de bug, complexidade cognitiva para o time. Product engineer senior defende cortes — inclusive do proprio trabalho.
        </p>
        <Callout tone="warn">
          Anti-pattern: shipar feature porque foi pedida, sem hipotese. Depois de 6 meses ninguem usa, ninguem remove, e o time perde velocidade mantendo-a. Melhor dizer nao com data.
        </Callout>
      </Section>

      <Section title="Leituras de referencia" accent={accent}>
        <p>
          Will Larson (Staff Engineer), Gergely Orosz (Pragmatic Engineer), Lenny Rachitsky, blog de engenharia do Stripe e Airbnb. Nada disso e hype — sao playbooks operacionais de quem fez o papel existir.
        </p>
      </Section>
    </ModuleLayout>
  );
}

function ComparacaoEixos() {
  return (
    <CodeBlock lang="markdown">{`Eixo 1 — Usuario
  Quem e, o que tenta fazer, qual fricao sente
  Fonte: entrevista, session replay, support ticket

Eixo 2 — Metrica
  Qual numero move, qual guardrail nao pode regredir
  Fonte: product analytics (PostHog, Mixpanel, Amplitude)

Eixo 3 — Trade-off
  Custo de build vs impacto esperado vs risco
  Fonte: estimativa honesta + historico de experimentos anteriores`}</CodeBlock>
  );
}
