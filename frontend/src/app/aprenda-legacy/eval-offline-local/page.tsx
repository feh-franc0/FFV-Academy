import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('eval-offline-local');

const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'lm-evaluation-harness (EleutherAI) é:',
    options: [
      'Apenas um benchmark',
      'Framework canônico para avaliar LLMs em benchmarks acadêmicos (MMLU, GSM8K, HumanEval, ARC, BBH, IFEval, GPQA, etc) — backend-agnóstico (HF, vLLM, OpenAI API, Ollama)',
      'Uma biblioteca de dataset',
      'Apenas para fine-tune',
    ],
    correct: 1,
    explanation: 'lm-eval-harness é o padrão de fato. Quando um paper anuncia "MMLU 75%", é tipicamente medido com essa lib. Suporta dezenas de tasks; você roda contra Ollama local com um único parâmetro.',
  },
  {
    question: 'O que mede MMLU?',
    options: [
      'Velocidade',
      'Conhecimento multidisciplinar em 57 tópicos (Direito, Medicina, História, STEM) via multiple-choice. Mede "saber academic geral", não raciocínio profundo',
      'Hallucination',
      'Tom emocional',
    ],
    correct: 1,
    explanation: 'MMLU (Hendrycks et al., 2020) virou o benchmark mais citado. Limitações: multiple-choice tem chute, dataset tem erros conhecidos, saturou (top models 85%+). Para reasoning, GPQA-Diamond e BBH são melhores.',
  },
  {
    question: 'HumanEval mede:',
    options: [
      'Conhecimento geral',
      'Code generation em Python via 164 problemas funcionais com testes unitários. Pass@1 (acerta na primeira tentativa) é a métrica padrão',
      'Velocidade de tipagem',
      'Refatoração',
    ],
    correct: 1,
    explanation: 'HumanEval (OpenAI, Chen et al 2021) é o benchmark clássico de coding. Saturou — top models 90%+. Substitutos modernos: LiveCodeBench (continuamente atualizado, sem leak de treinamento), SWE-Bench (problemas reais GitHub).',
  },
  {
    question: 'IFEval (Instruction Following Eval) verifica:',
    options: [
      'Conhecimento',
      'Se o modelo segue instruções precisas e verificáveis programaticamente — "responda em exatamente 3 parágrafos", "use só palavras começando com P". Crucial para agente/produção',
      'Vocabulário',
      'Tradução',
    ],
    correct: 1,
    explanation: 'IFEval (Zhou et al., 2023) é o que detecta se o modelo realmente obedece formato. Modelos podem ter MMLU 80% e falhar em IFEval — útil saber em produção onde structured output importa.',
  },
  {
    question: 'Como rodar lm-eval-harness contra Ollama local?',
    options: [
      'Não funciona',
      'Inicia Ollama com --api, depois lm_eval --model openai-completions --model_args base_url=http://localhost:11434/v1,model=qwen2.5:14b. O harness fala OpenAI-compat',
      'Apenas via paywall',
      'Apenas com GPT-4',
    ],
    correct: 1,
    explanation: 'Ollama expõe API OpenAI-compatible. lm-eval-harness suporta backend openai-completions com base_url customizado. Roda MMLU/GSM8K/IFEval contra seu Qwen local — sem mandar nada externo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="eval-offline-local"
      title="Avaliação offline: lm-eval-harness, deepeval local"
      icon="🧪"
      xp={60}
      readTime={12}
      trailName="Local LLMs & Edge AI"
      trailColor={accent}
      nextSlug="hardware-llm-comparativo"
      nextTitle="Hardware LLM 2026 comparativo"
      quiz={quiz}
    >
      <Section title="Por que avaliar localmente" accent={accent}>
        <p className="text-sm leading-6">
          Você fine-tunou um Qwen 2.5 para o seu domínio. Como saber se ficou melhor? Como saber se uma quantização Q5_K_M perdeu mais qualidade do que Q4_K_M valeria a economia de VRAM? <b>Bench offline</b> respondem isso sem chamar API paga. Stack: lm-eval-harness para benchmarks acadêmicos + deepeval/promptfoo para benchmarks customizados de domínio.
        </p>
      </Section>

      <Section title="lm-evaluation-harness em 3 comandos" accent={accent}>
        <CodeBlock lang="bash">{`# Setup
pip install lm-eval

# Subir Ollama
ollama serve &
ollama pull qwen2.5:14b

# Rodar MMLU contra Qwen 2.5 local (5-shot, padrão)
lm_eval \\
  --model openai-completions \\
  --model_args base_url=http://localhost:11434/v1,model=qwen2.5:14b \\
  --tasks mmlu \\
  --output_path results/

# Rodar suite completa (várias horas)
lm_eval --model ... --tasks mmlu,gsm8k,humaneval,ifeval,gpqa_diamond,bbh \\
  --output_path results/`}</CodeBlock>
      </Section>

      <Section title="Os benchmarks que importam" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Benchmark', 'Mede', 'Top scores 2026']}
          rows={[
            ['MMLU', 'Conhecimento academic geral', '~92% (frontier), ~75-85% (open ~14B)'],
            ['GSM8K', 'Matemática grade school', '~95%+ (frontier)'],
            ['HumanEval / MBPP', 'Code generation', 'Saturado — usar LiveCodeBench'],
            ['LiveCodeBench', 'Code real, continuamente atualizado', 'Métrica viva'],
            ['IFEval', 'Instruction following exato', 'Crítico para produção'],
            ['GPQA-Diamond', 'PhD-level science questions', '~75%+ (frontier), ~45-60% open'],
            ['BBH (Big-Bench Hard)', 'Reasoning multi-step', 'Bom indicador geral'],
            ['MT-Bench / Arena Hard', 'Conversação multi-turn', 'LLM-as-judge'],
            ['MUSR', 'Reasoning narrativa longa', 'Stress test de longo contexto'],
          ]}
        />
      </Section>

      <Section title="deepeval — benchmark do SEU domínio" accent={accent}>
        <CodeBlock lang="python">{`from deepeval import evaluate
from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric
from deepeval.test_case import LLMTestCase

# Defina seus test cases (golden set do domínio)
cases = [
    LLMTestCase(
        input='Qual a cláusula de rescisão típica em contrato de SaaS BR?',
        actual_output=meu_modelo_responde('Qual a cláusula...'),
        expected_output='Cláusula típica inclui notice period de 30 dias...',
        retrieval_context=['<docs recuperados pelo RAG>']
    ),
    # ... mais 50-200 casos
]

# Métricas
metrics = [
    AnswerRelevancyMetric(threshold=0.8, model='qwen2.5:14b'),  # juiz local!
    FaithfulnessMetric(threshold=0.85, model='qwen2.5:14b'),
]

# Avalia
results = evaluate(test_cases=cases, metrics=metrics)`}</CodeBlock>
        <Callout tone="info">
          deepeval permite usar LLM-as-judge com modelo LOCAL (Ollama) — sem mandar nada para OpenAI. Útil para compliance corporativo.
        </Callout>
      </Section>

      <Section title="promptfoo — eval declarativa em YAML" accent={accent}>
        <CodeBlock lang="yaml">{`# promptfooconfig.yaml
prompts:
  - 'Resuma o documento: {{document}}'

providers:
  - id: ollama:qwen2.5:14b
  - id: ollama:llama3.3:70b

tests:
  - vars:
      document: 'Lorem ipsum dolor...'
    assert:
      - type: contains
        value: 'palavra-chave'
      - type: llm-rubric
        value: 'Resume preserva fatos principais sem alucinar'
        provider: ollama:qwen2.5:14b  # juiz local

  - vars:
      document: '{{file:./docs/long.txt}}'
    assert:
      - type: similarity
        value: 'Esperado resumo conciso'
        threshold: 0.7`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Rodar', v: 'npx promptfoo eval' },
            { k: 'CI integration', v: 'Falha PR se métrica cai > limiar' },
            { k: 'Compare side-by-side', v: 'Múltiplos providers no mesmo run' },
            { k: 'Web UI', v: 'npx promptfoo view abre dashboard local com diffs' },
          ]}
        />
      </Section>

      <Section title="Workflow real — antes/depois de quantizar" accent={accent}>
        <CodeBlock lang="bash">{`# Baseline: modelo FP16 não quantizado
lm_eval --model ... --model_args=model=qwen2.5:14b-fp16 \\
  --tasks mmlu,gsm8k,ifeval --output_path baseline/

# Após quantizar Q4_K_M
lm_eval --model ... --model_args=model=qwen2.5:14b-q4_k_m \\
  --tasks mmlu,gsm8k,ifeval --output_path q4_k_m/

# Diff
python -m lm_eval.scripts.diff baseline/ q4_k_m/
# Saída esperada: 2-4% drop em cada métrica — aceitável para 4x economia VRAM`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
