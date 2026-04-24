import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('platform-eng-vs-devops');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença estrutural entre DevOps e Platform Engineering?',
    options: [
      'Só o nome',
      'DevOps é cultura/princípios ("you build it, you run it"). Platform Engineering é um time dedicado que entrega um produto interno (a plataforma) cujos usuários são os outros devs da empresa. PE é como o DevOps se organiza em escala (200+ engineers)',
      'PE substitui DevOps',
      'DevOps é obsoleto',
    ],
    correct: 1,
    explanation: 'DevOps sem time dedicado em escala cria toil: cada time reinventa CI, monitoring, deploy. PE consolida isso num Internal Developer Platform (IDP) consumido pelos times de produto. Cultura DevOps permanece — a PE a operacionaliza em produto.',
  },
  {
    question: 'O que significa "toil" no contexto SRE/PE?',
    options: [
      'Trabalho divertido',
      'Trabalho manual, repetitivo, reativo, sem valor duradouro e que escala linearmente com o crescimento do serviço. PE ataca toil convertendo processos manuais em self-service automatizado — leverage sobre toil',
      'Bug fix',
      'Reunião',
    ],
    correct: 1,
    explanation: 'Definição de Google SRE Book. Criar repo manualmente = toil. Template scaffolder que cria em 1 comando = leverage. PE mede redução de toil como KPI: hours saved per week, self-service adoption rate. Sem essa métrica, PE vira ticket queue disfarçado.',
  },
  {
    question: 'Por que "you build it, you run it" puro quebra em 200+ devs?',
    options: [
      'Não quebra',
      'Cada time reinventa Dockerfile, pipeline, observability, SLOs, on-call. Quality varia brutalmente. Conhecimento cross-time não propaga. Duplicação de custo, segurança inconsistente, incidentes por config drift. PE oferece paved road que resolve 80% dos casos e cada time foca no diferencial do produto',
      'Devs são preguiçosos',
      'Só AWS resolve',
    ],
    correct: 1,
    explanation: 'O princípio continua válido (times donos do runtime do serviço), mas sem paved road a curva de custo explode. PE não remove ownership — pavimenta o caminho feliz. Quem quer off-path pode, assume o custo. É leverage organizacional, não controle central.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="platform-eng-vs-devops"
      title="Platform Engineering vs DevOps"
      icon="🆚"
      xp={45}
      readTime={11}
      trailName="Platform Engineering & IDPs"
      trailColor={accent}
      nextSlug="backstage-developer-portal"
      nextTitle="Backstage: developer portal da Spotify"
      quiz={quiz}
    >
      <Section title="O mal-entendido" accent={accent}>
        <p>
          Platform Engineering não é rename de DevOps. DevOps é cultura (colaboração dev+ops, ownership compartilhado,
          automação). PE é um time com missão de produto: entregar um Internal Developer Platform (IDP) que outros
          devs consomem. O usuário do PE é o engenheiro de aplicação, e a plataforma é o produto.
        </p>
      </Section>

      <Section title="Toil vs leverage" accent={accent}>
        <p>
          Toil (Google SRE): manual, repetitivo, reativo, sem valor duradouro, escala linear. Leverage: automação
          que paga o custo inicial e libera capacidade indefinidamente. PE mede a razão toil/leverage como KPI.
        </p>
        <CodeBlock lang="yaml">{`# Sinais de que o time ainda está em toil puro
signals_of_toil:
  - "Criar novo microsserviço leva mais de 1 dia"
  - "Onboarding de dev novo leva semanas ate primeiro PR em prod"
  - "Cada time tem seu proprio Dockerfile, pipeline e monitoring stack"
  - "Mudanca de versao de runtime exige tocar N repos manualmente"
  - "Nao ha catalog central de servicos com owner e SLO"
  - "Incidente comum: config drift entre prod e staging"`}</CodeBlock>
      </Section>

      <Section title="IDP (Internal Developer Platform)" accent={accent}>
        <p>
          IDP é a superfície que times de produto consomem: portal (catalog, docs, scaffolder), golden paths
          (templates de caminho feliz), self-service infra (provisioning via API/UI), observability padronizada,
          CI/CD consistente. Backstage, Port e Cortex são produtos nessa categoria; muitas empresas grandes
          constroem o próprio em cima de Backstage.
        </p>
        <Callout tone="info" icon="💡">
          Regra de ouro do Team Topologies: plataforma é X-as-a-Service para stream-aligned teams. Se seu
          "platform team" vira ticket queue onde devs pedem favores, você tem ops disfarçado, não PE.
        </Callout>
      </Section>

      <Section title="Quando PE compensa" accent={accent}>
        <p>
          Heurística: a partir de ~150 engineers, duplicação de esforço entre times custa mais que um time de
          PE de 4-8 pessoas. Abaixo disso, DevOps + SRE tradicional é suficiente. Outro gatilho: regulação
          (SOX, HIPAA) exige padronização — PE vira obrigatório.
        </p>
        <Callout tone="warn" icon="⚠️">
          Não crie PE para "organizar tudo". Crie PE com problema concreto e métrica — tempo para first PR em
          prod, frequência de deploy, custo de onboarding. Sem métrica, PE vira burocracia que ninguém usa.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
