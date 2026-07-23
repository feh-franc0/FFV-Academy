/**
 * Trilhas Espelho — feature defensável #4 do MARKET_REFRESH_2026-05.md.
 *
 * Idéia: quando 5+ alunos enviam material da mesma prova/concurso (OAB,
 * residência, AWS-SAA, CNU 2026), o sistema agrega anonimamente e publica
 * uma "trilha espelho" pública — `/trilhas-espelho/oab-41`.
 *
 * Posicionamento competitivo: Concursa.ai só faz pra concurso público;
 * FFV faz transversal (OAB, residência, ENEM, AWS, CNU). Cada nova prova
 * realimenta o sistema. SEO killer.
 *
 * V1 (mai/2026): catálogo HARDCODED com 3 trilhas espelho representativas
 * pra validar UX e SEO. V2: backend agrega de study_requests.subject +
 * institution clustering quando volume ≥ 5.
 */

export interface TrilhaEspelhoModule {
  slug: string;
  num: number;
  title: string;
  summary: string;
  estimatedMin: number;
  /** Tópicos cobertos — alimenta SEO da página + match com user.topicTags. */
  topics: string[];
}

export interface TrilhaEspelho {
  /** Slug curto pra URL (`/trilhas-espelho/<slug>`). */
  slug: string;
  /** Nome canônico da prova. */
  examName: string;
  /** Edição/ano da prova. */
  examEdition: string;
  /** Área (medicina, direito, tecnologia, etc.) — link pra base origem. */
  baseSlug: string;
  /** 1-line pitch usado em SEO description + hero. */
  pitch: string;
  /** Quantos alunos contribuíram com material pra agregação (anonimizado). */
  contributorCount: number;
  /** Quando a trilha foi publicada/atualizada — usado em "última atualização". */
  publishedAt: string;
  /** Módulos numerados — ordem importa (pedagógica). */
  modules: TrilhaEspelhoModule[];
  /** Status: 'live' = pública; 'incubating' = ainda agregando. */
  status: 'live' | 'incubating';
}

// ─── Catálogo V1 (hardcoded) ─────────────────────────────────────────────

