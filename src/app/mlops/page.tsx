import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail51')!;

export const metadata: Metadata = {
  title: 'MLOps — ML em produção — FFV Academy',
  description:
    'MLOps real em PT-BR: training pipelines (Airflow/Kubeflow), feature stores (Feast), experiment tracking + registry (MLflow), data versioning (DVC), serving (Triton/TorchServe/BentoML), monitoring drift, CI/CD para modelos.',
  keywords:
    'mlops, mlflow, kubeflow, airflow ml, feast feature store, triton torchserve bentoml, dvc ml, model drift',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
