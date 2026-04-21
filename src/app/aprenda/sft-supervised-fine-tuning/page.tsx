import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sft-supervised-fine-tuning');

const accent = '#c084fc';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o format típico de dataset SFT pra chat model?',
    options: [
      'Plain text',
      'Conversation format: [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}] em JSONL (uma conversation por linha). Modelo treina em predição da última response do assistant',
      'CSV',
      'YAML',
    ],
    correct: 1,
    explanation: 'OpenAI e Hugging Face usam JSONL com conversation. Sistema + user + assistant turn. Multi-turn é OK (várias pares). Assistant messages anteriores: parte do context (não treinadas). Ultima assistant: TARGET (loss calculado). Dev gera dataset de (query, ideal response).',
  },
  {
    question: 'Quantos epochs rodar em SFT tipicamente?',
    options: [
      '100+',
      '1-3 epochs — MAIS causa overfitting (modelo memoriza em vez de generalizar). Monitor validation loss: se subir, para (early stopping)',
      '50',
      '0.1',
    ],
    correct: 1,
    explanation: 'Pre-trained model já sabe linguagem. SFT é ajuste pequeno — 1-3 epochs é sweet spot. Overfit signs: train loss cai, val loss sobe; model começa a repetir datasets literalmente; perde generality em casos não vistos. OpenAI FT default 3 epochs, ajustável.',
  },
  {
    question: 'Qual é sinal de dataset SFT PEQUENO demais?',
    options: [
      '10000',
      'Tipicamente &lt; 100-500 exemplos. Modelo não aprende padrão; output inconsistente. Prompt engineering com 5 examples é superior. 1000+ exemplos consistentes é baseline pra FT render valor',
      '500',
      '10000+',
    ],
    correct: 1,
    explanation: 'Pra FT agregar valor: 500-10000 exemplos curados. Abaixo: overhead não justifica. Qualidade &gt; quantidade: 1000 excelentes &gt; 10000 ruidosos. Casos extremos (LIMA paper Meta 2023): 1000 hand-curated já dava bom resultado pra style/format.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sft-supervised-fine-tuning"
      title="SFT (Supervised Fine-Tuning): básico e prático"
      icon="📚"
      xp={55}
      readTime={13}
      trailName="Fine-tuning & Customização de LLMs"
      trailColor={accent}
      nextSlug="lora-qlora-peft"
      nextTitle="LoRA, QLoRA e PEFT: fine-tuning eficiente"
      quiz={quiz}
    >
      <Section title="Dataset format" accent={accent}>
        <CodeBlock lang="jsonl">{`{"messages": [
  {"role": "system", "content": "You are a helpful assistant that extracts invoices."},
  {"role": "user", "content": "Extract total from: Invoice #123 Total: $456.78"},
  {"role": "assistant", "content": "{\\"invoice_id\\": \\"123\\", \\"total\\": 456.78}"}
]}
{"messages": [...]}
{"messages": [...]}
`}</CodeBlock>
      </Section>

      <Section title="OpenAI FT via API" accent={accent}>
        <CodeBlock lang="python">{`from openai import OpenAI
client = OpenAI()

# 1. Upload dataset
file = client.files.create(
    file=open('train.jsonl', 'rb'),
    purpose='fine-tune'
)

# 2. Create FT job
job = client.fine_tuning.jobs.create(
    training_file=file.id,
    model='gpt-4o-mini-2024-07-18',
    hyperparameters={'n_epochs': 3},
)

# 3. Poll status
while True:
    job = client.fine_tuning.jobs.retrieve(job.id)
    if job.status in ['succeeded', 'failed']:
        break
    time.sleep(60)

# 4. Use model
resp = client.chat.completions.create(
    model=job.fine_tuned_model,  # "ft:gpt-4o-mini:org::abc123"
    messages=[{'role': 'user', 'content': 'Extract total from...'}]
)`}</CodeBlock>
      </Section>

      <Section title="Hugging Face TRL (open models)" accent={accent}>
        <CodeBlock lang="python">{`from trl import SFTTrainer
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained('meta-llama/Llama-3-8B')
tokenizer = AutoTokenizer.from_pretrained('meta-llama/Llama-3-8B')
dataset = load_dataset('json', data_files='train.jsonl')

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset['train'],
    max_seq_length=2048,
    args={'num_train_epochs': 3, 'learning_rate': 2e-5, ...},
)
trainer.train()
trainer.save_model('./llama3-ft')`}</CodeBlock>
        <Callout tone="info" icon="💡">
          TRL (Transformer Reinforcement Learning) library Hugging Face automatiza SFT, DPO, PPO. Integrate com PEFT (próximo módulo) pra LoRA-based FT eficiente.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
