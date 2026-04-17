import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#336791';

export const metadata: Metadata = {
  title: 'SELECT e JOIN na prática: INNER, LEFT, self-join — FFV Academy',
  description: 'Os JOINs que resolvem 90% dos problemas reais: INNER, LEFT/RIGHT, FULL OUTER, self-join para hierarquias e CTEs para queries complexas legíveis.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre INNER JOIN e LEFT JOIN quando uma linha da tabela esquerda não tem correspondência na direita?',
    options: [
      'Ambos retornam a linha — a diferença é apenas de performance',
      'INNER JOIN exclui a linha completamente — só retorna linhas com correspondência em ambas as tabelas. LEFT JOIN inclui todas as linhas da tabela esquerda, preenchendo com NULL os campos da tabela direita onde não há correspondência. Útil para "mostrar todos os usuários, mesmo os que não fizeram pedidos".',
      'INNER JOIN é mais rápido por isso é preferível',
      'LEFT JOIN só funciona quando a tabela da direita tem menos linhas',
    ],
    correct: 1,
    explanation: 'LEFT JOIN é "todos da esquerda, correspondência ou NULL da direita". RIGHT JOIN é o inverso. FULL OUTER JOIN inclui linhas sem correspondência de ambos os lados. Para encontrar registros sem correspondência: `WHERE tabela_direita.id IS NULL` após LEFT JOIN — isso é mais eficiente que NOT IN ou NOT EXISTS em muitos bancos.',
  },
  {
    question: 'O que é um self-join e quando é necessário?',
    options: [
      'Self-join é quando você une duas cópias do mesmo banco de dados',
      'Self-join une uma tabela consigo mesma usando aliases diferentes. Necessário para hierarquias (empregado tem gerente que também é empregado), comparações dentro da mesma tabela (usuários com mesmo sobrenome), grafos simples. Ex: `FROM funcionarios f JOIN funcionarios g ON f.gerente_id = g.id`.',
      'Self-join é proibido em PostgreSQL por criar loops infinitos',
      'Self-join só funciona em tabelas com menos de 1000 linhas',
    ],
    correct: 1,
    explanation: 'Self-joins são comuns em: estruturas organizacionais (gerente/subordinado), categorias com subcategorias, bill-of-materials (produto contém partes que também são produtos), grafos de amizade. Para hierarquias profundas (N níveis), use recursive CTEs com `WITH RECURSIVE` — o self-join só funciona para 1 nível de profundidade.',
  },
  {
    question: 'Para que servem CTEs (Common Table Expressions) e quando preferir a uma subquery?',
    options: [
      'CTEs são mais lentas que subqueries — use sempre subquery',
      'CTE (WITH clause) nomeia um resultado intermediário que pode ser referenciado múltiplas vezes na mesma query. Benefícios: legibilidade (lógica passo a passo), reutilização (referir ao CTE várias vezes sem repetição), e CTEs recursivas para hierarquias. Subquery inline é equivalente em performance, mas CTEs ficam melhores para queries longas e complexas.',
      'CTEs só funcionam com PostgreSQL 13 ou superior',
      'CTEs sempre criam tabela temporária em disco — evite em produção',
    ],
    correct: 1,
    explanation: 'Até PostgreSQL 12, CTEs eram sempre "optimization fences" — o planner não podia otimizá-las em conjunto com a query externa. PostgreSQL 12+ tornou CTEs inline por padrão (equivalente à subquery), mas você pode forçar materialização com `WITH nome AS MATERIALIZED (...)`. CTEs recursivas (`WITH RECURSIVE`) são a única maneira nativa de traversal de grafos/árvores em SQL.',
  },
];

