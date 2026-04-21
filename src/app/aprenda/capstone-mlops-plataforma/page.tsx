import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-mlops-plataforma');

const accent = '#2ea5b3';

const quiz: QuizQuestion[] = [
  {
    question: 'O que distingue um capstone MLOps portfolio-grade de um toy project?',
    options: [
      'Só tamanho do dataset',
      'Sete peças integradas com evidência: feature store (Feast) + registry (MLflow) + pipeline (Kubeflow/Airflow) + serving (Triton/BentoML) + data versioning (DVC) + monitoring (Evidently) + IaC (Terraform). Com writeup honesto de trade-offs e custos mensais estimados',
      'Ter UI bonita',
      'Usar o modelo mais novo do mês',
    ],
    correct: 1,
    explanation: 'Toy project treina um modelo no notebook e serve via Flask. Capstone portfolio-grade integra o stack inteiro, documenta trade-offs (por que Feast e não Tecton, por que Triton e não BentoML), apresenta custos reais em USD/mês e mostra que o autor pensou em operação, não só em treino. É o nível que vale senior MLE em 2026.',
  },
  {
    question: 'Qual evidência melhor prova que o capstone realmente funciona?',
    options: [
      'README bonito',
      'Dashboard live (Grafana/Evidently), link para MLflow com runs reais, vídeo curto demonstrando deploy progressivo acontecendo, screenshots de drift detection disparando retraining, e planilha de custo mensal por componente',
      'Só o código no GitHub',
      'PDF com diagramas',
    ],
    correct: 1,
    explanation: 'Recrutador sênior quer ver artefato vivo: dashboard acessível, MLflow com experimentos reais, demonstração de rollout progressivo, alerta de drift disparando pipeline. Código no GitHub é pré-requisito, não diferencial. O diferencial é evidência observável de que o sistema está rodando e monitorado.',
  },
  {
    question: 'Qual erro derruba a qualidade percebida do capstone com mais frequência?',
    options: [
      'Usar muitas cores no dashboard',
      'Esconder trade-offs: apresentar o stack como "melhor que tudo" sem dizer o que foi sacrificado (custo, complexidade operacional, lock-in). Engenheiro sênior vê isso na hora e desconfia do resto do trabalho',
      'Usar Python em vez de Go',
      'Ter muitos commits',
    ],
    correct: 1,
    explanation: 'Nada sinaliza mais inexperiência do que um writeup que só elogia as próprias decisões. Todo stack tem custo — operacional, financeiro, de onboarding, de lock-in. Capstone forte escolhe conscientemente e explica o que foi sacrificado. Isso gera confiança e abre conversa real em entrevista técnica.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-mlops-plataforma"
      title="Capstone: plataforma MLOps ponta a ponta"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="MLOps — ML em produção"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Escolha um caso de uso concreto (churn, fraude, recomendação, previsão de demanda ou propensão a compra) e construa a plataforma MLOps que serviria esse caso em produção real. Pense como engenheiro responsável por operar o sistema por 12 meses — não como estudante entregando tarefa.
        </p>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="yaml">{`# capstone — entregaveis minimos
repo:
  - infra/terraform: modulos para eks + s3 + rds mlflow + ecr
  - feature_store/: feast feature definitions + feature_store.yaml
  - pipelines/: kubeflow ou airflow (training + eval + register)
  - serving/: triton model_repository OU bentoml service
  - monitoring/: evidently jobs + grafana dashboards as code
  - ci_cd/: .github/workflows/ (model-ci, serving-deploy, infra-plan)
  - docs/
      - README.md (visao geral + diagrama c4)
      - ADRs/ (decisoes: feast vs tecton, triton vs bentoml, etc)
      - runbook.md (on-call, rollback, drift response)
      - cost_report.md (USD/mes por componente, projecao 10x)
evidencia:
  - mlflow_live_url: http://...
  - grafana_dashboard_url: http://...
  - video_demo: 5 min mostrando deploy progressivo
  - drift_event_screenshot: retraining disparado por drift real`}</CodeBlock>
      </Section>

      <Section title="Arquitetura de referência" accent={accent}>
        <CodeBlock lang="yaml">{`# diagrama logico do stack capstone
sources:
  - postgres_prod (CDC via debezium)
  - events_kafka
offline_store: snowflake | bigquery
online_store:  redis cluster
feature_store: feast (registry em s3)
orchestration: kubeflow pipelines em eks
tracking_registry: mlflow (rds postgres + s3 artifacts)
data_versioning: dvc (remote em s3)
serving: triton inference server (gpu nodegroup)
gateway: api gateway -&gt; alb -&gt; triton
monitoring:
  data_drift: evidently jobs agendados
  model_quality: metrics em prometheus
  business_metrics: dashboard em grafana
  tracing: opentelemetry -&gt; tempo
ci_cd: github actions + argo rollouts
iac: terraform + helm`}</CodeBlock>
      </Section>

      <Section title="Milestones sugeridos (4 semanas)" accent={accent}>
        <CodeBlock lang="markdown">{`# plano de execucao

## Semana 1 — Fundacao
- Terraform: eks + s3 + rds mlflow
- Feast com 1 feature view real
- MLflow self-hosted acessivel
- CI basico (lint + test + dvc pull)

## Semana 2 — Pipeline + Registry
- Kubeflow pipeline: features -&gt; train -&gt; eval -&gt; register
- Eval em golden set curado
- Gate estatistico vs baseline no CI
- Primeira ModelVersion em Staging

## Semana 3 — Serving + Monitoring
- Triton config.pbtxt com dynamic batching
- Deploy progressivo via argo rollouts
- Evidently agendado (data drift + target drift)
- Dashboard grafana com 5 paineis-chave

## Semana 4 — Hardening + writeup
- Runbook de on-call (rollback em 5 min)
- Teste de chaos: matar pod de serving, validar
- ADRs escritos (3 decisoes grandes)
- Cost report honesto em USD/mes
- Video demo 5 min + blog post`}</CodeBlock>
      </Section>

      <Section title="Rubrica de avaliação" accent={accent}>
        <CodeBlock lang="markdown">{`# rubrica portfolio-grade

[ ] Feature store em uso real (nao mock), com point-in-time join demonstrado
[ ] MLflow com &gt;= 10 runs reais e pelo menos 1 modelo em Production
[ ] Pipeline reproduzivel de ponta a ponta (comando unico)
[ ] Serving com dynamic batching e p99 medido sob carga
[ ] DVC versionando dataset e model em storage remoto
[ ] Drift detection disparando PR de retraining automaticamente
[ ] CI/CD falhando corretamente quando metrica regride
[ ] Terraform aplicando infra do zero em ambiente limpo
[ ] Cost report em USD/mes + projecao de 10x tráfego
[ ] ADRs explicando trade-offs (minimo 3 decisoes)
[ ] Runbook de on-call testado (rollback em &lt; 5 min)
[ ] Writeup honesto: o que nao funciona, o que ficaria para v2`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Esse capstone é o portfolio que abre conversa sênior em MLE/ML Platform. Entrega mostra que o autor pensa em operação, custo e risco — não só em treinar modelo bonito. É o nível que vale entre R$ 25k e R$ 45k/mês em 2026 no mercado brasileiro, e 150-250k USD em remoto.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
