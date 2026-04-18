import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#336791';

export const metadata = getModuleMetadata('migrations-profissionais');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que adicionar uma coluna NOT NULL diretamente em produção pode causar downtime?',
    options: [
      'PostgreSQL não suporta adicionar colunas em tabelas com dados',
      'Em PostgreSQL < 11, `ALTER TABLE ADD COLUMN NOT NULL DEFAULT valor` reescrevia toda a tabela (table rewrite) — bloqueava a tabela por minutos/horas dependendo do tamanho. PostgreSQL 11+ otimizou para DEFAULT constante sem table rewrite. Para qualquer versão: adicionar NULL primeiro → backfill em lotes → adicionar NOT NULL constraint — cada passo é rápido e não bloqueia.',
      'Colunas NOT NULL só podem ser adicionadas durante a criação da tabela',
      'O downtime acontece apenas com tabelas de mais de 100 milhões de linhas',
    ],
    correct: 1,
    explanation: 'Table locks em PostgreSQL: DDL como ALTER TABLE pega AccessExclusiveLock — bloqueia tudo (leituras e escritas). Para tabelas pequenas (< 1M linhas) é aceitável. Para tabelas grandes em produção: use o padrão expand-migrate-contract (3 deploys). PostgreSQL 12+ tem ADD COLUMN com DEFAULT volatile sem table rewrite. `ALTER TABLE SET NOT NULL` ainda requer table scan mas não rewrite.',
  },
  {
    question: 'O que é o padrão "expand-migrate-contract" para migrations zero-downtime?',
    options: [
      'É um padrão específico do Alembic que não se aplica a outros frameworks',
      'Expand: adicionar nova estrutura compatível com código antigo (coluna nullable, nova tabela). Migrate: backfill dados antigos para nova estrutura, atualizar código para escrever nos dois lugares. Contract: remover estrutura antiga após confirmar que código novo funciona. Permite deploy sem downtime porque cada passo é compatível com a versão do código rodando.',
      'Expand-migrate-contract só funciona para renomear colunas',
      'É um padrão apenas para bancos de dados distribuídos',
    ],
    correct: 1,
    explanation: 'Exemplo: renomear coluna `name` para `full_name`. Deploy 1 (Expand): ADD COLUMN full_name. Deploy 2 (Migrate): atualizar app para escrever em ambas + backfill. Deploy 3 (Contract): DROP COLUMN name após confirmar que nenhum código usa ela. Ferramentas como Alembic e Flyway suportam up/down migrations. Em produção crítica: cada migration vai em PR separado com review.',
  },
  {
    question: 'Como fazer backfill de uma coluna nova em uma tabela de 100 milhões de linhas sem travar o banco?',
    options: [
      'Fazer UPDATE geral: `UPDATE tabela SET nova_coluna = calcular(antiga_coluna)`',
      'Processar em lotes com LIMIT + WHERE e pausas entre lotes. `UPDATE tabela SET nova=calcula(antiga) WHERE id BETWEEN $start AND $end` — cada lote pega lock por tempo curto, libera, próximo lote. Ferramentas como pg-osc e gh-ost encapsulam isso. O UPDATE geral em 100M linhas mantém lock por horas e preenche WAL/autovacuum.',
      'Criar nova tabela e mover dados de uma vez com INSERT INTO SELECT',
      'Backfill só pode ser feito durante janela de manutenção com downtime',
    ],
    correct: 1,
    explanation: 'Algoritmo de backfill em lotes: `UPDATE tabela SET nova = calcular(antiga) WHERE id >= $offset AND id < $offset + $batch_size`. Pause 50-100ms entre lotes para dar espaço ao autovacuum e outras queries. Monitorar: locks de longa duração, tamanho do WAL (pg_wal), autovacuum lag. Para tabelas muito grandes: usar pg-osc (online schema change) que processa via trigger + tabela temporária.',
  },
];

