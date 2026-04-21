import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('seguranca-sap-avancada');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'GuardDuty, Detective e Security Hub: quem faz o quê?',
    options: [
      'Todos iguais',
      'GuardDuty detecta (threat intel ML sobre VPC flow + DNS + CloudTrail). Detective investiga (constrói gráfico de relacionamentos pra root cause). Security Hub agrega findings cross-service em dashboard unificado com standards (CIS, PCI, Foundational)',
      'Só GuardDuty basta',
      'Só Security Hub',
    ],
    correct: 1,
    explanation: 'Cadeia natural: GuardDuty emite finding "instância comprometida minerando crypto" → Security Hub centraliza no painel com severity e standards → Detective abre o grafo da instância (quem criou, quais IAM roles assumiu, com quais IPs conversou, origem do comando). Cada um cobre uma camada — não são concorrentes.',
  },
  {
    question: 'Quando Macie agrega valor?',
    options: [
      'Sempre desnecessário',
      'Descoberta automática de PII/PHI em S3: scan de buckets com ML detecta CPF, cartão, senhas, secrets. Crítico em ambiente com dezenas/centenas de buckets onde classificação manual não escala. Gera findings acionáveis: quais buckets expõem PII sem criptografia ou sem BucketPolicy restritiva',
      'Só US',
      'Rival do GuardDuty',
    ],
    correct: 1,
    explanation: 'Macie responde "onde estão meus dados sensíveis em S3?". Com volume grande de buckets, descoberta manual é impossível. Macie identifica PII, gera relatório priorizado, integra com Security Hub. Custo proporcional ao volume escaneado — use sampling + prioritize buckets não-classificados.',
  },
  {
    question: 'Network Firewall vs WAF vs Security Group: camadas?',
    options: [
      'Redundantes',
      'Security Group = L4/L3 na NIC. NACL = L3 na subnet stateless. Network Firewall = L3-L7 stateful gerenciado na VPC (deep packet inspection, IPS, domain filtering). WAF = L7 HTTP/HTTPS em ALB/CloudFront/API Gateway (OWASP, rate limiting, bot protection). Defense in depth: usa todos',
      'Só SG basta',
      'Só WAF',
    ],
    correct: 1,
    explanation: 'Cada camada cobre classes distintas de ataque. SG protege egress/ingress no recurso. NACL dá blacklist básica na subnet. Network Firewall é Palo Alto/Suricata gerenciado, com regras L7 (bloquear conexão com domínio malicioso via SNI/TLS SNI). WAF é puramente HTTP/S. Em SAP, cenários de compliance cobram essa separação clara.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="seguranca-sap-avancada"
      title="Segurança enterprise: GuardDuty, Detective, Security Hub"
      icon="🛡️"
      xp={60}
      readTime={14}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="ml-ia-arquiteto-sap"
      nextTitle="ML/IA sob ótica de arquiteto: Bedrock, SageMaker, Comprehend"
      quiz={quiz}
    >
      <Section title="Pilha de segurança em Organization" accent={accent}>
        <CodeBlock lang="yaml">{`Management/Log Archive account:
  CloudTrail organization trail     — eventos API todos-accounts
  Config aggregator                 — configuration compliance
  S3 bucket WORM (Object Lock)      — logs imutáveis

Audit/Security account:
  Security Hub                      — painel unificado
  GuardDuty master                  — agrega detectors filhos
  Detective master                  — grafo cross-account
  Macie admin                       — descoberta PII S3
  Inspector                         — CVE scan EC2/Lambda/containers
  Access Analyzer                   — findings IAM + S3

Cada member account:
  GuardDuty detector (member)
  Config recorder
  Inspector enabled
  Config rules conforme SCP padrão`}</CodeBlock>
      </Section>

      <Section title="Automated response" accent={accent}>
        <p>
          Findings de alto risk viram automação via EventBridge. Exemplo: GuardDuty detecta "IAMUser/AnomalousBehavior:NetworkPortProbeUnprotectedPort" → regra EventBridge captura → Lambda executa SSM Automation: isola instância em SG quarentena + cria snapshot forense + abre ticket em ITSM + notifica SecOps no Slack. Response em &lt;60s vs 2h manual.
        </p>
        <CodeBlock lang="yaml">{`# EventBridge rule pra finding GuardDuty HIGH
Rule:
  EventPattern:
    source: ["aws.guardduty"]
    detail-type: ["GuardDuty Finding"]
    detail:
      severity: [7.0, 8.0, 9.0]  # HIGH/CRITICAL
  Targets:
    - arn: arn:aws:lambda::...:function/isolate-instance
    - arn: arn:aws:sns::...:topic/secops-critical`}</CodeBlock>
      </Section>

      <Section title="Compliance packaging" accent={accent}>
        <p>
          Security Hub acelera compliance com standards prontos (CIS AWS Foundations 1.4/2.0, PCI DSS 3.2.1, NIST 800-53). Ativar marca todos os controles, gera dashboard com compliance score, roda continuamente. Audit Manager empacota evidence coletada automatica em relatórios pra auditor (SOC 2, HIPAA). Reduz trabalho manual de audit de semanas pra dias.
        </p>
        <Callout tone="success" icon="✅">
          Stack defensiva enterprise AWS 2026: Organization Trail + Config + GuardDuty + Security Hub + Inspector + Macie + Detective + Access Analyzer, tudo com delegated admin em conta Audit. Automation EventBridge+Lambda+SSM pra response. Audit Manager empacota evidence. Custa 1-3% do gasto AWS — barato comparado a breach.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
