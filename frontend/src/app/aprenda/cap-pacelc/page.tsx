import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  NodeGraph,
  ComparisonFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cap-pacelc');

const ACCENT = '#f78166';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a afirmação CORRETA sobre CAP?',
    options: [
      'Você pode escolher 2 entre C, A e P',
      'Em qualquer sistema distribuído real você vai enfrentar partições de rede (P). Durante uma partição, você escolhe entre manter consistência (C, recusando escritas/leituras no lado minoritário) ou manter disponibilidade (A, aceitando respostas potencialmente obsoletas). Fora de partição, você quer e tem ambos',
      'CAP diz que sistemas distribuídos são impossíveis',
      'CAP só se aplica a bancos NoSQL',
    ],
    correct: 1,
    explanation:
      'O "escolher 2 de 3" é um mito didático. Partições acontecem (rede falha, lag, falha de rack), então P é dado. A escolha real é entre CP (sacrificar disponibilidade na partição para não divergir) ou AP (aceitar disponibilidade com possível inconsistência temporária). Fora de partição, sistemas entregam ambos. Essa é a formulação precisa de Gilbert & Lynch (2002).',
  },
  {
    question: 'O que PACELC adiciona ao CAP?',
    options: [
      'Substitui CAP',
      'Estende com o trade-off que existe mesmo SEM partição: Else (sem falha), Latency vs Consistency. Um sistema AP em partição tipicamente é EL (low latency) em operação normal. Um CP em partição tipicamente é EC (strong consistency, maior latência). PACELC obriga a pensar no dia-a-dia, não só no cenário de falha',
      'É uma linguagem de programação',
      'É um banco NoSQL específico',
    ],
    correct: 1,
    explanation:
      'PACELC (Abadi 2012): If Partition, then Availability vs Consistency; Else, Latency vs Consistency. Dynamo é PA/EL. Spanner é PC/EC. MongoDB é PA/EC (configurável). O ponto: escolhas em operação normal (não-partição) importam mais no dia-a-dia que o comportamento raro em partição — latência vs consistência moldam sua UX 99% do tempo.',
  },
  {
    question: 'Por que Google Spanner é considerado a "exceção que confirma a regra" do CAP?',
    options: [
      'Porque é proprietário',
      'Porque entrega consistência forte + alta disponibilidade globalmente, ao custo de latência (synchronous Paxos + TrueTime com GPS/átomo para timestamps globalmente ordenados). Não viola CAP — em partições reais, fica indisponível em algumas regiões. Mas arquitetura de hardware e rede dedicados tornam a janela de indisponibilidade tão pequena que parece mágica',
      'Porque evita partições',
      'Porque é escrito em Go',
    ],
    correct: 1,
    explanation:
      'Spanner é CP formal. O segredo é TrueTime — relógios atômicos + GPS garantem limite superior de erro conhecido, permitindo ordenação global linearizável com commit wait mínimo. Em partição, Spanner aceita indisponibilidade de curto prazo em vez de inconsistência. Replica em regiões com SLA de 99.999% — "Five nines" — porque o datacenter/rede Google reduz P drasticamente. Continua cumprindo CAP; só opera em um regime onde partições são raras.',
  },
  {
    question: 'Em uma fintech de pagamentos para o Brasil, qual é a escolha correta?',
    options: [
      'AP sempre — não pode ficar indisponível',
      'CP em dados de saldo/transação — inconsistência aqui vira saldo negativo ou transferência duplicada; isso é muito pior que rejeitar transação momentaneamente. AP em metadata (catálogo de produtos, histórico de perfil) onde eventual consistency é aceitável. Arquitetura mista: diferentes stores para diferentes domínios',
      'MongoDB para tudo',
      'Sempre Cassandra',
    ],
    correct: 1,
    explanation:
      'Dados financeiros exigem CP: use Postgres (primary) com Patroni/Stolon, ou CockroachDB/Spanner-like. Aceitar "erro temporário, tente novamente" é melhor que saldo duplicado. Dados de perfil, logs, analytics — AP com Cassandra/DynamoDB/Scylla é ok porque divergência temporária é tolerável. Regra: escolha storage POR domínio, não por empresa. Polyglot persistence é padrão em fintechs sérias.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cap-pacelc"
      title="CAP e PACELC: o teorema que define toda arquitetura distribuída"
      icon="⚖️"
      xp={80}
      readTime={16}
      trailName="Sistemas Distribuídos"
      trailColor={ACCENT}
      nextSlug="consistency-models"
      nextTitle="Modelos de Consistência: strong, eventual, causal, read-your-writes"
      relatedSlugs={['consensus-raft','consistency-models','idempotencia-retries']}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        CAP é o teorema mais citado e mais mal-explicado de sistemas distribuídos. "Você escolhe 2 de 3" é slogan
        didático, não verdade técnica. Este módulo explica a formulação real (Gilbert & Lynch, 2002), estende com
        PACELC (Abadi, 2012) — que cobre o trade-off de latência em operação normal — e aterrissa em decisões
        práticas: Postgres vs DynamoDB, Cassandra vs Spanner, polyglot persistence em fintech.
      </p>

      <Section title="O teorema, da forma precisa" accent={ACCENT}>
        <Callout tone="info">
          <strong>CAP (Gilbert & Lynch, 2002):</strong> Em um sistema distribuído com múltiplos nós, <em>na presença
          de uma partição de rede</em>, você não pode garantir simultaneamente <strong>consistência linearizável
          </strong> e <strong>disponibilidade total</strong>. Tem que escolher um dos dois enquanto a partição dura.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Termo', 'O que é', 'Quando aparece']}
          rows={[
            ['Consistency (C)', 'Toda leitura retorna a escrita mais recente (linearizability)', 'Sempre que há múltiplas réplicas'],
            ['Availability (A)', 'Toda request a nó não-falho retorna resposta (não falha por indisponibilidade)', 'Quando a rede ou outro nó falha'],
            ['Partition tolerance (P)', 'Sistema continua operando apesar de mensagens perdidas entre nós', 'Sempre que há rede — ou seja, sempre'],
          ]}
        />
        <Callout tone="warn">
          P não é "opcional". Redes reais tem jitter, lag, switches que pifam. Assumir "sem partições" é assumir
          magia. Então o trade-off real é <strong>CP ou AP durante partição</strong> — não "escolha 2 de 3".
        </Callout>
      </Section>

      <Section title="PACELC: o trade-off sem falha" accent={ACCENT}>
        <NodeGraph
          title="PACELC visualizado"
          accent={ACCENT}
          legend="Se Partição → escolha entre A (disponibilidade) e C (consistência). Else (sem falha) → escolha entre L (latência) e C (consistência)"
          columns={[
            {
              label: 'SIM — Há Partição',
              nodes: [
                { label: 'P(A) — Availability', sub: 'aceita escritas em ambos os lados; divergência resolvida depois. Ex: Dynamo, Cassandra', tone: 'default' },
                { label: 'P(C) — Consistency', sub: 'lado minoritário fica indisponível; mantém linearizabilidade. Ex: Spanner, Postgres', tone: 'emphasis' },
              ],
            },
            {
              label: 'NÃO — Else (Operação Normal)',
              nodes: [
                { label: 'E(L) — Low Latency', sub: 'commit local rápido, replicação assíncrona. Ex: Cassandra PA/EL, DynamoDB PA/EL', tone: 'default' },
                { label: 'E(C) — Consistency', sub: 'commit síncrono em quórum, maior latência. Ex: Spanner PC/EC, etcd PC/EC', tone: 'emphasis' },
              ],
            },
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          PACELC (Daniel Abadi, 2012) estende CAP observando que, <strong>mesmo sem partição</strong>, sistemas
          distribuídos enfrentam trade-off entre <em>latência</em> e <em>consistência</em>. Commit síncrono em
          múltiplas réplicas dá consistência forte, mas aumenta latência. Commit local rápido + replicação
          assíncrona reduz latência mas permite leituras de réplicas obsoletas.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sistema', 'Partição (P)', 'Else (E)', 'Classificação']}
          rows={[
            ['DynamoDB (eventual)', 'A (disponível)', 'L (low latency)', 'PA/EL'],
            ['Cassandra (default)', 'A', 'L', 'PA/EL'],
            ['Spanner', 'C (consistente)', 'C (consistent)', 'PC/EC'],
            ['CockroachDB', 'C', 'C', 'PC/EC'],
            ['MongoDB (W=majority)', 'A ou C (config)', 'C', 'PA/EC ou PC/EC'],
            ['Postgres + sync replicas', 'C', 'C', 'PC/EC'],
            ['Postgres + async replicas', 'A (leitura stale)', 'L em leitura', 'PA/EL em leitura'],
          ]}
        />
      </Section>

      <Section title="CP e AP na prática: quem é quem" accent={ACCENT}>
        <ComparisonFlow
          title="CP vs AP em partição de rede"
          accent={ACCENT}
          left={{
            label: '🔒 CP — Consistency under Partition',
            steps: [
              'Client escreve',
              'Leader (Replica A) recebe escrita',
              'Propaga para Replicas B e C',
              'Aguarda ACK de maioria (quórum)',
              'Commit confirmado — dados consistentes',
              'Durante partição: minoria rejeita escritas → indisponível',
              '✅ Dados nunca divergem · ❌ Pode recusar escritas',
            ],
          }}
          right={{
            label: '🌐 AP — Availability under Partition',
            steps: [
              'Client escreve',
              'Qualquer réplica aceita',
              'Commit local imediato',
              'Replicação assíncrona para demais',
              'Durante partição: ambos os lados aceitam escritas',
              'Após partição: resolução com LWW / CRDT / vector clocks',
              '✅ Sempre responde · ❌ Divergência temporária possível',
            ],
          }}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Categoria', 'CP', 'AP']}
          rows={[
            ['Comportamento em partição', 'Lado minoritário fica indisponível', 'Ambos aceitam escrita'],
            ['Garante linearizability', 'Sim', 'Não (eventual ou causal)'],
            ['Latência típica', 'Maior (quorum)', 'Menor (commit local)'],
            ['Exemplos', 'Postgres, Spanner, Cockroach, etcd, ZooKeeper', 'Dynamo, Cassandra, Riak, CouchDB'],
            ['Resolução pós-partição', 'Não precisa — não divergiu', 'Last-write-wins, CRDT, vector clocks, app-level merge'],
            ['Caso de uso forte', 'Dinheiro, estoque, auth, coordenação', 'Feed, logs, carrinho, sessão, catálogo'],
          ]}
        />
      </Section>

      <Section title="O mito do 'AP sempre' e do 'CP sempre'" accent={ACCENT}>
        <Callout tone="danger">
          "Escolhemos AP porque não podemos ficar indisponíveis" — frase comum em pitch, raramente verdadeira. Em
          bancos, uma transferência duplicada é um bug catastrófico (compliance, reconciliação manual). Em um feed
          social, uma curtida duplicada ou perdida é invisível. <strong>Cada domínio tem seu regime.</strong>
        </Callout>
        <DecisionBox
          scenario="Carrinho de e-commerce (itens adicionados/removidos pelo usuário)"
          winner="AP com resolução determinística"
          winnerColor={ACCENT}
          why="Usuário em outro device adiciona item, partição de rede rola, depois reconcilia. OR-Set (CRDT) resolve conflitos automaticamente. Indisponibilidade de 'não consegui adicionar ao carrinho' é pior que divergência breve."
        />
        <DecisionBox
          scenario="Transferência bancária entre contas"
          winner="CP com transação forte"
          winnerColor={ACCENT}
          why="Saldo errado = perda financeira + compliance issue. Melhor rejeitar transação ('tente novamente em alguns segundos') do que aceitar e divergir. Postgres + replicação síncrona, ou Spanner-like."
        />
        <DecisionBox
          scenario="Timeline de posts em uma rede social"
          winner="AP com eventual consistency"
          winnerColor={ACCENT}
          why="Ver post 200ms mais tarde é aceitável. Indisponibilidade do feed é inaceitável. Cassandra/Scylla com RF=3, CL=QUORUM para escrita e CL=ONE para leitura é clássico."
        />
      </Section>

      <Section title="Quorum: o dial contínuo entre CP e AP" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Sistemas como Cassandra e Dynamo expõem <InlineCode>W</InlineCode> (réplicas que precisam ack na escrita) e{' '}
          <InlineCode>R</InlineCode> (réplicas consultadas na leitura). Com total de <InlineCode>N</InlineCode>{' '}
          réplicas, se <InlineCode>W + R &gt; N</InlineCode> você tem strong consistency (há overlap garantido).
          Caso contrário, eventual.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['N / W / R', 'Regime', 'Trade-off']}
          rows={[
            ['N=3 / W=1 / R=1', 'AP puro', 'Baixíssima latência; alta disponibilidade; eventual'],
            ['N=3 / W=3 / R=1', 'CP na escrita', 'Escrita cara; leitura rápida; strong'],
            ['N=3 / W=1 / R=3', 'CP na leitura', 'Escrita rápida; leitura cara; strong'],
            ['N=3 / W=2 / R=2 (QUORUM)', 'Balance', 'W+R>N: strong; tolera 1 falha'],
            ['N=5 / W=3 / R=3', 'Strong + alta tolerância', 'Tolera 2 falhas; mais caro'],
          ]}
        />
      </Section>

      <Section title="Polyglot persistence: diferentes stores para diferentes regimes" accent={ACCENT}>
        <CodeBlock lang="text">{`Fintech típica (AI-native, 2026):

┌─────────────────────┐  ┌─────────────────────┐
│  Saldo / Transações │  │  Perfil / Prefs     │
│  Postgres + WAL     │  │  DynamoDB           │
│  sync replica       │  │  eventual           │
│  (CP / EC)          │  │  (AP / EL)          │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│  Analytics event    │  │  Rate limit counter │
│  Kafka → Clickhouse │  │  Redis (AP)         │
│  (AP / EL)          │  │  sliding window     │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│  Config / Coord.    │  │  Search / Embeddings│
│  etcd (Raft, CP)    │  │  OpenSearch + vector│
│  (PC / EC)          │  │  (AP / EL)          │
└─────────────────────┘  └─────────────────────┘`}</CodeBlock>
        <Callout tone="success">
          Polyglot persistence não é "moda". É resposta direta a CAP/PACELC: dado diferente tem regime diferente.
          Escolher um único banco para tudo força trade-offs inadequados em algum lugar. Custo operacional é real,
          mas menor que o bug de arquitetura errada.
        </Callout>
      </Section>

      <Section title="Código: simulação de partição em Python" accent={ACCENT}>
        <CodeBlock lang="python">{`# Simulação didática: 2 réplicas, partição, CP vs AP
from dataclasses import dataclass
from typing import Literal

@dataclass
class Replica:
    name: str
    data: dict[str, str]
    partitioned_from: set[str]
    mode: Literal["CP", "AP"]

    def write(self, peers: list["Replica"], key: str, value: str) -> bool:
        if self.mode == "CP":
            reachable = [p for p in peers if p.name not in self.partitioned_from]
            # CP: precisa de maioria (quorum)
            needed = (len(peers) + 1) // 2 + 1
            if len(reachable) + 1 < needed:
                return False                 # indisponível
            self.data[key] = value
            for p in reachable:
                p.data[key] = value
            return True
        else:                                # AP
            self.data[key] = value            # commit local sempre
            for p in peers:
                if p.name not in self.partitioned_from:
                    p.data[key] = value
            return True

a = Replica("A", {}, set(), "CP")
b = Replica("B", {}, set(), "CP")
c = Replica("C", {}, set(), "CP")

# Sem partição — escrita funciona
print(a.write([b, c], "x", "1"))    # True

# Partição: A isolado de B e C
a.partitioned_from = {"B", "C"}
b.partitioned_from = {"A"}
c.partitioned_from = {"A"}

# CP: A isolado não tem quorum → escrita falha
print(a.write([b, c], "x", "2"))    # False (esperado)

# Já em AP, A aceitaria e divergiria; depois resolve (LWW/CRDT/etc)`}</CodeBlock>
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Se minha aplicação é só 1 banco Postgres, CAP ainda se aplica?"
          a={<>Menos, mas sim em replicação. Quando você adiciona read replica, primary + replica formam um sistema distribuído. Leitura na replica async pode ser stale — isso é o trade-off AP/EL na prática. Read-your-writes guarantee vem com session state (ler no primary) ou waits explícitos.</>}
        />
        <QAItem
          q="Microserviços têm CAP?"
          a={<>Sim, e é onde mais machuca: cada serviço tem seu DB, comunicação entre eles é rede. "Transação distribuída" passa a ser problema. Soluções: sagas (próximo módulo), outbox pattern, event-driven. Evite 2PC em prod moderna — mais no módulo de sagas.</>}
        />
        <QAItem
          q="Kafka é CP ou AP?"
          a={<>CP na lógica de ISR (in-sync replicas) e commit. Com <InlineCode>acks=all</InlineCode> e <InlineCode>min.insync.replicas</InlineCode> correto, Kafka garante durabilidade forte. Sem isso (<InlineCode>acks=1</InlineCode>), vira basicamente AP — mais rápido, mas pode perder mensagens em falha. Config é tudo.</>}
        />
        <QAItem
          q="Por que etcd é PC/EC se já tem Raft?"
          a={<>Raft é o MEIO; CAP/PACELC descreve o COMPORTAMENTO. Raft implementa consenso, que é a primitiva para sistemas CP. etcd paga latência em operação normal (quorum writes) — EC. Em partição, lado minoritário fica indisponível — PC. Essa combinação (PC/EC) é o que Kubernetes quer para control plane: coordenação consistente, mesmo que mais lenta.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> CAP não é "escolha 2 de 3" — é "em partição, escolha entre C e A". P é dado.
        PACELC estende: mesmo sem falha há trade-off entre latência e consistência. Spanner/Cockroach = PC/EC.
        Dynamo/Cassandra = PA/EL. Polyglot persistence é a resposta certa — cada domínio no regime adequado. Quorum
        (W, R, N) é o dial contínuo entre CP e AP. Próximo módulo detalha os modelos de consistência (strong,
        eventual, causal, read-your-writes) e quando cada um é o mínimo aceitável.
      </Callout>
    </div>
  );
}
