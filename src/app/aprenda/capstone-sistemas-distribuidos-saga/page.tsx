import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, DecisionBox, FlowDiagram } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-sistemas-distribuidos-saga');
const accent = '#6366f1';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que 2PC (two-phase commit) não escala em microservices?',
    options: [
      'É antigo',
      'Coordinator bloqueia todos os participantes durante prepare. Se coordinator cair após prepare mas antes de commit, participantes ficam presos (locks segurados). Latência = p99 do mais lento. Inviável em cross-region e serviços independentes',
      'Não é ACID',
      'Requer NoSQL',
    ],
    correct: 1,
    explanation: '2PC tem blocking problem: após prepare, participante deve segurar locks até receber commit/abort do coordinator. Se coordinator falha, participante fica incerto — só desbloqueia com intervenção manual. Em microservices independentes com diferentes times e SLOs, isso é inaceitável. Saga resolve com eventual consistency + compensações.',
  },
  {
    question: 'Diferença entre choreography e orchestration em saga?',
    options: [
      'São iguais',
      'Choreography: cada serviço reage a eventos de outros, sem coordenador central (acoplamento por eventos). Orchestration: um orchestrator (state machine) coordena a sequência. Choreography = acoplamento baixo mas lógica dispersa; orchestration = lógica centralizada mas singleton crítico',
      'Orchestration é sempre melhor',
      'Choreography é sempre melhor',
    ],
    correct: 1,
    explanation: 'Choreography: Order emite OrderCreated → Payment processa → emite PaymentSucceeded → Inventory reserva etc. Cada serviço sabe seu próximo. Orchestration: OrderSaga orchestrator chama Payment, depois Inventory, lida com erros. Trade-off: choreography fácil começar, difícil entender fluxo completo (grep pelos events); orchestration centralizado (state machine visível) mas precisa coordenador altamente disponível.',
  },
  {
    question: 'Por que compensação em saga não é rollback?',
    options: [
      'Rollback também serve',
      'Rollback assume locks mantidos (só funciona em TX tradicional). Saga tem commits parciais — cada serviço já confirmou localmente. Compensação é ação inversa (refund do pagamento, não "desfazer"), semanticamente válida mesmo após minutos/horas',
      'São a mesma coisa',
      'Compensação não funciona',
    ],
    correct: 1,
    explanation: 'Em TX ACID: abort = desfazer tudo via undo log, locks liberados. Saga: cada step já foi committed no seu DB. Se step 5 falha, não dá pra "rollback" steps 1-4 — eles já foram persistidos e outros podem ter lido. Compensação: para cada ação, uma ação inversa semântica (reservou inventory → libera inventory; cobrou cartão → emite refund). Compensação pode falhar também — precisa retry idempotente.',
  },
  {
    question: 'O que é idempotência e por que é crítica em saga?',
    options: [
      'Evitar duplicação',
      'Garante que executar uma ação múltiplas vezes tem mesmo efeito que uma vez. Crítico porque network + retry em saga significa que cada step pode ser chamado 2+ vezes. Chave: idempotency_key em cada request; serviço guarda resultados por chave e retorna cacheado em retry',
      'Segurança',
      'Performance',
    ],
    correct: 1,
    explanation: 'Saga depende de retry (network falha, timeout, worker crash). Sem idempotência, retry pode cobrar cartão 3x. Implementação: cada operação recebe idempotency_key (UUID único gerado pelo caller). Serviço lookup key em tabela idempotency: se existe, retorna response salvo. Se não, executa + salva. Stripe, AWS, todo pagamento sério usa isso.',
  },
  {
    question: 'Qual o maior risco operacional em saga?',
    options: [
      'Performance',
      'Compensação que falha em estado intermediário = inconsistência permanente. Ex: refund falha por cartão bloqueado, mas saga já liberou inventory. Mitigação: DLQ (dead letter queue), alerta humano, runbook + interface admin pra compensação manual',
      'Latência',
      'Não existe risco',
    ],
    correct: 1,
    explanation: 'Pior caso: saga principal aborta → dispara compensações → compensação X falha (após N retries). Sistema fica em estado "misto": parte compensado, parte não. Sem intervenção, inconsistência permanente. Mitigações obrigatórias: DLQ para compensações falhas, alerta PagerDuty, dashboard por saga_id mostrando estado, interface admin pra executar compensação manual. Sem isso, saga em produção é bomba-relógio.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-sistemas-distribuidos-saga"
      title="Capstone: Saga pattern — transações distribuídas sem 2PC"
      icon="🔀"
      xp={95}
      readTime={22}
      trailName="Sistemas Distribuídos"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O problema: transação através de serviços" accent={accent}>
        <p>
          Em monolito com DB único, transação é fácil: <code>BEGIN; ...; COMMIT</code>. Em microservices, cada serviço tem seu DB. Pedido (Order) + pagamento (Payment) + reserva de estoque (Inventory) + envio (Shipping) — 4 bancos diferentes, 4 times diferentes, 4 linguagens possivelmente.
        </p>
        <p>
          Precisamos garantir que: <strong>ou todos os steps completam, ou nenhum efeito persiste</strong>. Os dois caminhos para isso: 2PC (Two-Phase Commit) e Saga.
        </p>
      </Section>

      <Section title="Por que 2PC não serve em microservices" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', '2PC', 'Saga']}
          rows={[
            ['Modelo', 'ACID distribuído (all-or-nothing)', 'Eventual consistency com compensação'],
            ['Acoplamento', 'Alto (XA drivers, coordinator)', 'Baixo (eventos/comandos)'],
            ['Disponibilidade', 'Ruim (blocking se coordinator cai)', 'Alta (cada serviço autônomo)'],
            ['Latência', 'p99 do mais lento dos N', 'Cada step independente'],
            ['Cross-region', 'Inviável (RTT alto)', 'Natural'],
            ['Debug', 'Fácil (transação atômica)', 'Difícil (estado intermediário visível)'],
            ['Recomendação 2026', 'Legacy RDBMS mesmo DC', 'Microservices, cross-region, cloud-native'],
          ]}
        />
        <Callout tone="warn">
          <strong>Blocking problem do 2PC</strong>: após prepare, cada participant trava seus recursos esperando commit do coordinator. Se coordinator morre, recursos ficam travados até admin intervir. Em um sistema com 100+ microservices, isso é outage diário.
        </Callout>
      </Section>

      <Section title="Saga: definição e variantes" accent={accent}>
        <p>
          Saga = sequência de transações locais, cada uma commitada no seu serviço. Se algum step falha, rodamos <strong>compensações</strong> dos steps anteriores (ações semanticamente inversas).
        </p>
        <FlowDiagram
          title="Fluxo saga bem-sucedido: Order → Payment → Inventory → Shipping"
          orientation="horizontal"
          accent={accent}
          steps={[
            { icon: '📝', label: 'Order', desc: 'Cria order (pending)' },
            { icon: '💳', label: 'Payment', desc: 'Cobra cartão' },
            { icon: '📦', label: 'Inventory', desc: 'Reserva estoque' },
            { icon: '🚚', label: 'Shipping', desc: 'Agenda entrega' },
          ]}
        />
        <p>Se Shipping falha (ex: endereço inválido), disparamos compensações no sentido inverso:</p>
        <FlowDiagram
          title="Compensação: Shipping.cancel → Inventory.release → Payment.refund → Order.cancel"
          orientation="horizontal"
          accent={accent}
          steps={[
            { icon: '❌', label: 'Shipping', desc: 'Cancel booking' },
            { icon: '🔓', label: 'Inventory', desc: 'Libera estoque' },
            { icon: '💸', label: 'Payment', desc: 'Refund' },
            { icon: '🚫', label: 'Order', desc: 'Mark cancelled' },
          ]}
        />
      </Section>

      <Section title="Choreography vs Orchestration: qual escolher?" accent={accent}>
        <DecisionBox
          scenario="Microservices novos, time pequeno, 3-5 steps por saga"
          winner="Choreography (event-driven)"
          winnerColor={accent}
          why="Baixo acoplamento, sem singleton crítico, cada serviço publica eventos e reage. Fácil adicionar novo consumer sem mudar ninguém."
          alternatives={[
            { label: 'Orchestration', note: 'mais overhead para equipe pequena. Vale a pena quando fluxo tem > 7 steps ou muitos conditionals' },
          ]}
        />
        <DecisionBox
          scenario="10+ steps com lógica condicional, equipe grande, auditoria regulatória"
          winner="Orchestration com state machine (Temporal, AWS Step Functions)"
          winnerColor={accent}
          why="Fluxo é visível em um único lugar (state machine), fácil auditar, debugar e modificar. Temporal dá durability out-of-box + retry + observability."
          alternatives={[
            { label: 'Choreography', note: 'vira difícil entender fluxo — precisa greppar eventos espalhados em 10 serviços' },
          ]}
        />
      </Section>

      <Section title="Implementação: orchestrator com Temporal" accent={accent}>
        <CodeBlock lang="python">{`# Temporal workflow — state machine durável
from temporalio import workflow, activity
from datetime import timedelta

@activity.defn
async def create_order(input: OrderInput) -> str: ...

@activity.defn
async def cancel_order(order_id: str) -> None: ...

@activity.defn
async def charge_payment(order_id: str, amount: int, idempotency_key: str) -> str: ...

@activity.defn
async def refund_payment(charge_id: str, idempotency_key: str) -> None: ...

@activity.defn
async def reserve_inventory(order_id: str, items: list) -> str: ...

@activity.defn
async def release_inventory(reservation_id: str) -> None: ...

@workflow.defn
class CheckoutSaga:
    @workflow.run
    async def run(self, input: CheckoutInput) -> str:
        compensations = []
        try:
            order_id = await workflow.execute_activity(
                create_order, input,
                start_to_close_timeout=timedelta(seconds=10),
                retry_policy={"maximum_attempts": 3},
            )
            compensations.append(lambda: workflow.execute_activity(cancel_order, order_id))

            charge_id = await workflow.execute_activity(
                charge_payment, order_id, input.amount, input.idempotency_key,
                start_to_close_timeout=timedelta(seconds=15),
            )
            compensations.append(lambda: workflow.execute_activity(
                refund_payment, charge_id, input.idempotency_key
            ))

            reservation_id = await workflow.execute_activity(
                reserve_inventory, order_id, input.items,
                start_to_close_timeout=timedelta(seconds=10),
            )
            compensations.append(lambda: workflow.execute_activity(release_inventory, reservation_id))

            # ... mais steps
            return order_id

        except Exception as e:
            # Compensação na ordem inversa
            for compensate in reversed(compensations):
                try:
                    await compensate()
                except Exception as comp_error:
                    # Compensação falhou — escala pro humano
                    await workflow.execute_activity(
                        alert_ops, str(comp_error),
                        start_to_close_timeout=timedelta(seconds=5),
                    )
            raise`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Temporal resolve 3 problemas difíceis grátis: (1) <strong>durability</strong> — workflow sobrevive a crash de worker, continua do último step; (2) <strong>retry com backoff</strong> — configurável por activity; (3) <strong>timeouts + heartbeats</strong> — detecta activity travada.
        </Callout>
      </Section>

      <Section title="Idempotência — não é opcional" accent={accent}>
        <p>
          Cada activity pode ser chamada 2+ vezes (timeout, retry, worker crash mid-operation). Sem idempotência, você cobra o cartão 3 vezes.
        </p>
        <CodeBlock lang="sql">{`-- Tabela de idempotency por serviço
CREATE TABLE idempotency_keys (
  key            TEXT PRIMARY KEY,
  request_hash   TEXT NOT NULL,           -- SHA do payload
  response       JSONB NOT NULL,
  status_code    INT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  expires_at     TIMESTAMPTZ NOT NULL     -- TTL, ex: 24h
);

CREATE INDEX idx_idempotency_expires ON idempotency_keys (expires_at);

-- Lógica no handler:
-- 1. SELECT * FROM idempotency_keys WHERE key = $1
--    Se encontrou: retorna response salvo (comparar hash pra detectar payload diff)
--    Se não: processa + INSERT response + retorna`}</CodeBlock>
        <CodeBlock lang="python">{`async def charge_payment_handler(request):
    idempotency_key = request.headers.get("Idempotency-Key")
    if not idempotency_key:
        return Response(400, "Missing Idempotency-Key header")

    # Lookup
    existing = await db.fetchone(
        "SELECT response, status_code, request_hash FROM idempotency_keys WHERE key = $1",
        idempotency_key,
    )
    if existing:
        # Se payload diferente com mesma key → erro (cliente bugado)
        if existing["request_hash"] != hash_payload(request.body):
            return Response(422, "Idempotency key reused with different payload")
        return Response(existing["status_code"], existing["response"])

    # Processa de verdade
    result = await stripe.charge(request.body)

    # Salva response
    await db.execute(
        "INSERT INTO idempotency_keys (key, request_hash, response, status_code, expires_at) "
        "VALUES ($1, $2, $3, $4, $5)",
        idempotency_key, hash_payload(request.body), result, 200, now() + timedelta(hours=24),
    )
    return Response(200, result)`}</CodeBlock>
      </Section>

      <Section title="Observability e intervenção humana" accent={accent}>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li><strong>saga_id em todo log e trace</strong> — permite reconstruir jornada completa (Datadog APM, Grafana Tempo)</li>
          <li><strong>State machine visível</strong> — dashboard mostra todas sagas ativas, stuck, compensating, failed</li>
          <li><strong>DLQ pra compensação falha</strong> — separar compensações que não completaram pra alerta humano</li>
          <li><strong>Interface admin</strong> — operador pode ver saga travada, executar compensação manualmente, marcar como resolvida</li>
          <li><strong>Métricas RED por saga type</strong>: taxa de falha, latência end-to-end, taxa de compensação. Se compensação rate sobe, algo regrediu</li>
          <li><strong>Runbook escrito</strong>: &quot;se saga X falha em step Y, fazer Z&quot; — operador não deveria pensar em incidente às 3am</li>
        </ul>
      </Section>

      <Section title="Armadilhas fatais" accent={accent}>
        <Callout tone="danger" icon="🚫">
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Compensação sem idempotência</strong> — retry da compensação reverte 2x, estado inconsistente</li>
            <li><strong>Depender de ordem de eventos em choreography</strong> — rede reordena, consumers lentos recebem fora de ordem. Use timestamps + idempotency</li>
            <li><strong>Saga dentro de saga sem nome claro</strong> — aninhamento profundo é indebuggável. Se 3+ níveis, considere um orchestrator de orchestrators</li>
            <li><strong>Esquecer timeout</strong> — saga espera activity indefinidamente se sem timeout. Sempre configure</li>
            <li><strong>Testar só happy path</strong> — saga é 70% sobre handling de falha. Tests devem incluir: activity X falha no step N pra cada (X, N). Chaos engineering é obrigatório</li>
          </ol>
        </Callout>
      </Section>

      <Section title="Checklist: saga pronta pra produção" accent={accent}>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li>Todas activities têm idempotency_key obrigatório</li>
          <li>Toda activity tem timeout + retry policy configurada</li>
          <li>Toda ação tem sua compensação semântica correspondente</li>
          <li>Compensação também é idempotente</li>
          <li>saga_id logado + traceado em cada activity</li>
          <li>DLQ configurada pra compensação falha + alerta</li>
          <li>Dashboard de sagas (ativas, stuck, failed)</li>
          <li>Interface admin pra intervenção manual</li>
          <li>Runbook escrito por tipo de falha</li>
          <li>Chaos test: kill worker durante saga, verificar resume correto</li>
          <li>Chaos test: força falha em step N, verificar compensação</li>
          <li>Budget de compensação por tipo (ex: refund &gt; 5% do volume = alerta)</li>
        </ul>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <Callout tone="success" icon="🎓">
          Saga não é &quot;transação distribuída light&quot; — é <strong>padrão fundamentalmente diferente</strong> baseado em eventual consistency + compensações semânticas. 2PC morreu em microservices. Saga bem feita (Temporal/Step Functions + idempotência + observability) é a forma correta de garantir consistência em sistemas distribuídos modernos.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
