import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('dpo-rlhf-simplificado');

const accent = '#c084fc';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o principal motivo do DPO substituir RLHF em muitos pipelines?',
    options: [
      'Moda',
      'RLHF precisa de 3 etapas complexas (reward model + PPO reinforcement), instável, caro. DPO reformula matemáticamente: learn directly from preferences sem reward model — equivalente teórico, 10x mais simples, mais estável',
      'Mais accurate',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'DPO (Direct Preference Optimization, Stanford 2023) prova matematicamente que RLHF objective pode ser alcançado com supervised loss diretamente sobre (preferred, rejected) pairs. Elimina: reward model training, PPO hyperparams hell, reward hacking. Same result, 10x menos complexity. Todas labs modernas usam DPO ou variants.',
  },
  {
    question: 'Qual é o format de dataset DPO?',
    options: [
      'Plain text',
      'Triplas: {prompt, chosen (preferred response), rejected (worse response)}. Modelo aprende a aumentar prob de chosen e diminuir rejected relativamente ao modelo base (KL divergence regularization)',
      'Mesma do SFT',
      'Só input',
    ],
    correct: 1,
    explanation: 'DPO dataset: JSONL com prompt/chosen/rejected. Source: human labelers comparando 2 outputs, ou LLM comparing (self-play/judge). Cada tripla treina model a preferir chosen. Regularization via reference model (frozen base) evita colapso. Menos data needed que SFT (~500-5000 pairs).',
  },
  {
    question: 'Qual é o use case típico de DPO hoje?',
    options: [
      'Factual accuracy',
      'Alinhamento (harmful refusal), style matching (mais conciso, menos verboso), preferences subjetivas (tom), reduzir hallucination em casos específicos. Post-SFT refinement quando style é crítico',
      'Só research',
      'Pre-training',
    ],
    correct: 1,
    explanation: 'Pipeline moderno: Pre-training → SFT (capability) → DPO (alignment/style). DPO brilha em "melhor qual de duas respostas?" — preferências subjetivas que são difíceis de capturar em SFT examples. Llama-3-Instruct, Mistral Instruct, Claude Constitutional — todos usam variante de DPO.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dpo-rlhf-simplificado"
      title="DPO e RLHF simplificado: aprender com preferências"
      icon="👍"
      xp={65}
      readTime={15}
      trailName="Fine-tuning & Customização de LLMs"
      trailColor={accent}
      nextSlug="datasets-para-fine-tuning"
      nextTitle="Datasets pra fine-tuning: curadoria, dedup, contaminação"
      quiz={quiz}
    >
      <Section title="DPO dataset format" accent={accent}>
        <CodeBlock lang="jsonl">{`{
  "prompt": "Explique QUIC em 2 frases.",
  "chosen": "QUIC é um protocolo de transporte sobre UDP...",  // resposta preferida
  "rejected": "QUIC não é importante, esquece TCP..."          // resposta ruim
}
{
  "prompt": "...",
  "chosen": "...",
  "rejected": "..."
}`}</CodeBlock>
      </Section>

      <Section title="DPO com TRL" accent={accent}>
        <CodeBlock lang="python">{`from trl import DPOTrainer
from transformers import AutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset

model = AutoModelForCausalLM.from_pretrained('./llama3-sft')
ref_model = AutoModelForCausalLM.from_pretrained('./llama3-sft')  # frozen ref
tokenizer = AutoTokenizer.from_pretrained('./llama3-sft')

dataset = load_dataset('json', data_files='dpo.jsonl')

trainer = DPOTrainer(
    model=model,
    ref_model=ref_model,
    train_dataset=dataset['train'],
    tokenizer=tokenizer,
    beta=0.1,                # KL regularization strength
    args={'num_train_epochs': 3, 'learning_rate': 5e-7, ...},
)
trainer.train()`}</CodeBlock>
      </Section>

      <Section title="RLHF tradicional (contexto)" accent={accent}>
        <Callout tone="info" icon="💡">
          RLHF: (1) SFT com demonstrations. (2) Train REWARD MODEL em preferências. (3) PPO: policy model optimiza pra maximizar reward. Instável: reward hacking, catastrophic forgetting. DPO mata etapa 2+3 com single loss function. Still RLHF existe em big labs com mais compute/expertise.
        </Callout>
      </Section>

      <Section title="Variants modernos" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>KTO</strong> (Kahneman-Tversky Optimization): não precisa pairs, só rating binary like/dislike</li>
          <li><strong>IPO</strong> (Identity PO): mais estável em preferências ruidosas</li>
          <li><strong>SimPO</strong> (2024): sem reference model</li>
          <li><strong>ORPO</strong>: combina SFT + preference em single loss</li>
        </ul>
        <p>Em 2026 DPO ainda é default mais usado; variants em rapid experimentation.</p>
      </Section>
    </ModuleLayout>
  );
}
