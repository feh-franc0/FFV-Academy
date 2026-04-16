import type { Metadata } from 'next';
import { ModuleLayout, type QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  StackFlow,
  QAItem,
  ExamDomainBadge,
  KeyValue,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Caching: ElastiCache, DAX e Padrões — SAA-C03',
  description: 'Caching em profundidade para SAA-C03: ElastiCache Redis vs Memcached, DAX, CloudFront cache, cache-aside vs write-through vs write-behind, TTL, invalidação e consistência.',
  keywords: 'ElastiCache, Redis, Memcached, DAX, cache-aside, write-through, TTL, CloudFront cache, SAA-C03',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Aplicação precisa de pub/sub, leaderboards (sorted sets), e persistência em caso de restart. Qual escolher?',
    options: ['Memcached', 'ElastiCache Redis', 'DAX', 'CloudFront'],
    correct: 1,
    explanation: 'Redis tem estruturas de dados avançadas (sorted sets, lists, hashes, streams), pub/sub nativo, persistência (RDB/AOF), replication e cluster mode. Memcached é só key-value simples, multithreaded, sem persistência. DAX é específico para DynamoDB. CloudFront é CDN HTTP, não cache de dados estruturado.',
  },
  {
    question: 'Qual padrão de cache escreve no cache e no DB ao mesmo tempo, garantindo consistência mas com latência de escrita maior?',
    options: ['Cache-aside (lazy loading)', 'Write-through', 'Write-behind', 'Read-through'],
    correct: 1,
    explanation: 'Write-through: aplicação escreve no cache, cache escreve no DB síncronamente. Consistente, mas escrita lenta. Cache-aside: app lê cache, fallback DB, escreve cache (eventual). Write-behind: escreve cache e async no DB (rápido mas risco de perda). Read-through é variação de cache-aside onde o cache carrega do DB automaticamente.',
  },
  {
    question: 'Qual métrica do ElastiCache indica que seu cluster está pequeno demais?',
    options: [
      'CacheHitRate baixo + Evictions alto',
      'CPUUtilization alto',
      'NetworkBytesIn alto',
      'CurrConnections alto',
    ],
    correct: 0,
    explanation: 'Evictions alto = cache está removendo entradas ativamente para abrir espaço, combinado com hit rate baixo = cache não está "segurando" os hot items. Sinal claro de undersizing. CPU alto pode indicar outros problemas. Conexões altas não necessariamente problema. NetworkBytesIn é throughput normal.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="caching-performance"
      title="Caching: ElastiCache, DAX e Padrões"
      icon="⚡"
      xp={60}
      readTime={12}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="messaging-eventos"
      nextTitle="Messaging: SQS, SNS, EventBridge, Kinesis"
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
        Cache é o pattern mais antigo e mais efetivo para reduzir latência e custo de banco. Mas implementar mal resulta
        em dados stale, invalidação confusa e bugs sutis. O SAA cobra: escolha de produto (Redis × Memcached × DAX ×
        CloudFront), escolha de padrão (cache-aside × write-through × write-behind) e interpretação de métricas.
      </p>

      <div className="flex flex-wrap gap-2">
        <ExamDomainBadge domain="High-Performing" weight="24%" color={ACCENT} />
        <ExamDomainBadge domain="Cost-Optimized" weight="20%" color={ACCENT} />
      </div>

      <Section title="ElastiCache: Redis vs Memcached" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'Redis', 'Memcached']}
          rows={[
            ['Estruturas', 'Strings, lists, sets, sorted sets, hashes, streams, hyperloglog, geo', 'Apenas key-value string'],
            ['Multi-thread', 'Single-threaded (1 core por node)', 'Multi-threaded (escala vertical melhor)'],
            ['Persistência', 'RDB snapshots + AOF log', 'Nenhuma (puramente in-memory)'],
            ['Replicação', 'Read replicas + cluster mode', 'Sharding client-side, sem replicação'],
            ['High Availability', 'Multi-AZ com automatic failover', 'Não nativo'],
            ['Pub/Sub', 'Sim', 'Não'],
            ['Transactions', 'Sim (MULTI/EXEC)', 'Não'],
            ['Encryption in-transit / at-rest', 'Sim (TLS + KMS)', 'In-transit sim, at-rest não'],
            ['Caso de uso', 'Session store, leaderboards, filas, geo, pub/sub', 'Cache puro simples, multi-thread, sem persistência'],
          ]}
        />
        <Callout tone="info">
          <strong>Regra prática:</strong> na dúvida, escolha Redis. Memcached só ganha se você precisa estritamente de
          multithread e não liga para persistência/replicação. Exame favorece Redis em quase todo cenário.
        </Callout>
      </Section>

      <Section title="Redis: Cluster Mode Disabled vs Enabled" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Feature', 'Cluster Disabled', 'Cluster Enabled']}
          rows={[
            ['Shards', '1 shard', 'Até 500 shards'],
            ['Dataset máximo', 'Limitado ao tamanho de 1 node (~600GB)', 'Horizontal scaling — petabytes'],
            ['Client', 'Conexão simples', 'Precisa de cluster-aware client'],
            ['Primary failover', 'Auto com Multi-AZ', 'Auto por shard'],
            ['Backup', 'Snapshot completo', 'Snapshot por shard'],
            ['Caso', 'Sessions, cache de API pequeno-médio', 'Datasets grandes, high throughput distribuído'],
          ]}
        />
      </Section>

      <Section title="DAX — cache nativo do DynamoDB" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          DAX é um cache in-memory write-through compatível com a API do DynamoDB. A aplicação troca o endpoint e ganha
          latência μs (microssegundos). Roda em cluster de nodes na VPC.
        </p>
        <StackFlow
          title="DAX como item cache + query cache"
          accent={ACCENT}
          items={[
            { icon: '📱', label: 'App', sub: 'DynamoDB SDK', detail: 'Mesma API do DynamoDB — apenas troca o endpoint para o cluster DAX.' },
            { icon: '⚡', label: 'DAX Cluster', sub: 'μs latency', detail: 'Item Cache (GetItem/BatchGetItem) + Query Cache (Query/Scan).' },
            { icon: '🗄️', label: 'DynamoDB', sub: 'cache miss OR write', detail: 'Write-through: PUT/UPDATE/DELETE vai para o DDB e DAX atualiza a entrada correspondente.' },
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Item Cache TTL', v: 'Default 5min. Configurável por cluster.' },
            { k: 'Query Cache TTL', v: 'Default 5min. Invalidado em writes na tabela.' },
            { k: 'Consistência', v: 'Eventual nos reads cached. Strong reads fazem bypass do cache.' },
            { k: 'Casos ideais', v: 'Leitura extremamente alta de items "quentes" (leaderboard, top products). Reduz custo de RCU significativamente.' },
            { k: 'Não recomendado', v: 'Write-heavy (não dá benefício, só custo) e dados totalmente dispersos (hit rate baixo).' },
          ]}
        />
        <Callout tone="warn">
          <strong>DAX ≠ ElastiCache:</strong> DAX só fala API DynamoDB. Para RDS/Aurora você usa ElastiCache.
          Alguns candidatos erram pensando que DAX acelera qualquer query.
        </Callout>
      </Section>

      <Section title="CloudFront — cache de borda para HTTP/S" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          CloudFront não é &ldquo;o mesmo que ElastiCache mas HTTP&rdquo;. É CDN global com POPs em ~450 cidades. Cache é
          controlado por <strong>cache policy</strong> (TTL + keys baseadas em query string/headers/cookies) e
          <strong> origin request policy</strong> (o que forward para a origem).
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Behaviors', v: 'Rotas por path pattern (ex: /api/* vs /static/*) com policies diferentes.' },
            { k: 'Invalidation', v: 'API para forçar expiração de paths. Primeiros 1.000 paths/mês grátis, depois $0,005/path.' },
            { k: 'Origin Shield', v: 'Camada intermediária de cache — útil para reduzir requests à origem em multi-POP.' },
            { k: 'Signed URLs/Cookies', v: 'Controle de acesso temporário para conteúdo premium.' },
            { k: 'Field-Level Encryption', v: 'Criptografa campos específicos do POST (ex: número do cartão) com chave pública da origem.' },
          ]}
        />
      </Section>

      <Section title="Padrões de cache — decor e aplique" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Padrão', 'Como funciona', 'Prós', 'Contras']}
          rows={[
            ['Cache-Aside (Lazy)', 'App verifica cache; miss → busca DB → popula cache', 'Simples, cacheia apenas o usado', 'Primeiro hit é miss; stale data possível'],
            ['Read-Through', 'Cache é provider: app lê do cache, ele busca do DB automaticamente', 'Código limpo', 'Depende de integração suportada'],
            ['Write-Through', 'App escreve cache, cache escreve DB sincronamente', 'Consistência forte', 'Escrita mais lenta; cache cresce com dados nunca lidos'],
            ['Write-Behind', 'App escreve cache; cache escreve DB async em batch', 'Escritas muito rápidas', 'Risco de perda se cache falhar antes do flush'],
            ['Refresh-Ahead', 'Expira itens quentes pró-ativamente antes do TTL', 'Hit rate alto', 'Complexidade de previsão'],
          ]}
        />
        <CodeBlock lang="python">{`# Cache-aside típico (Python + redis + RDS)
def get_user(user_id):
    key = f"user:{user_id}"
    cached = redis.get(key)
    if cached:
        return json.loads(cached)
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    redis.setex(key, 300, json.dumps(user))  # TTL 5min
    return user

def update_user(user_id, data):
    db.execute("UPDATE users SET ... WHERE id = %s", user_id)
    redis.delete(f"user:{user_id}")   # invalidação explícita`}</CodeBlock>
        <Callout tone="info">
          <strong>TTL é a chave:</strong> TTL curto = mais carga no DB mas menos stale; TTL longo = menos carga mas dados
          velhos. Regra prática: TTL = tolerância máxima a stale em ms. Para dados mutáveis, combine TTL com invalidação
          ativa em writes.
        </Callout>
      </Section>

      <Section title="Escolha arquitetural — quando cada um ganha" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Sessão de usuário de e-commerce compartilhada entre múltiplas instâncias EC2"
          winner="ElastiCache Redis (ou DynamoDB on-demand)"
          why="Session store requer acesso rápido de múltiplos hosts. Redis é tradicional. DynamoDB on-demand é alternativa serverless mais moderna."
          alternatives={[
            { name: 'Sticky sessions no ALB', note: 'funciona mas amarra usuário a 1 host e falha em failover.' },
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="API pública com endpoints /produtos e /categorias acessados 10.000 req/s, dados mudam 1x/dia"
          winner="CloudFront com TTL de horas + S3/ALB atrás"
          why="CDN absorve 99% dos requests na edge, origem quase nunca é tocada. Invalidação na atualização diária."
          alternatives={[
            { name: 'API Gateway com caching', note: 'funciona mas fica em 1 região.' },
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Leaderboard de jogo — top 100 jogadores, atualizado a cada partida, consulta por tempo real"
          winner="ElastiCache Redis com Sorted Sets"
          why="ZADD + ZREVRANGE resolve em uma chamada. Nem DynamoDB nem DAX oferecem sorted sets nativos."
        />
      </Section>

      <Section title="Métricas críticas do ElastiCache (CloudWatch)" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'CacheHits / CacheMisses', v: 'Ratio < 0,8 sugere cache pequeno ou TTL mal calibrado.' },
            { k: 'Evictions', v: 'Qualquer eviction significa pressão de memória — aumente node ou reduza dataset.' },
            { k: 'CPUUtilization', v: 'Redis single-thread → 100% no core principal significa CPU bound.' },
            { k: 'EngineCPUUtilization', v: 'Métrica mais precisa para Redis (ignora overhead do SO).' },
            { k: 'BytesUsedForCache / ReservedMemory', v: 'Quanto da memória está usado vs disponível.' },
            { k: 'CurrConnections', v: 'Aproximar do limite (65.000) é sinal de connection leak no cliente.' },
          ]}
        />
      </Section>

      <Section title="Q&A estilo exame" accent={ACCENT}>
        <QAItem
          q="Quando usar DAX e quando usar ElastiCache na frente do DynamoDB?"
          a={
            <span>
              DAX quando você quer solução gerenciada específica, compatibilidade total com a SDK do DynamoDB e quer
              evitar código de invalidação (write-through nativo). ElastiCache quando quer estruturas Redis (sorted sets,
              pub/sub) que DAX não oferece.
            </span>
          }
        />
        <QAItem
          q="Como escolher entre cache-aside e write-through?"
          a={
            <span>
              Cache-aside é o padrão default: simples, barato em cache memory. Write-through quando a aplicação NÃO pode
              ler dado stale (ex: financeiro). Combina com TTL para evitar cache &ldquo;imortal&rdquo;.
            </span>
          }
        />
        <QAItem
          q="Redis Multi-AZ com auto-failover — RTO típico?"
          a={
            <span>
              ~30–60s. Failover elege nova primary automaticamente; DNS endpoint é atualizado. Cliente deve ter retry
              com backoff para absorver a janela de transição.
            </span>
          }
        />
        <QAItem
          q="Aplicação começou a retornar dados antigos após deploy. Como diagnosticar?"
          a={
            <span>
              Primeiro, verifique TTL e se houve mudança no schema (key format). Invalidação pode estar faltando. Se
              usar CloudFront, criar invalidation de <InlineCode>{'/*'}</InlineCode> (última medida). Em ElastiCache:
              <InlineCode>FLUSHALL</InlineCode> derruba tudo — use com cautela.
            </span>
          }
        />
      </Section>

      <Callout tone="warn">
        <strong>Armadilhas:</strong> (1) Memcached não tem persistência — restart apaga tudo; (2) Redis single-thread,
        não adianta pegar node de 64 cores; (3) DAX só DynamoDB; (4) CloudFront invalidation custa após 1.000/mês;
        (5) Cache &ldquo;thundering herd&rdquo; — quando muitos clientes refazem cache ao mesmo tempo após expiração
        (mitigue com jitter no TTL).
      </Callout>

      <Callout tone="success">
        <strong>Take-aways:</strong> cache é o multiplicador de performance mais barato. Escolha: Redis (rico), Memcached
        (simples), DAX (DynamoDB), CloudFront (HTTP). Padrão default: cache-aside com TTL. Monitore hit rate e evictions.
        Invalide em writes quando consistência importa.
      </Callout>
    </div>
  );
}
