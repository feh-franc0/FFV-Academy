import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-voice-assistant');
const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual métrica de latência você precisa reportar no writeup de um voice assistant portfolio?',
    options: [
      'Tempo total médio',
      'TTFA (Time To First Audio) p50 e p95 separadamente, medido do fim da fala do usuário até o primeiro byte de áudio tocado no alto-falante. Reportar só média esconde outliers que matam UX',
      'Só p99',
      'Tamanho em MB',
    ],
    correct: 1,
    explanation: 'TTFA p95 é a métrica que importa em voz. p50 engana — a UX é definida pelos piores casos. Medir end-to-end (mic → speaker) e não só "resposta do modelo" é o que separa benchmark honesto de teatro.',
  },
  {
    question: 'Qual é a forma mínima aceitável de avaliar qualidade de um voice assistant capstone?',
    options: [
      'Rodar uma vez e achar que está bom',
      'Golden set com 30-50 interações categorizadas (comandos claros, ambíguos, off-topic, com ruído), executar 3x cada, medir task success rate, TTFA p95, custo por sessão e taxa de barge-in corretamente detectada. Incluir 5-10 gravações reais no writeup',
      'Pedir para amigos testarem',
      'Confiar no modelo',
    ],
    correct: 1,
    explanation: 'Voice agent é sistema estocástico — um teste não conta. Golden set categorizado + múltiplas rodadas + métricas claras (task success, TTFA, custo, barge-in) é o mínimo de um portfolio project que passa como "engenharia" e não "demo".',
  },
  {
    question: 'Por que incluir fallback para pipeline STT+LLM+TTS mesmo usando Realtime API?',
    options: [
      'Não precisa',
      'Porque Realtime API tem outages, regiões limitadas e pode custar caro. Arquitetura resiliente tem feature flag que cai para pipeline clássico em caso de erro ou budget estourado. Isso mostra maturidade de engenharia — não é "só código bonito com a API nova"',
      'Para confundir o código',
      'Para usar mais memória',
    ],
    correct: 1,
    explanation: 'Projeto portfolio de nível senior mostra pensamento operacional. Fallback STT+LLM+TTS quando Realtime falha é resiliência real. Capstone com circuit breaker, fallback path e budget guard demonstra que você pensa em produção, não só em demo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-voice-assistant"
      title="Capstone: assistente de voz end-to-end"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Voice, Vision & Multimodal"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Objetivo do capstone" accent={accent}>
        <p>
          Construir um voice assistant completo, deployado e avaliado. Não é demo — é sistema que alguém pode usar. O entregável combina os 6 módulos anteriores em produto único e serve de peça de portfolio para vagas de IA aplicada / engenharia multimodal sênior.
        </p>
      </Section>

      <Section title="Spec mínima" accent={accent}>
        <CodeBlock lang="markdown">{`# Voice Assistant Capstone — Spec

## Funcional
- Web app (Next.js) OU CLI (Python/Node) rodando em desktop
- Acionado por botão (push-to-talk) ou VAD contínuo (configurável)
- Responde em PT-BR com voz natural
- Executa 3+ tools: ex. get_weather, set_timer, search_web (ou domínio próprio)
- Histórico da conversa persistido (SQLite) por sessão

## Não-funcional
- TTFA p95 < 1.2s na arquitetura Realtime
- TTFA p95 < 2.5s na arquitetura pipeline (fallback)
- Feature flag para trocar arquiteturas
- Budget guard: derruba sessão se custo > $X
- Logs estruturados (request id, etapa, latência, custo)
- Barge-in funcional (interrupção durante fala do agent)

## Avaliação
- Golden set com 40+ interações categorizadas
- Script que roda o golden set e reporta métricas
- Writeup (README ou blog) com resultados, trade-offs, limitações`}</CodeBlock>
      </Section>

      <Section title="Arquitetura recomendada" accent={accent}>
        <CodeBlock lang="yaml">{`# Arquitetura dupla, escolhível por feature flag

modo_realtime:
  transporte: webrtc
  modelo: gpt-4o-realtime-preview
  vantagem: TTFA ~400ms, cross-modal reasoning
  uso: conversa natural, primeira escolha

modo_pipeline:
  vad: silero-vad (local)
  stt: deepgram-nova-2 streaming
  llm: claude-3-5-sonnet-20241022
  tts: cartesia-sonic streaming
  vantagem: custo previsível, resiliência
  uso: fallback e volumes altos

observabilidade:
  tracing: opentelemetry spans (vad, stt, llm, tts, play)
  metrics: ttfa, total_latency, cost_usd_per_session
  storage: sqlite local + export jsonl

guardrails:
  budget_session_usd: 0.50
  max_turns: 30
  pii_scrub: regex basico antes de log`}</CodeBlock>
      </Section>

      <Section title="Implementação: esqueleto (modo pipeline)" accent={accent}>
        <CodeBlock lang="ts">{`// orchestrator.ts - pipeline fallback
import { vadDetect } from './vad';
import { streamSTT } from './stt';
import { streamLLM } from './llm';
import { streamTTS } from './tts';
import { tools } from './tools';

export async function runTurn(ctx: SessionContext, audioIn: AsyncIterable<Buffer>) {
  const started = performance.now();

  // 1. VAD segmenta a fala do usuário
  const userAudio = await vadDetect(audioIn);
  ctx.trace('vad_done', performance.now() - started);

  // 2. STT streaming -> texto
  const userText = await streamSTT(userAudio, { language: 'pt-BR' });
  ctx.trace('stt_done', performance.now() - started);

  ctx.history.push({ role: 'user', content: userText });

  // 3. LLM com tools
  const llmStream = streamLLM({ history: ctx.history, tools });
  let firstToken = 0;
  let llmText = '';

  // 4. TTS recebe tokens à medida que saem
  const ttsStream = streamTTS({ voice: ctx.voiceId });

  for await (const event of llmStream) {
    if (event.type === 'text' && event.delta) {
      if (!firstToken) firstToken = performance.now() - started;
      llmText += event.delta;
      ttsStream.send(event.delta);
    } else if (event.type === 'tool_call') {
      const result = await tools[event.name].run(event.args, ctx);
      llmStream.submitToolResult(event.id, result);
    }
  }
  ttsStream.end();

  ctx.history.push({ role: 'assistant', content: llmText });
  ctx.trace('llm_done', performance.now() - started);

  // 5. Playback com barge-in
  for await (const chunk of ttsStream.audio()) {
    if (ctx.bargeIn) { ttsStream.cancel(); break; }
    ctx.speaker.write(chunk);
  }
  ctx.trace('done', performance.now() - started);
}`}</CodeBlock>
      </Section>

      <Section title="Golden set de avaliação" accent={accent}>
        <CodeBlock lang="json">{`[
  { "id": "cmd_clear_1", "category": "comando_claro", "audio": "fixtures/timer_5min.wav",
    "expected_tool": "set_timer", "expected_args": { "minutes": 5 } },
  { "id": "cmd_clear_2", "category": "comando_claro", "audio": "fixtures/clima_sp.wav",
    "expected_tool": "get_weather", "expected_args": { "city": "São Paulo" } },
  { "id": "ambig_1", "category": "ambiguo", "audio": "fixtures/alarme_amanha.wav",
    "expected_behavior": "asks_follow_up" },
  { "id": "offtopic_1", "category": "off_topic", "audio": "fixtures/piada.wav",
    "expected_behavior": "redirects_politely" },
  { "id": "noise_1", "category": "com_ruido", "audio": "fixtures/cafe_noise.wav",
    "expected_tool": "set_timer", "tolerance": 0.7 },
  { "id": "barge_1", "category": "barge_in", "script": "user_interrupts_at_1.5s",
    "expected": "agent_stops_within_300ms" }
]`}</CodeBlock>
      </Section>

      <Section title="Writeup: o que recrutador quer ler" accent={accent}>
        <CodeBlock lang="markdown">{`# Voice Assistant — Writeup

## TL;DR
Sistema conversacional em PT-BR com duas arquiteturas (Realtime API e pipeline clássico),
fallback automático, 3 tools funcionais, TTFA p95 de 820ms (Realtime) e 2.1s (pipeline).
Avaliado em golden set de 42 interações — task success 88% (Realtime), 81% (pipeline).

## Decisões de arquitetura
- Por que WebRTC e não WebSocket: resiliência a perda de pacote em mobile
- Por que pipeline como fallback: outage Realtime em 2025-11 custou 4h
- Por que Cartesia no pipeline: TTFA 90ms vs ElevenLabs 300ms

## Trade-offs honestos
- Realtime API custa 3x mais por minuto → feature flag por tier de usuário
- VAD Silero dá false positive em ambiente barulhento → expus threshold na UI
- Barge-in ainda perde 15% dos casos em gravações de café (ruído acima de 65dB)

## Métricas (tabela)
| arquitetura | ttfa_p50 | ttfa_p95 | custo/sessão | task_success |
| Realtime    | 410ms    | 820ms    | $0.18        | 88%          |
| Pipeline    | 1400ms   | 2100ms   | $0.06        | 81%          |

## Limitações conhecidas
- ...

## Próximas iterações
- ...

## Links
- Código: github.com/user/voice-capstone
- Demo vídeo (3min): ...
- Dashboard ao vivo: ...`}</CodeBlock>
      </Section>

      <Section title="Checklist final" accent={accent}>
        <Callout tone="success" icon="✅">
          Entregáveis: (1) repo público com README forte, (2) golden set + script de eval executável, (3) feature flag entre Realtime e pipeline, (4) budget guard ativo, (5) logs estruturados + export, (6) vídeo demo de 2-3min mostrando barge-in e tool calls, (7) writeup com trade-offs honestos e limitações. Esse nível de capstone vira peça de conversa em entrevista sênior — não é trophy, é evidência.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
