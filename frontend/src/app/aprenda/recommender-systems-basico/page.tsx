import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('recommender-systems-basico');

const accent = '#5b9bd5';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre collaborative filtering e content-based?',
    options: [
      'Nenhuma',
      'CF usa padrões de interação (usuários similares consomem itens similares) sem olhar conteúdo; content-based recomenda pela similaridade de atributos dos itens. Ambos têm pontos fortes distintos',
      'Content-based é mais novo',
      'CF é só neural',
    ],
    correct: 1,
    explanation: 'CF aprende de interações (user-item matrix), funciona sem features de item mas sofre de cold-start. Content-based usa metadados do item (embeddings textuais, categorias) — resiste a cold-start mas não captura serendipidade. Sistemas reais híbridos combinam ambos.',
  },
  {
    question: 'Qual problema matrix factorization (SVD/ALS) resolve em CF?',
    options: [
      'Nenhum',
      'Aprende representações latentes (embeddings) de users e items tais que o produto interno aproxime a interação observada — supera sparsidade e generaliza para pares não vistos',
      'Apenas compressão',
      'Só classificação',
    ],
    correct: 1,
    explanation: 'Matriz user-item é 99.9% esparsa. SVD/ALS decompõe em U @ V.T onde U é embedding de user e V de item (dim k=50-200). Predição para (u, i) é dot(U[u], V[i]). ALS alterna fix-U-optimize-V até convergir — escala para bilhões de interações.',
  },
  {
    question: 'O que é o cold-start problem?',
    options: [
      'Hardware',
      'Recomendar para user ou item novo sem histórico de interação. CF falha sem dados; mitiga-se com content-based, popularity fallback, two-tower com features ou onboarding explícito',
      'Só bug',
      'Problema de latência',
    ],
    correct: 1,
    explanation: 'User novo não tem histórico para CF inferir preferências. Soluções: usar features demográficas em two-tower, content-based sobre primeiros cliques, popularity bias controlado, e UX que coleta sinais rápidos (like/dislike inicial). Todo reco sério endereça cold-start explicitamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="recommender-systems-basico"
      title="Recommender systems básicos"
      icon="🎯"
      xp={50}
      readTime={12}
      trailName="Machine Learning Clássico"
      trailColor={accent}
      nextSlug="capstone-ml-pipeline-completo"
      nextTitle="Capstone: pipeline ML end-to-end"
      quiz={quiz}
    >
      <Section title="Recommender é problema de ranking" accent={accent}>
        <p>
          O objetivo não é prever o rating exato — é ordenar o catálogo para cada usuário. Métricas principais: <strong>Recall@K, Precision@K, NDCG@K, MAP</strong>. MSE em rating é indicador fraco: o que importa é se os top-K recomendados foram clicados/consumidos.
        </p>
      </Section>

      <Section title="Collaborative filtering: user-user e item-item" accent={accent}>
        <CodeBlock lang="python">{`import numpy as np
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity

# Matriz esparsa user-item (linhas=users, colunas=items)
R = csr_matrix((ratings, (user_ids, item_ids)))

# Item-item similarity (Amazon 2003, ainda dominante em produção)
item_sim = cosine_similarity(R.T, dense_output=False)

def recommend(user_id, top_k=10):
    user_items = R[user_id].toarray().flatten()
    scores = item_sim @ user_items
    scores[user_items &gt; 0] = -np.inf  # mascarar itens já vistos
    return np.argsort(-scores)[:top_k]`}</CodeBlock>
        <Callout tone="info">
          Item-item é mais estável que user-user: catálogos mudam menos que usuários. Pré-compute item_sim offline e sirva recomendações em latência de ms.
        </Callout>
      </Section>

      <Section title="Matrix factorization com ALS" accent={accent}>
        <CodeBlock lang="python">{`from implicit.als import AlternatingLeastSquares

# implicit library — ALS para implicit feedback (clicks, views)
model = AlternatingLeastSquares(
    factors=64,              # dim do embedding
    regularization=0.01,
    iterations=20,
    use_gpu=True,
)

# R deve ser user-item com valores = confiança (clicks, tempo, peso)
model.fit(R)

# Recomendação para user_id
ids, scores = model.recommend(user_id, R[user_id], N=10, filter_already_liked_items=True)`}</CodeBlock>
        <Callout tone="warn">
          ALS de implicit feedback difere de SVD em ratings explícitos: não preenche zeros como "não gostou" — trata como observação faltante com peso menor. Usar o modelo errado inverte o sinal e produz recomendações absurdas.
        </Callout>
      </Section>

      <Section title="Content-based e híbrido" accent={accent}>
        <CodeBlock lang="python">{`from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

# Content-based para cold-start de item
tfidf = TfidfVectorizer(max_features=10000, ngram_range=(1, 2))
item_vecs = tfidf.fit_transform(items_df['description'])

def similar_items(item_id, top_k=10):
    sims = linear_kernel(item_vecs[item_id], item_vecs).flatten()
    return np.argsort(-sims)[1:top_k + 1]

# Híbrido simples: score = alpha * CF + (1 - alpha) * content
final_score = 0.7 * cf_score + 0.3 * content_score`}</CodeBlock>
      </Section>

      <Section title="Two-tower neural (o padrão moderno)" accent={accent}>
        <CodeBlock lang="python">{`# Two-tower: uma torre encoda user, outra encoda item
# Treina com contrastive loss -> embeddings próximos no espaço
import torch
import torch.nn as nn

class TwoTower(nn.Module):
    def __init__(self, n_users, n_items, dim=64):
        super().__init__()
        self.user_tower = nn.Sequential(
            nn.Embedding(n_users, dim),
            nn.Linear(dim, dim), nn.ReLU(), nn.Linear(dim, dim),
        )
        self.item_tower = nn.Sequential(
            nn.Embedding(n_items, dim),
            nn.Linear(dim, dim), nn.ReLU(), nn.Linear(dim, dim),
        )

    def forward(self, u, i):
        return (self.user_tower(u) * self.item_tower(i)).sum(-1)`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Em produção (YouTube, Spotify, Netflix), two-tower alimenta candidate generation, depois um ranker downstream (gradient boosting ou DNN) reordena top 500 → top 20 com features contextuais. Essa é a arquitetura canônica de 2026.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