export default function MigracoesProfissionaisPage() {
  return (
    <ModuleLayout
      slug="migrations-profissionais"
      title="Migrations profissionais: reversíveis, zero-downtime"
      icon="🔄"
      xp={65}
      readTime={13}
      trailName="SQL & Databases"
      trailColor="#336791"
      nextSlug="connection-pool-n-plus-1"
      nextTitle="Connection pool, N+1 e o que mata sua API"
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
        Migrations mal planejadas causam downtime. Em produção com milhões de linhas, cada DDL precisa ser analisada: adquire lock de tabela? Faz table rewrite? Quanto tempo leva? O padrão expand-migrate-contract resolve isso com deploys incrementais.
      </p>

      <Section accent={accent} title="Alembic: migrations em Python">
        <CodeBlock>{`# Instalação e setup
# uv add alembic sqlalchemy

# Inicializar no projeto
# alembic init alembic
# Gera: alembic.ini, alembic/env.py, alembic/versions/

# alembic/env.py — aponta para seus modelos
from myapp.models import Base
target_metadata = Base.metadata

# alembic.ini
# sqlalchemy.url = postgresql://user:pass@localhost/mydb

# Gerar migration automaticamente (baseado em diff dos modelos):
# alembic revision --autogenerate -m "add_users_email_verified"

# Arquivo gerado em alembic/versions/abc123_add_users_email_verified.py
from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('email_verified', sa.Boolean(), nullable=True)
    )

def downgrade() -> None:
    op.drop_column('users', 'email_verified')

# Executar migrations:
# alembic upgrade head     # aplica todas pendentes
# alembic downgrade -1     # reverte a última
# alembic current          # mostra versão atual
# alembic history          # histórico de migrations
# alembic show abc123      # mostra detalhes de uma migration`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Zero-downtime: o padrão expand-migrate-contract">
        <ComparisonTable
          headers={['Passo', 'O que fazer', 'Compatibilidade com deploy anterior']}
          rows={[
            ['Expand (Deploy 1)', 'Adicionar nova estrutura (coluna nullable, nova tabela)', 'Código antigo ainda funciona'],
            ['Migrate (Deploy 2)', 'Backfill + código escreve em ambos os lugares', 'Backfill em background, sem lock'],
            ['Contract (Deploy 3)', 'Remover estrutura antiga', 'Código novo só usa nova estrutura'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`-- EXEMPLO: renomear coluna 'name' para 'full_name' sem downtime

-- Deploy 1 — Expand: adicionar nova coluna
ALTER TABLE users ADD COLUMN full_name TEXT;
-- Nullable → sem table rewrite, sem lock prolongado

-- Deploy 1 — Código: escrever em ambas as colunas
# app/models.py
def criar_usuario(nome):
    db.execute("""
        INSERT INTO users (name, full_name)
        VALUES (:name, :full_name)
    """, {"name": nome, "full_name": nome})

-- Deploy 2 — Migrate: backfill em lotes
-- Script de backfill (rodar fora do deploy):
DO \$\$
DECLARE
    batch_size INT := 10000;
    offset_val BIGINT := 0;
    max_id BIGINT;
BEGIN
    SELECT MAX(id) INTO max_id FROM users;
    WHILE offset_val <= max_id LOOP
        UPDATE users
        SET full_name = name
        WHERE id > offset_val
          AND id <= offset_val + batch_size
          AND full_name IS NULL;

        offset_val := offset_val + batch_size;
        PERFORM pg_sleep(0.1);  -- pausa para não stressar o banco
    END LOOP;
END;
\$\$;

-- Deploy 2 — código: código novo lê de full_name
-- Deploy 3 — Contract: adicionar NOT NULL e remover coluna antiga
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE users DROP COLUMN name;`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Migrations perigosas e como fazer cada uma com segurança">
        <CodeBlock>{`-- ✅ SEGURO sem precauções especiais:
ALTER TABLE t ADD COLUMN nova TEXT;                    -- nullable = sem lock
ALTER TABLE t ADD COLUMN nova TEXT DEFAULT 'x';       -- PG 11+ = sem table rewrite
CREATE INDEX CONCURRENTLY idx ON t(col);              -- sem lock exclusivo
CREATE TABLE nova (...);
DROP TABLE antiga;                                    -- se vazia e sem referências

-- ⚠️ PERIGOSO sem cuidado (pode causar lock/downtime):
ALTER TABLE t ADD COLUMN nova TEXT NOT NULL;          -- PG<11: table rewrite
ALTER TABLE t ALTER COLUMN tipo SET NOT NULL;         -- table scan (mas não rewrite)
ALTER TABLE t DROP COLUMN qualquer;                    -- ok em PG, mas garanta que código não usa
CREATE INDEX idx ON t(col);                           -- WITHOUT CONCURRENTLY: bloqueia!
ALTER TABLE t RENAME COLUMN antigo TO novo;           -- ok mas quebra queries em produção

-- ⛔ NUNCA em produção sem migration:
-- Deletar uma coluna usada pelo código ainda em produção
-- DROP TABLE ou TRUNCATE sem verificar dependências
-- Mudar tipo de coluna (DATE → TIMESTAMP) sem casting explícito

-- Verificar locks antes de migration:
SELECT
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT ILIKE '%pg_stat_activity%'
ORDER BY duration DESC;`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Checklist de migration segura:</strong> (1) teste em banco com dados reais antes de produção; (2) estime tempo com EXPLAIN ANALYZE em staging; (3) use CONCURRENTLY para índices; (4) faça backfill em lotes com pausa; (5) adicione NOT NULL como passo separado após backfill completo; (6) verifique que downgrade também funciona.
      </Callout>

      <Callout>
        Próximo: <strong>Connection pool e N+1</strong> — os problemas de banco de dados que matam performance de API silenciosamente.
      </Callout>
    </div>
  );
}
