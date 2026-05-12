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
  DecisionBox,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ollama-production-deploy');

const ACCENT = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o papel real do Ollama vs llama.cpp?',
    options: [
      'Ollama é uma reimplementação completa do llama.cpp em Go',
      'Ollama é um wrapper em Go sobre llama.cpp que adiciona: model registry com pull/push, CLI estilo Docker, API HTTP nativa compatível com OpenAI, gerenciamento de múltiplos modelos com loading/unloading lazy e Modelfile (Dockerfile-like) para customização',
      'Ollama substitui llama.cpp e não usa ggml',
      'Ollama é um SaaS pago da empresa Ollama Inc.',
    ],
    correct: 1,
    explanation:
      'Ollama é open-source (MIT), feito em Go. Usa llama.cpp via cgo como engine de inferência. A magia é a UX: `ollama run llama3.1` baixa, carrega e abre REPL em um comando. O daemon (ollama serve) gerencia modelos em memória, descarregando os menos usados. API REST em :11434 com endpoints /api/generate, /api/chat, /api/embeddings.',
  },
  {
    question: 'Como o Modelfile funciona e quando usar?',
    options: [
      'Modelfile é binário e armazena pesos do modelo',
      'Modelfile é um manifesto declarativo (como Dockerfile) que parte de um modelo base via FROM, sobrepondo SYSTEM prompt, PARAMETER (temperature, num_ctx), TEMPLATE (chat format), ADAPTER (LoRA) e MESSAGE (few-shot baked-in) — produz um "modelo derivado" reutilizável',
      'Modelfile é o formato GGUF antigo',
      'Modelfile só funciona em modelos OpenAI',
    ],
    correct: 1,
    explanation:
      'Modelfile permite versionar configurações reproduzíveis. `ollama create my-assistant -f Modelfile` gera um novo modelo no registry local com SYSTEM, parâmetros e template já aplicados. Bom para: padronizar prompts entre equipe, fixar config de produção, baked-in few-shot examples, aplicar LoRA adapter (ADAPTER ./adapter.gguf).',
  },
  {
    question: 'Por que rodar Ollama em Docker com GPU passthrough?',
    options: [
      'Não há razão — Docker só atrapalha',
      'Para isolar o runtime (versão Ollama, drivers, deps), reproduzir o ambiente em dev/staging/prod, facilitar CI/CD, e ainda assim usar a GPU via --gpus all + nvidia-container-toolkit (mantém kernel modules no host, expõe device files no container)',
      'Docker é a única forma de rodar Ollama',
      'Para criptografar os pesos do modelo',
    ],
    correct: 1,
    explanation:
      'A imagem oficial `ollama/ollama` já inclui CUDA runtime. Em produção, container + volume persistente para /root/.ollama (cache de modelos) + GPU passthrough via nvidia-container-toolkit é o padrão. Mantém host limpo (sem instalar Ollama direto), permite rolling update via tag, isola dependências de outros serviços na máquina.',
  },
  {
    question: 'Qual é a diferença entre /api/generate e /api/chat no Ollama?',
    options: [
      'São o mesmo endpoint com nomes diferentes',
      '/api/generate é stateless single-turn (recebe prompt cru); /api/chat aplica o chat template do modelo (system+user+assistant), gerencia o histórico de mensagens via array, e é a recomendação para qualquer interação multi-turn — internamente formata via TEMPLATE do Modelfile',
      '/api/chat é mais lento e deve ser evitado',
      '/api/generate não suporta streaming',
    ],
    correct: 1,
    explanation:
      '/api/chat formata automaticamente com chat template (ChatML, Llama-3, Mistral, etc.) e é o endpoint recomendado para chat. /api/generate é útil para fine-grained control sobre o prompt cru (ex.: completions estilo legacy GPT-3, raw template debugging). Ambos suportam streaming via `stream: true` com NDJSON.',
  },
  {
    question: 'Como o Ollama gerencia múltiplos modelos carregados?',
    options: [
      'Carrega todos os modelos disponíveis na memória ao iniciar',
      'Loading lazy: o modelo só sobe na RAM/VRAM na primeira chamada; permanece carregado por OLLAMA_KEEP_ALIVE (default 5min) sem requests, depois é descarregado; em hardware com VRAM limitada, modelos antigos são despejados via LRU quando um novo é solicitado',
      'Cada modelo roda em seu próprio processo isolado',
      'Modelos ficam sempre em disco e são carregados a cada request',
    ],
    correct: 1,
    explanation:
      'Comportamento "Docker-like": ollama-server tem um pool. OLLAMA_KEEP_ALIVE controla TTL idle (`5m` default, `-1` infinito, `0` descarrega após cada request). OLLAMA_MAX_LOADED_MODELS limita modelos simultâneos. Em multi-GPU, OLLAMA_NUM_PARALLEL controla concorrência por modelo. Tuning crítico em produção.',
  },
  {
    question: 'O que é structured output no Ollama e como funciona?',
    options: [
      'Apenas retornar JSON no campo "response"',
      'Constrained generation: você passa schema JSON ou regex, e o sampler do llama.cpp por baixo aplica grammar-based decoding — só tokens válidos pelo schema têm logit > -∞, garantindo saída sintaticamente válida em 100% dos casos (não é prompt engineering, é restrição no sampler)',
      'Um modelo separado treinado para JSON',
      'Pós-processamento que tenta parsear JSON após gerar',
    ],
    correct: 1,
    explanation:
      'Ollama expõe o GBNF grammar do llama.cpp via campo `format` (= "json") ou `format` como schema JSON. Internamente cria um state machine que zera logits de tokens inválidos a cada step. Garante saída válida — mas NÃO garante semântica correta (campos preenchidos com valores razoáveis dependem do modelo). Pareie com Pydantic validation downstream.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ollama-production-deploy"
      title="Ollama em produção: model management, Docker, monitoring"
      icon="🚢"
      xp={60}
      readTime={12}
      trailName="Local LLMs & Edge AI"
      trailColor={ACCENT}
      nextSlug="vllm-paged-attention"
      nextTitle="vLLM e PagedAttention: serving high-throughput"
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
        Ollama tornou-se o padrão de facto para LLM local — não porque inova em inferência (usa llama.cpp por
        baixo), mas porque resolve o que llama.cpp não resolve: <strong>experiência de desenvolvedor</strong>.
        Registry estilo Docker, daemon HTTP, Modelfile reproduzível, multi-model orchestration. Este módulo
        cobre o que muda quando você sai de <InlineCode>ollama run</InlineCode> no laptop e vai para
        <InlineCode>docker compose up</InlineCode> em VPS de produção com 10 modelos e 100 req/min.
      </p>

      <Section title="Arquitetura: daemon + CLI + API" accent={ACCENT}>
        <StackFlow
          title="Stack Ollama em produção"
          accent={ACCENT}
          items={[
            { icon: '👤', label: 'Clientes: SDK Python, JS, curl, OpenWebUI', sub: 'usam HTTP REST :11434' },
            { icon: '🌐', label: 'API HTTP REST (Go net/http)', sub: '/api/chat, /api/generate, /api/embeddings, /api/tags, /api/pull' },
            { icon: '⚙️', label: 'Ollama daemon (Go)', sub: 'model registry, scheduler, KeepAlive, request queue' },
            { icon: '🔌', label: 'cgo bridge → llama.cpp', sub: 'inferência efetiva via ggml + backend (CUDA/Metal/CPU)' },
            { icon: '💾', label: 'Filesystem $OLLAMA_MODELS', sub: 'blobs por SHA + manifests JSON; mmap-friendly' },
          ]}
        />
        <CodeBlock lang="bash">{`# Anatomia do diretório ~/.ollama
~/.ollama/
├── id_ed25519, id_ed25519.pub   # par de chaves para push
├── history                       # histórico do REPL
└── models/
    ├── blobs/                    # conteúdo addressed by sha256
    │   ├── sha256-abc...         # weights GGUF
    │   ├── sha256-def...         # tokenizer
    │   └── sha256-ghi...         # manifest config
    └── manifests/registry.ollama.ai/library/
        ├── llama3.1/8b           # manifest JSON (lista de blobs)
        └── qwen2.5/7b
# Estrutura compatível com OCI image spec (Docker-like)`}</CodeBlock>
        <Callout tone="info">
          Cada modelo é uma <strong>imagem OCI-like</strong>: manifest JSON + blobs imutáveis content-addressed.
          Permite deduplicação automática (mesmo tokenizer compartilhado entre variantes). Push/pull para
          registry funciona como Docker.
        </Callout>
      </Section>

      <Section title="Modelfile: o Dockerfile para LLMs" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O <strong>Modelfile</strong> é a especificação declarativa de um modelo customizado. Diretivas
          principais: <InlineCode>FROM</InlineCode> (base), <InlineCode>SYSTEM</InlineCode> (system prompt),{' '}
          <InlineCode>PARAMETER</InlineCode> (sampling, contexto), <InlineCode>TEMPLATE</InlineCode> (chat
          format), <InlineCode>ADAPTER</InlineCode> (LoRA), <InlineCode>MESSAGE</InlineCode> (few-shot
          embarcado), <InlineCode>LICENSE</InlineCode>.
        </p>
        <CodeBlock lang="dockerfile">{`# Modelfile — assistente FFV Academy customizado
FROM llama3.1:8b-instruct-q4_K_M

# Parâmetros de sampling/contexto
PARAMETER temperature 0.5
PARAMETER top_p 0.9
PARAMETER min_p 0.05
PARAMETER repeat_penalty 1.0
PARAMETER num_ctx 16384
PARAMETER num_predict 2048
PARAMETER stop "<|eot_id|>"

# System prompt fixo (versionado no git junto do Modelfile)
SYSTEM """
Você é o tutor da FFV Academy — escola de engenharia para a era da IA.
Estilo: técnico, denso, sem hype. Cite papers quando relevante.
Idioma: PT-BR. Não diga "como modelo de linguagem". Vá direto ao ponto.
"""

# Template (formato Llama-3 chat)
TEMPLATE """{{ if .System }}<|start_header_id|>system<|end_header_id|>

{{ .System }}<|eot_id|>{{ end }}{{ range .Messages }}<|start_header_id|>{{ .Role }}<|end_header_id|>

{{ .Content }}<|eot_id|>{{ end }}<|start_header_id|>assistant<|end_header_id|>

"""

# LoRA adapter opcional (treinado em corpus FFV)
# ADAPTER ./ffv-academy-lora.gguf

# Few-shot exemplar embarcado
MESSAGE user "O que é MVCC?"
MESSAGE assistant "MVCC (Multi-Version Concurrency Control) é a estratégia que o PostgreSQL usa para isolamento sem locks de leitura..."

LICENSE "MIT"`}</CodeBlock>
        <CodeBlock lang="bash">{`# Build e push para registry privado
ollama create ffv-tutor:v1.2 -f Modelfile

# Listar modelos locais
ollama list

# Inspecionar
ollama show ffv-tutor:v1.2 --modelfile

# Push para registry (Hugging Face Hub, registry próprio, etc.)
ollama push registry.ffv.academy/ffv-tutor:v1.2`}</CodeBlock>
      </Section>

      <Section title="Deploy com Docker e GPU passthrough" accent={ACCENT}>
        <CodeBlock lang="yaml">{`# docker-compose.yml — Ollama com GPU NVIDIA
services:
  ollama:
    image: ollama/ollama:0.5.4
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama     # cache de modelos persistente
    environment:
      OLLAMA_HOST: 0.0.0.0:11434
      OLLAMA_KEEP_ALIVE: 24h          # mantém modelos quentes
      OLLAMA_MAX_LOADED_MODELS: 3     # multi-model simultâneo
      OLLAMA_NUM_PARALLEL: 4          # concorrência por modelo
      OLLAMA_FLASH_ATTENTION: "1"     # ativa FA2
      OLLAMA_KV_CACHE_TYPE: q8_0      # quantiza KV cache
      OLLAMA_DEBUG: "0"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all              # ou device_ids: ['0']
              capabilities: [gpu]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  ollama_data:`}</CodeBlock>
        <CodeBlock lang="bash">{`# Pré-requisitos no host (Ubuntu/Debian)
# 1. Driver NVIDIA atualizado
sudo apt install -y nvidia-driver-550

# 2. nvidia-container-toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt update && sudo apt install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# 3. Subir stack e pre-pull modelos
docker compose up -d
docker exec ollama ollama pull llama3.1:8b-instruct-q4_K_M
docker exec ollama ollama pull qwen2.5:7b-instruct-q4_K_M
docker exec ollama ollama pull nomic-embed-text  # embeddings`}</CodeBlock>
        <Callout tone="warn">
          Em <strong>multi-tenant</strong> (várias apps usando o mesmo Ollama), configure{' '}
          <InlineCode>OLLAMA_MAX_QUEUE</InlineCode> e use reverse proxy (Caddy/nginx) com rate-limit por API
          key. Ollama não tem auth nativo — exponha SEMPRE atrás de proxy autenticado, nunca direto na internet.
        </Callout>
      </Section>

      <Section title="API e function calling" accent={ACCENT}>
        <CodeBlock lang="python">{`# Cliente Python — SDK oficial
import ollama

# Chat simples streaming
for chunk in ollama.chat(
    model="ffv-tutor:v1.2",
    messages=[
        {"role": "user", "content": "Explique speculative decoding."}
    ],
    stream=True,
    options={"temperature": 0.5, "num_ctx": 8192},
):
    print(chunk["message"]["content"], end="", flush=True)

# Structured output via JSON schema
from pydantic import BaseModel

class ModuleSummary(BaseModel):
    title: str
    xp: int
    difficulty: str  # "iniciante" | "intermediario" | "avancado"
    key_concepts: list[str]

resp = ollama.chat(
    model="qwen2.5:7b",
    messages=[{"role": "user", "content": "Resuma o módulo sobre RAG em JSON."}],
    format=ModuleSummary.model_json_schema(),
    options={"temperature": 0.2},
)
summary = ModuleSummary.model_validate_json(resp["message"]["content"])`}</CodeBlock>
        <CodeBlock lang="python">{`# Function calling (tool use) — Ollama 0.4+
import ollama

def get_weather(city: str) -> dict:
    # implementação real (call API, etc.)
    return {"city": city, "temp_c": 22, "condition": "sunny"}

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Retorna clima atual de uma cidade",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "Nome da cidade"}
                },
                "required": ["city"],
            },
        },
    }
]

resp = ollama.chat(
    model="llama3.1:8b",
    messages=[{"role": "user", "content": "Como está o clima em SP?"}],
    tools=tools,
)

# Se o modelo decidir chamar a tool:
if resp["message"].get("tool_calls"):
    for call in resp["message"]["tool_calls"]:
        result = get_weather(**call["function"]["arguments"])
        # Re-envia resultado ao modelo
        resp2 = ollama.chat(
            model="llama3.1:8b",
            messages=[
                {"role": "user", "content": "Como está o clima em SP?"},
                resp["message"],
                {"role": "tool", "content": str(result), "name": "get_weather"},
            ],
        )
        print(resp2["message"]["content"])`}</CodeBlock>
      </Section>

      <Section title="Tuning de produção e monitoramento" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Variável', 'Default', 'Recomendado prod', 'Efeito']}
          rows={[
            ['OLLAMA_KEEP_ALIVE', '5m', '24h ou -1', 'Mantém modelo na memória; evita cold-start'],
            ['OLLAMA_MAX_LOADED_MODELS', '1', 'depende VRAM/RAM', 'Multi-model concorrente'],
            ['OLLAMA_NUM_PARALLEL', '1', '4-8', 'Requests paralelas por modelo (continuous batching)'],
            ['OLLAMA_MAX_QUEUE', '512', '256 com 429', 'Fila antes de rejeitar; preferir backpressure'],
            ['OLLAMA_FLASH_ATTENTION', 'auto', '1', 'FA2 sempre (com KV quant pareado)'],
            ['OLLAMA_KV_CACHE_TYPE', 'f16', 'q8_0', 'Quantiza KV cache; metade da memória'],
            ['OLLAMA_HOST', '127.0.0.1', '0.0.0.0:11434 atrás de proxy', 'Aceita external (com auth no proxy)'],
            ['OLLAMA_DEBUG', '0', '0', 'Logs verbose; só em troubleshoot'],
            ['OLLAMA_NEW_ENGINE', '0', '1 (2026+)', 'Novo runtime Go (sem cgo); experimental para mainline'],
          ]}
        />
        <CodeBlock lang="bash">{`# Métricas a coletar (Prometheus exporter via /api/ps + custom)
# Endpoint /api/ps lista modelos carregados, size, vram, expires_at

curl -s http://localhost:11434/api/ps | jq
# {
#   "models": [{
#     "name": "llama3.1:8b",
#     "size": 4661211808,
#     "size_vram": 4661211808,
#     "expires_at": "2026-05-10T15:23:00Z",
#     "details": {"parameter_size": "8B", "quantization_level": "Q4_K_M"}
#   }]
# }

# Métricas custom via wrapper Python (cada request)
import time, ollama
t0 = time.time()
r = ollama.chat(model="llama3.1:8b", messages=[{"role":"user","content":"oi"}])
# r["total_duration"]  → nanosegundos totais
# r["load_duration"]   → ns para carregar modelo (0 se já quente)
# r["prompt_eval_count"], r["prompt_eval_duration"]  → prefill
# r["eval_count"], r["eval_duration"]  → decode tok/s = eval_count / (eval_duration/1e9)`}</CodeBlock>
        <FlowDiagram
          accent={ACCENT}
          title="Dashboards mínimos em prod"
          orientation="horizontal"
          steps={[
            { icon: '📊', label: 'tokens/s decode', desc: 'p50/p95 por modelo' },
            { icon: '⏱️', label: 'TTFT', desc: 'time to first token' },
            { icon: '🔢', label: 'requests/min', desc: 'por modelo, por endpoint' },
            { icon: '💾', label: 'VRAM utilization', desc: 'GPU exporter via DCGM' },
            { icon: '🚨', label: 'error rate', desc: '5xx + timeouts > N' },
          ]}
        />
      </Section>

      <Section title="Quando NÃO usar Ollama" accent={ACCENT}>
        <DecisionBox
          scenario="Você precisa servir >100 req/s para o mesmo modelo em produção crítica"
          winner="vLLM, TGI ou TensorRT-LLM"
          winnerColor={ACCENT}
          why="Ollama é otimizado para UX dev e multi-model com poucas requests concorrentes. vLLM tem PagedAttention, prefix caching automático, chunked prefill — 5-20× mais throughput em workloads concorrentes. Ollama é a escolha errada para alta concorrência sustentada."
          alternatives={[
            { name: 'Single user / dev local / multi-model com baixo QPS → Ollama vence em UX' }, { name: 'Self-hosted produção alta concorrência → vLLM com OpenAI API compat' }, { name: 'Datacenter NVIDIA otimizado → TensorRT-LLM (latência mínima)' }, { name: 'Edge / mobile → llama.cpp direto (sem daemon)' }
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Como atualizar um modelo no Ollama sem perder o cache de outros?"
          a={<><InlineCode>ollama pull llama3.1:8b</InlineCode> baixa apenas blobs novos (deduplicação por SHA). Tokenizer e config compartilhados não são re-baixados. Se quiser remover uma variante específica: <InlineCode>ollama rm llama3.1:8b-instruct-q4_0</InlineCode>.</>}
        />
        <QAItem
          q="Posso rodar Ollama em CPU-only em VPS pequeno?"
          a={<>Sim. Funciona em qualquer VPS com AVX2. Modelos Q4_K_M de 1-3B (Qwen 2.5 1.5B, Phi-4 mini, Gemma 2B) rodam a 8-15 tok/s em 2 vCPUs. Para 7B+ em CPU prefira hardware com AVX-512 (Xeon Gold, EPYC Genoa). Hetzner CPX21 (3 vCPU AMD) roda Llama 3.2 3B em ~10 tok/s.</>}
        />
        <QAItem
          q="Ollama suporta vision models (multimodal)?"
          a={<>Sim. <InlineCode>ollama run llava:13b</InlineCode>, <InlineCode>ollama run llama3.2-vision:11b</InlineCode>, <InlineCode>ollama run qwen2.5-vision</InlineCode>. API aceita campo <InlineCode>images</InlineCode> (lista base64). Embeddings dedicados: <InlineCode>ollama pull nomic-embed-text</InlineCode> ou <InlineCode>bge-m3</InlineCode>.</>}
        />
        <QAItem
          q="Como integrar Ollama com LangChain/LlamaIndex?"
          a={<>Ambos têm adapters nativos. LangChain: <InlineCode>from langchain_ollama import ChatOllama</InlineCode>. LlamaIndex: <InlineCode>from llama_index.llms.ollama import Ollama</InlineCode>. Endpoint /v1 do Ollama também é OpenAI-compatible — qualquer cliente OpenAI funciona apontando para http://localhost:11434/v1.</>}
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Repo', v: 'github.com/ollama/ollama (Go, MIT)' },
            { k: 'Docs API', v: 'github.com/ollama/ollama/blob/main/docs/api.md' },
            { k: 'Modelfile reference', v: 'github.com/ollama/ollama/blob/main/docs/modelfile.md' },
            { k: 'Registry público', v: 'ollama.com/library' },
            { k: 'OpenAI compat', v: 'github.com/ollama/ollama/blob/main/docs/openai.md' },
            { k: 'nvidia-container-toolkit', v: 'docs.nvidia.com/datacenter/cloud-native/container-toolkit/' },
          ]}
        />
      </Section>
    </div>
  );
}
