import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-spring-boot-production');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'O que torna um serviço Spring Boot "production-ready" além de compilar?',
    options: [
      'Ter README',
      'Health + readiness probes, métricas Prometheus, tracing distribuído, graceful shutdown, migrations versionadas (Flyway/Liquibase), logging estruturado JSON e teste de integração com Testcontainers contra dependências reais',
      'Só logs',
      'Ter Dockerfile',
    ],
    correct: 1,
    explanation: 'Production-ready = operável em k8s sob falha real. Probes informam o orquestrador, métricas dão base para SLO/alerta, tracing permite correlação entre serviços, Testcontainers substitui mocks frágeis por Postgres real em CI. Sem esses, você tem protótipo, não produto.',
  },
  {
    question: 'Por que usar Testcontainers em integration tests?',
    options: [
      'Só por moda',
      'Roda dependências reais (Postgres, Kafka, Redis) em Docker durante o teste — elimina falsos positivos de mock e dá garantia de que query, migration e driver funcionam no banco de verdade',
      'Deixa teste mais rápido',
      'Substitui unit test',
    ],
    correct: 1,
    explanation: 'Mock de repository verifica seu código Java, não a query SQL. Testcontainers sobe Postgres real, aplica Flyway, roda a operação completa. Em 2026 é o default para integration test — roda em CI com disco e rede do GitHub Actions sem drama.',
  },
  {
    question: 'O que falta antes de apertar deploy para produção?',
    options: [
      'Nada, CI passou',
      'Load test com k6 simulando pico esperado, canary/blue-green no cluster, dashboard Grafana pronto, runbook de incident response e feature flag para desligar via config sem redeploy',
      'Só logs',
      'Anúncio no Slack',
    ],
    correct: 1,
    explanation: 'CI verde diz que o código compila e testes unitários passam. Não diz nada sobre comportamento sob 500 rps, nem sobre o que o operador faz quando a latência dobra às 2h. Load test, canary, dashboard e runbook são o que distingue "deploy seguro" de "roleta russa".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-spring-boot-production"
      title="Capstone: serviço Spring Boot production-ready"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Java Moderno (17/21 LTS)"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Construir um serviço REST de pedidos completo: Spring Boot 3 + Java 21 + records + virtual thread + JPA + Testcontainers + Flyway + Actuator + Prometheus + OpenAPI + tracing OpenTelemetry + Dockerfile multi-stage. Deploy em Kubernetes com probes e HPA. Load test com k6. GraalVM native opcional.
        </p>
      </Section>

      <Section title="Stack e entregáveis" accent={accent}>
        <CodeBlock lang="bash">{`orders-service/
├── pom.xml                       # Spring Boot 3.3, Java 21
├── src/main/java/com/ffv/
│   ├── OrdersApp.java            # @SpringBootApplication + virtual thread
│   ├── order/
│   │   ├── Order.java            # @Entity
│   │   ├── OrderDto.java         # record
│   │   ├── OrderRepository.java  # JpaRepository + @EntityGraph
│   │   └── OrderController.java
│   └── config/
│       ├── VirtualThreadConfig.java
│       └── OpenApiConfig.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/V1__init.sql # Flyway
├── src/test/java/
│   ├── OrderControllerIT.java    # Testcontainers + MockMvc
│   └── OrderRepositoryIT.java
├── Dockerfile                    # multi-stage, distroless
├── k8s/
│   ├── deployment.yaml           # probes, resources, HPA
│   ├── service.yaml
│   └── servicemonitor.yaml       # Prometheus scrape
└── loadtest/
    └── orders.js                 # k6 script`}</CodeBlock>
      </Section>

      <Section title="Teste de integração que vale ouro" accent={accent}>
        <CodeBlock lang="java">{`@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
class OrderControllerIT {

    @Container
    static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", pg::getJdbcUrl);
        r.add("spring.datasource.username", pg::getUsername);
        r.add("spring.datasource.password", pg::getPassword);
    }

    @Autowired MockMvc mvc;

    @Test
    void createAndFetchOrder() throws Exception {
        var body = "{\\"customerId\\":\\"c1\\",\\"total\\":99.90}";
        var resp = mvc.perform(post("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        var id = JsonPath.read(resp, "$.id");
        mvc.perform(get("/api/v1/orders/" + id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(99.90));
    }
}`}</CodeBlock>
      </Section>

      <Section title="Dockerfile production" accent={accent}>
        <CodeBlock lang="bash">{`# syntax=docker/dockerfile:1.7
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY . .
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /src/target/orders-service-*.jar /app/app.jar
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:+UseG1GC -XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["java","-jar","/app/app.jar"]`}</CodeBlock>
      </Section>

      <Section title="k8s deployment com probes" accent={accent}>
        <CodeBlock lang="bash">{`apiVersion: apps/v1
kind: Deployment
metadata: { text: orders }
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: ghcr.io/ffv/orders:v1.0.0
        resources:
          requests: { cpu: 500m, memory: 512Mi }
          limits:   { cpu: "2",  memory: 1Gi }
        readinessProbe:
          httpGet: { path: /actuator/health/readiness, port: 9090 }
          periodSeconds: 5
        livenessProbe:
          httpGet: { path: /actuator/health/liveness, port: 9090 }
          periodSeconds: 10`}</CodeBlock>
      </Section>

      <Section title="Entregáveis finais" accent={accent}>
        <Callout tone="success" icon="✅">
          Repo público com README explicando decisões (virtual thread sim, EntityGraph onde, por que G1). CI (GitHub Actions) verde: build + test + container push. Screenshot do dashboard Grafana com p99, throughput e GC pause. Resultado de k6 mostrando holding 500 rps sem error budget violado. Esse é o nível que convence recrutador sênior.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
