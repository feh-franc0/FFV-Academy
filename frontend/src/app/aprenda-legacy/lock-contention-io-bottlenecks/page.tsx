import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('lock-contention-io-bottlenecks');

const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Como diagnosticar lock contention em JVM sem instrumentar código?',
    options: [
      'jstack em loop',
      'async-profiler -e lock (captura Monitor.wait/enter events via JVMTI) ou JFR com evento jdk.JavaMonitorEnter habilitado. Mostra qual monitor é disputado e por quais threads, com stack completo',
      'Contar sincronizados na mão',
      'Só com debugger',
    ],
    correct: 1,
    explanation: 'async-profiler em modo lock captura contention real (não só tempo de espera subjetivo). JFR tem jdk.JavaMonitorEnter e jdk.JavaMonitorWait. Ambos mostram monitor + thread owner + duration. Netflix/Twitter usam em produção para achar synchronized bloqueando throughput sem modificar código.',
  },
  {
    question: 'Qual diferença fundamental entre io_uring e epoll?',
    options: [
      'Nenhuma',
      'epoll notifica quando FD está pronto e você faz read/write (1 syscall por op). io_uring submete operações batched em ring buffers compartilhados kernel/userspace — zero syscalls em fast path, suporta linked ops e fixed buffers. Ganho tipicamente 2-4x em I/O intensivo',
      'io_uring é só para rede',
      'epoll é mais rápido',
    ],
    correct: 1,
    explanation: 'io_uring (Jens Axboe, 2019+) elimina syscall overhead e permite enviar N operações com 1 submit. Suporta disk + network + timer num só API, com polling opcional (IORING_SETUP_SQPOLL). Scylla, Meta, Cloudflare migraram hot paths. epoll continua ótimo para casos simples e compatibilidade ampla.',
  },
  {
    question: 'O que strace revela que profiler não mostra?',
    options: [
      'Nada novo',
      'Cada syscall com argumentos e timing. Útil para descobrir "app parece lento mas CPU baixa": strace revela sleep, wait4, futex (lock contention), read bloqueando. Overhead alto (~2-5x) — usar pontual, não em produção quente',
      'Só é útil em kernel dev',
      'Apenas erros',
    ],
    correct: 1,
    explanation: 'strace -c meu_app mostra summary: quantas syscalls, tempo em cada. Revela padrões escondidos — app fazendo milhares de stat() por request, select() com timeout curto em loop, write() minúsculos sem buffer. Hoje perf trace e bpftrace são alternativas com menos overhead, mas strace continua rápido de invocar para sanity check.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="lock-contention-io-bottlenecks"
      title="Lock contention + I/O bottlenecks"
      icon="🔒"
      xp={55}
      readTime={13}
      trailName="Performance Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Os dois gargalos off-CPU mais comuns" accent={accent}>
        <p>
          CPU saturada é visível em top. Lock contention e I/O wait são invisíveis — CPU mostra 20%, mas p99 explode. Esta é a região onde off-CPU profiling e ferramentas de kernel ganham. Padrão de investigação: (1) CPU baixa + latência alta, (2) confirmar com USE method que saturation está em lock ou I/O, (3) aplicar ferramenta certa.
        </p>
      </Section>

      <Section title="Profilando lock contention (JVM)" accent={accent}>
        <p>
          async-profiler em modo lock captura monitor enter/wait via JVMTI. JFR tem eventos equivalentes habilitáveis em produção.
        </p>
        <CodeBlock lang="bash">{`# async-profiler: lock contention
./profiler.sh -e lock -d 30 -f lock.html &lt;PID&gt;

# JFR: ativar eventos de monitor em runtime
jcmd &lt;PID&gt; JFR.start name=locks settings=profile duration=60s filename=locks.jfr
jcmd &lt;PID&gt; JFR.stop name=locks

# Abrir no JMC, filtrar por jdk.JavaMonitorEnter; sort por totalDuration.
# Resultado: monitor disputado + stack de quem entra + quem possui.`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Adaptive spin: JVM tenta spin curto antes de bloquear em OS. Se contention é curto (ms), spin ganha; se longo, bloqueia. Biased locking foi removido em Java 15+ porque custo de desotimização superou ganho.
        </Callout>
      </Section>

      <Section title="Lock-free como alternativa" accent={accent}>
        <p>
          Quando contention é inerente à estrutura, algoritmos lock-free (CAS loops, epoch-based reclamation) eliminam bloqueio. Mais difíceis de escrever — pule para biblioteca testada (java.util.concurrent, crossbeam em Rust, folly em C++).
        </p>
        <CodeBlock lang="java">{`// Substituir HashMap sincronizado por ConcurrentHashMap (segmented)
Map&lt;String, Integer&gt; seguro = new ConcurrentHashMap&lt;&gt;();

// LongAdder: melhor que AtomicLong sob alta contention (reduz CAS)
LongAdder contador = new LongAdder();
contador.increment();  // sem contention na soma total

// StampedLock: optimistic read (lê sem bloquear, valida depois)
StampedLock lock = new StampedLock();
long stamp = lock.tryOptimisticRead();
int valor = campo;
if (!lock.validate(stamp)) {
    stamp = lock.readLock();
    try { valor = campo; } finally { lock.unlockRead(stamp); }
}`}</CodeBlock>
      </Section>

      <Section title="I/O: iostat, iotop, bpftrace" accent={accent}>
        <p>
          Para disk I/O, iostat -xz 1 é ponto de entrada. %util alto + await alto = disco saturado. biolatency (bcc) dá histograma por device.
        </p>
        <CodeBlock lang="bash">{`# Ver utilização por device
iostat -xz 1

# Colunas críticas:
#   r/s, w/s           - IOPS
#   rkB/s, wkB/s       - throughput
#   avgqu-sz           - saturation (fila)
#   await              - latência média (ms)
#   %util              - tempo ocupado

# Qual processo está causando I/O? iotop ou bpftrace
sudo iotop -oP

# bpftrace: quem abriu arquivos &gt; 10ms
sudo /usr/share/bcc/tools/opensnoop -T
sudo /usr/share/bcc/tools/biolatency -m 10 1

# strace para inspecionar syscalls de 1 PID (cuidado, overhead)
strace -c -p &lt;PID&gt;`}</CodeBlock>
      </Section>

      <Section title="io_uring: o futuro do async I/O no Linux" accent={accent}>
        <p>
          io_uring (Jens Axboe, 2019+) é revolução real. Ring buffers compartilhados kernel/userspace permitem submeter N operações com 1 syscall (ou zero com SQPOLL). Rivaliza SPDK em performance e é portable.
        </p>
        <CodeBlock lang="c">{`// Exemplo mínimo com liburing — leitura assíncrona
#include &lt;liburing.h&gt;

struct io_uring ring;
io_uring_queue_init(32, &amp;ring, 0);

struct io_uring_sqe *sqe = io_uring_get_sqe(&amp;ring);
char buf[4096];
int fd = open("arquivo.bin", O_RDONLY);
io_uring_prep_read(sqe, fd, buf, sizeof(buf), 0);
io_uring_sqe_set_data(sqe, (void*)42);

io_uring_submit(&amp;ring);           // 1 syscall submete tudo
struct io_uring_cqe *cqe;
io_uring_wait_cqe(&amp;ring, &amp;cqe);   // espera conclusão
// cqe-&gt;res = bytes lidos ou -errno
io_uring_cqe_seen(&amp;ring, cqe);`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Adoção real: ScyllaDB, Cloudflare (Pingora), Meta (thrift server), Linux 5.6+ fs default. Runtimes modernos (tokio-uring em Rust, io_uring em Node 22+ experimental) abstraem a API.
        </Callout>
      </Section>

      <Section title="Padrão de investigação: EFIX" accent={accent}>
        <p>
          Checklist mental para não andar em círculos: Establish baseline (latência antes), Find symptom (qual percentil sofre), Isolate (lock? I/O? CPU?), eXplain (root cause com profile), fix + verify.
        </p>
        <CodeBlock lang="bash">{`# 1. Baseline
wrk2 -t4 -c100 -d30s -R1000 --latency http://app/ &gt; before.txt

# 2. USE method
vmstat 1     # CPU / swap
iostat -xz 1 # disk
ss -s        # sockets

# 3. Isolar
# - CPU alta?      -&gt; async-profiler / perf record
# - CPU baixa?     -&gt; offcputime / biolatency / lock profiling
# - rede?          -&gt; tcpconnect, tcpretrans

# 4. Explain
# flamegraph on-CPU + off-CPU = mapa completo

# 5. Fix + verify
wrk2 ... &gt; after.txt
~/FlameGraph/difffolded.pl before.folded after.folded | flamegraph.pl --negate &gt; diff.svg`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
