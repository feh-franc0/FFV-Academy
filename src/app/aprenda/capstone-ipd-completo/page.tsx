import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-ipd-completo');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia um IDP portfolio-grade de um MVP hobby?',
    options: [
      'Ter Backstage rodando',
      'Backstage com catalog populado por providers automáticos, scaffolder que cria serviço + infra + CI + monitoring em 1 comando, TechDocs obrigatório, métricas DORA instrumentadas, user research documentado, pelo menos 1 time de produto já migrado e usando voluntariamente',
      'Logo bonito',
      'Muitos plugins',
    ],
    correct: 1,
    explanation: 'Hobby: Backstage instalado com poucas entities manuais, scaffolder "hello world". Portfolio-grade: catalog vivo discovered de GitHub, template real que cria microsserviço end-to-end, observability default, métricas DORA no dashboard do Backstage, writeup explicando decisões. Mostra raciocínio de platform PM + engineering.',
  },
  {
    question: 'Qual é a prova real de que a plataforma funciona?',
    options: [
      'Muitos tickets',
      'Um time externo criou um serviço novo usando o paved road e chegou em produção sem pedir ajuda. Métricas: time-to-first-deploy abaixo do baseline, zero tickets de suporte para esse serviço, adoção voluntária crescendo',
      'Reunião semanal',
      'Slides aprovados',
    ],
    correct: 1,
    explanation: 'Platform se valida em outcome: dev autônomo, sem help desk. Se o capstone inclui 1 time usando de verdade e métricas antes/depois, recruiter/hiring manager entende que você pensa como platform PM, não só como infra engineer.',
  },
  {
    question: 'Que tipo de writeup impressiona no capstone?',
    options: [
      'Só código',
      'README estruturado: problema + user research (quem entrevistou, o que descobriu), arquitetura (Backstage + Crossplane + ArgoCD + OPA), decisões com trade-offs explícitos (por que não Port, por que Crossplane vs Terraform), métricas before/after, limites conhecidos, next steps. Link para demo deployed',
      'PDF corporativo',
      'Video só',
    ],
    correct: 1,
    explanation: 'Engineer sênior demonstra pensamento. O writeup reflete rigor: problema bem definido, research real, decisões justificadas com dado, humildade nos limites. Link para repo + demo live + dashboard de métricas DORA fecha a prova.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-ipd-completo"
      title="Capstone: IDP end-to-end"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="Platform Engineering & IDPs"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Construa um Internal Developer Platform mínimo porém real. Objetivo: um dev de produto cria um serviço
          novo via portal, vai para produção em menos de 30 minutos, sem abrir ticket. Escopo enxuto é melhor
          que escopo inflado: prova o loop end-to-end.
        </p>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="yaml">{`# 1. Backstage instance
- Deploy em Kubernetes (kind local ou cluster gerenciado)
- Auth OIDC (GitHub login basta)
- Postgres managed
- Catalog provider varrendo org GitHub (descobre catalog-info.yaml)

# 2. Software Catalog populado
- Minimo 3 Components, 2 APIs, 1 Resource, 1 System
- Ownership real via Group entities
- Relacionamentos (dependsOn, providesApis)

# 3. TechDocs
- Pelo menos 1 componente com docs completos
- ADR de pelo menos 1 decisao de plataforma
- Runbook template referenciado

# 4. Paved Road template (Scaffolder)
- Stack: Node + Fastify + Postgres
- Gera: repo GitHub, CI (GitHub Actions reusable), catalog-info.yaml, Dockerfile, health endpoint
- Provisiona infra via Crossplane Claim (Postgres small)
- Registra ArgoCD Application apontando para o repo
- Deploy automatico em dev env

# 5. Self-service infra
- Crossplane instalado
- Pelo menos 1 XRD + Composition (PostgresInstance)
- OPA Gatekeeper com policies (required labels, resource limits)

# 6. Observability default
- OpenTelemetry collector
- Grafana dashboard auto-provisioned por service label
- Logs estruturados para Loki

# 7. Metricas DORA instrumentadas
- Deployment Frequency: webhook ArgoCD para Postgres
- Lead Time: GitHub API vs commit timestamps vs deploy
- CFR: incidents marcados (rollbacks, reverted PRs)
- TTR: incidents opened/resolved timestamps
- Dashboard Grafana publicado

# 8. User research documentado
- 3 entrevistas com devs (reais ou simuladas)
- Insight para roadmap item traceability
- Adoption plan para primeiro time piloto

# 9. Writeup
- README estruturado (problema, arquitetura, decisoes, trade-offs)
- Arquivo /docs/adr/ com ADRs numerados
- Demo video 3 minutos: zero ao deploy
- Link repo + demo live + Grafana DORA`}</CodeBlock>
      </Section>

      <Section title="Critérios de aceitação" accent={accent}>
        <p>
          Um dev externo ao projeto (colega, amigo) consegue criar um serviço novo usando o scaffolder sem
          ajuda. Serviço vai a deploy em menos de 30 minutos. Métricas DORA aparecem no dashboard. Writeup
          explica por que cada escolha foi feita e cita alternativas consideradas.
        </p>
        <Callout tone="success" icon="🎓">
          Capstone que comprova maturidade de platform engineering. Recruiter/hiring manager sênior lê writeup,
          vê user research + paved road funcional + métricas + decisões justificadas, e reconhece engineer que
          pensa plataforma como produto. Nível sênior/staff em 2026.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
