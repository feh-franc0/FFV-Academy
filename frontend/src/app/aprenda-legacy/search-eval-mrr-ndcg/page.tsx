import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, KeyValue, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('search-eval-mrr-ndcg');

const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  { question: 'MRR (Mean Reciprocal Rank) mede:', options: ['Quantos relevantes no top-K', 'Para cada query, posição do PRIMEIRO resultado relevante. MRR = média(1/posição). Foca em "rapidez para achar o primeiro relevante" — bom para fact-finding / single-answer', 'Tempo', 'Latência'], correct: 1, explanation: 'MRR é mais informativo quando há 1 resposta correta por query (FAQ, lookup). Score 1.0 = sempre primeiro; 0.5 = sempre segundo; ...' },
  { question: 'NDCG@K (Normalized Discounted Cumulative Gain) diferencia-se por:', options: ['Mede latência', 'Considera graded relevance (0-3) e posição: relevance mais alto no topo conta mais; discount logarítmico por posição; normalizado por IDCG (ideal). Métrica padrão para ranking multi-relevância', 'Mede precisão pura', 'Apenas para click'], correct: 1, explanation: 'NDCG@10 é o "S&P 500" das métricas de search. Usa relevance graduada (não binária). Posição importa logarítmicamente. Normalizado [0, 1] facilita comparação cross-dataset.' },
  { question: 'Golden dataset deve ser:', options: ['Aleatório', 'Curado: representativo da distribuição real de queries (não só "exemplos fáceis"), com relevance judgments por humanos com inter-annotator agreement, atualizado periodicamente. 200-500 queries para production-grade', 'Sintético apenas', 'O menor possível'], correct: 1, explanation: 'Golden dataset é o ground truth. Sem ele, A/B test é cego. Inclui queries head (frequentes), torso, tail (raras). Pareceres humanos com 2+ avaliadores; kappa > 0.7 para confiabilidade.' },
  { question: 'A/B test online de ranking — sinal mais confiável:', options: ['CTR (click-through rate)', 'Combo: CTR + dwell time (tempo na página) + downstream conversion + return rate. CTR sozinho pode ser maximizado por clickbait', 'Tempo de carregamento', 'Cor do botão'], correct: 1, explanation: 'CTR isolado é manipulável (título sensacionalista vence). Combine com dwell time (rejeitou logo?), conversion downstream (comprou?), return rate (voltou?). Quality-of-result = stack de sinais.' },
  { question: 'Quando offline metric e online metric divergem?', options: ['Nunca', 'Frequentemente — sua amostra offline não captura distribuição real, ou relevance judgments humanos não refletem preferência real. Solução: shadow traffic + interleaving + A/B incremental', 'Sempre online é melhor', 'Sempre offline é melhor'], correct: 1, explanation: 'Divergência offline/online é o "vale da morte" de search. Offline diz "+5% NDCG"; online não move métrica de produto. Diagnóstico: golden set não-representativo, métrica wrong, ou queries reais têm intent diferente. Iteração: refinar golden + A/B sempre.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="search-eval-mrr-ndcg" title="Avaliação de busca: MRR, NDCG, P@K, golden datasets" icon="📊" xp={65} readTime={13}
      trailName="Search & IR Profundo" trailColor={accent} quiz={quiz}>
      <Section title="Sem métrica, você está chutando" accent={accent}>
        <p className="text-sm leading-6">Search é problema de optimization — você precisa de função objetivo. As 4 métricas canônicas: <b>P@K</b> (precision), <b>R@K</b> (recall), <b>MRR</b> (mean reciprocal rank), <b>NDCG@K</b> (normalized discounted cumulative gain).</p>
      </Section>
      <Section title="As métricas" accent={accent}>
        <AnnotatedFormula title="MRR" accent={accent} formula="MRR = (1/|Q|) · Σ_q (1 / rank_q)" parts={[
          { text: 'MRR', highlight: true, annotation: 'Mean Reciprocal Rank' },
          { text: '=' },
          { text: '(1/|Q|)', annotation: 'Média sobre queries' },
          { text: '·' },
          { text: 'Σ_q', annotation: 'Soma sobre queries' },
          { text: '(1 / rank_q)', annotation: 'Inverso da posição do 1º relevante' },
        ]} />
        <AnnotatedFormula title="NDCG@K" accent={accent} formula="NDCG@K = DCG@K / IDCG@K" parts={[
          { text: 'DCG@K', highlight: true, annotation: 'Σ rel_i / log2(i+1) — discounted gain' },
          { text: '/' },
          { text: 'IDCG@K', annotation: 'DCG da ordenação ideal' },
        ]} />
      </Section>
      <Section title="Tabela comparativa" accent={accent}>
        <ComparisonTable accent={accent} headers={['Métrica', 'Quando usar', 'Limite']} rows={[
          ['Precision@K', 'Quanto dos K top é relevante?', 'Ignora posição relativa dentro do top-K'],
          ['Recall@K', 'Quanto do total relevante está no top-K?', 'Precisa saber TODOS os relevantes — caro'],
          ['MRR', 'Primeira resposta certa é o que importa', 'Insensível ao 2º+ relevante'],
          ['NDCG@K', 'Ranking multi-relevância', 'Mais complexo de explicar'],
          ['MAP (Mean Average Precision)', 'Recall + posição', 'Binary relevance, menos comum 2026'],
          ['ERR (Expected Reciprocal Rank)', 'Modela "user satisfaction" decay', 'Acadêmica, menos comum em produção'],
        ]} />
      </Section>
      <Section title="Golden dataset — checklist" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Tamanho mínimo', v: '200-500 queries para production-grade signal' },
          { k: 'Distribuição', v: 'Head (top queries) + torso (mediana) + tail (raras) — não só fáceis' },
          { k: 'Relevance judgments', v: '0-3 scale (irrelevant/marginal/relevant/perfect) — não binário' },
          { k: 'Inter-annotator agreement', v: '2+ avaliadores; Cohen kappa > 0.7' },
          { k: 'Atualização', v: 'Quarterly — distribuição de queries muda' },
          { k: 'Eval suite', v: 'BEIR (academic), MS MARCO (open), próprio (sempre)' },
        ]} />
      </Section>
      <Section title="Pipeline offline → online" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Offline gate', v: 'NDCG@10 cai >2% no golden set = bloqueia merge' },
          { k: 'Shadow traffic', v: 'Roda nova ranking lado-a-lado, compara métricas, sem afetar usuário' },
          { k: 'Interleaving (TDI)', v: 'Mistura ranking A e B na mesma SERP, mede clique relativo — sinal 10x mais sensível que A/B clássico' },
          { k: 'A/B incremental', v: 'Começa 1% tráfego, escala se métrica de produto move' },
          { k: 'Long-term metrics', v: 'Return rate + 7-day retention — não só CTR' },
        ]} />
      </Section>
      <Callout tone="success" icon="🎓">Trilha Search & IR Profundo concluída. Badge <b>Search Master</b> desbloqueado.</Callout>
    </ModuleLayout>
  );
}
