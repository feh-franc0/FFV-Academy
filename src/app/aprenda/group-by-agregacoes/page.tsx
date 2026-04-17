import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

const accent = '#336791';

export const metadata: Metadata = {
  title: 'GROUP BY, HAVING e agregações que resolvem 80% dos casos — FFV Academy',
  description: 'COUNT, SUM, AVG, MIN, MAX com GROUP BY e HAVING. ROLLUP para subtotais. FILTER para agregações condicionais. As funções que transformam dados em métricas.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre filtrar com WHERE e filtrar com HAVING em uma query com GROUP BY?',
    options: [
      'São equivalentes — WHERE e HAVING fazem a mesma coisa',
      'WHERE filtra linhas ANTES da agregação (menos linhas a agregar = mais eficiente). HAVING filtra grupos DEPOIS da agregação — só pode referenciar colunas do GROUP BY ou funções de agregação. `WHERE total > 100` é impossível se total é SUM() — só HAVING funciona. Use WHERE sempre que possível, HAVING só quando necessário.',
      'HAVING é mais rápido porque processa menos dados',
      'WHERE funciona apenas com números, HAVING com qualquer tipo',
    ],
    correct: 1,
    explanation: 'A ordem de execução do SQL: FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. WHERE acontece antes da agregação, então não pode referenciar `SUM(valor)`. HAVING acontece depois, mas processa todos os grupos antes de filtrar — é mais caro que WHERE. Regra: filtre com WHERE tudo que puder, use HAVING apenas para condições sobre agregações.',
  },
  {
    question: 'O que `FILTER (WHERE condição)` faz numa função de agregação?',
    options: [
      'É sinônimo de WHERE na query principal',
      'FILTER aplica uma condição dentro da função de agregação — conta/soma apenas as linhas que satisfazem a condição, enquanto outras agregações na mesma query veem todas as linhas. `COUNT(*) FILTER (WHERE status = "pago")` conta só pagos enquanto `COUNT(*)` conta tudo — sem precisar de múltiplos GROUP BY ou subqueries.',
      'FILTER só funciona com COUNT, não com SUM ou AVG',
      'FILTER é uma feature exclusiva do MySQL, não do PostgreSQL',
    ],
    correct: 1,
    explanation: '`FILTER (WHERE ...)` permite múltiplas agregações condicionais na mesma query em uma passagem: `SELECT SUM(valor) FILTER (WHERE status=\'pago\') AS receita_paga, SUM(valor) FILTER (WHERE status=\'pendente\') AS receita_pendente FROM pedidos`. Alternativa menos legível: CASE WHEN dentro da agregação: `SUM(CASE WHEN status=\'pago\' THEN valor ELSE 0 END)`.',
  },
  {
    question: 'Para que serve `ROLLUP` em GROUP BY e quando você o usaria?',
    options: [
      'ROLLUP cria índices automaticamente nas colunas do GROUP BY',
      'ROLLUP gera subtotais automáticos para hierarquias de agrupamento. `GROUP BY ROLLUP(ano, mes)` retorna: totais por (ano, mês), subtotais por (ano), e grande total — em uma única query. Útil para relatórios financeiros, dashboards com drill-down, e qualquer análise que precise de múltiplos níveis de agregação sem UNION ALL.',
      'ROLLUP é mais rápido que GROUP BY simples',
      'ROLLUP só funciona com duas colunas de agrupamento',
    ],
    correct: 1,
    explanation: '`CUBE` vai além: gera subtotais para todas as combinações possíveis. Para 3 dimensões (produto, região, mês), CUBE gera 8 agrupamentos (2³). `GROUPING SETS` permite especificar exatamente quais agrupamentos quer, sem os extras do ROLLUP/CUBE. NULL nas colunas de agrupamento indica "todos" — `GROUPING(coluna)` retorna 1 quando é o NULL de ROLLUP/CUBE.',
  },
];

