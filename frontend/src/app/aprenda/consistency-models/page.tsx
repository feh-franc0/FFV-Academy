import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  DecisionBox,
  QAItem,
  HierarchyDiagram,
  CodeBlock,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('consistency-models');

const ACCENT = '#f78166';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre linearizability e sequential consistency?',
    options: [
      'São sinônimos',
      'Linearizability exige que operações pareçam ter ocorrido instantaneamente em algum ponto entre início e fim (real-time order respeitada). Sequential consistency exige só que exista alguma ordem total compatível com a ordem de cada thread — não precisa respeitar tempo real. Linearizability é mais forte',
      'Sequential é mais forte',
      'Linearizability é só em single-node',
    ],
    correct: 1,
    explanation:
      'Linearizability (Herlihy & Wing, 1990) = "parece um sistema single-threaded em tempo real". Sequential consistency (Lamport, 1979) = "parece single-threaded, mas pode reordenar operações de diferentes processos". Exemplo: se A escreve x=1 e DEPOIS (em tempo real) B escreve x=2, linearizability força a ordem A→B; sequential permite B→A se for consistente com a ordem interna de cada um.',
  },
  {
    question: 'O que é "read-your-writes" e quando é crítico?',
    options: [
      'Uma otimização de cache',
      'Garantia de sessão em que, depois de uma escrita, leituras do MESMO cliente refletem essa escrita — independente de outros clientes verem ou não. Crítico em UX de form submit: "atualizei meu perfil e ao recarregar vejo o antigo" é bug grave. Resolvido por sticky session ao primary, timestamps de sessão ou cookie "read-from" ',
      'Sempre dado',
      'Só no Redis',
    ],
    correct: 1,
    explanation:
      'Session guarantees (Terry et al. 1994) são mais fracas que linearizability global mas resolvem 80% das dores de UX. Read-your-writes evita o bug clássico "atualizei e sumiu". Implementação: roteia leituras para o primary após write na mesma sessão; ou guarda write-timestamp e força leitura em réplica com LSN ≥ esse timestamp. Postgres read replica + cookie com LSN é um pattern concreto.',
  },
  {
    question: 'Por que causal consistency é o sweet spot em muitos sistemas sociais?',
    options: [
      'É sempre o mais barato',
      'Porque preserva relação causal (se A depende de B, todo cliente vê B antes de A) sem exigir ordem total global. Exemplo: em um comentário-resposta, ninguém deve ver a resposta antes do comentário pai. Mais barato que linearizability (não exige quorum global) mas mais forte que eventual (não pode "voltar no tempo")',
      'É o modelo mais forte',
      'Só funciona em grafos',
    ],
    correct: 1,
    explanation:
      'Causal consistency (Ahamad et al. 1995) captura "happens-before". Em chat, timeline de posts com reply-to, votos em comentário — se A happened-before B para quem observou, toda sessão futura também deve ver essa ordem. Implementa-se com vector clocks ou dependencies explícitas. COPS, Cassandra LWW-e-versionado com vector, Riak com DVVs — tudo roda nesse regime em escala.',
  },
  {
    question: 'Qual o erro mais comum ao "escolher eventual consistency"?',
    options: [
      'Escolher eventual quando precisa',
      'Tratar "eventual" como "eventualmente certo, desde que o cliente tolere". Na prática, eventual sem session guarantees quebra UX básica (read-your-writes) e requer regras de resolução explícitas (last-write-wins perde dados; CRDTs se adequados; app-level merge complexo). "Eventual" é o chão, não o teto',
      'Usar eventual em e-commerce',
      'Usar eventual junto com quorum',
    ],
    correct: 1,
    explanation:
      'Eventual consistency é "se você parar de escrever, eventualmente converge". Não diz em quanto tempo, nem o que acontece durante. Em produção você quer ao menos session guarantees: read-your-writes, monotonic reads, monotonic writes. LWW descarta escritas concorrentes (pode perder dados sem você perceber). CRDTs resolvem mas só em estruturas específicas. "Eventual" sozinho raramente é suficiente para UX decente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="consistency-models"
      title="Modelos de Consistência: strong, eventual, causal, read-your-writes"
      icon="🔄"
      xp={85}
      readTime={17}
      trailName="Sistemas Distribuídos"
      trailColor={ACCENT}
      nextSlug="consensus-raft"
      nextTitle="Consensus e Raft: como nós discordam e chegam a acordo"
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
        "Eventualmente consistente" e "fortemente consistente" são slogans que escondem uma hierarquia rica. Este
        módulo explica a escada de modelos — <strong>linearizability</strong>, <strong>sequential</strong>,
        <strong> causal</strong>, <strong>eventual</strong> — e as <strong>session guarantees</strong>
        (read-your-writes, monotonic reads, bounded staleness) que resolvem a maioria dos problemas reais sem pagar
        o custo de consistência global.
      </p>

      <Section title="A escada de consistência (do mais forte ao mais fraco)" accent={ACCENT}>
        <HierarchyDiagram
          title="Hierarquia de consistência"
          accent={ACCENT}
          levels={[
            { label: 'Strict / Linearizability', desc: 'mais forte, mais caro — ordem global + tempo real' },
            { label: 'Sequential Consistency', desc: 'ordem total coerente com cada processo' },
            { label: 'Causal Consistency', desc: 'preserva happens-before; concorrentes livres' },
            { label: 'PRAM / FIFO Consistency', desc: 'cada escritor visto em ordem por todos' },
            { label: 'Session Guarantees', desc: 'prático, suficiente em 80% — read-your-writes, monotonic r/w' },
            { label: 'Eventual Consistency', desc: 'mais fraco, mais rápido — converge sem novas escritas' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Garantia', 'Preço típico']}
          rows={[
            ['Linearizability', 'Ordem global + tempo real; parece single-threaded', 'Quorum/consenso; latência alta'],
            ['Sequential', 'Ordem total coerente com ordem de cada proc.', 'Menor que linearizability, mas ainda exige coordenação'],
            ['Causal', 'Preserva happens-before; concorrentes livres', 'Vector clocks / dependency tracking'],
            ['PRAM / FIFO', 'Cada escritor visto em ordem por todos', 'Muito barato, raramente suficiente'],
            ['Session guarantees', 'Consistência dentro da sessão do cliente', 'Sticky session ou LSN tracking'],
            ['Eventual', 'Sem novas escritas, converge', 'Mínimo; resolução LWW/CRDT/manual'],
          ]}
        />
      </Section>

      <Section title="Linearizability: o modelo que parece 'um banco só'" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Linearizability é o padrão mental default do desenvolvedor single-node: "o que escrevi agora, qualquer
          leitura depois vê". Em sistema distribuído isso exige coordenação — commit em quorum, ou consenso
          (Raft/Paxos) para decidir ordem global.
        </p>
        <CodeBlock lang="text">{`Operações de 3 clientes em paralelo:

Client A: ──── write(x=1) ─── [ack] ─────────────────────────────
Client B: ─────── read(x) ──────── [retorna 1] ──────────────────
Client C: ─────────────── read(x) ─────── [retorna 1] ───────────

Linearizability exige: tudo parece ter ocorrido em UM instante entre
início e fim de cada op, respeitando ordem real. Se B começou READ
APÓS o ack de A, B DEVE ver x=1.`}</CodeBlock>
        <Callout tone="warn">
          Linearizability global em múltiplas regiões tem latência mínima limitada pela velocidade da luz — round-trip
          entre São Paulo e Virginia é ~200ms. Aplicações globais PAGAM essa latência ou aceitam modelos mais fracos.
          Spanner usa TrueTime para mitigar, mas ainda tem commit-wait.
        </Callout>
      </Section>

      <Section title="Causal consistency: preservando o 'porque'" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Causal consistency (Lamport/Ahamad) define que toda ordem <em>causal</em> é respeitada por todos
          observadores. Se operação A <em>happens-before</em> B, ninguém vê B sem A. Operações concorrentes (sem
          causa-efeito) podem aparecer em qualquer ordem.
        </p>
        <CodeBlock lang="text">{`Cenário clássico de chat:
  Alice posta:  "Acabei de me casar!"              (evento e1)
  Bob responde: "Parabéns!"                         (evento e2, depende de e1)

  Carol abre o app e lê os dois. Causal exige que Carol veja e1 ANTES de e2.
  Eventual não garante — Carol poderia ver só "Parabéns!" até o post chegar.
  Linearizability garante, mas cobra ordem total global — caro demais.

Vector clocks ou dependency tracking resolvem causal com custo razoável.`}</CodeBlock>
        <Callout tone="info">
          Produtos como Facebook, LinkedIn e Twitter consomem artigos e papers sobre causal como base. Sistemas como
          COPS, Eiger, TARDiS implementam causal+ em geo-distribuição. Um feed "bom o suficiente" em 10 regiões
          costuma ser causal — mais forte que eventual, mais barato que linearizability.
        </Callout>
      </Section>

      <Section title="Session guarantees: o que resolve UX real" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Guarantee', 'O que garante', 'Quando importa']}
          rows={[
            ['Read-your-writes', 'Depois de escrever, suas leituras refletem', 'Atualização de perfil, submit de form'],
            ['Monotonic reads', 'Leituras sucessivas não "voltam no tempo"', 'Feed, lista paginada'],
            ['Monotonic writes', 'Suas escritas aplicam em ordem', 'Updates sequenciais no mesmo recurso'],
            ['Writes-follow-reads', 'Se você leu X, suas escritas vêm depois', 'Comentário depois de ler post'],
            ['Bounded staleness', 'Leitura atrasa no máximo Δ tempo ou N versões', 'Dashboard, métricas'],
          ]}
        />
        <CodeBlock lang="python">{`# Read-your-writes em Postgres com read replicas — pattern com LSN no cookie
import psycopg

def write(conn, user_id: str, bio: str) -> int:
    with conn.cursor() as cur:
        cur.execute("UPDATE users SET bio=%s WHERE id=%s RETURNING pg_current_wal_lsn()", (bio, user_id))
        lsn = cur.fetchone()[0]
    conn.commit()
    return lsn                 # envia para client (cookie/header)

def read(user_id: str, client_lsn: str | None) -> dict:
    # Se o client tem LSN, obrigue leitura em replica com replay >= LSN
    if client_lsn:
        replica = pick_replica_at_or_after(client_lsn)      # sua função de routing
        if not replica:
            replica = PRIMARY                                # fallback
    else:
        replica = pick_any_replica()
    with replica.cursor() as cur:
        cur.execute("SELECT bio FROM users WHERE id=%s", (user_id,))
        return {"bio": cur.fetchone()[0]}`}</CodeBlock>
      </Section>

      <Section title="Bounded staleness: o contrato do 'quase tempo real'" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em dashboards, relatórios, alimentação de BI e feature stores, você aceita atraso — desde que limitado.
          Bounded staleness define o limite: "leitura atrasa no máximo 5 segundos ou 100 versões". Sistemas como
          Azure Cosmos DB expõem essa opção como nível de consistência.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Caso', 'Modelo adequado', 'Por que']}
          rows={[
            ['Transferência bancária', 'Linearizability', 'Dinheiro não divergente'],
            ['Leaderboard de jogo', 'Bounded staleness (~5s)', 'Pequeno atraso é ok; ranking não precisa ser exato'],
            ['Feed social', 'Causal', 'Ordem reply-to importa; ordem global não'],
            ['Carrinho de compras', 'Eventual + CRDT', 'Ganho de disponibilidade > custo de resolver conflito'],
            ['Cache de sessão', 'Read-your-writes', 'Usuário precisa ver seus próprios updates'],
            ['Auditoria/compliance', 'Linearizability', 'Ordem importa para auditor'],
            ['Analytics', 'Eventual', 'Aggregates toleram delay e inconsistência minor'],
          ]}
        />
      </Section>

      <Section title="Implementando read-your-writes sem quebrar o banco" accent={ACCENT}>
        <DecisionBox
          scenario="App com primary Postgres + 3 read replicas async; equipe reporta 'atualizei mas ao voltar na página apareceu o antigo'"
          winner="Cookie com LSN + routing para replica que replayou até o LSN"
          winnerColor={ACCENT}
          why="Mantém benefício de read replicas (escalabilidade), não força tudo no primary. Overhead mínimo — um cookie e um check de replay status."
          alternatives={[
            { name: 'Sticky to primary por N segundos', note: 'simples; derrota o propósito da replica durante a janela' },
            { name: 'Strong consistency everywhere', note: 'performance tanks; não precisa disso para o resto das queries' },
          ]}
        />
        <Callout tone="info">
          Em microserviços, esse mesmo princípio aplica em event-driven: guarde o offset de Kafka que seu serviço
          leu; garanta que downstream (projeções CQRS) já tenha processado esse offset antes de ler. É read-your-writes
          em versão event-sourced.
        </Callout>
      </Section>

      <Section title="Conflict resolution: last-write-wins, CRDT e merge" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estratégia', 'Como funciona', 'Risco']}
          rows={[
            ['Last-Write-Wins (LWW)', 'Timestamp ganha o mais recente; perde outros', 'Silently drops writes; clock skew perigoso'],
            ['Vector clocks + dequeue de conflitos para app', 'Identifica concorrência; app decide merge', 'Complexidade; exige UI de resolução'],
            ['CRDT (Counter, OR-Set, LWW-Map, RGA)', 'Estruturas matematicamente comutativas; merge automático', 'Overhead de metadata; não serve para tudo'],
            ['Operational Transform (OT)', 'Transforma operações concorrentes para manter intenção', 'Complexo; usado em Google Docs legado'],
            ['Semantic merge', 'Regras por tipo de dado (carrinho: união; saldo: soma de deltas)', 'Trabalho de domínio; erro fica invisível'],
          ]}
        />
        <CodeBlock lang="python">{`# OR-Set simples (CRDT) — adiciona e remove sem perder operações concorrentes
from dataclasses import dataclass, field
import uuid

@dataclass
class ORSet:
    adds:    dict[str, set[str]] = field(default_factory=dict)   # item -> set de uids
    removes: dict[str, set[str]] = field(default_factory=dict)

    def add(self, item: str) -> None:
        uid = str(uuid.uuid4())
        self.adds.setdefault(item, set()).add(uid)

    def remove(self, item: str) -> None:
        for uid in self.adds.get(item, set()):
            self.removes.setdefault(item, set()).add(uid)

    def value(self) -> set[str]:
        return {
            it for it, uids in self.adds.items()
            if uids - self.removes.get(it, set())
        }

    def merge(self, other: "ORSet") -> "ORSet":
        r = ORSet()
        for it in set(self.adds) | set(other.adds):
            r.adds[it] = self.adds.get(it, set()) | other.adds.get(it, set())
        for it in set(self.removes) | set(other.removes):
            r.removes[it] = self.removes.get(it, set()) | other.removes.get(it, set())
        return r`}</CodeBlock>
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Linearizability é o 'certo' e os outros são compromissos?"
          a={<>Errado olhar assim. Linearizability é o MAIS FORTE, mas tem custo fixo de latência que nem sempre é justificável. "Certo" é o modelo mais fraco que preserva os invariantes do seu domínio. Para um feed, causal basta. Para dinheiro, nada menos que linearizability.</>}
        />
        <QAItem
          q="Redis é linearizable?"
          a={<>Single-node sim. Redis Cluster não — é AP. Para garantias fortes em Redis distribuído, use Redis Sentinel/Cluster com cuidado e tolere read from stale replica em reads não-críticas. RedLock foi questionado como algoritmo de lock distribuído (Kleppmann 2016). Para coordenação séria, prefira etcd/ZooKeeper.</>}
        />
        <QAItem
          q="Como testar se meu sistema honra o modelo que eu afirmo?"
          a={<>Use Jepsen-style testing: inject partições, clock skew, pausas longas; rode workload com operações e verifique linearizability dos históricos. Elle e Jepsen são ferramentas consolidadas. Existem papers mostrando que MongoDB, Redis, Cassandra divergiram do que anunciavam em versões específicas — testar importa.</>}
        />
        <QAItem
          q="Cassandra LWW em texto livre é seguro?"
          a={<>Só se você pode perder a outra escrita sem bug de produto. Ex: update de "última posição GPS" — LWW serve. Update de "saldo" — NÃO. Em Cassandra, LWW decide por timestamp; clock skew entre nós causa escolhas erradas. Para campos com merge semântico (set de tags, counter), use tipos específicos (set, counter).</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Consistência é uma escada. Linearizability é o topo, caro e raramente
        necessário. Causal é o sweet spot para sociais/colaboração. Session guarantees (read-your-writes, monotonic
        reads, bounded staleness) resolvem 80% das dores de UX sem custo global. Eventual sem session é armadilha.
        Resolução de conflito é projeto — LWW perde dados silenciosamente; CRDT salva em estruturas certas. Próximo
        módulo: como sistemas distribuídos <em>concordam</em> — Raft e consensus.
      </Callout>
    </div>
  );
}
