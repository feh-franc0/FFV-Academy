import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('java-historia-compilador-diferencial');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'O que são virtual threads (Project Loom, Java 21) e por que mudaram o mundo da concorrência em JVM?',
    options: [
      'São threads comuns renomeadas',
      'Virtual threads são threads gerenciadas pela JVM (não pelo SO), com stack inicial de ~2KB em vez de ~1MB. Uma aplicação pode abrir milhões delas sem estourar memória ou descriptors. Código síncrono volta a ser viável em alta concorrência — grande parte dos casos de uso de Reactor/WebFlux/RxJava deixou de fazer sentido',
      'São threads que rodam em realidade virtual',
      'São threads exclusivas do GraalVM',
    ],
    correct: 1,
    explanation: 'Virtual threads (JEP 444, estáveis em Java 21 LTS, outubro/2023) desacoplam Thread de carrier OS thread. O scheduler JVM multiplexa virtual threads em um pool pequeno de platform threads. O impacto prático é enorme: você escreve código síncrono legível (new Thread, try/catch normal, try-with-resources) e ainda escala para milhões de conexões. Reactive (Reactor, RxJava) sobrevive para backpressure e streaming, mas deixa de ser default.',
  },
  {
    question: 'Como funciona o pipeline de compilação e execução Java?',
    options: [
      'javac compila direto para código de máquina nativo',
      'javac compila .java em bytecode .class (padrão da JVM). Em runtime, o HotSpot carrega classes, interpreta bytecode inicialmente, e o JIT (C1 em tier 1, C2 em tier 4) recompila métodos quentes para código nativo otimizado. O GC (G1 default, ZGC para baixa latência) gerencia memória. GraalVM Native Image faz AOT para binário standalone',
      'Java é interpretado linha a linha sem compilação',
      'Java usa o mesmo pipeline do C',
    ],
    correct: 1,
    explanation: 'O modelo JVM é: javac gera bytecode portátil → JVM (HotSpot) interpreta e perfila → JIT tier compiler (C1 rápido, C2 otimizado) produz nativo em runtime com inlining agressivo, escape analysis e vetorização. Isso permite otimizações adaptativas impossíveis em AOT estático (inlining de call sites monomórficos detectados só em runtime). GraalVM Native Image é alternativa AOT para cold start e footprint, pagando com perda de alguns otimizadores e reflection dinâmico.',
  },
  {
    question: 'Qual versão de Java é realmente usada em produção em 2026?',
    options: [
      'Java 8 em 100% dos lugares',
      'Java 17 LTS e Java 21 LTS são os padrões em 2026: bancos, fintechs e grandes enterprises migraram em peso para 17 (suporte Oracle até 2029) e 21 está entrando rápido por virtual threads. Java 8 ainda sobrevive em legado crítico mas perde manutenção. Java 11 LTS sai de suporte comercial em 2026',
      'Java 22 é o padrão de produção',
      'Todo mundo usa Scala agora',
    ],
    correct: 1,
    explanation: 'O ciclo de 6 meses (desde Java 9) gerou muitas versões, mas a indústria migra entre LTS. Pesquisas da New Relic e JRebel em 2024-2025 mostram Java 17 dominando em produção (40%+), com Java 21 subindo rápido. Java 8 ainda aparece em 20-30% das aplicações (legacy monolítico), mas o risco de segurança aumenta. Java 11 sai de suporte comercial Oracle em 2026 (prazo final de migração). Alpine + jlink custom images são padrão em containers.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="java-historia-compilador-diferencial"
      title="Java: história, JVM e diferencial em 2026"
      icon="☕"
      xp={50}
      readTime={12}
      trailName="Java Moderno (17/21 LTS)"
      trailColor={accent}
      nextSlug="java-21-features"
      nextTitle="Java 17/21 features: records, sealed, pattern matching"
      quiz={quiz}
    >
      <Section title="1995, Sun Microsystems: write once, run anywhere" accent={accent}>
        <p>
          Java nasceu em <strong>1995</strong> na Sun Microsystems, liderada por <strong>James Gosling</strong>. O projeto começou em 1991 como "Oak" para eletrônicos embarcados, mas foi reposicionado para a web emergente. A promessa central — <em>write once, run anywhere</em> — foi revolucionária em uma era de software amarrado a arquiteturas específicas. A JVM, portável e com GC, resolvia o problema central do C++ da época: memória manual e portabilidade frágil.
        </p>
        <p>
          Marcos: <strong>Java 1.0</strong> (1996), <strong>Java 5</strong> (2004, generics + annotations + enums + autoboxing — maior mudança desde 1.0), <strong>Java 7</strong> (2011, try-with-resources, NIO.2), <strong>Java 8</strong> (2014, lambdas e streams — divisor de águas), <strong>Java 9</strong> (2017, modules, início do ciclo de 6 meses), <strong>Java 11 LTS</strong> (2018, primeiro LTS pós-Oracle), <strong>Java 17 LTS</strong> (2021, records, sealed, pattern matching preview), <strong>Java 21 LTS</strong> (2023, virtual threads, structured concurrency, pattern matching final). Oracle comprou Sun em 2010; OpenJDK é a referência open-source desde então.
        </p>
      </Section>

      <Section title="JVM: a plataforma como diferencial" accent={accent}>
        <Callout tone="info" icon="🎯">
          <strong>Java a linguagem é menos importante que a JVM a plataforma.</strong> Scala, Kotlin, Clojure, Groovy rodam sobre ela. 30 anos de otimização em HotSpot JIT e GC entregam perf que poucos runtimes igualam, observabilidade profunda (JFR, async-profiler, heap dumps analisáveis), e um ecossistema Spring/Jakarta EE/Micronaut/Quarkus que dificilmente se replica em outras stacks.
        </Callout>
        <p>
          Em 2026, a JVM não é mais sinônimo de "lento e pesado". G1 GC default, ZGC sub-millissegundo, virtual threads para concorrência, GraalVM Native Image para AOT, CDS (Class Data Sharing) para startup — a plataforma modernizou profundamente.
        </p>
      </Section>

      <Section title="Pipeline: do .java ao código nativo" accent={accent}>
        <CodeBlock lang="bash">{'# fluxo tradicional HotSpot\nMain.java\n  |-- javac      --> Main.class (bytecode JVM, portatil)\n  |-- [deploy]   --> app.jar\n  |-- java -jar  --> JVM carrega classes\n         + interpreter executa bytecode\n         + profiler detecta metodos quentes\n         + C1 JIT (tier 1-3) compila rapido\n         + C2 JIT (tier 4) recompila com otimizacoes agressivas\n         + GC (G1 default | ZGC low-latency | Shenandoah | Parallel)\n\n# GraalVM Native Image (AOT)\nnative-image -jar app.jar\n  |-- analisa closed-world reachability\n  |-- gera binario standalone (sem JVM em runtime)\n  |-- startup em ms, footprint ~30-100MB\n  |-- paga: reflection dinamica e dynamic class loading limitados\n\n# jlink (custom runtime image)\njlink --module-path $JAVA_HOME/jmods --add-modules java.base,java.net.http \\\n      --output custom-jre\n  |-- JRE minimo so com modules usados (~40MB em vez de ~300MB)\n  |-- ideal para containers slim'}</CodeBlock>
      </Section>

      <Section title="Versões que importam até 2026" accent={accent}>
        <CodeBlock lang="java">{'// Java 5 (2004): generics, annotations, autoboxing, enhanced for\nList<String> nomes = new ArrayList<>();\n\n// Java 7 (2011): try-with-resources, diamond operator\ntry (var reader = Files.newBufferedReader(path)) { ... }\n\n// Java 8 (2014): lambdas + streams (divisor de aguas)\nvar total = nums.stream()\n    .filter(n -> n % 2 == 0)\n    .mapToInt(Integer::intValue)\n    .sum();\n\n// Java 11 LTS: var local, HTTP Client moderno, ZGC experimental\nvar client = HttpClient.newHttpClient();\n\n// Java 17 LTS: records, sealed, pattern matching preview\npublic record Usuario(String nome, int idade) {}\npublic sealed interface Forma permits Circulo, Quadrado {}\n\n// Java 21 LTS: virtual threads + structured concurrency + pattern matching final\ntry (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    IntStream.range(0, 1_000_000).forEach(i ->\n        executor.submit(() -> processar(i))\n    );\n}\n// pattern matching em switch\nString desc = switch (obj) {\n    case Integer i when i > 0 -> "positivo: " + i;\n    case String s -> "string: " + s;\n    case null -> "nulo";\n    default -> "outro";\n};'}</CodeBlock>
      </Section>

      <Section title="Diferencial técnico: o que só Java/JVM entrega" accent={accent}>
        <p>
          Três eixos: <strong>observabilidade profunda</strong>, <strong>ecossistema maduro</strong> e agora <strong>virtual threads</strong>.
        </p>
        <CodeBlock lang="bash">{'# 1. Observabilidade que poucos runtimes tem\n# JFR (Java Flight Recorder): profiling continuo com overhead < 1%\njava -XX:StartFlightRecording=duration=60s,filename=perf.jfr -jar app.jar\n# async-profiler: flame graphs de CPU, alloc, lock em producao\n./profiler.sh -e cpu -d 30 -f flame.html <pid>\n# heap dumps analisaveis com Eclipse MAT, JProfiler, VisualVM\n\n# 2. Ecossistema (30+ anos de bibliotecas enterprise)\n# Spring Boot (de facto), Quarkus (Red Hat, k8s-native), Micronaut (cloud)\n# Jakarta EE (ex-Java EE), Hibernate/JPA, Kafka, Elasticsearch, Cassandra\n# Build: Maven / Gradle. Test: JUnit 5, Testcontainers, AssertJ.\n\n# 3. Concorrencia moderna (Java 21+)\n# virtual threads + structured concurrency + scoped values\n# milhoes de threads em uma JVM, codigo sincrono legivel'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Em 2026, Java roda 70% dos backends bancários mundiais, é runtime oficial do Android (com ART como JIT/AOT híbrido), domina big data (Spark, Flink, Kafka, Hadoop), e é a stack preferida em fintechs, seguradoras e e-commerce de alta escala (Amazon, Netflix, Uber em partes críticas).
        </Callout>
      </Section>

      <Section title="Versão mais usada no mercado em 2026" accent={accent}>
        <Callout tone="neutral" icon="🧭">
          <strong>Java 17 LTS</strong> é o padrão dominante em produção (Oracle LTS até 2029). <strong>Java 21 LTS</strong> avança rápido por virtual threads — muita fintech e startup nova já começa em 21. <strong>Java 8</strong> sobrevive em legado crítico (ainda 20-30% das aplicações instaladas), mas atualização é prioridade de segurança. <strong>Java 11 LTS</strong> sai de suporte comercial Oracle em 2026 — prazo final de migração para quem ainda está nele.
        </Callout>
        <p>
          Stack 2026: JDK Temurin (Eclipse Adoptium) ou Amazon Corretto como builds preferidas. Spring Boot 3.x (Jakarta EE 10, requer Java 17+) é default backend. Gradle + Kotlin DSL ou Maven. Container: base image <code>eclipse-temurin:21-jre-alpine</code> ou imagem custom via <code>jlink</code>. Observability: OpenTelemetry Java agent.
        </p>
      </Section>

      <Section title="O que esperar desta trilha" accent={accent}>
        <Callout tone="info" icon="🗺️">
          Próximos módulos: Java 17/21 features (records, sealed, pattern matching), virtual threads (Project Loom), Spring Boot 3 moderno, JPA/Hibernate performance, reactive vs virtual threads (quando cada um), Micronaut e Quarkus, JVM performance (G1, ZGC, JFR), e capstone de serviço Spring Boot production-ready.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
