import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail50')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'ML tradicional que ainda paga contas em PT-BR: regressão e classificação, feature engineering sério, árvores (RF/XGBoost/LightGBM), cross-validation honesto, time series (ARIMA/Prophet), recommender systems. Sem LLM, com estatística.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/machine-learning` },
  ...social({ titulo: `Machine Learning Clássico — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/machine-learning' }),
  title: 'Machine Learning Clássico',
  description: DESCRICAO_CARTAO,
  keywords:
    'machine learning classico, ml sem llm, xgboost lightgbm, feature engineering, time series arima prophet, recommender systems',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
