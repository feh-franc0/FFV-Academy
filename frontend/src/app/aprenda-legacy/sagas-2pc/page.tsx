import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  NodeGraph,
  StackFlow,
  InlineCode,
} from '@/components/article/primitives';

const ACCENT = '#f78166';

export const metadata = getModuleMetadata('sagas-2pc');

const quiz = [
  {
    question:
      'O problema fundamental do Two-Phase Commit (2PC) é:',
    options: [
      'Complexidade de implementação',
      'Blocking: se o coordinator cair entre prepare e commit, participants ficam com locks segurados esperando indefinidamente',
      'Custo de licença (só bancos comerciais suportam)',
      'Não funciona em redes WAN',
    ],
    correct: 1,
    explanation:
      'A crítica canônica ao 2PC é que é um "blocking protocol": participants votam "prepared" e seguram locks. Se o coordinator crasha antes do commit/abort, os participants não podem decidir sozinhos — ficam com locks presos, segurando linhas, matando throughput. 3PC mitiga parcialmente mas é complexo. Sagas assumem failures e usam compensações.',
  },
  {
    question:
      'Qual é a diferença principal entre Saga Orchestration e Saga Choreography?',
    options: [
      'Orchestration usa REST, Choreography usa gRPC',
      'Orchestration tem um coordinator central que comanda os steps; Choreography usa eventos e cada serviço reage autonomamente',
      'Orchestration é sempre síncrona; Choreography é sempre assíncrona',
      'Choreography é mais rápido que Orchestration',
    ],
    correct: 1,
    explanation:
      'Orchestration = orquestrador central (state machine) comanda cada step e chama compensações. Choreography = cada serviço reage a eventos e publica os próximos. Orchestration é mais explícito e fácil de debugar; Choreography é mais desacoplado mas pode virar "spaghetti de eventos" rápido.',
  },
  {
    question:
      'Uma compensating action precisa ser:',
    options: [
      'Atômica e síncrona',
      'Idempotente e semanticamente reversível (não precisa ser rollback exato)',
      'Executada no mesmo serviço que a ação original',
      'Mais rápida que a ação original',
    ],
    correct: 1,
    explanation:
      'Compensações em Saga são semanticamente reversíveis, não um rollback transacional. "Reembolsar pagamento" compensa "cobrar cartão" — não é um "undo" literal, é uma operação de negócio nova. E precisa ser idempotente porque o orchestrator pode retriar. "Enviar email de desculpas" pode ser parte da compensação — não existe "des-enviar email".',
  },
  {
    question:
      'Qual dessas situações PEDE Saga ao invés de 2PC?',
    options: [
      'Transação entre 2 tabelas no mesmo banco',
      'Workflow de pedido: reserva estoque (microserviço A) + cobra cartão (B) + agenda entrega (C)',
      'UPDATE atômico numa única conta bancária',
      'Inserção em tabela de logs',
    ],
    correct: 1,
    explanation:
      'Sagas brilham em workflows longos (minutos a dias) atravessando múltiplos serviços com ACIDs independentes. 2PC exige que todos os participants suportem 2PC, e trava locks durante tudo — insustentável em workflows longos. Transações locais (mesmo banco) ficam com ACID normal; não são um problema distribuído.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sagas-2pc"
      title="Sagas vs 2PC: transações distribuídas sem perder o sono"
      icon="🪢"
      xp={85}
      readTime={17}
      trailName="Sistemas Distribuídos"
      trailColor={ACCENT}
      nextSlug="event-sourcing-cqrs"
      nextTitle="Event Sourcing e CQRS: quando eventos são a fonte da verdade"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Você tem um microserviço de pedidos, um de pagamento, um de estoque. Um pedido precisa:
        reservar estoque, cobrar o cartão, agendar entrega. Se qualquer um falha, você precisa
        <strong> desfazer o que foi feito</strong>. Mas cada serviço tem seu próprio banco —
        não existe <InlineCode>BEGIN TRANSACTION</InlineCode> global. O que fazer?
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Duas respostas sérias: <strong>Two-Phase Commit (2PC)</strong>, a solução clássica
        (e bloqueante), e <strong>Sagas</strong>, a solução moderna baseada em compensações.
        Este módulo explica as duas, quando cada uma faz sentido, e como implementar Sagas
        corretamente com orchestration, choreography e o outbox pattern.
      </p>

      <Section title="Por que transações distribuídas são difíceis" accent={ACCENT}>
        <p>
          Numa tabela única, o banco te dá ACID de graça. Atomicidade, consistência,
          isolamento, durabilidade — tudo garantido. Em sistemas distribuídos com vários serviços
          independentes, você perde:
        </p>
        <ComparisonTable
          headers={['Propriedade', 'Monolito/Single DB', 'Microserviços/Multi DB']}
          rows={[
            ['Atomicidade', 'BEGIN/COMMIT do banco', 'Precisa coordenar múltiplos commits'],
            ['Isolamento', 'Locks locais + MVCC', 'Não existe — cada banco só vê o próprio'],
            ['Consistência global', 'Constraints + FKs', 'Impossível; precisa de eventual consistency'],
            ['Durabilidade', 'WAL + fsync', 'Por banco; o problema é orquestração'],
          ]}
        />
        <p>
          O desafio real não é só técnico — é de <em>semântica de negócio</em>. Se "cobrar cartão"
          funciona mas "agendar entrega" falha, você <strong>precisa</strong> reembolsar. Isso
          não é infraestrutura, é fluxo de negócio que precisa ser codificado.
        </p>
      </Section>

      <Section title="Two-Phase Commit (2PC)" accent={ACCENT}>
        <p>
          2PC é o protocolo clássico, usado por XA (X/Open), bancos Oracle/SQL Server com DTC,
          JTA em Java. Dois papéis: <strong>coordinator</strong> e <strong>participants</strong>.
        </p>
        <NodeGraph
          columns={[
            {
              label: 'Coordinator',
              nodes: [
                { label: 'COORDINATOR', sub: 'gerencia o protocolo' },
              ],
            },
            {
              label: 'Participants',
              nodes: [
                { label: 'Payment DB', sub: 'participant' },
                { label: 'Order DB', sub: 'participant' },
                { label: 'Stock DB', sub: 'participant' },
              ],
            },
            {
              label: 'Fases',
              nodes: [
                { label: 'Fase 1: PREPARE', sub: '"Podem commitar?" → executam local, seguram locks, respondem YES/NO' },
                { label: 'Fase 2: COMMIT/ABORT', sub: 'todos YES → commit · qualquer NO → abort · soltam locks' },
              ],
            },
          ]}
        />

        <p><strong>Problemas do 2PC em sistemas modernos</strong>:</p>
        <ComparisonTable
          headers={['Problema', 'Impacto']}
          rows={[
            [
              'Blocking protocol',
              'Se coordinator cair entre prepare e commit, participants ficam com locks presos. Não podem decidir sozinhos.',
            ],
            [
              'Locks durante a janela',
              'Em transações longas, locks mantidos bloqueiam outras transações — throughput morre.',
            ],
            [
              'Exige 2PC em TODOS participants',
              'Kafka, MongoDB, Redis, REST APIs não suportam. 2PC só roda em bancos XA-compliant.',
            ],
            [
              'Performance em WAN',
              'Duas rodadas de mensagens + fsync. Latência cresce com a pior latência do participant.',
            ],
            [
              'Complexidade operacional',
              'Coordinator requer recovery log próprio, failover, monitoring. Grande fonte de dor.',
            ],
          ]}
        />

        <Callout tone="warn">
          <strong>3PC (Three-Phase Commit)</strong> adiciona uma fase "pre-commit" pra mitigar o
          blocking. Ainda é vulnerável a partições de rede, quase ninguém implementa em produção.
          Na prática, sistemas que precisam de 2PC em 2026 são minoria absoluta (bancos legacy,
          mainframe). Todo o mundo greenfield foi pra Sagas.
        </Callout>
      </Section>

      <Section title="Saga Pattern: compensações &gt; 2PC" accent={ACCENT}>
        <p>
          Saga foi proposto em 1987 (Garcia-Molina &amp; Salem) originalmente como otimização
          pra transações longas em banco único. Renasceu com microserviços como o padrão
          dominante. A ideia central:
        </p>
        <Callout tone="info">
          <strong>Saga</strong>: uma transação distribuída é uma sequência de transações locais
          (uma por serviço). Se alguma falha, o sistema executa <strong>compensações</strong>
          em ordem inversa pra desfazer efeitos já aplicados.
        </Callout>

        <p>Em vez de locks globais, você aceita que os dados <em>temporariamente inconsistentes</em> e desfaz
        com ações compensatórias. Não é rollback — é uma <em>nova operação</em> que anula a anterior.</p>

        <StackFlow
          items={[
            { label: '1. Reservar estoque ✓', sub: '' },
            { label: '2. Cobrar cartão ✓', sub: '' },
            { label: '3. Agendar entrega — falha ✗', sub: 'inicia compensação em ordem inversa' },
            { label: "2'. Reembolsar cartão ✓", sub: 'compensação do step 2' },
            { label: "1'. Liberar estoque ✓", sub: 'compensação do step 1 → pedido cancelado, sistema consistente' },
          ]}
        />

        <Callout tone="warn">
          <strong>Cuidado</strong>: a Saga <em>não</em> é ACID. Durante a saga, outras operações
          podem ver estados intermediários (ex: dinheiro já debitado mas pedido cancelado
          100ms depois). O termo é <em>semantic consistency</em> — você garante consistência
          eventual com regras de negócio, não isolamento estrito.
        </Callout>
      </Section>

      <Section title="Orchestration: o coordinator explícito" accent={ACCENT}>
        <p>
          Um serviço central (o <strong>orchestrator</strong>) conhece o workflow completo
          e comanda cada step explicitamente. É uma state machine.
        </p>
        <NodeGraph
          columns={[
            {
              label: 'Orchestrator',
              nodes: [
                { label: 'Order Saga Orchestrator', sub: 'state machine + persist' },
              ],
            },
            {
              label: 'Serviços',
              nodes: [
                { label: 'Stock Service', sub: 'reserve / release' },
                { label: 'Payment Service', sub: 'charge / refund' },
                { label: 'Shipping Service', sub: 'schedule' },
              ],
            },
            {
              label: 'Fluxo (falha no shipping)',
              nodes: [
                { label: 'Stock.reserve → ok', sub: '' },
                { label: 'Payment.charge → ok', sub: '' },
                { label: 'Shipping.schedule → FALHA', sub: 'Payment.refund + Stock.release → saga FAILED' },
              ],
            },
          ]}
        />

        <p><strong>Implementação com Temporal (workflow engine)</strong>:</p>
        <CodeBlock lang="python">{`# order_saga_workflow.py — orchestration com Temporal (temporal.io)
from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy

@workflow.defn
class OrderSagaWorkflow:
    @workflow.run
    async def run(self, order: dict) -> dict:
        # Passo 1: reservar estoque
        reservation_id = await workflow.execute_activity(
            stock_reserve, order, start_to_close_timeout=timedelta(seconds=30),
            retry_policy=RetryPolicy(maximum_attempts=5),
        )
        try:
            # Passo 2: cobrar cartão
            charge_id = await workflow.execute_activity(
                payment_charge, order, start_to_close_timeout=timedelta(seconds=30),
            )
            try:
                # Passo 3: agendar entrega
                shipment_id = await workflow.execute_activity(
                    shipping_schedule, order, start_to_close_timeout=timedelta(seconds=30),
                )
                return {"status": "ok", "order_id": order["id"]}
            except Exception as e:
                # compensa: reembolsar cartão
                await workflow.execute_activity(
                    payment_refund, charge_id,
                    start_to_close_timeout=timedelta(seconds=60),
                    retry_policy=RetryPolicy(maximum_attempts=10),  # crítico, retria muito
                )
                raise
        except Exception as e:
            # compensa: liberar estoque
            await workflow.execute_activity(
                stock_release, reservation_id,
                start_to_close_timeout=timedelta(seconds=60),
            )
            raise`}</CodeBlock>

        <Callout tone="info">
          <strong>Por que Temporal/Cadence e não orchestrator próprio?</strong> Workflow engines
          persistem o estado <em>após cada step</em> automaticamente. Se o processo crashar,
          na próxima boot o workflow retoma do último step confirmado. Implementar isso na
          mão é um projeto de 6 meses. Alternativas: AWS Step Functions, Camunda Zeebe, Netflix Conductor,
          Uber Cadence, dbos-inc.
        </Callout>
      </Section>

      <Section title="Choreography: eventos puros, sem orquestrador" accent={ACCENT}>
        <p>
          Cada serviço publica um evento após concluir sua parte. Outros serviços escutam
          e reagem. Não há um coordinator central — a "lógica do workflow" está distribuída.
        </p>
        <NodeGraph
          columns={[
            {
              label: 'Produtor',
              nodes: [
                { label: 'Order API', sub: 'publica OrderCreated → Kafka' },
              ],
            },
            {
              label: 'Consumidores (reagem a eventos)',
              nodes: [
                { label: 'Stock Service', sub: 'on(OrderCreated) → reserve → publica StockReserved' },
                { label: 'Payment Service', sub: 'on(StockReserved) → charge → publica PaymentSucceeded' },
                { label: 'Shipping Service', sub: 'on(PaymentOK) → schedule → publica ShipmentScheduled' },
              ],
            },
            {
              label: 'Compensação (se Payment falhar)',
              nodes: [
                { label: 'publica PaymentFailed', sub: '' },
                { label: 'Stock Service on(PaymentFailed)', sub: 'release reservation' },
                { label: 'Order Service on(PaymentFailed)', sub: 'mark order FAILED' },
              ],
            },
          ]}
        />

        <ComparisonTable
          headers={['Aspecto', 'Orchestration', 'Choreography']}
          rows={[
            ['Acoplamento', 'Orchestrator conhece todos', 'Serviços desacoplados via eventos'],
            ['Visibilidade do workflow', 'Alta (state machine explícita)', 'Baixa — lógica espalhada em N listeners'],
            ['Adicionar novo step', 'Altera o orchestrator', 'Adiciona novo listener, talvez publica evento novo'],
            ['Debug', 'Trace do orchestrator', 'Pesadelo — precisa de distributed tracing forte'],
            ['Performance', 'Latência = soma dos passos', 'Geralmente paralelo, pode ser mais rápido'],
            ['Risco', 'SPOF no orchestrator (mitigado com HA)', '"Spaghetti de eventos" conforme cresce'],
            ['Quando usa', 'Workflows complexos, multi-step', 'Fluxos simples, baixo acoplamento'],
          ]}
        />

        <Callout tone="warn">
          <strong>Regra prática</strong>: comece com Orchestration. É mais fácil de debugar e evoluir.
          Vá pra Choreography quando tem um fluxo claramente desacoplado e simples, ou quando
          o orchestrator virou gargalo. Muitos sistemas misturam os dois (orchestration no fluxo principal,
          choreography pra side effects como analytics/notificações).
        </Callout>
      </Section>

      <Section title="Compensating actions: o que é e o que não é" accent={ACCENT}>
        <p>
          Compensação ≠ rollback. É uma <em>nova operação</em> que anula o efeito visível da anterior,
          mas pode deixar rastros auditáveis.
        </p>
        <ComparisonTable
          headers={['Ação original', 'Compensação adequada', 'Nota']}
          rows={[
            ['Reservar estoque (INSERT)', 'Liberar reserva (DELETE ou UPDATE status=released)', 'Simples'],
            ['Cobrar cartão (charge)', 'Reembolsar (refund)', 'Cria TX nova no gateway — auditável'],
            ['Agendar entrega', 'Cancelar entrega + talvez notificar motorista', 'Se já despachou, compensação vira "recall"'],
            ['Enviar email ao cliente', '(não-compensável: enviar email corrigido)', 'Texto: "desconsidere a mensagem anterior"'],
            ['Gerar nota fiscal', 'Emitir nota de cancelamento', 'Fiscalmente relevante — não apague o original'],
          ]}
        />

        <Callout tone="danger">
          <strong>3 regras de ouro pra compensação</strong>:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Idempotente</strong>: o orchestrator pode retriar a compensação se cair no meio. Chamar 5 vezes → mesmo efeito final.</li>
            <li><strong>Commutativa no worst case</strong>: idealmente, ordem de compensações não importa (nem sempre possível).</li>
            <li><strong>Sempre publicada</strong>: logs + eventos de compensação pra auditoria. Nunca "apaga" silenciosamente.</li>
          </ul>
        </Callout>
      </Section>

      <Section title="Tratando o worst case: semantic lock + pivot transaction" accent={ACCENT}>
        <p>
          Alguns sagas têm um ponto de <strong>não-retorno</strong>: operações que se foram, foram.
          Ex: "despachar container pro navio". Padrões:
        </p>
        <ComparisonTable
          headers={['Padrão', 'Uso']}
          rows={[
            [
              'Semantic lock',
              'Marca o registro como "pendente" (não-cancelável). Outras operações veem o lock e respeitam. Saga libera no final.',
            ],
            [
              'Pivot transaction',
              'A última transação "cara" da saga. A partir dela, sem retorno. Antes dela, cancela fácil.',
            ],
            [
              'Compensable transactions',
              'Steps que podem ser compensados sem perda (reserva, hold).',
            ],
            [
              'Retriable transactions',
              'Steps após o pivot que precisam eventualmente acontecer (retry com backoff até sucesso).',
            ],
          ]}
        />

        <StackFlow
          items={[
            { label: '[C] Reservar estoque', sub: 'compensable — pode liberar' },
            { label: '[C] Cobrar cartão', sub: 'compensable — pode reembolsar' },
            { label: '─── PIVOT ───', sub: 'ponto de não-retorno' },
            { label: '[P] Despachar pro carrier', sub: 'pivot: depois daqui, sem retorno · se falhar: compensa os [C]s anteriores' },
            { label: '[R] Gerar nota fiscal', sub: 'retriable — precisa acontecer sempre' },
            { label: '[R] Notificar cliente', sub: 'retriable — retria infinitamente se falhar (pedido já foi)' },
          ]}
        />
      </Section>

      <Section title="Outbox pattern: garantindo que eventos saem" accent={ACCENT}>
        <p>
          Num saga de choreography (ou orchestration com eventos), o <strong>outbox pattern</strong>
          garante que a operação local e o evento são atômicos:
        </p>
        <CodeBlock lang="python">{`# order_service.py — outbox garantindo atomicidade
async def create_order(data: dict) -> dict:
    async with db.begin() as tx:
        # 1. Inserir pedido na tabela de domínio
        order = await tx.execute(
            text("INSERT INTO orders (...) VALUES (...) RETURNING *"),
            data,
        )
        order_row = order.one()

        # 2. Inserir evento na outbox — MESMA transação
        await tx.execute(
            text("""
                INSERT INTO outbox (aggregate_id, event_type, payload, created_at)
                VALUES (:id, 'OrderCreated', :payload, NOW())
            """),
            {"id": order_row.id, "payload": json.dumps(data)},
        )
        # commit = ambos salvos ou nenhum

    return {"id": order_row.id}


# relay.py — worker separado publicando
async def relay_loop():
    while True:
        async with db.begin() as tx:
            rows = await tx.execute(text("""
                SELECT id, event_type, payload FROM outbox
                WHERE sent_at IS NULL
                ORDER BY id
                LIMIT 100
                FOR UPDATE SKIP LOCKED
            """))
            events = rows.fetchall()
            for e in events:
                await kafka.publish(topic="orders", key=str(e.id), value=e.payload)
                await tx.execute(
                    text("UPDATE outbox SET sent_at = NOW() WHERE id = :id"),
                    {"id": e.id},
                )
        await asyncio.sleep(0.1)`}</CodeBlock>

        <p>
          Alternativa mais escalável: <strong>CDC (Change Data Capture)</strong> com Debezium
          lendo o WAL do Postgres. Zero polling, latência baixa. Mas acopla pipeline à schema da tabela.
        </p>
      </Section>

      <Section title="Decisões reais" accent={ACCENT}>
        <DecisionBox
          scenario="Workflow de checkout e-commerce com 4-5 serviços, sub-segundo"
          winner="Saga Orchestration com Temporal ou Step Functions"
          winnerColor={ACCENT}
          why="Você precisa de visibilidade (qual step falhou?), retries configuráveis por step, e evolução de workflow (adicionar passo = editar state machine). Temporal ou Step Functions te dão isso out-of-the-box. 2PC não serve porque seus serviços não são XA-compliant, e escalar travas globais mataria o throughput."
          alternatives={[
            { label: 'Saga Choreography', note: 'Se o fluxo é simples e desacoplado. Vira complexo rápido.' },
            { label: '2PC com XA', note: 'Só se você já tem Oracle/SQL Server + bancos XA — hoje é raro.' },
          ]}
        />
        <DecisionBox
          scenario="Fluxo longo: onboarding de cliente B2B (dias, 10+ steps, aprovações humanas)"
          winner="Saga Orchestration com Temporal (ou Camunda pra BPM humano)"
          winnerColor={ACCENT}
          why="Workflows longos com espera por humanos, timeouts de dias, retries caso backoffice demore — Temporal foi literalmente feito pra isso. Camunda BPM é melhor se você quer visualização BPMN pra stakeholders não-técnicos."
          alternatives={[
            { label: 'Cron jobs + status polling', note: 'Funciona em fluxos triviais; vira inferno com 10 steps.' },
            { label: 'AWS Step Functions', note: 'Boa opção se já usa AWS e fluxo é visual.' },
          ]}
        />
        <DecisionBox
          scenario="Microserviços pequenos com eventos simples, sem dependências complexas"
          winner="Choreography com Kafka/EventBridge + outbox pattern"
          winnerColor={ACCENT}
          why="Se seu workflow é <5 steps e você não precisa de visibilidade centralizada, choreography é mais barato e desacoplado. Cada serviço reage a eventos via consumer group. Cuidado pra não virar spaghetti conforme cresce — considere Orchestration antes do segundo cruzamento de eventos."
          alternatives={[
            { label: 'Orchestration', note: 'Quando o workflow passa de 5 steps ou você perde visibilidade.' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <div className="flex flex-col gap-4">
          <div>
            <p><strong>Sagas substituem ACID?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Não. Sagas dão <em>semantic consistency</em> (eventual), não ACID strict. Durante
              a saga, outras queries podem ver estado intermediário inconsistente. Se a sua
              lógica de negócio exige isolamento estrito, Saga não é a resposta — repense o design
              (talvez um serviço só).
            </p>
          </div>
          <div>
            <p><strong>Como testar Sagas?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Testes determinísticos: Temporal tem replay de workflow. Testes de caos: force
              cada step a falhar em todos os pontos possíveis, verifique que compensações rodam.
              Falha mid-compensation também — seu orchestrator deve retomar após crash.
            </p>
          </div>
          <div>
            <p><strong>O que é "Saga inválida"?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Quando uma compensação falha e não pode ser resolvida (ex: cliente deletou conta antes
              do reembolso processar). Nesses casos, você entra em <em>modo manual</em>: alerta pra
              operador, deadletter queue, compensação humana. Design pra isso acontecer.
            </p>
          </div>
          <div>
            <p><strong>Múltiplas sagas ao mesmo tempo no mesmo registro — race condition?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Possível. Solução: optimistic locking (version column + CAS) no agregado. Se duas
              sagas tentam modificar a mesma reserva, a segunda falha e retria (ou compensa).
            </p>
          </div>
          <div>
            <p><strong>Kafka Transactions são 2PC disfarçado?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Kinda. Kafka EOS usa transactional producer com 2PC entre produtor e broker.
              É 2PC dentro do Kafka, mas não te ajuda em sagas que atravessam DB + Kafka — pra
              isso precisa de outbox.
            </p>
          </div>
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways</strong>:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>2PC</strong> é ACID distribuído, mas é <em>blocking</em> e exige participants XA-compliant. Raro em microserviços modernos.</li>
          <li><strong>Saga</strong> = sequência de transações locais + compensações. Sem locks globais, mas só <em>semantic consistency</em>.</li>
          <li><strong>Orchestration</strong>: central, explícito, fácil de debugar. Use Temporal/Step Functions/Camunda.</li>
          <li><strong>Choreography</strong>: eventos, desacoplado, fácil de virar spaghetti. Comece com Orchestration por default.</li>
          <li>Compensações são <em>novas operações</em>, não rollback. Sempre idempotentes, auditáveis.</li>
          <li>Identifique o <strong>pivot transaction</strong>: depois dela, sem retorno — steps posteriores são retriable infinitamente.</li>
          <li><strong>Outbox pattern</strong> é a cola: garante que domain write + evento sejam atômicos.</li>
        </ul>
      </Callout>

      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Próximo módulo: e se os <em>eventos</em> forem a fonte da verdade? Event Sourcing e CQRS.
      </p>
    </div>
  );
}
