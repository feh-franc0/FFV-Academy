import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('speech-to-text-whisper');
const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando self-hostar Whisper em GPU faz sentido vs usar a API OpenAI?',
    options: [
      'Sempre, self-host é sempre mais barato',
      'Quando volume mensal > ~50k minutos ou quando você precisa de diarização custom, VAD próprio, word-level timestamps com granularidade específica, ou privacidade (áudio não pode sair da rede)',
      'Nunca — self-host é sempre pior',
      'Quando o áudio está em inglês',
    ],
    correct: 1,
    explanation: 'API ($0.006/min) é imbatível até volumes médios. Em escala, uma GPU A10G rodando whisper.cpp ou faster-whisper fica ~3x mais barata por minuto. Mas o driver real costuma ser privacidade (saúde, legal, financeiro) ou precisar de features que a API não expõe.',
  },
  {
    question: 'Qual é a diferença prática entre Whisper e Deepgram Nova-2 em prod?',
    options: [
      'Nenhuma',
      'Deepgram oferece streaming real (latência <300ms), diarização built-in e keyword boosting; Whisper API é batch-only (arquivo inteiro) e sem diarização. Para call center ao vivo, Deepgram; para transcrever gravações, Whisper',
      'Deepgram só funciona em inglês',
      'Whisper é sempre mais preciso',
    ],
    correct: 1,
    explanation: 'Essa é a decisão mais comum. Whisper lidera em WER em muitos idiomas e é aberto, mas a API não faz streaming. Deepgram/AssemblyAI são pagos, mas têm streaming, diarização e features de contact center prontas. Escolha por caso de uso, não por fanatismo.',
  },
  {
    question: 'O que é diarização e por que ela é não-trivial?',
    options: [
      'Tradução automática',
      'É identificar "quem falou quando" (speaker 1, speaker 2...). Não-trivial porque exige embeddings de voz + clustering sob ruído, sobreposição de falas e mudanças de microfone. Whisper puro não faz isso — precisa de pyannote ou serviço',
      'Compactar áudio',
      'Converter áudio para MP3',
    ],
    correct: 1,
    explanation: 'Diarização é o que transforma um blob de texto em "Ana: ... / João: ...". Whisper transcreve muito bem, mas não rotula speakers. Stack comum open-source: WhisperX ou pyannote.audio. Em API, Deepgram e AssemblyAI retornam speaker labels direto.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="speech-to-text-whisper"
      title="Speech-to-text: Whisper e alternativas"
      icon="🎤"
      xp={50}
      readTime={12}
      trailName="Voice, Vision & Multimodal"
      trailColor={accent}
      nextSlug="text-to-speech-tts"
      nextTitle="Text-to-speech: ElevenLabs, OpenAI, Cartesia"
      quiz={quiz}
    >
      <Section title="O panorama real em 2026" accent={accent}>
        <p>
          STT deixou de ser commodity. Três opções cobrem 95% dos casos: <strong>Whisper</strong> (OpenAI, open source, state-of-art em multilíngue), <strong>Deepgram Nova-2</strong> (streaming + diarização, foco enterprise) e <strong>AssemblyAI</strong> (features de conversa: sentiment, summary, chapters). Cada um otimiza uma dimensão diferente.
        </p>
      </Section>

      <Section title="Whisper API: o default razoável" accent={accent}>
        <p>
          Para transcrição batch de arquivos, Whisper API é difícil de bater em custo-qualidade. $0.006/minuto, PT-BR excelente, retorna word-level timestamps se você pedir.
        </p>
        <CodeBlock lang="ts">{`import OpenAI from 'openai';
import fs from 'node:fs';

const client = new OpenAI();

const transcription = await client.audio.transcriptions.create({
  file: fs.createReadStream('reuniao.mp3'),
  model: 'whisper-1',
  response_format: 'verbose_json',
  timestamp_granularities: ['word'],
  language: 'pt',
});

// transcription.words => [{ word, start, end }, ...]
// transcription.segments => blocos maiores com confidence`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Passe sempre o parâmetro <code>language</code> quando souber. Whisper gasta tokens adivinhando idioma e às vezes erra em áudios curtos ou com sotaque forte.
        </Callout>
      </Section>

      <Section title="Self-host: faster-whisper e whisper.cpp" accent={accent}>
        <p>
          Quando volume justifica ou quando áudio não pode sair da rede, self-host é viável. <strong>faster-whisper</strong> (CTranslate2) roda 4x mais rápido que Whisper original em GPU. <strong>whisper.cpp</strong> roda até em CPU e em Apple Silicon com Metal.
        </p>
        <CodeBlock lang="python">{`from faster_whisper import WhisperModel

# large-v3 em GPU NVIDIA (compute_type float16)
model = WhisperModel('large-v3', device='cuda', compute_type='float16')

segments, info = model.transcribe(
    'reuniao.mp3',
    language='pt',
    vad_filter=True,          # corta silêncio antes de processar
    word_timestamps=True,
)

for seg in segments:
    print(seg.start, seg.end, seg.text)`}</CodeBlock>
      </Section>

      <Section title="Streaming de verdade: Deepgram / AssemblyAI" accent={accent}>
        <p>
          Whisper API não faz streaming (o modelo precisa do áudio inteiro para decodificar). Se o seu produto é legendagem ao vivo, call center ou voice agent, você precisa de WebSocket streaming — e aí Deepgram ou AssemblyAI são as escolhas.
        </p>
        <CodeBlock lang="ts">{`import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
const live = deepgram.listen.live({
  model: 'nova-2',
  language: 'pt-BR',
  smart_format: true,
  interim_results: true,
  diarize: true,
});

live.on(LiveTranscriptionEvents.Transcript, (data) => {
  const alt = data.channel.alternatives[0];
  if (alt.transcript) {
    console.log('[' + (data.is_final ? 'final' : 'interim') + ']', alt.transcript);
  }
});

// audioStream é um stream PCM ou WebM vindo do browser
audioStream.on('data', (chunk) => live.send(chunk));`}</CodeBlock>
      </Section>

      <Section title="Diarização: a feature que separa amador de profissional" accent={accent}>
        <p>
          Transcrever é fácil. Responder "quem disse o quê" é difícil. Whisper puro não faz — você precisa de um pipeline auxiliar. O stack de referência open-source é <strong>WhisperX</strong> (Whisper + pyannote.audio + alinhamento forçado).
        </p>
        <CodeBlock lang="python">{`import whisperx

audio = whisperx.load_audio('reuniao.wav')

# 1) Transcrição com Whisper
model = whisperx.load_model('large-v3', device='cuda', language='pt')
result = model.transcribe(audio, batch_size=16)

# 2) Alinhamento forçado (word-level timestamps precisos)
align_model, meta = whisperx.load_align_model(language_code='pt', device='cuda')
result = whisperx.align(result['segments'], align_model, meta, audio, device='cuda')

# 3) Diarização (pyannote)
diarize = whisperx.DiarizationPipeline(use_auth_token=HF_TOKEN, device='cuda')
diarize_segments = diarize(audio, min_speakers=2, max_speakers=4)

# 4) Merge: cada palavra ganha speaker label
result = whisperx.assign_word_speakers(diarize_segments, result)`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Diarização tem WER próprio (DER — Diarization Error Rate). Em áudios com sobreposição pesada ou microfone compartilhado, DER passa de 20% facilmente. Sempre valide com sample humano antes de prometer feature.
        </Callout>
      </Section>

      <Section title="Custos comparados (volume médio)" accent={accent}>
        <p>
          Para 10.000 minutos/mês:
        </p>
        <CodeBlock lang="yaml">{`whisper_api:        # OpenAI
  preco_por_min: 0.006
  mensal_usd: 60
  features: [batch only, timestamps]

deepgram_nova2:
  preco_por_min: 0.0043  # streaming
  mensal_usd: 43
  features: [streaming, diarize, keyword_boost]

self_host_a10g:
  gpu_hora: 1.00         # AWS/Runpod approx
  minutos_por_gpu_hora: 600  # faster-whisper large-v3
  mensal_usd: ~17        # se 24/7 saturada
  features: [tudo custom, privacidade]`}</CodeBlock>
      </Section>

      <Section title="Resumo operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          Default: Whisper API para batch. Streaming ao vivo: Deepgram ou AssemblyAI. Diarização séria: WhisperX + pyannote ou use as labels built-in de Deepgram/AssemblyAI. Self-host só acima de ~50k min/mês ou por privacidade. E nunca prometa DER &lt;10% sem rodar no seu áudio real primeiro.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
