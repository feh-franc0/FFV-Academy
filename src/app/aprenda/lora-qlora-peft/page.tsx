import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('lora-qlora-peft');

const accent = '#c084fc';

const quiz: QuizQuestion[] = [
  {
    question: 'Como LoRA reduz custo de fine-tuning?',
    options: [
      'Congela modelo',
      'Treina matrizes LOW-RANK (A × B, rank 8-64) que APROXIMAM a mudança no peso original. Original weights frozen; só A,B são treinados. 0.1-1% dos params, 10-100x menos VRAM, 10x mais rápido',
      'Compressão',
      'Quantization',
    ],
    correct: 1,
    explanation: 'LoRA (Hu et al., 2021, Microsoft): W + ΔW onde ΔW = A × B com A,B small. Ex: Linear 4096×4096 = 16M params → A(4096×16) × B(16×4096) = 131k params (0.8%). Math: rank-1 approximation. Preserva knowledge pre-trained, só adapta small. 10-100x mais eficiente.',
  },
  {
    question: 'Qual é o diferencial de QLoRA vs LoRA?',
    options: [
      'Nome',
      'QLoRA QUANTIZA o modelo base pra 4-bit (NF4 format — NormalFloat4), mantendo full-precision só em LoRA adapters. Permite fine-tune 65B model em 1 GPU de 48GB (vs 8 GPUs full precision)',
      'Deprecated',
      'Mesma coisa',
    ],
    correct: 1,
    explanation: 'QLoRA (Dettmers et al., 2023): base model em 4-bit (salva memória), adapters em bf16. Double quantization para constants. Paged optimizers pra evitar OOM spikes. Result: Llama-65B FT em single A100 48GB. Democratizou FT de large models pra labs sem datacenter.',
  },
  {
    question: 'Qual é library canônica pra LoRA em Python?',
    options: [
      'Manual',
      'PEFT (Parameter-Efficient Fine-Tuning) da Hugging Face — LoraConfig + get_peft_model wrap em qualquer AutoModel. TRL integra PEFT natively. Merge adapter back to base post-training se quiser',
      'Só em PyTorch',
      'Não existe',
    ],
    correct: 1,
    explanation: 'PEFT library é standard. LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj","v_proj"]) + get_peft_model(model, config). Treina só 0.1% params. save_pretrained() grava adapter pequeno (~50MB pra 7B). Merge: model.merge_and_unload() pra deploy single model.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="lora-qlora-peft"
      title="LoRA, QLoRA e PEFT: fine-tuning eficiente"
      icon="⚡"
      xp={60}
      readTime={14}
      trailName="Fine-tuning & Customização de LLMs"
      trailColor={accent}
      nextSlug="dpo-rlhf-simplificado"
      nextTitle="DPO e RLHF simplificado: aprender com preferências"
      quiz={quiz}
    >
      <Section title="Código PEFT + LoRA" accent={accent}>
        <CodeBlock lang="python">{`from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM
from trl import SFTTrainer

model = AutoModelForCausalLM.from_pretrained('meta-llama/Llama-3-8B')

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,                          # rank
    lora_alpha=32,                 # scaling
    lora_dropout=0.05,
    target_modules=['q_proj', 'k_proj', 'v_proj', 'o_proj'],  # attention matrices
    bias='none',
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# Output: trainable params: 20M || all params: 8B || trainable%: 0.25%

# Train com TRL
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    max_seq_length=2048,
    args={...},
)
trainer.train()

# Save adapter (pequeno)
model.save_pretrained('./llama3-lora')  # ~50MB

# Merge opcional
merged = model.merge_and_unload()
merged.save_pretrained('./llama3-merged')`}</CodeBlock>
      </Section>

      <Section title="QLoRA setup" accent={accent}>
        <CodeBlock lang="python">{`from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type='nf4',          # NormalFloat4
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

model = AutoModelForCausalLM.from_pretrained(
    'meta-llama/Llama-3-70B',
    quantization_config=bnb_config,
    device_map='auto',
)
# Base model em 4-bit (35GB vs 140GB full precision)
# + LoRA adapter normal em bf16`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Result: FT Llama-3-70B em single A100 80GB. Impensável em 2022. Democratization real de FT de LLMs grandes.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
