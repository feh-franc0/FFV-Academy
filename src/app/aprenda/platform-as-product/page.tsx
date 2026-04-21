import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('platform-as-product');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que significa "platform as product" na prática?',
    options: [
      'Cobrar pela plataforma',
      'Tratar devs internos como usuários com necessidades, não como requisitantes. Fazer user research (entrevistas, shadowing), manter roadmap público com problemas priorizados, medir adoção e satisfação, competir com "fazer DIY" em DX. Se ninguém usa a plataforma voluntariamente, ela não é produto',
      'Vender para fora',
      'Ter logo',
    ],
    correct: 1,
    explanation: 'Team Topologies e livros de PE modernos (Manuel Pais, Matthew Skelton) consolidam: platform é X-as-a-Service com user research, métricas e roadmap. Times de plataforma que operam como PO-driven têm adoção 3-5x maior que platform-as-ticket-queue.',
  },
  {
    question: 'O papel de um Enabling Team (Team Topologies)?',
    options: [
      'Fazer o trabalho dos outros',
      'Ajudar stream-aligned teams a adquirir capability (ex.: observability, perf, segurança) via coaching time-boxed — 6-12 semanas. Não é permanent help desk; sai quando o time está autônomo. Distinto de platform team (que entrega produto) e complicated-subsystem team (que owna complexidade especializada)',
      'Fazer review',
      'Documentar',
    ],
    correct: 1,
    explanation: 'Team Topologies define 4 tipos: stream-aligned (produto), platform, enabling, complicated-subsystem. Enabling team tem missão de curta duração: empoderar outros times. Se vira permanente, virou platform ou consultoria interna — reclassifique.',
  },
  {
    question: 'Quais KPIs fazem sentido para um platform team?',
    options: [
      'Número de commits',
      'Adoção (% times usando paved road), NPS/satisfação, tempo médio para first deploy (onboarding), toil hours saved, incidentes caused by platform. Anti-KPI: LOC, tickets fechados, projetos entregues — puxa para output, não outcome',
      'Issues criados',
      'Ninguém mede',
    ],
    correct: 1,
    explanation: 'Platform team medido por output vira feature factory desconectada do usuário. Medido por outcome (adoção real, satisfação, toil reduzido) se auto-corrige: se ninguém usa, volta para entrevistas e prioriza o que dói.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="platform-as-product"
      title="Platform as product: user research + roadmap"
      icon="📦"
      xp={50}
      readTime={12}
      trailName="Platform Engineering & IDPs"
      trailColor={accent}
      nextSlug="dora-space-metricas"
      nextTitle="Métricas: DORA + SPACE"
      quiz={quiz}
    >
      <Section title="O mindset" accent={accent}>
        <p>
          Plataforma interna sem mindset de produto vira obra eterna sem clientes. Platform-as-product aplica
          disciplina de product management ao trabalho de plataforma: user research, roadmap priorizado,
          métricas de adoção, SLAs declarados, comunicação consistente. Dev interno é usuário, não petitioner.
        </p>
      </Section>

      <Section title="User research contínuo" accent={accent}>
        <CodeBlock lang="yaml">{`# Ritual trimestral do platform team
user_research:
  entrevistas:
    - 6 devs de streams diferentes (tier 1 a 3)
    - 1 hora, roteiro aberto
    - perguntas: "o que mais te atrasou esse quarter?", "onde teve que sair do paved road?", "que ticket voce evitou abrir porque sabia que demora?"
  shadowing:
    - 2 devs por sprint, observar 1 dia de trabalho
    - foco em friction points
  metrics_review:
    - adoption % por golden path
    - time to first deploy
    - toil tickets abertos contra platform
    - incidentes onde root cause foi platform`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Regra prática: platform PM gasta 30% do tempo falando com devs de fora do time. Sem isso, roadmap
          vira projeção da equipe técnica, não do usuário.
        </Callout>
      </Section>

      <Section title="Roadmap público" accent={accent}>
        <p>
          Documento vivo (Notion, Backstage page, GitHub Project) com problemas priorizados, não soluções.
          "Reduzir tempo de onboarding de 2 semanas para 3 dias" é problema; "implementar Backstage" é solução.
          Times de produto veem o que está vindo, opinam, alinham dependências.
        </p>
      </Section>

      <Section title="Team Topologies" accent={accent}>
        <p>
          Stream-aligned: time de produto owning serviço end-to-end. Platform: entrega X-as-a-Service para
          stream-aligned. Enabling: time de curta duração que ajuda capability new. Complicated-subsystem:
          time especialista owning área de alta complexidade (ML infra, crypto). Platform engineering fica no
          segundo — serve os primeiros.
        </p>
        <Callout tone="warn" icon="⚠️">
          Platform team que vira ticket queue perdeu a batalha. Sinal de alerta: mais tempo respondendo
          pedidos que construindo paved road. Saída: institua SLA de X-as-a-Service, recuse off-scope, direcione
          para self-service.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
