import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-devops-plataforma-completa');
const accent = '#e3b341';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que ArgoCD (GitOps) > manual kubectl em produção?',
    options: [
      'Mesma coisa',
      'ArgoCD reconcilia estado: git commit → auto apply; diff detection; rollback por git revert; audit via git history. Manual kubectl = drift, sem audit, sem revert',
      'kubectl é deprecated',
      'ArgoCD só pra GCP',
    ],
    correct: 1,
    explanation: 'GitOps = git é source of truth. ArgoCD (ou Flux) puxa manifests, aplica, monitora drift. Rollback = git revert. Audit = git blame. PR review = security review. Times sérios usam isso desde 2020+.',
  },
  {
    question: 'Por que External Secrets Operator em vez de K8s Secret direto?',
    options: [
      'Mesmo',
      'K8s Secret é base64 plaintext em etcd. ESO lê secret de Vault/AWS SM e sincroniza como K8s Secret — centralização, rotation, audit no cofre. Nunca commita secret em git (GitOps-safe)',
      'ESO é legacy',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'ESO resolve "GitOps + secrets" — você referencia secret por name, ESO puxa do Vault/AWS SM. K8s Secret stored em etcd encrypted-at-rest (se configurado). Zero secret em git. Rotation no Vault → pod re-picks.',
  },
  {
    question: 'Qual métrica base pra health check de pod em ALB?',
    options: [
      'CPU só',
      'Readiness probe (pronto pra receber tráfego) + Liveness probe (ainda vivo, senão restart). Readiness controla se ALB manda requests; Liveness controla restart',
      'Memory',
      'Network',
    ],
    correct: 1,
    explanation: 'K8s separa: readiness (accept traffic?) e liveness (alive?). Durante startup: readiness false até migrations rodarem. Em stuck: liveness false → restart. Probes em HTTP endpoint (/healthz) com timeout/threshold. Crítico pra zero-downtime deploys.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-devops-plataforma-completa"
      title="Capstone: plataforma DevOps end-to-end"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="DevOps & Containers"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Arquitetura" accent={accent}>
        <CodeBlock lang="text">{`GitHub repo (código + k8s manifests)
      ↓ push
GitHub Actions: build, test, scan (trivy), push image pra ECR
      ↓ webhook
ArgoCD: detecta novo manifest → apply em EKS
      ↓
EKS cluster:
  - App pods (com External Secrets puxando de Vault)
  - Ingress (ALB) com cert-manager (Let's Encrypt)
  - Prometheus + Grafana stack
  - Loki pra logs
      ↓
Usuários acessam via HTTPS com SLO tracked`}</CodeBlock>
      </Section>

      <Section title="Stack" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>EKS + managed node group (ou Fargate)</li>
          <li>ArgoCD pra GitOps (um ApplicationSet por env)</li>
          <li>cert-manager + Let&apos;s Encrypt</li>
          <li>External Secrets Operator + AWS Secrets Manager</li>
          <li>Prometheus + Grafana + Loki + Tempo (LGTM stack)</li>
          <li>Actions: build, Trivy scan, cosign sign, push ECR</li>
        </ul>
        <Callout tone="success" icon="🎓">
          Entregável: repositório com manifests funcionando, um app rodando, dashboard Grafana com SLO, relatório de security scan. Pronto pra discussão em entrevista sênior.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
