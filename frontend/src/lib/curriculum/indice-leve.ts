// GERADO por scripts/gerar-indice-leve.mjs — não edite à mão.
//
// Índice enxuto do currículo para uso no CLIENTE. Contém apenas o que o cálculo
// de progresso e as recomendações consomem: identidade da trilha e, por módulo,
// slug, título, ícone, XP e tempo de leitura.
//
// Fora daqui, de propósito: `desc`, `keywords`, `prerequisites` e
// `nextSuggested`. São ~124 KB dos 265 KB de fonte das trilhas, e nenhum deles
// participa de progresso — só de metadados de SEO e de busca, que têm seus
// próprios caminhos.
//
// Regenerar após mexer em qualquer trilha:
//     node scripts/gerar-indice-leve.mjs

export interface ModuloLeve {
  slug: string;
  title: string;
  icon: string;
  xp: number;
  readTime: number;
}

export interface TrilhaLeve {
  id: string;
  name: string;
  color: string;
  icon: string;
  href: string;
  modules: ModuloLeve[];
}

/** 38 trilhas · 490 módulos */
export const CURRICULO_LEVE: TrilhaLeve[] = [
  {
    "id": "trail1",
    "name": "Fundamentos da IA",
    "color": "#58a6ff",
    "icon": "🧠",
    "href": "/fundamentos-da-ia",
    "modules": [
      {
        "slug": "o-que-e-ia",
        "title": "O que é Inteligência Artificial?",
        "icon": "🤖",
        "xp": 30,
        "readTime": 6
      },
      {
        "slug": "dados-o-combustivel",
        "title": "Dados: o Combustível da IA",
        "icon": "⛽",
        "xp": 30,
        "readTime": 7
      },
      {
        "slug": "como-ia-aprende",
        "title": "Como a IA Aprende (Machine Learning)",
        "icon": "📈",
        "xp": 40,
        "readTime": 8
      },
      {
        "slug": "redes-neurais",
        "title": "Redes Neurais: o Cérebro Artificial",
        "icon": "🕸️",
        "xp": 50,
        "readTime": 10
      },
      {
        "slug": "o-que-e-llm",
        "title": "O que é um LLM?",
        "icon": "💬",
        "xp": 50,
        "readTime": 9
      },
      {
        "slug": "tokens",
        "title": "Tokens e Tokenização",
        "icon": "🔤",
        "xp": 40,
        "readTime": 7
      },
      {
        "slug": "transformers",
        "title": "Transformers e Mecanismo de Atenção",
        "icon": "⚙️",
        "xp": 60,
        "readTime": 12
      }
    ]
  },
  {
    "id": "trail2",
    "name": "IA Além do LLM",
    "color": "#d2a8ff",
    "icon": "🏗️",
    "href": "/ia-alem-do-llm",
    "modules": [
      {
        "slug": "kv-cache",
        "title": "KV Cache: Memória Eficiente",
        "icon": "⚡",
        "xp": 60,
        "readTime": 8
      },
      {
        "slug": "mixture-of-experts",
        "title": "Mixture of Experts (MoE)",
        "icon": "🧩",
        "xp": 70,
        "readTime": 10
      },
      {
        "slug": "tool-calling",
        "title": "Tool Calling e Agentes",
        "icon": "🔧",
        "xp": 70,
        "readTime": 9
      },
      {
        "slug": "ia-alem-do-llm",
        "title": "Harness: a Infraestrutura do Agente",
        "icon": "🏗️",
        "xp": 80,
        "readTime": 15
      },
      {
        "slug": "como-avaliar-modelos",
        "title": "Como Avaliar Modelos de IA",
        "icon": "📊",
        "xp": 60,
        "readTime": 8
      }
    ]
  },
  {
    "id": "trail3",
    "name": "Ferramentas de IA para Código",
    "color": "#ffa657",
    "icon": "💻",
    "href": "/ferramentas-ia-codigo",
    "modules": [
      {
        "slug": "coding-agents-panorama",
        "title": "O Panorama dos Coding Agents",
        "icon": "🗺️",
        "xp": 50,
        "readTime": 8
      },
      {
        "slug": "claude-code-arquitetura",
        "title": "Claude Code: Filosofia e Arquitetura",
        "icon": "🤖",
        "xp": 70,
        "readTime": 12
      },
      {
        "slug": "openai-codex-cloud",
        "title": "OpenAI Codex: o Agente na Nuvem",
        "icon": "☁️",
        "xp": 65,
        "readTime": 10
      },
      {
        "slug": "cursor-copilot-ides",
        "title": "Cursor, Copilot e os IDEs Aumentados",
        "icon": "🖥️",
        "xp": 60,
        "readTime": 10
      },
      {
        "slug": "amazon-q-kiro",
        "title": "Amazon Q e Kiro: a Aposta da AWS",
        "icon": "☁️",
        "xp": 60,
        "readTime": 9
      },
      {
        "slug": "qual-coding-agent-usar",
        "title": "Qual Ferramenta Usar e Quando",
        "icon": "⚖️",
        "xp": 80,
        "readTime": 12
      }
    ]
  },
  {
    "id": "trail4",
    "name": "AWS Cloud Practitioner",
    "color": "#ff9900",
    "icon": "☁️",
    "href": "/aws-cloud-practitioner",
    "modules": [
      {
        "slug": "o-que-e-cloud",
        "title": "O que é Cloud Computing?",
        "icon": "☁️",
        "xp": 30,
        "readTime": 8
      },
      {
        "slug": "aws-global-infra",
        "title": "Infraestrutura Global: Regiões, AZs e Edge",
        "icon": "🌍",
        "xp": 40,
        "readTime": 8
      },
      {
        "slug": "modelo-responsabilidade-compartilhada",
        "title": "Modelo de Responsabilidade Compartilhada",
        "icon": "🤝",
        "xp": 35,
        "readTime": 7
      },
      {
        "slug": "iam-fundamentos",
        "title": "IAM: Identidade, Grupos, Roles e Policies",
        "icon": "🔐",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "compute-ec2-lambda",
        "title": "Compute: EC2, Lambda e Containers",
        "icon": "🖥️",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "storage-s3-ebs-efs",
        "title": "Storage: S3, EBS, EFS e Glacier",
        "icon": "💾",
        "xp": 55,
        "readTime": 11
      },
      {
        "slug": "databases-aws-basico",
        "title": "Databases: RDS, Aurora, DynamoDB e Redshift",
        "icon": "🗄️",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "networking-vpc-route53",
        "title": "Networking: VPC, Route 53 e CloudFront",
        "icon": "🌐",
        "xp": 55,
        "readTime": 11
      },
      {
        "slug": "seguranca-aws-servicos",
        "title": "Segurança AWS: KMS, GuardDuty, Shield e WAF",
        "icon": "🛡️",
        "xp": 60,
        "readTime": 11
      },
      {
        "slug": "monitoramento-cloudwatch",
        "title": "Monitoramento: CloudWatch, CloudTrail e Config",
        "icon": "📊",
        "xp": 45,
        "readTime": 9
      },
      {
        "slug": "well-architected-framework",
        "title": "Well-Architected: os 6 Pilares",
        "icon": "🏛️",
        "xp": 50,
        "readTime": 10
      },
      {
        "slug": "cloud-adoption-framework",
        "title": "CAF e os 7 Rs da Migração",
        "icon": "🚚",
        "xp": 45,
        "readTime": 9
      },
      {
        "slug": "precificacao-suporte",
        "title": "Precificação, Free Tier e Planos de Suporte",
        "icon": "💰",
        "xp": 50,
        "readTime": 10
      },
      {
        "slug": "migracao-aws-servicos",
        "title": "Migração: Migration Hub, DMS, MGN e DataSync",
        "icon": "🚚",
        "xp": 45,
        "readTime": 9
      },
      {
        "slug": "ai-ml-aws-servicos",
        "title": "IA e ML na AWS: Bedrock, SageMaker, Q e Amigos",
        "icon": "🧠",
        "xp": 50,
        "readTime": 10
      },
      {
        "slug": "developer-tools-aws",
        "title": "Developer Tools: CodePipeline, CDK, CloudFormation e SAM",
        "icon": "🛠️",
        "xp": 45,
        "readTime": 9
      },
      {
        "slug": "simulado-practitioner",
        "title": "Simulado CLF-C02 Comentado",
        "icon": "🎯",
        "xp": 80,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail5",
    "name": "AWS Solutions Architect Associate",
    "color": "#146eb4",
    "icon": "🏛️",
    "href": "/aws-saa-c03",
    "modules": [
      {
        "slug": "saa-c03-intro",
        "title": "SAA-C03: Da Teoria à Arquitetura Real",
        "icon": "🎓",
        "xp": 40,
        "readTime": 8
      },
      {
        "slug": "iam-avancado-organizations",
        "title": "IAM Avançado: Policies JSON, STS e Organizations",
        "icon": "🔑",
        "xp": 75,
        "readTime": 14
      },
      {
        "slug": "vpc-avancado",
        "title": "VPC em Profundidade: NAT, Peering e Transit Gateway",
        "icon": "🕸️",
        "xp": 85,
        "readTime": 16
      },
      {
        "slug": "dns-cdn-edge",
        "title": "Route 53, CloudFront e Global Accelerator",
        "icon": "🌐",
        "xp": 70,
        "readTime": 13
      },
      {
        "slug": "ec2-autoscaling-elb",
        "title": "EC2 Profissional: Auto Scaling e Load Balancers",
        "icon": "⚖️",
        "xp": 80,
        "readTime": 15
      },
      {
        "slug": "containers-ecs-eks",
        "title": "ECS vs EKS: Orquestração de Containers",
        "icon": "📦",
        "xp": 70,
        "readTime": 13
      },
      {
        "slug": "serverless-lambda-avancado",
        "title": "Serverless Avançado: Lambda, API GW e Step Functions",
        "icon": "⚡",
        "xp": 80,
        "readTime": 15
      },
      {
        "slug": "s3-avancado",
        "title": "S3 Profundo: Classes, Lifecycle e Object Lock",
        "icon": "🪣",
        "xp": 80,
        "readTime": 15
      },
      {
        "slug": "block-file-storage",
        "title": "EBS, EFS e FSx: Quando Usar Cada Um",
        "icon": "💽",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "rds-aurora-dynamodb",
        "title": "Bancos: Multi-AZ, Read Replicas e DynamoDB",
        "icon": "🗃️",
        "xp": 90,
        "readTime": 17
      },
      {
        "slug": "caching-performance",
        "title": "Caching: ElastiCache, DAX e CloudFront",
        "icon": "🚀",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "messaging-eventos",
        "title": "Messaging: SQS, SNS, EventBridge e Kinesis",
        "icon": "📨",
        "xp": 70,
        "readTime": 13
      },
      {
        "slug": "seguranca-avancada",
        "title": "Segurança Avançada: KMS, Secrets Manager e WAF",
        "icon": "🔒",
        "xp": 80,
        "readTime": 15
      },
      {
        "slug": "disaster-recovery",
        "title": "Disaster Recovery: RPO, RTO e 4 Estratégias",
        "icon": "🆘",
        "xp": 70,
        "readTime": 13
      },
      {
        "slug": "cost-optimization-saa",
        "title": "Otimização de Custos: RI, Savings Plans e Spot",
        "icon": "💵",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "analytics-bigdata",
        "title": "Analytics: Athena, EMR, Kinesis e Glue",
        "icon": "📈",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "migracao-transferencia-saa",
        "title": "Migração para o Arquiteto: DMS, SCT, MGN e DRS",
        "icon": "🚚",
        "xp": 65,
        "readTime": 12
      },
      {
        "slug": "rede-hibrida-saa",
        "title": "Rede Híbrida: Direct Connect, VPN, PrivateLink e VPC Endpoints",
        "icon": "🌉",
        "xp": 70,
        "readTime": 13
      },
      {
        "slug": "ml-ia-arquiteto-saa",
        "title": "ML/IA para Arquiteto: SageMaker, Bedrock e Pipelines",
        "icon": "🧬",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "simulado-saa-c03",
        "title": "Simulado SAA-C03 Comentado",
        "icon": "🏆",
        "xp": 100,
        "readTime": 25
      }
    ]
  },
  {
    "id": "trail9",
    "name": "Engenharia AI-Native",
    "color": "#ff7eb6",
    "icon": "🧬",
    "href": "/ai-native",
    "modules": [
      {
        "slug": "rag-fundamentos",
        "title": "RAG: por que \"só jogar tudo no LLM\" não funciona",
        "icon": "🧩",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "chunking-embeddings",
        "title": "Chunking e Embeddings: as decisões que fazem ou quebram seu RAG",
        "icon": "🔪",
        "xp": 85,
        "readTime": 17
      },
      {
        "slug": "hybrid-search-reranking",
        "title": "Hybrid Search + Reranking: do BM25 ao cross-encoder",
        "icon": "🎯",
        "xp": 90,
        "readTime": 18
      },
      {
        "slug": "rag-evaluation",
        "title": "Avaliando RAG: recall@k, nDCG e LLM-as-judge",
        "icon": "📊",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "agentes-padroes",
        "title": "Agent Patterns: ReAct, Reflexion e Tree of Thoughts",
        "icon": "🤖",
        "xp": 90,
        "readTime": 18
      },
      {
        "slug": "multi-agent-systems",
        "title": "Multi-Agent Systems: orchestrator-worker, swarms e handoffs",
        "icon": "🕸️",
        "xp": 85,
        "readTime": 17
      },
      {
        "slug": "context-engineering",
        "title": "Context Engineering: prompt caching, subagents e skills",
        "icon": "🧠",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "mcp-servers",
        "title": "MCP Deep Dive: construindo um servidor profissional",
        "icon": "🔌",
        "xp": 90,
        "readTime": 19
      },
      {
        "slug": "llm-apis-producao",
        "title": "LLM APIs em Produção: streaming, structured output, batch e cache",
        "icon": "🚀",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "llmops-drift-canary",
        "title": "LLMOps: eval harness, drift detection e canary de prompts",
        "icon": "📈",
        "xp": 90,
        "readTime": 18
      },
      {
        "slug": "capstone-ai-native-rag-producao",
        "title": "Capstone: RAG production-grade — de ponta a ponta",
        "icon": "🏁",
        "xp": 150,
        "readTime": 45
      }
    ]
  },
  {
    "id": "trail10",
    "name": "Sistemas Distribuídos",
    "color": "#f78166",
    "icon": "🧭",
    "href": "/sistemas-distribuidos",
    "modules": [
      {
        "slug": "cap-pacelc",
        "title": "CAP e PACELC: o teorema que define toda arquitetura distribuída",
        "icon": "⚖️",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "consistency-models",
        "title": "Modelos de Consistência: strong, eventual, causal, read-your-writes",
        "icon": "🔄",
        "xp": 85,
        "readTime": 17
      },
      {
        "slug": "consensus-raft",
        "title": "Consensus e Raft: como nós discordam e chegam a acordo",
        "icon": "🗳️",
        "xp": 90,
        "readTime": 18
      },
      {
        "slug": "idempotencia-retries",
        "title": "Idempotência e Retries: o antídoto pra rede que quebra",
        "icon": "🔁",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "sagas-2pc",
        "title": "Sagas vs 2PC: transações distribuídas sem perder o sono",
        "icon": "🪢",
        "xp": 85,
        "readTime": 17
      },
      {
        "slug": "event-sourcing-cqrs",
        "title": "Event Sourcing e CQRS: quando eventos são a fonte da verdade",
        "icon": "📜",
        "xp": 85,
        "readTime": 17
      },
      {
        "slug": "postgres-mvcc-isolation",
        "title": "Postgres Profundo: MVCC, Isolation Levels e Locks",
        "icon": "🐘",
        "xp": 85,
        "readTime": 17
      },
      {
        "slug": "rate-limiting-distribuido",
        "title": "Rate Limiting Distribuído: token bucket, sliding window, Redis",
        "icon": "🚦",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "capstone-sistemas-distribuidos-saga",
        "title": "Capstone: saga distribuída ponta a ponta",
        "icon": "🏁",
        "xp": 95,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail11",
    "name": "Observabilidade & SRE",
    "color": "#79c0ff",
    "icon": "🔭",
    "href": "/observabilidade-sre",
    "modules": [
      {
        "slug": "observability-pilares",
        "title": "Observability: os 3 pilares (logs, métricas, traces) e por que não basta",
        "icon": "🔍",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "metricas-red-use",
        "title": "Métricas RED e USE: os frameworks que cobrem 90% dos casos",
        "icon": "📉",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "opentelemetry-stack",
        "title": "OpenTelemetry end-to-end: instrumentação app → backend",
        "icon": "🛰️",
        "xp": 90,
        "readTime": 18
      },
      {
        "slug": "logs-estruturados",
        "title": "Logs Estruturados: JSON, correlation IDs e levels com propósito",
        "icon": "📝",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "distributed-tracing",
        "title": "Distributed Tracing: spans, baggage e sampling strategies",
        "icon": "🧵",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "slos-error-budgets",
        "title": "SLOs e Error Budgets: a contabilidade da confiabilidade",
        "icon": "🎯",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "incident-response-postmortem",
        "title": "Incident Response: comando, comunicação e postmortem blameless",
        "icon": "🚑",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "capstone-sre-slo-runbook",
        "title": "Capstone: SLO + error budget + runbook reais",
        "icon": "🏁",
        "xp": 90,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail12",
    "name": "Fundamentos Técnicos",
    "color": "#8b949e",
    "icon": "🧱",
    "href": "/fundamentos-tecnicos",
    "modules": [
      {
        "slug": "como-computador-roda-codigo",
        "title": "Como o computador roda seu código (do teclado ao pixel)",
        "icon": "💻",
        "xp": 50,
        "readTime": 10
      },
      {
        "slug": "linux-terminal-basico",
        "title": "Linux no terminal: os 30 comandos que valem por 300",
        "icon": "🐧",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "filesystem-permissions",
        "title": "Filesystem e permissões: rwx, chown, symlink, hardlink",
        "icon": "📁",
        "xp": 45,
        "readTime": 9
      },
      {
        "slug": "processos-jobs-sinais",
        "title": "Processos, jobs, sinais: como o SO organiza execução",
        "icon": "⚙️",
        "xp": 55,
        "readTime": 11
      },
      {
        "slug": "ssh-chaves-acesso-remoto",
        "title": "SSH e chaves: como acessar máquinas remotas com segurança",
        "icon": "🔑",
        "xp": 50,
        "readTime": 10
      },
      {
        "slug": "git-de-verdade",
        "title": "Git de verdade: commit, branch, merge, rebase, reflog",
        "icon": "🌿",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "github-fluxo-profissional",
        "title": "GitHub profissional: PR, review, issues, Actions básico",
        "icon": "🐙",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "http-do-zero",
        "title": "HTTP do zero: request, response, status, headers, cookies",
        "icon": "🌐",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "dns-tls-certificados",
        "title": "DNS, TLS e certificados: o que acontece antes do seu request",
        "icon": "🔒",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "json-yaml-env",
        "title": "JSON, YAML e variáveis de ambiente: config moderna",
        "icon": "📄",
        "xp": 40,
        "readTime": 8
      },
      {
        "slug": "editores-produtividade",
        "title": "VSCode/Vim produtivos: atalhos, plugins, multi-cursor",
        "icon": "✏️",
        "xp": 35,
        "readTime": 7
      }
    ]
  },
  {
    "id": "trail14",
    "name": "SQL & Databases",
    "color": "#336791",
    "icon": "🗃️",
    "href": "/sql-databases",
    "modules": [
      {
        "slug": "relacional-vs-nao-relacional",
        "title": "Relacional vs NoSQL: quando cada um ganha",
        "icon": "⚖️",
        "xp": 50,
        "readTime": 10
      },
      {
        "slug": "select-join-na-pratica",
        "title": "SELECT e JOIN na prática: INNER, LEFT, self-join",
        "icon": "🔗",
        "xp": 65,
        "readTime": 13
      },
      {
        "slug": "group-by-agregacoes",
        "title": "GROUP BY, HAVING e agregações que resolvem 80% dos casos",
        "icon": "📊",
        "xp": 55,
        "readTime": 11
      },
      {
        "slug": "window-functions",
        "title": "Window functions: ranking, running totals, lead/lag",
        "icon": "🪟",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "indices-que-funcionam",
        "title": "Índices que funcionam: B-tree, hash, GIN, covering, composto",
        "icon": "📇",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "explain-analyze",
        "title": "EXPLAIN ANALYZE: lendo o plano e otimizando query",
        "icon": "🔬",
        "xp": 85,
        "readTime": 17
      },
      {
        "slug": "transacoes-isolation-levels",
        "title": "Transações e isolation levels: ACID sem decoreba",
        "icon": "🔒",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "normalizacao-modelagem",
        "title": "Modelagem e normalização: 1NF–3NF + quando desnormalizar",
        "icon": "📐",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "migrations-profissionais",
        "title": "Migrations profissionais: reversíveis, zero-downtime",
        "icon": "🔄",
        "xp": 65,
        "readTime": 13
      },
      {
        "slug": "connection-pool-n-plus-1",
        "title": "Connection pool, N+1 e o que mata sua API",
        "icon": "⚠️",
        "xp": 70,
        "readTime": 14
      }
    ]
  },
  {
    "id": "trail16",
    "name": "Redes & Web",
    "color": "#1f6feb",
    "icon": "🌐",
    "href": "/redes-web",
    "modules": [
      {
        "slug": "modelo-osi-tcp-ip",
        "title": "OSI e TCP/IP: as camadas que explicam tudo",
        "icon": "📚",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "tcp-handshake-congestao",
        "title": "TCP de verdade: handshake, congestion control, retransmissão",
        "icon": "🤝",
        "xp": 85,
        "readTime": 17
      },
      {
        "slug": "udp-quic-http3",
        "title": "UDP, QUIC e HTTP/3: por que Google jogou TCP fora",
        "icon": "🚀",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "http-1-vs-2-vs-3",
        "title": "HTTP/1.1, /2, /3: multiplexing, HPACK, server push",
        "icon": "📡",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "tls-handshake-detalhe",
        "title": "TLS 1.3: handshake, chaves, certificados, SNI, ALPN",
        "icon": "🔐",
        "xp": 90,
        "readTime": 18
      },
      {
        "slug": "dns-recursivo-autoritativo",
        "title": "DNS: recursivo, autoritativo, registros, TTL, DNSSEC",
        "icon": "📖",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "proxies-load-balancers",
        "title": "Proxies, reverse proxies, load balancers L4 vs L7",
        "icon": "⚖️",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "websocket-sse-streaming",
        "title": "WebSocket, SSE, streaming: comunicação bidirecional",
        "icon": "🔄",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "cors-csrf-cookies-seguros",
        "title": "CORS, CSRF, cookies seguros: segurança web fundamental",
        "icon": "🛡️",
        "xp": 70,
        "readTime": 14
      }
    ]
  },
  {
    "id": "trail19",
    "name": "TypeScript Profissional",
    "color": "#3178c6",
    "icon": "🔷",
    "href": "/typescript-profissional",
    "modules": [
      {
        "slug": "typescript-como-mental-model",
        "title": "TypeScript como mental model: tipos são prova, não anotação",
        "icon": "🧠",
        "xp": 45,
        "readTime": 11
      },
      {
        "slug": "narrowing-discriminated-unions",
        "title": "Narrowing e discriminated unions: o coração real do TypeScript",
        "icon": "🎯",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "generics-de-verdade",
        "title": "Generics de verdade: variance, constraints e conditional types",
        "icon": "⚙️",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "tipos-utilitarios-e-quando-nao-usar",
        "title": "Tipos utilitários (Partial, Pick, Omit...) e quando NÃO usar",
        "icon": "🧰",
        "xp": 45,
        "readTime": 10
      },
      {
        "slug": "type-safety-em-boundaries",
        "title": "Type safety em boundaries: Zod, io-ts e validação runtime",
        "icon": "🛡️",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "async-await-sem-pegadinha",
        "title": "Async/await sem pegadinha: promises, AbortController e cancelamento",
        "icon": "⏳",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "erros-como-valores",
        "title": "Erros como valores: Result, neverthrow e por que `throw` quebra",
        "icon": "🚨",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "performance-em-node",
        "title": "Performance em Node: event loop, streams e backpressure",
        "icon": "🚀",
        "xp": 65,
        "readTime": 15
      },
      {
        "slug": "monorepo-pnpm-turbo",
        "title": "Monorepo profissional: pnpm workspaces + Turbo + shared configs",
        "icon": "📦",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "capstone-cli-tool-ts",
        "title": "Capstone: construir um CLI tool TypeScript end-to-end",
        "icon": "🏁",
        "xp": 80,
        "readTime": 18
      }
    ]
  },
  {
    "id": "trail22",
    "name": "Security Engineering",
    "color": "#ef4444",
    "icon": "🛡️",
    "href": "/security-engineering",
    "modules": [
      {
        "slug": "threat-modeling-stride",
        "title": "Threat modeling com STRIDE: de onde vêm os ataques",
        "icon": "🎯",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "authn-vs-authz",
        "title": "Authn vs Authz: a diferença e as armadilhas",
        "icon": "🔑",
        "xp": 50,
        "readTime": 11
      },
      {
        "slug": "oauth2-oidc-do-zero",
        "title": "OAuth2 e OIDC do zero: fluxos e PKCE",
        "icon": "🔐",
        "xp": 65,
        "readTime": 15
      },
      {
        "slug": "jwt-paseto-sessions",
        "title": "JWT, Paseto ou sessions: quando cada um",
        "icon": "🎫",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "password-hashing-moderno",
        "title": "Password hashing moderno: argon2, bcrypt, peppers",
        "icon": "🧂",
        "xp": 45,
        "readTime": 10
      },
      {
        "slug": "owasp-top-10-com-exemplo-em-codigo",
        "title": "OWASP Top 10 (2024) com exemplo em código",
        "icon": "📋",
        "xp": 70,
        "readTime": 16
      },
      {
        "slug": "secrets-management",
        "title": "Secrets management: Vault, SOPS e AWS Secrets Manager",
        "icon": "🗝️",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "supply-chain-security",
        "title": "Supply chain: SBOM, sigstore e dependency confusion",
        "icon": "📦",
        "xp": 60,
        "readTime": 13
      },
      {
        "slug": "zero-trust-e-mtls",
        "title": "Zero Trust e mTLS: verificar sempre, nunca confiar na rede",
        "icon": "🚪",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "capstone-pentest-em-app-proprio",
        "title": "Capstone: pentest em app próprio (ético)",
        "icon": "🏁",
        "xp": 85,
        "readTime": 18
      }
    ]
  },
  {
    "id": "trail23",
    "name": "AWS Developer Associate (DVA-C02)",
    "color": "#ff9900",
    "icon": "🏗️",
    "href": "/aws-developer-associate",
    "modules": [
      {
        "slug": "dva-c02-intro",
        "title": "DVA-C02: domínios, pesos e estratégia de estudo",
        "icon": "🎯",
        "xp": 40,
        "readTime": 10
      },
      {
        "slug": "lambda-profundo",
        "title": "Lambda profundo: cold start, layers e provisioned concurrency",
        "icon": "⚡",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "api-gateway-rest-http-ws",
        "title": "API Gateway: REST vs HTTP vs WebSocket",
        "icon": "🌐",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "dynamodb-para-dev",
        "title": "DynamoDB pra dev: partition key, GSI e Streams",
        "icon": "🗃️",
        "xp": 65,
        "readTime": 15
      },
      {
        "slug": "s3-dev-features",
        "title": "S3 features pra dev: presigned URLs, multipart e events",
        "icon": "🪣",
        "xp": 50,
        "readTime": 11
      },
      {
        "slug": "step-functions-workflows",
        "title": "Step Functions: orquestração de workflows",
        "icon": "🔀",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "eventbridge-sqs-sns-para-dev",
        "title": "EventBridge, SQS e SNS: qual, quando, como combinar",
        "icon": "📮",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "cognito-fluxos",
        "title": "Cognito: user pools vs identity pools",
        "icon": "👥",
        "xp": 50,
        "readTime": 11
      },
      {
        "slug": "kms-encryption-dev",
        "title": "KMS: envelope encryption e quando usar CMK",
        "icon": "🔏",
        "xp": 50,
        "readTime": 11
      },
      {
        "slug": "cicd-aws-nativo",
        "title": "CI/CD AWS-nativo: CodeBuild, CodeDeploy e CodePipeline",
        "icon": "🚀",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "x-ray-observability",
        "title": "X-Ray: tracing distribuído na AWS",
        "icon": "🔭",
        "xp": 45,
        "readTime": 10
      },
      {
        "slug": "secrets-parameter-store",
        "title": "Secrets Manager vs Parameter Store: escolha",
        "icon": "🔐",
        "xp": 45,
        "readTime": 10
      },
      {
        "slug": "ecs-fargate-para-dev",
        "title": "ECS Fargate pra dev: quando escolher vs Lambda",
        "icon": "🐳",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "cloudformation-sam-cdk",
        "title": "IaC: CloudFormation vs SAM vs CDK",
        "icon": "📜",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "simulado-dva-c02",
        "title": "Fechamento DVA-C02: estratégia de prova e checklist",
        "icon": "🏁",
        "xp": 80,
        "readTime": 18
      }
    ]
  },
  {
    "id": "trail36",
    "name": "Python para Engenheiros",
    "color": "#3776ab",
    "icon": "🐍",
    "href": "/python-engenheiros",
    "modules": [
      {
        "slug": "python-pra-dev-ts",
        "title": "Python pra dev TS: diferenças mentais críticas",
        "icon": "🔄",
        "xp": 40,
        "readTime": 10
      },
      {
        "slug": "uv-e-python-moderno",
        "title": "uv e Python moderno: chega de pip + venv manual",
        "icon": "⚡",
        "xp": 45,
        "readTime": 11
      },
      {
        "slug": "type-hints-rigorosos",
        "title": "Type hints rigorosos: PEP 695, Protocol, TypedDict",
        "icon": "📝",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "pydantic-v2-serio",
        "title": "Pydantic v2 sério: modelos, validação e settings",
        "icon": "🛡️",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "async-em-python",
        "title": "Async em Python: asyncio, trio e trade-offs vs Node",
        "icon": "⏳",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "fastapi-na-pratica",
        "title": "FastAPI na prática: routers, DI e auth",
        "icon": "🚀",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "jupyter-pra-engenharia",
        "title": "Jupyter pra engenharia: notebook reprodutível",
        "icon": "📓",
        "xp": 45,
        "readTime": 10
      },
      {
        "slug": "capstone-agent-python-completo",
        "title": "Capstone: agent Python completo com Claude SDK",
        "icon": "🏁",
        "xp": 80,
        "readTime": 18
      }
    ]
  },
  {
    "id": "trail38",
    "name": "Database Deep — Postgres Internals",
    "color": "#336791",
    "icon": "🐘",
    "href": "/postgres-internals",
    "modules": [
      {
        "slug": "mvcc-e-isolation-levels-de-verdade",
        "title": "MVCC e isolation levels de verdade (sem simplificação)",
        "icon": "🔀",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "query-planner-e-explain-analyze-ninja",
        "title": "Query planner: EXPLAIN ANALYZE ninja",
        "icon": "🗺️",
        "xp": 65,
        "readTime": 15
      },
      {
        "slug": "indices-avancados",
        "title": "Índices avançados: B-tree, BRIN, GIN, GiST, partial, covering",
        "icon": "🔍",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "vacuum-autovacuum-bloat",
        "title": "Vacuum, autovacuum e bloat: causa #1 de DB morrendo",
        "icon": "🧹",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "connection-pooling",
        "title": "Connection pooling: pgbouncer e a trap serverless",
        "icon": "🔌",
        "xp": 50,
        "readTime": 11
      },
      {
        "slug": "replication-primary-replica",
        "title": "Replication: streaming, logical, failover",
        "icon": "🔁",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "particionamento-e-sharding",
        "title": "Particionamento e sharding: quando e como",
        "icon": "🧩",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "capstone-tuning-de-workload-real",
        "title": "Capstone: tuning de workload — query de 30s pra 50ms",
        "icon": "🏁",
        "xp": 90,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail24",
    "name": "Data Engineering Moderna",
    "color": "#10b981",
    "icon": "🏭",
    "href": "/data-engineering",
    "modules": [
      {
        "slug": "batch-vs-stream-mental-model",
        "title": "Batch vs stream: mental model e trade-offs reais",
        "icon": "⏱️",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "dbt-transformacao-como-codigo",
        "title": "dbt: transformação como código, testável",
        "icon": "🔧",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "airflow-vs-dagster-vs-prefect",
        "title": "Airflow vs Dagster vs Prefect: qual orquestrador",
        "icon": "🎼",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "duckdb-e-polars",
        "title": "DuckDB e Polars: a revolução in-process",
        "icon": "🦆",
        "xp": 55,
        "readTime": 12
      },
      {
        "slug": "data-lake-lakehouse-warehouse",
        "title": "Data lake vs lakehouse vs warehouse",
        "icon": "🏛️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "cdc-com-debezium",
        "title": "CDC com Debezium: change data capture sério",
        "icon": "🔄",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "kafka-fundamentos",
        "title": "Kafka fundamentos: partições, consumer groups, exactly-once",
        "icon": "📨",
        "xp": 65,
        "readTime": 15
      },
      {
        "slug": "iceberg-delta-hudi",
        "title": "Iceberg, Delta e Hudi: table formats abertos",
        "icon": "🧊",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "qualidade-de-dados",
        "title": "Qualidade de dados: Great Expectations, dbt tests, Soda",
        "icon": "✅",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "capstone-pipeline-analytics-completo",
        "title": "Capstone: pipeline analytics end-to-end",
        "icon": "🏁",
        "xp": 90,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail25",
    "name": "Fine-tuning & Customização de LLMs",
    "color": "#c084fc",
    "icon": "🎛️",
    "href": "/fine-tuning",
    "modules": [
      {
        "slug": "quando-fine-tune-vs-rag-vs-prompt",
        "title": "Quando fine-tune vs RAG vs prompt engineering",
        "icon": "🎯",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "sft-supervised-fine-tuning",
        "title": "SFT (Supervised Fine-Tuning): básico e prático",
        "icon": "📚",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "lora-qlora-peft",
        "title": "LoRA, QLoRA e PEFT: fine-tuning eficiente",
        "icon": "⚡",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "dpo-rlhf-simplificado",
        "title": "DPO e RLHF simplificado: aprender com preferências",
        "icon": "👍",
        "xp": 65,
        "readTime": 15
      },
      {
        "slug": "datasets-para-fine-tuning",
        "title": "Datasets pra fine-tuning: curadoria, dedup, contaminação",
        "icon": "📦",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "avaliando-fine-tune",
        "title": "Avaliando fine-tune: golden set, regression, A/B",
        "icon": "📊",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "deploy-modelo-customizado",
        "title": "Deploy modelo customizado: vLLM, TGI, Bedrock",
        "icon": "🚀",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "capstone-fine-tune-modelo-especialista",
        "title": "Capstone: fine-tune de modelo especialista de domínio",
        "icon": "🏁",
        "xp": 95,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail26",
    "name": "LLM Evals Profissional",
    "color": "#f97316",
    "icon": "📏",
    "href": "/llm-evals",
    "modules": [
      {
        "slug": "evals-como-disciplina",
        "title": "Evals como disciplina: por que LLM testing é diferente",
        "icon": "🎓",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "golden-sets-curadoria",
        "title": "Golden sets: curadoria + manutenção + growth",
        "icon": "🏆",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "llm-as-judge-armadilhas",
        "title": "LLM-as-judge: armadilhas e mitigações",
        "icon": "⚖️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "eval-frameworks",
        "title": "Eval frameworks: Braintrust, Langfuse, Inspect, Promptfoo",
        "icon": "🧰",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "ab-testing-de-prompt-em-producao",
        "title": "A/B testing de prompt em produção",
        "icon": "🔀",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "regression-testing-para-agents",
        "title": "Regression testing pra agents: evitar regredir por mudança",
        "icon": "🔁",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "capstone-eval-harness-completo",
        "title": "Capstone: eval harness completo",
        "icon": "🏁",
        "xp": 90,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail27",
    "name": "AWS Solutions Architect Professional (SAP-C03)",
    "color": "#ff9900",
    "icon": "🏛️",
    "href": "/aws-sap-c03",
    "modules": [
      {
        "slug": "sap-c03-intro",
        "title": "SAP-C03 intro: domínios, pesos e estratégia",
        "icon": "🎯",
        "xp": 40,
        "readTime": 10
      },
      {
        "slug": "organizations-control-tower",
        "title": "Organizations, Control Tower e Landing Zone",
        "icon": "🏗️",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "advanced-networking-sap",
        "title": "Advanced networking: RAM, Cloud WAN, Transit Gateway",
        "icon": "🌐",
        "xp": 65,
        "readTime": 15
      },
      {
        "slug": "migracao-7rs-sap",
        "title": "Migration strategy: os 7 Rs + DMS + SMS",
        "icon": "📦",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "cost-allocation-em-escala",
        "title": "Cost allocation tags em escala + Cost Categories",
        "icon": "💰",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "well-architected-aplicado",
        "title": "Well-Architected Framework aplicado em review",
        "icon": "🏛️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "disaster-recovery-estrategias",
        "title": "Disaster Recovery: 4 estratégias (backup a multi-site)",
        "icon": "🚨",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "edge-hibrido-sap",
        "title": "Edge e híbrido: Outposts, Wavelength, Local Zones",
        "icon": "📡",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "analytics-bigdata-sap",
        "title": "Analytics em escala: Redshift, EMR, Athena, Lake Formation",
        "icon": "📊",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "seguranca-sap-avancada",
        "title": "Segurança enterprise: GuardDuty, Detective, Security Hub",
        "icon": "🛡️",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "ml-ia-arquiteto-sap",
        "title": "ML/IA sob ótica de arquiteto: Bedrock, SageMaker, Comprehend",
        "icon": "🤖",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "containers-serverless-sap",
        "title": "Containers e serverless em arquitetura enterprise",
        "icon": "📦",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "hibrido-direct-connect",
        "title": "Híbrido: Direct Connect, Site-to-Site VPN, Storage Gateway",
        "icon": "🔗",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "cicd-enterprise-sap",
        "title": "CI/CD enterprise multi-account com CDK Pipelines",
        "icon": "🚀",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "governance-compliance-sap",
        "title": "Governance e compliance: Config, Audit Manager, Artifact",
        "icon": "📋",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "observability-enterprise",
        "title": "Observability enterprise: CloudWatch, X-Ray, OpenSearch",
        "icon": "🔭",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "cost-optimization-sap",
        "title": "Cost optimization avançado: rightsizing, purchasing, monitoring",
        "icon": "💸",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "simulado-sap-c03",
        "title": "Capstone: simulado SAP-C03 comentado",
        "icon": "🏁",
        "xp": 95,
        "readTime": 22
      }
    ]
  },
  {
    "id": "trail28",
    "name": "FinOps & Cost Engineering",
    "color": "#22c55e",
    "icon": "💰",
    "href": "/finops",
    "modules": [
      {
        "slug": "unit-economics-em-software",
        "title": "Unit economics em software: CAC, LTV, cost per request",
        "icon": "📊",
        "xp": 45,
        "readTime": 11
      },
      {
        "slug": "cost-anomaly-detection",
        "title": "Cost anomaly detection: quando alertar",
        "icon": "🚨",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "rightsizing-sem-medo",
        "title": "Rightsizing sem medo: metodologia de cortar sem quebrar",
        "icon": "✂️",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "reservas-savings-plans-spot",
        "title": "Reservas, Savings Plans e Spot: estratégia de portfolio",
        "icon": "💸",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "finops-cultura-e-time",
        "title": "FinOps cultura: team accountability + processes",
        "icon": "🤝",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "observability-de-custo",
        "title": "Observability de custo: tags, allocation, dashboards",
        "icon": "🔍",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "capstone-reducao-de-30-custo",
        "title": "Capstone: redução de 30% de custo em app real",
        "icon": "🏁",
        "xp": 85,
        "readTime": 18
      }
    ]
  },
  {
    "id": "trail29",
    "name": "Voice, Vision & Multimodal",
    "color": "#8b5cf6",
    "icon": "🎨",
    "href": "/multimodal",
    "modules": [
      {
        "slug": "multimodal-mental-model",
        "title": "Multimodal mental model: além do texto",
        "icon": "🎭",
        "xp": 45,
        "readTime": 11
      },
      {
        "slug": "speech-to-text-whisper",
        "title": "Speech-to-text: Whisper e alternativas",
        "icon": "🎤",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "text-to-speech-tts",
        "title": "Text-to-speech: ElevenLabs, OpenAI, Cartesia",
        "icon": "🔊",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "realtime-apis-voice",
        "title": "Realtime APIs: GPT-4o Realtime, conversational voice",
        "icon": "⚡",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "vision-models-claude-gpt",
        "title": "Vision models: Claude Vision, GPT-4V, Gemini",
        "icon": "👁️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "ocr-doc-intelligence",
        "title": "OCR moderno: Azure Doc Intelligence, Textract, LandingAI",
        "icon": "📄",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "capstone-voice-assistant",
        "title": "Capstone: assistente de voz end-to-end",
        "icon": "🏁",
        "xp": 90,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail30",
    "name": "AI Safety, Red Teaming & Alinhamento",
    "color": "#ef4444",
    "icon": "🔒",
    "href": "/ai-safety",
    "modules": [
      {
        "slug": "ai-safety-introducao",
        "title": "AI Safety: por que importa pra engenheiro",
        "icon": "🛡️",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "jailbreaks-prompt-injection",
        "title": "Jailbreaks e prompt injection: taxonomia e defesas",
        "icon": "🔓",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "data-exfiltration-tools",
        "title": "Data exfiltration via tools: o vetor principal em agents",
        "icon": "🕵️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "constitutional-ai-rlhf",
        "title": "Constitutional AI: Anthropic approach",
        "icon": "📜",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "guardrails-nemo-llamaguard",
        "title": "Guardrails: NeMo, Llama Guard, Claude Guardrails",
        "icon": "🚧",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "red-team-playbook",
        "title": "Red team playbook: como atacar seu próprio LLM",
        "icon": "🎯",
        "xp": 65,
        "readTime": 15
      },
      {
        "slug": "capstone-red-team-agent",
        "title": "Capstone: red team do agent próprio",
        "icon": "🏁",
        "xp": 95,
        "readTime": 22
      }
    ]
  },
  {
    "id": "trail47",
    "name": "Go Profissional",
    "color": "#00add8",
    "icon": "🐹",
    "href": "/go-profissional",
    "modules": [
      {
        "slug": "go-historia-compilador-diferencial",
        "title": "Go: história, compilador e diferencial 2026",
        "icon": "🐹",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "go-mental-model",
        "title": "Go mental model: simplicity first",
        "icon": "🎯",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "goroutines-channels",
        "title": "Goroutines e channels: concurrency model",
        "icon": "🔀",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "context-cancelation",
        "title": "Context package: cancellation, timeout, values",
        "icon": "⏱️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "interfaces-pequenas",
        "title": "Interfaces pequenas + composition",
        "icon": "🧩",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "error-handling-explicito",
        "title": "Error handling: explicit + errors.Is/As",
        "icon": "⚠️",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "generics-go",
        "title": "Generics em Go (1.18+)",
        "icon": "📐",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "go-performance-pprof",
        "title": "Go performance: pprof + escape analysis",
        "icon": "⚡",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "capstone-go-cli-api",
        "title": "Capstone: CLI tool + API Go idiomática",
        "icon": "🏁",
        "xp": 85,
        "readTime": 18
      }
    ]
  },
  {
    "id": "trail50",
    "name": "Machine Learning Clássico",
    "color": "#5b9bd5",
    "icon": "📊",
    "href": "/machine-learning",
    "modules": [
      {
        "slug": "ml-mental-model",
        "title": "ML clássico: mental model e quando usar",
        "icon": "🧠",
        "xp": 45,
        "readTime": 11
      },
      {
        "slug": "regressao-classificacao",
        "title": "Regressão e classificação na prática",
        "icon": "📈",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "feature-engineering-serio",
        "title": "Feature engineering sério",
        "icon": "🔧",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "arvores-rf-xgboost",
        "title": "Árvores: RF, XGBoost, LightGBM",
        "icon": "🌳",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "cross-validation-metricas",
        "title": "Cross-validation e métricas honestas",
        "icon": "📏",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "time-series-arima-prophet",
        "title": "Time series: ARIMA, Prophet, Neural",
        "icon": "⏱️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "recommender-systems-basico",
        "title": "Recommender systems básicos",
        "icon": "🎯",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "capstone-ml-pipeline-completo",
        "title": "Capstone: pipeline ML end-to-end",
        "icon": "🏁",
        "xp": 85,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail51",
    "name": "MLOps — ML em produção",
    "color": "#2ea5b3",
    "icon": "🔁",
    "href": "/mlops",
    "modules": [
      {
        "slug": "mlops-ciclo-completo",
        "title": "MLOps: ciclo de vida completo",
        "icon": "🔁",
        "xp": 45,
        "readTime": 11
      },
      {
        "slug": "feature-stores-feast",
        "title": "Feature stores: Feast e alternativas",
        "icon": "🗃️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "model-registry-mlflow",
        "title": "Experiment tracking + registry: MLflow",
        "icon": "📋",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "training-pipelines-kubeflow",
        "title": "Training pipelines: Airflow, Kubeflow, Prefect",
        "icon": "⚙️",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "model-serving-triton",
        "title": "Model serving: Triton, TorchServe, BentoML",
        "icon": "🚀",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "data-versioning-dvc",
        "title": "Data versioning: DVC, lakeFS",
        "icon": "📦",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "ci-cd-para-modelos",
        "title": "CI/CD para modelos + monitoring drift",
        "icon": "🚦",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "capstone-mlops-plataforma",
        "title": "Capstone: plataforma MLOps ponta a ponta",
        "icon": "🏁",
        "xp": 90,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail52",
    "name": "System Design Interview Prep",
    "color": "#ea580c",
    "icon": "🧩",
    "href": "/system-design-interview",
    "modules": [
      {
        "slug": "sd-framework-completo",
        "title": "Framework de system design interview",
        "icon": "🗺️",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "sd-back-of-envelope",
        "title": "Back-of-envelope: cálculos que convencem",
        "icon": "🧮",
        "xp": 45,
        "readTime": 11
      },
      {
        "slug": "sd-url-shortener",
        "title": "Case: URL shortener",
        "icon": "🔗",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "sd-twitter-feed",
        "title": "Case: Twitter feed / timeline",
        "icon": "🐦",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "sd-rate-limiter",
        "title": "Case: distributed rate limiter",
        "icon": "🚦",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "sd-chat-system",
        "title": "Case: chat / messaging (WhatsApp-like)",
        "icon": "💬",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "sd-notification-system",
        "title": "Case: sistema de notificações em escala",
        "icon": "🔔",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "sd-distributed-cache",
        "title": "Case: distributed cache (Redis/Memcached)",
        "icon": "⚡",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "sd-search-system",
        "title": "Case: search system (Google-like)",
        "icon": "🔍",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "capstone-sd-mock-interview",
        "title": "Capstone: mock interview completo",
        "icon": "🏁",
        "xp": 85,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail54",
    "name": "NoSQL + Vector Databases",
    "color": "#0ea5e9",
    "icon": "🗄️",
    "href": "/nosql-vector-dbs",
    "modules": [
      {
        "slug": "nosql-mental-model",
        "title": "NoSQL: mental model 2026",
        "icon": "🧩",
        "xp": 45,
        "readTime": 10
      },
      {
        "slug": "mongodb-producao",
        "title": "MongoDB em produção",
        "icon": "🍃",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "redis-avancado-serio",
        "title": "Redis além de cache: streams, pub/sub, scripts",
        "icon": "🔴",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "dynamodb-design-patterns",
        "title": "DynamoDB: single-table design",
        "icon": "⚡",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "clickhouse-analytics",
        "title": "ClickHouse: OLAP analytics de alto throughput",
        "icon": "📊",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "sqlite-embedded-moderno",
        "title": "SQLite moderno: edge, mobile e backend 2026",
        "icon": "🪨",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "vector-dbs-pgvector-pinecone",
        "title": "Vector DBs: pgvector, Pinecone, Weaviate, Qdrant",
        "icon": "🧬",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "capstone-multi-db-arquitetura",
        "title": "Capstone: arquitetura multi-DB real",
        "icon": "🏁",
        "xp": 85,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail55",
    "name": "Computer Vision Clássico",
    "color": "#10b981",
    "icon": "👁️",
    "href": "/computer-vision",
    "modules": [
      {
        "slug": "cv-basico-opencv",
        "title": "Computer vision básico com OpenCV",
        "icon": "🖼️",
        "xp": 45,
        "readTime": 11
      },
      {
        "slug": "image-processing-pipelines",
        "title": "Image processing em pipeline",
        "icon": "🔄",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "cnns-resnet-efficientnet",
        "title": "CNNs: ResNet, EfficientNet, ConvNeXt",
        "icon": "🧠",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "object-detection-yolo",
        "title": "Object detection: YOLO, DETR, RT-DETR",
        "icon": "🎯",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "segmentation-unet-sam",
        "title": "Segmentation: U-Net, Mask R-CNN, SAM",
        "icon": "✂️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "ocr-pratico",
        "title": "OCR na prática: Tesseract, PaddleOCR, TrOCR",
        "icon": "🔤",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "capstone-cv-production-pipeline",
        "title": "Capstone: pipeline CV em produção",
        "icon": "🏁",
        "xp": 85,
        "readTime": 20
      }
    ]
  },
  {
    "id": "trail-ai-rlhf-agents",
    "name": "AI Engineering Avançado: RLHF & Agents em Produção",
    "color": "#06b6d4",
    "icon": "🧬",
    "href": "/ai-rlhf-agents",
    "modules": [
      {
        "slug": "rlhf-fundamentos-ppo",
        "title": "RLHF do zero: PPO, KL penalty, reward hacking",
        "icon": "🎯",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "rlaif-anthropic-claude",
        "title": "RLAIF / Constitutional AI: como Anthropic treina o Claude",
        "icon": "🤖",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "dpo-vs-ipo-vs-kto",
        "title": "DPO vs IPO vs KTO: alinhamento sem reward model",
        "icon": "⚖️",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "grpo-deepseek-r1",
        "title": "GRPO e DeepSeek-R1: o salto reasoning de 2025",
        "icon": "🚀",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "reasoning-models-internals",
        "title": "Reasoning models por dentro: o1, o3, R1, Gemini Thinking",
        "icon": "🧠",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "agent-swarms-crewai-autogen",
        "title": "Agent swarms: CrewAI, AutoGen, OpenAI Swarm",
        "icon": "🐝",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "langgraph-state-machines",
        "title": "LangGraph: agentes como state machines (com cycles)",
        "icon": "🕸️",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "multi-agent-orchestration",
        "title": "Multi-agent orchestration patterns avançados",
        "icon": "🎼",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "agent-observability-langsmith",
        "title": "Agent observability: LangSmith, Helicone, Phoenix Arize",
        "icon": "🔭",
        "xp": 65,
        "readTime": 13
      },
      {
        "slug": "agent-evaluation-prod",
        "title": "Agent evaluation em produção: golden sets vs LLM-as-judge",
        "icon": "📏",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "agent-cost-optimization",
        "title": "Custo de agente: $/action, prompt cache, cascade routing",
        "icon": "💸",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "agent-security-prompt-injection",
        "title": "Agent security: prompt injection, jailbreak, tool abuse",
        "icon": "🛡️",
        "xp": 70,
        "readTime": 14
      }
    ]
  },
  {
    "id": "trail-diffusion-multimodal",
    "name": "Diffusion Models & Geração Multimodal",
    "color": "#ec4899",
    "icon": "🎨",
    "href": "/diffusion-multimodal",
    "modules": [
      {
        "slug": "diffusion-score-matching-math",
        "title": "Diffusion math: score matching e SDE/ODE",
        "icon": "🧮",
        "xp": 80,
        "readTime": 16
      },
      {
        "slug": "vae-unet-internals",
        "title": "VAE + U-Net: a arquitetura por trás do Stable Diffusion",
        "icon": "🏗️",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "stable-diffusion-3-flux",
        "title": "Stable Diffusion 3.5 e Flux: MMDiT e DiT por dentro",
        "icon": "⚡",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "controlnet-condicionamento",
        "title": "ControlNet: condicionamento espacial preciso",
        "icon": "🎛️",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "lora-imagem-treino",
        "title": "LoRA de imagem: treinar style/character em 30 min",
        "icon": "🎓",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "comfyui-engineering",
        "title": "ComfyUI engineering: workflow como código",
        "icon": "🔧",
        "xp": 65,
        "readTime": 13
      },
      {
        "slug": "video-generation-sora",
        "title": "Video generation: Sora, Runway Gen-4, Kling, Veo",
        "icon": "🎬",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "api-replicate-fal",
        "title": "APIs de geração: Replicate, fal.ai, RunPod, Modal",
        "icon": "🌐",
        "xp": 55,
        "readTime": 11
      },
      {
        "slug": "eval-fid-clip",
        "title": "Avaliação: FID, CLIP score, DPG-Bench, human eval",
        "icon": "📊",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "modelos-3d-mesh",
        "title": "Geração 3D: TripoSR, Stable Fast 3D, mesh do prompt",
        "icon": "🗿",
        "xp": 65,
        "readTime": 13
      }
    ]
  },
  {
    "id": "trail-local-llms-edge",
    "name": "Local LLMs & Edge AI",
    "color": "#14b8a6",
    "icon": "💻",
    "href": "/local-llms-edge",
    "modules": [
      {
        "slug": "quantizacao-gguf-awq-gptq",
        "title": "Quantização: GGUF, AWQ, GPTQ, INT8/INT4 explicados",
        "icon": "📐",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "llama-cpp-internals",
        "title": "llama.cpp internals: ggml, KV cache, FlashAttention",
        "icon": "⚙️",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "ollama-production-deploy",
        "title": "Ollama em produção: model management, Docker, monitoring",
        "icon": "🚢",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "vllm-paged-attention",
        "title": "vLLM e PagedAttention: serving high-throughput",
        "icon": "🚄",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "speculative-decoding",
        "title": "Speculative decoding: 2-3x speedup grátis",
        "icon": "🎯",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "mlx-apple-silicon",
        "title": "MLX: rodar LLM nativo em M3/M4 Apple Silicon",
        "icon": "🍎",
        "xp": 65,
        "readTime": 13
      },
      {
        "slug": "on-device-inference-mobile",
        "title": "On-device inference mobile: ExecuTorch, MediaPipe, Core ML",
        "icon": "📱",
        "xp": 65,
        "readTime": 13
      },
      {
        "slug": "rag-local-private",
        "title": "RAG 100% local e privado: LanceDB, Ollama, Qdrant local",
        "icon": "🔒",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "eval-offline-local",
        "title": "Avaliação offline: lm-eval-harness, deepeval local",
        "icon": "🧪",
        "xp": 60,
        "readTime": 12
      },
      {
        "slug": "hardware-llm-comparativo",
        "title": "Hardware LLM 2026: Mac M3 Ultra vs RTX 5090 vs DGX",
        "icon": "🔌",
        "xp": 55,
        "readTime": 11
      }
    ]
  },
  {
    "id": "trail-search-ir-deep",
    "name": "Search & Information Retrieval Profundo",
    "color": "#0ea5e9",
    "icon": "🔎",
    "href": "/search-ir-deep",
    "modules": [
      {
        "slug": "bm25-tfidf-fundamentos",
        "title": "BM25 e TF-IDF: a math da busca clássica",
        "icon": "📐",
        "xp": 65,
        "readTime": 13
      },
      {
        "slug": "elasticsearch-internals",
        "title": "Elasticsearch internals: Lucene, segments, shards, refresh",
        "icon": "🔬",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "opensearch-meilisearch-typesense",
        "title": "OpenSearch vs Meilisearch vs Typesense: qual escolher",
        "icon": "⚖️",
        "xp": 65,
        "readTime": 13
      },
      {
        "slug": "hybrid-search-rerank",
        "title": "Hybrid search + reranking: BM25 + dense + cross-encoder",
        "icon": "🎯",
        "xp": 75,
        "readTime": 15
      },
      {
        "slug": "embeddings-busca-bge",
        "title": "Embeddings de busca: BGE-M3, e5, Voyage, Cohere v3",
        "icon": "🧬",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "semantic-search-prod",
        "title": "Semantic search em produção: indexing, sharding, freshness",
        "icon": "🚢",
        "xp": 70,
        "readTime": 14
      },
      {
        "slug": "vector-dbs-comparados",
        "title": "Vector DBs em 2026: Qdrant, Weaviate, Pinecone, pgvector",
        "icon": "🗄️",
        "xp": 65,
        "readTime": 13
      },
      {
        "slug": "search-eval-mrr-ndcg",
        "title": "Avaliação de busca: MRR, NDCG, P@K, golden datasets",
        "icon": "📊",
        "xp": 65,
        "readTime": 13
      }
    ]
  },
  {
    "id": "trail-aws-aif",
    "name": "AWS AI Practitioner (AIF-C01)",
    "color": "#ff9900",
    "icon": "🤖",
    "href": "/aws-aif-c01",
    "modules": [
      {
        "slug": "aif-intro",
        "title": "AIF-C01 — Visão geral e blueprint do exame",
        "icon": "🤖",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "aif-ai-ml-fundamentos",
        "title": "AI / ML / DL / GenAI — distinções fundamentais",
        "icon": "🧠",
        "xp": 70,
        "readTime": 18
      },
      {
        "slug": "aif-sagemaker-overview",
        "title": "SageMaker — Studio, Canvas, JumpStart, AI Services",
        "icon": "🏭",
        "xp": 80,
        "readTime": 22
      },
      {
        "slug": "aif-genai-conceitos",
        "title": "GenAI — Transformers, FMs, prompting, hallucinations",
        "icon": "✨",
        "xp": 90,
        "readTime": 25
      },
      {
        "slug": "aif-bedrock-overview",
        "title": "Amazon Bedrock — modelos, invocação e pricing",
        "icon": "🪨",
        "xp": 100,
        "readTime": 25
      },
      {
        "slug": "aif-bedrock-knowledge-bases",
        "title": "Bedrock Knowledge Bases — RAG gerenciado",
        "icon": "📚",
        "xp": 90,
        "readTime": 22
      },
      {
        "slug": "aif-bedrock-agents",
        "title": "Bedrock Agents — orquestração multi-step",
        "icon": "🛠️",
        "xp": 90,
        "readTime": 22
      },
      {
        "slug": "aif-prompt-engineering",
        "title": "Prompt engineering em produção (AWS edition)",
        "icon": "✍️",
        "xp": 100,
        "readTime": 25
      },
      {
        "slug": "aif-responsible-ai",
        "title": "Responsible AI — bias, fairness, transparency, Guardrails",
        "icon": "⚖️",
        "xp": 110,
        "readTime": 28
      },
      {
        "slug": "aif-security-governance",
        "title": "Security & Governance para AI workloads",
        "icon": "🛡️",
        "xp": 120,
        "readTime": 30
      },
      {
        "slug": "aif-fine-tuning-eval",
        "title": "Customization & Evaluation — fine-tune, CPT, model eval",
        "icon": "🎯",
        "xp": 100,
        "readTime": 25
      },
      {
        "slug": "aif-mlops-monitoramento",
        "title": "MLOps & Monitoramento — SageMaker Pipelines, Model Monitor, observabilidade Bedrock",
        "icon": "📈",
        "xp": 110,
        "readTime": 28
      },
      {
        "slug": "aif-simulado-final",
        "title": "Estratégia de prova + simulado AIF-C01",
        "icon": "🏁",
        "xp": 80,
        "readTime": 15
      }
    ]
  },
  {
    "id": "trail-mla",
    "name": "AWS ML Engineer Associate (MLA-C01)",
    "color": "#ff9900",
    "icon": "🎓",
    "href": "/aws-mla-c01",
    "modules": [
      {
        "slug": "mla-intro",
        "title": "MLA-C01 — domínios, pesos e a régua que responde metade das questões",
        "icon": "🎓",
        "xp": 50,
        "readTime": 10
      },
      {
        "slug": "mla-ingestao-dados",
        "title": "Ingestão e armazenamento: onde o dado mora decide o custo do treino",
        "icon": "🗄️",
        "xp": 65,
        "readTime": 10
      },
      {
        "slug": "mla-transformacao-features",
        "title": "Transformação e atributos: o defeito que nenhum ajuste de modelo conserta",
        "icon": "🧪",
        "xp": 70,
        "readTime": 11
      },
      {
        "slug": "mla-feature-store",
        "title": "Feature Store: a divergência entre treino e serviço",
        "icon": "🏪",
        "xp": 70,
        "readTime": 10
      },
      {
        "slug": "mla-qualidade-vies-dados",
        "title": "Desbalanceamento e viés: quando 99% de acurácia é um modelo inútil",
        "icon": "⚖️",
        "xp": 70,
        "readTime": 10
      },
      {
        "slug": "mla-escolha-modelo",
        "title": "Serviço pronto, Bedrock, JumpStart ou script próprio: a escada",
        "icon": "🪜",
        "xp": 65,
        "readTime": 10
      },
      {
        "slug": "mla-treinamento-sagemaker",
        "title": "Infraestrutura de treinamento: spot, checkpoint e a GPU ociosa",
        "icon": "⚙️",
        "xp": 70,
        "readTime": 10
      },
      {
        "slug": "mla-tuning-avaliacao",
        "title": "Ajuste de hiperparâmetros e avaliação honesta",
        "icon": "🎚️",
        "xp": 70,
        "readTime": 10
      },
      {
        "slug": "mla-implantacao-inferencia",
        "title": "Os quatro modos de inferência e a árvore de três perguntas",
        "icon": "🚀",
        "xp": 75,
        "readTime": 11
      },
      {
        "slug": "mla-pipelines-orquestracao",
        "title": "Pipelines, Model Registry e o passo de condição",
        "icon": "🔗",
        "xp": 75,
        "readTime": 10
      },
      {
        "slug": "mla-monitoramento-drift",
        "title": "Deriva: a falha que não gera erro",
        "icon": "📉",
        "xp": 75,
        "readTime": 11
      },
      {
        "slug": "mla-seguranca-governanca",
        "title": "Segurança e governança: VPC não basta, e KMS é a segunda autorização",
        "icon": "🔐",
        "xp": 75,
        "readTime": 10
      },
      {
        "slug": "mla-estrategia-prova",
        "title": "Estratégia de prova: os cinco padrões de enunciado",
        "icon": "🏁",
        "xp": 60,
        "readTime": 10
      }
    ]
  },
  {
    "id": "trail-bedrock",
    "name": "AWS Bedrock — GenAI em Produção",
    "color": "#ff9900",
    "icon": "🪨",
    "href": "/aws-bedrock",
    "modules": [
      {
        "slug": "bedrock-o-que-e-e-por-que",
        "title": "O que é o Amazon Bedrock (e por que ele existe)",
        "icon": "🪨",
        "xp": 35,
        "readTime": 9
      },
      {
        "slug": "bedrock-vs-api-direta-quando-usar",
        "title": "Bedrock vs API direta: quando usar cada um",
        "icon": "⚖️",
        "xp": 45,
        "readTime": 11
      },
      {
        "slug": "bedrock-primeira-chamada-converse",
        "title": "Sua primeira chamada: a Converse API na prática",
        "icon": "👋",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "bedrock-modalidades-texto-imagem-doc-video",
        "title": "Além do texto: imagem, documento, vídeo e áudio",
        "icon": "🖼️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "bedrock-catalogo-modelos-qual-escolher",
        "title": "O catálogo de modelos: qual escolher para cada caso",
        "icon": "🗂️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "bedrock-prompt-engineering",
        "title": "Engenharia de prompt no Bedrock: o que muda entre Nova, Claude e Llama",
        "icon": "✍️",
        "xp": 55,
        "readTime": 11
      },
      {
        "slug": "bedrock-reasoning-converse",
        "title": "Reasoning na Converse: quando pensar mais vale o token",
        "icon": "🤔",
        "xp": 60,
        "readTime": 8
      },
      {
        "slug": "bedrock-tool-use-function-calling",
        "title": "Tool use: dando ferramentas ao modelo (function calling)",
        "icon": "🔧",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "bedrock-knowledge-bases-rag",
        "title": "Knowledge Bases: RAG gerenciado de ponta a ponta",
        "icon": "📚",
        "xp": 65,
        "readTime": 15
      },
      {
        "slug": "bedrock-agents-agentcore",
        "title": "Agents e AgentCore: agents de IA em produção",
        "icon": "🤖",
        "xp": 70,
        "readTime": 16
      },
      {
        "slug": "bedrock-mcp-fundamentos",
        "title": "MCP: o protocolo que o AgentCore Gateway fala",
        "icon": "🔌",
        "xp": 65,
        "readTime": 8
      },
      {
        "slug": "bedrock-agentcore-gateway-producao",
        "title": "AgentCore Gateway em produção: identidade, rastro, escala e custo",
        "icon": "🛡️",
        "xp": 75,
        "readTime": 9
      },
      {
        "slug": "bedrock-guardrails-seguranca-ia",
        "title": "Guardrails: segurança e responsible AI",
        "icon": "🛡️",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "bedrock-flows-prompt-management-routing",
        "title": "Flows, Prompt Management e Intelligent Routing",
        "icon": "🔀",
        "xp": 55,
        "readTime": 13
      },
      {
        "slug": "bedrock-data-automation-e-customizacao",
        "title": "Data Automation e customização de modelos",
        "icon": "🏭",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "bedrock-precos-e-cobranca",
        "title": "Preços e cobrança: como o Bedrock cobra de você",
        "icon": "💰",
        "xp": 50,
        "readTime": 12
      },
      {
        "slug": "bedrock-finops-roi-controle-de-custo",
        "title": "FinOps e ROI: controlar custo e provar retorno",
        "icon": "📊",
        "xp": 60,
        "readTime": 14
      },
      {
        "slug": "bedrock-arquiteturas-e-cases-reais",
        "title": "Arquiteturas de referência e cases reais",
        "icon": "🏗️",
        "xp": 70,
        "readTime": 16
      },
      {
        "slug": "bedrock-arquitetura-referencia-ia-corporativa",
        "title": "A arquitetura de referência de IA corporativa sobre Bedrock",
        "icon": "🏛️",
        "xp": 80,
        "readTime": 20
      },
      {
        "slug": "bedrock-claude-na-aws-ecossistema",
        "title": "Claude na AWS: os quatro caminhos e onde cada um encaixa",
        "icon": "⊕",
        "xp": 65,
        "readTime": 15
      },
      {
        "slug": "bedrock-servicos-ia-especializada",
        "title": "Serviços que somam ao Bedrock I: IA especializada e ML clássico",
        "icon": "🎯",
        "xp": 80,
        "readTime": 20
      },
      {
        "slug": "bedrock-servicos-seguranca-conformidade",
        "title": "Serviços que somam ao Bedrock II: segurança, identidade e conformidade",
        "icon": "🛡️",
        "xp": 80,
        "readTime": 21
      },
      {
        "slug": "bedrock-servicos-observabilidade-finops",
        "title": "Serviços que somam ao Bedrock III: observabilidade, FinOps e entrega",
        "icon": "📈",
        "xp": 80,
        "readTime": 21
      },
      {
        "slug": "bedrock-servicos-canais-borda",
        "title": "Serviços que somam ao Bedrock IV: canais e borda",
        "icon": "🔌",
        "xp": 80,
        "readTime": 20
      },
      {
        "slug": "bedrock-servicos-compute-orquestracao",
        "title": "Serviços que somam ao Bedrock V: compute, orquestração e estado",
        "icon": "⚙️",
        "xp": 80,
        "readTime": 22
      },
      {
        "slug": "bedrock-servicos-dados-retrieval",
        "title": "Serviços que somam ao Bedrock VI: dados, retrieval e conhecimento",
        "icon": "🗄️",
        "xp": 80,
        "readTime": 20
      },
      {
        "slug": "bedrock-rag-producao-padroes",
        "title": "RAG de produção: os padrões que separam demo de sistema",
        "icon": "🔎",
        "xp": 80,
        "readTime": 20
      },
      {
        "slug": "bedrock-tool-use-producao",
        "title": "Tool use profissional: desenhar o contrato entre modelo e sistema",
        "icon": "🛠️",
        "xp": 75,
        "readTime": 18
      },
      {
        "slug": "bedrock-padroes-agenticos",
        "title": "Padrões agênticos e context engineering",
        "icon": "♟️",
        "xp": 80,
        "readTime": 19
      },
      {
        "slug": "bedrock-evals-qualidade-producao",
        "title": "Evals: como saber se está bom (e como trocar de modelo sem medo)",
        "icon": "🧪",
        "xp": 75,
        "readTime": 18
      },
      {
        "slug": "bedrock-playbook-reducao-custo",
        "title": "Playbook de redução de custo: 14 alavancas em ordem de aplicação",
        "icon": "✂️",
        "xp": 85,
        "readTime": 21
      },
      {
        "slug": "bedrock-catalogo-cases-setor",
        "title": "Catálogo de cases por setor: quem faz o quê, com qual padrão",
        "icon": "🗺️",
        "xp": 70,
        "readTime": 17
      },
      {
        "slug": "bedrock-case-atendimento-inteligente",
        "title": "Case visual: atendimento inteligente ponta a ponta",
        "icon": "🎧",
        "xp": 70,
        "readTime": 16
      },
      {
        "slug": "bedrock-case-documentos-setor-regulado",
        "title": "Case visual: documentos em setor regulado (IDP)",
        "icon": "📄",
        "xp": 70,
        "readTime": 16
      },
      {
        "slug": "bedrock-case-copiloto-interno-engenharia",
        "title": "Case visual: copiloto interno e agents de engenharia",
        "icon": "🧭",
        "xp": 70,
        "readTime": 16
      },
      {
        "slug": "aws-ia-100-solucoes",
        "title": "100 soluções de IA na AWS: problema, arquitetura e a decisão que ensina",
        "icon": "🗂️",
        "xp": 90,
        "readTime": 24
      }
    ]
  },
  {
    "id": "trail-arq-ia-aws",
    "name": "100 Arquiteturas de IA na AWS",
    "color": "#01a88d",
    "icon": "🧱",
    "href": "/arquiteturas-ia-aws",
    "modules": [
      {
        "slug": "arq-ia-aws-atendimento",
        "title": "10 arquiteturas de IA para atendimento ao cliente",
        "icon": "🎧",
        "xp": 80,
        "readTime": 21
      },
      {
        "slug": "arq-ia-aws-documentos",
        "title": "10 arquiteturas de extração inteligente de documentos",
        "icon": "📄",
        "xp": 80,
        "readTime": 21
      },
      {
        "slug": "arq-ia-aws-busca",
        "title": "10 arquiteturas de busca e conhecimento interno (RAG)",
        "icon": "🔎",
        "xp": 80,
        "readTime": 21
      },
      {
        "slug": "arq-ia-aws-agentes",
        "title": "10 arquiteturas de agentes que agem em produção",
        "icon": "🤖",
        "xp": 85,
        "readTime": 22
      },
      {
        "slug": "arq-ia-aws-copiloto",
        "title": "10 arquiteturas de copiloto interno e produtividade",
        "icon": "🧭",
        "xp": 80,
        "readTime": 20
      },
      {
        "slug": "arq-ia-aws-dados",
        "title": "10 arquiteturas de dados, analytics e BI conversacional",
        "icon": "📊",
        "xp": 80,
        "readTime": 20
      },
      {
        "slug": "arq-ia-aws-conteudo",
        "title": "10 arquiteturas de conteúdo, mídia e personalização",
        "icon": "🎬",
        "xp": 80,
        "readTime": 20
      },
      {
        "slug": "arq-ia-aws-risco",
        "title": "10 arquiteturas de risco, fraude e conformidade",
        "icon": "🛡️",
        "xp": 85,
        "readTime": 21
      },
      {
        "slug": "arq-ia-aws-plataforma",
        "title": "10 arquiteturas de plataforma de IA corporativa",
        "icon": "🏛️",
        "xp": 85,
        "readTime": 20
      },
      {
        "slug": "arq-ia-aws-operacao",
        "title": "10 arquiteturas de operação e segurança de IA",
        "icon": "🚨",
        "xp": 85,
        "readTime": 21
      }
    ]
  },
  {
    "id": "trail-labs-aws",
    "name": "100 Laboratórios de Arquitetura AWS",
    "color": "#fb923c",
    "icon": "🧪",
    "href": "/exemplos-arquitetura-aws",
    "modules": [
      {
        "slug": "lab-app-web-ecs-fargate-rds",
        "title": "Lab 01 — App .NET 8 no ECS Fargate com RDS e CloudFront",
        "icon": "🚀",
        "xp": 130,
        "readTime": 38
      },
      {
        "slug": "lab-rede-vpc-subrede-privada-nat",
        "title": "Lab 02 — A rede por baixo: por que o banco não tem rota para a internet",
        "icon": "🕸️",
        "xp": 120,
        "readTime": 32
      },
      {
        "slug": "lab-deploy-ecr-rolling-update-drenagem",
        "title": "Lab 03 — Da imagem ao deploy sem indisponibilidade: ECR, rolling update e drenagem",
        "icon": "🔁",
        "xp": 125,
        "readTime": 35
      },
      {
        "slug": "lab-segredo-secrets-manager-rotacao",
        "title": "Lab 04 — Segredo fora do código, com rotação que não derruba a aplicação",
        "icon": "🔐",
        "xp": 125,
        "readTime": 36
      },
      {
        "slug": "lab-dominio-tls-cloudfront-estatico",
        "title": "Lab 05 — Domínio, TLS e o estático na borda",
        "icon": "🌐",
        "xp": 125,
        "readTime": 38
      },
      {
        "slug": "lab-escala-automatica-ecs-metrica",
        "title": "Lab 06 — Escalar quando chega gente de verdade",
        "icon": "📈",
        "xp": 135,
        "readTime": 38
      },
      {
        "slug": "lab-banco-replica-multiaz-pool",
        "title": "Lab 07 — O banco sob carga: réplica, Multi-AZ e o pool",
        "icon": "🗄️",
        "xp": 135,
        "readTime": 38
      },
      {
        "slug": "lab-observabilidade-trace-correlacao",
        "title": "Lab 08 — Enxergar o que quebrou",
        "icon": "🔍",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-custo-tags-orcamento-rateio",
        "title": "Lab 09 — A conta no fim do mês desta arquitetura",
        "icon": "💰",
        "xp": 130,
        "readTime": 37
      },
      {
        "slug": "lab-restauracao-ensaiada-rto-rpo",
        "title": "Lab 10 — Voltar de um desastre, com ensaio",
        "icon": "⏮️",
        "xp": 135,
        "readTime": 38
      },
      {
        "slug": "lab-api-gateway-cota-versao-ou-alb",
        "title": "Lab 11 — API Gateway na frente, ou ALB direto?",
        "icon": "🚪",
        "xp": 130,
        "readTime": 36
      },
      {
        "slug": "lab-autenticacao-cognito-sessao-sem-estado",
        "title": "Lab 12 — Autenticação e sessão que não guardam o que não devem",
        "icon": "🔑",
        "xp": 130,
        "readTime": 35
      },
      {
        "slug": "lab-cache-redis-invalidacao-p95",
        "title": "Lab 13 — Cache que salva o banco, e a invalidação que quebra tudo",
        "icon": "⚡",
        "xp": 130,
        "readTime": 36
      },
      {
        "slug": "lab-escolher-banco-pela-carga",
        "title": "Lab 14 — Escolher o banco pela carga, no mesmo caso de uso",
        "icon": "⚖️",
        "xp": 135,
        "readTime": 38
      },
      {
        "slug": "lab-aurora-serverless-v2-endpoint-failover",
        "title": "Lab 15 — Aurora de verdade: endpoint, Serverless v2 e failover",
        "icon": "🌊",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-dynamodb-modelagem-tabela-unica",
        "title": "Lab 16 — DynamoDB para quem vem do SQL",
        "icon": "🗂️",
        "xp": 135,
        "readTime": 36
      },
      {
        "slug": "lab-upload-direto-s3-url-assinada",
        "title": "Lab 17 — Upload sem passar pela aplicação",
        "icon": "📤",
        "xp": 130,
        "readTime": 37
      },
      {
        "slug": "lab-migration-expand-contract-sem-janela",
        "title": "Lab 18 — Migrar schema em produção sem parar",
        "icon": "🧬",
        "xp": 140,
        "readTime": 39
      },
      {
        "slug": "lab-busca-catalogo-opensearch-vs-like",
        "title": "Lab 19 — Busca no catálogo: LIKE até onde?",
        "icon": "🔎",
        "xp": 130,
        "readTime": 36
      },
      {
        "slug": "lab-spa-na-borda-ou-ssr-no-conteiner",
        "title": "Lab 20 — SPA na borda ou SSR no contêiner",
        "icon": "🖥️",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-lambda-dotnet8-cold-start",
        "title": "Lab 21 — Primeira Lambda .NET 8, e o cold start",
        "icon": "❄️",
        "xp": 125,
        "readTime": 35
      },
      {
        "slug": "lab-fila-sqs-dlq-idempotencia",
        "title": "Lab 22 — Fila que absorve pico, com DLQ e idempotência",
        "icon": "📬",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-fanout-sns-sqs-multiplos-consumidores",
        "title": "Lab 23 — Fanout: um evento, vários interessados",
        "icon": "📡",
        "xp": 130,
        "readTime": 35
      },
      {
        "slug": "lab-eventbridge-espinha-dorsal",
        "title": "Lab 24 — EventBridge como espinha dorsal",
        "icon": "🕸️",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-step-functions-orquestracao-ou-codigo",
        "title": "Lab 25 — Orquestrar com Step Functions, ou no código?",
        "icon": "🧩",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-api-serverless-onde-nao-serve",
        "title": "Lab 26 — API 100% serverless, e onde ela não serve",
        "icon": "🧮",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-eventbridge-scheduler-sem-ec2-cron",
        "title": "Lab 27 — Agendamento sem a EC2 do cron",
        "icon": "⏰",
        "xp": 125,
        "readTime": 35
      },
      {
        "slug": "lab-pipeline-s3-evento-processamento",
        "title": "Lab 28 — Processar o arquivo que acabou de chegar",
        "icon": "📥",
        "xp": 130,
        "readTime": 36
      },
      {
        "slug": "lab-streaming-mudanca-dynamodb-streams",
        "title": "Lab 29 — Streaming de mudança do banco",
        "icon": "🌊",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-limites-serverless-medidos",
        "title": "Lab 30 — Os limites do serverless, medidos",
        "icon": "📏",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-extrair-servico-fronteira-transacao",
        "title": "Lab 31 — Quebrar o monolito pelo corte certo",
        "icon": "🔪",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-sincrono-ou-assincrono-entre-servicos",
        "title": "Lab 32 — Síncrono ou assíncrono entre serviços",
        "icon": "🔗",
        "xp": 140,
        "readTime": 37
      },
      {
        "slug": "lab-descoberta-servico-connect-lattice",
        "title": "Lab 33 — Descoberta e malha: Service Connect, VPC Lattice ou nada",
        "icon": "🧭",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-eks-quando-ecs-nao-basta",
        "title": "Lab 34 — EKS quando ECS não basta: o que muda de verdade",
        "icon": "☸️",
        "xp": 145,
        "readTime": 39
      },
      {
        "slug": "lab-saga-transacao-distribuida-compensacao",
        "title": "Lab 35 — Saga: transação distribuída sem 2PC",
        "icon": "🔄",
        "xp": 150,
        "readTime": 40
      },
      {
        "slug": "lab-retry-backoff-jitter-circuit-breaker-polly",
        "title": "Lab 36 — Retry, backoff, jitter e circuit breaker no .NET",
        "icon": "🔁",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-consistencia-eventual-ponto-de-vista-usuario",
        "title": "Lab 37 — Consistência eventual do ponto de vista do usuário",
        "icon": "⏳",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-multi-tenant-linha-schema-conta",
        "title": "Lab 38 — Multi-tenant: linha, schema ou conta",
        "icon": "🏢",
        "xp": 150,
        "readTime": 40
      },
      {
        "slug": "lab-blue-green-canario-codedeploy-ecs",
        "title": "Lab 39 — Blue/green e canário no ECS",
        "icon": "🔵",
        "xp": 145,
        "readTime": 39
      },
      {
        "slug": "lab-teste-de-carga-gargalo-real",
        "title": "Lab 40 — Teste de carga e o gargalo real",
        "icon": "📊",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-iam-policy-menor-privilegio-auditoria",
        "title": "Lab 41 — Da policy `*` à policy que passa auditoria",
        "icon": "🛡️",
        "xp": 140,
        "readTime": 39
      },
      {
        "slug": "lab-identidade-workload-task-role-irsa",
        "title": "Lab 42 — Identidade de workload: task role, execution role, IRSA",
        "icon": "🪪",
        "xp": 140,
        "readTime": 37
      },
      {
        "slug": "lab-multi-conta-organizations-scp-control-tower",
        "title": "Lab 43 — Multi-conta: OU, SCP e Control Tower",
        "icon": "🏛️",
        "xp": 150,
        "readTime": 40
      },
      {
        "slug": "lab-endpoint-vpc-privatelink-sem-nat",
        "title": "Lab 44 — Rede privada de verdade: o NAT que você não precisa",
        "icon": "🔒",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-rede-hibrida-vpn-direct-connect-transit-gateway",
        "title": "Lab 45 — Rede híbrida: VPN, Direct Connect e Transit Gateway",
        "icon": "🌉",
        "xp": 150,
        "readTime": 40
      },
      {
        "slug": "lab-kms-envelope-cmk-rotacao",
        "title": "Lab 46 — Criptografia: KMS, envelope, CMK e rotação",
        "icon": "🔏",
        "xp": 145,
        "readTime": 39
      },
      {
        "slug": "lab-waf-shield-bloqueio-na-borda",
        "title": "Lab 47 — WAF e Shield: barrar antes de custar computação",
        "icon": "🚧",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-deteccao-guardduty-security-hub-config",
        "title": "Lab 48 — Detecção: GuardDuty, Security Hub, Config",
        "icon": "🚨",
        "xp": 145,
        "readTime": 39
      },
      {
        "slug": "lab-dado-pessoal-minimizar-mascarar-macie",
        "title": "Lab 49 — Dado pessoal: minimizar, mascarar, não logar",
        "icon": "🕵️",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-resposta-incidente-blast-radius",
        "title": "Lab 50 — Resposta a incidente e blast radius",
        "icon": "🧯",
        "xp": 155,
        "readTime": 41
      },
      {
        "slug": "lab-opentelemetry-tres-pilares-dotnet",
        "title": "Lab 51 — Os três pilares no .NET com OpenTelemetry",
        "icon": "🎛️",
        "xp": 145,
        "readTime": 39
      },
      {
        "slug": "lab-slo-error-budget-alarme-acionavel",
        "title": "Lab 52 — SLO, error budget e alarme que acorda alguém",
        "icon": "📟",
        "xp": 145,
        "readTime": 39
      },
      {
        "slug": "lab-dashboard-pergunta-operacional",
        "title": "Lab 53 — Dashboard que responde pergunta de operação",
        "icon": "📺",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-pipeline-cicd-oidc-sem-chave",
        "title": "Lab 54 — Pipeline: CodePipeline ou GitHub Actions com OIDC",
        "icon": "🔗",
        "xp": 145,
        "readTime": 38
      },
      {
        "slug": "lab-terraform-modulo-estado-remoto-drift",
        "title": "Lab 55 — Terraform em módulo, com estado remoto e drift",
        "icon": "🧱",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-ambiente-por-conta-sem-copiar-colar",
        "title": "Lab 56 — Um ambiente por conta, sem copiar e colar",
        "icon": "📋",
        "xp": 145,
        "readTime": 39
      },
      {
        "slug": "lab-chaos-derrubar-az-fis",
        "title": "Lab 57 — Chaos: derrubar uma AZ de propósito",
        "icon": "💥",
        "xp": 150,
        "readTime": 40
      },
      {
        "slug": "lab-dr-multiregiao-quatro-estrategias",
        "title": "Lab 58 — DR multi-região: as quatro estratégias",
        "icon": "🌍",
        "xp": 155,
        "readTime": 41
      },
      {
        "slug": "lab-finops-rightsizing-antes-compromisso",
        "title": "Lab 59 — FinOps: medir antes de comprar compromisso",
        "icon": "💵",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-well-architected-review-seis-pilares",
        "title": "Lab 60 — Well-Architected review da sua própria arquitetura",
        "icon": "🏆",
        "xp": 150,
        "readTime": 40
      },
      {
        "slug": "lab-operacional-analitico-extracao-incremental",
        "title": "Lab 61 — Do operacional ao analítico: por que não consultar a produção",
        "icon": "🔀",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-data-lake-bronze-prata-ouro",
        "title": "Lab 62 — Data lake em camadas: bronze, prata, ouro",
        "icon": "🥇",
        "xp": 145,
        "readTime": 39
      },
      {
        "slug": "lab-kinesis-shard-ordem-reprocesso",
        "title": "Lab 63 — Ingestão em streaming: shard, ordem e reprocesso",
        "icon": "🌀",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-parquet-particao-arquivo-pequeno",
        "title": "Lab 64 — Entrega e formato: Parquet, partição, arquivo pequeno",
        "icon": "🗃️",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-glue-catalog-crawler-job-idempotente",
        "title": "Lab 65 — Catálogo e ETL: Glue Catalog, crawler, job",
        "icon": "📇",
        "xp": 135,
        "readTime": 37
      },
      {
        "slug": "lab-athena-consulta-barata-workgroup",
        "title": "Lab 66 — Consultar o lake e pagar pouco: Athena",
        "icon": "💸",
        "xp": 140,
        "readTime": 38
      },
      {
        "slug": "lab-iceberg-upsert-time-travel",
        "title": "Lab 67 — Lakehouse: Iceberg, upsert e time travel",
        "icon": "🧊",
        "xp": 260,
        "readTime": 26
      },
      {
        "slug": "lab-redshift-dashboard-lento",
        "title": "Lab 68 — Redshift quando o BI dói",
        "icon": "📊",
        "xp": 150,
        "readTime": 42
      },
      {
        "slug": "lab-lake-formation-permissao-coluna",
        "title": "Lab 69 — Governança do lake: permissão por coluna",
        "icon": "🔐",
        "xp": 220,
        "readTime": 26
      },
      {
        "slug": "lab-qualidade-dado-contrato-quarentena",
        "title": "Lab 70 — Qualidade de dado: contrato e quarentena",
        "icon": "🛃",
        "xp": 145,
        "readTime": 39
      },
      {
        "slug": "lab-regra-ou-modelo-baseline",
        "title": "Lab 71 — Quando ML resolve, e quando uma regra resolve melhor",
        "icon": "⚖️",
        "xp": 130,
        "readTime": 36
      },
      {
        "slug": "lab-feature-store-treino-inferencia",
        "title": "Lab 72 — Feature store: o mesmo cálculo no treino e na inferência",
        "icon": "🧬",
        "xp": 155,
        "readTime": 42
      },
      {
        "slug": "lab-sagemaker-treino-experimento-rastreavel",
        "title": "Lab 73 — Treinar no SageMaker AI com experimento rastreável",
        "icon": "🔬",
        "xp": 155,
        "readTime": 44
      },
      {
        "slug": "lab-servir-modelo-quatro-modos-inferencia",
        "title": "Lab 74 — Servir: tempo real, serverless, assíncrono ou lote",
        "icon": "🚦",
        "xp": 175,
        "readTime": 42
      },
      {
        "slug": "lab-model-registry-promocao-rollback",
        "title": "Lab 75 — Registry e promoção com rollback",
        "icon": "↩️",
        "xp": 145,
        "readTime": 38
      },
      {
        "slug": "lab-pipeline-ml-ponta-a-ponta",
        "title": "Lab 76 — Pipeline de ML de ponta a ponta",
        "icon": "🔗",
        "xp": 150,
        "readTime": 39
      },
      {
        "slug": "lab-drift-dado-conceito-model-monitor",
        "title": "Lab 77 — Drift: descobrir antes do negócio reclamar",
        "icon": "📉",
        "xp": 150,
        "readTime": 26
      },
      {
        "slug": "lab-metrica-modelo-vs-negocio",
        "title": "Lab 78 — Avaliação honesta: métrica de modelo ≠ de negócio",
        "icon": "🎯",
        "xp": 190,
        "readTime": 28
      },
      {
        "slug": "lab-consumir-modelo-dotnet-fallback",
        "title": "Lab 79 — Consumir o modelo do .NET com fallback",
        "icon": "🛟",
        "xp": 155,
        "readTime": 35
      },
      {
        "slug": "lab-custo-ml-onde-vaza",
        "title": "Lab 80 — Custo de ML: onde o dinheiro vaza",
        "icon": "💧",
        "xp": 170,
        "readTime": 40
      },
      {
        "slug": "lab-bedrock-primeira-chamada-dotnet",
        "title": "Lab 81 — Primeira chamada ao Bedrock do .NET 8",
        "icon": "🪨",
        "xp": 170,
        "readTime": 31
      },
      {
        "slug": "lab-prompt-versionado-teste-regressao",
        "title": "Lab 82 — Prompt em produção não é configuração",
        "icon": "📝",
        "xp": 140,
        "readTime": 34
      },
      {
        "slug": "lab-rag-minimo-com-citacao",
        "title": "Lab 83 — RAG mínimo que funciona, com citação",
        "icon": "📚",
        "xp": 175,
        "readTime": 33
      },
      {
        "slug": "lab-onde-guardar-vetor-quatro-opcoes",
        "title": "Lab 84 — Onde guardar vetor: quatro opções, uma decisão",
        "icon": "🗄️",
        "xp": 190,
        "readTime": 31
      },
      {
        "slug": "lab-recuperacao-hibrida-reranking",
        "title": "Lab 85 — Recuperação híbrida e reranking",
        "icon": "🔍",
        "xp": 195,
        "readTime": 36
      },
      {
        "slug": "lab-guardrails-limite-do-controle",
        "title": "Lab 86 — Guardrails: o que protege e o que não protege",
        "icon": "🛡️",
        "xp": 165,
        "readTime": 38
      },
      {
        "slug": "lab-agente-com-ferramenta-quem-executa",
        "title": "Lab 87 — Agente com ferramenta: quem executa é o seu código",
        "icon": "🤖",
        "xp": 220,
        "readTime": 39
      },
      {
        "slug": "lab-avaliar-sistema-llm-juiz",
        "title": "Lab 88 — Avaliar sistema com LLM: golden set e juiz",
        "icon": "⚖️",
        "xp": 200,
        "readTime": 35
      },
      {
        "slug": "lab-custo-latencia-genai",
        "title": "Lab 89 — Custo e latência de GenAI",
        "icon": "📶",
        "xp": 185,
        "readTime": 34
      },
      {
        "slug": "lab-prompt-injection-vazamento-inquilinos",
        "title": "Lab 90 — Prompt injection e vazamento entre inquilinos",
        "icon": "🕵️",
        "xp": 230,
        "readTime": 41
      },
      {
        "slug": "lab-atendimento-voz-prazo-escalonamento",
        "title": "Lab 91 — Atendimento com voz, prazo de resposta e saída para humano",
        "icon": "🎙️",
        "xp": 225,
        "readTime": 41
      },
      {
        "slug": "lab-idp-extracao-confianca-revisao-humana",
        "title": "Lab 92 — IDP: documento → extração → interpretação → revisão humana",
        "icon": "🧾",
        "xp": 235,
        "readTime": 34
      },
      {
        "slug": "lab-copiloto-interno-permissao-por-fonte",
        "title": "Lab 93 — Copiloto interno com permissão por fonte",
        "icon": "🗝️",
        "xp": 235,
        "readTime": 38
      },
      {
        "slug": "lab-busca-produto-hibrida-rerank-geracao",
        "title": "Lab 94 — Busca de produto com IA: híbrida, rerank e geração",
        "icon": "🛍️",
        "xp": 225,
        "readTime": 36
      },
      {
        "slug": "lab-enriquecimento-lote-acervo",
        "title": "Lab 95 — Enriquecimento em lote do acervo",
        "icon": "📦",
        "xp": 220,
        "readTime": 39
      },
      {
        "slug": "lab-agente-diagnostica-incidente-somente-leitura",
        "title": "Lab 96 — Agente de operação que diagnostica incidente",
        "icon": "🔦",
        "xp": 225,
        "readTime": 35
      },
      {
        "slug": "lab-trilha-imutavel-decisao-automatizada",
        "title": "Lab 97 — Risco e conformidade de decisão automatizada",
        "icon": "⚖️",
        "xp": 245,
        "readTime": 37
      },
      {
        "slug": "lab-plataforma-ia-multi-time-cota-chargeback",
        "title": "Lab 98 — Plataforma de IA multi-time com cota e chargeback",
        "icon": "🏢",
        "xp": 230,
        "readTime": 36
      },
      {
        "slug": "lab-multi-regiao-ia-residencia-de-dado",
        "title": "Lab 99 — Multi-região para IA: onde o modelo existe, onde o dado pode estar",
        "icon": "🌐",
        "xp": 245,
        "readTime": 37
      },
      {
        "slug": "lab-projeto-final-plataforma-dotnet-aws-ia",
        "title": "Lab 100 — Projeto final: plataforma .NET 8 + AWS + IA",
        "icon": "🏁",
        "xp": 330,
        "readTime": 44
      }
    ]
  }
];

export const TOTAL_MODULOS = 490;
