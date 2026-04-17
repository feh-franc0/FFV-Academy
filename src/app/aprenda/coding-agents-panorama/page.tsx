import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

const accent = '#ffa657';

export const metadata: Metadata = {
  title: 'O Panorama dos Coding Agents — FFV Academy',
  description: 'O que são coding agents, como evoluíram de autocomplete para agentes autônomos, e o que separa cada geração de ferramentas.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre um autocomplete de IA e um coding agent?',
    options: [
      'O agente usa modelos maiores',
      'O autocomplete é mais rápido',
      'O agente executa um loop (ler, escrever, rodar, observar resultado) e decide os próximos passos; o autocomplete só prevê o próximo trecho de código',
      'São a mesma coisa com nomes diferentes',
    ],
    correct: 2,
    explanation: 'Autocomplete prevê o próximo trecho de código. Um agente executa o loop ReAct: planeja → age (lê arquivos, roda comandos, escreve código) → observa → repete, ajustando a estratégia com base em erros e resultados.',
  },
  {
    question: 'O que é o "harness" de um coding agent e por que ele importa tanto quanto o modelo?',
    options: [
      'É o modelo de linguagem usado pelo agente',
      'É o código ao redor do LLM: ferramentas disponíveis, loop de execução, gestão de contexto, sandbox, permissões. Dados públicos mostram 9-22pt de swing em benchmark só trocando o harness com o mesmo modelo',
      'É o editor de código integrado',
      'É o sistema de pagamento da ferramenta',
    ],
    correct: 1,
    explanation: 'Em 2026, seis modelos frontier estão separados por ~0,8pt no SWE-bench Verified — mas o MESMO modelo (Claude Opus 4.5) varia 9,5pt entre SEAL Harness (45,9%) e Claude Code (55,4%). O harness é hoje o principal diferencial competitivo entre produtos.',
  },
  {
    question: 'Se um modelo "menor" (Sonnet 4.5) com scaffold dedicado marca 52,7% no SWE-bench Pro e Opus 4.5 sem scaffold marca 52,0%, o que isso implica?',
    options: [
      'Que Sonnet é melhor que Opus',
      'Que o tamanho do modelo importa menos do que a qualidade do scaffold quando ambos estão próximos da fronteira',
      'Que benchmarks são inúteis',
      'Que o Opus está quebrado',
    ],
    correct: 1,
    explanation: 'No regime atual, onde modelos frontier estão empatados, o scaffold (Confucius Code Agent, Claude Code, Cursor Agent) define mais o resultado do que o modelo "maior". Isso explica por que escolher a ferramenta certa para cada tarefa importa mais do que escolher "o modelo mais recente".',
  },
];

