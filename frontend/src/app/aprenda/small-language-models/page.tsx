import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('small-language-models');

const ACCENT = '#34d399';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que SLMs como Phi-4 conseguem performance próxima a modelos 10× maiores?',
    options: [
      'SLMs usam quantização INT2 que permite processar mais informação por parâmetro',
      'SLMs são treinados em dados sintéticos de alta qualidade gerados por LLMs (data-centric training) — "textbooks are all you need": menos dados mas muito mais curados e densos em conhecimento, em vez de web data com muito ruído',
      'SLMs usam arquiteturas fundamentalmente diferentes que são inerentemente mais eficientes',
      'SLMs são simplesmente LLMs com parâmetros duplicados internamente para economizar espaço',
    ],
    correct: 1,
    explanation:
      'Phi (Microsoft) demonstrou que dados de alta qualidade superam dados em volume. Phi-1 (1.3B) usou "textbooks-quality data" + exercícios de código — performance similar a modelos 10× maiores em benchmarks de código. Phi-4 (14B) usa mistura de dados sintéticos gerados por GPT-4/Claude com curadoria intensiva. O insight: modelos pequenos com dados excelentes > modelos grandes com dados de qualidade média.',
  },
  {
    question: 'Quais são as principais diferenças entre Gemma 3 e Mistral Small como SLMs?',
    options: [
      'Gemma 3 e Mistral Small são modelos idênticos com nomes diferentes',
      'Gemma 3 (Google, Apache 2.0) tem arquitetura otimizada para edge com interleaved attention (local+global) e sliding window attention — excelente para deployment em hardware limitado. Mistral Small foca em performance em tasks de instrução com rope scaling para contextos longos — mais voltado para serving em API',
      'A única diferença é o número de parâmetros — arquitetura é idêntica',
      'Mistral Small é proprietário; Gemma 3 é o único open source da categoria',
    ],
    correct: 1,
    explanation:
      'Gemma 3 usa interleaved attention — 5 camadas de sliding window attention para cada 1 camada de global attention — reduzindo drasticamente o compute mantendo capacidade de raciocínio de longo alcance. Isso o torna ideal para on-device. Mistral Small usa Grouped Query Attention (GQA) + RoPE com base longa — otimizado para serving em API com contextos de 32k+. Ambos são open weights mas com filosofias de design diferentes.',
  },
  {
    question: 'O que é ONNX Runtime e por que é relevante para inferência de SLMs?',
    options: [
      'ONNX Runtime é um framework de treinamento alternativo ao PyTorch',
      'ONNX Runtime é uma engine de inferência cross-platform que executa modelos no formato ONNX — permite rodar o mesmo modelo em CPU (x86, ARM), GPU (CUDA, DirectML), NPU, e dispositivos mobile sem reescrever código. SLMs exportados para ONNX rodam 2-5× mais rápido que via transformers em CPU',
      'ONNX Runtime é exclusivo para Windows e não funciona em macOS ou Linux',
      'ONNX Runtime é uma biblioteca para converter modelos entre PyTorch e TensorFlow',
    ],
    correct: 1,
    explanation:
      'ONNX Runtime (Microsoft, open source) é a engine de inferência de alta performance para modelos exportados para o formato ONNX. Vantagens: (1) Otimizações por hardware (kernels específicos para AVX2, ARM NEON, CUDA, DirectML); (2) Quantização nativa (INT8, INT4); (3) Execução em dispositivos sem GPU (laptops, celulares, edge); (4) Binding para C, C++, Python, JavaScript, Java. Para SLMs em produção em CPU: ONNX Runtime é frequentemente a melhor escolha.',
  },
  {
    question: 'Quando escolher um SLM em vez de uma API de LLM para uma aplicação?',
    options: [
      'SLMs são sempre superiores — economizam custo em todos os casos',
      'SLMs fazem sentido quando: privacidade de dados exige que o modelo rode no dispositivo do usuário ou na infraestrutura própria, latência offline é necessária, custos de API em escala são proibitivos, ou tasks simples não requerem capacidade de LLM completo. LLMs via API para tasks complexas ou quando qualidade > custo',
      'SLMs são apenas para uso em dispositivos móveis — não têm aplicação em servidor',
      'A escolha é sempre SLM para produção e LLM apenas para desenvolvimento',
    ],
    correct: 1,
    explanation:
      'Critérios para SLM: (1) Privacidade — dados não podem sair do dispositivo (saúde, jurídico, financeiro); (2) Offline — device sem conectividade confiável; (3) Custo em escala — 1B requests/mês × $0.001/req = $1M/mês em LLM API; (4) Latência — <100ms exige processamento local; (5) Task simples — classificação, extração de entidades, sumarização curta. Use LLM via API para: raciocínio complexo, tasks que mudam frequentemente, prototipagem, baixo volume.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="small-language-models"
      title="Small Language Models: Phi, Gemma e modelos on-device"
      icon="📱"
      xp={75}
      readTime={14}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="quantizacao-llm"
      nextTitle="Quantização de LLMs: INT4, INT8, GGUF e impacto em qualidade"
      relatedSlugs={['quantizacao-llm', 'distilacao-modelos', 'inferencia-otimizacao']}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Small Language Models (SLMs) — modelos de 1B a 14B parâmetros — estão redefinindo o que é possível
        sem GPU de datacenter. Em 2026, Phi-4 (14B), Gemma 3 (27B), Mistral Small (22B) e Llama 3.2 (3B)
        atingem performance surpreendente em benchmarks, rodam em celular ou laptop, e custo zero em runtime.
        Entender quando e como usá-los é uma competência crítica.
      </p>

      <Section title="O que são SLMs e por que surgiram" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'LLMs (>30B)', 'SLMs (1B-14B)']}
          rows={[
            ['Hardware mínimo', 'GPU A100/H100 80GB+', 'CPU, GPU consumer, Apple Silicon, mobile'],
            ['Custo de serving', '$2-10/M tokens via API', 'Grátis se self-hosted'],
            ['Latência', '0.5-3s TTFT', '50-200ms em CPU moderno'],
            ['Privacidade', 'Dados saem do dispositivo', 'Processamento local — dados nunca saem'],
            ['Offline', 'Requer conectividade', 'Funciona sem internet'],
            ['Qualidade geral', 'Estado da arte', '60-85% da performance em tasks simples'],
          ]}
        />
        <Callout tone="info">
          Phi-4 (14B, Microsoft) obtém 84% no MMLU — comparável ao GPT-4 de 2023 e melhor que modelos
          2-3× maiores. O segredo: dados sintéticos de altíssima qualidade gerados por GPT-4, curadoria
          intensiva, e filtro de conteúdo educativo ("textbooks-quality data").
        </Callout>
      </Section>

      <Section title="Principais SLMs em 2026" accent={ACCENT}>
        <LayerStack
          title="Panorama de SLMs populares"
          accent={ACCENT}
          separatorLabel="crescente complexidade"
          layers={[
            { label: 'Llama 3.2 1B/3B', content: 'Meta — modelos ultra-pequenos para mobile/edge, on-device com Core ML', note: 'Apache 2.0', tone: 'default' },
            { label: 'Gemma 3 4B/12B/27B', content: 'Google — sliding window attention, otimizado para edge', note: 'Apache 2.0', tone: 'default' },
            { label: 'Mistral Small 22B / 7B', content: 'Mistral AI — excelente instrução, contexto 32k+, GQA', note: 'Apache 2.0 (7B)', tone: 'writable' },
            { label: 'Phi-4 14B', content: 'Microsoft — maior qualidade por parâmetro, dados sintéticos premium', note: 'MIT', tone: 'writable' },
            { label: 'Qwen 2.5 7B/14B', content: 'Alibaba — ótimo em multilingual incluindo português e código', note: 'Apache 2.0', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Params', 'MMLU', 'HumanEval', 'Contexto', 'Destaque']}
          rows={[
            ['Phi-4 14B', '14B', '84%', '82%', '16k', 'Melhor qualidade/parâmetro'],
            ['Qwen 2.5 14B', '14B', '82%', '78%', '128k', 'Multilingual, contexto longo'],
            ['Mistral 7B v0.3', '7B', '68%', '37%', '32k', 'Eficiência, licença limpa'],
            ['Gemma 3 12B', '12B', '79%', '67%', '128k', 'On-device, sliding window'],
            ['Llama 3.2 3B', '3B', '63%', '41%', '128k', 'Mobile/edge deployment'],
          ]}
        />
      </Section>

      <Section title="On-device inference: ONNX Runtime e Core ML" accent={ACCENT}>
        <CodeBlock lang="python">{`# Inferência com ONNX Runtime — CPU otimizado
# pip install onnxruntime-genai
import onnxruntime_genai as og

# Baixar modelo Phi-4 em formato ONNX quantizado INT4
# huggingface-cli download microsoft/Phi-4-mini-4k-instruct-onnx

model = og.Model("./Phi-4-mini-4k-instruct-onnx/cpu_and_mobile/cpu-int4-rtn-block-32")
tokenizer = og.Tokenizer(model)

# Geração
prompt = "<|system|>Você é um assistente técnico.<|end|><|user|>O que é MVCC?<|end|><|assistant|>"
tokens = tokenizer.encode(prompt)

params = og.GeneratorParams(model)
params.set_inputs(tokens)
params.set_search_options({"max_length": 512, "temperature": 0.1})

generator = og.Generator(model, params)
while not generator.is_done():
    generator.compute_logits()
    generator.generate_next_token()

response = tokenizer.decode(generator.get_sequence(0))
print(response)`}</CodeBlock>

        <CodeBlock lang="python">{`# Apple MLX — otimizado para Apple Silicon (M1/M2/M3/M4)
# pip install mlx-lm
from mlx_lm import load, generate

# Modelos MLX disponíveis em mlx-community no HuggingFace
model, tokenizer = load("mlx-community/Phi-4-4bit")  # quantizado INT4

# Geração — usa Metal GPU do M-series nativamente
response = generate(
    model,
    tokenizer,
    prompt="Explique o algoritmo de Raft para consenso distribuído.",
    max_tokens=1024,
    verbose=True,   # mostra tokens/s em tempo real
)

# Benchmarks típicos em M2 Pro 32GB:
# Phi-4 14B (4-bit): ~35 tokens/s
# Mistral 7B (4-bit): ~65 tokens/s
# Llama 3.2 3B (4-bit): ~120 tokens/s`}</CodeBlock>

        <CodeBlock lang="swift">{`// Core ML no iOS/macOS — Llama 3.2 1B on-device
// Importar modelo via swift-transformers
import Foundation

// Apple distribui Llama 3.2 1B/3B em formato Core ML
// Disponível via huggingface hub com "apple/..." prefix

// Exemplo com swift-transformers (Apple)
import Transformers

// Carrega modelo em Core ML format
let model = try await TextGenerationPipeline(
    model: "apple/OpenELM-3B-Instruct",  // ou Llama 3.2 1B
)

let result = try await model.generate(
    text: "Qual é a complexidade de quicksort?",
    maxNewTokens: 200,
    temperature: 0.1,
)
print(result)`}</CodeBlock>
      </Section>

      <Section title="Quando usar SLM vs LLM" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Task', 'SLM viável?', 'Modelo recomendado', 'Notas']}
          rows={[
            ['Classificação de texto', 'Sim', 'Phi-4 ou Mistral 7B', 'Finetuning melhora 10-20pp'],
            ['NER / extração de entidades', 'Sim', 'Phi-4 ou Qwen 2.5 7B', 'Structured output via Instructor'],
            ['Sumarização de doc curto (<2k)', 'Sim', 'Gemma 3 12B', 'Resultado muito próximo de LLMs'],
            ['Q&A em domínio específico + RAG', 'Sim com RAG', 'Mistral 7B ou Phi-4', 'RAG compensa limitação de conhecimento'],
            ['Geração de código simples', 'Sim', 'Phi-4, Qwen 2.5-coder', 'Funções simples, não sistemas complexos'],
            ['Raciocínio matemático complexo', 'Não', 'GPT-4o, Claude Sonnet', 'SLMs ainda distantes em math avançado'],
            ['Tarefa multi-step complexa', 'Não', 'LLM + agente', 'SLMs falham em planejamento longo'],
            ['On-device sem internet', 'Sim', 'Llama 3.2 3B, Gemma 3 4B', 'Latência ≤100ms em M2+'],
          ]}
        />
        <DecisionBox
          scenario="App mobile que precisa classificar intenção do usuário offline"
          winner="Llama 3.2 3B via Core ML (iOS) ou ONNX Runtime (Android)"
          winnerColor={ACCENT}
          why="3B parâmetros: ~1.5GB em INT4. Latência <100ms no iPhone 15+. Funciona offline. Privacidade total — dados do usuário nunca saem do dispositivo. Fine-tune com 100-200 exemplos do seu domínio para atingir 90%+ de accuracy."
          alternatives={[
            { name: 'Phi-4 via API', note: 'Melhor qualidade mas requer conectividade e custo por chamada' },
            { name: 'Modelo de classificação BERT destilado', note: 'Ainda mais rápido (50ms) mas não generaliza para novos intents' },
            { name: 'Gemma 3 4B quantizado', note: 'Melhor qualidade que Llama 3B, 2-3GB, ótimo para devices com mais RAM' },
          ]}
        />
        <QAItem
          q="Como fazer fine-tuning de um SLM para minha task específica?"
          a={<>QLoRA é o padrão: congela os pesos base, adiciona adaptadores LoRA (r=8, alpha=16), treina apenas esses. Para um SLM de 7B em QLoRA: cabe em 1 GPU RTX 3090 (24GB). Dataset mínimo: 100-500 exemplos de alta qualidade são suficientes para tasks simples. Use unsloth para 2× velocidade de treino. Avalie sempre em hold-out set antes de deploy — SLMs fineTunados podem overfitar rapidamente.</>}
        />
        <QAItem
          q="Como avaliar se um SLM é suficiente para minha task antes de investir em integração?"
          a={<>Avaliação rápida em 30 minutos: (1) Baixe o modelo via Ollama (ollama pull phi4); (2) Prepare 20-50 exemplos representativos da sua task com respostas esperadas; (3) Chame o modelo para cada exemplo; (4) Score manualmente ou via LLM-as-judge; (5) Se accuracy ≥ 85% para task: SLM viável. Se entre 70-85%: finetuning pode resolver. Se {'<'} 70%: precisa de LLM maior ou rearquitetura da task.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> SLMs (1-14B) em 2026 atingem 60-85% da qualidade de LLMs grandes em
        tasks simples. Phi-4 lidera em qualidade/parâmetro. Gemma 3 lidera em on-device. Para mobile:
        Llama 3.2 1-3B via Core ML (iOS) ou ONNX Runtime (Android). Apple Silicon M-series: use MLX
        com modelos quantizados — 35-120 tokens/s. Escolha SLM quando: privacidade, offline, custo de
        escala, ou latência. QLoRA para fine-tuning eficiente com GPU consumer.
      </Callout>
    </div>
  );
}
