import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-reducao-de-30-custo');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que baseline rigoroso é pré-condição da redução?',
    options: [
      'Não é',
      'Sem baseline comparável (mesma janela, mesmas premissas), "reduzi 30%" é narrativa sem prova. Baseline: Cost Explorer 90 dias pré-intervention por serviço/tag, excluindo eventos excepcionais (migração, Black Friday). Após mudanças, compara mesma janela normalizada',
      'Baseline é opcional',
      'Só estimativa',
    ],
    correct: 1,
    explanation: 'Redução sem baseline é marketing. Engineering report rigoroso: "baseline jan-mar = $X/mês (tag env=prod, excluído spike sazonal de fev), pós-intervention abr-jun = $Y/mês, redução $X-$Y ($pp% MoM média) — intervenções: rightsize (A%), SPs (B%), cleanup (C%)". Atribuição honesta de cada alavanca.',
  },
  {
    question: 'Qual a ordem correta de atacar alavancas?',
    options: [
      'Aleatória',
      '1) Cleanup (recursos órfãos — win instantâneo, risco zero), 2) Rightsizing (Compute Optimizer — win médio, risco médio), 3) Storage tiering (S3 Lifecycle — risco baixo, gain estável), 4) Commitments (após baseline estabilizada), 5) Spot/Graviton em paralelo (architecture changes)',
      'Commitments primeiro',
      'Spot primeiro',
    ],
    correct: 1,
    explanation: 'Cleanup antes de commitment: comprar SP pra workload que você vai deletar é waste. Rightsizing antes de commitment: commit em m5 grande quando m5 médio basta lock em waste. Storage tiering é safe quick-win. Commitments por último pois baseline precisa estar estabilizada após optimizações. Spot/Graviton exigem app changes, rodam em paralelo.',
  },
  {
    question: 'Qual é o entregável ideal pro capstone?',
    options: [
      'Só print de economia',
      'Writeup estruturado: baseline com dados, hipóteses de economia priorizadas, experimentos executados com resultado, economia realizada atribuída por alavanca, limitações honestas, next steps. Código/queries reproduzíveis. Dashboard link. Mostra rigor e engineering maturity',
      'Só tweet',
      'Vídeo rápido',
    ],
    correct: 1,
    explanation: 'FinOps capstone vale como portfolio pro senior+ engineer/architect. Recruiter lê: "baseline detalhado, metodologia clara, atribuição honesta, limitações reconhecidas, próximos passos". Difere de "economizei 30%" sem evidence. Blog post, README extenso ou case study PDF curto.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-reducao-de-30-custo"
      title="Capstone: redução de 30% de custo em app real"
      icon="🏁"
      xp={85}
      readTime={18}
      trailName="FinOps & Cost Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Escolha aplicação real (próprio projeto, trabalho atual com anonimização, ou caso público). Produza case study de FinOps cobrindo: baseline, análise, intervenções, mensuração, aprendizados. Meta de 30% é ambiciosa mas atingível em app típico com medidas básicas bem executadas.
        </p>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone FinOps — Entregáveis

## 1. Baseline rigoroso (1 semana)
- Cost Explorer export 90 dias pré-intervention
- Breakdown por serviço, tag (team/env), hora do dia
- Anomalias excluídas e documentadas
- CUR em Athena se org usa (cobertura granular)

## 2. Análise + priorização (3-5 dias)
- Top 10 custos
- Compute Optimizer findings
- EBS/EIP/NAT órfãos
- Coverage atual de SPs/RIs
- Storage tier distribution (hot vs cold)
- Graviton compatibility audit
- Hipóteses rankeadas por (economia estimada / risco / esforço)

## 3. Intervenções ordenadas
  Fase 1: cleanup (auto via Lambda + aprovação)
  Fase 2: rightsizing canary → rollout
  Fase 3: S3 Lifecycle + Intelligent-Tiering
  Fase 4: Compute SP 1yr no-upfront cobrindo baseline
  Fase 5 (paralelo): Graviton migration, Spot em workers

## 4. Mensuração (4+ semanas pós)
- Mesma janela, mesmas premissas
- Atribuição por alavanca (cleanup X%, rightsize Y%, SP Z%)
- Validação que nenhum SLO degradou

## 5. Writeup estruturado
- Problema + contexto da app
- Metodologia
- Resultados com gráficos (before/after)
- Limitações + falsos positivos removidos
- Lições aprendidas
- Próximos passos

## 6. Materiais complementares
- Dashboard Grafana/QuickSight publicável
- Scripts/Terraform/Lambdas usadas
- Runbook pra manutenção recorrente`}</CodeBlock>
      </Section>

      <Section title="Template de writeup" accent={accent}>
        <CodeBlock lang="markdown">{`# Case Study: Reduzindo 32% em custo AWS do serviço X

## Contexto
Serviço backend stateless atrás de ALB + Fargate + Aurora Postgres,
50M requests/mês, baseline $18.4k/mês em us-east-1.

## Baseline (jan-mar 2026, excluída migração de fev)
Total: $18,430/mês  Top 3 serviços:
  - Fargate:   $8,400  (45%)
  - RDS:       $5,200  (28%)
  - NAT/DTO:   $2,100  (11%)
  - Outros:    $2,730  (15%)

Observações:
  - 0% cobertura SPs (workload novo, baseline instável até dez/25)
  - EBS snapshots: 4TB de 180+ dias (órfãos)
  - Fargate: CPU baseline 22%, memory 38% (overprovision claro)
  - RDS db.r5.2xlarge single-AZ em prod (antipattern)

## Intervenções
  [cleanup] Lambda automatizado removeu 4TB snapshots      -$380/mês
  [rightsize] Fargate 2vCPU/4GB → 1vCPU/3GB com 25% buffer  -$2,600/mês
  [architecture] Graviton ECS tasks (c7g)                   -$1,400/mês
  [RDS] Multi-AZ habilitado (resiliência) + Reserved 1yr    -$1,100/mês net
  [commitments] Compute SP 1yr no-upfront 70% coverage      -$600/mês
  [S3] Lifecycle logs S3 Standard → IA → Glacier            -$180/mês
  TOTAL                                                      -$6,260/mês

## Resultado (abr-jun 2026)
Custo atual: $12,170/mês — redução 33.1% vs baseline
Métricas de app (latency p99, error rate) inalteradas

## Limitações
- Workload pode mudar se feature X ship em Q3 → revisar SP coverage
- Graviton migration exige testing adicional pra libs C++ (cobrimos main)

## Próximos passos
- Spot em Fargate workers não-críticos (potencial ~$800/mês adicional)
- RDS Performance Insights pra rightsize DB (potencial ~$1,000/mês)
- Revisão Compute SP coverage após 6 meses de baseline estável`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Esse tipo de case study é portfolio de eng sênior/staff em 2026. Recruiter/hiring manager lê e vê: engineering rigoroso, foco em impact, honestidade com limitations, próximos passos executáveis. Abre portas pra roles de Cloud Architect, Staff Eng, FinOps Lead.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