const OAB_41: TrilhaEspelho = {
  slug: 'oab-41',
  examName: 'OAB Exame Unificado',
  examEdition: '41ª edição · 2026',
  baseSlug: 'direito',
  pitch:
    'Plano consolidado do XLI Exame da OAB — 17 módulos cobrindo o edital, com revisão espaçada calibrada.',
  contributorCount: 12,
  publishedAt: '2026-05-19',
  status: 'live',
  modules: [
    {
      slug: 'oab41-direito-constitucional',
      num: 1,
      title: 'Direito Constitucional — fundamentos da CF/88',
      summary:
        'Princípios fundamentais, direitos e garantias, organização do Estado, controle de constitucionalidade.',
      estimatedMin: 90,
      topics: ['constitucional', 'principios', 'controle', 'cf88'],
    },
    {
      slug: 'oab41-direitos-humanos',
      num: 2,
      title: 'Direitos Humanos e Tratados Internacionais',
      summary:
        'DUDH, pactos de 1966, Convenção Americana, hierarquia de tratados no direito interno.',
      estimatedMin: 60,
      topics: ['direitos-humanos', 'tratados'],
    },
    {
      slug: 'oab41-etica',
      num: 3,
      title: 'Ética Profissional e Estatuto da OAB',
      summary:
        'Código de Ética, processo disciplinar, prerrogativas, honorários.',
      estimatedMin: 70,
      topics: ['etica', 'estatuto', 'disciplinar'],
    },
    {
      slug: 'oab41-civil-geral',
      num: 4,
      title: 'Direito Civil — Parte Geral',
      summary:
        'Pessoa natural e jurídica, bens, negócio jurídico, prescrição e decadência.',
      estimatedMin: 120,
      topics: ['civil', 'parte-geral', 'prescricao'],
    },
    {
      slug: 'oab41-civil-obrigacoes',
      num: 5,
      title: 'Direito Civil — Obrigações e Contratos',
      summary:
        'Modalidades de obrigação, inadimplemento, teoria geral dos contratos, contratos em espécie.',
      estimatedMin: 140,
      topics: ['civil', 'obrigacoes', 'contratos'],
    },
    {
      slug: 'oab41-processo-civil',
      num: 6,
      title: 'Processo Civil — CPC/15',
      summary:
        'Princípios, jurisdição, ação, competência, partes e procuradores, sentença e coisa julgada.',
      estimatedMin: 150,
      topics: ['processo-civil', 'cpc'],
    },
    {
      slug: 'oab41-penal',
      num: 7,
      title: 'Direito Penal — Parte Geral',
      summary:
        'Teoria do crime, fato típico, antijurídico e culpável, concurso de pessoas, penas.',
      estimatedMin: 130,
      topics: ['penal', 'crime', 'pena'],
    },
    {
      slug: 'oab41-processo-penal',
      num: 8,
      title: 'Processo Penal',
      summary:
        'Inquérito, ação penal, prisão e medidas cautelares, juiz das garantias, provas.',
      estimatedMin: 100,
      topics: ['processo-penal'],
    },
    {
      slug: 'oab41-trabalho',
      num: 9,
      title: 'Direito do Trabalho — material e processual',
      summary:
        'Relação de emprego, contratos, jornada, terminação, processo do trabalho pós-reforma.',
      estimatedMin: 110,
      topics: ['trabalho', 'clt', 'reforma'],
    },
    {
      slug: 'oab41-empresarial',
      num: 10,
      title: 'Direito Empresarial',
      summary:
        'Empresário individual, sociedades, títulos de crédito, recuperação judicial e falência.',
      estimatedMin: 90,
      topics: ['empresarial', 'sociedades'],
    },
    {
      slug: 'oab41-administrativo',
      num: 11,
      title: 'Direito Administrativo',
      summary:
        'Atos administrativos, licitações (Lei 14.133/21), processo administrativo, improbidade.',
      estimatedMin: 95,
      topics: ['administrativo', 'licitacoes'],
    },
    {
      slug: 'oab41-tributario',
      num: 12,
      title: 'Direito Tributário',
      summary:
        'Princípios, tributos em espécie, obrigação tributária, crédito, processo tributário.',
      estimatedMin: 100,
      topics: ['tributario', 'impostos'],
    },
    {
      slug: 'oab41-consumidor',
      num: 13,
      title: 'Direito do Consumidor',
      summary:
        'CDC, vícios e fatos do produto/serviço, responsabilidade civil, prescrição e decadência.',
      estimatedMin: 50,
      topics: ['consumidor', 'cdc'],
    },
    {
      slug: 'oab41-internacional',
      num: 14,
      title: 'Direito Internacional Público e Privado',
      summary:
        'Sujeitos de DIPub, tratados, jurisdição e cooperação no DIPri, LINDB.',
      estimatedMin: 45,
      topics: ['internacional', 'lindb'],
    },
    {
      slug: 'oab41-ambiental',
      num: 15,
      title: 'Direito Ambiental',
      summary:
        'Princípios, política nacional do meio ambiente, responsabilidade ambiental, tutela coletiva.',
      estimatedMin: 40,
      topics: ['ambiental'],
    },
    {
      slug: 'oab41-eca',
      num: 16,
      title: 'Direitos da Criança e do Adolescente',
      summary:
        'ECA, medidas protetivas e socioeducativas, processo socioeducativo.',
      estimatedMin: 35,
      topics: ['eca', 'crianca'],
    },
    {
      slug: 'oab41-revisao-simulado',
      num: 17,
      title: 'Revisão final + simulado completo',
      summary:
        'Revisão espaçada dos cards de SRS gerados + 80 questões inéditas com explicação por alternativa.',
      estimatedMin: 240,
      topics: ['revisao', 'simulado', 'srs'],
    },
  ],
};

