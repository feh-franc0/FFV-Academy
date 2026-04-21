import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('reactive-vs-virtual-threads');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual era o argumento principal pro reativo pré-Loom?',
    options: [
      'Código mais limpo',
      'Eficiência de I/O: evitar bloquear 1 platform thread por request liberava RAM e permitia 10k+ conexões — virtual thread entregou o mesmo benefício sem callback chain',
      'Melhor tipagem',
      'Mais fácil de debugar',
    ],
    correct: 1,
    explanation: 'O único motivo sério para adotar WebFlux em 2019 era throughput I/O com poucas threads. Em 2026, virtual thread dá o mesmo benefício e mantém código síncrono, try/finally, stack trace e debugger normais. A justificativa de eficiência caiu.',
  },
  {
    question: 'O que Reactor ainda faz melhor?',
    options: [
      'CRUD',
      'Streaming composto com backpressure, windowing, merge/flatMap de fontes assíncronas e agregação em tempo real — operadores tratam isso de forma declarativa',
      'Retry simples',
      'Logging',
    ],
    correct: 1,
    explanation: 'Virtual thread substitui "muitos requests concorrentes". Não substitui pipeline de evento: Flux.merge(stream1, stream2).window(Duration.ofSeconds(5)).flatMap(...). Para isso, o modelo reativo continua mais claro e performático.',
  },
  {
    question: 'Como decidir na prática?',
    options: [
      'Chutar',
      'Request/response CRUD e RPC → virtual thread + Spring MVC. Stream de eventos, SSE, agregação contínua → Reactor. Nunca misture os dois modelos em um mesmo controller',
      'Sempre reativo',
      'Sempre bloqueante',
    ],
    correct: 1,
    explanation: 'A decisão é por endpoint, não por serviço. Um serviço pode ter MVC para 90% dos endpoints e 1 Flux<ServerSentEvent> para um stream. O anti-padrão é misturar Mono/Flux com Thread.sleep ou JDBC bloqueante no mesmo método.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="reactive-vs-virtual-threads"
      title="Reactive (Reactor) vs Virtual Threads: qual escolher"
      icon="🔄"
      xp={55}
      readTime={13}
      trailName="Java Moderno (17/21 LTS)"
      trailColor={accent}
      nextSlug="micronaut-quarkus-moderno"
      nextTitle="Micronaut e Quarkus: alternativas modernas"
      quiz={quiz}
    >
      <Section title="O contexto mudou em 2023" accent={accent}>
        <p>
          Durante quase uma década reativo foi sinônimo de "Java moderno e eficiente". Quando virtual thread virou final em Java 21, a equação mudou: você recupera eficiência de I/O sem pagar o custo cognitivo de callback chain. O debate virou pragmático, não ideológico.
        </p>
      </Section>

      <Section title="Mesmo problema, duas soluções" accent={accent}>
        <CodeBlock lang="java">{`// Reactive (Spring WebFlux)
@GetMapping("/users/{id}")
Mono<UserDto> get(@PathVariable UUID id) {
    return userRepo.findById(id)
        .zipWith(orderRepo.countByUser(id))
        .map(t -> new UserDto(t.getT1(), t.getT2()));
}

// Virtual thread (Spring MVC)
@GetMapping("/users/{id}")
UserDto get(@PathVariable UUID id) {
    var user   = userRepo.findById(id).orElseThrow();
    var orders = orderRepo.countByUser(id);
    return new UserDto(user, orders);
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          O segundo tem stack trace legível, funciona com debugger step-over, try/finally direto e JDBC normal. Mesmo throughput em I/O-bound.
        </Callout>
      </Section>

      <Section title="Onde Reactor continua ganhando" accent={accent}>
        <CodeBlock lang="java">{`Flux<Event> combined = Flux.merge(kafka1, kafka2, websocket)
    .window(Duration.ofSeconds(5))
    .flatMap(window -> window.reduce(Stats::merge))
    .onBackpressureBuffer(10_000, BufferOverflowStrategy.DROP_OLDEST);`}</CodeBlock>
        <p>
          Backpressure explícito, operadores compostos e janela temporal — cada um desses seria dezenas de linhas de código imperativo. Em pipeline de evento, reativo continua idiomático.
        </p>
      </Section>

      <Section title="Tabela mental de decisão" accent={accent}>
        <CodeBlock lang="bash">{`# Virtual thread (MVC)
- CRUD via JDBC/JPA
- RPC para outros serviços
- Fan-out simples de 2-5 chamadas
- Código novo em greenfield

# Reactor (WebFlux)
- Stream de eventos (Kafka, SSE, WS)
- Transformação composta com merge/flatMap
- Backpressure crítico
- Base de código já 100% reativa

# Nunca misture
- JDBC bloqueante dentro de Mono/Flux
- Thread.sleep em fluxo reativo
- .block() em endpoint WebFlux`}</CodeBlock>
      </Section>

      <Section title="Migração prática de reativo para virtual thread" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Não migre de atacado. Escolha um serviço novo ou um refactor localizado. Reescrever WebFlux para MVC num código maduro costuma introduzir regressões de timeout e cancelamento — o ganho em legibilidade vale para greenfield, não para re-escrita oportunista.
        </Callout>
      </Section>

      <Section title="Posição de 2026" accent={accent}>
        <Callout tone="success" icon="✅">
          Default novo: Spring MVC + virtual thread + JDBC. Reactor entra quando a demanda é pipeline de evento real. Isso cobre 85–90% dos backends e devolve ao Java a clareza que ele tinha antes do hype reativo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
