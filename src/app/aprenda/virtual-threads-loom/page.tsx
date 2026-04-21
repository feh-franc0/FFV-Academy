import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('virtual-threads-loom');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que virtual thread não é "thread mais rápida"?',
    options: [
      'Porque roda em outro processo',
      'Porque ele é uma continuação escalonada em cima de poucas carrier threads — o ganho é suportar milhões de tarefas I/O-bound sem reservar 1 MB de stack por uma, não acelerar CPU',
      'Porque usa GPU',
      'Porque é compilado em C',
    ],
    correct: 1,
    explanation: 'Platform thread = 1:1 com thread do SO, stack reservada ~1 MB. Virtual thread custa algumas centenas de bytes, estaciona em I/O sem bloquear o carrier. Para trabalho CPU-bound você ainda precisa do mesmo núcleo — virtual thread não substitui ForkJoinPool em cálculo pesado.',
  },
  {
    question: 'O que faz virtual thread regredir para platform thread (pinning)?',
    options: [
      'Nada, nunca pinniza',
      'Bloquear dentro de synchronized ou chamar método JNI nativo prende o virtual thread no carrier até liberar — ReentrantLock e java.util.concurrent não fazem pinning',
      'Usar record',
      'Chamar System.out',
    ],
    correct: 1,
    explanation: 'JEP 444 documenta: blocos synchronized e nativos JNI em wait não liberam o carrier. Em Java 24 parte disso foi resolvido, mas em 21 LTS você ainda vê. Solução: trocar synchronized por ReentrantLock em hot path. jcmd Thread.dump_to_file -format=json mostra pinning.',
  },
  {
    question: 'Quando virtual thread não substitui código reativo?',
    options: [
      'Sempre substitui',
      'Quando você precisa de backpressure, streaming com transformação composta ou operadores como debounce/window — Reactor/RxJava continuam melhores para pipeline de eventos',
      'Nunca',
      'Só em testes',
    ],
    correct: 1,
    explanation: 'Virtual thread resolve "muitos requests I/O-bound simultâneos com código síncrono". Não resolve streaming composto (flatMap/merge/window) nem propagação de backpressure. Para esses, Reactor é superior. A regra: CRUD e RPC viraram virtual thread; event pipeline segue reativo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="virtual-threads-loom"
      title="Virtual Threads (Project Loom, Java 21)"
      icon="🧵"
      xp={65}
      readTime={15}
      trailName="Java Moderno (17/21 LTS)"
      trailColor={accent}
      nextSlug="spring-boot-3-moderno"
      nextTitle="Spring Boot 3+: moderno e rápido"
      quiz={quiz}
    >
      <Section title="O problema que Loom resolveu" accent={accent}>
        <p>
          Platform thread custa ~1 MB de stack reservada e um descritor do kernel. Um servidor com 10k conexões simultâneas derrete — por isso Tomcat, Netty e Jetty dependiam de pools limitados ou de código reativo. Virtual thread (final em 21 LTS, JEP 444) é uma continuação M:N: muitas virtuais em cima de poucas carrier threads do ForkJoinPool.
        </p>
      </Section>

      <Section title="Sintaxe direta" accent={accent}>
        <CodeBlock lang="java">{`// Executor que cria 1 virtual thread por task
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            var res = httpClient.send(request(i), BodyHandlers.ofString());
            log.info("resp " + i + " " + res.statusCode());
            return null;
        });
    });
}

// Ou start direto
Thread.startVirtualThread(() -> doWork());

// Factory customizado
var factory = Thread.ofVirtual().name("worker-", 0).factory();`}</CodeBlock>
      </Section>

      <Section title="Structured concurrency (preview → final em 25)" accent={accent}>
        <CodeBlock lang="java">{`try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<User>  user  = scope.fork(() -> findUser(id));
    Subtask<Order> order = scope.fork(() -> findOrder(id));
    scope.join().throwIfFailed();
    return new Response(user.get(), order.get());
}`}</CodeBlock>
        <p>Escopo explícito: se uma falha, as outras são canceladas. Stack traces legíveis. Fim de "onde está a task que nunca voltou".</p>
      </Section>

      <Section title="Pinning: a única armadilha prática" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Bloco synchronized que bloqueia dentro prende o virtual thread no carrier. Substitua por ReentrantLock em regiões quentes. Para diagnosticar, rode com -Djdk.tracePinnedThreads=full.
        </Callout>
        <CodeBlock lang="java">{`// Ruim em hot path I/O
synchronized (cache) { return db.query(id); }

// Bom com virtual thread
private final Lock lock = new ReentrantLock();
lock.lock();
try { return db.query(id); }
finally { lock.unlock(); }`}</CodeBlock>
      </Section>

      <Section title="Quando virtual thread vence reativo" accent={accent}>
        <Callout tone="success" icon="✅">
          API REST que faz 3 chamadas HTTP + 1 query: virtual thread ganha em legibilidade sem perder throughput. Código síncrono com debugger funcional, stack trace limpa, try/finally normal. Spring MVC + JDBC voltou a ser default em 2026.
        </Callout>
      </Section>

      <Section title="Quando reativo ainda ganha" accent={accent}>
        <Callout tone="neutral" icon="📌">
          Pipelines de eventos com transformação composta, propagação de backpressure, windowing e merge. Aí Reactor/RxJava continuam sendo a ferramenta certa — mas isso é 10–15% dos serviços, não 100%.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
