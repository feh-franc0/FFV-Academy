import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail51')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'MLOps real em PT-BR: training pipelines (Airflow/Kubeflow), feature stores (Feast), experiment tracking + registry (MLflow), data versioning (DVC), serving (Triton/TorchServe/BentoML), monitoring drift, CI/CD para modelos.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/mlops` },
  ...social({ titulo: `MLOps — ML em produção — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/mlops' }),
  title: 'MLOps — ML em produção',
  description: DESCRICAO_CARTAO,
  keywords:
    'mlops, mlflow, kubeflow, airflow ml, feast feature store, triton torchserve bentoml, dvc ml, model drift',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
