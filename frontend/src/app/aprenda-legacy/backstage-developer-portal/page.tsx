import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('backstage-developer-portal');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Quais são os três pilares centrais do Backstage?',
    options: [
      'Só catalog',
      'Software Catalog (entities e relações), TechDocs (docs-as-code renderizadas do repo) e Scaffolder (templates que geram repos, CI, infra). Tudo plugável — o ecosystem real do valor é o plugin system',
      'Kubernetes, Docker, Git',
      'Logs, metrics, traces',
    ],
    correct: 1,
    explanation: 'Criado pela Spotify em 2016, open-sourceado em 2020, CNCF incubating. Catalog define entities (Component, API, Resource, System, Domain, User, Group) via YAML no repo. TechDocs usa MkDocs + plugin. Scaffolder executa actions (fetch template, publish repo, apply infra) em sequência.',
  },
  {
    question: 'Por que o catalog do Backstage usa YAML dentro de cada repo em vez de UI central?',
    options: [
      'YAML é bonito',
      'Manifestos no repo (catalog-info.yaml) seguem a source of truth do código. PR que muda ownership entra no git review. Catalog é discovered por providers (GitHub, GitLab) — elimina drift entre catalog e realidade',
      'Não tem UI',
      'Performance',
    ],
    correct: 1,
    explanation: 'UI central vira stale: ninguém atualiza. YAML no repo obriga que mudança de owner/tier/sistema passe em review com o código. Providers varrem a org periodicamente e carregam no catalog. Modelo GitOps aplicado a metadados de serviço.',
  },
  {
    question: 'Quando escolher Backstage vs Port/Cortex?',
    options: [
      'Sempre Backstage',
      'Backstage: controle total, time capaz de operar Node/React, plugins customizados. Port/Cortex: SaaS, setup rápido, menos customização. Regra: se o IDP é diferencial ou integra sistemas legados proprietários, Backstage compensa; caso contrário SaaS tira fricção',
      'Sempre SaaS',
      'Não há diferença',
    ],
    correct: 1,
    explanation: 'Backstage exige time dedicado — Spotify, Netflix e Shopify operam o deles com squads. Port e Cortex fazem o hosted e entregam value em semanas, mas extensão profunda é mais limitada. Decisão técnica baseada em capacidade do time e profundidade de integração necessária.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="backstage-developer-portal"
      title="Backstage: developer portal da Spotify"
      icon="🎭"
      xp={55}
      readTime={13}
      trailName="Platform Engineering & IDPs"
      trailColor={accent}
      nextSlug="golden-paths-paved-road"
      nextTitle="Golden paths / paved road"
      quiz={quiz}
    >
      <Section title="O que Backstage é" accent={accent}>
        <p>
          Framework open-source em Node + React para construir developer portals. CNCF incubating. Três pilares:
          Software Catalog, TechDocs, Scaffolder. Plugin system é o valor real — Kubernetes, ArgoCD, Grafana,
          PagerDuty, Jira e centenas de outros integram via plugin oficial ou comunidade.
        </p>
      </Section>

      <Section title="catalog-info.yaml por repo" accent={accent}>
        <CodeBlock lang="yaml">{`apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: checkout-api
  description: Servico de checkout (Node + Postgres)
  annotations:
    github.com/project-slug: acme/checkout-api
    backstage.io/techdocs-ref: dir:.
    grafana/dashboard-selector: "namespace=checkout"
    pagerduty.com/service-id: PXXXXXX
  tags: [nodejs, postgres, tier-1]
spec:
  type: service
  lifecycle: production
  owner: team-payments
  system: checkout
  providesApis: [checkout-api-rest]
  dependsOn: [resource:checkout-db, component:fraud-scorer]`}</CodeBlock>
        <p>
          Tipos: Component (código executável), API (contrato), Resource (banco, fila), System (agrupamento),
          Domain (área de negócio), User/Group (ownership). Relações (providesApis, dependsOn) montam o grafo
          navegável.
        </p>
      </Section>

      <Section title="TechDocs: docs-as-code" accent={accent}>
        <p>
          Markdown em /docs dentro do repo. MkDocs com mkdocs.yml. Pipeline do Backstage gera HTML e serve no
          portal. Quem edita doc é quem edita código — docs param de envelhecer porque PR de feature obriga
          atualização.
        </p>
        <Callout tone="info" icon="💡">
          Combine com ADRs (Architecture Decision Records) em /docs/adr/. Portal vira memória organizacional
          de por que decisões foram tomadas. Pesquisa no Backstage encontra ADR de 3 anos atrás.
        </Callout>
      </Section>

      <Section title="Scaffolder: templates que constroem" accent={accent}>
        <CodeBlock lang="yaml">{`apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: nodejs-service-paved-road
spec:
  owner: team-platform
  type: service
  parameters:
    - title: Identidade
      properties:
        name: { type: string, pattern: "^[a-z][a-z0-9-]+$" }
        owner: { type: string, ui:field: OwnerPicker }
  steps:
    - id: fetch
      action: fetch:template
      input:
        url: ./skeleton
        values: { text: NAME, owner: OWNER }
    - id: publish
      action: publish:github
      input:
        repoUrl: github.com?owner=acme&repo=NAME
    - id: register
      action: catalog:register
      input:
        repoContentsUrl: PUBLISHED_URL
        catalogInfoPath: /catalog-info.yaml`}</CodeBlock>
        <p>
          Actions são plugáveis. Templates oficiais cobrem GitHub, GitLab, Azure DevOps, Jenkins, ArgoCD,
          Crossplane. Output do template pode disparar pipeline de infra que cria namespace Kubernetes, DB, DNS.
        </p>
      </Section>

      <Section title="Operando Backstage" accent={accent}>
        <p>
          Backstage é Node app deploy em Kubernetes. Postgres para state. Auth via OIDC (Okta, Google, GitHub).
          Expect um engenheiro full-time para manter após semana 2. Alternativas hosted: Roadie, Spotify Portal,
          Port, Cortex. SaaS entrega valor em dias; self-hosted escala e customiza.
        </p>
      </Section>
    </ModuleLayout>
  );
}
