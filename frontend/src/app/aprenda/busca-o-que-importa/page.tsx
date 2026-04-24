import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('busca-o-que-importa');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença prática entre precision@k e recall@k em um search system?',
    options: [
      'São iguais',
      'Precision@k: dos k resultados retornados, quantos são relevantes? Recall@k: do total de relevantes existentes, quantos estão nos top k? Precision importa quando usuário só olha top-5 (e-commerce); recall importa quando completude é crítica (legal, medical, compliance)',
      'Recall é sempre melhor',
      'Precision é só matemático',
    ],
    correct: 1,
    explanation: 'Considere 100 documentos no corpus, 10 são relevantes pra query. Sistema retorna top-5: 3 relevantes, 2 irrelevantes. Precision@5 = 3/5 = 0.6. Recall@5 = 3/10 = 0.3. Duas métricas, diferentes perguntas. Busca de e-commerce otimiza precision top-5 (user clica nos primeiros). Busca legal otimiza recall — perder documento relevante é catastrófico. F1 combina as duas quando ambas importam.',
  },
  {
    question: 'Por que NDCG (Normalized Discounted Cumulative Gain) é métrica superior para ranking?',
    options: [
      'Fórmula bonita',
      'NDCG pondera posição (documento relevante em posição 1 vale mais que em posição 10, desconto logarítmico) e aceita relevância graduada (não só binário "relevante/não", mas escala 0-3). Reflete como humanos realmente consomem ranking — atenção cai rápido com posição',
      'É mais simples',
      'Substitui precision',
    ],
    correct: 1,
    explanation: 'Precision@k trata como conjunto (ordem não importa entre os k). Realidade: usuário clica mais no #1 que no #10 por ordem de magnitude. NDCG: cada posição tem desconto log2(i+1), soma dos gains normalizada pelo ideal (melhor ranking possível). Também aceita relevância graduada — item "perfeito" vs "razoável" vs "irrelevante". É a métrica que Google, Amazon e times de IR sérios usam em leaderboards.',
  },
  {
    question: 'O que é golden set e por que não pode ser ignorado?',
    options: [
      'Dataset de treino',
      'Conjunto fixo de queries com relevância anotada manualmente — verdade de referência contra a qual cada iteração do sistema é medida. Sem ele, "ficou melhor?" vira opinião; com ele, vira medição reproduzível que permite A/B de changes',
      'Dados sintéticos',
      'Benchmarks públicos só',
    ],
    correct: 1,
    explanation: '50–200 queries representativas + documentos anotados como relevantes/irrelevantes (idealmente por 2 anotadores com agreement > 70%). Ao mudar algoritmo, você roda no golden set e compara NDCG@10 antes/depois. Estatística contra subjetividade. Sem golden set, search engineering é alquimia — qualquer mudança "parece melhor" pra quem implementou. Golden set pode começar pequeno (20 queries) e crescer.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="busca-o-que-importa"
      title="Busca: o que importa (precision, recall, NDCG)"
      icon="📐"
      xp={50}
      readTime={12}
      trailName="Search & Information Retrieval"
      trailColor={accent}
      nextSlug="full-text-search-postgres"
      nextTitle="Full-text search em Postgres: tsvector + GIN"
      quiz={quiz}
    >
      <Section title="Busca é problema de medição antes de ser problema técnico" accent={accent}>
        <p>
          Times que pulam métricas e vão direto pra &quot;trocar por Elasticsearch&quot; quase sempre pioram a busca. Sem régua, você otimiza na direção errada e nem percebe. Antes de qualquer troca de stack, estabeleça: que métrica, contra qual dataset, qual baseline atual. Só depois, iterate.
        </p>
      </Section>

      <Section title="Métricas fundamentais" accent={accent}>
        <CodeBlock lang="python">{`# Definições operacionais
from typing import List

def precision_at_k(retrieved: List[str], relevant: set, k: int) -> float:
    """Dos top-k retornados, quantos são relevantes?"""
    top_k = retrieved[:k]
    hits = sum(1 for r in top_k if r in relevant)
    return hits / k

def recall_at_k(retrieved: List[str], relevant: set, k: int) -> float:
    """Do total de relevantes, quantos apareceram nos top-k?"""
    if not relevant:
        return 0.0
    top_k = retrieved[:k]
    hits = sum(1 for r in top_k if r in relevant)
    return hits / len(relevant)

def mrr(retrieved: List[str], relevant: set) -> float:
    """Mean Reciprocal Rank — 1/posição do primeiro relevante."""
    for i, r in enumerate(retrieved, 1):
        if r in relevant:
            return 1 / i
    return 0.0

# F1 = média harmônica precision/recall quando ambas importam`}</CodeBlock>
      </Section>

      <Section title="NDCG — a métrica que importa em ranking" accent={accent}>
        <CodeBlock lang="python">{`import math
from typing import List

def dcg(relevances: List[float]) -> float:
    """Discounted Cumulative Gain: soma rel_i / log2(i+1)"""
    return sum(rel / math.log2(i + 2) for i, rel in enumerate(relevances))

def ndcg_at_k(ranked_relevances: List[float], k: int) -> float:
    """Normalizado pelo ideal (ordenação perfeita decrescente)"""
    dcg_k = dcg(ranked_relevances[:k])
    ideal = dcg(sorted(ranked_relevances, reverse=True)[:k])
    return dcg_k / ideal if ideal > 0 else 0.0

# Exemplo: ranking atual [3, 0, 2, 1, 0] vs ideal [3, 2, 1, 0, 0]
# ndcg@5 mede quão perto o sistema está do ranking ótimo
# Valor 0-1; em produção, alvo NDCG@10 ≥ 0.7 é sólido`}</CodeBlock>
      </Section>

      <Section title="Golden set — crie o seu" accent={accent}>
        <CodeBlock lang="markdown">{`# Processo pragmático de golden set

## 1. Amostre queries reais
- Pegue 100 queries do log de produção (histograma + aleatório)
- Garanta diversidade: short (1-2 palavras), medium, long-tail

## 2. Anote relevância
- Escala 0 (irrelevante), 1 (marginal), 2 (relevante), 3 (perfeito)
- 2 anotadores, meça Cohen's kappa (> 0.6 é OK, > 0.8 é bom)
- Resolver disagreement em reunião curta

## 3. Estratifique
- Queries "fáceis" (termos exatos no title)
- Queries "médias" (parafraseadas)
- Queries "difíceis" (sinônimos, intent ambíguo)

## 4. Rode baseline + iterações
- Mede NDCG@10 atual
- Cada mudança compara contra baseline
- Significância: paired t-test ou bootstrap CI

## 5. Mantenha vivo
- Adicione queries novas trimestralmente
- Re-anote amostra 2x/ano (drift de relevância)`}</CodeBlock>
        <Callout tone="success" icon="📏">
          Search engineering sem golden set é fé. Com golden set, vira ciência. Primeira entrega de qualquer projeto de busca sério deve ser: 50 queries anotadas + pipeline de eval rodando em CI.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
