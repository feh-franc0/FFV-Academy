import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ml-mental-model');

const accent = '#5b9bd5';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando ML clássico supera uma regra de negócio simples?',
    options: [
      'Sempre que tiver dados',
      'Quando o fenômeno tem muitas variáveis interagindo de forma não-linear, amostra grande, sinal real e o custo do erro justifica complexidade de treino/deploy',
      'Nunca — regra sempre vence',
      'Apenas com deep learning',
    ],
    correct: 1,
    explanation: 'ML paga quando: (1) você não consegue escrever a regra à mão (muitos features interagindo), (2) tem data rotulada suficiente, (3) o sinal na data é real e estável, (4) erro custa caro mas não catastrófico. Para fraude binária com 3 regras claras, if/else vence em manutenção e explicabilidade.',
  },
  {
    question: 'O que é o trade-off bias-variance na prática?',
    options: [
      'Bias é política, variance é ruído',
      'Modelo simples (alto bias) underfit e erra sistematicamente; modelo complexo (alta variance) overfit e memoriza. O ponto ótimo minimiza erro total de generalização',
      'Variance é sempre ruim',
      'Não existe em árvores',
    ],
    correct: 1,
    explanation: 'Linear regression sem features: alto bias (underfit). Árvore profunda sem poda: alta variance (memoriza). Técnicas como regularização, ensembles (RF/XGBoost), cross-validation e early stopping existem para encontrar o sweet spot. Curva de learning (train vs val) é como você diagnostica.',
  },
  {
    question: 'Por que XGBoost ainda domina competições tabulares em 2026 mesmo com LLMs?',
    options: [
      'Marketing',
      'Gradient boosting em árvores lida nativamente com features heterogêneas, missing values, interações não-lineares e escala linear em dados. LLMs não são competitivos em tabular estruturado de milhões de linhas',
      'Porque é grátis',
      'Só em Kaggle',
    ],
    correct: 1,
    explanation: 'Tabular data (linhas/colunas, tipos mistos) é o reino de árvores boostadas: inductive bias certo, split não-linear, não precisa feature scaling, lida com NaN. LLM é generativo de sequência — para prever churn em 50M clientes com 200 features, XGBoost treina em minutos e ganha. Use a ferramenta certa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ml-mental-model"
      title="ML clássico: mental model e quando usar"
      icon="🧠"
      xp={45}
      readTime={11}
      trailName="Machine Learning Clássico"
      trailColor={accent}
      nextSlug="regressao-classificacao"
      nextTitle="Regressão e classificação na prática"
      quiz={quiz}
    >
      <Section title="ML não é mágica — é estatística aplicada" accent={accent}>
        <p>
          Machine learning clássico é, essencialmente, ajustar uma função parametrizada a dados rotulados para generalizar a exemplos novos. O hype de 2023-2025 em LLM escondeu que <strong>90% dos problemas de negócio com data tabular</strong> continuam sendo resolvidos por regressão logística, random forest e XGBoost — não por transformers de 70B parâmetros.
        </p>
        <p>
          O trabalho sênior é saber <em>quando</em> aplicar ML. Se um analista consegue escrever 5 regras que cobrem 95% dos casos, ML é overkill: você paga custo de treino, deploy, monitoramento e drift para ganhar nada.
        </p>
      </Section>

      <Section title="Os três tipos canônicos" accent={accent}>
        <CodeBlock lang="python">{`# Regressão — prever número contínuo
# Ex: preço de imóvel, demanda de produto, LTV de cliente
from sklearn.linear_model import Ridge
model = Ridge(alpha=1.0).fit(X_train, y_train)  # y_train é float

# Classificação — prever classe discreta
# Ex: fraude sim/não, churn, categoria de produto
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=300).fit(X_train, y_train)  # y_train é label

# Clustering — sem label, agrupar similares
# Ex: segmentação de clientes, detecção de anomalia
from sklearn.cluster import KMeans
clusters = KMeans(n_clusters=5).fit_predict(X)  # sem y`}</CodeBlock>
        <Callout tone="info">
          Supervisão é o eixo principal: se você tem <code>y</code> rotulado, é supervisionado (regressão ou classificação). Sem rótulo: não-supervisionado (clustering, dim reduction). Com feedback de recompensa: RL — outro universo.
        </Callout>
      </Section>

      <Section title="Bias-variance trade-off" accent={accent}>
        <p>
          Todo modelo erra por dois motivos: <strong>bias</strong> (premissa estrutural errada — modelo simples demais para o fenômeno) e <strong>variance</strong> (sensibilidade a pequenas mudanças no training set — modelo complexo demais memoriza ruído).
        </p>
        <CodeBlock lang="python">{`# Diagnóstico clássico: learning curve
from sklearn.model_selection import learning_curve
import numpy as np

sizes, train_scores, val_scores = learning_curve(
    model, X, y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10),
    scoring='neg_mean_squared_error',
)

# Se train_score e val_score ambos ruins -> underfit (bias)
# Se train_score bom mas val_score ruim -> overfit (variance)
# Se val_score melhora com mais dados -> colete mais`}</CodeBlock>
        <Callout tone="warn">
          Não caia no overfit sedutor: um R² de 0.99 em train com 0.45 em val não é bom modelo, é decoração. Sempre reporte métrica holdout, nunca apenas train.
        </Callout>
      </Section>

      <Section title="Quando ML não é a resposta" accent={accent}>
        <p>Recuse o projeto se:</p>
        <ul className="list-disc pl-5 text-sm leading-6 flex flex-col gap-1">
          <li>Menos de 1.000 exemplos rotulados e nenhuma forma barata de obter mais</li>
          <li>Distribuição muda a cada semana (drift extremo) sem pipeline de retreino</li>
          <li>Decisão precisa ser 100% auditável e regra simples cobre 90% dos casos</li>
          <li>Custo do falso positivo é catastrófico e você não tem human-in-the-loop</li>
        </ul>
        <Callout tone="success" icon="✅">
          ML paga em: previsão de demanda com sazonalidade, score de risco com muitas variáveis, detecção de anomalia em stream, ranking e recommender, classificação de texto/imagem em volume. Em tudo isso, clássico vence LLM em custo-benefício.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
