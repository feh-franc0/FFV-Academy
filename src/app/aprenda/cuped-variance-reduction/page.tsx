import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cuped-variance-reduction');

const accent = '#d946ef';

const quiz: QuizQuestion[] = [
  {
    question: 'O que CUPED faz com os dados do experimento?',
    options: [
      'Descarta outliers',
      'Ajusta a metrica de cada usuario subtraindo uma covariavel pre-experimento (tipicamente o proprio valor da metrica em janela anterior) ponderada por theta, reduzindo variance sem introduzir bias',
      'Aumenta amostra artificialmente',
      'Divide por dois',
    ],
    correct: 1,
    explanation: 'CUPED (Controlled experiments Using Pre-Experimental Data) foi publicado por Deng, Xu, Kohavi e Walker (Microsoft 2013). A ideia: usuario que gastou muito antes do experimento tende a gastar muito durante — essa variabilidade baseline infla variance e diminui power. CUPED remove essa parte previsivel.',
  },
  {
    question: 'Qual reducao tipica de variance CUPED entrega?',
    options: [
      '1-2%',
      '30-50% em metricas com forte autocorrelacao temporal (revenue, sessions) — equivalente a rodar experimento 2x mais rapido para mesma confiabilidade',
      '90%+',
      'Nenhuma',
    ],
    correct: 1,
    explanation: 'Microsoft, Netflix e Booking.com reportam 30-50% de reducao em variance em metricas tipo revenue, engagement, session count. Em metricas binarias (click/no-click) o ganho e menor. Reducao de variance se traduz em amostra menor: variance caindo pela metade equivale a 2x mais usuarios na amostra original.',
  },
  {
    question: 'Quando CUPED NAO ajuda?',
    options: [
      'Sempre ajuda muito',
      'Quando a covariavel escolhida tem baixa correlacao com a metrica (novos usuarios sem historico, metrica sem autocorrelacao) — nesses casos theta fica perto de zero e o ajuste vira ruido',
      'Em experimentos grandes',
      'No Bayesian',
    ],
    correct: 1,
    explanation: 'Power do CUPED e proporcional a rho² entre covariavel e metrica. Para novos usuarios (sem pre-experiment data), vc fica com a formula classica. Para metricas pouco auto-correlacionadas (first-visit conversion), ganho e pequeno. Regra: medir rho antes de prometer reducao.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cuped-variance-reduction"
      title="CUPED + variance reduction"
      icon="📉"
      xp={55}
      readTime={13}
      trailName="Product Engineering & Experimentation"
      trailColor={accent}
      nextSlug="guardrails-experiments"
      nextTitle="Guardrails em experiments"
      quiz={quiz}
    >
      <Section title="O problema: variance mata power" accent={accent}>
        <p>
          Metrica como revenue per user tem cauda longa: 5% dos usuarios geram 50% da receita. Variance alta exige amostra gigante para detectar efeito pequeno. CUPED explora o fato de que muito dessa variance e previsivel pelo comportamento passado do usuario.
        </p>
      </Section>

      <Section title="A formula" accent={accent}>
        <CodeBlock lang="markdown">{`Y_adjusted = Y - theta * (X - X_mean)

onde:
  Y        = metrica durante o experimento (ex: revenue na semana do teste)
  X        = covariavel pre-experimento (ex: revenue na semana anterior)
  theta    = cov(Y, X) / var(X)          (regressao de Y em X)
  X_mean   = media de X entre todos os usuarios

intuicao:
  - usuario ja "esperado" a gastar muito (X alto) tem Y ajustado para baixo
  - usuario que "surpreende" (Y alto dado X baixo) permanece destacado
  - theta e o peso otimo que minimiza variance sem introduzir bias

ganho:
  var(Y_adjusted) = var(Y) * (1 - rho²)
  rho = 0.7 -> reducao de 49% em variance`}</CodeBlock>
      </Section>

      <Section title="Implementacao em Python" accent={accent}>
        <CodeBlock lang="python">{`import numpy as np
import pandas as pd
from scipy import stats

def cuped_adjust(df: pd.DataFrame, y_col: str, x_col: str) -> pd.Series:
    x = df[x_col].values
    y = df[y_col].values
    theta = np.cov(y, x, ddof=1)[0, 1] / np.var(x, ddof=1)
    return y - theta * (x - x.mean())

# df tem: user_id, variant, revenue_pre, revenue_exp
df['revenue_cuped'] = cuped_adjust(df, 'revenue_exp', 'revenue_pre')

control = df[df.variant == 'control']['revenue_cuped']
treatment = df[df.variant == 'treatment']['revenue_cuped']

# t-test na metrica ajustada
t, p = stats.ttest_ind(treatment, control, equal_var=False)
lift = treatment.mean() - control.mean()
print(f'lift={lift:.4f}  p={p:.4f}')

# comparar variance antes e depois
rho = np.corrcoef(df['revenue_exp'], df['revenue_pre'])[0, 1]
print(f'rho={rho:.3f}  reducao_variance={1 - (1 - rho**2):.1%}')`}</CodeBlock>
        <Callout tone="info">
          Escolha de X importa. Em Microsoft, eles tipicamente usam a mesma metrica na janela anterior de mesmo tamanho. Em Booking, somam 2-4 semanas para estabilizar. Teste rho antes de prometer ganho no stakeholder.
        </Callout>
      </Section>

      <Section title="Armadilhas" accent={accent}>
        <Callout tone="warn">
          theta precisa ser calculado no POOL (todos usuarios, control + treatment), nao dentro de cada variante. Calcular por variante introduz bias porque usa outcome para escolher peso. Esse erro e frequente em implementacoes caseiras.
        </Callout>
        <p>
          Usuarios novos sem janela pre-experimento: incluir com X = 0 e flag de newcomer como segunda covariavel (CUPAC generaliza para multiplas). Ou separar analise em segmentos.
        </p>
      </Section>

      <Section title="Alternativas" accent={accent}>
        <p>
          Stratification (blocking por segmento), regression adjustment (ANCOVA), machine learning covariates (tea, PrePost). GrowthBook tem CUPED built-in; Statsig e Eppo tambem. Implementar do zero e bom exercicio mas em producao use ferramenta com testes.
        </p>
      </Section>
    </ModuleLayout>
  );
}