export default function SelectJoinNaPraticaPage() {
  return (
    <ModuleLayout
      slug="select-join-na-pratica"
      title="SELECT e JOIN na prática: INNER, LEFT, self-join"
      icon="🔗"
      xp={65}
      readTime={13}
      trailName="SQL & Databases"
      trailColor="#336791"
      nextSlug="group-by-agregacoes"
      nextTitle="GROUP BY, HAVING e agregações que resolvem 80% dos casos"
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
        JOINs são o coração do SQL relacional. Entender quando usar INNER vs LEFT vs CROSS, como self-joins modelam hierarquias, e como CTEs tornam queries complexas legíveis — isso é o que separa "escrever SQL" de "pensar em SQL".
      </p>

      <Section accent={accent} title="Os tipos de JOIN e quando usar cada um">
        <ComparisonTable
          headers={['JOIN', 'Retorna', 'Quando usar']}
          rows={[
            ['INNER JOIN', 'Só linhas com correspondência em ambas', 'Pedidos com cliente obrigatório'],
            ['LEFT JOIN', 'Todas da esquerda + NULL onde não há match', 'Todos clientes, pedido ou não'],
            ['RIGHT JOIN', 'Todas da direita + NULL onde não há match', 'Raro — inverta as tabelas e use LEFT'],
            ['FULL OUTER JOIN', 'Todas de ambas + NULL onde falta', 'Auditoria: linhas sem par em qualquer lado'],
            ['CROSS JOIN', 'Produto cartesiano (n×m linhas)', 'Gerar combinações, tabela de datas'],
            ['NATURAL JOIN', 'INNER JOIN por colunas com mesmo nome', 'Evitar — frágil e implícito'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`-- Schema de exemplo (e-commerce simples)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE
);

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id),
    total DECIMAL(10,2),
    status TEXT,
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id),
    produto TEXT,
    quantidade INT,
    preco DECIMAL(10,2)
);

-- INNER JOIN: pedidos com seus clientes
SELECT p.id, c.nome, p.total, p.status
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.id    -- INNER é default
WHERE p.status = 'processando';

-- LEFT JOIN: todos os clientes, com ou sem pedido
SELECT c.nome, COUNT(p.id) AS total_pedidos
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id, c.nome
ORDER BY total_pedidos DESC;

-- Clientes SEM nenhum pedido (anti-join):
SELECT c.nome
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.id IS NULL;   -- NULL = sem correspondência

-- JOIN múltiplo: clientes → pedidos → itens
SELECT c.nome, p.id AS pedido, ip.produto, ip.quantidade
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
JOIN itens_pedido ip ON ip.pedido_id = p.id
WHERE c.id = 42;`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Self-join: hierarquias e comparações">
        <CodeBlock>{`-- Tabela de funcionários com gerente (auto-referência)
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    gerente_id INT REFERENCES funcionarios(id),   -- pode ser NULL (CEO)
    salario DECIMAL(10,2)
);

-- Self-join: cada funcionário com seu gerente direto
SELECT
    f.nome AS funcionario,
    g.nome AS gerente,
    f.salario
FROM funcionarios f
LEFT JOIN funcionarios g ON f.gerente_id = g.id   -- LEFT para incluir CEO
ORDER BY g.nome NULLS FIRST;

-- Hierarquia completa com WITH RECURSIVE
WITH RECURSIVE hierarquia AS (
    -- Base: CEO (sem gerente)
    SELECT id, nome, gerente_id, 0 AS nivel, nome::TEXT AS caminho
    FROM funcionarios
    WHERE gerente_id IS NULL

    UNION ALL

    -- Recursivo: subordinados diretos
    SELECT f.id, f.nome, f.gerente_id, h.nivel + 1,
           h.caminho || ' > ' || f.nome
    FROM funcionarios f
    JOIN hierarquia h ON f.gerente_id = h.id
)
SELECT
    REPEAT('  ', nivel) || nome AS hierarquia,
    nivel,
    caminho
FROM hierarquia
ORDER BY caminho;

-- Self-join para comparação: funcionários com salário acima da média do departamento
SELECT f.nome, f.salario, media.media_dept
FROM funcionarios f
JOIN (
    SELECT gerente_id, AVG(salario) AS media_dept
    FROM funcionarios
    GROUP BY gerente_id
) media ON f.gerente_id = media.gerente_id
WHERE f.salario > media.media_dept;`}</CodeBlock>
      </Section>

      <Section accent={accent} title="CTEs: queries complexas em passos legíveis">
        <CodeBlock>{`-- CTE básico: WITH nomeia um resultado intermediário
WITH pedidos_recentes AS (
    SELECT *
    FROM pedidos
    WHERE criado_em >= NOW() - INTERVAL '30 days'
),
clientes_ativos AS (
    SELECT cliente_id, COUNT(*) AS num_pedidos, SUM(total) AS total_gasto
    FROM pedidos_recentes
    GROUP BY cliente_id
)
SELECT c.nome, ca.num_pedidos, ca.total_gasto
FROM clientes_ativos ca
JOIN clientes c ON ca.cliente_id = c.id
WHERE ca.total_gasto > 500
ORDER BY ca.total_gasto DESC;

-- CTE vs Subquery — equivalentes em performance (PostgreSQL 12+):
-- Subquery (menos legível):
SELECT c.nome, sub.total_gasto
FROM clientes c
JOIN (
    SELECT cliente_id, SUM(total) AS total_gasto
    FROM pedidos
    WHERE criado_em >= NOW() - INTERVAL '30 days'
    GROUP BY cliente_id
    HAVING SUM(total) > 500
) sub ON c.id = sub.cliente_id;

-- CTE recursivo: categorias com subcategorias (N níveis)
WITH RECURSIVE categorias_arvore AS (
    SELECT id, nome, parent_id, 0 AS profundidade
    FROM categorias WHERE parent_id IS NULL

    UNION ALL

    SELECT c.id, c.nome, c.parent_id, ct.profundidade + 1
    FROM categorias c
    JOIN categorias_arvore ct ON c.parent_id = ct.id
    WHERE ct.profundidade < 10   -- proteção contra ciclos
)
SELECT REPEAT('── ', profundidade) || nome AS arvore
FROM categorias_arvore
ORDER BY nome;`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Regras práticas:</strong> use <code>LEFT JOIN</code> por padrão quando não tem certeza se toda linha tem correspondência. Use CTEs para queries com mais de 3 JOINs ou lógica reutilizada. Use <code>WITH RECURSIVE</code> para hierarquias de qualquer profundidade. Evite <code>NATURAL JOIN</code> e <code>USING</code> em produção — explicitidade vale mais que brevidade.
      </Callout>

      <Callout>
        Próximo: <strong>GROUP BY e agregações</strong> — COUNT, SUM, AVG, HAVING e as funções que transformam dados brutos em métricas.
      </Callout>
    </div>
  );
}