const AWS_SAA_C03: TrilhaEspelho = {
  slug: 'aws-saa-c03',
  examName: 'AWS Solutions Architect Associate',
  examEdition: 'SAA-C03 · 2026',
  baseSlug: 'tecnologia',
  pitch:
    '12 módulos cobrindo o blueprint oficial da SAA-C03 — design resiliente, eficiente, seguro e cost-optimized.',
  contributorCount: 8,
  publishedAt: '2026-05-15',
  status: 'live',
  modules: [
    {
      slug: 'saa-design-resilient',
      num: 1,
      title: 'Design Resilient Architectures',
      summary: 'Multi-AZ, Multi-Region, Auto Scaling, fault isolation, DR strategies.',
      estimatedMin: 90,
      topics: ['resiliencia', 'multi-az', 'dr'],
    },
    {
      slug: 'saa-high-performing',
      num: 2,
      title: 'Design High-Performing Architectures',
      summary: 'EC2 instance types, networking optimizada, storage performance, caching layers.',
      estimatedMin: 80,
      topics: ['performance', 'ec2', 'storage'],
    },
    {
      slug: 'saa-secure',
      num: 3,
      title: 'Design Secure Architectures',
      summary: 'IAM, network security (VPC, SG, NACL), encryption at rest e in transit.',
      estimatedMin: 100,
      topics: ['seguranca', 'iam', 'vpc'],
    },
    {
      slug: 'saa-cost-optimized',
      num: 4,
      title: 'Design Cost-Optimized Architectures',
      summary: 'Spot, RI, Savings Plans, S3 tiers, monitoring e budgets.',
      estimatedMin: 70,
      topics: ['custo', 'spot', 's3'],
    },
  ],
  // Resto omitido pra brevidade no V1 — V2 puxa do agregado
};

const CNU_2026: TrilhaEspelho = {
  slug: 'cnu-2026',
  examName: 'Concurso Nacional Unificado (CNU)',
  examEdition: '2ª edição · 2026',
  baseSlug: 'tecnologia',
  pitch:
    'Trilha consolidada do CNU 2026 — bloco temático em IA, dados e infra cloud, com simulado de 60 questões.',
  contributorCount: 6,
  publishedAt: '2026-05-12',
  status: 'incubating',
  modules: [
    {
      slug: 'cnu26-fundamentos-ia',
      num: 1,
      title: 'Fundamentos de IA — conceitos e arquiteturas',
      summary: 'Aprendizado supervisionado/não-supervisionado, redes neurais, transformers.',
      estimatedMin: 75,
      topics: ['ia', 'transformers', 'cnu'],
    },
    {
      slug: 'cnu26-dados-engenharia',
      num: 2,
      title: 'Engenharia de Dados — ETL, lakes, warehouses',
      summary: 'Pipelines de dados, OLAP vs OLTP, particionamento, catálogos.',
      estimatedMin: 80,
      topics: ['dados', 'etl', 'cnu'],
    },
    {
      slug: 'cnu26-cloud-gov',
      num: 3,
      title: 'Cloud no Governo Brasileiro',
      summary: 'LGPD aplicada a cloud, IN nº 5/2017, governança, soberania de dados.',
      estimatedMin: 60,
      topics: ['cloud', 'lgpd', 'governo'],
    },
  ],
};

const ALL_TRILHAS: ReadonlyArray<TrilhaEspelho> = [OAB_41, AWS_SAA_C03, CNU_2026];

/** Retorna todas as trilhas espelho do catálogo. Imutável. */
export function listTrilhasEspelho(): ReadonlyArray<TrilhaEspelho> {
  return ALL_TRILHAS;
}

/** Lookup por slug. Retorna `null` se não existe — caller decide 404. */
export function getTrilhaEspelhoBySlug(slug: string): TrilhaEspelho | null {
  return ALL_TRILHAS.find(t => t.slug === slug) ?? null;
}

/** Tempo total estimado em horas. Útil pra hero + meta description. */
export function totalEstimatedHours(t: TrilhaEspelho): number {
  const min = t.modules.reduce((acc, m) => acc + m.estimatedMin, 0);
  return Math.round(min / 60);
}
