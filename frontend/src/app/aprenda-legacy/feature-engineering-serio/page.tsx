import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('feature-engineering-serio');

const accent = '#5b9bd5';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que target encoding ingênuo vaza informação?',
    options: [
      'Não vaza',
      'Se você calcula a média de y para cada categoria usando o dataset inteiro, o modelo "vê" o label da linha em treino. Mitigação: target encoding com K-fold out-of-fold ou suavização bayesiana',
      'Só em regressão',
      'Apenas com dados pequenos',
    ],
    correct: 1,
    explanation: 'Target encoding substitui categoria pela média do target para aquela categoria. Calculado sem cuidado, a linha atual contribui para a própria média e o modelo decora. A solução é out-of-fold encoding (calcula média usando apenas folds diferentes) + shrinkage para categorias raras.',
  },
  {
    question: 'Quando log-transform em uma feature numérica ajuda?',
    options: [
      'Nunca',
      'Quando a feature tem distribuição long-tail (preço, renda, contagem) e o modelo é linear ou assume normalidade. Em árvores (que são invariantes a transformações monotônicas), é irrelevante',
      'Sempre',
      'Só em redes neurais',
    ],
    correct: 1,
    explanation: 'Log comprime cauda longa e aproxima distribuição de normal, ajudando modelos lineares a captar relações multiplicativas. Para XGBoost/RF, a árvore só olha ordem (splits por threshold), então log não muda nada — é trabalho gratuito. Box-Cox generaliza log com parâmetro lambda.',
  },
  {
    question: 'Qual o maior pitfall de data leakage em features temporais?',
    options: [
      'Nomear errado',
      'Usar no treino informação que só existe no futuro — ex: normalizar com mean/std do dataset inteiro, ou criar feature "total de compras do cliente" incluindo compras posteriores ao evento',
      'Fuso horário',
      'Formato de data',
    ],
    correct: 1,
    explanation: 'Leakage temporal é silencioso e mata modelos em produção. Toda estatística agregada (rolling mean, lag features, target encoding) deve usar apenas dados anteriores ao timestamp de cada linha. Teste: simule inferência no tempo real — se a feature não está disponível naquele instante, é leakage.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="feature-engineering-serio"
      title="Feature engineering sério"
      icon="🔧"
      xp={55}
      readTime={13}
      trailName="Machine Learning Clássico"
      trailColor={accent}
      nextSlug="arvores-rf-xgboost"
      nextTitle="Árvores: RF, XGBoost, LightGBM"
      quiz={quiz}
    >
      <Section title="Feature engineering ainda é 80% do ganho em tabular" accent={accent}>
        <p>
          Em 2026, com AutoML e boosting nativo, feature engineering continua sendo o diferencial. O modelo aprende o que você der: se as variáveis certas não existem, nenhum hiperparâmetro recupera. O trabalho é <strong>codificar conhecimento de domínio em colunas numéricas</strong>.
        </p>
      </Section>

      <Section title="Categorical encoding" accent={accent}>
        <CodeBlock lang="python">{`import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder
from category_encoders import TargetEncoder, LeaveOneOutEncoder

# One-hot: bom para baixa cardinalidade (< 20 categorias)
ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=True)

# Ordinal: use apenas quando há ordem real (small/medium/large)
oe = OrdinalEncoder(categories=[['small', 'medium', 'large']])

# Target encoding out-of-fold (seguro contra leakage)
te = TargetEncoder(smoothing=10)  # smoothing evita overfit em categorias raras

# LeaveOneOut — variante que exclui a linha atual do cálculo
loo = LeaveOneOutEncoder(sigma=0.05)  # adiciona ruído pra robustez`}</CodeBlock>
        <Callout tone="info">
          Regra prática: one-hot para baixa cardinalidade; target encoding (out-of-fold) para alta cardinalidade em árvores; hashing trick quando cardinalidade explode (IP, user_id).
        </Callout>
      </Section>

      <Section title="Transformações numéricas" accent={accent}>
        <CodeBlock lang="python">{`import numpy as np
from sklearn.preprocessing import PowerTransformer, StandardScaler

# Log1p para valores com zero (log(0) seria -inf)
df['log_price'] = np.log1p(df['price'])

# Box-Cox/Yeo-Johnson — generalização com parâmetro lambda aprendido
pt = PowerTransformer(method='yeo-johnson', standardize=True)
X_transformed = pt.fit_transform(X[['price', 'income']])

# Binning — transformar contínuo em categorias (quartis, deciles)
df['age_bin'] = pd.qcut(df['age'], q=10, labels=False, duplicates='drop')

# Interações explícitas (quando modelo linear não captura)
df['price_per_area'] = df['price'] / df['area']
df['income_x_tenure'] = df['income'] * df['tenure_years']`}</CodeBlock>
      </Section>

      <Section title="Features temporais" accent={accent}>
        <CodeBlock lang="python">{`# Decompose timestamp em componentes cíclicas
df['hour'] = df['ts'].dt.hour
df['dow'] = df['ts'].dt.dayofweek
df['month'] = df['ts'].dt.month

# Encoding cíclico (sin/cos) para hora e dia-da-semana
df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)

# Lags e rolling (cuidado com leakage!)
df = df.sort_values(['user_id', 'ts'])
df['price_lag_1'] = df.groupby('user_id')['price'].shift(1)
df['price_rolling_7'] = (
    df.groupby('user_id')['price']
      .shift(1)                 # shift ANTES do rolling — crítico
      .rolling(window=7, min_periods=1)
      .mean()
      .reset_index(level=0, drop=True)
)`}</CodeBlock>
        <Callout tone="danger">
          Todo rolling/agregação temporal deve vir <strong>após</strong> um <code>shift(1)</code>. Caso contrário você soma o valor atual na janela e vaza o próprio target.
        </Callout>
      </Section>

      <Section title="Checklist anti-leakage" accent={accent}>
        <ul className="list-disc pl-5 text-sm leading-6 flex flex-col gap-1">
          <li>Split treino/teste antes de qualquer <code>fit</code> de scaler/encoder</li>
          <li>Target encoding sempre out-of-fold ou com <em>holdout</em> dedicado</li>
          <li>Features temporais derivadas apenas de dados com timestamp &lt; ts da linha</li>
          <li>Nenhuma feature do tipo "total final do cliente" em predição intra-período</li>
        </ul>
        <Callout tone="success" icon="✅">
          Se o seu AUC em validação é muito maior que o AUC em A/B de produção, 95% das vezes é feature leakage. Audite cada coluna perguntando: "essa informação estava realmente disponível naquele instante?"
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
