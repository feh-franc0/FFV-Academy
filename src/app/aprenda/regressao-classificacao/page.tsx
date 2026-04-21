import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('regressao-classificacao');

const accent = '#5b9bd5';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença prática entre L1 (Lasso) e L2 (Ridge)?',
    options: [
      'Nenhuma',
      'L1 empurra coeficientes a zero exato (feature selection implícita); L2 encolhe todos proporcionalmente mas raramente zera. ElasticNet combina ambos',
      'L1 é mais lenta',
      'L2 só serve para classificação',
    ],
    correct: 1,
    explanation: 'L1 usa penalidade |w| (esparsa): ótima quando você suspeita que muitas features são irrelevantes. L2 usa w² (suave): melhor para multicolinearidade. ElasticNet mistura com o hiperparâmetro l1_ratio. Em produção, Ridge é default seguro; Lasso quando interpretabilidade importa.',
  },
  {
    question: 'Quando KNN é má ideia?',
    options: [
      'Sempre',
      'Em alta dimensão (curse of dimensionality torna distância pouco informativa), com datasets muito grandes (inference O(n)) e features não escaladas',
      'Em regressão',
      'Com dados numéricos',
    ],
    correct: 1,
    explanation: 'KNN calcula distância em todo o dataset por predição. Sem escalonamento, features de magnitude alta dominam. Em 100+ dimensões, todos os pontos ficam aproximadamente equidistantes. KNN brilha em baselines rápidos ou problemas de baixa dimensão com manifolds claros.',
  },
  {
    question: 'Por que Naive Bayes funciona tão bem em classificação de texto apesar da premissa "ingênua"?',
    options: [
      'Mágica',
      'A premissa de independência condicional é errada, mas a decisão final depende apenas da ordem das probabilidades — e essa ordem é robusta. Além disso, texto tem muitas features fracas que somam evidência',
      'Porque é rápido',
      'Porque não tem hiperparâmetros',
    ],
    correct: 1,
    explanation: 'Naive Bayes assume P(x1,x2|y) = P(x1|y)P(x2|y) — falso quase sempre. Mas para classificar basta que argmax_y P(y|x) esteja certo, não que a probabilidade calibrada esteja. Em texto (bag-of-words), funciona excepcionalmente bem como baseline e treina em segundos em milhões de docs.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="regressao-classificacao"
      title="Regressão e classificação na prática"
      icon="📈"
      xp={55}
      readTime={13}
      trailName="Machine Learning Clássico"
      trailColor={accent}
      nextSlug="feature-engineering-serio"
      nextTitle="Feature engineering sério"
      quiz={quiz}
    >
      <Section title="Linear e logistic regression — os cavalos de batalha" accent={accent}>
        <p>
          Linear regression ajusta <code>y = Xw + b</code> minimizando erro quadrático. Logistic regression aplica sigmoide e minimiza log-loss para classificação binária. Ambos são lineares nos parâmetros, convexos (ótimo global garantido) e baratos de treinar.
        </p>
        <CodeBlock lang="python">{`from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipe = Pipeline([
    ('scaler', StandardScaler()),              # obrigatório para regularização justa
    ('clf', LogisticRegression(
        penalty='l2', C=1.0,                   # C = 1/lambda (inverso da força de regularização)
        class_weight='balanced',               # dados desbalanceados? use balanced
        solver='liblinear', max_iter=1000,
    )),
])
pipe.fit(X_train, y_train)
proba = pipe.predict_proba(X_test)[:, 1]       # probabilidade calibrada (quase)`}</CodeBlock>
        <Callout tone="info">
          Sempre encapsule pré-processamento em <code>Pipeline</code>. Isso evita leakage (scaler treinado no train set inteiro) e torna o modelo deployável como um único artefato.
        </Callout>
      </Section>

      <Section title="Regularização: L1, L2, ElasticNet" accent={accent}>
        <p>
          Adicionar penalidade no custo evita overfit e seleciona features. Matematicamente:
        </p>
        <CodeBlock lang="python">{`# Ridge (L2): penaliza soma de quadrados dos pesos
# argmin ||y - Xw||^2 + alpha * ||w||^2
from sklearn.linear_model import Ridge, Lasso, ElasticNet

ridge = Ridge(alpha=1.0)           # default seguro
lasso = Lasso(alpha=0.01)          # zera coefs -> feature selection
elastic = ElasticNet(alpha=0.01, l1_ratio=0.5)  # meio termo

# Escolha alpha com validação cruzada
from sklearn.linear_model import RidgeCV
model = RidgeCV(alphas=[0.001, 0.01, 0.1, 1.0, 10.0], cv=5).fit(X, y)
print(model.alpha_)  # melhor alpha encontrado`}</CodeBlock>
      </Section>

      <Section title="SVM, Naive Bayes e KNN — quando cada um" accent={accent}>
        <CodeBlock lang="python">{`# SVM — margem máxima, ótimo para poucos dados de alta dimensão (texto, genomica)
from sklearn.svm import SVC
svm = SVC(kernel='rbf', C=1.0, gamma='scale', probability=True)

# Naive Bayes — baseline imbatível em texto (spam, sentimento)
from sklearn.naive_bayes import MultinomialNB
nb = MultinomialNB(alpha=1.0)  # com TF-IDF

# KNN — baseline rápido, sem treinamento, interpretável
from sklearn.neighbors import KNeighborsClassifier
knn = KNeighborsClassifier(n_neighbors=5, weights='distance')`}</CodeBlock>
        <Callout tone="warn">
          SVM não escala: treino é O(n²) a O(n³). Acima de ~50k exemplos, abandone em favor de logistic regression com SGD ou árvores boostadas.
        </Callout>
      </Section>

      <Section title="Padrão de projeto: pipeline + CV + métrica honesta" accent={accent}>
        <CodeBlock lang="python">{`from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.metrics import roc_auc_score

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipe, X, y, cv=cv, scoring='roc_auc')
print(f'AUC: {scores.mean():.3f} +/- {scores.std():.3f}')`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Comece sempre com logistic regression regularizada + CV estratificada. É o baseline honesto. Só parta para árvores/boosting se o baseline não for suficiente para a meta de negócio.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
