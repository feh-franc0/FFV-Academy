import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('posthog-mixpanel-analytics');

const accent = '#d946ef';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que schema de evento deveria seguir padrao verb-noun estavel?',
    options: [
      'Moda',
      'Porque dashboards, funnels e cohorts dependem de nomes consistentes ao longo do tempo — renomear evento quebra historico e gera retrabalho em todas as querys salvas',
      'Para caber na tela',
      'Requisito do GDPR',
    ],
    correct: 1,
    explanation: 'Segal/Amplitude publicaram guia canonico: object_action (signup_completed, checkout_started). Algumas empresas preferem action_object. Importante e fixar padrao cedo, documentar em tracking plan versionado e reforcar via type-safe wrappers no SDK.',
  },
  {
    question: 'Qual vantagem do PostHog frente a Mixpanel/Amplitude?',
    options: [
      'Mais bonito',
      'Open source com opcao de self-host (dado fica na sua infra), inclui feature flags, session replay e product analytics no mesmo produto, pricing mais previsivel. Trade-off: ecossistema menor e operacao do cluster em self-host',
      'Graca',
      'Exclusivo Google',
    ],
    correct: 1,
    explanation: 'PostHog self-host atende requisitos LGPD/GDPR rigidos (dado nao sai do seu cloud). Inclui FF, replay, dashboards — reduz stack. Mixpanel/Amplitude sao maduros, tem melhor experiencia analitica e integracoes; Amplitude tem free tier generoso para startups.',
  },
  {
    question: 'O que deve NAO entrar em payload de evento?',
    options: [
      'Nada',
      'PII sensivel sem necessidade (cpf, senha, token, cartao), strings enormes (log inteiro), dados pessoais que violem LGPD sem consent — trackamos o MINIMO necessario para a metrica',
      'Timestamp',
      'Nome do evento',
    ],
    correct: 1,
    explanation: 'Principio de minimizacao (LGPD art 6). Se a metrica e conversion, voce nao precisa de CPF. Use user_id pseudonimizado. Em caso de logs de erro, sanitize antes de enviar. Consent checkbox nao pode vir pre-marcado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="posthog-mixpanel-analytics"
      title="Product analytics: PostHog, Mixpanel, Amplitude"
      icon="📈"
      xp={45}
      readTime={11}
      trailName="Product Engineering & Experimentation"
      trailColor={accent}
      nextSlug="capstone-experiment-real"
      nextTitle="Capstone: experiment end-to-end"
      quiz={quiz}
    >
      <Section title="Escolha da stack" accent={accent}>
        <CodeBlock lang="markdown">{`PostHog
  + open source, self-host, inclui FF + session replay
  + pricing por evento previsivel
  - operacao do cluster em self-host, ecosystem menor

Mixpanel
  + interface analitica madura, cohort/funnel solidos
  + integracoes extensas (warehouse, CDP)
  - pricing cresce rapido com volume, closed source

Amplitude
  + free tier generoso ate 10M events/mes
  + govern features fortes (data governance, taxonomy)
  - caro acima do free tier, vendor lock-in

Segment (CDP, nao analytics puro)
  + hub que envia evento para N destinos
  + bom para multi-tool stack
  - camada extra, custo por MTU`}</CodeBlock>
      </Section>

      <Section title="Tracking plan como contrato" accent={accent}>
        <CodeBlock lang="yaml">{`# tracking-plan.yaml (versionado em repo)
events:
  signup_completed:
    description: Usuario finalizou criacao de conta
    properties:
      method:       {type: string, enum: [email, google, github]}
      plan:         {type: string, enum: [free, pro, team]}
      referral_id:  {type: string, optional: true}
      $device_type: {type: string}

  checkout_started:
    description: Usuario entrou no fluxo de checkout
    properties:
      cart_total_cents: {type: integer, min: 0}
      items_count:      {type: integer, min: 1}
      currency:         {type: string, enum: [BRL, USD, EUR]}`}</CodeBlock>
        <Callout tone="info">
          Tracking plan vira fonte de verdade. Gere tipos TS a partir dele para instrumentacao type-safe. PR que adiciona evento passa por review — nao merge direto.
        </Callout>
      </Section>

      <Section title="Instrumentacao type-safe (PostHog)" accent={accent}>
        <CodeBlock lang="ts">{`// src/lib/analytics.ts
import posthog from 'posthog-js';

type Events = {
  signup_completed: {
    method: 'email' | 'google' | 'github';
    plan: 'free' | 'pro' | 'team';
    referral_id?: string;
  };
  checkout_started: {
    cart_total_cents: number;
    items_count: number;
    currency: 'BRL' | 'USD' | 'EUR';
  };
};

export function track<K extends keyof Events>(event: K, props: Events[K]) {
  if (typeof window === 'undefined') return;
  posthog.capture(event, props);
}

// uso
track('checkout_started', {
  cart_total_cents: 9900,
  items_count: 2,
  currency: 'BRL',
});`}</CodeBlock>
      </Section>

      <Section title="Funnel, cohort, retention" accent={accent}>
        <p>
          Funnel: sequencia de eventos com drop-off por etapa. Cohort: grupo de usuarios que compartilham atributo (mes de signup, plano, pais). Retention: qual fracao do cohort retornou em janela D1/D7/D30. Os tres juntos contam a historia de ativacao e retencao — metricas basicas de product analytics.
        </p>
      </Section>

      <Section title="LGPD/GDPR sem teatro" accent={accent}>
        <Callout tone="warn">
          Consent banner precisa ser opt-in real, nao pre-marcado. Pseudonimize user_id (hash nao reversivel de email). Exponha delecao (right to be forgotten) via API do provider. Documente retencao por tipo de evento. PostHog, Mixpanel e Amplitude tem APIs de delete — use.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
