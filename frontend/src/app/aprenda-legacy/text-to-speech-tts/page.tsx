import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('text-to-speech-tts');
const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual TTS escolher para um voice agent conversacional com latência <200ms?',
    options: [
      'ElevenLabs Multilingual v2 (qualidade top)',
      'Cartesia Sonic ou ElevenLabs Turbo/Flash em streaming WebSocket — ambos entregam primeiro chunk de áudio em <100ms. ElevenLabs v2 e OpenAI TTS-1-HD têm qualidade maior mas latência incompatível com conversa ao vivo',
      'Qualquer um serve',
      'Sempre OpenAI TTS',
    ],
    correct: 1,
    explanation: 'Latência conversacional é brutal. Cartesia Sonic foi desenhado para isso (modelo state-space). ElevenLabs Flash e Turbo v2 são as opções streaming rápidas. Modelos de maior qualidade (ElevenLabs Multilingual v2) têm TTFA de 500ms+ — ótimos para podcast, ruins para chat.',
  },
  {
    question: 'Qual é a regra ética mínima para voice cloning em produto?',
    options: [
      'Basta uma checkbox no cadastro',
      'Consent explícito documentado (assinado/áudio gravado confirmando), escopo limitado (apenas o conteúdo acordado), opt-out a qualquer momento, watermarking quando possível (ElevenLabs faz) e compliance com LGPD/GDPR/EU AI Act 2025 (deepfake disclosure)',
      'Não existe regra',
      'Só pode clonar vozes famosas',
    ],
    correct: 1,
    explanation: 'Voz é biometria. Clone sem consent é crime em várias jurisdições a partir de 2025 (EU AI Act, leis estaduais US). Produtos sérios exigem: prova de consent, watermark audível ou inaudível, e log de todo áudio gerado. ElevenLabs Voice Lab exige "voice verification" justamente por isso.',
  },
  {
    question: 'Por que usar SSML ou tags de controle em TTS profissional?',
    options: [
      'Deixa mais bonito no código',
      'Porque prosódia (pausa, ênfase, velocidade) é o que separa "robô" de "humano". Tags como <break>, <emphasis>, ou markers ElevenLabs ([laughs], [pause]) dão controle fino. Sem isso, números, datas e siglas saem com cadência errada',
      'É obrigatório',
      'Não serve pra nada',
    ],
    correct: 1,
    explanation: 'TTS "drop-in" soa plausível em frases curtas, mas trava em pontuação complexa, siglas (API, CEO), números longos e listas. SSML (OpenAI, Azure) ou syntax proprietária (ElevenLabs) permite inserir <break time="300ms"/>, ênfase, phoneme override. Em prod, isso vira template por tipo de conteúdo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="text-to-speech-tts"
      title="Text-to-speech: ElevenLabs, OpenAI, Cartesia"
      icon="🔊"
      xp={50}
      readTime={12}
      trailName="Voice, Vision & Multimodal"
      trailColor={accent}
      nextSlug="realtime-apis-voice"
      nextTitle="Realtime APIs: GPT-4o Realtime, conversational voice"
      quiz={quiz}
    >
      <Section title="Três provedores, três otimizações" accent={accent}>
        <p>
          TTS moderno divide-se em três campos claros. <strong>ElevenLabs</strong> lidera em qualidade e voice cloning. <strong>OpenAI TTS-1/TTS-1-HD</strong> entrega vozes sólidas por preço baixo e integração trivial. <strong>Cartesia Sonic</strong> foi construído para latência absurdamente baixa (modelo state-space, TTFA &lt;90ms). Escolher significa decidir qual eixo é prioridade.
        </p>
      </Section>

      <Section title="ElevenLabs: qualidade e voice cloning" accent={accent}>
        <p>
          ElevenLabs é o default quando qualidade de voz é o produto (audiolivros, podcasts gerados, brand voice). Suporta PT-BR bem, tem Voice Lab para clonagem (exige verificação de identidade) e oferece modelo Turbo/Flash para streaming.
        </p>
        <CodeBlock lang="ts">{`import { ElevenLabsClient } from 'elevenlabs';

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_KEY });

// Streaming para latência baixa
const audio = await client.textToSpeech.convertAsStream(
  'VOICE_ID',
  {
    text: 'Olá, este é um teste de voz em português.',
    model_id: 'eleven_turbo_v2_5', // Turbo/Flash = latência; Multilingual v2 = qualidade
    voice_settings: {
      stability: 0.5,        // 0 = expressivo/imprevisível, 1 = monótono
      similarity_boost: 0.75,
      style: 0.3,            // exageração estilística
      use_speaker_boost: true,
    },
  }
);

for await (const chunk of audio) {
  res.write(chunk);
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <code>stability</code> baixo deixa a voz mais humana mas menos previsível entre frases. Para leitura de nomes de clientes ou valores monetários, suba para 0.6+ ou você terá pronúncias diferentes da mesma palavra em frases consecutivas.
        </Callout>
      </Section>

      <Section title="OpenAI TTS: simples e barato" accent={accent}>
        <p>
          OpenAI TTS-1 ($15/M chars) e TTS-1-HD ($30/M chars) cobrem o 80% dos casos com 1 chamada HTTP. Seis vozes fixas (alloy, echo, fable, onyx, nova, shimmer). Não há voice cloning.
        </p>
        <CodeBlock lang="ts">{`import OpenAI from 'openai';

const client = new OpenAI();

const mp3 = await client.audio.speech.create({
  model: 'tts-1',            // tts-1 = rápido; tts-1-hd = qualidade
  voice: 'nova',
  input: 'Bom dia. Sua reunião começa em cinco minutos.',
  response_format: 'mp3',    // mp3 | opus | aac | flac | wav | pcm
  speed: 1.0,                // 0.25 a 4.0
});

const buffer = Buffer.from(await mp3.arrayBuffer());`}</CodeBlock>
      </Section>

      <Section title="Cartesia Sonic: quando cada ms conta" accent={accent}>
        <p>
          Voice agent que responde em tempo real (chamada telefônica, assistente pessoal) não tolera 500ms de TTFA. Cartesia Sonic usa arquitetura state-space ao invés de transformer tradicional e atinge first-audio em &lt;90ms via WebSocket.
        </p>
        <CodeBlock lang="ts">{`import { CartesiaClient } from '@cartesia/cartesia-js';

const cartesia = new CartesiaClient({ apiKey: process.env.CARTESIA_KEY });

const ws = cartesia.tts.websocket({ container: 'raw', encoding: 'pcm_f32le', sampleRate: 44100 });

await ws.connect();

// Enviar texto em chunks à medida que o LLM gera
for await (const chunk of llmStream) {
  await ws.send({
    model_id: 'sonic-english',
    voice: { mode: 'id', id: 'VOICE_ID' },
    transcript: chunk,
    continue: true,   // sinaliza "mais texto vem por aí"
  });
}

await ws.send({ continue: false }); // fecha utterance`}</CodeBlock>
      </Section>

      <Section title="Controlando prosódia: o salto de qualidade" accent={accent}>
        <p>
          A diferença entre um TTS "aceitável" e um que engana ouvido humano é prosódia. Todos os três provedores aceitam marcadores. Template por tipo de conteúdo é padrão profissional.
        </p>
        <CodeBlock lang="ts">{`// ElevenLabs v3 aceita tags inline
const textWithProsody =
  'Bem-vindo ao suporte. [pause] ' +
  'Por favor, diga seu CPF [pause] dígito por dígito.';

// OpenAI / Azure aceitam SSML
const ssml =
  '<speak>' +
    'Sua fatura vence em <say-as interpret-as="date" format="dmy">15/04/2026</say-as>. ' +
    '<break time="300ms"/>O valor é <say-as interpret-as="currency" lang="pt-BR">R$ 123,45</say-as>.' +
  '</speak>';`}</CodeBlock>
      </Section>

      <Section title="Voice cloning: ética antes do código" accent={accent}>
        <Callout tone="danger" icon="🚨">
          Voz é biometria. A partir de 2025, EU AI Act exige disclosure de deepfakes sintéticos. Produto sério só cloneia voz com consent documentado (áudio gravado confirmando + contrato), escopo limitado e watermarking. ElevenLabs Voice Lab já exige "voice verification" antes de liberar cloning profissional exatamente por isso. Documente tudo.
        </Callout>
      </Section>

      <Section title="Decisão rápida" accent={accent}>
        <Callout tone="success" icon="✅">
          Podcast / brand voice / audiolivro → ElevenLabs Multilingual v2. Voice agent em tempo real → Cartesia Sonic ou ElevenLabs Turbo. Chatbot que só precisa falar razoavelmente barato → OpenAI TTS-1. Em todos os casos: cache agressivo em frases fixas (saudações, confirmações) corta 60% do custo e 100% da latência repetida.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
