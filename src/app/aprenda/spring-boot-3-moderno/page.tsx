import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('spring-boot-3-moderno');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Spring Boot 3 exigiu mudar pacote de javax.* para jakarta.*?',
    options: [
      'Foi decisão estética',
      'A Jakarta EE herdou as specs que eram javax.* da Oracle e o namespace foi movido legalmente — código antigo precisa migrar imports, Hibernate/Tomcat/Servlet novos só usam jakarta',
      'Para ser mais rápido',
      'Porque Java 21 renomeou',
    ],
    correct: 1,
    explanation: 'Eclipse Foundation recebeu Jakarta EE mas não o namespace javax.*. A Spring 6 tomou a decisão de cortar no compile-time. Consequência: dependências que compilem Spring Boot 3 precisam ser versões Jakarta (Hibernate 6+, Tomcat 10+). Migração é basicamente find/replace, mas obrigatória.',
  },
  {
    question: 'O que GraalVM native image troca em runtime?',
    options: [
      'Nada, roda igual',
      'Compila AOT para binário nativo — startup em ~50 ms e RAM baixa, mas perde JIT adaptativo e exige registrar reflection/resources explicitamente',
      'Gera bytecode menor',
      'Remove o GC',
    ],
    correct: 1,
    explanation: 'Native image = AOT com closed-world. Startup e memória ficam ideais para serverless e scale-to-zero. O custo: reflection, proxies dinâmicos e resources precisam ser declarados (Spring Boot AOT processors ajudam). Em steady-state, JIT hot path da JVM tradicional ainda bate native image.',
  },
  {
    question: 'Qual endpoint de Actuator habilita sem pensar em produção?',
    options: [
      '/actuator/shutdown',
      '/actuator/health e /actuator/prometheus atrás de auth e porta management separada — dá readiness probe para k8s e métricas sem vazar env ou heap dump',
      '/actuator/env',
      '/actuator/beans',
    ],
    correct: 1,
    explanation: 'health + prometheus cobrem 90% do observability básico. env, beans, configprops, heapdump vazam segredos ou são caros — deixe desligados por default. Exponha Actuator em management.server.port separada e proteja com auth ou ACL de rede.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="spring-boot-3-moderno"
      title="Spring Boot 3+: moderno e rápido"
      icon="🌱"
      xp={60}
      readTime={14}
      trailName="Java Moderno (17/21 LTS)"
      trailColor={accent}
      nextSlug="jpa-hibernate-performance"
      nextTitle="JPA/Hibernate: performance e armadilhas"
      quiz={quiz}
    >
      <Section title="O que mudou de 2 para 3" accent={accent}>
        <p>
          Spring Boot 3 exige Java 17+, namespace jakarta.*, Observability API nova (Micrometer + tracing nativo), Spring AOT para GraalVM e suporte oficial a virtual thread. É break version com migração curta mas obrigatória: dependências antigas em javax.* não compilam.
        </p>
      </Section>

      <Section title="Project skeleton" accent={accent}>
        <CodeBlock lang="java">{`@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    // Habilita virtual thread no Tomcat + async
    @Bean
    TomcatProtocolHandlerCustomizer<?> vtCustomizer() {
        return protocolHandler ->
            protocolHandler.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
    }
}

@RestController
@RequestMapping("/api/v1/orders")
class OrderController {
    private final OrderService service;
    OrderController(OrderService s) { this.service = s; }

    @GetMapping("/{id}")
    ResponseEntity<OrderDto> get(@PathVariable UUID id) {
        return service.find(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}`}</CodeBlock>
        <p>Constructor injection (sem @Autowired), DTO como record, virtual thread no pool do Tomcat. Esse é o default 2026.</p>
      </Section>

      <Section title="application.yml enxuto" accent={accent}>
        <CodeBlock lang="bash">{`spring:
  threads:
    virtual:
      enabled: true
  datasource:
    url: jdbc:postgresql://db:5432/app
    hikari:
      maximum-pool-size: 20
  jpa:
    open-in-view: false
    properties.hibernate.jdbc.batch_size: 50

management:
  server.port: 9090
  endpoints.web.exposure.include: health,prometheus
  metrics.tags.application: orders-service`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          open-in-view=false é obrigatório. O default true mantém sessão JPA aberta durante a view e esconde N+1. Corte isso no primeiro dia.
        </Callout>
      </Section>

      <Section title="GraalVM native image" accent={accent}>
        <CodeBlock lang="bash">{`# Build nativo (spring-boot-maven-plugin AOT)
./mvnw -Pnative native:compile
./target/orders-service
# Started App in 0.112 seconds (JVM running for 0.118)`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Ganho claro: function serverless, CLI Java, scale-to-zero. Custo: build lento (~2–5 min), reflection declarada, menos libs maduras. Avalie caso a caso — nem todo serviço precisa nativo.
        </Callout>
      </Section>

      <Section title="Observability que vem de graça" accent={accent}>
        <Callout tone="success" icon="✅">
          Adicione micrometer-registry-prometheus + spring-boot-starter-actuator. Já vem metric por endpoint, HikariCP, JVM, GC e integração com OpenTelemetry para tracing. Prometheus raspa /actuator/prometheus e você ganha dashboard pronto.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
