import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#336791';

export const metadata = getModuleMetadata('relacional-vs-nao-relacional');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que usar PostgreSQL para dados com relacionamentos complexos é geralmente melhor que MongoDB?',
    options: [
      'Porque PostgreSQL é mais rápido em todos os casos',
      'PostgreSQL garante integridade referencial via foreign keys — o banco rejeita operações que violariam os relacionamentos. MongoDB não tem JOINs nativos eficientes nem foreign key constraints — relacionamentos ficam na aplicação, sujeitos a inconsistências. Para dados estruturados com relacionamentos, SQL oferece consultas declarativas poderosas com JOINs que seriam N queries em MongoDB.',
      'MongoDB não suporta índices, tornando queries lentas',
      'PostgreSQL é open-source, MongoDB é proprietário',
    ],
    correct: 1,
    explanation: 'MongoDB brilha para documentos semi-estruturados onde o schema muda frequentemente, dados aninhados que naturalmente se encaixam em documentos (catálogo de produtos com atributos variados), e quando escrita horizontal importa mais que consistência forte. PostgreSQL tem JSONB que oferece os dois mundos: schema rígido para dados estruturados + JSONB para campos flexíveis no mesmo banco.',
  },
  {
    question: 'Quando Redis é a escolha certa e quando não é?',
    options: [
      'Redis substitui qualquer banco de dados relacional',
      'Redis é ideal para: cache de sessão, rate limiting, leaderboards, pub/sub, filas simples, dados temporários com TTL. Não é ideal para: dados primários que precisam persistir confiável a longo prazo, queries complexas, dados relacionais, grandes volumes com busca full-text. Redis é um store de estruturas de dados em memória — o custo da RAM limita o volume prático.',
      'Redis só funciona para aplicações web, não para APIs',
      'Redis não suporta dados estruturados, apenas strings',
    ],
    correct: 1,
    explanation: 'Redis suporta strings, hashes, lists, sets, sorted sets, bitmaps, HyperLogLog, streams e geospatial. Redis Cluster distribui horizontalmente. Redis Persistence (RDB + AOF) oferece durabilidade configurável. Em 2024, Redis Stack adiciona JSON nativo, busca full-text (RediSearch) e grafos (RedisGraph). Para cache de banco de dados, Redis é a escolha padrão.',
  },
  {
    question: 'O que é o teorema CAP e como ele influencia a escolha de banco de dados?',
    options: [
      'CAP é uma sigla para os 3 tipos de banco: Cache, ACID, Persistence',
      'CAP diz que um sistema distribuído pode garantir no máximo 2 de 3 propriedades: Consistency (todos os nós veem os mesmos dados), Availability (toda requisição recebe resposta), Partition Tolerance (funciona mesmo com falhas de rede). PostgreSQL é CA (single-node, sem tolerância a partição). MongoDB e DynamoDB são AP ou CP dependendo da configuração.',
      'CAP se aplica apenas a bancos NoSQL, não relacionais',
      'CAP é um padrão de indexação usado em PostgreSQL',
    ],
    correct: 1,
    explanation: 'Na prática, partições de rede acontecem — então você escolhe entre Consistency e Availability. Bancos CP (cassandra, HBase): preferem consistência, rejeitam escritas durante partição. Bancos AP (DynamoDB, CouchDB): preferem disponibilidade, aceitam eventual consistency. PACELC estende CAP: mesmo sem partição, há trade-off entre latência e consistência. A maioria dos sistemas usa "eventual consistency" com garantias customizadas.',
  },
];

