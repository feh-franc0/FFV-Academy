import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('avaliando-fine-tune');

const accent = '#c084fc';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual métrica usar em FT de extraction estruturada (ex: JSON)?',
    options: [
      'BLEU',
      'Schema validity (parseia JSON?) + field-level exact match + field-level semantic match (LLM-as-judge em free text fields). Binary metric per field compared to ground truth',
      'Perplexity',
      'Sem métrica',
    ],
    correct: 1,
    explanation: 'Structured extraction tem ground truth claro. Evaluation: 1) JSON válido? (parseia?) 2) Required fields present? 3) Exact match em estruturados (IDs, dates). 4) Semantic match em free text (LLM judge). Score final: % casos 100% corretos. BLEU/ROUGE não servem pra estruturado.',
  },
  {
    question: 'Como comparar FT vs base model rigorosamente?',
    options: [
      'Rodar e ver',
      'Golden set de 100-500 exemplos com respostas ideais. Both models respondem. LLM-as-judge compare pairwise (A vs B, order randomized pra evitar bias). Statistical test se diferença é significativa',
      'Feel it',
      'Só benchmarks',
    ],
    correct: 1,
    explanation: 'Evaluation rigorous: pairwise LLM judge é o standard. A/B random ordering pra evitar position bias. Tie rates medidos. Statistical: se 60%+ vezes FT vence, significativo. Também: run em múltiplos seeds pra estabilidade. Human eval pra subset (ground truth pro judge).',
  },
  {
    question: 'O que é regression test em FT?',
    options: [
      'Medicina',
      'Capturar casos específicos que modelo atual resolve corretamente, rodar CONTRA cada nova versão FT. Se algum case regride, bloqueia deploy. Essencial pra evitar "corrigi X e quebrei Y" em iteração de prompt/dataset',
      'Deprecated',
      'Só pra DPO',
    ],
    correct: 1,
    explanation: 'Regression em ML: toda mudança em dataset/prompt pode regredir em casos já funcionais. Capture production failures + expected behaviors em test suite. Run a cada new FT checkpoint. CI-like: red = bloqueia promote. Sem regression tests, você "tapa buraco e abre outro" eternamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="avaliando-fine-tune"
      title="Avaliando fine-tune: golden set, regression, A/B"
      icon="📊"
      xp={55}
      readTime={13}
      trailName="Fine-tuning & Customização de LLMs"
      trailColor={accent}
      nextSlug="deploy-modelo-customizado"
      nextTitle="Deploy modelo customizado: vLLM, TGI, Bedrock"
      quiz={quiz}
    >
      <Section title="Eval framework" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Golden set curado</strong>: 100-500 exemplos com respostas ideais. Stratified por task, difficulty, edge cases.</li>
          <li><strong>Métricas estruturadas</strong>: exact match, schema validity, field-level F1 pra tasks com ground truth.</li>
          <li><strong>LLM-as-judge</strong>: GPT-4/Claude compare respostas pairwise, rubric estruturada, order-swap pra evitar bias.</li>
          <li><strong>Human eval</strong>: amostra 30-50 pra sanity check do LLM judge; alinhamento &gt; 80% é OK.</li>
          <li><strong>Regression suite</strong>: casos production-failed + key behaviors; run em cada checkpoint.</li>
          <li><strong>A/B production</strong>: feature flag pra 5-10% traffic; real user feedback signal.</li>
        </ul>
      </Section>

      <Section title="Evitar vibes-based eval" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Common failure: time fine-tuneia, vê &quot;parece melhor em alguns testes&quot;, ships. Production descobre regression. Rigor EXIGE: baseline vs new com métricas objetivas (pairwise judge %), sample size &gt; 100, statistical confidence, regression passa verde.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
