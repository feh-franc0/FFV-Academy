import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('mlops-ciclo-completo');

const accent = '#2ea5b3';

const quiz: QuizQuestion[] = [
  {
    question: 'O que caracteriza MLOps Maturity Level 0 segundo o Google?',
    options: [
      'Pipeline totalmente automatizado com CI/CD de modelo',
      'Processo manual script-driven: data scientist treina em notebook, handoff por arquivo .pkl, deploy manual, zero retraining automático e zero monitoring',
      'CT (continuous training) ativo e registry versionado',
      'Meta-learning com AutoML por default',
    ],
    correct: 1,
    explanation: 'Level 0 é o estágio onde não existe pipeline: tudo é manual, orientado a scripts e notebooks. O modelo vira artifact estático, o deploy é como prediction service sem CI/CD, não existe monitoring ativo e o retraining é raro (meses). Level 1 introduz pipeline automatizado de training com CT. Level 2 adiciona CI/CD automatizado do pipeline inteiro, não só do modelo.',
  },
  {
    question: 'Qual é a diferença estrutural entre MLOps e LLMOps em 2026?',
    options: [
      'São a mesma coisa com nomes diferentes',
      'MLOps foca em ciclo train/deploy/monitor de modelos que você treina (features tabulares, drift de distribuição). LLMOps assume modelo base como commodity e foca em prompt versioning, evals, guardrails, cost/latency e RAG — o "training" vira fine-tuning opcional',
      'LLMOps não precisa de observability',
      'MLOps é legado, LLMOps substitui tudo',
    ],
    correct: 1,
    explanation: 'MLOps clássico assume que o artifact central é um modelo treinado por você, com pipeline de features, training e retraining ativo. LLMOps parte de um modelo fundacional pronto (Claude, GPT, Llama) e desloca o centro de gravidade para prompt engineering, eval harnesses, RAG indexing, guardrails de segurança e controle de custo por requisição. Os dois coexistem: ranker ML clássico + LLM no mesmo produto.',
  },
  {
    question: 'Por que o ML flywheel (data → train → deploy → monitor → retrain) é pedagogicamente importante?',
    options: [
      'É só um diagrama bonito',
      'Porque deixa explícito que o valor só aparece quando o loop fecha: monitoring gera sinal para retraining, retraining gera novo modelo, novo modelo gera mais dados. Modelos sem loop degradam silenciosamente e ninguém percebe até o negócio reclamar',
      'Porque substitui DevOps',
      'Porque só vale para deep learning',
    ],
    correct: 1,
    explanation: 'O flywheel força a conversa sobre retraining cadence, drift monitoring e ground truth collection desde o dia 1. Sem isso, times investem em training e deploy, ignoram monitoring e descobrem que o modelo está 30% pior seis meses depois. O valor do MLOps está exatamente em fechar o loop automaticamente, não em rodar notebook perfeito uma vez.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mlops-ciclo-completo"
      title="MLOps: ciclo de vida completo"
      icon="🔁"
      xp={45}
      readTime={11}
      trailName="MLOps — ML em produção"
      trailColor={accent}
      nextSlug="feature-stores-feast"
      nextTitle="Feature stores: Feast e alternativas"
      quiz={quiz}
    >
      <Section title="O que é MLOps, sem o hype" accent={accent}>
        <p>
          MLOps é a disciplina que transforma experimento de data science em sistema de produção auditável. Não é "DevOps com pandas". O estado central é trinco: <strong>código, dados e modelo</strong>. Qualquer um dos três muda e o comportamento do sistema muda — então todos os três precisam de versionamento, pipeline e observability.
        </p>
        <p>
          O erro mais comum é tratar modelo como binário estático. Dados derivam, usuários mudam, mundo muda — e silenciosamente a métrica despenca. MLOps existe para fechar esse loop.
        </p>
      </Section>

      <Section title="O ML flywheel em 6 estações" accent={accent}>
        <CodeBlock lang="yaml">{`# ML flywheel — sem nenhuma estacao opcional
1. data_collection:
    sources: [postgres, events_kafka, labeled_feedback]
    quality_gates: [schema_contract, null_rate, duplicates]
2. feature_engineering:
    offline_store: warehouse (BigQuery/Snowflake)
    online_store: redis / dynamodb
3. training:
    pipeline: kubeflow | airflow | prefect
    tracking: mlflow
4. evaluation:
    offline: golden_set + holdout + stratified
    online: shadow + canary
5. deploy:
    serving: triton | bentoml | torchserve
    rollout: progressive (1% -> 10% -> 50% -> 100%)
6. monitoring:
    data_drift: evidently | whylabs
    model_quality: live metrics + delayed ground truth
    trigger: retrain_if drift &gt; threshold`}</CodeBlock>
      </Section>

      <Section title="Google MLOps Maturity Levels" accent={accent}>
        <p>
          Framework canônico para descrever onde um time está:
        </p>
        <ul className="text-sm leading-6 list-disc pl-6">
          <li><strong>Level 0 — manual:</strong> notebook, handoff por arquivo, deploy manual, zero CT.</li>
          <li><strong>Level 1 — pipeline automatizado:</strong> training pipeline reproduzível, feature store, CT disparado por gatilho (novo data, schedule, drift).</li>
          <li><strong>Level 2 — CI/CD completo:</strong> pipeline inteiro entregue por CI/CD, testes em cada PR, deploy progressivo orquestrado.</li>
        </ul>
        <Callout tone="warn">
          Pular de 0 para 2 sem passar por 1 é receita para burnout. Primeiro domine retraining controlado, depois automatize a entrega do pipeline.
        </Callout>
      </Section>

      <Section title="MLOps vs LLMOps em 2026" accent={accent}>
        <p>
          Os dois convivem no mesmo time. MLOps continua dominante em recomendação, ranking, fraude, previsão de demanda e visão computacional. LLMOps domina em assistentes, RAG, agents e geração. A diferença operacional é clara: em MLOps você é dono do training; em LLMOps você é dono do prompt, dos evals e do índice vetorial — e o "training" vira fine-tuning ou adapter LoRA quando vale.
        </p>
      </Section>

      <Section title="Stack de referência 2026" accent={accent}>
        <CodeBlock lang="yaml">{`orchestration: kubeflow | airflow | prefect
feature_store: feast | tecton | hopsworks
tracking_registry: mlflow | weights_and_biases
data_versioning: dvc | lakefs | pachyderm
serving: triton | torchserve | bentoml | ray_serve
monitoring: evidently | whylabs | arize
ci_cd: github_actions + argo_workflows
infra: terraform + kubernetes (EKS/GKE)`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Nas próximas aulas você vai montar cada peça desse stack. O capstone integra tudo em uma plataforma única.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
