import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  StackFlow,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('on-device-inference-mobile');

const ACCENT = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é ExecuTorch e como difere de PyTorch Mobile?',
    options: [
      'Nada — são o mesmo projeto',
      'ExecuTorch (Meta, 2024) é o sucessor do PyTorch Mobile: exportação via torch.export → ahead-of-time compilation → arquivo .pte interpretado por runtime C++ de ~250KB em produção. Suporta backends Apple MPS, Vulkan, XNNPACK, CoreML, Qualcomm QNN, MediaTek NeuroPilot. PyTorch Mobile foi descontinuado em 2024',
      'ExecuTorch é cloud, não mobile',
      'ExecuTorch é só para inferência em web',
    ],
    correct: 1,
    explanation:
      'ExecuTorch é o caminho oficial Meta para LLMs/visão em mobile/edge desde 2024. PyTorch Mobile foi marcado deprecated. O fluxo: model → torch.export() → to_edge() → to_executorch() → .pte. Runtime C++ tiny (~250KB), zero deps Python, plug-in de delegates por hardware específico (Apple Neural Engine, Qualcomm DSP, etc).',
  },
  {
    question: 'Como o Apple Foundation Models framework (iOS 26+) muda o jogo?',
    options: [
      'Apenas wrapper de OpenAI',
      'iOS 26+ expõe API nativa em Swift (FoundationModels.framework) para usar o LLM on-device do Apple Intelligence — ~3B params destilado, INT4 ANE, com adapters por task selecionados em runtime. Apps usam sem baixar modelo, sem custo de inferência, com latência local — mas restritos ao escopo permitido (text gen, summarize, rewrite)',
      'Substitui MLX',
      'Só funciona em Mac',
    ],
    correct: 1,
    explanation:
      'Anunciado WWDC 2025, lançado iOS 26 (set/2025). Modelo ~3B + adapters de ~10-50MB ativados por task (summarization, mail reply, etc.). Roda no Neural Engine com INT4. Apps Swift acessam via `LanguageModelSession`. Disponível em iPhone 15 Pro+ (8GB RAM). Não substitui MLX (este permite usar QUALQUER modelo), mas é a forma idiomática Apple.',
  },
  {
    question: 'Qual o papel do Google AI Edge / MediaPipe LLM Inference?',
    options: [
      'Apenas para uso interno do Google',
      'MediaPipe LLM Inference é a runtime Google para LLMs on-device em Android/iOS/web: aceita modelos Gemma 2B/7B, Phi-2, Falcon, StableLM em formato .task otimizado; usa GPU delegate (OpenGL/Vulkan/Metal) ou CPU; integração Kotlin/Swift/JS — alternativa Google ao ExecuTorch da Meta',
      'É só para vídeo',
      'Substitui TensorFlow Lite',
    ],
    correct: 1,
    explanation:
      'MediaPipe é a evolução do TFLite para inferência multimodal. LLM Inference API foi lançada 2024 para rodar modelos em mobile/web. Formato .task encapsula modelo + tokenizer + config. Suporta Gemma 2B int4 a ~30-50 tok/s em flagships Android 2024+. Foco: latência baixa, integração nativa, GPU delegate eficiente.',
  },
  {
    question: 'Por que Core ML continua sendo a forma "canônica" no Apple?',
    options: [
      'Não é mais usado',
      'Core ML é a runtime nativa Apple desde iOS 11 (2017): compila .mlpackage com graph estático otimizado para ANE/GPU/CPU, integra com App Store review (modelo embarcado), suporta encrypted models, e tem ferramentas de profiling exclusivas (Instruments ML template) — é o caminho com menos atrito para distribuir em produção iOS',
      'Apenas para visão',
      'Substituído por MLX',
    ],
    correct: 1,
    explanation:
      'Core ML continua o caminho oficial para inferência em apps iOS distribuídos via App Store. coremltools converte modelos PyTorch/TF/MLX para .mlpackage. ANE (Neural Engine) só é totalmente explorado via Core ML. MLX é melhor para pesquisa/experimentação; ExecuTorch para cross-platform; Core ML para produção iOS pura.',
  },
  {
    question: 'Quais modelos LLM 2026 são viáveis em mobile flagship?',
    options: [
      'Llama 70B em iPhone 16',
      'SLMs (small language models) dominam o on-device 2026: Phi-3.5-mini (3.8B), Gemma 2 2B, Qwen 2.5 3B/1.5B/0.5B, Llama 3.2 1B/3B, Apple foundation ~3B — todos em INT4 (~1-2GB) rodando a 15-40 tok/s em iPhone 16 Pro / Pixel 9 Pro / S24 Ultra',
      'Apenas modelos 100M-500M',
      'Nenhum',
    ],
    correct: 1,
    explanation:
      'O sweet-spot 2026 mobile é 1B-3.8B INT4. RAM/bandwidth/thermal limitam acima disso. Modelos especializados (function calling, structured output, classification) podem ser ainda menores (300M-500M) e excelentes para tarefas específicas. Vision-language: Phi-3.5-vision 4B, Gemma 2B vision — viáveis para OCR, captioning, simple visual QA on-device.',
  },
  {
    question: 'Trade-offs principais on-device vs cloud LLM?',
    options: [
      'Cloud é sempre melhor',
      'On-device: privacy total (nada sai), latência consistente (sem rede), $0 inferência, funciona offline, mas modelo menor, RAM/thermal limitam, atualizar exige app update. Cloud: modelos topo de linha, escala, atualizado constantemente, mas latência variável, custos por token, dependência de conexão, considerações de privacy',
      'On-device é sempre melhor',
      'Idênticos',
    ],
    correct: 1,
    explanation:
      'A arquitetura híbrida vence em 2026: tarefas rápidas/privacy-sensitive (sumarizar email, reescrever texto, classificar intent) → on-device com SLM. Tarefas pesadas (raciocínio multi-step, código, longas pesquisas) → cloud com LLM topo de linha. Apple Intelligence faz isso explicitamente: SLM local primeiro; se complexidade exceder, escala para Private Cloud Compute.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="on-device-inference-mobile"
      title="On-device inference mobile: ExecuTorch, MediaPipe, Core ML"
      icon="📱"
      xp={65}
      readTime={13}
      trailName="Local LLMs & Edge AI"
      trailColor={ACCENT}
      nextSlug="rag-local-private"
      nextTitle="RAG 100% local e privado: LanceDB, Ollama, Qdrant local"
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
        Em 2026, o LLM no seu bolso virou realidade. iPhone 16 Pro roda Apple Foundation ~3B no Neural Engine,
        Pixel 9 Pro roda Gemma 2 2B via MediaPipe, Galaxy S24 Ultra roda Phi-3 mini via Qualcomm AI Engine. A
        infraestrutura que viabiliza isso é discreta — ExecuTorch (Meta), MediaPipe LLM Inference (Google), Core
        ML (Apple), Qualcomm QNN, MediaTek NeuroPilot — mas cada uma resolve o mesmo problema fundamental: como
        rodar redes de bilhões de parâmetros em dispositivos com 8-12GB de RAM e 5W de TDP.
      </p>

      <Section title="O cenário 2026: SLMs dominam o mobile" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Params', 'Tamanho INT4', 'iPhone 16 Pro', 'Pixel 9 Pro', 'S24 Ultra']}
          rows={[
            ['Llama 3.2 1B-Instruct', '1.23B', '~650 MB', '~45 tok/s', '~38 tok/s', '~42 tok/s'],
            ['Llama 3.2 3B-Instruct', '3.21B', '~1.8 GB', '~22 tok/s', '~18 tok/s', '~20 tok/s'],
            ['Gemma 2 2B', '2.5B', '~1.4 GB', '~28 tok/s', '~32 tok/s (GPU TPU)', '~24 tok/s'],
            ['Phi-3.5-mini 4B', '3.8B', '~2.1 GB', '~18 tok/s', '~16 tok/s', '~17 tok/s'],
            ['Qwen 2.5 1.5B', '1.5B', '~850 MB', '~38 tok/s', '~32 tok/s', '~35 tok/s'],
            ['Apple Foundation ~3B', '~3B', '~1.5 GB ANE', 'Nativa, latência baixa', 'N/A', 'N/A'],
          ]}
        />
        <Callout tone="info">
          A regra prática: modelo INT4 com size ≤ 1/3 da RAM total do device, idealmente ≤ 2GB. Excedendo isso,
          pressure de memória mata o app em background, throttle térmico aparece em conversas longas, bateria
          drena visivelmente.
        </Callout>
      </Section>

      <Section title="ExecuTorch: o padrão multi-plataforma da Meta" accent={ACCENT}>
        <StackFlow
          title="Fluxo de exportação ExecuTorch"
          accent={ACCENT}
          items={[
            { icon: '🐍', label: 'Modelo PyTorch (eager)', sub: 'nn.Module com pesos float32/16' },
            { icon: '📐', label: 'torch.export()', sub: 'captura graph estático com TorchDynamo, sem Python' },
            { icon: '✂️', label: 'to_edge() + quantização', sub: 'INT4/INT8 PTQ, partitioner por backend' },
            { icon: '🎯', label: 'Delegates por backend', sub: 'CoreMLBackend, MPSBackend, XNNPACK, QualcommBackend...' },
            { icon: '📦', label: '.pte file', sub: 'arquivo único portátil com graph + pesos + metadados' },
            { icon: '⚡', label: 'Runtime C++ (~250KB)', sub: 'embarcado no app; zero deps Python' },
          ]}
        />
        <CodeBlock lang="python">{`# ExecuTorch — pipeline de exportação Llama 3.2 1B para iOS
import torch
from executorch.examples.models.llama2 import Llama2Model
from executorch.exir import to_edge
from executorch.backends.apple.coreml.partition.coreml_partitioner import CoreMLPartitioner

# 1. Carrega modelo PyTorch
model = Llama2Model("Llama-3.2-1B-Instruct", checkpoint_path="./consolidated.pth")
model.eval()

# 2. Quantização INT4 (groupwise) via PT2E
from torch.ao.quantization.quantizer.embedding_quantizer import EmbeddingQuantizer
from torch.ao.quantization.quantizer.coreml_quantizer import CoreMLQuantizer

quantizer = CoreMLQuantizer(bits=4, group_size=64)
m = torch._export.capture_pre_autograd_graph(model, example_inputs)
m = prepare_pt2e(m, quantizer)
# calibração
for batch in calib_loader: m(batch)
m = convert_pt2e(m)

# 3. Exporta para Edge IR
edge = to_edge(torch.export(m, example_inputs))

# 4. Delegate para Core ML (otimiza para ANE)
edge = edge.to_backend(CoreMLPartitioner())

# 5. Salva .pte
prog = edge.to_executorch()
with open("llama-3.2-1b-coreml-int4.pte", "wb") as f:
    f.write(prog.buffer)`}</CodeBlock>
        <CodeBlock lang="swift">{`// Runtime em iOS (Swift) — usando ExecuTorch
import ExecuTorchLLM

let modelPath = Bundle.main.path(forResource: "llama-3.2-1b-coreml-int4", ofType: "pte")!
let tokenizerPath = Bundle.main.path(forResource: "tokenizer", ofType: "json")!

let runner = try LLMRunner(modelPath: modelPath, tokenizerPath: tokenizerPath)

let prompt = "Resuma este email em 2 frases: ..."
try await runner.generate(prompt: prompt, maxTokens: 200) { token in
    DispatchQueue.main.async { self.streamingText += token }
}`}</CodeBlock>
      </Section>

      <Section title="MediaPipe LLM Inference (Google)" accent={ACCENT}>
        <CodeBlock lang="kotlin">{`// Android Kotlin — MediaPipe LLM Inference
import com.google.mediapipe.tasks.genai.llminference.LlmInference

class GemmaService(context: Context) {
    private val llm: LlmInference

    init {
        val options = LlmInference.LlmInferenceOptions.builder()
            .setModelPath("/data/local/tmp/gemma-2b-it-gpu-int4.task")
            .setMaxTokens(2048)
            .setMaxTopK(40)
            .setTemperature(0.7f)
            .setPreferredBackend(LlmInference.Backend.GPU)  // ou CPU
            .build()
        llm = LlmInference.createFromOptions(context, options)
    }

    suspend fun generate(prompt: String): String = withContext(Dispatchers.IO) {
        llm.generateResponse(prompt)
    }
}`}</CodeBlock>
        <CodeBlock lang="javascript">{`// Web — MediaPipe LLM Inference no browser via WebGPU
import { FilesetResolver, LlmInference } from "@mediapipe/tasks-genai";

const genai = await FilesetResolver.forGenAiTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm",
);

const llm = await LlmInference.createFromOptions(genai, {
  baseOptions: { modelAssetPath: "/models/gemma-2b-it-gpu-int4.bin" },
  maxTokens: 1024,
  topK: 40,
  temperature: 0.7,
  randomSeed: 101,
});

const response = await llm.generateResponse("Explique RAG em 2 frases.");`}</CodeBlock>
      </Section>

      <Section title="Apple Foundation Models (iOS 26+)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Anunciada na WWDC 2025 e disponível em iOS 26+, a <strong>FoundationModels.framework</strong> expõe o
          LLM on-device do Apple Intelligence para apps de terceiros. Modelo base ~3B parâmetros INT4 no ANE,
          adapters específicos por tarefa (~10-50MB) baixados sob demanda e ativados em runtime.
        </p>
        <CodeBlock lang="swift">{`// Apple Foundation Models — iOS 26+
import FoundationModels

// 1. Verifica disponibilidade (iPhone 15 Pro+, iPad M-series, todos Mac)
guard SystemLanguageModel.default.availability == .available else { return }

// 2. Sessão com guided generation (Swift macros para schema-aware output)
@Generable struct EmailSummary {
    @Guide(description: "Resumo em 2 frases, PT-BR")
    let summary: String

    @Guide(description: "Lista de action items")
    let actions: [String]

    let urgency: Urgency

    enum Urgency: String, Generable {
        case low, medium, high
    }
}

let session = LanguageModelSession(instructions: """
Você resume emails profissionais em português.
""")

let result = try await session.respond(
    to: emailContent,
    generating: EmailSummary.self,
)

print(result.content.summary)        // typed!
print(result.content.actions)
print(result.content.urgency)`}</CodeBlock>
        <Callout tone="info">
          A FoundationModels.framework usa <strong>guided generation</strong>: o sistema garante que o output
          obedece o schema declarado via macros Swift, fazendo constrained decoding por baixo. Permite que apps
          tratem o LLM como uma função typed sem regex parsing nem JSON validation manual.
        </Callout>
      </Section>

      <Section title="Comparativo de runtimes" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Runtime', 'Maintainer', 'Plataformas', 'Formato', 'Force']}
          rows={[
            ['ExecuTorch', 'Meta', 'iOS, Android, Linux, embedded', '.pte', 'Cross-platform, runtime tiny (~250KB), PyTorch direto'],
            ['MediaPipe LLM', 'Google', 'Android, iOS, Web (WebGPU), Linux', '.task', 'Integração Google, GPU delegate maduro, web first-class'],
            ['Core ML', 'Apple', 'iOS, macOS, watchOS, visionOS', '.mlpackage', 'Apple-only, ANE total, App Store nativo'],
            ['Apple Foundation', 'Apple', 'iOS 26+, macOS 15+', 'Embarcado SO', 'Sem download, swift macros, gratuito'],
            ['llama.cpp + bindings', 'Comunidade', 'Todas', '.gguf', 'Flexibilidade total, modelos OSS abertos'],
            ['Qualcomm QNN', 'Qualcomm', 'Android Snapdragon', '.dlc', 'NPU Hexagon dedicado, latência mínima Android premium'],
            ['MediaTek NeuroPilot', 'MediaTek', 'Android Dimensity', '.dla', 'NPU MediaTek; mercado Asia/Europa'],
            ['ONNX Runtime Mobile', 'Microsoft', 'iOS, Android, Web', '.onnx', 'Polígrafo de formatos; menos otimizado em mobile que ET/MediaPipe'],
          ]}
        />
      </Section>

      <Section title="Padrões de uso e arquitetura híbrida" accent={ACCENT}>
        <FlowDiagram
          accent={ACCENT}
          title="Decisão: on-device vs cloud por task"
          orientation="vertical"
          steps={[
            { icon: '🔒', label: 'Privacy crítica (medical, legal, PII)', desc: '→ SEMPRE on-device. Não envie ao cloud, mesmo que perca qualidade' },
            { icon: '⚡', label: 'Latência <100ms exigida', desc: '→ on-device (cloud sempre tem >150ms round-trip)' },
            { icon: '📶', label: 'App precisa funcionar offline', desc: '→ on-device obrigatório' },
            { icon: '🧠', label: 'Reasoning multi-step, código, pesquisa longa', desc: '→ cloud (LLM topo de linha vence SLM em raciocínio)' },
            { icon: '💸', label: 'Free tier / sem custo de token', desc: '→ on-device preferível, fallback cloud para tasks pesadas' },
            { icon: '🔄', label: 'Híbrido (best of both)', desc: '→ Apple Intelligence pattern: SLM local → escala para LLM cloud se necessário' },
          ]}
        />
      </Section>

      <Section title="Limites reais e armadilhas" accent={ACCENT}>
        <Callout tone="warn">
          <strong>Thermal throttling</strong>: gerar texto contínuo em mobile aquece. Após 2-5 minutos de uso
          sustentado, OS reduz freq → tok/s cai 30-50%. Mitigar com batches curtos, streaming, dar respiros.
        </Callout>
        <Callout tone="warn">
          <strong>Memória de KV cache</strong>: contexto de 4k tokens em Llama 3.2 3B INT4 já come ~600MB. Em
          mobile com 8GB RAM, isso pressiona o sistema. Use ctx-size enxuto (1-2k típico) ou KV cache quantizado
          quando suportado.
        </Callout>
        <Callout tone="warn">
          <strong>Bateria</strong>: inferência GPU sustentada consome 3-5W. 10 minutos contínuos = 5-8% da
          bateria. Apps devem usar com parcimônia ou em background com cota.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso usar ExecuTorch e Core ML juntos?"
          a={<>Sim — ExecuTorch tem o <InlineCode>CoreMLBackend</InlineCode> que delega partes do graph para Core ML/ANE. Combina portabilidade do ExecuTorch com performance Core ML em Apple.</>}
        />
        <QAItem
          q="React Native ou Flutter têm bindings?"
          a={<>RN: <InlineCode>react-native-executorch</InlineCode>, <InlineCode>react-native-mediapipe</InlineCode>. Flutter: <InlineCode>flutter_gemma</InlineCode>, <InlineCode>llama_cpp_dart</InlineCode>. Funcionam, mas latência via bridge é pior que nativo (Swift/Kotlin).</>}
        />
        <QAItem
          q="Como atualizar modelo sem app update?"
          a={<>Apple permite OTA model download via <InlineCode>FoundationModels</InlineCode> (adapters baixados sob demanda). Em ExecuTorch/MediaPipe, baixe .pte/.task do seu CDN no primeiro launch. Cuidado com tamanho de download (1-2GB) e App Store guidelines.</>}
        />
        <QAItem
          q="Modelos com vision (multimodal) em mobile?"
          a="Sim, viáveis. Phi-3.5-vision-instruct (4B), Gemma 2B vision, Qwen2-VL 2B. Funcionam para OCR, captioning, leitura de documentos. Latência ~3-8s por imagem em flagship. Vision encoders são pesados — quantize-os agressivamente."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'ExecuTorch', v: 'pytorch.org/executorch — Meta, docs e exemplos LLM' },
            { k: 'MediaPipe LLM Inference', v: 'developers.google.com/mediapipe/solutions/genai/llm_inference' },
            { k: 'Apple Foundation Models', v: 'developer.apple.com/documentation/foundationmodels (iOS 26+)' },
            { k: 'Core ML Tools', v: 'github.com/apple/coremltools' },
            { k: 'Qualcomm AI Hub', v: 'aihub.qualcomm.com — modelos pré-otimizados para Snapdragon' },
            { k: 'Phi-3 paper', v: 'Abdin et al., "Phi-3 Technical Report", arXiv:2404.14219' },
            { k: 'Apple Intelligence Foundation', v: 'machinelearning.apple.com/research/introducing-apple-foundation-models' },
          ]}
        />
      </Section>
    </div>
  );
}
