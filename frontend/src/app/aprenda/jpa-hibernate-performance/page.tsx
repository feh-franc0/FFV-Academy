import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('jpa-hibernate-performance');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a forma mais barata de diagnosticar N+1 em produção?',
    options: [
      'Ler o código',
      'Ligar hibernate.generate_statistics + logs de datasource-proxy/p6spy: você vê 1 + N consultas e stack trace da origem — depois decide entre @EntityGraph, JOIN FETCH ou projection',
      'Rodar JMH',
      'Trocar de ORM',
    ],
    correct: 1,
    explanation: 'N+1 só aparece em load. Ferramentas como datasource-proxy, p6spy ou hibernate-statistics contam queries por request e apontam o método que originou. Sem medir, você adivinha. Depois de localizado: @EntityGraph em caminho único, JOIN FETCH em consulta específica, ou projection DTO se não precisa da entidade.',
  },
  {
    question: 'Por que lazy é default e eager é quase sempre errado?',
    options: [
      'Eager é mais rápido',
      'Eager carrega grafos inteiros em cada acesso e explode memória + N+1; lazy deixa o caso de uso decidir o que carregar via EntityGraph ou fetch join onde realmente precisa',
      'Eager é obrigatório em @ManyToOne',
      'Lazy é deprecated',
    ],
    correct: 1,
    explanation: 'Eager transforma todo findById num JOIN monstruoso. Lazy mantém baseline enxuto e força o autor a declarar explicitamente o grafo necessário. Regra: @ManyToOne(fetch = LAZY) e @OneToMany(fetch = LAZY) sempre. Se precisar do filho em consulta específica, use EntityGraph ou fetch join local.',
  },
  {
    question: 'Quando jOOQ bate Hibernate?',
    options: [
      'Nunca',
      'Relatórios, agregações, joins complexos e bulk update — onde você pensa em SQL, não em objeto, e quer type-safety de colunas sem hidratação de entidade',
      'Em CRUD trivial',
      'Em transações curtas',
    ],
    correct: 1,
    explanation: 'Hibernate é excelente para CRUD com agregados de domínio. jOOQ brilha quando a query é o centro: relatório com CASE WHEN, window function, UPSERT. Gera código a partir do schema e dá autocomplete de coluna. Time maduro usa os dois: Hibernate em escrita de agregado, jOOQ em leitura analítica.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="jpa-hibernate-performance"
      title="JPA/Hibernate: performance e armadilhas"
      icon="🗄️"
      xp={55}
      readTime={13}
      trailName="Java Moderno (17/21 LTS)"
      trailColor={accent}
      nextSlug="reactive-vs-virtual-threads"
      nextTitle="Reactive (Reactor) vs Virtual Threads: qual escolher"
      quiz={quiz}
    >
      <Section title="O custo real do ORM" accent={accent}>
        <p>
          JPA não é lento por natureza. Quem é lento é código que ignora como o ORM gera SQL. N+1, fetch agressivo, open-session-in-view e cache mal configurado respondem por 80% dos incidentes de latência em serviços Java. A boa notícia: todos têm solução mecânica.
        </p>
      </Section>

      <Section title="N+1 em ação" accent={accent}>
        <CodeBlock lang="java">{`// Ruim: 1 query pra listar + N queries pra cada items()
List<Order> orders = orderRepo.findAllByUserId(userId);
for (Order o : orders) {
    log.info("order " + o.id() + " tem " + o.items().size() + " itens");
}`}</CodeBlock>
        <CodeBlock lang="java">{`// Bom: EntityGraph carrega items em 1 JOIN
@EntityGraph(attributePaths = {"items"})
List<Order> findAllByUserId(UUID userId);

// Ou JOIN FETCH pontual em consulta específica
@Query("select o from Order o join fetch o.items where o.user.id = :uid")
List<Order> findWithItems(UUID uid);`}</CodeBlock>
      </Section>

      <Section title="Projection DTO quando não precisa da entidade" accent={accent}>
        <CodeBlock lang="java">{`public record OrderSummary(UUID id, String status, BigDecimal total) {}

@Query("""
    select new com.ffv.OrderSummary(o.id, o.status, sum(i.price * i.qty))
    from Order o join o.items i
    where o.user.id = :uid
    group by o.id, o.status
""")
List<OrderSummary> summariesByUser(UUID uid);`}</CodeBlock>
        <p>DTO projection pula hidratação de entidade, cache de primeiro nível e managed state — consulta de listagem fica 3–10x mais rápida.</p>
      </Section>

      <Section title="Batch write + generate_statistics" accent={accent}>
        <CodeBlock lang="bash">{`spring:
  jpa:
    properties:
      hibernate:
        generate_statistics: true
        jdbc.batch_size: 50
        order_inserts: true
        order_updates: true`}</CodeBlock>
        <Callout tone="info" icon="💡">
          batch_size agrupa INSERTs em uma round-trip ao banco. order_inserts permite o agrupamento real. Mede com statistics antes e depois — bulk de 10k linhas cai de 10 s para 300 ms.
        </Callout>
      </Section>

      <Section title="jOOQ como complemento" accent={accent}>
        <CodeBlock lang="java">{`var totals = dsl
    .select(ORDERS.STATUS, sum(ORDER_ITEMS.PRICE.mul(ORDER_ITEMS.QTY)).as("revenue"))
    .from(ORDERS)
    .join(ORDER_ITEMS).on(ORDER_ITEMS.ORDER_ID.eq(ORDERS.ID))
    .where(ORDERS.CREATED_AT.greaterOrEqual(since))
    .groupBy(ORDERS.STATUS)
    .fetch();`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Hibernate para agregado transacional, jOOQ para leitura analítica. Zero vergonha em misturar — 2026 já tratou isso como maduro.
        </Callout>
      </Section>

      <Section title="Regras de bolso" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          open-in-view=false. fetch=LAZY sempre. Sem @Transactional em controller. Sem Entity em camada web (DTO sempre). Habilitar statistics em staging para detectar N+1 antes do cliente.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
