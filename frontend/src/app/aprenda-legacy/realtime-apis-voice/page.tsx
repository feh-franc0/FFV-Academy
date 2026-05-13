import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('realtime-apis-voice');
const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que um pipeline STT→LLM→TTS não consegue competir em latência com GPT-4o Realtime?',
    options: [
      'Consegue sim, só precisa mais GPUs',
      'Porque STT precisa do fim da fala antes de decodificar, LLM gera texto completo antes do TTS começar, e TTS tem seu próprio TTFA. Somando chega fácil em 1.5-2s. GPT-4o Realtime processa áudio nativamente em modelo único e começa a falar enquanto ainda te ouve',
      'É só marketing',
      'WebRTC é mais rápido',
    ],
    correct: 1,
    explanation: 'A barreira do pipeline não é rede — é sequencialidade. Cada etapa espera a anterior terminar. Realtime APIs resolvem isso com modelo audio-in/audio-out que pode começar a gerar resposta antes do usuário terminar de falar, graças ao VAD server-side e à arquitetura unified.',
  },
  {
    question: 'O que é VAD (Voice Activity Detection) e por que é crítico em voice agents?',
    options: [
      'Um codec de áudio',
      'É o algoritmo que detecta quando o usuário começou e parou de falar — define turn-taking. Sem VAD robusto, o agent corta o usuário no meio da frase ou espera silêncio demais. Tunar VAD threshold + silence duration é onde a UX de voz é ganha ou perdida',
      'Um tipo de microfone',
      'Um framework frontend',
    ],
    correct: 1,
    explanation: 'VAD é literalmente a lógica "agora é sua vez de falar". Silero VAD (open source) e VAD built-in dos providers (OpenAI, LiveKit) expõem threshold (sensibilidade) e silence duration (quanto silêncio conta como "acabou"). Valor padrão raramente serve — precisa ajustar para o ambiente (escritório silencioso vs call center).',
  },
  {
    question: 'Como lidar com interrupção (barge-in) em voice agent de produção?',
    options: [
      'Ignorar, usuário espera sua vez',
      'Ao detectar voz do usuário enquanto o agent fala, parar o TTS imediatamente (cancel audio output), descartar o texto não falado e começar nova transcrição. GPT-4o Realtime e LiveKit Agents expõem evento de interrupção — seu código precisa limpar buffer e atualizar histórico',
      'Mutar o microfone do usuário',
      'Não é possível',
    ],
    correct: 1,
    explanation: 'Barge-in é padrão em telefone há 30 anos e essencial em voice agent. Implementação: VAD detecta voz, dispara evento interrupt, você cancela o chunk de áudio em curso E marca no histórico de conversação que a resposta foi interrompida (senão o LLM acha que ele falou tudo).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="realtime-apis-voice"
      title="Realtime APIs: GPT-4o Realtime, conversational voice"
      icon="⚡"
      xp={60}
      readTime={14}
      trailName="Voice, Vision & Multimodal"
      trailColor={accent}
      nextSlug="vision-models-claude-gpt"
      nextTitle="Vision models: Claude Vision, GPT-4V, Gemini"
      quiz={quiz}
    >
      <Section title="Por que pipeline quebra em conversa" accent={accent}>
        <p>
          Voice agent conversacional vive ou morre na latência. Usuário percebe &gt;500ms como desconforto, &gt;1s como travamento, &gt;2s desliga. Pipeline tradicional (VAD → STT → LLM → TTS) tem custo sequencial: cada etapa precisa da anterior. Na prática, mesmo com Whisper streaming + LLM com SSE + Cartesia Sonic, você raramente desce de 1.2s de round-trip.
        </p>
        <p>
          Realtime APIs (OpenAI Realtime com GPT-4o, Gemini Live, Claude com audio input em beta) resolvem isso com modelo único que consome e produz áudio. Turn-taking, VAD e geração paralela ficam server-side.
        </p>
      </Section>

      <Section title="Arquitetura WebRTC vs WebSocket" accent={accent}>
        <p>
          OpenAI Realtime API expõe dois transportes. WebSocket é o mais fácil (backend ou script Node), mas você vira o responsável pelo jitter buffer e pela qualidade do áudio. WebRTC dá peer-to-peer com o modelo, com correção de perda de pacote e echo cancellation nativos — essencial para mobile e chamadas reais.
        </p>
        <CodeBlock lang="ts">{`// Cliente browser — WebRTC direto com o modelo
const pc = new RTCPeerConnection();

// Track de áudio do microfone
const media = await navigator.mediaDevices.getUserMedia({ audio: true });
pc.addTrack(media.getTracks()[0]);

// Receber áudio de volta
pc.ontrack = (ev) => { audioElement.srcObject = ev.streams[0]; };

// Data channel para eventos de controle (tool calls, interrupts)
const dc = pc.createDataChannel('oai-events');
dc.onmessage = (ev) => handleRealtimeEvent(JSON.parse(ev.data));

// SDP offer -> endpoint OpenAI com token efêmero
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const resp = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + ephemeralToken, // gerado no backend
    'Content-Type': 'application/sdp',
  },
  body: offer.sdp,
});

await pc.setRemoteDescription({ type: 'answer', sdp: await resp.text() });`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Nunca exponha sua API key no browser. Gere um <strong>ephemeral token</strong> no backend via <code>POST /v1/realtime/sessions</code> e entregue só esse token ao cliente — ele expira em 60s.
        </Callout>
      </Section>

      <Section title="Configurando a sessão" accent={accent}>
        <p>
          Antes de o áudio fluir, você manda um evento <code>session.update</code> definindo voz, instruções, tools disponíveis e parâmetros de VAD.
        </p>
        <CodeBlock lang="json">{`{
  "type": "session.update",
  "session": {
    "modalities": ["audio", "text"],
    "voice": "sage",
    "instructions": "Você é um assistente conciso em PT-BR. Nunca interrompa o usuário.",
    "input_audio_transcription": { "model": "whisper-1" },
    "turn_detection": {
      "type": "server_vad",
      "threshold": 0.5,
      "prefix_padding_ms": 300,
      "silence_duration_ms": 500
    },
    "tools": [
      {
        "type": "function",
        "name": "get_weather",
        "description": "Retorna clima atual",
        "parameters": { "type": "object", "properties": { "city": { "type": "string" } }, "required": ["city"] }
      }
    ],
    "tool_choice": "auto"
  }
}`}</CodeBlock>
      </Section>

      <Section title="Turn-taking e VAD na prática" accent={accent}>
        <p>
          Com <code>server_vad</code>, o modelo decide sozinho quando o usuário terminou de falar e começa a gerar resposta. Os parâmetros importam muito:
        </p>
        <CodeBlock lang="yaml">{`turn_detection:
  threshold: 0.5             # sensibilidade (0-1). Em ambiente barulhento suba para 0.7
  prefix_padding_ms: 300     # quanto áudio ANTES do VAD disparar enviar ao modelo
  silence_duration_ms: 500   # silêncio contínuo para considerar "usuário parou"

# Regras de bolso:
# - call center / barulho alto: threshold 0.7, silence 700ms
# - escritório silencioso: threshold 0.4, silence 400ms
# - usuários idosos (pausas longas): silence 1000-1500ms`}</CodeBlock>
      </Section>

      <Section title="Barge-in: interrompendo o agent" accent={accent}>
        <p>
          Evento crítico para UX real. Quando o usuário começa a falar enquanto o agent fala, o servidor emite <code>input_audio_buffer.speech_started</code>. Você precisa cortar o áudio sendo tocado E truncar a resposta no histórico, senão o modelo acredita que terminou a frase.
        </p>
        <CodeBlock lang="ts">{`dc.onmessage = (ev) => {
  const event = JSON.parse(ev.data);
  switch (event.type) {
    case 'input_audio_buffer.speech_started':
      // Usuário falou em cima: parar saída atual
      stopAudioPlayback();
      dc.send(JSON.stringify({ type: 'response.cancel' }));
      break;
    case 'response.audio.delta':
      enqueueAudio(event.delta); // base64 PCM16
      break;
    case 'response.function_call_arguments.done':
      handleToolCall(event.name, JSON.parse(event.arguments));
      break;
  }
};`}</CodeBlock>
      </Section>

      <Section title="Tool use em voz: o destravamento" accent={accent}>
        <p>
          Voice agent útil precisa chamar tools (marcar agenda, consultar banco, tocar música). Realtime API entrega tool calls como eventos no data channel, você executa e devolve o resultado como <code>conversation.item.create</code>. O modelo volta a falar incorporando o resultado.
        </p>
        <Callout tone="info" icon="💡">
          Para tools que demoram (&gt;500ms), instrua o modelo a dizer algo como "só um momento" antes de chamar. Isso é feito no system prompt — sem isso, há silêncio incômodo enquanto a tool executa.
        </Callout>
      </Section>

      <Section title="LiveKit Agents: produção séria" accent={accent}>
        <p>
          Para voice agent em escala (call center, suporte telefônico via SIP), rolar tudo sozinho é tortura. <strong>LiveKit Agents</strong> oferece framework Python/Node com VAD plugável (Silero), STT/TTS/LLM plugáveis, gravação, métricas e SIP trunk para telefone real.
        </p>
        <CodeBlock lang="python">{`from livekit.agents import Agent, AgentSession, JobContext
from livekit.plugins import openai, silero

async def entrypoint(ctx: JobContext):
    await ctx.connect()

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=openai.STT(model='whisper-1', lang='pt'),
        llm=openai.LLM(model='gpt-4o'),
        tts=openai.TTS(voice='nova'),
        # OU: llm=openai.realtime.RealtimeModel() para end-to-end
    )

    agent = Agent(instructions='Você é suporte técnico em PT-BR, conciso.')
    await session.start(agent=agent, room=ctx.room)`}</CodeBlock>
      </Section>

      <Section title="Custos reais" accent={accent}>
        <p>
          GPT-4o Realtime custa ~$100/1M tokens input e ~$200/1M output de áudio (em 2026). Um minuto de conversa vira ~500-700 tokens de áudio cada lado. Ou seja, cada minuto custa na ordem de $0.15-0.20. Caro para call center alto volume — aí pipeline (Whisper + GPT-4o texto + Cartesia) pode ser 5x mais barato ao custo de latência maior.
        </p>
      </Section>

      <Section title="Operação: o que sempre quebra" accent={accent}>
        <Callout tone="success" icon="✅">
          Checklist: (1) ephemeral token no backend, nunca key no client; (2) VAD tunado ao ambiente real; (3) barge-in com cancel de áudio E truncate de resposta; (4) timeout para tool calls + fala de espera; (5) fallback para pipeline quando Realtime API falha; (6) gravação + transcrição para eval. Se faltar qualquer um, o agent vira demo, não produto.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
