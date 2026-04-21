import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('datasets-para-fine-tuning');

const accent = '#c084fc';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o fator #1 que determina qualidade de fine-tune?',
    options: [
      'Modelo base',
      'Qualidade do DATASET — dataset pobre + modelo grande = lixo. Dataset excelente + modelo médio = ótimo. Curadoria supera quantidade. LIMA paper: 1000 hand-curated ≥ 50k scraped',
      'Hyperparameters',
      'GPU size',
    ],
    correct: 1,
    explanation: 'Nos últimos 3 anos, research convergiu: dataset quality é o determinante. LIMA (Meta 2023): 1000 super high-quality exemplos → modelo comparable a FT de 50k+ ruidosos. "Garbage in, garbage out" se aplica com força em LLMs. Spend time curating, não tweaking hyperparams.',
  },
  {
    question: 'O que é "data contamination" em eval de fine-tune?',
    options: [
      'Malware',
      'Quando dataset de training ACIDENTALMENTE contém exemplos do eval set — modelo "cola" em vez de generalizar, métricas inflam. Detect: hash/match strings entre train e eval, remove overlaps',
      'Erro de encoding',
      'Não existe',
    ],
    correct: 1,
    explanation: 'Clássico bug em research — dataset public leaka pra web, pre-training absorve, ou seu eval vem do mesmo source. Model parece bom em benchmark mas fails em produção. Defesa: n-gram matching entre train e eval, remove duplicates fuzzy, eval set PRIVADO de dataset público. Contamination check é obrigatório.',
  },
  {
    question: 'Como dedup eficiente em dataset grande?',
    options: [
      'Comparar tudo vs tudo',
      'MinHash + LSH (Locality-Sensitive Hashing) — hash signatures aproximam Jaccard similarity em O(N log N) em vez de O(N²). Tools: datasketch, text-dedup (HF). Remove near-duplicates (typos, paraphrases) também',
      'Impossível',
      'Só exact match',
    ],
    correct: 1,
    explanation: 'Exact dedup: trivial (hash set). Near-dedup: MinHash shingles + LSH bucketing. Documentos similar vão pro mesmo bucket, compare só dentro. 100M docs: ~1h em máquina modesta. Ferramenta: datasketch Python, text-dedup (HuggingFace). Deduplicar é não-trivial — dataset vaza 30-50% duplicates sem isso.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="datasets-para-fine-tuning"
      title="Datasets pra fine-tuning: curadoria, dedup, contaminação"
      icon="📦"
      xp={55}
      readTime={13}
      trailName="Fine-tuning & Customização de LLMs"
      trailColor={accent}
      nextSlug="avaliando-fine-tune"
      nextTitle="Avaliando fine-tune: golden set, regression, A/B"
      quiz={quiz}
    >
      <Section title="Checklist de curadoria" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Balanceamento</strong>: distribute classes/task types uniformly (sem 80% de um tipo)</li>
          <li><strong>Diversidade</strong>: casos edge, edge+, median, easy — cover surface completa</li>
          <li><strong>PII removal</strong>: email, phone, SSN em regex + LLM-based scan</li>
          <li><strong>Quality filter</strong>: length min/max, completeness de campos, valid format</li>
          <li><strong>Exact dedup</strong>: hash de input+output</li>
          <li><strong>Near-dedup</strong>: MinHash/LSH pra quase-duplicates</li>
          <li><strong>Contamination check</strong>: cross-reference com eval set + public benchmarks</li>
          <li><strong>Human review sample</strong>: 100+ exemplos revisados manually (red flags)</li>
          <li><strong>Train/val split</strong>: 90/10, val NUNCA no train</li>
        </ul>
      </Section>

      <Section title="Synthetic data com LLMs" accent={accent}>
        <Callout tone="info" icon="💡">
          Atalho comum: use GPT-4/Claude pra gerar exemplos training. Riscos: bias do generator model, hallucinations, falta diversidade. Mitigation: multi-model (GPT + Claude + manual curation), human-in-loop review, rotacionar prompts generation, check distribution.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
