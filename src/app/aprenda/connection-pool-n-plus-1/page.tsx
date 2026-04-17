import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#336791';

export const metadata: Metadata = {
  title: 'Connection pool, N+1 e o que mata sua API — FFV Academy',
  description: 'Por que 100 queries são piores que 1 query com JOIN. N+1 query problem e como detectar. PgBouncer, SQLAlchemy pool, asyncpg — configuração correta.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o "N+1 query problem" e por que é perigoso em produção?',
    options: [
      'N+1 é um erro de sintaxe SQL que ocorre quando se usa SELECT sem WHERE',
      'N+1: buscar N registros (1 query) e depois buscar dados relacionados de cada um individualmente (N queries) — total: N+1 queries. Ex: SELECT * FROM posts (1 query, 100 posts) + SELECT author FROM users WHERE id=? para cada post (100 queries) = 101 queries. Em produção com 1000 posts = 1001 queries, cada uma com overhead de rede e parsing — pode ser 10-50x mais lento que 1 query com JOIN.',
      'N+1 é quando uma query retorna N+1 linhas em vez de N',
      'N+1 só acontece com ORMs, nunca com SQL puro',
    ],
    correct: 1,
    explanation: 'N+1 é o problema mais comum de performance em APIs com ORM. Django tem `select_related` (JOIN) e `prefetch_related` (batch). SQLAlchemy tem `joinedload` e `selectinload`. ActiveRecord tem `includes`. A solução geral: carregar os dados relacionados em uma segunda query batch (`WHERE author_id IN (lista)`) em vez de N queries individuais. ORMs modernos têm modo de detecção de N+1 para desenvolvimento.',
  },
  {
    question: 'Por que criar uma nova conexão com o banco a cada request é problemático?',
    options: [
      'Porque o PostgreSQL não suporta múltiplas conexões simultâneas',
      'Criar conexão TCP tem overhead de ~5-100ms (handshake TCP + TLS + autenticação PostgreSQL). Para uma API que serve 100 req/s, criar 100 conexões/s desperdiça CPU do banco e rede. PostgreSQL tem limite de conexões (max_connections, default 100). Connection pool mantém N conexões abertas e as reutiliza — amortiza o custo de criação.',
      'Uma nova conexão por request é a abordagem recomendada pelo PostgreSQL',
      'O problema é apenas com SSL/TLS — sem SSL não há overhead',
    ],
    correct: 1,
    explanation: 'PostgreSQL aloca ~5-10MB de memória por conexão (processo filho no modelo process-per-connection). Com max_connections=100, são 500MB-1GB apenas para conexões, antes de processar qualquer query. PgBouncer em modo transaction pooling pode servir 10.000 conexões de aplicação com 100 conexões reais ao PostgreSQL. SQLAlchemy pool_size + max_overflow controla as conexões no processo Python.',
  },
  {
    question: 'Qual a diferença entre session pooling e transaction pooling no PgBouncer?',
    options: [
      'São equivalentes — PgBouncer usa apenas um modo de pooling',
      'Session pooling: uma conexão do banco é alocada para toda a duração da sessão do cliente. Transaction pooling: conexão é retornada ao pool após cada transação — multiplexação mais agressiva (10x mais clientes por conexão). Transaction pooling não suporta prepared statements, advisory locks persistentes ou SET de parâmetros de sessão — requer adaptação do código da aplicação.',
      'Transaction pooling é mais seguro e sempre preferível',
      'Session pooling só funciona com PostgreSQL 14 ou superior',
    ],
    correct: 1,
    explanation: 'PgBouncer modos: Statement pooling (apenas uma statement por conexão — pouquíssimas aplicações funcionam), Transaction pooling (padrão recomendado — retorna ao pool após COMMIT/ROLLBACK), Session pooling (mais compatível mas menos eficiente). Para SQLAlchemy com transaction pooling: usar NullPool no lado da aplicação (PgBouncer já faz o pool). asyncpg com PgBouncer: desabilitar prepared statements no asyncpg.',
  },
];

