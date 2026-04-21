import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('self-service-infra');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que Crossplane entrega que Terraform sozinho não entrega?',
    options: [
      'Nada',
      'Crossplane expõe recursos de cloud como CRDs nativas do Kubernetes, permitindo que devs criem infra via kubectl apply com Claim. Reconciliação contínua (controller), RBAC do K8s, compositions que abstraem defaults opinionados. Terraform é imperativo por run; Crossplane é declarativo contínuo',
      'Só roda em AWS',
      'Substitui K8s',
    ],
    correct: 1,
    explanation: 'Terraform aplica state a cada plan/apply. Crossplane reconcilia continuamente — drift é corrigido sem humano. Compositions encapsulam boas práticas (RDS com encryption, backup, monitoring default). Platform team cria XRDs (Composite Resource Definitions) e devs consomem Claims simples.',
  },
  {
    question: 'Quando GitOps (ArgoCD) bate API imperativa para self-service?',
    options: [
      'Sempre pior',
      'GitOps vence quando: auditoria é requisito (git log é auditoria), rollback precisa ser trivial (git revert), múltiplos approvers (PR review), drift detection é crítico. API imperativa vence em: criação one-off, workflows humanos (Backstage scaffolder) que envolvem branching rápido',
      'API é sempre melhor',
      'Nao importa',
    ],
    correct: 1,
    explanation: 'GitOps e API convivem. Scaffolder do Backstage abre PR no repo de infra (Flux/ArgoCD reconcilia). Outras vezes, infra efêmera (preview env por PR) via API direta faz mais sentido. Decisão por caso de uso, não por dogma.',
  },
  {
    question: 'O papel de OPA/Gatekeeper no self-service',
    options: [
      'Autenticação',
      'Policy as code: valida recursos Kubernetes contra regras (labels obrigatórias, imagens de registry aprovado, resource limits, tier de storage por namespace). Platform team escreve rego policies, tudo que não passa é rejeitado no admission controller, sem humano gate',
      'Roteamento',
      'Log',
    ],
    correct: 1,
    explanation: 'Sem policy as code, self-service vira wild west. OPA roda em admission controller do K8s: deployment sem resource limits é rejeitado, Crossplane claim pedindo instância absurda é barrado. Policies versionadas em git, testadas com conftest, aplicadas uniformemente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="self-service-infra"
      title="Self-service infra via UI/API"
      icon="🛠️"
      xp={55}
      readTime={13}
      trailName="Platform Engineering & IDPs"
      trailColor={accent}
      nextSlug="platform-as-product"
      nextTitle="Platform as product"
      quiz={quiz}
    >
      <Section title="O objetivo" accent={accent}>
        <p>
          Dev precisa de um Postgres, um bucket, uma fila. Sem self-service: ticket, espera dias, ops provisiona
          manual, drift aparece em 3 meses. Com self-service: dev abre PR com Claim, GitOps reconcilia em minutos,
          policy valida, catalog registra. Platform fornece a abstração; compliance vem grátis.
        </p>
      </Section>

      <Section title="Crossplane: K8s como plano de controle de cloud" accent={accent}>
        <CodeBlock lang="yaml">{`# XRD: platform team define a abstracao
apiVersion: apiextensions.crossplane.io/v1
kind: CompositeResourceDefinition
metadata:
  name: xpostgresinstances.acme.io
spec:
  group: acme.io
  names: { kind: XPostgresInstance, plural: xpostgresinstances }
  claimNames: { kind: PostgresInstance, plural: postgresinstances }
  versions:
    - name: v1
      served: true
      referenceable: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              properties:
                size: { type: string, enum: [small, medium, large] }
                storageGb: { type: integer, minimum: 20, maximum: 2000 }

---
# Dev consome com Claim simples
apiVersion: acme.io/v1
kind: PostgresInstance
metadata:
  name: checkout-db
  namespace: payments
spec:
  size: small
  storageGb: 50`}</CodeBlock>
        <p>
          Composition (não mostrada aqui) materializa a Claim em RDS real com encryption, backup, monitoring,
          secret no Vault, tudo default. Dev pede "small" — platform define o que small significa.
        </p>
      </Section>

      <Section title="ArgoCD ApplicationSet" accent={accent}>
        <CodeBlock lang="yaml">{`apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: checkout-envs
spec:
  generators:
    - list:
        elements:
          - env: dev
          - env: stg
          - env: prd
  template:
    metadata:
      name: checkout-{{env}}
    spec:
      project: payments
      source:
        repoURL: https://github.com/acme/checkout
        targetRevision: HEAD
        path: deploy/overlays/{{env}}
      destination:
        server: https://kubernetes.default.svc
        namespace: checkout-{{env}}
      syncPolicy:
        automated: { prune: true, selfHeal: true }`}</CodeBlock>
      </Section>

      <Section title="Policy as code com OPA" accent={accent}>
        <CodeBlock lang="yaml">{`apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: must-have-owner
spec:
  match:
    kinds: [{ apiGroups: [""], kinds: ["Namespace"] }]
  parameters:
    labels:
      - key: owner
      - key: tier
      - key: cost-center`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Policies viajam no pipeline: conftest no PR roda as mesmas rego policies antes do apply. Dev percebe
          violação em segundos, não depois do deploy falhar.
        </Callout>
      </Section>

      <Section title="Quando cada um" accent={accent}>
        <p>
          Crossplane + ArgoCD: infra declarativa contínua, time-to-live longo (bancos, clusters). Terraform +
          Atlantis: quando time tem expertise profunda e não quer adotar K8s como plano de controle. Pulumi:
          TypeScript/Python nativo, bom para time de dev quer expressividade. Combina, não substitui.
        </p>
      </Section>
    </ModuleLayout>
  );
}
