import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ab-testing-rigoroso');

const accent = '#d946ef';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que p &lt; 0.05 isoladamente e insuficiente para declarar vitoria?',
    options: [
      'Porque e numero muito alto',
      'Porque p-value depende de tamanho de amostra, direcao de hipotese, numero de metricas testadas e quando voce olhou os dados — sem power analysis e pre-registro voce gera falso positivo facilmente',
      'Porque deveria ser p &lt; 0.5',
      'Nunca e insuficiente',
    ],
    correct: 1,
    explanation: 'Peeking (olhar N vezes) infla falso positivo para muito alem de 5%. Testar 10 metricas sem correcao de Bonferroni tambem. p-value honesto pressupoe: amostra minima calculada antes, uma metrica primaria, uma analise no final. Sequential testing (Alpha-spending, SPRT) resolve peeking legitimo.',
  },
  {
    question: 'O que power analysis determina?',
    options: [
      'Voltagem do servidor',
      'Tamanho minimo de amostra por variante para detectar efeito MDE (minimum detectable effect) com probabilidade 1-beta, dado alpha e baseline',
      'Numero de variantes',
      'Duracao do cache',
    ],
    correct: 1,
    explanation: 'Power = 1 - beta (tipicamente 0.8). Formula: n ≈ 16 * sigma² / delta² por variante para t-test de medias. Sem power analysis, voce ou roda demais (desperdicio) ou de menos (inconclusivo disfarcado de negativo). Toda ferramenta seria expoe calculadora.',
  },
  {
    question: 'O que e peeking problem e como mitigar?',
    options: [
      'Bug no dashboard',
      'Olhar resultados parciais e parar quando der significancia — isso infla falso positivo de 5% para 20%+. Mitiga com sample size pre-calculado, sequential testing (Alpha-spending, SPRT) ou Bayesian continuous monitoring',
      'Usuario espiando concorrente',
      'Nao existe',
    ],
    correct: 1,
    explanation: 'Optimizely, Microsoft e Netflix publicaram estudos mostrando que peeking ingenuo dobra ou triplica a taxa real de falso positivo. Opcoes: (1) comprometer com n e duracao antes, (2) usar sequential test que ajusta alpha a cada olhada, (3) Bayesian (posterior probability converge sem mesmo problema).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ab-testing-rigoroso"
      title="A/B testing estatisticamente rigoroso"
      icon="📊"
      xp={55}
      readTime={13}
      trailName="Product Engineering & Experimentation"
      trailColor={accent}
      nextSlug="cuped-variance-reduction"
      nextTitle="CUPED + variance reduction"
      quiz={quiz}
    >
      <Section title="Pipeline honesto" accent={accent}>
        <CodeBlock lang="markdown">{`1. Hipotese escrita (1 metrica primaria, 2-3 guardrails)
2. Power analysis -> n minimo por variante
3. Pre-registro: MDE, alpha, beta, duracao, metricas
4. Random assignment estavel (hash por user_id)
5. Instrumentacao + SRM check (Sample Ratio Mismatch)
6. Rodar ate n atingido (nao parar antes)
7. Analise unica no final (ou sequential test declarado antes)
8. Decisao: promote, reject, iterate
9. Writeup com limitations`}</CodeBlock>
      </Section>

      <Section title="Power analysis na pratica" accent={accent}>
        <CodeBlock lang="python">{`import math

def sample_size_per_arm(
    baseline: float,      # conversao atual (ex 0.12)
    mde_relative: float,  # efeito minimo detectavel (ex 0.05 = 5% relativo)
    alpha: float = 0.05,
    power: float = 0.80,
) -> int:
    # aproximacao para proporcoes (two-sided)
    from scipy.stats import norm
    z_alpha = norm.ppf(1 - alpha / 2)
    z_beta = norm.ppf(power)
    p1 = baseline
    p2 = baseline * (1 + mde_relative)
    p_bar = (p1 + p2) / 2
    num = (z_alpha * math.sqrt(2 * p_bar * (1 - p_bar))
           + z_beta * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2
    den = (p2 - p1) ** 2
    return math.ceil(num / den)

# Exemplo: 12% baseline, detectar lift de 5% relativo
# sample_size_per_arm(0.12, 0.05) -> ~29_700 por variante`}</CodeBlock>
        <Callout tone="info">
          Regra de bolso: para lift relativo de 5% em conversao de 10%, voce precisa de ~30k por variante. Quer detectar 1%? Precisa de 750k+. Isso define se o experimento e viavel antes de gastar energia.
        </Callout>
      </Section>

      <Section title="p-value honesto" accent={accent}>
        <p>
          p-value e: probabilidade de observar resultado tao ou mais extremo se a hipotese nula for verdadeira. NAO e: probabilidade de a hipotese ser falsa. Essa confusao gera decisoes ruins.
        </p>
        <Callout tone="warn">
          Multiple comparisons: testar 10 metricas com alpha 0.05 cada significa probabilidade de ~40% de pelo menos um falso positivo. Bonferroni (alpha / k) ou Benjamini-Hochberg para corrigir. Ou declarar UMA metrica primaria.
        </Callout>
      </Section>

      <Section title="SRM: o sanity check que todo mundo esquece" accent={accent}>
        <CodeBlock lang="python">{`# Sample Ratio Mismatch
# Se voce configurou 50/50 e observou 48k/52k, isso e suspeito?
from scipy.stats import chisquare

control_n, treatment_n = 48_012, 52_107
expected_ratio = 0.5
total = control_n + treatment_n
expected = [total * expected_ratio, total * (1 - expected_ratio)]
chi2, p = chisquare([control_n, treatment_n], f_exp=expected)

# p < 0.001 -> SRM detectado, INVALIDAR experimento
# Causas comuns: bot traffic, bug no assignment, logging assimetrico`}</CodeBlock>
      </Section>

      <Section title="Sequential testing" accent={accent}>
        <p>
          Se voce precisa olhar antes de atingir n (por exemplo, para detectar regressao de guardrail cedo), use SPRT ou Alpha-spending de O&apos;Brien-Fleming. Ambos preservam alpha global em troca de curva de decisao mais conservadora nas primeiras olhadas.
        </p>
      </Section>
    </ModuleLayout>
  );
}