export default function RelacionalVsNaoRelacionalPage() {
  return (
    <ModuleLayout
      slug="relacional-vs-nao-relacional"
      title="Relacional vs NoSQL: quando cada um ganha"
      icon="⚖️"
      xp={50}
      readTime={10}
      trailName="SQL & Databases"
      trailColor="#336791"
      nextSlug="select-join-na-pratica"
      nextTitle="SELECT e JOIN na prática: INNER, LEFT, self-join"
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
        "Use NoSQL para escalar" é um dos maiores mitos da tecnologia. A escolha entre banco relacional e NoSQL não é sobre escala — é sobre o modelo de dados, os padrões de acesso e as garantias de consistência que seu sistema realmente precisa.
      </p>

      <Section accent={accent} title="Os 4 modelos de dados NoSQL">
        <ComparisonTable
          headers={['Modelo', 'Exemplos', 'Melhor para', 'Trade-off']}
          rows={[
            ['Documento', 'MongoDB, Firestore, CouchDB', 'Catálogos, conteúdo variável, APIs REST', 'JOINs ruins, duplicação de dados'],
            ['Chave-Valor', 'Redis, DynamoDB, Memcached', 'Cache, sessão, rate limiting, flags', 'Queries complexas impossíveis'],
            ['Colunar', 'Cassandra, HBase, DynamoDB', 'Time series, analytics, alta escrita', 'Modelo de acesso rígido, sem JOINs'],
            ['Grafo', 'Neo4j, Amazon Neptune, RedisGraph', 'Redes sociais, recomendações, grafos', 'Baixa adoção, queries específicas'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="PostgreSQL: o banco que faz de tudo">
        <CodeBlock>{`-- PostgreSQL suporta:
-- 1. SQL relacional completo
-- 2. JSONB para dados semi-estruturados
-- 3. Full-text search nativo
-- 4. Arrays como tipo nativo
-- 5. UUID, ranges, geospatial (PostGIS)
-- 6. LISTEN/NOTIFY para pub/sub
-- 7. Particionamento de tabelas

-- JSONB — melhor dos dois mundos
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    atributos JSONB          -- schema flexível aqui
);

INSERT INTO produtos VALUES
  (1, 'Camiseta', 49.90, '{"cor": "azul", "tamanho": "M", "tecido": "algodão"}'),
  (2, 'Laptop', 3499.00, '{"ram": "16GB", "cpu": "M3", "armazenamento": "512GB"}');

-- Buscar por campo JSONB com índice GIN:
SELECT nome, atributos->>'cor' AS cor
FROM produtos
WHERE atributos @> '{"cor": "azul"}';    -- operador "contém"

-- Índice GIN para JSONB (busca O(log n) nos campos):
CREATE INDEX idx_produtos_atributos ON produtos USING GIN (atributos);

-- Array nativo — tags sem tabela separada
CREATE TABLE artigos (
    id SERIAL PRIMARY KEY,
    titulo TEXT,
    tags TEXT[]    -- array de strings
);

SELECT titulo FROM artigos WHERE 'python' = ANY(tags);
SELECT titulo FROM artigos WHERE tags @> ARRAY['sql', 'performance'];`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Quando usar cada banco">
        <CodeBlock>{`-- PostgreSQL — use quando:
-- ✅ Dados com relacionamentos (usuários → pedidos → itens)
-- ✅ Precisa de transações ACID reais
-- ✅ Queries analíticas complexas (GROUP BY, window functions)
-- ✅ Schema bem definido que não muda constantemente
-- ✅ Integridade referencial é crítica (não posso ter pedido sem usuário)

-- MongoDB — use quando:
-- ✅ Documentos naturalmente aninhados (pedido com endereço embutido)
-- ✅ Schema muda frequentemente por produto (catálogo de e-commerce)
-- ✅ Equipe não conhece SQL
-- ❌ Evitar quando: dados têm muitos relacionamentos (N:N), precisar de JOINs

-- Redis — use quando:
-- ✅ Cache de resultado de queries lentas
-- ✅ Sessões de usuário (SETEX com TTL automático)
-- ✅ Rate limiting (INCR + EXPIRE)
-- ✅ Leaderboard (ZADD/ZRANGEBYSCORE)
-- ✅ Pub/sub leve (PUBLISH/SUBSCRIBE)
-- ❌ Evitar: dados primários onde perda é inaceitável (persistência limitada)

-- DynamoDB — use quando:
-- ✅ Escala de leitura/escrita previsível e massiva (e-commerce em pico)
-- ✅ Padrão de acesso conhecido e simples (busca por PK)
-- ✅ Latência consistente de 1-10ms independente de volume
-- ❌ Evitar: queries ad-hoc, analytics, dados relacionais complexos`}</CodeBlock>
      </Section>

      <Section accent={accent} title="O padrão mais comum: PostgreSQL + Redis">
        <CodeBlock>{`# Arquitetura típica de API
# PostgreSQL: dados primários (fonte da verdade)
# Redis: cache de leitura + sessão + rate limiting

import redis
import psycopg2
import json

r = redis.Redis()
conn = psycopg2.connect("postgresql://localhost/mydb")

def buscar_usuario(user_id: int) -> dict:
    # 1. Verificar cache Redis
    cache_key = f"user:{user_id}"
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    # 2. Buscar no PostgreSQL
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        row = cur.fetchone()

    if not row:
        return None

    usuario = {"id": row[0], "nome": row[1], "email": row[2]}

    # 3. Salvar no cache com TTL de 5 minutos
    r.setex(cache_key, 300, json.dumps(usuario))

    return usuario

# Rate limiting com Redis
def verificar_rate_limit(user_id: int, limite: int = 100) -> bool:
    key = f"rate:{user_id}:{int(time.time() // 60)}"   # janela de 1 minuto
    count = r.incr(key)
    if count == 1:
        r.expire(key, 60)
    return count <= limite`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Decisão prática:</strong> comece com PostgreSQL. Ele faz 95% do que você precisa com SQL poderoso, JSONB para flexibilidade, e suporte a arrays, full-text e geospatial nativamente. Adicione Redis para cache quando as queries ficarem lentas. Considere bancos especializados apenas quando PostgreSQL realmente não servir — não antes.
      </Callout>

      <Callout>
        Próximo: <strong>SELECT e JOIN</strong> — os JOINs que resolvem 90% dos problemas reais com PostgreSQL.
      </Callout>
    </div>
  );
}
