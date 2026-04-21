import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('quando-escolher-cada');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual combinação é pragmática para um backend web novo em 2026?',
    options: [
      'Qualquer uma',
      'Go ou Node/TS ou Java 21 ou C# — todos entregam ~mesma performance em I/O-bound, escolha pelo time e ecosystem. Rust só se perf/safety for requisito duro; Python se a equipe for majoritariamente ML',
      'Sempre Rust',
      'Sempre Python',
    ],
    correct: 1,
    explanation: 'Para CRUD/API web, as 4 opções são equivalentes em resultado. Ir de dogma a Rust sem precisar custa velocidade. Python em backend web funciona mas tem throughput menor (bom para time ML que já vive em Python). Decisão correta: seguir a familiaridade do time salvo razão técnica específica.',
  },
  {
    question: 'Para workload AI-native (LLM orchestration, RAG, agents), qual linguagem vence?',
    options: [
      'Java',
      'Python para research/notebook/data prep, TypeScript para serviço de produção (type safety + ecosystem web), Go para gateway/proxy — trio pragmático é mais comum que solução única',
      'C++',
      'Rust',
    ],
    correct: 1,
    explanation: 'Python domina ML (torch, transformers, langchain, dspy). TS vence em app web que consome LLM (Next.js, Vercel AI SDK, tipagem de schemas). Go é comum em gateway, proxy, tool server. Rust entra em inference runtime (candle, tokenizers). Misturar é a norma, não exceção.',
  },
  {
    question: 'Qual é o erro mais comum em "decisão de linguagem"?',
    options: [
      'Escolher por performance',
      'Escolher por hype ou "gosto pessoal do arquiteto" em vez de expertise do time, ecosystem do domínio e longevidade do produto — isso causa reescrita 2 anos depois por contratação impossível',
      'Escolher linguagem madura',
      'Ouvir o time',
    ],
    correct: 1,
    explanation: 'Falha clássica: CTO apaixonado por Rust decide migrar serviço maduro de Node. 18 meses de refactor, 3 devs experientes saem, hiring trava, produto atrasa. Decisão técnica é 50% técnica, 50% sociotécnica: time, mercado, hiring, longevidade. Tecnologia vence com pessoas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="quando-escolher-cada"
      title="Quando escolher cada: matriz de decisão"
      icon="🎯"
      xp={55}
      readTime={13}
      trailName="Comparação de Linguagens: Escolha Certa"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Decisão é multi-dimensional" accent={accent}>
        <p>
          Escolher linguagem não é torneio. É otimização de múltiplas variáveis: expertise do time, maturity do ecosystem para o domínio, requisitos de performance, hiring local, longevidade esperada, constraints de infra. Este módulo é a matriz operacional: dado o cenário, qual linguagem é pragmática.
        </p>
      </Section>

      <Section title="Web backend (CRUD, API, microsserviço)" accent={accent}>
        <CodeBlock lang="bash">{`Top 4 (escolha pelo time):
- Go              → simplicity, startup baixo, concurrency natural
- Java 21 + Spring Boot 3 → ecosystem enorme, virtual threads
- C# + .NET 8/9   → top DX, AOT, unificado
- TypeScript + Node → mesmo language do front, produtividade

Segunda linha:
- Python + FastAPI → se time já é ML/Python
- Rust + axum     → se perf/safety é requisito duro
- Elixir + Phoenix → se tolerância a falha crítica`}</CodeBlock>
      </Section>

      <Section title="AI-native (LLM orchestration, RAG, agent)" accent={accent}>
        <CodeBlock lang="bash">{`- Python: research, notebook, data prep, fine-tuning
- TypeScript: app web consumindo LLM (Next.js + Vercel AI SDK)
- Go: gateway, tool server, proxy de token counting
- Rust: inference runtime, embeddings, perf-critical`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Em 2026, o stack AI-native médio mistura 2–3 linguagens. Python + TypeScript é o duo dominante. Não force monocultura em AI.
        </Callout>
      </Section>

      <Section title="Systems, performance crítica" accent={accent}>
        <CodeBlock lang="bash">{`- Rust: default moderno. Kernel drivers, databases (SurrealDB, Qdrant), crypto.
- C++: legacy, game engines, trading, compilers.
- C: kernel Linux, embedded, firmware.
- Zig: alternativa curiosa ao C, ecosystem pequeno.`}</CodeBlock>
      </Section>

      <Section title="Data / ML / analytics" accent={accent}>
        <CodeBlock lang="bash">{`- Python: rainha absoluta (numpy, pandas, polars, torch, sklearn, jupyter)
- SQL: inevitável
- Scala: Spark legacy
- Julia: nicho científico, não atingiu mainstream`}</CodeBlock>
      </Section>

      <Section title="Mobile" accent={accent}>
        <CodeBlock lang="bash">{`- Kotlin: Android nativo
- Swift: iOS/macOS nativo
- React Native + TS: cross-platform com 1 codebase, DX web-like
- Flutter + Dart: outra cross-platform competente
- Nativo sempre ganha em acesso fino a APIs do SO e performance`}</CodeBlock>
      </Section>

      <Section title="Scripting, CLI, automação" accent={accent}>
        <CodeBlock lang="bash">{`- Python: ubíquo, fácil, pip install
- Bash: glue de UNIX, não ultrapassar 100 linhas
- Go: CLI distribuída como single binário (cobra, urfave/cli)
- Rust: CLI exigente em perf (ripgrep, fd, bat)`}</CodeBlock>
      </Section>

      <Section title="Frontend / UI web" accent={accent}>
        <CodeBlock lang="bash">{`- TypeScript: único vencedor sério em 2026
- React / Next.js / Remix: frameworks dominantes
- Svelte, Solid: alternativas modernas e competentes
- JavaScript puro sem tipagem: evite em produto sério`}</CodeBlock>
      </Section>

      <Section title="Game dev" accent={accent}>
        <CodeBlock lang="bash">{`- C++ + Unreal: AAA
- C# + Unity: indie/mobile majoritário
- Rust + Bevy: ascendente, ecosystem ainda jovem
- Godot + GDScript/C#: open-source, ótimo para projetos médios`}</CodeBlock>
      </Section>

      <Section title="Matriz de decisão final" accent={accent}>
        <CodeBlock lang="bash">{`Pergunta                       Resposta default 2026
Perf é requisito duro?        Rust (systems), Go/Java (backend)
Time já domina X?             Vá com X salvo requisito técnico bloqueante
Greenfield web?               Go, TS, Java 21, C# — todos ok
AI-native?                    Python + TS + Go (misture)
Longevidade 10+ anos?         Linguagens maduras (Java, C#, Go, Python, TS, Rust)
Hiring local apertado?        Escolha linguagem com pool maior (JS, Python, Java)
Cold start crítico?           Go ou Rust binário, Java GraalVM
Contribuição open-source?     Siga linguagem do projeto`}</CodeBlock>
      </Section>

      <Section title="A decisão certa é a que seu time entrega" accent={accent}>
        <Callout tone="success" icon="✅">
          Não há linguagem perfeita. Há combinação "time + ecosystem + domínio + longevidade" que minimiza custo e maximiza velocidade. Faça a escolha explicitamente, documente o porquê, revise em 12–18 meses. O anti-padrão é escolher por preferência do CTO sem checar expertise do time — isso mata mais produtos que tecnologia ruim.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
