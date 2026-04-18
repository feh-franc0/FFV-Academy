import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#336791';

export const metadata = getModuleMetadata('window-functions');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre ROW_NUMBER, RANK e DENSE_RANK quando há empates?',
    options: [
      'São idênticos — apenas têm nomes diferentes por compatibilidade',
      'Para valores empatados: ROW_NUMBER atribui números únicos arbitrariamente (empates recebem números consecutivos diferentes). RANK pula números após empates (1, 1, 3 — o 2 é pulado). DENSE_RANK não pula (1, 1, 2). Use RANK quando posições "saltadas" fazem sentido (como olimpíadas), DENSE_RANK para rankings contínuos.',
      'ROW_NUMBER é mais rápido por isso é sempre preferível',
      'DENSE_RANK só funciona com valores numéricos',
    ],
    correct: 1,
    explanation: 'Exemplo: vendedores com vendas [100, 100, 80]. ROW_NUMBER: [1, 2, 3]. RANK: [1, 1, 3]. DENSE_RANK: [1, 1, 2]. Escolha: olimpíadas (RANK — 2 ouros, sem prata, um bronze), top N produtos (DENSE_RANK — o 3º mais vendido existe sempre), paginação estável (ROW_NUMBER — cada linha tem número único).',
  },
  {
    question: 'Como LAG e LEAD funcionam e para que são usados tipicamente?',
    options: [
      'LAG e LEAD são sinônimos — ambos acessam a linha anterior',
      'LAG(expr, n) acessa o valor n linhas ANTES na janela ordenada. LEAD(expr, n) acessa n linhas DEPOIS. Ambos retornam NULL se não há linha suficiente. Usados para: calcular variação período a período (vendas este mês vs mês anterior), detecção de mudança de estado (status mudou?), e análise de sequências temporais.',
      'LAG só funciona com datas, LEAD com números',
      'LAG e LEAD requerem que a tabela tenha uma coluna id sequencial',
    ],
    correct: 1,
    explanation: '`LAG(total, 1, 0)` — o terceiro argumento é o default quando não há linha anterior. Exemplo: crescimento MoM: `(total - LAG(total) OVER (PARTITION BY produto ORDER BY mes)) / LAG(total) OVER (...) * 100`. Session analysis: `LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time)` — diferença entre eventos consecutivos do mesmo usuário.',
  },
  {
    question: 'O que `PARTITION BY` faz dentro de uma window function?',
    options: [
      'PARTITION BY é equivalente a GROUP BY e colapsa linhas em grupos',
      'PARTITION BY divide as linhas em grupos para a window function operar separadamente em cada grupo — mas sem colapsar linhas (cada linha ainda existe no resultado). `ROW_NUMBER() OVER (PARTITION BY departamento ORDER BY salario DESC)` numera funcionários dentro de cada departamento separadamente. Sem PARTITION BY, a janela é toda a tabela.',
      'PARTITION BY distribui a query em múltiplos processadores',
      'PARTITION BY só funciona com ROW_NUMBER, não com LAG ou SUM',
    ],
    correct: 1,
    explanation: 'A diferença fundamental: GROUP BY colapsa N linhas em 1 por grupo — você perde as linhas individuais. PARTITION BY mantém todas as linhas e calcula a função dentro de cada partição separadamente. Use quando precisar de: "rank dentro do departamento", "soma acumulada por mês reiniciando por produto", "primeira compra de cada cliente".',
  },
];

