/**
 * cert-prep.ts — Certification definitions and gap analysis for the
 * Cert Prep feature. Closes the loop between simulado errors → module
 * gaps → SRS review.
 */

export interface CertDomain {
  name: string;
  weight: number; // % of exam
  moduleSlugs: string[]; // FFV modules that cover this domain
}

export interface Certification {
  id: string;
  name: string;
  code: string; // e.g. "SAA-C03"
  icon: string;
  color: string;
  provider: string; // "AWS", "CNCF", etc.
  examCost: string; // "$150 USD"
  passingScore: number; // 0-100
  simuladoId?: string; // link to simulado if exists
  domains: CertDomain[];
}

export interface CertReadiness {
  cert: Certification;
  overallPct: number; // 0-100 weighted readiness
  domainScores: Array<{
    domain: CertDomain;
    coverage: number; // % of domain modules completed
    avgQuizScore: number; // 0-100, 0 if no quiz taken
  }>;
  weakDomains: CertDomain[];
  strongDomains: CertDomain[];
  estimatedWeeksToReady: number;
  recommendedModules: string[]; // slugs ordered by priority
}

// ─────────────────────────────────────────────────────────────
// Certification definitions
// ─────────────────────────────────────────────────────────────

export const CERTIFICATIONS: Certification[] = [
  {
    id: 'clf-c02',
    name: 'AWS Cloud Practitioner',
    code: 'CLF-C02',
    icon: '☁️',
    color: '#ff9900',
    provider: 'AWS',
    examCost: '$100 USD',
    passingScore: 70,
    simuladoId: 'simulado-aws-practitioner',
    domains: [
      {
        name: 'Cloud Concepts',
        weight: 26,
        moduleSlugs: [
          'o-que-e-cloud',
          'aws-global-infra',
          'cloud-adoption-framework',
          'well-architected-framework',
        ],
      },
      {
        name: 'Security & Compliance',
        weight: 25,
        moduleSlugs: [
          'modelo-responsabilidade-compartilhada',
          'iam-fundamentos',
          'seguranca-aws-servicos',
        ],
      },
      {
        name: 'Cloud Technology & Services',
        weight: 33,
        moduleSlugs: [
          'compute-ec2-lambda',
          'storage-s3-ebs-efs',
          'databases-aws-basico',
          'networking-vpc-route53',
          'monitoramento-cloudwatch',
          'migracao-aws-servicos',
          'ai-ml-aws-servicos',
          'developer-tools-aws',
        ],
      },
      {
        name: 'Billing, Pricing & Support',
        weight: 16,
        moduleSlugs: [
          'precificacao-suporte',
          'simulado-practitioner',
        ],
      },
    ],
  },
  {
    id: 'saa-c03',
    name: 'AWS Solutions Architect Associate',
    code: 'SAA-C03',
    icon: '🏛️',
    color: '#146eb4',
    provider: 'AWS',
    examCost: '$150 USD',
    passingScore: 72,
    simuladoId: 'simulado-aws-saa',
    domains: [
      {
        name: 'Design Resilient Architectures',
        weight: 30,
        moduleSlugs: [
          'ec2-autoscaling-elb',
          'rds-aurora-dynamodb',
          'disaster-recovery',
          'messaging-eventos',
          'containers-ecs-eks',
          'serverless-lambda-avancado',
        ],
      },
      {
        name: 'Design High-Performing Architectures',
        weight: 28,
        moduleSlugs: [
          'caching-performance',
          'dns-cdn-edge',
          'analytics-bigdata',
          's3-avancado',
          'block-file-storage',
        ],
      },
      {
        name: 'Design Secure Applications',
        weight: 24,
        moduleSlugs: [
          'iam-avancado-organizations',
          'seguranca-avancada',
          'vpc-avancado',
          'rede-hibrida-saa',
        ],
      },
      {
        name: 'Design Cost-Optimized Architectures',
        weight: 18,
        moduleSlugs: [
          'cost-optimization-saa',
          'migracao-transferencia-saa',
          'ml-ia-arquiteto-saa',
          'simulado-saa-c03',
        ],
      },
    ],
  },
  {
    id: 'dva-c02',
    name: 'AWS Developer Associate',
    code: 'DVA-C02',
    icon: '🏗️',
    color: '#e88029',
    provider: 'AWS',
    examCost: '$150 USD',
    passingScore: 72,
    simuladoId: 'simulado-aws-developer',
    domains: [
      {
        name: 'Development with AWS Services',
        weight: 32,
        moduleSlugs: [
          'lambda-profundo',
          'api-gateway-rest-http-ws',
          'dynamodb-para-dev',
          's3-dev-features',
          'step-functions-workflows',
          'eventbridge-sqs-sns-para-dev',
        ],
      },
      {
        name: 'Security',
        weight: 26,
        moduleSlugs: [
          'cognito-fluxos',
          'kms-encryption-dev',
          'secrets-parameter-store',
        ],
      },
      {
        name: 'Deployment',
        weight: 24,
        moduleSlugs: [
          'cicd-aws-nativo',
          'ecs-fargate-para-dev',
          'cloudformation-sam-cdk',
        ],
      },
      {
        name: 'Troubleshooting & Optimization',
        weight: 18,
        moduleSlugs: [
          'x-ray-observability',
          'simulado-dva-c02',
          'dva-c02-intro',
        ],
      },
    ],
  },
  {
    id: 'cka',
    name: 'Certified Kubernetes Administrator',
    code: 'CKA',
    icon: '☸️',
    color: '#326ce5',
    provider: 'CNCF',
    examCost: '$395 USD',
    passingScore: 66,
    domains: [
      {
        name: 'Cluster Architecture, Installation & Configuration',
        weight: 25,
        moduleSlugs: [
        ],
      },
      {
        name: 'Workloads & Scheduling',
        weight: 15,
        moduleSlugs: [
        ],
      },
      {
        name: 'Services & Networking',
        weight: 20,
        moduleSlugs: [
        ],
      },
      {
        name: 'Storage',
        weight: 10,
        moduleSlugs: [
        ],
      },
      {
        name: 'Troubleshooting',
        weight: 30,
        moduleSlugs: [
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Gap analysis
// ─────────────────────────────────────────────────────────────

export function getCertReadiness(
  cert: Certification,
  completedModules: string[],
  quizScores: Record<string, { score: number; total: number; perfect: boolean }>,
): CertReadiness {
  const completedSet = new Set(completedModules);

  const domainScores = cert.domains.map(domain => {
    const uniqueSlugs = [...new Set(domain.moduleSlugs)];
    const completedCount = uniqueSlugs.filter(s => completedSet.has(s)).length;
    const coverage = uniqueSlugs.length > 0
      ? Math.round((completedCount / uniqueSlugs.length) * 100)
      : 0;

    // Average quiz score across modules that have scores
    const scores = uniqueSlugs
      .map(s => quizScores[s])
      .filter(Boolean)
      .map(q => Math.round((q.score / q.total) * 100));
    const avgQuizScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return { domain, coverage, avgQuizScore };
  });

  // Weighted overall readiness: blend coverage (70%) + quiz score (30%)
  // If no quizzes taken, weight goes fully to coverage
  const overallPct = Math.round(
    domainScores.reduce((acc, { domain, coverage, avgQuizScore }) => {
      const quizWeight = avgQuizScore > 0 ? 0.3 : 0;
      const coverageWeight = 1 - quizWeight;
      const domainScore = coverage * coverageWeight + avgQuizScore * quizWeight;
      return acc + (domainScore * domain.weight) / 100;
    }, 0),
  );

  const weakDomains = domainScores
    .filter(d => d.coverage < 50)
    .map(d => d.domain);
  const strongDomains = domainScores
    .filter(d => d.coverage >= 70)
    .map(d => d.domain);

  // Recommended modules: from weak domains, not completed, ordered by domain weight desc
  const weakDomainSlugs = cert.domains
    .filter(d => domainScores.find(ds => ds.domain === d && ds.coverage < 50))
    .sort((a, b) => b.weight - a.weight)
    .flatMap(d => d.moduleSlugs);

  // Also include low quiz scores from covered modules
  const lowQuizSlugs = cert.domains
    .flatMap(d => d.moduleSlugs)
    .filter(s => {
      const q = quizScores[s];
      return q && Math.round((q.score / q.total) * 100) < 60;
    });

  const recommendedModules = [
    ...new Set([
      ...weakDomainSlugs.filter(s => !completedSet.has(s)),
      ...lowQuizSlugs,
    ]),
  ].slice(0, 6);

  // Estimate weeks: assume 3 modules/week studied
  const totalModules = [...new Set(cert.domains.flatMap(d => d.moduleSlugs))].length;
  const remainingModules = totalModules - completedSet.size;
  const estimatedWeeksToReady = Math.max(1, Math.ceil(Math.max(0, remainingModules) / 3));

  return {
    cert,
    overallPct: Math.min(100, Math.max(0, overallPct)),
    domainScores,
    weakDomains,
    strongDomains,
    estimatedWeeksToReady,
    recommendedModules,
  };
}

/** Returns a simple week-by-week text plan for a certification. */
export function buildStudyPlan(readiness: CertReadiness): string[] {
  const { cert, domainScores, estimatedWeeksToReady } = readiness;
  const weeks: string[] = [];

  const sortedDomains = [...domainScores].sort((a, b) => a.coverage - b.coverage);

  for (let i = 0; i < Math.min(estimatedWeeksToReady, 8); i++) {
    const domainIdx = i % sortedDomains.length;
    const { domain } = sortedDomains[domainIdx];
    const { coverage } = sortedDomains[domainIdx];

    if (i === 0) {
      weeks.push(
        `Semana 1: Diagnóstico — complete os módulos pendentes de "${domain.name}" (${domain.weight}% da prova, cobertura atual ${coverage}%).`,
      );
    } else if (i < sortedDomains.length) {
      weeks.push(
        `Semana ${i + 1}: Foco em "${domain.name}" — ${domain.weight}% da prova. Revise com SRS após cada módulo.`,
      );
    } else {
      weeks.push(
        `Semana ${i + 1}: Revisão geral com SRS + ${cert.code} simulado completo. Meta: ≥${cert.passingScore}% de acerto.`,
      );
    }
  }

  if (estimatedWeeksToReady > 8) {
    weeks.push('... continua conforme você avança nos módulos.');
  }

  return weeks;
}
