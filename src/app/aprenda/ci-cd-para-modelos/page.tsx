import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ci-cd-para-modelos');

const accent = '#2ea5b3';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que deploy progressivo (shadow → canary → rollout) é o padrão para modelos?',
    options: [
      'Porque é obrigação regulatória',
      'Porque métrica offline não prevê produção: tráfego real é enviesado, features têm skew e ground truth atrasa. Shadow valida latência/erro sem impactar usuário; canary mede métrica em fração pequena; rollout amplia só se canary passar',
      'Porque é moda',
      'Porque deploy direto funciona sempre',
    ],
    correct: 1,
    explanation: 'Modelo passa em eval offline e falha em produção com frequência não-trivial. Shadow serve o novo modelo em paralelo, descarta output e mede apenas latência/erro/custo. Canary roteia 1-5% do tráfego real e compara métrica de negócio vs baseline por horas/dias. Rollout amplia em etapas (5 → 25 → 50 → 100%) se canary provar ganho. Rollback barato é parte do contrato.',
  },
  {
    question: 'O que Evidently detecta que métrica de acurácia agregada não detecta?',
    options: [
      'Nada relevante',
      'Data drift (distribuição de features mudou), prediction drift (saída do modelo mudou), concept drift (relação feature→label mudou) e drift por slice. Alertam cedo, antes que a acurácia caia o bastante para o negócio reclamar',
      'Só bugs de código',
      'Só vazamento de memória',
    ],
    correct: 1,
    explanation: 'Acurácia agregada depende de ground truth que chega tarde (dias/semanas). Drift detection olha a distribuição dos inputs e das predictions em tempo quase real. Se a feature "ticket_medio" mudou de média 180 para 240, alguma coisa no pipeline mudou antes do modelo degradar. Slice drift mostra que grupo específico (ex: novos clientes) derivou mesmo com média estável.',
  },
  {
    question: 'Qual é o gatilho correto para retraining automático?',
    options: [
      'Cron mensal sem exceção',
      'Combinação: (a) schedule periódico como piso de segurança, (b) drift detection acima de threshold estatístico, (c) queda de métrica online vs baseline. Cada gatilho gera PR automático para revisão humana antes de promover para Production',
      'Quando alguém pede no Slack',
      'Nunca retreinar',
    ],
    correct: 1,
    explanation: 'Retraining puramente por cron desperdiça compute em tempos calmos e atrasa em tempos voláteis. Só por drift arrisca loop descontrolado. A combinação correta é: schedule mínimo (piso) + drift-triggered (reage a mudança real) + métrica online (sanity check). Todos geram PR com evidência; humano aprova promoção.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ci-cd-para-modelos"
      title="CI/CD para modelos + monitoring drift"
      icon="🚦"
      xp={55}
      readTime={13}
      trailName="MLOps — ML em produção"
      trailColor={accent}
      nextSlug="capstone-mlops-plataforma"
      nextTitle="Capstone: plataforma MLOps ponta a ponta"
      quiz={quiz}
    >
      <Section title="CI/CD de modelo é diferente de CI/CD de serviço" accent={accent}>
        <p>
          CI/CD tradicional testa código. CI/CD de modelo precisa testar também <strong>o artifact treinado</strong>: métrica em golden set, métricas em slices sensíveis, custo por inferência, latência p99 em hardware-alvo. Só depois disso vai para o deploy progressivo.
        </p>
      </Section>

      <Section title="GitHub Actions — workflow de ML" accent={accent}>
        <CodeBlock lang="yaml">{`# .github/workflows/model-ci.yml
name: model-ci
on:
  pull_request:
    paths: ["src/**", "dvc.yaml", "params.yaml"]

jobs:
  reproduce:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: iterative/setup-dvc@v1
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }

      - run: pip install -r requirements.txt
      - run: dvc pull
      - run: dvc repro

      - name: Eval em golden set
        run: python src/eval_golden.py --report metrics/pr.json

      - name: Gate estatistico vs baseline
        run: python src/gate.py --pr metrics/pr.json --baseline metrics/main.json

      - name: Publicar modelo candidato no MLflow
        env:
          MLFLOW_TRACKING_URI: \${{ secrets.MLFLOW_URI }}
        run: python src/register_candidate.py`}</CodeBlock>
        <Callout tone="warn">
          O step <code>gate.py</code> deve falhar o PR se a melhora não for estatisticamente significativa ou se houver regressão em qualquer slice monitorado.
        </Callout>
      </Section>

      <Section title="Deploy progressivo — shadow, canary, rollout" accent={accent}>
        <CodeBlock lang="yaml">{`# argo rollouts — canary strategy
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: churn-serving
spec:
  strategy:
    canary:
      steps:
        - setWeight: 5
        - pause: { duration: 2h }
        - analysis:
            templates: [ { templateName: churn-metrics } ]
        - setWeight: 25
        - pause: { duration: 4h }
        - analysis:
            templates: [ { templateName: churn-metrics } ]
        - setWeight: 50
        - pause: { duration: 6h }
        - setWeight: 100`}</CodeBlock>
      </Section>

      <Section title="Drift detection com Evidently" accent={accent}>
        <CodeBlock lang="python">{`from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, TargetDriftPreset

report = Report(metrics=[DataDriftPreset(), TargetDriftPreset()])
report.run(reference_data=df_ref, current_data=df_live)

result = report.as_dict()
drift_share = result["metrics"][0]["result"]["drift_share"]

if drift_share &gt; 0.3:
    trigger_retraining_pipeline(reason=f"drift_share={drift_share:.2f}")
    alert_slack(channel="#ml-ops", message="Drift detectado em churn-v7")
else:
    log_ok(drift_share)`}</CodeBlock>
      </Section>

      <Section title="Retraining automation" accent={accent}>
        <CodeBlock lang="yaml">{`# retraining triggers — documentados e versionados
triggers:
  schedule: "0 3 * * 1"          # piso: toda segunda 03:00
  drift:
    metric: evidently.drift_share
    threshold: 0.30
  online_quality:
    metric: f1_weekly
    delta_vs_baseline: -0.02
actions:
  on_trigger:
    - run_pipeline: kubeflow/churn-training
    - open_pr_with_mlflow_link: true
    - require_human_approval_for_production: true`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Meta de maturidade Level 2: pipeline inteiro é entregue por CI/CD e promoção para Production exige aprovação humana com evidência anexada.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
