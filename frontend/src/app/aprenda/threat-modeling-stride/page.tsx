import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('threat-modeling-stride');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'O que cada letra do STRIDE representa?',
    options: [
      'Sync, Test, Replicate, Index, Deploy, Evaluate',
      'Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege',
      'SSL, TLS, REST, IPsec, DNS, Encryption',
      'Start, Track, Review, Ingest, Deploy, Encrypt',
    ],
    correct: 1,
    explanation: 'STRIDE (Microsoft, 1999) é o checklist mais usado: Spoofing (forjar identidade), Tampering (modificar dados), Repudiation (negar ação), Info disclosure (vazar dado), DoS, Elevation of privilege. Cada ameaça mapeia pra uma propriedade CIA+ quebrada.',
  },
  {
    question: 'Qual é a diferença entre STRIDE e DREAD?',
    options: [
      'São o mesmo framework',
      'STRIDE classifica o TIPO de ameaça; DREAD estima o RISCO (Damage, Reproducibility, Exploitability, Affected users, Discoverability) pra priorizar fix',
      'DREAD é só pra hardware',
      'STRIDE é para CSP, DREAD para app',
    ],
    correct: 1,
    explanation: 'STRIDE responde "que tipo de ameaça é?". DREAD responde "quão grave é?". Na prática moderna, DREAD foi substituído por CVSS (mais objetivo). STRIDE + CVSS é combinação padrão em 2026.',
  },
  {
    question: 'Quando threat modeling deve ser feito?',
    options: [
      'Só depois do primeiro incident',
      'Durante o design — idealmente ao desenhar DFD (Data Flow Diagram) dos componentes; revisar a cada mudança arquitetural significativa',
      'Apenas antes do launch',
      'Anualmente para compliance',
    ],
    correct: 1,
    explanation: 'Threat modeling mais caro é o que se faz DEPOIS. Integrar no design review (com DFD e identificação de trust boundaries) custa 1h; encontrar a vuln em produção custa semanas. Faça pequeno e frequente, não grande e anual.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="threat-modeling-stride"
      title="Threat modeling com STRIDE: de onde vêm os ataques"
      icon="🎯"
      xp={55}
      readTime={13}
      trailName="Security Engineering"
      trailColor={accent}
      nextSlug="authn-vs-authz"
      nextTitle="Authn vs Authz: a diferença e as armadilhas"
      quiz={quiz}
    >
      <Section title="STRIDE em uma tabela" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Letra', 'Ameaça', 'Propriedade quebrada', 'Defesa típica']}
          rows={[
            ['S', 'Spoofing — forjar identidade', 'Authentication', 'MFA, certificados, signed tokens'],
            ['T', 'Tampering — modificar dado', 'Integrity', 'HMAC, checksums, signatures, WORM'],
            ['R', 'Repudiation — negar ação', 'Non-repudiation', 'Logs imutáveis, audit trail, signatures'],
            ['I', 'Information disclosure', 'Confidentiality', 'Encryption at rest + in transit, least privilege'],
            ['D', 'Denial of service', 'Availability', 'Rate limiting, autoscaling, circuit breakers'],
            ['E', 'Elevation of privilege', 'Authorization', 'RBAC, input validation, no shared state'],
          ]}
        />
      </Section>

      <Section title="DFD — o mapa pra pensar ameaças" accent={accent}>
        <p>
          Data Flow Diagram é o template pra aplicar STRIDE. Desenhe <strong>entidades</strong> (user, DB, serviço externo), <strong>processos</strong>, <strong>data stores</strong> e <strong>trust boundaries</strong> (onde nível de confiança muda).
        </p>
        <CodeBlock lang="text">{`[Browser]  ─HTTPS─▶  [API]  ─TLS─▶  [DB]
           ▲                │
           │                └─HMAC──▶ [Webhook Target]
        trust boundary:
        - User → API: spoofing (auth fraca?), tampering (TLS cert errado?)
        - API → DB: info disclosure (cred hardcoded?), elevation (SQLi?)
        - API → Webhook: tampering (replay sem HMAC?), repudiation (sem log?)`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Cada seta que cruza trust boundary é candidato a ameaça. Sente com o STRIDE ao lado e pergunte pra cada seta: que S/T/R/I/D/E pode acontecer aqui?
        </Callout>
      </Section>

      <Section title="DREAD → CVSS: priorizando" accent={accent}>
        <p>
          DREAD soma pontos em Damage/Reproducibility/Exploitability/Affected/Discoverability. Foi criticado por ser subjetivo. <strong>CVSS 4.0</strong> (Common Vulnerability Scoring System) substituiu em 2026 pra priorização objetiva — vetor com attack surface, complexity, privileges required, user interaction, scope, CIA impact.
        </p>
        <CodeBlock lang="text">{`CVSS 4.0 Base Score exemplo:
AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H
= 10.0 (Critical) — atacante via rede, sem auth, impacto total`}</CodeBlock>
      </Section>

      <Section title="Operacionalizando: Threat Dragon ou markdown" accent={accent}>
        <p>
          Ferramentas: <strong>OWASP Threat Dragon</strong> (open source, desenha DFD), <strong>Microsoft Threat Modeling Tool</strong> (free, Windows), <strong>PyTM</strong> (code-first em Python). Alternativa pragmática: markdown template no repo com DFD em mermaid + tabela STRIDE. Versiona junto com o código.
        </p>
        <Callout tone="success" icon="✅">
          Integre no PR template: "Qual trust boundary este PR toca? Que STRIDE aplicamos?". Faz threat modeling virar hábito, não evento.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
