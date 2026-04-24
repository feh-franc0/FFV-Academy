import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  ArchDiagram,
  InlineCode,
} from '@/components/article/primitives';

const ACCENT = '#f78166';

export const metadata = getModuleMetadata('event-sourcing-cqrs');

const quiz = [
  {
    question:
      'Qual é a diferença fundamental entre Event Sourcing e o padrão tradicional CRUD?',
    options: [
      'Event Sourcing usa NoSQL; CRUD usa SQL',
      'Event Sourcing armazena a sequência de eventos que mudaram o estado; CRUD armazena apenas o estado atual',
      'Event Sourcing é mais rápido que CRUD',
      'Event Sourcing não precisa de banco de dados',
    ],
    correct: 1,
    explanation:
      'Event Sourcing persiste a lista imutável de eventos (deltas). O estado atual é derivado aplicando os eventos em ordem. CRUD persiste só o snapshot final, perdendo a história. Event Sourcing dá auditoria completa, time travel e capacidade de reconstruir projeções, mas paga o preço em complexidade.',
  },
  {
    question:
      'O "C" de CQRS significa:',
    options: [
      'Cache (CacheQueryResponsibilitySegregation)',
      'Command (CommandQueryResponsibilitySegregation)',
      'Container (ContainerQueryResponsibilitySegregation)',
      'Consistency (ConsistencyQueryResponsibilitySegregation)',
    ],
    correct: 1,
    explanation:
      'CQRS = Command Query Responsibility Segregation. Commands mudam estado (write side) — podem retornar void ou id. Queries leem estado (read side) — nunca mudam nada. A sacada é que os dois lados podem ter modelos, bancos e escala separadas. Não precisa usar Event Sourcing pra fazer CQRS, mas combinam bem.',
  },
  {
    question:
      'Snapshots em Event Sourcing existem porque:',
    options: [
      'A lei exige backup',
      'Reconstruir estado aplicando milhões de eventos do zero fica lento — snapshots cortam o replay a partir de um ponto',
      'Reduzem o tamanho do event store',
      'Garantem ACID',
    ],
    correct: 1,
    explanation:
      'Agregados com longa história (10k, 1M eventos) ficam lentos pra reconstruir do zero. Um snapshot salva o estado aplicado até o evento N; no próximo carregamento, você pula pra N+1 e aplica só o delta. Snapshots são otimização de leitura — o event log continua sendo source of truth.',
  },
  {
    question:
      'Quando Event Sourcing é claramente NÃO recomendado?',
    options: [
      'Sistemas financeiros com necessidade de auditoria',
      'Sistemas colaborativos (Miro, Figma, Google Docs)',
      'CRUD simples de cadastro com baixa complexidade de domínio',
      'Workflows de negócio complexos com muitas transições de estado',
    ],
    correct: 2,
    explanation:
      'ES é custo fixo alto: event store, versionamento, projections, replay, idempotência. Pra um CRUD simples (cadastro de produtos, perfis), é overengineering — você ganha complexidade sem retorno. ES brilha quando a história importa (audit, contabilidade, domínio complexo) ou quando você precisa de múltiplas projeções do mesmo dado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="event-sourcing-cqrs"
      title="Event Sourcing e CQRS: quando eventos são a fonte da verdade"
      icon="📜"
      xp={85}
      readTime={17}
      trailName="Sistemas Distribuídos"
      trailColor={ACCENT}
      nextSlug="postgres-mvcc-isolation"
      nextTitle="Postgres Profundo: MVCC, Isolation Levels e Locks"
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
        Quase todo sistema que você conhece persiste o <em>estado atual</em>: user.balance = 150.
        Foi 200, virou 150. A mutação aconteceu, o valor anterior morreu. Event Sourcing
        inverte essa premissa: grava a <strong>sequência de eventos</strong> que aconteceram
        (Credited 200, Debited 50) e deriva o estado dessa lista imutável. Dá pra voltar no
        tempo, reconstruir qualquer view, auditar tudo — ao preço de complexidade real.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        CQRS é o primo frequentemente associado: separar <strong>commands</strong> (escrita)
        de <strong>queries</strong> (leitura) em modelos/bancos/escalas diferentes. Este módulo
        mostra o que são, como implementar, armadilhas reais (versionamento de eventos é
        um pesadelo), e quando <em>não</em> usar — porque 80% dos casos são overengineering.
      </p>

      <Section title="Event Sourcing: eventos como fonte da verdade" accent={ACCENT}>
        <ArchDiagram>
{`CRUD tradicional:
  ┌──────────────────────────────┐
  │ accounts                      │
  │ id | balance | updated_at    │
  │ 42 |  150.00 | 2026-04-16    │    ← só o estado atual
  └──────────────────────────────┘

Event Sourcing:
  ┌──────────────────────────────────────────────────────────────┐
  │ events (append-only)                                           │
  │ id | aggregate_id | type         | payload       | timestamp  │
  │ 1  | 42           | AccountOpened| {owner:"Ana"} | 2026-01-10 │
  │ 2  | 42           | Credited     | {amount:200}  | 2026-02-03 │
  │ 3  | 42           | Debited      | {amount:50}   | 2026-03-18 │
  │ 4  | 42           | Debited      | {amount:0.01} | 2026-04-16 │
  └──────────────────────────────────────────────────────────────┘
  → estado atual = somar eventos: balance = 149.99
  → história completa, imutável, auditável`}
        </ArchDiagram>

        <p><strong>Propriedades</strong>:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Append-only</strong>: eventos nunca são editados ou deletados. Correções = novo evento (ex: BalanceCorrected).</li>
          <li><strong>Ordenados por aggregate</strong>: eventos do mesmo agregado têm sequência monotônica (version 1, 2, 3...).</li>
          <li><strong>Immutable audit log</strong>: você tem o "porquê" de cada mudança, não só o "o quê".</li>
          <li><strong>Replay</strong>: reconstruir qualquer estado passado aplicando eventos até um timestamp.</li>
        </ul>
      </Section>

      <Section title="Command → Event → Aggregate: o ciclo básico" accent={ACCENT}>
        <ArchDiagram>
{`┌─────────┐     command     ┌──────────────┐     validate + produce    ┌──────────────┐
│ Cliente │ ──────────────► │  Command     │ ────────────────────────► │   Event(s)   │
└─────────┘                 │  Handler     │                            └──────────────┘
                            └──────────────┘                                   │
                                    ▲                                          │ append
                                    │ load                                     ▼
                                    │                                 ┌────────────────┐
                            ┌──────────────┐   apply events           │  EVENT STORE   │
                            │  Aggregate   │◄─────────────────────────│ (append-only)  │
                            │  (in memory) │                          └────────────────┘
                            └──────────────┘
                                                                              │ stream
                                                                              ▼
                                                                    ┌─────────────────┐
                                                                    │   PROJECTIONS   │
                                                                    │  (read models)  │
                                                                    └─────────────────┘`}
        </ArchDiagram>

        <p><strong>Exemplo: BankAccount em Python</strong>:</p>
        <CodeBlock lang="python">{`# bank_account.py — agregado em Event Sourcing

from dataclasses import dataclass, field
from typing import Literal

# ─── Events (imutáveis) ───
@dataclass(frozen=True)
class AccountOpened:
    account_id: str
    owner: str

@dataclass(frozen=True)
class Credited:
    account_id: str
    amount: float

@dataclass(frozen=True)
class Debited:
    account_id: str
    amount: float

Event = AccountOpened | Credited | Debited


# ─── Aggregate ───
@dataclass
class BankAccount:
    account_id: str = ""
    owner: str = ""
    balance: float = 0.0
    version: int = 0                    # número do último evento aplicado
    _uncommitted: list[Event] = field(default_factory=list)

    @classmethod
    def load(cls, history: list[Event]) -> "BankAccount":
        acc = cls()
        for e in history:
            acc._apply(e)
            acc.version += 1
        return acc

    def _apply(self, e: Event) -> None:
        if isinstance(e, AccountOpened):
            self.account_id = e.account_id
            self.owner = e.owner
        elif isinstance(e, Credited):
            self.balance += e.amount
        elif isinstance(e, Debited):
            self.balance -= e.amount

    # ─── Commands (validam + produzem eventos) ───
    def open(self, account_id: str, owner: str) -> None:
        if self.account_id:
            raise ValueError("Already opened")
        self._raise(AccountOpened(account_id, owner))

    def credit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self._raise(Credited(self.account_id, amount))

    def debit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Amount must be positive")
        if self.balance - amount < 0:
            raise ValueError("Insufficient funds")   # regra de negócio
        self._raise(Debited(self.account_id, amount))

    def _raise(self, e: Event) -> None:
        self._apply(e)
        self._uncommitted.append(e)
        self.version += 1


# ─── Repository ───
class AccountRepository:
    def __init__(self, event_store):
        self.store = event_store

    async def load(self, account_id: str) -> BankAccount:
        events = await self.store.load_stream(account_id)
        return BankAccount.load(events)

    async def save(self, acc: BankAccount) -> None:
        if not acc._uncommitted:
            return
        expected_version = acc.version - len(acc._uncommitted)
        await self.store.append(
            acc.account_id, acc._uncommitted, expected_version
        )
        acc._uncommitted.clear()`}</CodeBlock>

        <Callout tone="info">
          <strong>Optimistic concurrency</strong>: ao salvar, o repo manda <InlineCode>expected_version</InlineCode>
          pro event store. Se dois writers carregaram version=5 e os dois tentam anexar, o segundo
          falha (o version já virou 6) e precisa reload + retry. É o padrão padrão em ES.
        </Callout>
      </Section>

      <Section title="CQRS: separar escrita e leitura" accent={ACCENT}>
        <p>
          CQRS é independente de Event Sourcing, mas se casam lindamente. A ideia: o modelo
          de escrita (command side) é <em>otimizado pra invariantes</em>; o modelo de leitura
          (query side) é <em>otimizado pra consultas</em>. Podem morar em bancos diferentes.
        </p>
        <ArchDiagram>
{`CLIENTE
  ├─ POST /accounts/42/debit  ────► ┌─────────────┐
  │   (command)                     │  Command    │ ─► event store (Postgres/EventStoreDB)
  │                                 │  Handler    │       │
  │                                 └─────────────┘       │ stream
  │                                                       ▼
  │                                             ┌───────────────────┐
  │                                             │   PROJECTORS      │
  │                                             │   (consumers)     │
  │                                             └───────────────────┘
  │                                                ▲       ▲      ▲
  │                                                │       │      │
  │                                                ▼       ▼      ▼
  │                                        ┌──────────┬────────┬────────┐
  │                                        │Read DB #1│ ES#2   │Redis   │
  │                                        │(ledger)  │(search)│(cache) │
  │                                        └──────────┴────────┴────────┘
  │                                                ▲       ▲      ▲
  └─ GET /accounts/42  ───────────────────────────┤       │      │
     (query)                             cada view serve queries específicas`}
        </ArchDiagram>

        <ComparisonTable
          headers={['Lado', 'Otimizado para', 'Modelos']}
          rows={[
            ['Command (write)', 'Consistency, invariantes, validação', 'Aggregate rico, DDD'],
            ['Query (read)', 'Performance de leitura, view-specific', 'Read models denormalizados'],
          ]}
        />

        <Callout tone="warn">
          <strong>CQRS sem Event Sourcing</strong> também existe — é só separar modelos de escrita
          e leitura usando o mesmo banco com views materializadas, ou replicação lógica pra DB
          de leitura. Muita gente confunde: CQRS + ES são ortogonais.
        </Callout>
      </Section>

      <Section title="Projections: as views do mundo" accent={ACCENT}>
        <p>
          Projeção é um consumer que lê o event stream e mantém uma "view" do estado. Cada projeção
          é independente — você pode criar quantas quiser, deletar, refazer do zero (replay).
        </p>
        <CodeBlock lang="python">{`# projections.py — projector async alimentando tabela de leitura

async def account_balance_projector(event_stream):
    """Projeção simples: saldo atual por conta."""
    async for event in event_stream:
        async with db.begin() as tx:
            if isinstance(event, AccountOpened):
                await tx.execute(
                    text("INSERT INTO accounts_view (id, owner, balance) VALUES (:id, :o, 0)"),
                    {"id": event.account_id, "o": event.owner},
                )
            elif isinstance(event, Credited):
                await tx.execute(
                    text("UPDATE accounts_view SET balance = balance + :a WHERE id = :id"),
                    {"id": event.account_id, "a": event.amount},
                )
            elif isinstance(event, Debited):
                await tx.execute(
                    text("UPDATE accounts_view SET balance = balance - :a WHERE id = :id"),
                    {"id": event.account_id, "a": event.amount},
                )
            # ledger de checkpoint: última offset processada (pra replay/resume)
            await tx.execute(
                text("UPDATE projection_offsets SET last_event_id = :id WHERE name = 'balance'"),
                {"id": event.id},
            )


async def transactions_history_projector(event_stream):
    """Outra projeção do MESMO stream: histórico de operações."""
    async for event in event_stream:
        if isinstance(event, (Credited, Debited)):
            await db.execute(
                text("""INSERT INTO transactions_view
                        (account_id, type, amount, at)
                        VALUES (:id, :t, :a, :ts)"""),
                {
                    "id": event.account_id,
                    "t": type(event).__name__,
                    "a": getattr(event, "amount", 0),
                    "ts": event.timestamp,
                },
            )`}</CodeBlock>

        <Callout tone="info">
          <strong>Power move</strong>: quer uma nova feature que precisa de uma view diferente
          (ex: "histórico agregado por mês")? Crie uma nova projeção, rode replay do event store,
          tabela pronta. Sem migration complexa, sem backfill frágil. Esse é o caso de uso
          mais vendedor de Event Sourcing.
        </Callout>
      </Section>

      <Section title="Snapshots: otimizando o load" accent={ACCENT}>
        <p>
          Carregar uma conta com 100k eventos pra cada comando vira inviável. Snapshots
          salvam o estado em momentos específicos (ex: a cada 100 eventos), então o load
          puxa o snapshot mais recente + só os eventos posteriores.
        </p>
        <CodeBlock lang="python">{`# snapshot.py — carregamento com snapshot

async def load_with_snapshot(account_id: str) -> BankAccount:
    # 1. Busca snapshot mais recente
    snapshot = await db.fetchrow(
        "SELECT state, at_version FROM snapshots WHERE aggregate_id = $1 ORDER BY at_version DESC LIMIT 1",
        account_id,
    )

    if snapshot:
        acc = BankAccount(**snapshot["state"])
        acc.version = snapshot["at_version"]
        start_version = snapshot["at_version"] + 1
    else:
        acc = BankAccount()
        start_version = 0

    # 2. Carrega eventos APÓS o snapshot
    events = await load_events(account_id, from_version=start_version)
    for e in events:
        acc._apply(e)
        acc.version += 1

    return acc


async def save_snapshot_if_needed(acc: BankAccount):
    # A cada 100 eventos, persiste snapshot
    if acc.version % 100 == 0:
        await db.execute(
            "INSERT INTO snapshots (aggregate_id, state, at_version) VALUES ($1, $2, $3)",
            acc.account_id, serialize(acc), acc.version,
        )`}</CodeBlock>
        <Callout tone="warn">
          <strong>Snapshot não é source of truth</strong>. Se você muda lógica do agregado
          (ex: adiciona campo), snapshots antigos podem virar inválidos. Solução:
          versionar snapshots e ter migrador que descarta snapshots antigos (event log é
          sempre valido).
        </Callout>
      </Section>

      <Section title="Versionamento de eventos: o maior pain point" accent={ACCENT}>
        <p>
          Eventos são <em>imutáveis pra sempre</em>. Se daqui a 3 anos você precisa adicionar
          campo, mudar nome, ou quebrar formato — precisa de estratégia.
        </p>
        <ComparisonTable
          headers={['Estratégia', 'Quando usa']}
          rows={[
            ['Adicionar campo opcional', 'Maior parte dos casos. Ignorar se ausente em eventos antigos.'],
            ['Versionamento do evento (v1, v2)', 'Quando breaking change inevitável. Consumers deserializam por versão.'],
            ['Upcasters (transformers)', 'Converter eventos v1 pra v2 ao carregar. Isola a lógica nova da antiga.'],
            ['Copy-and-transform', 'Replay completo transformando eventos pra nova schema. Custoso mas limpo.'],
          ]}
        />

        <CodeBlock lang="python">{`# upcaster.py — exemplo de upcaster
def upcast(raw: dict) -> Event:
    event_type = raw["type"]
    version = raw.get("version", 1)

    if event_type == "Credited":
        if version == 1:
            # v1 não tinha currency. Antes, todos BRL.
            raw["currency"] = "BRL"
            raw["version"] = 2
        return Credited(**raw)

    if event_type == "Debited":
        ...`}</CodeBlock>

        <Callout tone="danger">
          <strong>A tentação de editar eventos antigos</strong>: NUNCA. Event store é append-only
          por design. Editar = você quebrou o contrato com todos os consumers e projeções. Se
          um evento foi gravado errado, grave um <InlineCode>EventCorrected</InlineCode> novo.
          A história permanece auditável.
        </Callout>
      </Section>

      <Section title="Event stores na prática" accent={ACCENT}>
        <ComparisonTable
          headers={['Opção', 'Descrição', 'Quando usa']}
          rows={[
            [
              'EventStoreDB (Kurrent)',
              'Event store dedicado, streams nativos, projections built-in.',
              'Quando você quer o produto feito pra isso. Setup novo.',
            ],
            [
              'Postgres append-only table',
              'events (id, aggregate_id, version, type, payload, ts) com UNIQUE(aggregate_id, version).',
              'A escolha mais comum em 2026. ACID local, migrations normais.',
            ],
            [
              'Kafka',
              'Log imutável por partição. Compaction se precisar.',
              'Escalas massivas, múltiplos consumers independentes.',
            ],
            [
              'DynamoDB streams',
              'DynamoDB + DDB Streams pra projeções.',
              'AWS native, alto throughput.',
            ],
            [
              'Marten (C# sobre Postgres)',
              'Framework maduro Postgres+JSON.',
              'Stack .NET.',
            ],
          ]}
        />

        <p><strong>Schema Postgres comum</strong>:</p>
        <CodeBlock lang="sql">{`-- event store simples em Postgres
CREATE TABLE events (
    id                BIGSERIAL PRIMARY KEY,            -- ordem global
    aggregate_id      UUID NOT NULL,
    aggregate_version INT NOT NULL,                     -- ordem dentro do aggregate
    event_type        TEXT NOT NULL,
    payload           JSONB NOT NULL,
    metadata          JSONB DEFAULT '{}',               -- correlação, causação, user
    occurred_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(aggregate_id, aggregate_version)             -- optimistic concurrency
);

CREATE INDEX ON events (aggregate_id, aggregate_version);
CREATE INDEX ON events (event_type);                    -- por tipo p/ projeções
CREATE INDEX ON events (occurred_at);                   -- filtros temporais

-- append com otimista
INSERT INTO events (aggregate_id, aggregate_version, event_type, payload)
VALUES ($1, $2, $3, $4);
-- vai falhar com "unique constraint violation" se outro writer já gravou aquela versão`}</CodeBlock>
      </Section>

      <Section title="Decisões reais" accent={ACCENT}>
        <DecisionBox
          scenario="Sistema bancário: extrato detalhado, auditoria legal, time travel de saldo"
          winner="Event Sourcing é perfect fit"
          winnerColor={ACCENT}
          why="A história ALÉM do estado atual é o produto — extrato é literalmente o event log filtrado. Auditoria vira trivial (cada mudança tem quem/quando/por quê). Compliance (Bacen, LGPD) exige rastreabilidade que ES dá de graça. Complexidade extra compensa."
          alternatives={[
            { label: 'CRUD + audit_log table', note: 'Funciona, mas audit log sempre diverge do state por bugs/esquecimento.' },
          ]}
        />
        <DecisionBox
          scenario="CRUD de cadastro de produtos (catálogo e-commerce)"
          winner="NÃO use Event Sourcing — CRUD simples"
          winnerColor={ACCENT}
          why="Você só precisa do estado atual. A história de edições raramente importa fora de log de auditoria. ES aqui seria 5x mais código, 3x mais operação, zero retorno. Use Postgres + index + cache."
          alternatives={[
            { label: 'Event Sourcing', note: 'Só se tiver requisito específico de auditoria granular.' },
          ]}
        />
        <DecisionBox
          scenario="E-commerce com múltiplas views do mesmo pedido (dashboard ops, app cliente, BI)"
          winner="CQRS com projeções dedicadas (não exige ES)"
          winnerColor={ACCENT}
          why="CQRS te dá liberdade pra modelar cada view sob medida. Você pode ter: Postgres pra write, Elasticsearch pra busca, Redis pra cache, data warehouse pra BI — todos alimentados via CDC ou eventos. Event Sourcing opcional; o ganho de CQRS sozinho já é enorme."
          alternatives={[
            { label: 'Single DB com views', note: 'Se todas as views cabem no mesmo banco sem dor. Mais simples.' },
          ]}
        />
        <DecisionBox
          scenario="Domain complexo: seguros, logística, healthcare workflows"
          winner="Event Sourcing + DDD (Domain-Driven Design)"
          winnerColor={ACCENT}
          why="Domínios complexos com muitas transições de estado são onde ES brilha. O evento é uma linguagem ubíqua (domain experts reconhecem 'ClaimApproved', 'PolicyCanceled'). Replay dá poder de análise histórica. Pair com DDD bounded contexts."
          alternatives={[
            { label: 'State-based DDD', note: 'Tradicional — aggregate salva estado, não eventos. Perde time travel.' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <div className="flex flex-col gap-4">
          <div>
            <p><strong>Como apagar dados (LGPD right-to-be-forgotten) em event store imutável?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Patterns: (1) <em>crypto-shredding</em> — criptografar campos PII com chave por-usuário, jogar a chave fora quando solicitado (dado vira ilegível); (2) <em>soft delete</em> + tombstone event + reescrita dos snapshots; (3) segregar PII em loja separada referenciada por ID. A crypto-shredding é o padrão moderno.
            </p>
          </div>
          <div>
            <p><strong>Projeções podem ficar inconsistentes com o event store?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Sim, transientemente — projeção é eventual consistency. Monitor o lag do projector. Em caso de bug, delete a view, rode replay. Essa é a belezura: o source of truth é sempre os eventos.
            </p>
          </div>
          <div>
            <p><strong>Event store e eventos de integração (inter-serviços) são a mesma coisa?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Não! Domain events (internos) vivem no event store. Integration events (publicados pra outros serviços) são um conceito separado. Comum: domain event interno → handler → publica integration event diferente (com schema estável). Mistura os dois e você acopla todo mundo ao seu domínio interno.
            </p>
          </div>
          <div>
            <p><strong>ES é bom pra real-time analytics?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Ótimo — cada evento vira input pro streaming. Combine com Kafka + Flink/ksqlDB: projeções viram agregações em tempo real. Data warehouse populado via Kafka Connect. Event Sourcing empurra análise pra ser de primeira classe.
            </p>
          </div>
          <div>
            <p><strong>Tamanho do event store explode?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Cresce, mas é append-only (muito eficiente). Compressão JSONB, particionamento por aggregate_id, cold storage pra eventos antigos (S3 + Parquet) se necessário. Raramente é gargalo real — mais comum é projeção mal dimensionada.
            </p>
          </div>
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways</strong>:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Event Sourcing</strong>: persiste <em>eventos</em> (deltas), não estado. Estado atual = fold sobre os eventos.</li>
          <li><strong>CQRS</strong>: separa command side (escrita, invariantes) de query side (leitura, otimizada). <em>Ortogonal</em> a ES, combina bem.</li>
          <li>Eventos são <strong>imutáveis</strong>. Correções = novos eventos, nunca edit. Versionamento via upcasters.</li>
          <li><strong>Snapshots</strong> otimizam load, não são source of truth. Podem ser descartados e refeitos.</li>
          <li><strong>Projections</strong> alimentam read models múltiplos. Criar uma view nova = novo projector + replay.</li>
          <li><strong>Optimistic concurrency</strong>: append falha se aggregate_version já existe. Retry after reload.</li>
          <li>Use ES quando <em>a história importa</em> (audit, time travel, domínio complexo). Evite em CRUD simples.</li>
        </ul>
      </Callout>

      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Próximo módulo: voltando ao single-node, mas com profundidade — Postgres MVCC e isolation levels.
      </p>
    </div>
  );
}
