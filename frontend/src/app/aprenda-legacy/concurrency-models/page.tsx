import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('concurrency-models');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença fundamental entre async/await (JS/C#) e virtual threads (Java 21)?',
    options: [
      'Nenhuma',
      'async/await exige anotar toda a cadeia (function coloring) e depende de event loop single-thread; virtual threads usam multiplas carriers e código síncrono sem marcação — ambos resolvem I/O-bound, o custo cognitivo difere',
      'Virtual threads são mais lentos',
      'async/await só existe em JS',
    ],
    correct: 1,
    explanation: '"Function coloring": em JS/C#, uma async function contamina a cadeia — caller precisa await ou receber Promise/Task. Virtual thread permite código síncrono normal que o runtime escala. Erlang/BEAM, Go e Java 21 evitam coloring; JS/Python/C# aceitam como trade-off.',
  },
  {
    question: 'Por que o modelo Actor (Erlang, Akka) é diferente de CSP (Go)?',
    options: [
      'São iguais',
      'CSP comunica via channel compartilhado entre peers anônimos (goroutine não conhece quem lê); Actor envia mensagem por endereço único do ator, mantém mailbox por ator e isolamento forte de estado — Actor é mais distribuído, CSP é mais ergonômico',
      'Actor é mais lento',
      'CSP é só para DB',
    ],
    correct: 1,
    explanation: 'Actor (Erlang BEAM) tem identidade por PID, supervisão hierárquica e tolerância a falha com restart. CSP (Go) é mais leve: channel é um pipe, goroutines são anônimos, a composição é via fan-out/fan-in. Actor brilha em sistemas distribuídos (telecom, Discord); CSP brilha em servidor HTTP ergonomicamente.',
  },
  {
    question: 'Quando a abordagem "thread platform" (Java 8-17, C#, C++) ainda faz sentido?',
    options: [
      'Nunca',
      'CPU-bound puro (rendering, simulação, compilação), onde você quer 1 thread por core físico e controle fino de affinity/priority — I/O-bound migrou para async ou virtual thread',
      'Em CRUD HTTP',
      'Em scripts',
    ],
    correct: 1,
    explanation: 'Para workload CPU-bound paralelo, platform thread continua ideal: ForkJoinPool, rayon, TBB. Cada core trabalha num thread físico com minimal context switch. Async ou virtual thread atrapalham aí — o gargalo é compute, não I/O, e overhead de scheduling vira custo puro.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="concurrency-models"
      title="Concurrency models: threads, async, CSP, Actor"
      icon="🔀"
      xp={60}
      readTime={14}
      trailName="Comparação de Linguagens: Escolha Certa"
      trailColor={accent}
      nextSlug="memory-management-comparacao"
      nextTitle="Memory management: manual, GC, borrow checker"
      quiz={quiz}
    >
      <Section title="Concorrência é problema, não feature" accent={accent}>
        <p>
          Toda aplicação séria lida com concorrência. A pergunta não é "usar ou não?", é "qual modelo?". Quatro dominam a indústria moderna: platform threads, async/await, CSP (channels), Actor. Cada um nasceu resolvendo um problema específico — escolha errada custa anos.
        </p>
      </Section>

      <Section title="Platform threads (Java, C#, C++)" accent={accent}>
        <CodeBlock lang="java">{`ExecutorService pool = Executors.newFixedThreadPool(16);
for (int i = 0; i < 100; i++) {
    pool.submit(() -> compute(data));
}
pool.shutdown();`}</CodeBlock>
        <p>1:1 com thread do SO. Caro em RAM (~1 MB stack). Ideal para CPU-bound paralelo. Para I/O-bound em alto concorrência, virou gargalo — daí o surgimento de async e virtual thread.</p>
      </Section>

      <Section title="Async/await (JS, Python, C#, Rust)" accent={accent}>
        <CodeBlock lang="ts">{`async function handle(req: Request): Promise<Response> {
    const user  = await fetchUser(req.id);
    const posts = await fetchPosts(user.id);
    return { user, posts };
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Function coloring: qualquer função que chame async precisa ser async. O custo é permear a cadeia inteira. Ganho: event loop single-thread evita locks e context switch.
        </Callout>
      </Section>

      <Section title="CSP: Go channels" accent={accent}>
        <CodeBlock lang="go">{`jobs := make(chan Job, 100)
results := make(chan Result, 100)

for i := 0; i < 8; i++ {
    go func() {
        for j := range jobs {
            results <- process(j)
        }
    }()
}`}</CodeBlock>
        <p>Goroutines anônimas + channels tipados. Cancelamento por close ou context. Modelo cognitivamente leve, escala para milhões de concurrentes. Não tem supervisão nem mailbox por ator.</p>
      </Section>

      <Section title="Actor: Erlang/BEAM, Akka, Elixir" accent={accent}>
        <CodeBlock lang="python">{`# Pseudo-código Actor
% Elixir
defmodule Counter do
  use GenServer
  def handle_cast(:inc, state), do: {:noreply, state + 1}
  def handle_call(:get, _from, state), do: {:reply, state, state}
end

{:ok, pid} = GenServer.start_link(Counter, 0)
GenServer.cast(pid, :inc)`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Cada ator tem PID único, mailbox próprio, estado isolado. Supervisor reinicia em falha (let it crash). Distribuído nativamente entre nós. WhatsApp, Discord e telecom adoram por tolerância a falha.
        </Callout>
      </Section>

      <Section title="Virtual threads (Java 21) — novo entrante" accent={accent}>
        <CodeBlock lang="java">{`try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (var url : urls) {
        exec.submit(() -> httpClient.send(request(url)));
    }
}`}</CodeBlock>
        <p>Híbrido: sintaxe síncrona (sem coloring), runtime M:N (milhões de virtuais, poucas carriers). Resolve I/O-bound com legibilidade. Não é substituto para Actor (sem supervisor/mailbox) nem para CSP (sem channels nativos na sintaxe).</p>
      </Section>

      <Section title="Tabela de decisão" accent={accent}>
        <CodeBlock lang="bash">{`Modelo               Linguagens                       Forte em                   Fraco em
Platform threads     Java 8-17, C#, C++, Rust std     CPU-bound paralelo         I/O-bound >1k concurrent
Async/await          JS, TS, Python, C#, Rust tokio   I/O-bound com low thread   Function coloring
CSP (channels)       Go, Clojure core.async           I/O + worker pool ergonômico  Distribuído
Actor                Erlang, Elixir, Akka (Scala)     Distribuído, tolerância   Curva, overhead
Virtual threads      Java 21+                         I/O-bound síncrono         Streaming composto`}</CodeBlock>
      </Section>

      <Section title="Escolha operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          Serviço web CRUD/RPC em 2026: virtual thread (Java) ou CSP (Go) são top. Evento pipeline: Reactor/async stream. Distribuído com supervisão: Erlang/Elixir. Compute paralelo: platform threads com ForkJoinPool ou rayon. Não confunda "tenho concorrência" com "preciso de framework exótico".
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
