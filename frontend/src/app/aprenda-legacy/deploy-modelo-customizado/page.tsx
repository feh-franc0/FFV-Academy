import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('deploy-modelo-customizado');

const accent = '#c084fc';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que vLLM é preferido pra self-hosted serving em 2026?',
    options: [
      'Marketing',
      'PagedAttention (paper UC Berkeley 2023) gerencia KV cache em blocks — throughput 10-24x vs HuggingFace Transformers naive. Continuous batching. OpenAI-compatible API. Standard pra serving production',
      'Apenas FastAPI',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'vLLM trouxe PagedAttention (analogia a OS paging) pra KV cache de LLMs. Antes: 60-80% memory waste. Depois: 2-4x mais throughput. Continuous batching (adiciona requests ao batch em flight). OpenAI-compatible drop-in. Competitors: TGI (HF), SGLang, LMDeploy. vLLM domina open-source.',
  },
  {
    question: 'Qual é o trade-off de AWS Bedrock Custom Model vs self-hosted?',
    options: [
      'Bedrock é grátis',
      'Bedrock: managed, pay-per-token, no infra overhead — mas caro em escala + vendor lock-in + limitações de modelos. Self-hosted (vLLM em EKS/GPU): infra work + custo fixo, mas $/token muito melhor acima de 100M tokens/mês',
      'Mesma coisa',
      'Self-hosted sempre pior',
    ],
    correct: 1,
    explanation: 'Bedrock: zero ops, $/M tokens pricing. Good até ~10-50M tokens/mês. Acima: self-host em GPU A100/H100 rental: $3-5/h × usage, pode ser 5-10x mais barato. Breakeven ~50M tokens/mês. Plus: self-host controle total (cold start, quantization, batching config).',
  },
  {
    question: 'Qual é a melhor VRAM pra serving Llama-3-70B em produção?',
    options: [
      '1GB',
      '2× H100 (80GB each) ou 4× A100 (40GB). Com vLLM tensor-parallelism. Quantization int8/fp8 caberia em H100 single mas com accuracy drop. Throughput ≈ 1000 tokens/s/H100 em batching',
      '8GB',
      '16GB',
    ],
    correct: 1,
    explanation: '70B params × 2 bytes (bf16) = 140GB peso. Plus KV cache (varia com batch + context). Tensor parallel em 2 GPUs divide 70GB cada — fits H100 80GB com room. Quantization int4 reduz pra 35GB (single H100) com small accuracy loss. Cost: $2-3/hour no cloud, $60-80k máquina comprada.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="deploy-modelo-customizado"
      title="Deploy modelo customizado: vLLM, TGI, Bedrock"
      icon="🚀"
      xp={60}
      readTime={14}
      trailName="Fine-tuning & Customização de LLMs"
      trailColor={accent}
      nextSlug="capstone-fine-tune-modelo-especialista"
      nextTitle="Capstone: fine-tune de modelo especialista de domínio"
      quiz={quiz}
    >
      <Section title="Opções comparadas" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Opção', 'Setup', 'Cost model', 'Quando']}
          rows={[
            ['OpenAI FT API', 'Zero (API)', 'Pay-per-token', 'FT de gpt-4o-mini/gpt-3.5'],
            ['Anthropic Custom', 'Enterprise tier', 'Negociado', 'Claude FT (limited access)'],
            ['AWS Bedrock Custom', 'CloudFormation', 'Pay-per-token + provisioning', 'Já em AWS, managed'],
            ['SageMaker JumpStart', 'Notebook-based', 'Instance hours', 'AWS-native FT + deploy'],
            ['vLLM self-host (EKS/GCE)', 'Medium (GPU ops)', 'GPU hours fixos', 'Volume alto, control total'],
            ['Replicate/Together AI', 'Upload model', 'Pay-per-token', 'Managed open models'],
          ]}
        />
      </Section>

      <Section title="vLLM serving exemplo" accent={accent}>
        <Callout tone="info" icon="💡">
          <code>python -m vllm.entrypoints.openai.api_server --model ./llama3-lora-merged --tensor-parallel-size 2 --max-model-len 4096</code> sobe servidor OpenAI-compatible em minutos. OpenAI SDK aponta pra <code>http://your-server/v1</code> e funciona. Deploy em K8s com GPU node pool + autoscaler.
        </Callout>
      </Section>

      <Section title="Custos realistas 2026" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>H100 80GB rental: $2.50-5/h (AWS/GCP), $1.50-3/h (Lambda Labs/CoreWeave)</li>
          <li>Llama-3-70B em 1× H100: ~1000 tokens/s throughput em batching</li>
          <li>Break-even self-host vs Bedrock: ~30-80M tokens/mês (depende do preço Bedrock do modelo)</li>
          <li>Cold start: vLLM load de 70B ~2-5min; keep warm pra prod</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
