import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail50')!;

export const metadata: Metadata = {
  title: 'Machine Learning Clássico — FFV Academy',
  description:
    'ML tradicional que ainda paga contas em PT-BR: regressão e classificação, feature engineering sério, árvores (RF/XGBoost/LightGBM), cross-validation honesto, time series (ARIMA/Prophet), recommender systems. Sem LLM, com estatística.',
  keywords:
    'machine learning classico, ml sem llm, xgboost lightgbm, feature engineering, time series arima prophet, recommender systems',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
