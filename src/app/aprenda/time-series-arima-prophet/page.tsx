import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('time-series-arima-prophet');

const accent = '#5b9bd5';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que ARIMA exige estacionariedade?',
    options: [
      'Exigência arbitrária',
      'O modelo assume que propriedades estatísticas (média, variância, autocorrelação) são constantes no tempo. Sem estacionariedade, os coeficientes estimados não generalizam. Teste com ADF; trate com differencing (o "I" de ARIMA)',
      'Só em Python',
      'Apenas para forecasting longo',
    ],
    correct: 1,
    explanation: 'AR e MA assumem processo estacionário. Séries reais quase nunca são: têm tendência e sazonalidade. Integration (I=d) aplica differencing d vezes para remover tendência. ADF test (augmented Dickey-Fuller) rejeita hipótese de raiz unitária quando p &lt; 0.05.',
  },
  {
    question: 'Quando Prophet é uma boa escolha sobre ARIMA?',
    options: [
      'Nunca',
      'Em séries de negócio com múltiplas sazonalidades (diária + semanal + anual), feriados, mudanças de regime e tolerância a dados faltantes. Prophet é robusto, interpretable e não exige estacionariedade',
      'Sempre',
      'Só com dados perfeitos',
    ],
    correct: 1,
    explanation: 'Prophet (Meta) modela trend + seasonality + holidays aditivamente, com regressão bayesiana. É menos preciso que modelos estatais bem ajustados, mas muito mais resistente a ruído e falhas. Para forecasting de demanda em retail com feriados complexos, é o default pragmático.',
  },
  {
    question: 'Qual erro é mais perigoso em backtesting temporal?',
    options: [
      'Escolher gap pequeno',
      'Fazer KFold embaralhado em vez de walk-forward — o modelo "vê o futuro" e reporta erro irrealisticamente baixo. Em produção, desempenho despenca',
      'Usar MAE em vez de RMSE',
      'Plotar o gráfico errado',
    ],
    correct: 1,
    explanation: 'Em série temporal, cada ponto depende do passado. KFold aleatório coloca t=100 em train e t=50 em val — fisicamente impossível. Walk-forward (TimeSeriesSplit) respeita ordem: train em [0,T], valida em [T+1, T+k], avança. Inclua gap &gt; 0 se há autocorrelação de curto prazo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="time-series-arima-prophet"
      title="Time series: ARIMA, Prophet, Neural"
      icon="⏱️"
      xp={55}
      readTime={13}
      trailName="Machine Learning Clássico"
      trailColor={accent}
      nextSlug="recommender-systems-basico"
      nextTitle="Recommender systems básicos"
      quiz={quiz}
    >
      <Section title="Por que time series é um universo à parte" accent={accent}>
        <p>
          Séries temporais carregam dependência ordenada: o valor em <code>t</code> depende dos valores anteriores. Isso quebra a premissa iid (independente e identicamente distribuído) de ML clássico. Modelos e validação precisam respeitar a ordem.
        </p>
      </Section>

      <Section title="Estacionariedade, ACF e PACF" accent={accent}>
        <CodeBlock lang="python">{`import pandas as pd
from statsmodels.tsa.stattools import adfuller
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

# Teste de estacionariedade (ADF)
result = adfuller(series.dropna())
print(f'ADF statistic: {result[0]:.3f}')
print(f'p-value: {result[1]:.4f}')
# p &lt; 0.05 -> rejeita raiz unitária -> estacionário

# Differencing se não-estacionário
diff = series.diff().dropna()

# ACF/PACF para escolher p e q
plot_acf(diff, lags=40)   # sugere q (MA order)
plot_pacf(diff, lags=40)  # sugere p (AR order)`}</CodeBlock>
      </Section>

      <Section title="ARIMA e SARIMA" accent={accent}>
        <CodeBlock lang="python">{`from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX

# ARIMA(p, d, q) — p AR terms, d differencing, q MA terms
model = ARIMA(train, order=(2, 1, 2))
fit = model.fit()
forecast = fit.forecast(steps=30)

# SARIMA adiciona sazonalidade (P, D, Q, s)
sarima = SARIMAX(
    train,
    order=(1, 1, 1),
    seasonal_order=(1, 1, 1, 12),  # s=12 para dados mensais com sazonalidade anual
    enforce_stationarity=False,
    enforce_invertibility=False,
)
sarima_fit = sarima.fit(disp=False)
print(sarima_fit.summary())`}</CodeBlock>
        <Callout tone="info">
          Use <code>pmdarima.auto_arima</code> para busca automática de ordem. Ele roda AIC/BIC sobre várias combinações (p, d, q) e retorna a melhor. Economiza horas de tentativa manual.
        </Callout>
      </Section>

      <Section title="Prophet — baseline de produção" accent={accent}>
        <CodeBlock lang="python">{`from prophet import Prophet

# Prophet espera colunas 'ds' (datetime) e 'y' (valor)
df_p = df.rename(columns={'date': 'ds', 'sales': 'y'})

m = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,
    changepoint_prior_scale=0.05,   # flexibilidade de mudanças de tendência
    seasonality_mode='multiplicative',
)
m.add_country_holidays(country_name='BR')
m.fit(df_p)

future = m.make_future_dataframe(periods=90)
forecast = m.predict(future)
m.plot(forecast)
m.plot_components(forecast)  # decomposição em trend + seasonality + holidays`}</CodeBlock>
        <Callout tone="warn">
          Prophet erra quando há autocorrelação forte de curto prazo (horário, minuto). Para dados de alta frequência, prefira modelos clássicos ou deep (NeuralProphet, DeepAR).
        </Callout>
      </Section>

      <Section title="Backtesting walk-forward" accent={accent}>
        <CodeBlock lang="python">{`from sklearn.model_selection import TimeSeriesSplit
import numpy as np

tss = TimeSeriesSplit(n_splits=5, test_size=30, gap=0)
maes = []
for train_idx, val_idx in tss.split(series):
    train, val = series.iloc[train_idx], series.iloc[val_idx]
    m = ARIMA(train, order=(2, 1, 2)).fit()
    pred = m.forecast(steps=len(val))
    maes.append(np.mean(np.abs(val.values - pred.values)))

print(f'MAE walk-forward: {np.mean(maes):.2f} +/- {np.std(maes):.2f}')`}</CodeBlock>
      </Section>

      <Section title="Neural para time series" accent={accent}>
        <p>
          DeepAR (AWS), NBEATS, Temporal Fusion Transformer e <code>neuralforecast</code> (Nixtla) ganham quando há muitas séries relacionadas (demand forecasting multi-produto) e features exógenas. Para uma série única, raramente valem o custo.
        </p>
        <Callout tone="success" icon="✅">
          Regra sênior: comece com seasonal naive baseline, depois Prophet, depois SARIMA, depois neural. Só escale complexidade quando a métrica justificar — em 70% dos casos Prophet basta para entregar valor em produção.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
