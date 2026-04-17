import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Consensus e Raft: como nós discordam e chegam a acordo | FFV Academy',
  description:
    'FLP impossibility, intuição do Paxos, e Raft explicado do zero: leader election, log replication e safety. Por que etcd, Consul, Kubernetes e CockroachDB usam Raft.',
  keywords:
    'raft, consensus, paxos, flp impossibility, leader election, log replication, etcd, consul, kubernetes, cockroachdb, sistemas distribuidos',
};

const quiz = [
  {
    question:
      'O teorema FLP (Fischer-Lynch-Paterson, 1985) prova que em um sistema assíncrono é impossível garantir:',
    options: [
      'Disponibilidade quando há partição de rede',
      'Consenso determinístico se pelo menos 1 nó pode falhar',
      'Consistência forte com replicação síncrona',
      'Ordenação total de eventos sem relógios sincronizados',
    ],
    correct: 1,
    explanation:
      'FLP prova que em um modelo assíncrono puro (sem timeouts), nenhum protocolo determinístico consegue garantir consenso se pelo menos 1 processo pode falhar. Raft e Paxos contornam isso usando timeouts (modelo parcialmente síncrono) — a solução prática foi relaxar o modelo, não resolver o teorema.',
  },
  {
    question:
      'Em um cluster Raft de 5 nós, quantos precisam estar vivos para o cluster aceitar escritas?',
    options: [
      '2 (qualquer minoria)',
      '3 (maioria / quórum)',
      '4 (supermaioria)',
      '5 (todos — consistência forte exige unanimidade)',
    ],
    correct: 1,
    explanation:
      'Raft exige quórum de maioria (⌊N/2⌋+1). Em 5 nós → 3. Isso permite tolerar até 2 falhas simultâneas. A regra de maioria garante que dois quóruns sempre se interseccionam em pelo menos 1 nó, o que preserva segurança do log durante eleições.',
  },
  {
    question:
      'Na log replication do Raft, uma entry só é considerada committed quando:',
    options: [
      'O leader a escreve no próprio log',
      'A entry foi replicada em uma maioria de nós',
      'Todos os followers confirmam o recebimento',
      'O cliente recebe o ACK do leader',
    ],
    correct: 1,
    explanation:
      'Uma entry é committed quando está replicada em quórum de maioria. O leader só aplica na state machine (e responde ao cliente) depois desse commit. Esperar todos os nós perderia disponibilidade; aceitar só o próprio log perderia durabilidade durante falhas.',
  },
  {
    question:
      'Qual sistema abaixo NÃO usa Raft como protocolo de consenso?',
    options: [
      'etcd (backend de metadados do Kubernetes)',
      'Consul (HashiCorp)',
      'CockroachDB',
      'Apache Cassandra',
    ],
    correct: 3,
    explanation:
      'Cassandra é AP (eventual consistency) e usa gossip + hinted handoff, não consensus. etcd, Consul, CockroachDB (por range) e TiKV usam Raft. Spanner usa Paxos. ZooKeeper usa Zab (variante de Paxos). Saber qual protocolo um sistema usa ajuda a prever seu comportamento sob partição.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="consensus-raft"
      title="Consensus e Raft: como nós discordam e chegam a acordo"
      icon="🗳️"
      xp={90}
      readTime={18}
      trailName="Sistemas Distribuídos"
      trailColor={ACCENT}
      nextSlug="idempotencia-retries"
      nextTitle="Idempotência e Retries: o antídoto pra rede que quebra"
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
        Consensus é o problema mais fundamental dos sistemas distribuídos: como N máquinas
        <strong style={{ color: 'var(--ffv-fg)' }}> que podem falhar, mentir sobre o tempo e perder mensagens</strong> conseguem
        concordar em um único valor? A resposta dessa pergunta decide se o seu Kubernetes sobrevive
        a um reboot, se o seu CockroachDB não perde uma linha durante um failover, e se o seu
        sistema bancário pode aceitar débitos duplicados. Raft é o algoritmo mais influente dos últimos
        15 anos — mais simples que Paxos, provado correto, usado em produção por etcd, Consul,
        Kubernetes, CockroachDB, TiKV, MongoDB, Redpanda, RabbitMQ (quorum queues) e dezenas de outros.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Este módulo vai do <strong style={{ color: 'var(--ffv-fg)' }}>FLP impossibility</strong> (o
        teorema que diz que o impossível é possível se você for esperto) até uma implementação
        didática em Python. No fim, você vai saber por que 3 ou 5 é um número mágico, por que
        split-brain não acontece no Raft, e como debugar um cluster etcd quando ele trava.
      </p>

      <Section title="O problema do consenso" accent={ACCENT}>
        <p>
          Consenso: um conjunto de processos precisa <strong>concordar em um único valor</strong>,
          dado que cada processo propõe um valor e alguns podem falhar. Sons simples?
          Em teoria, é. Na prática — com rede não confiável, timeouts, máquinas que congelam por GC,
          e relógios que divergem — é o pesadelo que levou 30 anos de pesquisa pra domar.
        </p>

        <Callout tone="info">
          <strong>As 3 propriedades de consenso</strong>:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Agreement</strong>: todos os nós decidem o mesmo valor</li>
            <li><strong>Validity</strong>: o valor decidido foi proposto por algum processo</li>
            <li><strong>Termination</strong>: todos os processos corretos eventualmente decidem</li>
          </ul>
          <p className="mt-2">
            Parecem óbvias. Mas FLP prova que <em>as três juntas</em> são impossíveis num modelo
            assíncrono com falhas. Algo tem que ceder.
          </p>
        </Callout>
      </Section>

      <Section title="FLP Impossibility (1985): o teorema que mudou tudo" accent={ACCENT}>
        <p>
          Fischer, Lynch e Paterson provaram em 1985 o resultado mais importante de sistemas distribuídos:
        </p>
        <Callout tone="danger">
          <strong>Teorema FLP</strong>: em um sistema assíncrono (mensagens podem demorar arbitrariamente,
          processos podem ser arbitrariamente lentos), <em>nenhum protocolo determinístico</em> pode
          resolver consenso se pelo menos 1 processo pode falhar (crash fault).
        </Callout>
        <p>
          A intuição: sem limite superior no tempo de mensagens, você não consegue distinguir um
          processo <em>morto</em> de um processo <em>lento</em>. Se você espera, pode esperar pra
          sempre. Se não espera, pode decidir sem contar com ele e quebrar agreement.
        </p>

        <p><strong>Como a prática contornou FLP?</strong> Três escapes principais:</p>
        <ComparisonTable
          headers={['Escape', 'Ideia', 'Quem usa']}
          rows={[
            [
              'Modelo parcialmente síncrono',
              'Assume que mensagens eventualmente chegam em tempo limitado. Na prática: timeouts.',
              'Raft, Paxos, PBFT',
            ],
            [
              'Protocolos randomizados',
              'Usa aleatoriedade pra quebrar simetria — termina com probabilidade 1 (não determinístico).',
              'Ben-Or, Avalanche',
            ],
            [
              'Failure detectors',
              'Oracle externo que "diz" quem falhou. Chandra-Toueg (1996) mostrou que ◇S é suficiente.',
              'Paxos (implicitamente)',
            ],
          ]}
        />
        <p>
          <strong>Raft e Paxos pagam o preço assumindo timeouts.</strong> Isso significa: em uma
          partição de rede muito longa, o cluster <em>pode ficar indisponível</em> (escolhe
          consistência — CP no CAP). É uma escolha deliberada.
        </p>
      </Section>

      <Section title="Paxos: o pai (difícil) de todos" accent={ACCENT}>
        <p>
          Paxos foi proposto por Leslie Lamport em 1989 e publicado formalmente em 1998
          ("The Part-Time Parliament"). Ganhou Turing Award, inspirou uma geração de sistemas —
          e <strong>todo mundo acha horrível de entender</strong>. Lamport escreveu o paper como
          uma alegoria sobre um parlamento na Grécia antiga. Foi rejeitado. Reescreveu simples ("Paxos Made Simple", 2001)
          e ainda assim é difícil.
        </p>
        <p><strong>Intuição em 3 fases</strong>:</p>
        <ArchDiagram>
{`Cliente ──► PROPONER ──► ACCEPTORS (2F+1 nós, tolera F falhas)
                │             │
                │  1. PREPARE(n)                     ──► todos os acceptors
                │                                    ◄── PROMISE(n, maior valor já aceito)
                │
                │  2. ACCEPT(n, v)  (v = valor escolhido)  ──► todos
                │                                    ◄── ACCEPTED(n, v) de quórum
                │
                │  3. LEARN(v)                       ──► LEARNERS aplicam v
                ▼
            Valor decidido`}
        </ArchDiagram>
        <p>
          A <strong>complexidade real</strong> do Paxos vem de Multi-Paxos (sequência de decisões),
          reconfigurações dinâmicas e otimizações. Ninguém implementa Paxos do paper — todas
          as implementações usam variantes (Zab, Raft, Viewstamped Replication). Isso levou
          Ongaro e Ousterhout a criarem o Raft em 2014 com um objetivo explícito: <em>ser entendível</em>.
        </p>
        <Callout tone="warn">
          <strong>Por que Paxos sobreviveu?</strong> Performance e flexibilidade. Spanner (Google),
          Chubby, BigTable e YugabyteDB usam Paxos por otimizações avançadas (Fast Paxos, EPaxos,
          Flexible Paxos). Para a maioria dos casos, Raft resolve 99% do problema com 1% da dor.
        </Callout>
      </Section>

      <Section title="Raft: Paxos que um humano normal consegue entender" accent={ACCENT}>
        <p>
          Raft foi projetado em Stanford (2014) com o objetivo explícito de ser didático.
          Ele decompõe o problema em 3 subproblemas independentes que você pode estudar separadamente:
        </p>
        <ComparisonTable
          headers={['Subproblema', 'O que resolve']}
          rows={[
            ['Leader Election', 'Como escolher um único leader por term (período de tempo)'],
            ['Log Replication', 'Como o leader propaga entries para os followers em ordem'],
            ['Safety', 'Invariantes que garantem que duas máquinas nunca aplicam decisões diferentes'],
          ]}
        />

        <p><strong>Estados de um nó Raft</strong>:</p>
        <ArchDiagram>
{`               timeout, start election
     ┌──────────────────────────────────────────┐
     ▼                                           │
┌─────────┐   discovers leader/        ┌──────────────┐
│FOLLOWER │──── higher term ──────────►│  CANDIDATE   │
│         │◄───────────────────────────│              │
└─────────┘                            └──────────────┘
     ▲                                         │
     │                                         │ wins election
     │     discovers higher term               │ (maioria de votos)
     │                                         ▼
     │                                 ┌──────────────┐
     └─────────────────────────────────│    LEADER    │
                                        └──────────────┘`}
        </ArchDiagram>

        <p>
          A vida inteira do cluster é dividida em <strong>terms</strong> (períodos numerados monotonicamente).
          Cada term tem <em>no máximo 1 leader</em>. Se um term não eleger leader (split vote), um novo
          term começa. O número do term é carimbado em cada RPC e entry — e é a <strong>chave da safety do Raft</strong>.
        </p>
      </Section>

      <Section title="Leader Election: como escolher o chefe" accent={ACCENT}>
        <p>
          Quando um follower não recebe heartbeat do leader em <InlineCode>electionTimeout</InlineCode>
          (tipicamente 150-300ms, randomizado pra evitar split votes), ele:
        </p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Vira <strong>candidate</strong></li>
          <li>Incrementa seu <InlineCode>currentTerm</InlineCode></li>
          <li>Vota em si mesmo</li>
          <li>Envia <InlineCode>RequestVote(term, candidateId, lastLogIndex, lastLogTerm)</InlineCode> pra todos</li>
          <li>Se recebe maioria → vira leader, começa a mandar heartbeats</li>
          <li>Se recebe heartbeat de leader legítimo (term &gt;= seu) → volta a follower</li>
          <li>Se timeout sem decisão → novo term, nova eleição</li>
        </ol>

        <Callout tone="info">
          <strong>Regras de voto</strong> (garantia de safety): um nó só vota em um candidato se:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Ainda não votou nesse term (ou já votou no mesmo candidato)</li>
            <li>O log do candidato é <em>pelo menos tão atualizado</em> quanto o seu
              (lastLogTerm maior, ou lastLogTerm igual e lastLogIndex &gt;= o seu)</li>
          </ul>
          <p className="mt-2">
            Isso garante a <strong>Leader Completeness Property</strong>: qualquer leader eleito tem
            todas as entries committed dos terms anteriores. Sem isso, Raft não funciona.
          </p>
        </Callout>

        <p><strong>Implementação didática de RequestVote</strong> (Python):</p>
        <CodeBlock lang="python">{`# request_vote.py — mostra as regras de voto do Raft
from dataclasses import dataclass

@dataclass
class RaftNode:
    id: str
    current_term: int = 0
    voted_for: str | None = None
    log: list = None                  # lista de (term, command)

    def last_log_index(self) -> int:
        return len(self.log or []) - 1

    def last_log_term(self) -> int:
        return self.log[-1][0] if self.log else 0

    def handle_request_vote(
        self,
        candidate_id: str,
        candidate_term: int,
        candidate_last_idx: int,
        candidate_last_term: int,
    ) -> tuple[int, bool]:
        # Rule 1: term antigo — recusa
        if candidate_term < self.current_term:
            return (self.current_term, False)

        # Rule 2: term maior — atualiza e volta a follower
        if candidate_term > self.current_term:
            self.current_term = candidate_term
            self.voted_for = None

        # Rule 3: já votou em outro candidato neste term — recusa
        if self.voted_for not in (None, candidate_id):
            return (self.current_term, False)

        # Rule 4: log do candidato é atualizado o suficiente?
        # "up-to-date": maior term vence; mesmo term → maior índice vence
        my_last_term = self.last_log_term()
        my_last_idx = self.last_log_index()
        log_ok = (
            candidate_last_term > my_last_term
            or (candidate_last_term == my_last_term and candidate_last_idx >= my_last_idx)
        )
        if not log_ok:
            return (self.current_term, False)

        # Concede voto
        self.voted_for = candidate_id
        return (self.current_term, True)`}</CodeBlock>

        <Callout tone="warn">
          <strong>Por que randomizar o electionTimeout?</strong> Se dois followers timed out ao mesmo tempo,
          os dois viram candidate e split votam. Com timeout aleatório (ex: 150-300ms uniforme), a
          probabilidade de colisão repetida cai exponencialmente. É por isso que Raft <em>quase sempre</em>
          elege um leader em 1-2 rodadas.
        </Callout>
      </Section>

      <Section title="Log Replication: como o leader replica entries" accent={ACCENT}>
        <p>
          Uma vez eleito, o leader começa a atender clientes. Cada comando vira uma
          <strong> log entry</strong> (term + índice + comando). O protocolo é:
        </p>
        <ArchDiagram>
{`CLIENTE              LEADER                  FOLLOWERS (2+ em cluster de 5)
   │                    │                          │
   ├─ command ─────────►│                          │
   │                    │  1. Append ao seu log   │
   │                    │     (term=T, idx=I)      │
   │                    │                          │
   │                    ├─ AppendEntries(T,I,cmd) ►│  (em paralelo pra todos)
   │                    │                          ├─ Valida log consistency
   │                    │                          ├─ Append ao próprio log
   │                    │◄─── ACK ─────────────────┤
   │                    │                          │
   │                    │  2. Recebe ACK de maioria (quórum)
   │                    │                          │
   │                    │  3. commitIndex = I      │
   │                    │     aplica na state machine
   │                    │                          │
   │◄─ result ──────────┤                          │
   │                    │                          │
   │                    ├─ heartbeat (com commitIdx)►│
   │                    │                          ├─ followers aplicam entries
   │                    │                          │   committed na state machine`}
        </ArchDiagram>

        <p><strong>A RPC <InlineCode>AppendEntries</InlineCode></strong> carrega (entre outros):</p>
        <ul className="list-disc space-y-1 pl-6">
          <li><InlineCode>term</InlineCode>: term do leader</li>
          <li><InlineCode>prevLogIndex</InlineCode>, <InlineCode>prevLogTerm</InlineCode>: o índice/term da entry <em>imediatamente antes</em> das novas — usado pra <strong>log matching</strong></li>
          <li><InlineCode>entries[]</InlineCode>: lista de entries novas</li>
          <li><InlineCode>leaderCommit</InlineCode>: o <InlineCode>commitIndex</InlineCode> atual do leader</li>
        </ul>

        <Callout tone="info">
          <strong>Log Matching Property</strong>: se duas entries em logs diferentes têm
          o mesmo (term, index), elas contêm o <em>mesmo comando</em> E <em>todos</em> os
          prefixos também coincidem. O follower rejeita AppendEntries se o prevLog não bate,
          e o leader decrementa <InlineCode>nextIndex</InlineCode> daquele follower e tenta
          de novo com entry mais antiga. Eventualmente encontram um ponto comum.
        </Callout>

        <p><strong>Mini-implementação do AppendEntries</strong>:</p>
        <CodeBlock lang="python">{`# append_entries.py — log replication do lado do follower
def handle_append_entries(
    node: RaftNode,
    leader_term: int,
    prev_log_idx: int,
    prev_log_term: int,
    entries: list,          # [(term, cmd), ...]
    leader_commit: int,
) -> tuple[int, bool]:
    # 1. Term antigo — rejeita
    if leader_term < node.current_term:
        return (node.current_term, False)

    # 2. Atualiza term se o leader tem term maior
    if leader_term > node.current_term:
        node.current_term = leader_term
        node.voted_for = None

    # 3. Reset election timer (recebeu heartbeat válido)
    node.reset_election_timer()

    # 4. Log matching check: prevLog precisa existir e bater
    log = node.log or []
    if prev_log_idx >= 0:
        if prev_log_idx >= len(log):
            return (node.current_term, False)  # log do follower é curto demais
        if log[prev_log_idx][0] != prev_log_term:
            return (node.current_term, False)  # term não bate — conflito

    # 5. Append entries (truncando conflitos, se houver)
    for i, (term, cmd) in enumerate(entries):
        idx = prev_log_idx + 1 + i
        if idx < len(log) and log[idx][0] != term:
            # conflito: trunca tudo a partir daqui
            log = log[:idx]
        if idx >= len(log):
            log.append((term, cmd))
    node.log = log

    # 6. Avança commitIndex até o min(leaderCommit, último índice local)
    if leader_commit > node.commit_index:
        node.commit_index = min(leader_commit, len(log) - 1)
        node.apply_committed_entries()

    return (node.current_term, True)`}</CodeBlock>

        <Callout tone="danger">
          <strong>Safety: Leader Completeness</strong>. Raft tem uma regra sutil que evita
          corrupção: um leader <em>só pode commit entries do seu próprio term diretamente</em>.
          Entries de terms anteriores são committed <em>indiretamente</em> quando uma entry
          do term atual é committed em cima delas. Esse detalhe (descrito como "Figure 8"
          no paper) é o ponto mais confuso do Raft — mas é o que garante que safety não quebra
          durante falhas.
        </Callout>
      </Section>

      <Section title="Safety: as 5 propriedades que Raft garante" accent={ACCENT}>
        <ComparisonTable
          headers={['Propriedade', 'O que garante']}
          rows={[
            [
              'Election Safety',
              'No máximo 1 leader por term (garantido pela regra de voto único)',
            ],
            [
              'Leader Append-Only',
              'Leader nunca sobrescreve ou deleta entries do próprio log — só adiciona',
            ],
            [
              'Log Matching',
              'Se dois logs têm uma entry com mesmo (term, index), eles são idênticos até esse ponto',
            ],
            [
              'Leader Completeness',
              'Se uma entry foi committed em term T, ela aparece no log de todos os leaders futuros',
            ],
            [
              'State Machine Safety',
              'Se um nó aplicou uma entry em índice I na state machine, nenhum outro nó aplicará uma entry diferente em I',
            ],
          ]}
        />
        <p>
          Essas 5 propriedades são provadas formalmente no paper original e verificadas em TLA+.
          Elas <strong>valem mesmo em cenários patológicos</strong>: crashes em rajada, partições
          assimétricas, reordenação de mensagens, máquinas congelando por minutos.
        </p>
      </Section>

      <Section title="Quem usa Raft em produção" accent={ACCENT}>
        <ComparisonTable
          headers={['Sistema', 'Uso do Raft', 'Observações']}
          rows={[
            ['etcd', 'Backend de metadados do Kubernetes (API server state)', 'Cluster 3 ou 5 nós típico. Se etcd cai, o K8s control plane para.'],
            ['Consul (HashiCorp)', 'Service discovery, KV, leader election', 'Raft por datacenter; gossip entre DCs.'],
            ['CockroachDB', 'Raft por range (cada shard tem seu próprio cluster Raft)', 'Milhares de grupos Raft por cluster — escala horizontal real.'],
            ['TiKV / TiDB', 'Raft por region (shard)', 'Mesmo padrão do CockroachDB.'],
            ['MongoDB (4.0+)', 'Replica set election baseada em Raft', 'Antes era protocolo próprio; migraram pra Raft por simplicidade.'],
            ['Redpanda', 'Kafka-compatible usando Raft (não ZooKeeper/KRaft)', 'Uma partição Kafka = um grupo Raft.'],
            ['RabbitMQ', 'Quorum queues (substituem mirror queues antigas)', 'Raft garante no-data-loss mesmo com crash do leader.'],
            ['Kafka (KRaft)', 'Substituto do ZooKeeper desde 3.3', 'Usa Kafka Raft Metadata Mode em vez de ZK.'],
          ]}
        />
        <p>
          Se você usa Kubernetes, você <em>já depende de Raft</em>. Quando o etcd fica lento,
          seu API server responde 500. Quando o quórum do etcd quebra (2 de 3 nós mortos),
          o K8s vira read-only e depois morre. Entender Raft = entender o chão onde seu cluster anda.
        </p>
      </Section>

      <Section title="Decisões reais" accent={ACCENT}>
        <DecisionBox
          scenario="Cluster etcd do Kubernetes: 3 ou 5 nós?"
          winner="5 nós em produção séria"
          winnerColor={ACCENT}
          why="3 nós tolera 1 falha — se você perde 1 num reboot planejado e outro falha inesperado, o cluster congela. 5 nós tolera 2 falhas simultâneas e permite rolling upgrade sem janela de risco. O custo adicional (2 VMs) é desprezível contra a dor de recuperar um etcd morto."
          alternatives={[
            { label: '3 nós para dev/staging', note: 'Tolera 1 falha, economia real.' },
            { label: '7+ nós: não', note: 'Cada AppendEntries vai pra mais nós → latência de escrita aumenta, throughput cai. 5 é o sweet spot.' },
          ]}
        />
        <DecisionBox
          scenario="Escolher Raft ou Paxos para um novo sistema"
          winner="Raft, quase sempre"
          winnerColor={ACCENT}
          why="Raft é mais simples de implementar, debugar e explicar. Bibliotecas maduras existem em Go (hashicorp/raft, etcd-io/raft), Rust (openraft, tikv/raft-rs), Java (atomix, copycat). Paxos faz sentido só quando você precisa de otimizações específicas (Fast Paxos, EPaxos pra latência wan, Flexible Paxos pra quóruns assimétricos) e tem time de pesquisa pra manter."
          alternatives={[
            { label: 'Paxos (Multi-Paxos / EPaxos)', note: 'Quando latência WAN importa muito (Spanner).' },
            { label: 'Zab (ZooKeeper)', note: 'Se você já tem ZK infra madura.' },
            { label: 'Viewstamped Replication', note: 'Origem intelectual do Raft. Academicamente interessante, pouco usado em produção.' },
          ]}
        />
        <DecisionBox
          scenario="Aplicação web precisa de 'eleição de líder' simples (ex: cron singleton)"
          winner="Use Redis Redlock ou PostgreSQL advisory lock"
          winnerColor={ACCENT}
          why="Você não precisa de Raft pra eleger quem roda uma cron todo minuto. Raft é pesado — full state machine + log durável + eleição. Pra leader election leve (cron singleton, rate limiter coordinator), advisory lock no PG ou lease com TTL no Redis resolve com 10 linhas de código."
          alternatives={[
            { label: 'Redlock no Redis', note: 'Com TTL + renovação. Ver papers do Kleppmann sobre limites.' },
            { label: 'etcd lease', note: 'Se você já tem etcd (K8s), use lease com TTL.' },
            { label: 'Postgres pg_try_advisory_lock', note: 'Se você tem PG, literalmente 1 linha.' },
          ]}
        />
      </Section>

      <Section title="Operação: o que dói no dia a dia" accent={ACCENT}>
        <ComparisonTable
          headers={['Problema', 'Sintoma', 'Como diagnosticar']}
          rows={[
            [
              'Split brain (nunca acontece em Raft real)',
              'Dois nós se dizem leader',
              'Verifique terms. Leader novo tem term maior — followers rejeitarão o velho. Se acontece, há bug na implementação.',
            ],
            [
              'Cluster sem quórum',
              'Escritas timed out, nenhum nó respondendo',
              'etcdctl endpoint status: veja quantos nós estão vivos. Se < ⌊N/2⌋+1, pare escritas até recuperar.',
            ],
            [
              'Leader flapping',
              'Eleições constantes, muitos term changes',
              'Rede instável (jitter alto), GC pauses longos (&gt;electionTimeout), heartbeat perdido. Aumente electionTimeout ou investigue infra.',
            ],
            [
              'Log compaction parada',
              'Disco enche, escritas lentas',
              'Raft precisa de snapshots periódicos pra compactar log. Config snapshot-count (etcd) ou equivalente.',
            ],
            [
              'Cluster impossível de recuperar',
              'Quórum perdido permanentemente (3/3 corrompidos)',
              'etcd tem etcdctl snapshot restore — reconstrói cluster de 1 snapshot. Procedimento de último recurso.',
            ],
          ]}
        />
        <Callout tone="warn">
          <strong>Regra de ouro operacional</strong>: <em>nunca faça maintenance em mais de
          ⌊N/2⌋ nós simultaneamente</em>. Num cluster de 5, reboote 1 por vez, espere voltar
          como follower saudável antes do próximo. É o erro operacional #1 que mata clusters etcd.
        </Callout>
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <div className="flex flex-col gap-4">
          <div>
            <p><strong>Por que sempre número ímpar de nós?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Um cluster de 4 nós tolera 1 falha (quórum = 3). Um cluster de 5 nós tolera 2 falhas (quórum = 3).
              Mesmo quórum, mesmo custo de escrita, mas o de 5 tolera mais falhas. Números pares
              desperdiçam 1 nó. 3, 5, 7 são os padrões.
            </p>
          </div>
          <div>
            <p><strong>Raft tolera bizantinos (nós mentirosos)?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Não. Raft assume modelo de <em>crash fault</em>: nós caem, mas não mentem. Se um nó
              é comprometido (malicious), Raft pode aceitar entries inválidas. Pra BFT, use PBFT,
              HotStuff, Tendermint (usado por blockchains). Custo: quórum de 2F+1 em crash fault
              vs 3F+1 em byzantine fault.
            </p>
          </div>
          <div>
            <p><strong>Por que o Raft performs pior em WAN?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Cada escrita precisa de round-trip do leader pro quórum. Se o leader está em us-east-1 e
              tem follower em eu-west-1, você paga 80-100ms por escrita. Por isso Spanner usa Paxos
              com Commit Wait + TrueTime, e CockroachDB usa geo-partitioning (dados "locais" ficam
              em quórum local). Raft vanilla não é ótimo pra multi-region writes.
            </p>
          </div>
          <div>
            <p><strong>O que é "Pre-Vote"?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Extensão do Raft pra evitar "disruptive servers": um nó isolado volta ao cluster
              com term muito alto e força reeleição desnecessária. Pre-Vote faz o candidate
              perguntar "eu ganharia?" antes de incrementar o term. etcd e hashicorp/raft usam.
            </p>
          </div>
          <div>
            <p><strong>Quando Raft fica indisponível mesmo sem falha?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Em partições de rede que separam o leader da maioria. O leader antigo vira follower
              (perde quórum de heartbeat); a maioria elege novo leader. Durante a transição
              (100-500ms típico), o cluster rejeita escritas. É a manifestação do CP-no-CAP.
            </p>
          </div>
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways</strong>:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Consenso é <em>impossível</em> em modelo assíncrono puro (FLP). Raft contorna com timeouts.</li>
          <li>Raft = Leader Election + Log Replication + Safety, com <strong>terms monotônicos</strong> como chave.</li>
          <li>Quórum de <strong>maioria ⌊N/2⌋+1</strong>: 3 tolera 1 falha, 5 tolera 2. Use ímpar.</li>
          <li>Entries committed quando replicadas em quórum. Leader só commit entries do próprio term diretamente.</li>
          <li>Em produção: etcd/Consul/CockroachDB/K8s dependem de Raft. Cuidar do cluster = cuidar do ingresso.</li>
          <li>Raft é CP no CAP: partições podem causar indisponibilidade, mas nunca dados inconsistentes.</li>
          <li>Não use Raft pra leader election trivial — advisory lock resolve.</li>
        </ul>
      </Callout>

      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Próximo módulo: agora que sabemos como o cluster concorda, vamos ver como <em>o cliente</em>
        sobrevive a rede quebrada — idempotência e retries.
      </p>
    </div>
  );
}
