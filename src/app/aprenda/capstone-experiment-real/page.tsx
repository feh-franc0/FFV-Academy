import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-experiment-real');

const accent = '#d946ef';

const quiz: QuizQuestion[] = [
  {
    question: 'O que o writeup final precisa mostrar para valer como portfolio?',
    options: [
      'Codigo e print',
      'Hipotese pre-registrada, power analysis, SRM check, analise primaria com CUPED, guardrails verificados, decisao justificada por data, limitations honestos — processo, nao so resultado',
      'Numero bonito',
      'Apenas o grafico',
    ],
    correct: 1,
    explanation: 'Recruiter senior le writeup para avaliar rigor. Se voce mostra hipotese, amostra pre-calculada, SRM, CUPED, guardrails e limitations, voce prova que pensa como experimentador. Resultado positivo sem processo vale menos que resultado inconclusivo com processo claro.',
  },
  {
    question: 'Experimento em dataset publico conta?',
    options: [
      'Nao',
      'Sim — MovieLens, Criteo, Kaggle A/B tests. O que importa e aplicar o pipeline completo (hipotese, power, CUPED, guardrail, writeup). Bonus se voce documentar por que escolheu o dataset e suas limitacoes',
      'So com dado proprio',
      'So com Kaggle',
    ],
    correct: 1,
    explanation: 'Datasets publicos tem a vantagem de ser reproduziveis. Critico e: declarar hipotese ANTES de rodar, nao cherry-pickar apos olhar. Repro em notebook com seed fixo + writeup estruturado e altamente valorizado.',
  },
  {
    question: 'Qual armadilha evitar no capstone?',
    options: [
      'Ser honesto',
      'Inflar conclusao: reportar p-value sem corrigir multiple comparisons, nao fazer SRM, ignorar guardrail que regrediu, pular power analysis. Recruiter senior detecta em 5 minutos e descarta candidato',
      'Usar Python',
      'Documentar em Markdown',
    ],
    correct: 1,
    explanation: 'Recruiter de growth/data em Meta, Airbnb, Stripe, Nubank le ~100 writeups por trimestre. Os que sobrevivem sao rigorosos e humildes. Inflar resultado e pior que resultado inconclusivo — mostra que voce nao sabe o que esta fazendo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-experiment-real"
      title="Capstone: experiment end-to-end"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="Product Engineering & Experimentation"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Rode um experimento completo com rigor estatistico e documente como portfolio. Pode ser em produto proprio, side project ou dataset publico (MovieLens, Criteo, Kaggle). O que vale e o processo.
        </p>
      </Section>

      <Section title="Entregaveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone Experiment — Entregaveis

## 1. Hipotese pre-registrada
- Metrica primaria (1), direcao, MDE
- Guardrails (3-5) com thresholds
- Data de inicio, duracao, sample size calculado

## 2. Setup
- Feature flag em GrowthBook/Unleash (config YAML)
- Assignment estavel (hash por user_id)
- Instrumentacao PostHog/Mixpanel com tracking plan

## 3. Monitoramento
- SRM check diario (chi-square)
- Guardrails em sequential test (alpha-spending)
- Log de qualquer decisao de pausa/ajuste

## 4. Analise final
- Metrica primaria com CUPED
- Intervalos de confianca, nao so p-value
- Guardrails verificados com delta + CI
- Segmentacao (por plano, pais, device) com correcao de multiple comparisons

## 5. Writeup
- Contexto e hipotese
- Metodologia (porque essas escolhas)
- Resultados com graficos
- Decisao e trade-offs
- Limitations honestos
- Proximo experimento

## 6. Repositorio publico
- README com hipotese e decisao em primeiro paragrafo
- Notebook reproduzivel (seed fixo)
- Dashboard (PostHog/Metabase/Plotly)
- Link para post no blog se aplicavel`}</CodeBlock>
      </Section>

      <Section title="Template de writeup" accent={accent}>
        <CodeBlock lang="markdown">{`# [nome do experimento]

## Hipotese
Mudanca X vai aumentar metrica Y em Z% (MDE), sem regredir guardrails A, B, C.

## Setup
- Baseline: Y = 0.12
- MDE: +5% relativo -&gt; sample size 29_700/variante
- Duracao prevista: 14 dias
- Assignment: 50/50 por hash(user_id + experiment_id)

## Resultados
- Metrica primaria (CUPED): lift +3.2% [CI 95%: +1.1%, +5.4%], p=0.008
- Guardrail p95_latency: +12ms [CI: +4, +20] — dentro do budget (+30ms)
- Guardrail crash_rate: -0.0001 [CI: -0.0003, +0.0001] — nao significativo
- SRM: chi² p=0.42 (OK)

## Decisao
PROMOTE. Lift real ainda que abaixo do MDE de 5%. Custo de latency aceitavel.

## Limitations
- Segmento de newcomers teve lift nao significativo (n baixo)
- Experimento rodou durante promocao concorrente — replicar em janela limpa

## Next
Testar variante com copy mais curta (hipotese: ganho vem de clareza).`}</CodeBlock>
      </Section>

      <Section title="Como isso converte em entrevista" accent={accent}>
        <Callout tone="success">
          Levar writeup para system design entrevista de growth/product engineer muda o jogo. Entrevistador pergunta &quot;como voce decidiria entre A e B&quot; — voce responde apontando para o repo com o pipeline completo. Tempo de prova ganho, sinal forte dado.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
