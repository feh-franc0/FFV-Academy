import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('flamegraphs-producao');

const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Como ler um flamegraph corretamente?',
    options: [
      'Pico mais alto é o gargalo',
      'Largura é tempo total gasto na função (inclusive children); altura é profundidade da pilha. Largura grande na top-of-stack = CPU queimando; busque retângulos largos perto do topo, não o mais alto',
      'Profundidade é o que importa',
      'Topo é sempre main',
    ],
    correct: 1,
    explanation: 'Flamegraph não é invertido: eixo X não é tempo cronológico, é samples agregados ordenados alfabeticamente. Frame largo no topo = função em on-CPU naquele momento; frame largo na base = função chamadora que acumula tempo via callees. Gargalo real é função com largura relativa grande cujos children somem pouco — ela mesma está queimando CPU.',
  },
  {
    question: 'Diferença entre on-CPU e off-CPU flamegraph?',
    options: [
      'Só nome',
      'On-CPU: amostra stack quando thread está rodando (CPU samples via perf). Off-CPU: amostra quando thread está bloqueada (I/O, lock, sleep) via eBPF/ftrace. Aplicação lenta mas CPU baixa = off-CPU flamegraph é o certo',
      'Off-CPU não existe',
      'On-CPU mede memória',
    ],
    correct: 1,
    explanation: 'Se seu serviço responde devagar mas top mostra CPU em 15%, o tempo está em wait — lock contention, disk I/O, sleep. On-CPU flamegraph não mostra nada útil; off-CPU (Gregg criou a técnica via eBPF) mostra stacks de quem estava bloqueado e por quanto tempo. Complementares, não substitutos.',
  },
  {
    question: 'Qual profiler usar para JVM em produção com overhead aceitável?',
    options: [
      'jstack em loop',
      'async-profiler (Jeremy Manson): amostra stack via AsyncGetCallTrace + perf_events, sem safepoint bias. Overhead tipicamente 1-3%. JFR (Flight Recorder) é alternativa oficial, built-in desde Java 11',
      'jvisualvm',
      'System.nanoTime',
    ],
    correct: 1,
    explanation: 'jstack tem safepoint bias (só amostra em safepoints, distorce). async-profiler resolve via AsyncGetCallTrace + perf. JFR é o competidor oficial, menor overhead mas menos granular. Para produção Netflix/Twitter usam async-profiler em modo contínuo. Exporta collapsed stacks -> flamegraph.pl.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="flamegraphs-producao"
      title="Flamegraphs em produção"
      icon="🔥"
      xp={55}
      readTime={13}
      trailName="Performance Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Flamegraph: o diagrama que mudou profiling" accent={accent}>
        <p>
          Brendan Gregg criou o flamegraph em 2011 porque &quot;olhar listagem de samples por função é ilegível acima de 50 funções&quot;. O diagrama resolve: eixo Y = profundidade de stack, eixo X = largura proporcional a tempo agregado. Hoje é o padrão — perf, async-profiler, py-spy, pprof, Chrome DevTools, todos exportam flamegraphs ou variantes (icicle é flamegraph invertido).
        </p>
      </Section>

      <Section title="Linux perf + FlameGraph.pl (receita universal)" accent={accent}>
        <p>
          O pipeline clássico de Gregg funciona para qualquer binário nativo (C, C++, Rust, Go com symbols).
        </p>
        <CodeBlock lang="bash">{`# 1. Coletar samples (99Hz, 30s, stack completo)
sudo perf record -F 99 -a -g --call-graph dwarf -- sleep 30

# 2. Extrair stacks
sudo perf script &gt; out.perf

# 3. Converter para formato collapsed
git clone https://github.com/brendangregg/FlameGraph ~/FlameGraph
~/FlameGraph/stackcollapse-perf.pl out.perf &gt; out.folded

# 4. Gerar SVG interativo
~/FlameGraph/flamegraph.pl out.folded &gt; flame.svg

# Abrir no browser — cada retângulo é clicável (zoom), hover mostra %.
# Retângulos vermelhos = user, amarelos = kernel (convenção default).`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Para símbolos de kernel recentes precisa /proc/kallsyms acessível (perf_event_paranoid baixo). Para binários strip precisa debuginfo instalado (debuginfo-install no RHEL, dbgsym no Debian).
        </Callout>
      </Section>

      <Section title="Java / JVM — async-profiler" accent={accent}>
        <p>
          async-profiler é o padrão de facto em JVM. Evita safepoint bias, suporta CPU, allocation e lock profiling, e exporta direto em formato flamegraph.
        </p>
        <CodeBlock lang="bash">{`# Anexar ao PID e gerar flamegraph HTML
./profiler.sh -d 30 -f cpu-flame.html &lt;PID&gt;

# Allocation profiling (TLAB sampling)
./profiler.sh -e alloc -d 30 -f alloc.html &lt;PID&gt;

# Lock contention (monitor wait)
./profiler.sh -e lock -d 30 -f lock.html &lt;PID&gt;

# Modo contínuo (daemon) via agent
java -agentpath:/path/libasyncProfiler.so=start,event=cpu,file=cpu.jfr,interval=1ms MyApp`}</CodeBlock>
      </Section>

      <Section title="Python — py-spy, scalene" accent={accent}>
        <p>
          py-spy (Ben Frederickson) amostra sem modificar o processo (ptrace). scalene (Emery Berger, UMass) é mais pesado mas mostra linha-a-linha incluindo memória e GPU.
        </p>
        <CodeBlock lang="bash">{`# py-spy anexa sem reiniciar o processo
sudo py-spy record -o flame.svg --pid 12345 --duration 30

# top ao vivo
sudo py-spy top --pid 12345

# scalene: profile CPU + memory + GPU com atribuição por linha
scalene --html --outfile prof.html meu_script.py`}</CodeBlock>
      </Section>

      <Section title="Go — pprof built-in" accent={accent}>
        <p>
          Go tem pprof no runtime. Expor endpoint e usar go tool pprof com opção -http abre UI com flamegraph interativo.
        </p>
        <CodeBlock lang="go">{`import _ "net/http/pprof"
import "net/http"

func main() {
    go func() { http.ListenAndServe("localhost:6060", nil) }()
    // ... app normal
}

// Coletar perfil de CPU (30s) e abrir UI com flamegraph
// $ go tool pprof -http=:8080 http://localhost:6060/debug/pprof/profile?seconds=30
//
// Heap, goroutines, blocking, mutex também:
// /debug/pprof/heap, /goroutine, /block, /mutex`}</CodeBlock>
      </Section>

      <Section title="Diff flamegraph: antes vs depois" accent={accent}>
        <p>
          Depois de otimizar, diff flamegraph mostra onde mudou. Vermelho = ficou mais lento, azul = mais rápido. Ideal para revisar PR de perf.
        </p>
        <CodeBlock lang="bash">{`# Coletar baseline e candidate
~/FlameGraph/difffolded.pl baseline.folded candidate.folded &gt; diff.folded
~/FlameGraph/flamegraph.pl --negate diff.folded &gt; diff.svg`}</CodeBlock>
      </Section>

      <Section title="Off-CPU: o flamegraph que falta" accent={accent}>
        <p>
          Se CPU está baixa mas app lento, on-CPU flamegraph não serve. Off-CPU via eBPF captura stacks de quem bloqueou em lock/disk/sleep.
        </p>
        <CodeBlock lang="bash">{`# offcputime do bcc (soma tempo bloqueado por stack)
sudo /usr/share/bcc/tools/offcputime -df -p &lt;PID&gt; 30 &gt; out.stacks
~/FlameGraph/flamegraph.pl --color=io --title="Off-CPU" out.stacks &gt; offcpu.svg`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Regra de Gregg: colete on-CPU e off-CPU juntos. Maioria dos mistérios de latência está em off-CPU (I/O escondido, lock contention) e on-CPU puro não mostra.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
