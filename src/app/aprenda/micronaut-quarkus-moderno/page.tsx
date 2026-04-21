import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('micronaut-quarkus-moderno');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'O que Micronaut e Quarkus fazem diferente de Spring Boot no build?',
    options: [
      'Nada',
      'Resolvem injeção, validações e proxies em compile-time (AOT) em vez de reflection em runtime — por isso startup cai para dezenas de ms e memória baixa, mesmo na JVM',
      'Compilam para WebAssembly',
      'Usam um JDK customizado',
    ],
    correct: 1,
    explanation: 'Spring historicamente fez wiring via reflection em startup (custoso). Micronaut e Quarkus movem esse trabalho para compile-time usando annotation processors. Resultado: startup ~50 ms, memória menor, e build já está pronto para GraalVM native sem configuração extra.',
  },
  {
    question: 'Qual nicho favorece Micronaut/Quarkus sobre Spring Boot?',
    options: [
      'Legacy enterprise',
      'Serverless (AWS Lambda), scale-to-zero, CLIs Java e clusters Kubernetes com alta densidade — onde startup e RAM baixos compensam menor maturidade de ecosystem',
      'Monolito tradicional',
      'Apps desktop',
    ],
    correct: 1,
    explanation: 'Se cold start importa (Lambda cobra por segundo), se RAM no k8s é apertada (muitos replicas por nó), ou se você precisa de CLI Java nativo — Micronaut e Quarkus vencem. Para monolito com time já fluente em Spring, o ganho não compensa a reaprendizagem.',
  },
  {
    question: 'Quarkus tem uma feature exclusiva em dev experience?',
    options: [
      'Nenhuma',
      'Dev mode com live reload de JVM: mudança no código recompila e substitui classes em segundos, sem reiniciar o processo — equivalente a Vite no backend',
      'Tela de admin',
      'UI visual',
    ],
    correct: 1,
    explanation: 'mvn quarkus:dev deixa o processo rodando e aplica mudanças incrementalmente. Dev UI expõe endpoints de config, datasource, extensions. É uma vantagem de DX concreta sobre Spring, que ainda depende de Spring DevTools com caveats.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="micronaut-quarkus-moderno"
      title="Micronaut e Quarkus: alternativas modernas"
      icon="🚀"
      xp={50}
      readTime={12}
      trailName="Java Moderno (17/21 LTS)"
      trailColor={accent}
      nextSlug="jvm-performance-gc"
      nextTitle="JVM performance: G1, ZGC, Shenandoah"
      quiz={quiz}
    >
      <Section title="Por que surgiram" accent={accent}>
        <p>
          Spring Boot tradicional faz injeção, AOP e configurações via reflection em startup. Em JVM comum isso custa 3–8 s de boot e centenas de MB de RAM. Micronaut (OCI, 2018) e Quarkus (Red Hat, 2019) nasceram com a aposta oposta: mover tudo para compile-time usando annotation processors. O ganho é direto — startup em dezenas de ms, memória baixa, GraalVM native pronto.
        </p>
      </Section>

      <Section title="Micronaut por dentro" accent={accent}>
        <CodeBlock lang="java">{`@Controller("/api/hello")
public class HelloController {
    @Get("/{name}")
    public Map<String, String> hello(String name) {
        return Map.of("msg", "hi " + name);
    }
}

@Singleton
public class OrderService {
    private final HttpClient client;
    OrderService(@Client("https://pay.example") HttpClient c) { this.client = c; }
}`}</CodeBlock>
        <p>DI, validação e roteamento resolvidos em compile-time via annotation processor. Startup ~50 ms. GraalVM native em ~5 s.</p>
      </Section>

      <Section title="Quarkus e seu dev mode" accent={accent}>
        <CodeBlock lang="java">{`@Path("/hello")
public class HelloResource {
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Greeting hello() {
        return new Greeting("hello");
    }
}`}</CodeBlock>
        <CodeBlock lang="bash">{`./mvnw quarkus:dev
# live reload em segundos, UI em http://localhost:8080/q/dev
./mvnw package -Pnative
# binário ~40 MB, startup ~30 ms`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Quarkus coloca ênfase em DX. Dev UI é diferencial concreto. Ecosystem é menor que Spring, mas cobre banco, messaging, Hibernate, RESTEasy Reactive e Kubernetes nativo.
        </Callout>
      </Section>

      <Section title="Comparação honesta com Spring Boot 3" accent={accent}>
        <CodeBlock lang="bash">{`# Spring Boot 3 + GraalVM
- Startup nativo: ~100 ms
- Ecosystem: enorme (maior do Java)
- Curva: baixa pra quem já sabe Spring

# Micronaut
- Startup JVM: ~50 ms, nativo ~20 ms
- Ecosystem: médio (cresceu em serverless)
- Curva: média

# Quarkus
- Startup JVM: ~60 ms, nativo ~30 ms
- Ecosystem: médio-grande (Red Hat + kubernetes-native)
- Curva: média, dev UX é diferencial`}</CodeBlock>
      </Section>

      <Section title="Quando escolher cada um" accent={accent}>
        <Callout tone="success" icon="✅">
          Spring Boot: default corporate, equipe grande, ecosystem rico, Spring Cloud. Quarkus: cluster Kubernetes denso, prioriza DX e cold start. Micronaut: AWS Lambda Java, CLI nativo, time pequeno com foco em cloud-native.
        </Callout>
      </Section>

      <Section title="O que não mudou" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Nenhum deles resolve design ruim. Arquitetura, fronteira de agregado, idempotência e observability continuam sendo problema do time — framework só remove atrito de infra.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
