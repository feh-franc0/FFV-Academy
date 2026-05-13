import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, CodeBlock, ComparisonTable, KeyValue, DecisionBox } from '@/components/article/primitives';

export const metadata = getModuleMetadata('api-replicate-fal');

const accent = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'Replicate, fal.ai, RunPod e Modal são serviços de:',
    options: [
      'Hospedagem de site',
      'Inferência GPU on-demand para modelos AI (especialmente generativos como SD, Flux, Whisper, LLMs). Você não opera GPU — eles cobram por segundo de uso',
      'Sinônimos',
      'CDNs',
    ],
    correct: 1,
    explanation: 'Cada um com foco distinto: Replicate (catálogo + marketplace), fal.ai (low-latency WebSocket-first), RunPod (serverless GPU bruto), Modal (Python-native ergonomia). Use quando rodar GPU própria não compensa.',
  },
  {
    question: 'Qual a maior diferença entre fal.ai e Replicate?',
    options: [
      'fal.ai é mais caro',
      'fal.ai foca em latência baixa (WebSocket streaming, modelos otimizados, ~1-3s para SD) e DX para realtime; Replicate foca em catálogo amplo + reprodutibilidade (Docker-based, cold-start mais lento, mas qualquer modelo)',
      'Replicate só roda LLM',
      'fal.ai só roda em GPU AMD',
    ],
    correct: 1,
    explanation: 'fal.ai brilha quando você precisa de "Flux gera imagem em <2s para o usuário esperar" — modelos otimizados, WebSocket streaming. Replicate brilha quando você quer "qualquer modelo da comunidade" — cold-start ok, catálogo enorme.',
  },
  {
    question: 'Qual o principal trade-off de Modal vs RunPod?',
    options: [
      'Modal é mais caro mas igual',
      'Modal: DX Python excepcional (decorators @app.function, deploy em segundos, debugging amigável); RunPod: bare-metal serverless GPU (você sobe Docker, ele roda), mais barato em escala mas DX mais crua',
      'RunPod é mais lento',
      'Modal não suporta GPU',
    ],
    correct: 1,
    explanation: 'Modal é o "Vercel para AI Python" — decorators, hot reload, deploy automático. RunPod é o EC2 GPU on-demand — mais flexível mas você gerencia o Docker. Modal ~30-50% mais caro mas vale para times pequenos/protótipo.',
  },
  {
    question: 'Por que usar API ao invés de rodar a GPU próprio em 2026?',
    options: [
      'Sempre é melhor API',
      'API faz sentido quando: (1) volume baixo/intermitente (GPU própria fica idle); (2) cold-start tolerado; (3) quer testar muitos modelos sem invest. GPU própria vale quando volume sustentado > custo mensal de A100/H100',
      'Sempre é melhor GPU própria',
      'Nunca usar nenhuma das duas',
    ],
    correct: 1,
    explanation: 'Regra empírica: < 4h/dia de GPU equivalente = API ganha. > 12h/dia sustentado = GPU própria/reserved ganha. Entre os dois, depende de cold-start tolerance e variabilidade.',
  },
  {
    question: 'Sobre rate limits e fallbacks em produção:',
    options: [
      'Não importam',
      'Provider primário pode falhar / atingir limit; tenha 2-3 providers com modelos equivalentes e router de fallback (Replicate → fal.ai → próprio). Cache de resultado idêntico (input hash) economiza chamadas.',
      'Apenas Replicate falha',
      'Cache não funciona em AI',
    ],
    correct: 1,
    explanation: 'Em produção, single provider = single point of failure. Stack típica: cache local de outputs idênticos → primary provider → fallback secundário. Hash do input determinístico (prompt + seed) já caça 5-15% das chamadas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="api-replicate-fal"
      title="APIs de geração: Replicate, fal.ai, RunPod, Modal"
      icon="🌐"
      xp={55}
      readTime={11}
      trailName="Diffusion & Geração Multimodal"
      trailColor={accent}
      nextSlug="eval-fid-clip"
      nextTitle="Avaliação: FID, CLIP score"
      quiz={quiz}
    >
      <Section title="O cenário — quando NÃO rodar a GPU própria" accent={accent}>
        <p className="text-sm leading-6">
          A pergunta certa não é "qual GPU comprar?", é <i>"vale comprar GPU?"</i>. Em 2026, com APIs maduras e preços competitivos, a maior parte dos times indie/SaaS roda em provider especializado. Ganha velocidade, não gerencia driver CUDA, escala automaticamente. Perde controle e custo unitário em alto volume.
        </p>
      </Section>

      <Section title="Os 4 grandes em 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Provider', 'Foco', 'Pricing típico', 'Cold-start']}
          rows={[
            ['Replicate', 'Catálogo amplo, marketplace de modelos', 'US$0.0005-0.0023/s + por modelo', '5-30s (cold), <1s (warm)'],
            ['fal.ai', 'Low-latency, realtime, WebSocket', 'US$0.001-0.003/s', '~1-3s (otimizado)'],
            ['RunPod Serverless', 'Bare-metal GPU on-demand, Docker', 'US$0.0001-0.0008/s GPU + storage', '~10-60s (cold)'],
            ['Modal', 'Python-native, DX excepcional', 'US$0.0006-0.003/s + ergonomia', '~3-15s'],
          ]}
        />
      </Section>

      <Section title="Replicate em 5 linhas" accent={accent}>
        <CodeBlock lang="typescript">{`import Replicate from 'replicate';
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const output = await replicate.run(
  'black-forest-labs/flux-schnell:bf53bdb9...',
  { input: { prompt: 'a cyberpunk dolphin riding a hovercraft, neon-lit, 8k' } }
);
// output é array de URLs com a imagem gerada`}</CodeBlock>
      </Section>

      <Section title="fal.ai — streaming realtime" accent={accent}>
        <CodeBlock lang="typescript">{`import { fal } from '@fal-ai/client';
fal.config({ credentials: process.env.FAL_KEY });

// Modo subscribe (WebSocket streaming de progress)
const result = await fal.subscribe('fal-ai/flux/dev', {
  input: { prompt: 'a serene mountain lake at dawn', image_size: 'landscape_16_9' },
  onQueueUpdate: (update) => {
    if (update.status === 'IN_PROGRESS') {
      console.log('logs:', update.logs?.map(l => l.message));
    }
  },
});
console.log(result.data.images[0].url);`}</CodeBlock>
      </Section>

      <Section title="Modal — Python-native" accent={accent}>
        <CodeBlock lang="python">{`import modal

app = modal.App('my-flux-app')
image = (
    modal.Image.debian_slim()
    .pip_install('torch', 'diffusers', 'transformers')
)

@app.function(image=image, gpu='A100', timeout=300)
def generate(prompt: str) -> bytes:
    from diffusers import FluxPipeline
    pipe = FluxPipeline.from_pretrained('black-forest-labs/FLUX.1-dev')
    image = pipe(prompt).images[0]
    import io
    buf = io.BytesIO()
    image.save(buf, format='PNG')
    return buf.getvalue()

# Deploy: modal deploy my_app.py
# Chama via @app.function como endpoint REST automático`}</CodeBlock>
      </Section>

      <Section title="RunPod — bare-metal serverless" accent={accent}>
        <CodeBlock lang="python">{`# handler.py (Docker)
import runpod
def handler(event):
    prompt = event['input']['prompt']
    # Seu código de inferência aqui
    return {'image_url': '...'}

runpod.serverless.start({'handler': handler})

# Build Docker, push para registry, criar endpoint serverless no RunPod
# Chama via REST: POST https://api.runpod.ai/v2/{endpoint_id}/runsync`}</CodeBlock>
      </Section>

      <Section title="Decisão prática" accent={accent}>
        <DecisionBox
          scenario="Qual provider para qual caso?"
          winner="Depende — não há vencedor universal"
          winnerColor={accent}
          why="Cada um brilha em um eixo. Evite religião de stack."
          alternatives={[
            { name: 'Realtime UX (image gen <3s)', note: 'fal.ai' },
            { name: 'Catálogo amplo + protótipos', note: 'Replicate' },
            { name: 'Time Python sério, deploy rápido', note: 'Modal' },
            { name: 'Custo mínimo em escala, Docker comfort', note: 'RunPod' },
            { name: 'Volume sustentado >12h/dia', note: 'GPU própria ou reserved (Lambda Labs, Vast.ai)' },
          ]}
        />
      </Section>

      <Section title="Patterns de produção" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Cache idempotente', v: 'Hash(prompt + seed + model) → URL cacheada. Economiza 5-15% das chamadas.' },
            { k: 'Fallback chain', v: 'Provider primário → secundário → "tentando novamente em breve" no UI.' },
            { k: 'Webhook async', v: 'Para gerações >5s, use webhook callback. Não bloqueie request.' },
            { k: 'Rate-limit por usuário', v: 'No seu app, antes de chamar o provider. Evita explosão de custo por usuário malicioso.' },
            { k: 'Logging com custo', v: 'Estime custo $/inference e logue para reconciliar com fatura.' },
            { k: 'Region awareness', v: 'fal.ai e Replicate têm regiões — sirva da mais próxima do usuário.' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
