import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('arvores-rf-xgboost');

const accent = '#5b9bd5';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença fundamental entre Random Forest e XGBoost?',
    options: [
      'Linguagem',
      'RF treina árvores em paralelo sobre amostras bootstrap e média (bagging, reduz variance). XGBoost treina árvores sequenciais onde cada uma corrige resíduos da anterior (boosting, reduz bias)',
      'RF é mais rápido',
      'XGBoost só faz classificação',
    ],
    correct: 1,
    explanation: 'Bagging (RF): várias árvores independentes, votos/médias — reduz variance do modelo base. Boosting (XGB/LGBM): árvores sequenciais, cada uma foca nos erros residuais anteriores — reduz bias. Por isso boosting geralmente vence em accuracy, mas exige tuning cuidadoso de learning rate e early stopping.',
  },
  {
    question: 'Para que serve early stopping em XGBoost?',
    options: [
      'Economizar CPU',
      'Parar o treino quando a métrica na eval set pára de melhorar por N rounds — evita overfit e descobre número ótimo de árvores automaticamente',
      'Reduzir learning rate',
      'Não serve',
    ],
    correct: 1,
    explanation: 'Boosting sem early stopping overfitta conforme adiciona árvores. Com eval_set e early_stopping_rounds=50, você treina 5000 árvores mas o boost pára quando val loss não melhora por 50 iterações. O best_iteration é registrado. É o mecanismo mais importante para produção.',
  },
  {
    question: 'Por que LightGBM costuma ser mais rápido que XGBoost em datasets grandes?',
    options: [
      'É escrito em Rust',
      'Usa histogram-based splits (buckets) e growth leaf-wise (expande folha com maior ganho) em vez de level-wise. Ambas as escolhas reduzem memória e CPU',
      'Paralelismo melhor',
      'Sempre acha o mesmo resultado',
    ],
    correct: 1,
    explanation: 'XGBoost histogram mode aproximou essa performance, mas LightGBM nasceu histogram-based. Leaf-wise growth pode overfittar mais (controle com num_leaves e min_data_in_leaf), porém converge mais rápido para o mesmo erro. CatBoost adiciona ordered boosting e target encoding nativos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="arvores-rf-xgboost"
      title="Árvores: RF, XGBoost, LightGBM"
      icon="🌳"
      xp={60}
      readTime={14}
      trailName="Machine Learning Clássico"
      trailColor={accent}
      nextSlug="cross-validation-metricas"
      nextTitle="Cross-validation e métricas honestas"
      quiz={quiz}
    >
      <Section title="Árvores: o inductive bias certo para tabular" accent={accent}>
        <p>
          Decision trees particionam o espaço de features com splits axis-aligned, otimizando redução de impureza (Gini, entropy) ou MSE. Uma árvore sozinha overfitta. <strong>Ensembles de árvores</strong> resolvem isso de duas formas canônicas: bagging (RF) e boosting (XGBoost/LightGBM/CatBoost).
        </p>
        <Callout tone="info">
          Árvores são invariantes a transformações monotônicas (log, sqrt, StandardScaler são irrelevantes) e lidam com missing values nativamente. Isso economiza 50% do pipeline comparado a modelos lineares.
        </Callout>
      </Section>

      <Section title="Random Forest" accent={accent}>
        <CodeBlock lang="python">{`from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

rf = RandomForestClassifier(
    n_estimators=500,         # mais árvores = melhor até platô; custo linear
    max_depth=None,           # deixar crescer, controlar via min_samples_leaf
    min_samples_leaf=20,      # folha precisa min 20 exemplos -> regulariza
    max_features='sqrt',      # em cada split, considera sqrt(n_features)
    class_weight='balanced_subsample',
    n_jobs=-1,                # paraleliza árvores
    random_state=42,
)

scores = cross_val_score(rf, X, y, cv=5, scoring='roc_auc', n_jobs=-1)
print(f'RF AUC: {scores.mean():.4f}')`}</CodeBlock>
      </Section>

      <Section title="XGBoost com early stopping" accent={accent}>
        <CodeBlock lang="python">{`import xgboost as xgb
from sklearn.model_selection import train_test_split

X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

model = xgb.XGBClassifier(
    n_estimators=5000,            # teto alto; early stopping decide
    learning_rate=0.05,            # menor = mais árvores, geralmente melhor
    max_depth=6,                   # 4-8 típico para tabular
    subsample=0.8,                 # bagging de linhas
    colsample_bytree=0.8,          # bagging de colunas
    reg_alpha=0.1, reg_lambda=1.0,
    eval_metric='auc',
    early_stopping_rounds=50,
    tree_method='hist',            # histogram mode -> rápido
    device='cuda',                 # ou 'cpu'
    random_state=42,
)

model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=100)
print(f'best_iteration: {model.best_iteration}')`}</CodeBlock>
        <Callout tone="warn">
          Nunca confunda <code>eval_set</code> com test set. O eval_set guia early stopping e, portanto, é tecnicamente parte do treino. Mantenha um test set <em>holdout</em> intocado para reportar a métrica final.
        </Callout>
      </Section>

      <Section title="LightGBM, CatBoost e quando escolher cada" accent={accent}>
        <CodeBlock lang="python">{`import lightgbm as lgb

lgbm = lgb.LGBMClassifier(
    n_estimators=5000,
    learning_rate=0.05,
    num_leaves=31,                # leaf-wise: controlar num_leaves &lt; 2^max_depth
    min_data_in_leaf=50,
    feature_fraction=0.8,
    bagging_fraction=0.8, bagging_freq=5,
    reg_alpha=0.1, reg_lambda=1.0,
    objective='binary', metric='auc',
    n_jobs=-1, random_state=42,
)
lgbm.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], callbacks=[lgb.early_stopping(50)])

# CatBoost: use quando tem muitas categóricas de alta cardinalidade
from catboost import CatBoostClassifier
cat = CatBoostClassifier(
    iterations=5000, learning_rate=0.05, depth=6,
    cat_features=['city', 'product_category'],
    eval_metric='AUC', early_stopping_rounds=50, verbose=100,
)`}</CodeBlock>
        <Callout tone="neutral">
          Regra de bolso: <strong>LightGBM</strong> para speed em dataset médio-grande; <strong>XGBoost</strong> para maturidade e integração (Spark, GPU); <strong>CatBoost</strong> quando features categóricas dominam.
        </Callout>
      </Section>

      <Section title="Feature importance e interpretabilidade" accent={accent}>
        <CodeBlock lang="python">{`import shap

explainer = shap.TreeExplainer(model)
shap_values = explainer(X_val)

shap.plots.beeswarm(shap_values, max_display=15)
shap.plots.waterfall(shap_values[0])  # explicação local de uma predição`}</CodeBlock>
        <Callout tone="success" icon="✅">
          SHAP values são o padrão moderno para explicar boosting. Gain-based importance do XGBoost enviesa para features de alta cardinalidade. SHAP é aditivo, teoricamente fundado (Shapley values) e roda em tempo aceitável via TreeExplainer.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
