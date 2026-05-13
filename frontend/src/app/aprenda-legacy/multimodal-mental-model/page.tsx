import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('multimodal-mental-model');
const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando preferir um modelo unified (Claude 3.5, GPT-4o, Gemini) sobre um pipeline especializado?',
    options: [
      'Sempre que houver imagem no input',
      'Quando o raciocínio precisa cruzar modalidades (ex: "o que este gráfico contradiz neste texto?") e latência/custo são aceitáveis — um único prompt preserva contexto cross-modal',
      'Nunca, pipeline é sempre mais barato',
      'Apenas em demos de marketing',
    ],
    correct: 1,
    explanation: 'Unified models brilham quando a decisão depende de relacionar modalidades. Pipeline (Whisper → LLM → TTS) fica mais barato e controlável quando as etapas são independentes e cacheáveis. A pergunta-chave é: preciso de reasoning cross-modal ou apenas de transformação sequencial?',
  },
  {
    question: 'Como estimar o custo real de uma chamada multimodal com imagem?',
    options: [
      'Pelo tamanho em bytes do arquivo',
      'Cada provider converte imagem em tokens por tiles (Anthropic ~1.6k tokens numa imagem 1092x1092, OpenAI em tiles de 512px). Multiplique por preço de input e some ao texto do prompt',
      'Custo zero, imagens são grátis',
      'Depende do formato JPEG vs PNG',
    ],
    correct: 1,
    explanation: 'O erro mais comum é raciocinar em bytes. O que importa são os tokens visuais que o provider cobra. Sempre cheque o pricing doc: Anthropic tem fórmula (width*height)/750, OpenAI tile 512px com base+detail. Para orçamento previsível, normalize imagens no pre-processing.',
  },
  {
    question: 'Qual é a principal limitação de áudio em modelos multimodais unified (GPT-4o, Gemini) em prod?',
    options: [
      'Não existem',
      'Context window em minutos é limitado (ex: Gemini 1.5 aceita horas, GPT-4o poucos minutos por request), latência sobe rápido e o billing por segundo de áudio é mais caro que Whisper + LLM',
      'Não aceitam português',
      'Só funcionam com WAV',
    ],
    correct: 1,
    explanation: 'Em 2026 ainda vale fazer a conta: para transcrição pura de 1h de áudio, Whisper API ($0.006/min) + Claude para sumarização costuma ser mais barato que passar áudio cru pro unified model. Unified ganha em conversa ao vivo curta (Realtime) onde cross-modal importa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="multimodal-mental-model"
      title="Multimodal mental model: além do texto"
      icon="🎭"
      xp={45}
      readTime={11}
      trailName="Voice, Vision & Multimodal"
      trailColor={accent}
      nextSlug="speech-to-text-whisper"
      nextTitle="Speech-to-text: Whisper e alternativas"
      quiz={quiz}
    >
      <Section title="Duas arquiteturas, não uma" accent={accent}>
        <p>
          Todo sistema multimodal em produção cai em uma de duas arquiteturas. Ou você usa um modelo <strong>unified</strong> (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5) que aceita texto + imagem + áudio no mesmo prompt, ou você monta um <strong>pipeline</strong> de modelos especializados (Whisper para STT, LLM só-texto para reasoning, ElevenLabs para TTS). A decisão não é estética — é arquitetural, e define custo, latência e falhas.
        </p>
        <p>
          Pipeline especializado é debugável: cada etapa tem input/output claro, cache próprio e métricas separadas. Unified é conveniente, mas mistura falhas — um alucinação no reasoning parece falha de vision, e vice-versa.
        </p>
      </Section>

      <Section title="Quando unified ganha" accent={accent}>
        <p>
          Unified vale quando a resposta <em>depende</em> de relacionar modalidades. Exemplos reais:
        </p>
        <CodeBlock lang="ts">{`// Pergunta que exige cross-modal reasoning
await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  messages: [{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/png', data: chartBase64 } },
      { type: 'text', text: 'Este gráfico de receita confirma ou contradiz o texto do relatório abaixo?\\n\\n' + reportText },
    ],
  }],
  max_tokens: 1024,
});`}</CodeBlock>
        <p>
          Dividir em "OCR do gráfico → LLM compara com texto" perde nuance (posição, cor, tendência visual). Pagar o preço do unified compensa.
        </p>
      </Section>

      <Section title="Quando pipeline ganha" accent={accent}>
        <p>
          Pipeline ganha em tarefas sequenciais de alto volume onde cada etapa é cacheável. Transcrever 10.000h de reuniões, gerar sumário e exportar PDF: Whisper + Claude + renderer. Cada item tem seu SLO, seu custo e seu retry policy.
        </p>
        <Callout tone="info" icon="💡">
          Regra prática: se a etapa intermediária (transcrição, OCR) tem valor por si só no seu produto (ex: você mostra a transcrição ao usuário), pipeline é quase sempre melhor. Você precisa expor e armazenar esse artefato de qualquer jeito.
        </Callout>
      </Section>

      <Section title="Custo: pense em tokens, não em bytes" accent={accent}>
        <p>
          Cada provider traduz modalidades em tokens cobrados. Imagens viram tokens por área (Anthropic) ou por tiles (OpenAI). Áudio vira tokens por segundo. O maior erro de quem começa é estimar custo pelo tamanho do arquivo — isso não bate com o billing.
        </p>
        <CodeBlock lang="ts">{`// Estimador grosseiro de custo Anthropic vision
function estimateClaudeImageTokens(width: number, height: number): number {
  // Anthropic: tokens ≈ (width * height) / 750, cap em 1568 tokens
  return Math.min(1568, Math.ceil((width * height) / 750));
}

// Exemplo: screenshot 1920x1080
const tokens = estimateClaudeImageTokens(1920, 1080); // ~1568 (cap)
const costUSD = (tokens / 1_000_000) * 3; // Sonnet $3/M input`}</CodeBlock>
      </Section>

      <Section title="Latência é a outra dimensão esquecida" accent={accent}>
        <p>
          Usuário em conversa ao vivo tolera ~500ms antes de perceber atraso. Pipeline Whisper (800ms) + LLM (600ms) + TTS (400ms) já dá 1.8s — inviável. É aí que entram Realtime APIs (GPT-4o Realtime, Gemini Live) que processam áudio nativamente. Para batch (processar gravações), latência importa menos e pipeline vence em custo.
        </p>
        <Callout tone="warn" icon="⚠️">
          Nunca escolha arquitetura multimodal sem primeiro escrever os três SLOs: latência p95, custo por request e taxa de erro aceitável. Sem isso, você vai iterar no escuro e descobrir na fatura do mês.
        </Callout>
      </Section>

      <Section title="Próximo passo" accent={accent}>
        <p>
          No próximo módulo, mergulhamos em speech-to-text sério: Whisper (API e self-host), Deepgram, AssemblyAI, streaming vs batch, diarização e custo real. Esse é o bloco de entrada de quase todo pipeline de voz.
        </p>
        <Callout tone="success" icon="✅">
          Leve desse módulo: unified vs pipeline é decisão de arquitetura, não de preferência. Escreva seus SLOs primeiro. Tokens de imagem/áudio não são bytes. Latência &lt;500ms só com Realtime. Tudo o mais é pipeline bem feito.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