export default function WindowFunctionsPage() {
  return (
    <ModuleLayout
      slug="window-functions"
      title="Window functions: ranking, running totals, lead/lag"
      icon="🪟"
      xp={75}
      readTime={15}
      trailName="SQL & Databases"
      trailColor="#336791"
      nextSlug="indices-que-funcionam"
      nextTitle="Índices que funcionam: B-tree, hash, GIN, covering, composto"
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
        Window functions são as ferramentas SQL mais poderosas que a maioria dos desenvolvedores não usa. Elas calculam valores baseados em linhas relacionadas sem colapsar o resultado — rank, running total, e variação período-a-período em uma única query limpa.
      </p>

      <Section accent={accent} title="Sintaxe e componentes de uma window function">
        <CodeBlock>{`-- Sintaxe: função OVER (PARTITION BY ... ORDER BY ... frame)
-- PARTITION BY: divide em grupos (opcional)
-- ORDER BY: ordena dentro de cada partição
-- frame: define quais linhas a janela inclui

-- Exemplo base: funcionários com salário e rank no departamento
SELECT
    nome,
    departamento,
    salario,
    ROW_NUMBER() OVER (
        PARTITION BY departamento
        ORDER BY salario DESC
    ) AS rank_no_dept,
    RANK() OVER (
        PARTITION BY departamento
        ORDER BY salario DESC
    ) AS rank_com_empate,
    AVG(salario) OVER (
        PARTITION BY departamento
    ) AS media_dept,
    salario - AVG(salario) OVER (PARTITION BY departamento) AS diff_da_media
FROM funcionarios;

-- Top 3 vendedores por região (filtrar com subquery)
SELECT *
FROM (
    SELECT
        nome, regiao, vendas,
        RANK() OVER (PARTITION BY regiao ORDER BY vendas DESC) AS rk
    FROM vendedores
) ranked
WHERE rk <= 3;`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Running totals, média móvel e FRAME">
        <CodeBlock>{`-- Running total (soma acumulada)
SELECT
    data,
    receita,
    SUM(receita) OVER (ORDER BY data) AS receita_acumulada,
    AVG(receita) OVER (
        ORDER BY data
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS media_movel_7d
FROM receitas_diarias
ORDER BY data;

-- Frames disponíveis:
-- ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  ← padrão para SUM/AVG com ORDER BY
-- ROWS BETWEEN 6 PRECEDING AND CURRENT ROW          ← janela deslizante de 7 dias
-- ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING          ← linha anterior e posterior
-- ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ← toda a partição

-- Partição + running total: acumulado por produto por mês
SELECT
    produto,
    mes,
    vendas,
    SUM(vendas) OVER (
        PARTITION BY produto
        ORDER BY mes
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS acumulado_por_produto
FROM vendas_mensais
ORDER BY produto, mes;`}</CodeBlock>
      </Section>

      <Section accent={accent} title="LAG, LEAD, FIRST_VALUE, LAST_VALUE">
        <CodeBlock>{`-- LAG e LEAD: acessar linhas vizinhas
SELECT
    produto,
    mes,
    vendas,
    LAG(vendas) OVER (PARTITION BY produto ORDER BY mes) AS mes_anterior,
    vendas - LAG(vendas, 1, 0) OVER (
        PARTITION BY produto ORDER BY mes
    ) AS variacao_absoluta,
    ROUND(
        (vendas - LAG(vendas) OVER (PARTITION BY produto ORDER BY mes)) /
        NULLIF(LAG(vendas) OVER (PARTITION BY produto ORDER BY mes), 0) * 100, 2
    ) AS variacao_pct
FROM vendas_mensais
ORDER BY produto, mes;

-- FIRST_VALUE e LAST_VALUE: extremos da janela
SELECT
    vendedor,
    data_venda,
    valor,
    FIRST_VALUE(valor) OVER (
        PARTITION BY vendedor
        ORDER BY data_venda
    ) AS primeira_venda,
    LAST_VALUE(valor) OVER (
        PARTITION BY vendedor
        ORDER BY data_venda
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS ultima_venda   -- ⚠️ precisa do frame explícito!
FROM vendas
ORDER BY vendedor, data_venda;

-- NTH_VALUE, NTILE: percentis e quartis
SELECT
    produto, preco,
    NTILE(4) OVER (ORDER BY preco) AS quartil   -- divide em 4 grupos iguais
FROM produtos;`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Casos de uso práticos">
        <ComparisonTable
          headers={['Problema', 'Solução com window function']}
          rows={[
            ['Primeiro pedido de cada cliente', 'ROW_NUMBER() OVER (PARTITION BY cliente ORDER BY data) = 1'],
            ['Crescimento mês a mês', 'LAG(valor) OVER (PARTITION BY produto ORDER BY mes)'],
            ['Média móvel 7 dias', 'AVG() OVER (ORDER BY data ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)'],
            ['Top N por grupo', 'RANK() OVER (PARTITION BY grupo ORDER BY valor DESC) <= N'],
            ['% do total do grupo', 'SUM() OVER (PARTITION BY grupo) no denominador'],
            ['Valor acumulado', 'SUM() OVER (PARTITION BY ... ORDER BY data)'],
          ]}
          accent={accent}
        />
      </Section>

      <Callout tone="success">
        <strong>Quando usar window functions:</strong> sempre que você precisar de cálculos que dependem de outras linhas sem colapsar o resultado. Elas eliminam self-joins, subqueries correlacionadas e processamento em múltiplas passagens. O custo: uma única varredura da tabela com sorting — mais eficiente que alternativas procedurais.
      </Callout>

      <Callout>
        Próximo: <strong>Índices que funcionam</strong> — por que um índice pode não ser usado e como criar índices que realmente melhoram performance.
      </Callout>
    </div>
  );
}
