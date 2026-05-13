import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cross-validation-metricas');

const accent = '#5b9bd5';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que accuracy é uma métrica enganosa em classes desbalanceadas?',
    options: [
      'Não é',
      'Com 99% de classe negativa, um modelo trivial "sempre negativo" atinge 99% accuracy mas zero recall na classe positiva. Use precision/recall/F1, PR-AUC ou balanced accuracy',
      'Apenas em regressão',
      'Só em deep learning',
    ],
    correct: 1,
    explanation: 'Fraude, churn, doença rara: a classe de interesse é 1-5% do total. Accuracy recompensa o modelo por acertar a classe majoritária. ROC-AUC também vira menos informativo com desbalanceamento extremo — PR-AUC (precision-recall) ou F1 focados na classe positiva são mais honestos.',
  },
  {
    question: 'Quando NÃO usar K-fold padrão?',
    options: [
      'Sempre usar',
      'Em séries temporais (folds padrão embaralham tempo e vazam futuro no passado) e em dados agrupados (mesmo usuário em treino e teste leaka). Use TimeSeriesSplit ou GroupKFold',
      'Só em regressão',
      'Apenas com poucas linhas',
    ],
    correct: 1,
    explanation: 'KFold com shuffle=True em time series é erro clássico: o modelo "vê o futuro" em validação. TimeSeriesSplit faz walk-forward (train até t, valida em t+1). GroupKFold garante que grupos (user_id, paciente) nunca apareçam em train e test simultaneamente — senão a métrica é inflada.',
  },
  {
    question: 'O que significa um R² negativo?',
    options: [
      'Bug',
      'Seu modelo é pior que prever a média da variável alvo. R² = 1 - SS_res/SS_tot; quando SS_res &gt; SS_tot, R² vira negativo. Sinal de underfit severo ou distribuição shift',
      'Impossível',
      'Bom modelo',
    ],
    correct: 1,
    explanation: 'R² compara seu modelo contra o baseline trivial "prever a média". Se o modelo é pior que baseline, R² é negativo. Em holdout com drift, isso ocorre. Não confunda com R² de treino (sempre &gt;= 0 em linear regression não regularizada).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cross-validation-metricas"
      title="Cross-validation e métricas honestas"
      icon="📏"
      xp={55}
      readTime={13}
      trailName="Machine Learning Clássico"
      trailColor={accent}
      nextSlug="time-series-arima-prophet"
      nextTitle="Time series: ARIMA, Prophet, Neural"
      quiz={quiz}
    >
      <Section title="Validação é onde modelos morrem ou sobrevivem" accent={accent}>
        <p>
          Cross-validation não é formalidade — é como você descobre se o modelo generaliza. A escolha do esquema de split codifica premissas sobre o problema: se você errar aqui, vai reportar AUC 0.95 em slide e ver 0.72 em produção.
        </p>
      </Section>

      <Section title="Esquemas de split" accent={accent}>
        <CodeBlock lang="python">{`from sklearn.model_selection import (
    KFold, StratifiedKFold, TimeSeriesSplit, GroupKFold
)

# Tabular iid, classificação -> StratifiedKFold
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Time series -> walk-forward
tss = TimeSeriesSplit(n_splits=5, gap=1)  # gap evita vazamento de vizinhos
for train_idx, val_idx in tss.split(X):
    pass  # train sempre antes de val no tempo

# Dados agrupados (mesmo usuário em várias linhas) -> GroupKFold
gkf = GroupKFold(n_splits=5)
for train_idx, val_idx in gkf.split(X, y, groups=user_ids):
    pass`}</CodeBlock>
        <Callout tone="warn">
          Se você não sabe qual esquema usar, comece desenhando como a predição será feita em produção: dado timestamp T, com que dados você treina e em que você prediz? Sua CV deve simular isso.
        </Callout>
      </Section>

      <Section title="Métricas de classificação" accent={accent}>
        <CodeBlock lang="python">{`from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score,
    balanced_accuracy_score, confusion_matrix, classification_report,
)

y_pred = model.predict(X_val)
y_proba = model.predict_proba(X_val)[:, 1]

print(classification_report(y_val, y_pred))
print(f'ROC-AUC: {roc_auc_score(y_val, y_proba):.4f}')
print(f'PR-AUC:  {average_precision_score(y_val, y_proba):.4f}')
print(f'Balanced acc: {balanced_accuracy_score(y_val, y_pred):.4f}')
print(confusion_matrix(y_val, y_pred))`}</CodeBlock>
        <Callout tone="info">
          Em classes desbalanceadas, <strong>PR-AUC</strong> é mais sensível que ROC-AUC. ROC pode parecer alto (0.9+) enquanto precision na classe positiva é 0.1 — PR-AUC expõe isso.
        </Callout>
      </Section>

      <Section title="Métricas de regressão" accent={accent}>
        <CodeBlock lang="python">{`from sklearn.metrics import (
    mean_absolute_error, mean_squared_error,
    mean_absolute_percentage_error, r2_score,
)
import numpy as np

mae = mean_absolute_error(y_val, y_pred)
rmse = np.sqrt(mean_squared_error(y_val, y_pred))
mape = mean_absolute_percentage_error(y_val, y_pred)
r2 = r2_score(y_val, y_pred)

# MAE é robusto a outliers; RMSE pune outliers quadraticamente
# MAPE é interpretável em % mas explode perto de y=0
# R² responde "quanto da variância expliquei?"`}</CodeBlock>
      </Section>

      <Section title="Intervalos de confiança" accent={accent}>
        <CodeBlock lang="python">{`from sklearn.utils import resample
import numpy as np

def bootstrap_ci(y_true, y_pred, metric, n=1000, alpha=0.05):
    scores = []
    rng = np.random.default_rng(42)
    for _ in range(n):
        idx = rng.integers(0, len(y_true), len(y_true))
        scores.append(metric(y_true[idx], y_pred[idx]))
    lo, hi = np.quantile(scores, [alpha/2, 1 - alpha/2])
    return np.mean(scores), lo, hi

mean_auc, lo, hi = bootstrap_ci(y_val, y_proba, roc_auc_score)
print(f'AUC: {mean_auc:.3f} [{lo:.3f}, {hi:.3f}]')`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Reportar intervalo de confiança 95% (bootstrap) é o mínimo para decidir entre modelos. Diferença de 0.02 em AUC pode não ser estatisticamente significante. Hoje isso separa produto que acerta de produto que vive em loop de refactor.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
