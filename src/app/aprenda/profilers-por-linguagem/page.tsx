import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('profilers-por-linguagem');

const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre CPU profiler e allocation profiler?',
    options: [
      'Nenhuma',
      'CPU profiler amostra on-CPU stacks (onde o tempo queima). Allocation profiler rastreia onde memória é alocada (TLAB/heap events). Tempo lento com GC pressure alta = allocation profiler; tempo lento com CPU saturada = CPU profiler',
      'Alocação é mais preciso',
      'CPU só mede percentuais',
    ],
    correct: 1,
    explanation: 'Os dois respondem perguntas diferentes. App em Java com 80% CPU em GC mostra CPU profiler apontando para GCHelper — mas a causa é código que aloca demais. Allocation profiler (async-profiler -e alloc, scalene, Go /debug/pprof/heap) mostra as linhas que geram garbage. Sem diferenciar, você otimiza sintoma.',
  },
  {
    question: 'Por que pprof do Go é built-in e outras linguagens não?',
    options: [
      'Acidente',
      'Runtime do Go foi projetada com profiling desde o dia 1 (Google dogfooding). Stacks Go têm frame pointers sempre, runtime amostra a baixo custo (~1%). Outras linguagens dependem de bibliotecas externas (async-profiler, py-spy) que fazem engenharia reversa do runtime',
      'Go é mais rápido',
      'Java não precisa',
    ],
    correct: 1,
    explanation: 'Go priorizou observability: net/http/pprof expõe CPU, heap, goroutine, block, mutex profiles via HTTP. Basta importar o pacote. Em Java você precisa anexar agente (async-profiler) ou habilitar JFR. Python e Node dependem de ptrace ou V8 inspector. Isso reflete filosofia diferente — não qualidade intrínseca.',
  },
  {
    question: 'Quando scalene bate py-spy em Python?',
    options: [
      'Sempre',
      'scalene (UMass) atribui CPU, memória e GPU por linha, separa Python de C e detecta copies desnecessárias. py-spy amostra só stacks. Para questão &quot;qual linha aloca mais?&quot;, scalene ganha; para &quot;onde está o tempo&quot; em produção live, py-spy (ptrace sem instrumentar) é mais leve',
      'Nunca',
      'Só em Jupyter',
    ],
    correct: 1,
    explanation: 'scalene (Emery Berger) usa sampling + memory events + signal-based — dá insight que stack profiler não dá. Custa mais overhead e precisa rodar dentro do processo. py-spy é zero-intrusão (anexa via ptrace), ideal para processo em produção que você não pode reiniciar. Ferramentas complementares.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="profilers-por-linguagem"
      title="Profilers por linguagem (comparado)"
      icon="🧪"
      xp={50}
      readTime={12}
      trailName="Performance Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Mapa: profiler certo por runtime" accent={accent}>
        <p>
          Cada runtime tem sua idiossincrasia — safepoints (JVM), GIL (Python), escalonador cooperativo (Go), event loop (Node). Profiler errado mente ou distorce. Abaixo, as ferramentas que a galera usa em produção real (Netflix, Uber, Shopify, Datadog engineering blogs).
        </p>
      </Section>

      <Section title="JVM — async-profiler, JFR" accent={accent}>
        <p>
          async-profiler resolve safepoint bias do jstack via AsyncGetCallTrace. JFR (Java Flight Recorder) é built-in desde Java 11 e gratuito desde OpenJDK.
        </p>
        <CodeBlock lang="bash">{`# async-profiler: CPU em 30s
./profiler.sh -d 30 -f cpu.html &lt;PID&gt;

# async-profiler: allocations (TLAB)
./profiler.sh -e alloc -d 30 -f alloc.html &lt;PID&gt;

# async-profiler: lock contention
./profiler.sh -e lock -d 30 -f lock.html &lt;PID&gt;

# JFR continuous em produção
java -XX:StartFlightRecording=duration=60s,filename=rec.jfr,settings=profile MyApp

# Analisar JFR com JMC (Java Mission Control)
jmc rec.jfr`}</CodeBlock>
      </Section>

      <Section title="Node.js — clinic.js, 0x" accent={accent}>
        <p>
          clinic.js (NearForm) tem doctor (diagnóstico inicial), flame (flamegraph via 0x) e bubbleprof (event loop). Todos geram relatório HTML.
        </p>
        <CodeBlock lang="bash">{`# Diagnóstico automático
npx clinic doctor -- node server.js

# Flamegraph
npx clinic flame -- node server.js

# 0x standalone (flamegraph com filtros)
npx 0x server.js

# Chrome DevTools: --inspect expõe V8 profiler
node --inspect server.js
# chrome://inspect no browser, aba Profiler`}</CodeBlock>
      </Section>

      <Section title="Python — py-spy, scalene, cProfile" accent={accent}>
        <p>
          py-spy (Ben Frederickson, Rust) é o default em produção. scalene para análise profunda de alocação. cProfile built-in para dev rápido.
        </p>
        <CodeBlock lang="bash">{`# py-spy anexa sem reiniciar
sudo py-spy record -o flame.svg --pid 12345 --duration 30
sudo py-spy top --pid 12345

# scalene: linha-a-linha CPU + memória
scalene --html --outfile prof.html meu_app.py

# cProfile built-in (overhead alto, use em dev)
python -m cProfile -o prof.out meu_app.py
python -c "import pstats; pstats.Stats('prof.out').sort_stats('cumulative').print_stats(30)"`}</CodeBlock>
      </Section>

      <Section title="Go — pprof (built-in, sem rival)" accent={accent}>
        <p>
          Expor net/http/pprof é one-liner. go tool pprof com -http abre UI rica com flamegraph, graph, top, source view.
        </p>
        <CodeBlock lang="go">{`import _ "net/http/pprof"
import "net/http"

func init() {
    go func() { http.ListenAndServe("localhost:6060", nil) }()
}

// CPU profile (30s) com UI interativa
// $ go tool pprof -http=:8080 http://localhost:6060/debug/pprof/profile?seconds=30

// Heap profile (snapshot atual)
// $ go tool pprof -http=:8081 http://localhost:6060/debug/pprof/heap

// Block profile (quem espera em channel/mutex)
// runtime.SetBlockProfileRate(1)
// $ go tool pprof http://localhost:6060/debug/pprof/block

// Mutex profile
// runtime.SetMutexProfileFraction(1)
// $ go tool pprof http://localhost:6060/debug/pprof/mutex`}</CodeBlock>
      </Section>

      <Section title="Rust — perf + cargo-flamegraph" accent={accent}>
        <p>
          Rust binários nativos usam o pipeline Linux perf. cargo-flamegraph automatiza — um comando gera flamegraph com símbolos.
        </p>
        <CodeBlock lang="rust">{`// Cargo.toml — symbols em release
[profile.release]
debug = true     // mantém debuginfo no binário release

// Rodar e gerar flamegraph
// $ cargo install flamegraph
// $ cargo flamegraph --bin meu_app
// Gera flamegraph.svg com perf sob o capô.

// Alternativa: pprof-rs (similar ao Go)
fn main() {
    let guard = pprof::ProfilerGuard::new(100).unwrap();
    // ... workload
    if let Ok(report) = guard.report().build() {
        let file = std::fs::File::create("flame.svg").unwrap();
        report.flamegraph(file).unwrap();
    }
}`}</CodeBlock>
      </Section>

      <Section title="Quando cada tipo de profiler?" accent={accent}>
        <p>
          Três perguntas, três profilers. Conhecer qual aplicar evita olhar o diagrama errado.
        </p>
        <CodeBlock lang="bash">{`# "CPU saturada, onde queima?"          -&gt; CPU profiler (samples on-CPU)
# "Tempo em wait (I/O, lock)?"           -&gt; Off-CPU profiler (eBPF)
# "GC pressure alta / OOM?"              -&gt; Allocation/Heap profiler
# "Event loop travado (Node)?"           -&gt; bubbleprof / async tracing
# "Goroutines bloqueando?"               -&gt; Go block profile
# "Safepoint/pauses (JVM)?"              -&gt; JFR gc events`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Referências: Netflix Tech Blog (async-profiler posts), Datadog engineering (continuous profiling), &quot;High-Performance Python&quot; (Gorelick &amp; Ozsvald), &quot;Systems Performance&quot; (Gregg).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
