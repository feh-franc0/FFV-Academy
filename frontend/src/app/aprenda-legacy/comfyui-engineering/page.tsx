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

export const metadata = getModuleMetadata('comfyui-engineering');

const accent = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a principal vantagem técnica do ComfyUI sobre A1111 (AUTOMATIC1111) para uso em produção?',
    options: [
      'ComfyUI é mais bonito',
      'ComfyUI representa o pipeline como um grafo de nós (DAG) serializado em JSON, permitindo versionamento, automação via API, reprodução exata e composição complexa — A1111 é uma UI sobre prompts/extensões, sem representação estrutural do workflow',
      'A1111 não suporta Flux',
      'ComfyUI roda só em CPU',
      'A1111 não tem extensões',
    ],
    correct: 1,
    explanation:
      'ComfyUI (criado por comfyanonymous em 2023) trata o pipeline como um grafo direcionado de nós tipados: cada nó é uma função (load checkpoint, encode text, sample, decode VAE, etc.). O grafo serializa em JSON — versionável em git, automatizável via REST API, reproduzível bit-a-bit. A1111 evoluiu como interface monolítica com extensões; reproduzir um output exato é mais frágil.',
  },
  {
    question: 'Como o workflow JSON do ComfyUI funciona internamente?',
    options: [
      'É um YAML de configuração',
      'É um grafo onde cada nó tem ID, class_type (ex: "KSampler", "CheckpointLoaderSimple"), inputs (que apontam para outputs de outros nós via [node_id, output_index]). O execution engine resolve a topologia, executa em ordem topológica e faz caching de outputs intermediários',
      'É um shell script',
      'É um docker compose',
      'É bytecode Python',
    ],
    correct: 1,
    explanation:
      'A representação é um dict Python (também serializável em JSON) onde cada chave é o node_id e o valor contém class_type + inputs. Inputs podem ser literais ou referências [src_node_id, output_idx]. O backend Python resolve as dependências (topological sort) e executa. Caching automático evita recomputar steps que não mudaram entre runs.',
  },
  {
    question: 'O que é um "custom node" no ComfyUI?',
    options: [
      'Um node escrito em Rust',
      'Uma classe Python que implementa INPUT_TYPES (declara inputs tipados), RETURN_TYPES (outputs tipados) e um método (ex: execute) que faz o processamento. ComfyUI carrega dinamicamente custom nodes do diretório custom_nodes/ no boot, permitindo extender com qualquer lógica (modelos novos, pré/pós-processamento, integrações)',
      'Um arquivo de configuração JSON apenas',
      'Um plugin de browser',
      'Um workflow inteiro empacotado',
    ],
    correct: 1,
    explanation:
      'A API para custom nodes é uma classe Python simples. Por isso o ecossistema explodiu — qualquer dev pode adicionar nodes. Manager (ltdrdata/ComfyUI-Manager) é o package manager comunitário; ComfyRegistry é a versão oficial mais recente. Os 10 nodes mais usados (Impact Pack, IPAdapter Plus, ControlNet Auxiliary, etc.) movem o ecossistema.',
  },
  {
    question: 'Como rodar um workflow do ComfyUI em produção como API server?',
    options: [
      'Não é possível, ComfyUI é só UI',
      'ComfyUI já é um servidor — basta rodar main.py com --listen, e ele expõe REST + WebSocket: POST /prompt envia o JSON do workflow, GET /history/{prompt_id} lê resultado, WS /ws stream de progresso. Para produção use ComfyUI Deploy (BennyKok), Replicate ComfyUI, ou containerize com nvidia-docker',
      'Você precisa portar para FastAPI manualmente',
      'Só via plugin Selenium',
      'Tem que reescrever em Go',
    ],
    correct: 1,
    explanation:
      'ComfyUI é construído com aiohttp por baixo — o "UI" é só o frontend web. Os endpoints /prompt, /history, /queue, /ws estão sempre expostos. Para produção sério, ComfyUI Deploy (open source, suporta workers + autoscaling), Replicate ou Modal hostam ComfyUI em containers GPU. Salesforce, fal.ai e RunPod também oferecem ComfyUI como serviço.',
  },
  {
    question: 'Por que versionar o workflow JSON em git é mais robusto que screenshots?',
    options: [
      'JSON é texto — diffs legíveis, code review possível, branch/merge funcionam, reproduzível 100% exato (mesmo seed, mesmo modelo, mesmo node_id → mesma imagem). Screenshots são opacos, não auditáveis e não reprodutíveis',
      'JSON ocupa menos espaço',
      'GitHub tem suporte nativo ao formato',
      'Screenshots não funcionam no Linux',
      'JSON é o único formato aceito pelo Photoshop',
    ],
    correct: 0,
    explanation:
      'Operacionalmente: você abre PR mudando o sampler ou o LoRA, o reviewer vê o diff exato, testa em branch, faz merge. Cliente reporta "regressão" — você dá git blame no node modificado. Tudo o que produção precisa. Screenshots não permitem nada disso. Hashes dos modelos + seed fixo = reprodução determinística.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="comfyui-engineering"
      title="ComfyUI engineering: workflow como código"
      icon="🔧"
      xp={65}
      readTime={13}
      trailName="Diffusion & Geração Multimodal"
      trailColor={accent}
      nextSlug="video-generation-sora"
      nextTitle="Video generation: Sora, Runway Gen-4, Kling, Veo"
      quiz={quiz}
    >
      <Section title="Por que ComfyUI ganhou a guerra das UIs" accent={accent}>
        <p>
          Em 2022-2023 a comunidade Stable Diffusion vivia em torno do AUTOMATIC1111 — a "web UI" monolítica que botou SD na
          mão de todo mundo. Excelente para uso individual: prompts, sliders, extensões. Péssima para engenharia: workflow
          opaco, reprodução frágil, automação custosa.
        </p>
        <p>
          ComfyUI (comfyanonymous, jan 2023) atacou o problema na raiz: <strong>o pipeline É um grafo</strong>. Cada operação
          (carregar checkpoint, encodar prompt, samplar, decodar VAE, salvar) vira um nó. Inputs/outputs tipados. Grafo
          serializa em JSON. Esse JSON é o artefato versionável — não mais "um conjunto de configurações na UI".
        </p>
        <Callout tone="success" icon="🏆">
          A virada vencedora: em vez de tentar esconder a complexidade do diffusion atrás de presets, ComfyUI <em>expôs</em> a
          complexidade. Para iniciantes assustou; para engineers virou o padrão profissional. Hoje (2026) é a UI dominante em
          produção, com fal.ai, Replicate, Runpod e ComfyUI Deploy hospedando-o como serviço.
        </Callout>
      </Section>

      <Section title="O modelo mental: grafo direcionado de nós tipados" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="horizontal"
          title="Workflow básico de txt2img (5 nós)"
          steps={[
            { label: 'CheckpointLoader', desc: 'Carrega modelo .safetensors → outputs: MODEL, CLIP, VAE' },
            { label: 'CLIPTextEncode (pos)', desc: 'prompt + CLIP → CONDITIONING positivo' },
            { label: 'CLIPTextEncode (neg)', desc: 'prompt neg + CLIP → CONDITIONING negativo' },
            { label: 'KSampler', desc: 'MODEL + cond_pos + cond_neg + LATENT (init) → LATENT denoised' },
            { label: 'VAEDecode + SaveImage', desc: 'LATENT + VAE → IMAGE → PNG no disco' },
          ]}
        />
        <p>
          Tipos comuns: <InlineCode>MODEL</InlineCode>, <InlineCode>CLIP</InlineCode>, <InlineCode>VAE</InlineCode>,
          <InlineCode> CONDITIONING</InlineCode>, <InlineCode>LATENT</InlineCode>, <InlineCode>IMAGE</InlineCode>,
          <InlineCode> MASK</InlineCode>, <InlineCode>CONTROL_NET</InlineCode>. O engine valida que outputs/inputs casem — se
          você plugar IMAGE numa entrada esperando LATENT, erro de validação.
        </p>
      </Section>

      <Section title="O JSON por trás do workflow" accent={accent}>
        <CodeBlock lang="json" filename="workflow.json (formato API)">{`{
  "1": {
    "class_type": "CheckpointLoaderSimple",
    "inputs": { "ckpt_name": "flux1-dev.safetensors" }
  },
  "2": {
    "class_type": "CLIPTextEncode",
    "inputs": {
      "text": "a cyberpunk cat, neon lighting, 35mm film",
      "clip": ["1", 1]
    }
  },
  "3": {
    "class_type": "CLIPTextEncode",
    "inputs": { "text": "", "clip": ["1", 1] }
  },
  "4": {
    "class_type": "EmptyLatentImage",
    "inputs": { "width": 1024, "height": 1024, "batch_size": 1 }
  },
  "5": {
    "class_type": "KSampler",
    "inputs": {
      "seed": 42, "steps": 28, "cfg": 3.5,
      "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0,
      "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0],
      "latent_image": ["4", 0]
    }
  },
  "6": {
    "class_type": "VAEDecode",
    "inputs": { "samples": ["5", 0], "vae": ["1", 2] }
  },
  "7": {
    "class_type": "SaveImage",
    "inputs": { "images": ["6", 0], "filename_prefix": "out" }
  }
}`}</CodeBlock>
        <Callout tone="info" icon="📝">
          Note como cada input que vem de outro nó é uma tupla [node_id, output_index]. <InlineCode>["1", 0]</InlineCode>
          significa "primeiro output do nó 1" — o MODEL do CheckpointLoader. Output 1 é CLIP, output 2 é VAE.
        </Callout>
      </Section>

      <Section title="Anatomia de um custom node" accent={accent}>
        <CodeBlock lang="python" filename="custom_nodes/my_node/__init__.py">{`# Exemplo: um nó que aplica um filtro de luminância numa imagem
import torch

class LuminanceShift:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image": ("IMAGE",),
                "shift":  ("FLOAT", {"default": 0.1, "min": -1.0, "max": 1.0, "step": 0.01}),
            },
            "optional": {
                "mask": ("MASK",),
            },
        }

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image",)
    FUNCTION = "shift_luminance"
    CATEGORY = "image/postprocess"

    def shift_luminance(self, image, shift, mask=None):
        # image shape: [B, H, W, 3] em [0,1]
        # Luminance: 0.299 R + 0.587 G + 0.114 B
        lum = image[..., 0] * 0.299 + image[..., 1] * 0.587 + image[..., 2] * 0.114
        delta = shift
        if mask is not None:
            delta = shift * mask.unsqueeze(-1)
        out = (image + delta).clamp(0, 1)
        return (out,)

NODE_CLASS_MAPPINGS = {"LuminanceShift": LuminanceShift}
NODE_DISPLAY_NAME_MAPPINGS = {"LuminanceShift": "Luminance Shift"}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'INPUT_TYPES', v: 'Tipos esperados; suporta required/optional/hidden. Tipos validados pelo engine.' },
            { k: 'RETURN_TYPES', v: 'Tuple com tipos de output, casa com return da função.' },
            { k: 'FUNCTION', v: 'Nome do método chamado durante execução.' },
            { k: 'CATEGORY', v: 'Onde aparece no menu da UI ("Add Node").' },
            { k: 'NODE_CLASS_MAPPINGS', v: 'Registro global; ComfyUI scaneia ao boot.' },
          ]}
        />
      </Section>

      <Section title="Custom nodes essenciais (2026)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Node Pack', 'Autor', 'Função', 'Por que importa']}
          rows={[
            ['ComfyUI-Manager', 'ltdrdata', 'Package manager', 'Instala/atualiza outros nodes sem mexer no git'],
            ['ComfyUI-Impact-Pack', 'ltdrdata', 'Detalhamento facial, upscale, masking', 'Workflow profissional de retrato'],
            ['ComfyUI_IPAdapter_plus', 'cubiq', 'IP-Adapter', 'Style/subject reference'],
            ['comfyui_controlnet_aux', 'Fannovel16', 'Pré-processadores de ControlNet', 'Canny/Depth/Pose tudo num pack'],
            ['ComfyUI-AnimateDiff-Evolved', 'Kosinkadink', 'Vídeo curto (motion modules)', 'Antes de Sora/Veo, era o gerador de vídeo'],
            ['ComfyUI-Crystools', 'crystian', 'Sysinfo overlay (VRAM, RAM)', 'Debug em production'],
            ['rgthree-comfy', 'rgthree', 'Reroutes, Mute, Power Lora Loader', 'QoL — workflows complexos'],
            ['was-node-suite', 'WASasquatch', 'Centenas de utilities', 'Image ops, math, color, latent'],
            ['ComfyUI-Easy-Use', 'yolain', 'Workflows pré-prontos compactos', 'Reduz boilerplate'],
            ['ComfyUI-Flux-Trainer', 'kijai', 'Treinar LoRA dentro do ComfyUI', 'Closing the loop'],
          ]}
        />
      </Section>

      <Section title="REST API + WebSocket: ComfyUI como backend" accent={accent}>
        <CodeBlock lang="python" filename="comfyui_client.py">{`# Cliente Python — manda workflow e baixa resultado
import json, time, uuid, requests, websocket

COMFY = "http://localhost:8188"
CLIENT_ID = str(uuid.uuid4())

def submit(workflow_json: dict) -> str:
    r = requests.post(f"{COMFY}/prompt", json={
        "prompt": workflow_json,
        "client_id": CLIENT_ID,
    })
    return r.json()["prompt_id"]

def wait_via_ws(prompt_id: str) -> dict:
    ws = websocket.WebSocket()
    ws.connect(f"ws://localhost:8188/ws?clientId={CLIENT_ID}")
    while True:
        msg = json.loads(ws.recv())
        if msg["type"] == "executing":
            data = msg["data"]
            if data["node"] is None and data["prompt_id"] == prompt_id:
                ws.close()
                break
    # busca outputs no /history
    return requests.get(f"{COMFY}/history/{prompt_id}").json()[prompt_id]

def download_image(filename: str, subfolder: str = "", folder_type: str = "output") -> bytes:
    r = requests.get(f"{COMFY}/view", params={
        "filename": filename, "subfolder": subfolder, "type": folder_type,
    })
    return r.content

# Uso
with open("workflow.json") as f:
    wf = json.load(f)
wf["5"]["inputs"]["seed"] = int(time.time())   # parametrize
pid = submit(wf)
result = wait_via_ws(pid)
img = result["outputs"]["7"]["images"][0]
png_bytes = download_image(img["filename"], img["subfolder"], img["type"])
open("out.png", "wb").write(png_bytes)`}</CodeBlock>
        <Callout tone="info" icon="🔌">
          Essa API é estável desde 2023. Toda integração comercial (fal, Replicate, RunPod) usa exatamente esse pattern por
          trás dos panos.
        </Callout>
      </Section>

      <Section title="Produção: ComfyUI Deploy e alternativas" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Plataforma', 'Tipo', 'Quando usar']}
          rows={[
            ['ComfyUI Deploy (BennyKok)', 'Self-hosted ou nuvem', 'Open-source, control total, autoscaling, multi-workflow management'],
            ['Replicate', 'Hospedado', 'Sem ops; mais caro; ideal para protótipo/produto pequeno'],
            ['fal.ai', 'Hospedado, low-latency', 'Real-time; melhor latência do mercado para diffusion'],
            ['RunPod', 'GPU VM', 'Roda ComfyUI numa VM; barato em on-demand'],
            ['Modal', 'Serverless GPU', 'Bom para batch jobs grandes; container Python'],
            ['Salad', 'Edge GPU spot', 'GPU consumer barata; latência variável'],
          ]}
        />
        <StackFlow
          accent={accent}
          title="Arquitetura típica de produção com ComfyUI Deploy"
          items={[
            { icon: '📱', label: 'App do cliente', sub: 'web/mobile', detail: 'Submete prompt + parâmetros' },
            { icon: '🔌', label: 'Sua API (FastAPI/Next.js)', sub: 'auth + billing', detail: 'Recebe request, valida user, debita créditos', connector: 'POST /run' },
            { icon: '🎛️', label: 'ComfyUI Deploy server', sub: 'orchestrator', detail: 'Recebe workflow ID + inputs; coloca na fila', connector: 'enqueue' },
            { icon: '🎮', label: 'Pool de GPU workers', sub: 'ComfyUI rodando', detail: 'N workers (A100/H100) consomem fila; autoscale por carga', connector: 'WS progress' },
            { icon: '☁️', label: 'Storage (S3/R2)', sub: 'artifacts', detail: 'PNG/MP4 finais; URL pré-assinada devolvida ao cliente' },
          ]}
        />
      </Section>

      <Section title="Decisão: ComfyUI vs A1111 vs SD.Next vs InvokeAI" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="Você está montando um pipeline de produção que precisa ser versionável e automatizável"
          winner="ComfyUI"
          why="JSON serializável + custom nodes + REST API estável. Toda a infra cloud (fal, Replicate, RunPod) oferece como primeira classe. Comunidade enorme, suporte rápido a modelos novos (Flux, SD3 chegaram primeiro no ComfyUI)."
          alternatives={[
            { name: 'AUTOMATIC1111' }, { name: 'Workflow opaco, automação complexa, manutenção da extensions caótica. Ainda forte na comunidade casual' }, { name: 'InvokeAI' }, { name: 'UX mais polida, foco em fluxo profissional artístico — mas API menos madura' }, { name: 'SD.Next' }, { name: 'Fork de A1111 mais moderno, mas mesma limitação estrutural' }, { name: 'Construir do zero com diffusers' }, { name: 'Você reinventa workflow engine, queue, UI; ComfyUI já resolveu' }
          ]}
        />
      </Section>

      <Section title="Práticas de engenharia para workflows ComfyUI" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Versione o JSON', v: 'workflows/v1/character_portrait.json + .api.json. Git diff legível.' },
            { k: 'Lock de modelos', v: 'Registre hashes SHA256 dos .safetensors usados; pin de versões em README.' },
            { k: 'Seeds determinísticos para testes', v: 'CI roda workflow com seed fixo e compara hash do PNG. Regressão automática.' },
            { k: 'Parametrize via "inputs"', v: 'Use nodes especiais (Primitive, externals) para parâmetros que mudam por request — não duplique workflows.' },
            { k: 'Cuidado com Manager em prod', v: 'Em prod, fixe versões de custom_nodes no Dockerfile. Auto-update derruba reprodutibilidade.' },
            { k: 'Profiling', v: 'Use crystools / Comfy-Profiler para identificar gargalos (VAE? CLIP? Sampler?).' },
            { k: 'Multi-GPU', v: 'ComfyUI suporta CUDA_VISIBLE_DEVICES; pool de workers via ComfyUI Deploy.' },
          ]}
        />
      </Section>

      <Section title="Perguntas que sobram" accent={accent}>
        <QAItem
          q="ComfyUI suporta vídeo (AnimateDiff, CogVideoX, Mochi)?"
          a="Sim, e cada vez melhor. AnimateDiff-Evolved (Kosinkadink) é padrão para motion modules. CogVideoX, Mochi, LTX-Video, Hunyuan Video — todos têm custom nodes maduros em 2026. Próximo módulo cobre geração de vídeo em detalhe."
        />
        <QAItem
          q="Qual a diferença entre 'workflow JSON' e 'API JSON'?"
          a="O 'workflow JSON' (export padrão da UI) inclui metadados visuais (posições dos nós, links visuais). O 'API JSON' (Save → Export — API Format) é minimalista, só estrutura lógica. Para automação, use sempre o API format — é o que /prompt aceita."
        />
        <QAItem
          q="Como fazer A/B test de workflow em produção?"
          a="Mantenha dois workflows JSON (v1, v2). Sua API rotaciona requests entre eles (50/50). Compare métricas — latência, custo, qualidade subjetiva via thumbs up/down do usuário, ou FID/CLIP score se for batch."
        />
        <QAItem
          q="Posso rodar ComfyUI em Mac (M-series)?"
          a="Sim, com --cpu-vae ou via Metal backend (PYTORCH_ENABLE_MPS_FALLBACK=1). M2/M3 Max com 64+ GB unified memory roda Flux Dev em fp8/NF4 razoavelmente. Para produção use NVIDIA — Apple GPU é ~2-4× mais lento que H100 equivalente."
        />
      </Section>

      <Section title="Recursos" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'ComfyUI repo', v: 'github.com/comfyanonymous/ComfyUI — código base, docs.' },
            { k: 'ComfyUI Manager', v: 'github.com/ltdrdata/ComfyUI-Manager — package manager.' },
            { k: 'ComfyUI Deploy', v: 'github.com/BennyKok/comfyui-deploy — production hosting.' },
            { k: 'ComfyRegistry', v: 'comfyregistry.org — registry oficial de custom nodes.' },
            { k: 'Comfy.org', v: 'comfy.org — docs oficiais (após move para org formal em 2024).' },
            { k: 'Workflows comunitários', v: 'civitai.com/workflows — milhares de workflows JSON.' },
          ]}
        />
        <Callout tone="info" icon="➡️">
          Próximo: geração de vídeo. Sora, Runway Gen-4, Kling 2.0, Veo 3. Como DiT temporal funciona, VAE temporal, e quais
          são os limites práticos hoje (duração, fidelidade temporal, custo).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