export default function CodingAgentsPanoramaPage() {
  return (
    <ModuleLayout
      slug="coding-agents-panorama"
      title="O Panorama dos Coding Agents"
      icon="🗺️"
      xp={50}
      readTime={8}
      trailName="Ferramentas de IA para Código"
      trailColor="#ffa657"
      nextSlug="claude-code-arquitetura"
      nextTitle="Claude Code: Filosofia e Arquitetura"
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
        Em 2021, a OpenAI lançou o GitHub Copilot. Era impressionante: digitava metade de uma função e a IA completava. Em 2025, Claude Code executa tarefas inteiras no seu terminal, lê toda a sua codebase, roda testes e abre PRs sozinho. O que aconteceu no meio?
      </p>

      <Section accent={accent} title="Três gerações de ferramentas">
        <p>
          A evolução aconteceu em três saltos claros. Cada geração não substituiu a anterior — ela expandiu o que é possível:
        </p>

        <div className="flex flex-col gap-3">
          <GenerationCard
            gen="Geração 1 · 2021–2022"
            color="#58a6ff"
            title="Autocomplete Inteligente"
            tools="GitHub Copilot (original), Tabnine, Codeium"
            desc="O modelo observa o arquivo atual e prevê os próximos tokens. Extremamente rápido, integrado ao editor, sem estado entre sessões. O contexto é o arquivo aberto — nada mais."
            example='você digita: "function calculateDiscount(" → IA completa os parâmetros e o corpo'
          />
          <GenerationCard
            gen="Geração 2 · 2023–2024"
            color="#d2a8ff"
            title="Chat com Contexto de Código"
            tools="Copilot Chat, Cursor (chat mode), ChatGPT Code Interpreter"
            desc="O LLM recebe não só o arquivo mas também sua pergunta em linguagem natural. Você pode pedir explicações, refatorações, geração de testes. Ainda sem execução autônoma — você cola o resultado."
            example='"refatora essa função para usar async/await" → IA propõe, você aceita ou recusa'
          />
          <GenerationCard
            gen="Geração 3 · 2024–2025"
            color="#ffa657"
            title="Coding Agents Autônomos"
            tools="Claude Code, OpenAI Codex (novo), Cursor Agent, Kiro"
            desc="O agente recebe um objetivo, não uma pergunta. Ele mesmo decide quais arquivos ler, quais comandos rodar, como estruturar a solução. Executa múltiplos passos sem intervenção humana a cada etapa."
            example='"adiciona testes de integração para o módulo de auth" → agente lê o código, escreve os testes, roda, corrige falhas'
          />
        </div>
      </Section>

      <Section accent={accent} title="O modelo é só um componente">
        <p>
          Este é o insight mais importante desta trilha inteira: <strong>o LLM em si é apenas uma peça</strong>. O que diferencia Claude Code de GitHub Copilot não é (só) a qualidade do modelo — é o <strong>harness</strong>: a camada de infraestrutura ao redor.
        </p>
        <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ffv-muted)' }}>ANATOMIA DE UM CODING AGENT</p>
          <div className="flex flex-col gap-2 text-xs">
            {[
              { label: 'LLM', desc: 'O modelo (Claude, GPT-4o, Gemini...) — o "cérebro" que raciocina', color: '#58a6ff' },
              { label: 'Ferramentas', desc: 'O que o agente pode fazer: ler arquivos, rodar bash, fazer requests HTTP', color: '#3fb950' },
              { label: 'Loop de execução', desc: 'Lógica que decide quando chamar ferramentas, quando parar, quando pedir confirmação', color: '#d2a8ff' },
              { label: 'Gestão de contexto', desc: 'Como o histórico da conversa, arquivos relevantes e resultados são incluídos no prompt', color: '#ffa657' },
              { label: 'Modelo de confiança', desc: 'O que o agente pode fazer sem confirmar com o usuário — permissões e limites', color: '#f78166' },
              { label: 'Interface', desc: 'Como o usuário interage: terminal, IDE, chat, API assíncrona', color: '#e3b341' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold flex-shrink-0" style={{ background: `${item.color}18`, color: item.color, minWidth: 120 }}>{item.label}</span>
                <span style={{ color: 'var(--ffv-muted)' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <p>
          Dois agentes com o mesmo LLM por baixo podem ter comportamentos radicalmente diferentes se o harness for diferente. É por isso que esta trilha compara as ferramentas de dentro para fora — não só o modelo, mas toda a arquitetura.
        </p>
      </Section>

      <Section accent={accent} title="O loop agêntico: como um agente pensa">
        <p>
          Todo coding agent moderno opera em um loop básico chamado <strong>ReAct</strong> (Reasoning + Acting), formalizado em um paper do Google/Princeton em 2022:
        </p>
        <CodeBlock>{`// O loop ReAct simplificado
while (objetivo não alcançado) {
  // REASONING: o LLM pensa sobre o estado atual
  pensamento = LLM.think(contexto + histórico)

  // ACTING: decide qual ferramenta usar
  ação = LLM.decide_tool(pensamento)
  // ex: { tool: "bash", input: "npm test" }

  // OBSERVING: executa e registra o resultado
  resultado = executar(ação)
  contexto.append(resultado)

  // Repete até concluir ou pedir ajuda ao usuário
}`}</CodeBlock>
        <p>
          Parece simples — e a ideia central é. A complexidade está nos detalhes: quando interromper para pedir confirmação, como lidar com erros, quanto contexto cabe na janela do modelo, e como evitar loops infinitos.
        </p>
        <Callout>
          O paper <strong>"ReAct: Synergizing Reasoning and Acting in Language Models"</strong> (Yao et al., 2022) é a base teórica de praticamente todos os coding agents modernos. Vale a leitura se você quiser se aprofundar.
        </Callout>
      </Section>

      <Section accent={accent} title="Por que agora?">
        <p>
          Três coisas precisaram acontecer simultaneamente para os coding agents funcionarem bem:
        </p>
        <div className="flex flex-col gap-2">
          {[
            { num: '01', title: 'Janelas de contexto longas', desc: 'GPT-4 Turbo (128k), Claude 3 (200k), Gemini 1.5 Pro (1M), GPT-5.1-Codex-Max (400k+ efetivo via compactação). Ler uma codebase inteira virou possível.' },
            { num: '02', title: 'Tool use confiável', desc: 'Function calling antes era frágil, hoje é robusto. Os modelos aprenderam a propor chamadas estruturadas com quase zero erro de schema.' },
            { num: '03', title: 'Capacidade de seguir instruções longas', desc: 'Instruction following melhorou drasticamente com RLHF/RLAIF. O modelo segue planos multi-passo sem se perder.' },
            { num: '04', title: 'Prompt caching', desc: 'Mandar 30k tokens de system prompt a cada turno antes era inviável economicamente. Com cache_control, cache hits custam ~10% de tokens novos — destravou sessões longas.' },
          ].map(item => (
            <div key={item.num} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <span className="text-xs font-mono font-bold flex-shrink-0 mt-0.5" style={{ color: 'var(--ffv-orange)' }}>{item.num}</span>
              <div>
                <p className="font-semibold text-xs mb-1">{item.title}</p>
                <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section accent={accent} title="Os modelos estão empatando — o harness não">
        <p>
          Um dado que muda a leitura do mercado: <strong>no SWE-bench Verified (abril/2026), seis modelos frontier estão dentro de ~0,8 ponto percentual</strong>. Claude Opus 4.6, Sonnet 4.6, GPT-5.1, Gemini 3 Pro, Haiku 4.5, codex-max — todos virtualmente empatados.
        </p>
        <p>
          Ao mesmo tempo, dados do SWE-bench Pro (nov/2025) mostram:
        </p>
        <CodeBlock>{`// Mesmo modelo, scaffolds diferentes:
Claude Opus 4.5 em SEAL Harness       →  45,9%
Claude Opus 4.5 em scaffold X         →  ~50%
Claude Opus 4.5 em Claude Code        →  55,4%
// Spread de 9,5 pontos só trocando o harness.

// Modelo "menor" + scaffold bom vs modelo "maior" + scaffold genérico:
Confucius Code Agent + Sonnet 4.5     →  52,7%
Claude Opus 4.5 nativo                →  52,0%
// Sonnet com scaffold dedicado bate Opus sem scaffold.`}</CodeBlock>
        <p>
          Ou seja: em 2026, <strong>a diferença prática entre ferramentas vem majoritariamente do harness</strong>. Isso é contraintuitivo — a narrativa pública foca em "qual modelo é melhor" — mas é o que explica por que Claude Code, Codex e Cursor agent produzem resultados tão distintos usando modelos tão parecidos.
        </p>
        <Callout>
          Traduzindo o que isso significa pra você: <em>escolher a ferramenta certa para cada tarefa</em> tem hoje impacto maior do que escolher o modelo mais recente. Essa trilha te equipa pra isso.
        </Callout>
      </Section>

      <Callout>
        No próximo módulo: <strong>Claude Code por dentro</strong> — com detalhes do código-fonte vazado em 2026: QueryEngine, auto-compact a 98%, Tier 1/2 de permissões, prompt caching.
      </Callout>
    </div>
  );
}


function GenerationCard({ gen, color, title, tools, desc, example }: {
  gen: string; color: string; title: string; tools: string; desc: string; example: string;
}) {
  return (
    <div className="p-4 rounded-xl flex flex-col gap-2" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: `${color}15`, color }}>{gen}</span>
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{desc}</p>
      <p className="text-xs italic" style={{ color: 'var(--ffv-muted)' }}>Ex: {example}</p>
      <p className="text-xs" style={{ color }}>{tools}</p>
    </div>
  );
}