export default function GroupByAgregacoesPage() {
  return (
    <ModuleLayout
      slug="group-by-agregacoes"
      title="GROUP BY, HAVING e agregações que resolvem 80% dos casos"
      icon="📊"
      xp={55}
      readTime={11}
      trailName="SQL & Databases"
      trailColor="#336791"
      nextSlug="window-functions"
      nextTitle="Window functions: ranking, running totals, lead/lag"
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
        Agregações são o que transformam linhas individuais em métricas de negócio. COUNT, SUM, AVG com GROUP BY resolvem a maioria dos relatórios — e FILTER, ROLLUP e DISTINCT ON resolvem os casos que parecem precisar de subqueries complicadas.
      </p>

      <Section accent={accent} title="Funções de agregação essenciais">
        <CodeBlock>{`-- Funções de agregação básicas
SELECT
    COUNT(*)                   AS total_pedidos,       -- conta linhas (inclui NULL)
    COUNT(DISTINCT cliente_id) AS clientes_unicos,     -- conta valores distintos
    SUM(total)                 AS receita_total,
    AVG(total)                 AS ticket_medio,
    MIN(total)                 AS menor_pedido,
    MAX(total)                 AS maior_pedido,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total) AS mediana,
    STDDEV(total)              AS desvio_padrao
FROM pedidos
WHERE status = 'concluido';

-- GROUP BY: agrupa linhas e aplica agregação por grupo
SELECT
    DATE_TRUNC('month', criado_em) AS mes,
    status,
    COUNT(*) AS num_pedidos,
    SUM(total) AS receita
FROM pedidos
GROUP BY DATE_TRUNC('month', criado_em), status
ORDER BY mes DESC, status;

-- Regra do GROUP BY: SELECT pode ter apenas
-- ✅ Colunas do GROUP BY
-- ✅ Funções de agregação
-- ❌ Outras colunas (erro: "must appear in GROUP BY clause")

-- HAVING: filtra após agregação
SELECT
    cliente_id,
    COUNT(*) AS num_pedidos,
    SUM(total) AS total_gasto
FROM pedidos
WHERE criado_em >= '2024-01-01'         -- filtra ANTES de agrupar
GROUP BY cliente_id
HAVING SUM(total) > 1000                -- filtra DEPOIS de agrupar
ORDER BY total_gasto DESC
LIMIT 20;`}</CodeBlock>
      </Section>

      <Section accent={accent} title="FILTER: agregações condicionais numa passagem">
        <CodeBlock>{`-- Relatório de pedidos por status — SEM FILTER (3 subqueries ou pivô manual)
SELECT
    COUNT(*) FILTER (WHERE status = 'pendente')   AS pendentes,
    COUNT(*) FILTER (WHERE status = 'processando') AS processando,
    COUNT(*) FILTER (WHERE status = 'concluido')  AS concluidos,
    COUNT(*) FILTER (WHERE status = 'cancelado')  AS cancelados,
    SUM(total) FILTER (WHERE status = 'concluido') AS receita_realizada,
    SUM(total) FILTER (WHERE status = 'pendente')  AS receita_potencial
FROM pedidos
WHERE criado_em >= NOW() - INTERVAL '30 days';

-- Alternativa menos legível (CASE WHEN dentro de agregação):
SELECT
    COUNT(CASE WHEN status = 'pendente' THEN 1 END) AS pendentes,
    SUM(CASE WHEN status = 'concluido' THEN total ELSE 0 END) AS receita
FROM pedidos;

-- Análise de cohort: primeiros 30 dias vs depois
SELECT
    DATE_TRUNC('month', primeiro_pedido.data) AS cohort,
    COUNT(DISTINCT p.cliente_id) AS total_clientes,
    COUNT(DISTINCT p.cliente_id) FILTER (
        WHERE p.criado_em <= primeiro_pedido.data + INTERVAL '30 days'
    ) AS compraram_no_primeiro_mes
FROM pedidos p
JOIN (
    SELECT cliente_id, MIN(criado_em) AS data FROM pedidos GROUP BY cliente_id
) primeiro_pedido USING (cliente_id)
GROUP BY DATE_TRUNC('month', primeiro_pedido.data)
ORDER BY cohort;`}</CodeBlock>
      </Section>

      <Section accent={accent} title="ROLLUP, CUBE e GROUPING SETS">
        <CodeBlock>{`-- ROLLUP: subtotais hierárquicos
SELECT
    COALESCE(DATE_TRUNC('year', criado_em)::TEXT, 'TOTAL') AS ano,
    COALESCE(DATE_TRUNC('month', criado_em)::TEXT, 'SUBTOTAL') AS mes,
    COUNT(*) AS pedidos,
    SUM(total) AS receita
FROM pedidos
GROUP BY ROLLUP(
    DATE_TRUNC('year', criado_em),
    DATE_TRUNC('month', criado_em)
)
ORDER BY ano NULLS LAST, mes NULLS LAST;

-- Resultado:
-- 2024-01-01 | 2024-01-01 | 150 | 45000   ← janeiro 2024
-- 2024-01-01 | 2024-02-01 | 130 | 39000   ← fevereiro 2024
-- 2024-01-01 | NULL       | 280 | 84000   ← subtotal 2024 (ROLLUP!)
-- NULL       | NULL       | 280 | 84000   ← grande total (ROLLUP!)

-- GROUPING SETS: especifica exatamente os agrupamentos que quer
SELECT
    produto,
    regiao,
    SUM(vendas) AS total
FROM fatos_vendas
GROUP BY GROUPING SETS (
    (produto, regiao),   -- por produto + região
    (produto),           -- só por produto
    (regiao),            -- só por região
    ()                   -- grande total
);

-- DISTINCT ON: primeiro registro de cada grupo (PostgreSQL específico)
SELECT DISTINCT ON (cliente_id)
    cliente_id,
    criado_em,
    total
FROM pedidos
ORDER BY cliente_id, criado_em DESC;   -- pega o pedido mais recente por cliente

-- Agregações de texto (string_agg é muito útil)
SELECT
    pedido_id,
    STRING_AGG(produto, ', ' ORDER BY produto) AS produtos_lista
FROM itens_pedido
GROUP BY pedido_id;`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Padrões essenciais:</strong> use <code>FILTER (WHERE ...)</code> para múltiplas agregações condicionais em vez de várias subqueries. Use <code>DISTINCT ON (coluna)</code> para o primeiro/último de cada grupo em vez de window function + subquery. Use <code>ROLLUP</code> para relatórios com subtotais automáticos. Sempre filtre com <code>WHERE</code> antes de agregar — é mais eficiente que <code>HAVING</code>.
      </Callout>

      <Callout>
        Próximo: <strong>Window functions</strong> — ROW_NUMBER, RANK, LAG, LEAD, e SUM OVER para cálculos que precisam ver outras linhas sem GROUP BY.
      </Callout>
    </div>
  );
}
