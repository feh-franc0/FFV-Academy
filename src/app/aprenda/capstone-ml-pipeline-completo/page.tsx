import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-ml-pipeline-completo');

const accent = '#5b9bd5';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre um capstone "portfolio-grade" e um notebook de Kaggle?',
    options: [
      'Tamanho',
      'Capstone entrega pipeline reprodutível (código + testes + CI), modelo deployado via API (FastAPI/BentoML), métricas honestas com CI bootstrap e documentação de trade-offs — não só score',
      'UI bonita',
      'Volume de dados',
    ],
    correct: 1,
    explanation: 'Recrutador sênior ignora "AUC 0.99 no notebook". Olha: Dockerfile, tests/, README com hypothesis + results + limitations, /predict endpoint com latência medida, model card com viés conhecido. Demonstra pensamento de engenharia, não só habilidade de ajustar hiperparâmetro.',
  },
  {
    question: 'Por que expor o modelo via FastAPI/BentoML em vez de um notebook público?',
    options: [
      'Hype',
      'Força você a lidar com serialização, validação de input (Pydantic), latência, contrato versionado e observabilidade — exatamente as competências que separam ML engineer de data scientist',
      'Melhor UX',
      'Apenas moda',
    ],
    correct: 1,
    explanation: 'API expõe gaps: schema de input quebra com edge cases, modelo não sabe lidar com NaN, latência p99 &gt; 500ms sem warm-up. Esses problemas não aparecem no notebook e definem se o modelo vai para produção. BentoML bundle + Docker + health check = pacote deployável em qualquer orquestrador.',
  },
  {
    question: 'Qual entregável é o mais importante para contratação?',
    options: [
      'Código bruto',
      'Writeup estruturado (README ou post) com: problema, dataset, EDA, feature engineering, modelos comparados, métricas com CI, trade-offs, limitações e próximos passos — link para repo + demo deployed',
      'Slides',
      'Só o PDF',
    ],
    correct: 1,
    explanation: 'Engenheiro sênior comunica pensamento. Writeup mostra: definiu problema, investigou data (não confiou cego), iterou com rigor, entendeu o que o modelo erra, sabe evoluir. É isso que hiring manager lê em 5 minutos para decidir o próximo call. Code quality importa, mas writeup vende.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-ml-pipeline-completo"
      title="Capstone: pipeline ML end-to-end"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="Machine Learning Clássico"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Escolha um dataset tabular real (Kaggle, UCI, dados públicos do governo) com pelo menos 50k linhas e problema de negócio claro. Construa pipeline end-to-end: EDA → feature engineering → modelagem → avaliação honesta → deploy em API → documentação.
        </p>
        <Callout tone="info">
          Sugestões: Home Credit Default Risk (crédito), Instacart Market Basket (reco), Walmart Sales (forecasting), Telco Churn (classificação). Evite Titanic e Iris — são didáticos, não portfolio.
        </Callout>
      </Section>

      <Section title="Estrutura de repositório" accent={accent}>
        <CodeBlock lang="bash">{`ml-capstone/
├── README.md              # writeup completo (&lt; 2000 palavras)
├── pyproject.toml         # deps reproduzíveis (uv ou poetry)
├── Dockerfile             # imagem pronta para deploy
├── data/
│   ├── raw/.gitkeep       # não commitar dados
│   └── processed/.gitkeep
├── notebooks/
│   ├── 01_eda.ipynb       # análise exploratória
│   └── 02_modeling.ipynb
├── src/
│   ├── features.py        # transformações puras, testáveis
│   ├── train.py           # CLI: python -m src.train --config configs/xgb.yaml
│   ├── evaluate.py        # métricas + CI bootstrap
│   └── api.py             # FastAPI app
├── tests/
│   ├── test_features.py
│   └── test_api.py
├── configs/
│   └── xgb.yaml           # hiperparâmetros versionados
└── .github/workflows/ci.yml  # lint + tests + build`}</CodeBlock>
      </Section>

      <Section title="Pipeline de treino" accent={accent}>
        <CodeBlock lang="python">{`# src/train.py — reprodutível via CLI
import joblib
import pandas as pd
import xgboost as xgb
from sklearn.pipeline import Pipeline
from sklearn.model_selection import StratifiedKFold, cross_val_score
from src.features import build_preprocessor

def train(config_path: str) -> None:
    cfg = load_yaml(config_path)
    df = pd.read_parquet(cfg['data_path'])
    X, y = df.drop(columns=[cfg['target']]), df[cfg['target']]

    pipe = Pipeline([
        ('prep', build_preprocessor(cfg)),
        ('model', xgb.XGBClassifier(**cfg['model_params'])),
    ])

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(pipe, X, y, cv=cv, scoring='roc_auc', n_jobs=-1)
    print(f'CV AUC: {scores.mean():.4f} +/- {scores.std():.4f}')

    pipe.fit(X, y)
    joblib.dump(pipe, cfg['model_out'])`}</CodeBlock>
      </Section>

      <Section title="API de serving" accent={accent}>
        <CodeBlock lang="python">{`# src/api.py — FastAPI com Pydantic e health check
from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
import pandas as pd

app = FastAPI(title='ML Capstone API', version='1.0.0')
model = joblib.load('artifacts/model.pkl')

class PredictRequest(BaseModel):
    features: dict[str, float | str | None] = Field(..., description='Feature map')

class PredictResponse(BaseModel):
    probability: float
    model_version: str

@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}

@app.post('/predict', response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    X = pd.DataFrame([req.features])
    proba = float(model.predict_proba(X)[0, 1])
    return PredictResponse(probability=proba, model_version='1.0.0')`}</CodeBlock>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone ML — Checklist de entrega

## 1. Dataset e EDA
- Fonte documentada, licença clara
- Análise de distribuição, missing values, target balance
- Hipóteses de negócio levantadas

## 2. Feature engineering
- Código em src/features.py, com testes unitários
- Sem leakage (target encoding OOF, temporal shift)
- Importância das features documentada (SHAP)

## 3. Modelagem
- Pelo menos 3 baselines (LogReg + RF + XGBoost)
- Hyperparameter tuning com Optuna ou grid
- Cross-validation estratificada

## 4. Avaliação honesta
- ROC-AUC, PR-AUC, Precision/Recall@K
- Intervalo de confiança via bootstrap
- Análise de erros por slice (idade, região, etc.)

## 5. Deploy
- FastAPI ou BentoML bundle
- Dockerfile buildable
- Latência p50/p95/p99 medida

## 6. Documentação
- README com hypothesis → results → limitations
- Model card (viés, limitações, use cases)
- Link para demo deployed (Fly.io, Railway, HF Spaces)`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Capstone desse nível vale mais que 5 cursos certificados. Recrutador abre o repo, lê README, testa <code>/predict</code>, olha CI verde — e decide te chamar. É o único artefato que prova que você entrega ML em produção, não só em notebook.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