export default function ConnectionPoolNPlus1Page() {
  return (
    <ModuleLayout
      slug="connection-pool-n-plus-1"
      title="Connection pool, N+1 e o que mata sua API"
      icon="⚠️"
      xp={70}
      readTime={14}
      trailName="SQL & Databases"
      trailColor="#336791"
      nextSlug="relacional-vs-nao-relacional"
      nextTitle="Relacional vs NoSQL: quando cada um ganha"
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
        APIs lentas raramente têm código Python lento — têm problemas no banco de dados. N+1 queries e falta de connection pool são os dois problemas de performance mais comuns e mais impactantes em aplicações com banco relacional.
      </p>

      <Section accent={accent} title="N+1: detectar e corrigir">
        <CodeBlock>{`# PROBLEMA: N+1 query com SQLAlchemy ORM
from sqlalchemy.orm import Session

def listar_posts_com_autores(db: Session):
    posts = db.query(Post).all()           # 1 query: SELECT * FROM posts
    for post in posts:
        print(post.author.nome)            # N queries: SELECT * FROM users WHERE id=?
    # Total: 1 + N queries para N posts

# SOLUÇÃO 1: joinedload — JOIN numa única query
from sqlalchemy.orm import joinedload

def listar_posts_com_autores_v2(db: Session):
    posts = db.query(Post).options(
        joinedload(Post.author)            # JOIN users na mesma query
    ).all()
    for post in posts:
        print(post.author.nome)            # dados já carregados — sem nova query
    # Total: 1 query com JOIN

# SOLUÇÃO 2: selectinload — 2 queries mas sem duplicação de dados
from sqlalchemy.orm import selectinload

def listar_posts_com_autores_v3(db: Session):
    posts = db.query(Post).options(
        selectinload(Post.author)          # SELECT users WHERE id IN (1, 2, 3, ...)
    ).all()
    # Total: 2 queries (melhor que JOIN para relações 1:N com duplicação)

# DETECÇÃO em desenvolvimento:
# sqlalchemy-utils tem QueryCounter:
from sqlalchemy import event
query_count = [0]

@event.listens_for(engine, "before_cursor_execute")
def count_queries(conn, cursor, statement, *args):
    query_count[0] += 1

# Ou usar SQLAlchemy Echo:
engine = create_engine(url, echo=True)   # loga todas as queries

# SQL puro — sempre use JOIN ou IN:
# ❌ N+1:
posts = db.execute("SELECT * FROM posts").fetchall()
for post in posts:
    author = db.execute("SELECT * FROM users WHERE id=?", [post.author_id]).fetchone()

# ✅ JOIN:
results = db.execute("""
    SELECT p.*, u.nome as author_nome
    FROM posts p
    JOIN users u ON p.author_id = u.id
""").fetchall()`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Connection pool: SQLAlchemy e asyncpg">
        <CodeBlock>{`from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Pool de conexões com SQLAlchemy (síncrono)
engine = create_engine(
    "postgresql://user:pass@localhost/db",
    pool_size=10,          # conexões mantidas abertas
    max_overflow=20,       # conexões extras em pico (máx: pool_size + max_overflow = 30)
    pool_timeout=30,       # espera máxima por conexão disponível (segundos)
    pool_recycle=3600,     # recria conexões após 1h (evita conexões mortas)
    pool_pre_ping=True,    # testa conexão antes de usar (detecta conexões mortas)
)

# Calcular pool_size ideal:
# pool_size ≈ (workers × threads_por_worker) / 2
# Para FastAPI com 4 workers Uvicorn: 4 × 1 = 4 → pool_size=5, max_overflow=10

# Pool assíncrono com SQLAlchemy async
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

async_engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/db",
    pool_size=20,
    max_overflow=0,        # asyncio — não precisa de overflow geralmente
    pool_timeout=30,
)

# asyncpg diretamente (sem ORM)
import asyncpg

async def criar_pool():
    return await asyncpg.create_pool(
        "postgresql://user:pass@localhost/db",
        min_size=5,        # conexões mínimas abertas
        max_size=20,       # máximo de conexões
        command_timeout=10, # timeout por query
        max_inactive_connection_lifetime=300,  # fecha conexões ociosas após 5min
    )

async def buscar_usuario(pool, user_id: int):
    async with pool.acquire() as conn:    # pega conexão do pool
        return await conn.fetchrow(
            "SELECT * FROM users WHERE id = $1", user_id
        )
    # conexão devolvida ao pool automaticamente ao sair do context manager`}</CodeBlock>
      </Section>

      <Section accent={accent} title="PgBouncer: connection pooling externo">
        <ComparisonTable
          headers={['Aspecto', 'Pool na aplicação', 'PgBouncer']}
          rows={[
            ['Escopo', 'Por processo', 'Global (todos os processos/serviços)'],
            ['Overhead', 'Zero (mesmo processo)', 'Pequeno (processo extra)'],
            ['Escalabilidade', 'N_workers × pool_size conexões', 'Pool centralizado, muito mais eficiente'],
            ['Restart de app', 'Conexões reconectam', 'Pool persiste, sem overhead de reconexão'],
            ['Quando usar', '1 instância, poucas conexões', 'Múltiplas instâncias, muitos workers'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# pgbouncer.ini — configuração básica
# [databases]
# mydb = host=localhost port=5432 dbname=mydb
#
# [pgbouncer]
# pool_mode = transaction
# max_client_conn = 10000    # conexões de clientes (aplicação)
# default_pool_size = 25     # conexões reais ao PostgreSQL por database
# min_pool_size = 5
# server_lifetime = 3600
# server_idle_timeout = 600
# listen_port = 5432
# listen_addr = *

# Com PgBouncer, configure a aplicação para usar NullPool
# (PgBouncer já faz o pool, não precisa do pool da aplicação):
from sqlalchemy import NullPool

engine = create_engine(
    "postgresql://user:pass@pgbouncer-host:5432/mydb",
    poolclass=NullPool,     # sem pool na aplicação — PgBouncer faz isso
)

# Métricas para monitorar:
# SHOW POOLS; — estado dos pools
# SHOW STATS; — queries por segundo, duração média
# SHOW CLIENTS; — conexões de clientes
# SHOW SERVERS; — conexões com PostgreSQL`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Regras de ouro:</strong> nunca crie conexão por request sem pool. Use <code>pool_pre_ping=True</code> para detectar conexões mortas. Configure <code>pool_size</code> baseado no número de workers × CPU do banco (PostgreSQL é ~1 core por conexão ativa). Detecte N+1 em desenvolvimento com <code>echo=True</code> ou SQLAlchemy event hooks. Use <code>joinedload</code> para relações 1:1 e <code>selectinload</code> para 1:N.
      </Callout>

      <Callout>
        Você concluiu a trilha <strong>SQL & Databases</strong>! Próximo: <strong>Como o Computador Funciona</strong> — CPU, memória, processos e I/O por baixo dos panos.
      </Callout>
    </div>
  );
}
