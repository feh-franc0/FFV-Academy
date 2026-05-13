import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#336791';

export const metadata = getModuleMetadata('normalizacao-modelagem');

const quiz: QuizQuestion[] = [
  {
    question: 'O que é uma "anomalia de atualização" e como a normalização a resolve?',
    options: [
      'Anomalia de atualização é um bug no PostgreSQL ao fazer UPDATE',
      'Anomalia de atualização: numa tabela não-normalizada, atualizar um dado requer modificar múltiplas linhas — e esqueces alguma cria inconsistência. Ex: tabela com (pedido_id, produto_nome, produto_preco, produto_categoria) — mudar a categoria do produto exige UPDATE em todas as linhas com aquele produto. Normalização separa dados em tabelas únicas: produto_id referencia tabela produtos com categoria em um só lugar.',
      'Anomalia de atualização é quando o UPDATE é mais lento que esperado',
      'Anomalia de atualização só ocorre em bancos sem índices',
    ],
    correct: 1,
    explanation: 'Três tipos de anomalias em tabelas não-normalizadas: Update anomaly (atualizar requer múltiplos UPDATEs inconsistentes), Insert anomaly (não consegue inserir dados sem informações relacionadas), Delete anomaly (deletar um registro remove dados de outro). A normalização resolve separando dados em tabelas coesas com dependências funcionais claras.',
  },
  {
    question: 'Qual a diferença prática entre 2NF e 3NF?',
    options: [
      'São equivalentes — apenas nomenclaturas diferentes',
      '2NF elimina dependências parciais: todo atributo não-chave depende da chave TODA (não de parte dela). Aplica-se a tabelas com chave composta. 3NF elimina dependências transitivas: atributo A não deve depender de atributo B que depende da chave (em vez de depender diretamente da chave). Ex: funcionarios(id, dept_id, dept_nome) — dept_nome depende de dept_id, não de id diretamente.',
      '3NF é mais restritivo e raramente aplicada na prática',
      '2NF só se aplica a tabelas com primary key simples',
    ],
    correct: 1,
    explanation: 'Exemplo de violação 3NF: `pedidos(id, cliente_id, cliente_cidade, cliente_pais)`. cidade depende de cliente_id (não do id do pedido) e pais depende de cidade — dependência transitiva. Solução: tabela clientes separada. Regra mnemônica: "3NF = depende da chave, toda a chave, nada além da chave". BCNF (Boyce-Codd) é versão mais forte, raramente necessária.',
  },
  {
    question: 'Quando desnormalizar intencionalmente é a decisão correta?',
    options: [
      'Nunca — normalização sempre deve ser mantida em produção',
      'Desnormalizar quando: (1) queries de leitura são críticas e JOINs são o gargalo medido; (2) dados históricos que não mudam (endereço no momento do pedido); (3) tabelas de analytics/OLAP onde leitura é 99% dos casos; (4) colunas calculadas frequentemente (total do pedido = SUM dos itens). Sempre meça antes de desnormalizar — premature optimization é o problema, não a normalização.',
      'Desnormalizar quando a tabela tem mais de 1 milhão de linhas',
      'Desnormalizar sempre que houver mais de 3 JOINs na query',
    ],
    correct: 1,
    explanation: 'Desnormalização aceita trade-off: mais dados duplicados e risco de inconsistência em troca de queries mais rápidas. Técnicas: (1) coluna calculada persistida (GENERATED STORED), (2) tabela de summary/aggregate atualizada via trigger, (3) campos desnormalizados com garantia de consistência via trigger, (4) tabela OLAP separada alimentada por ETL. Sempre manter a tabela normalizada como fonte da verdade.',
  },
];

export default function NormalizacaoModelagemPage() {
  return (
    <ModuleLayout
      slug="normalizacao-modelagem"
      title="Modelagem e normalização: 1NF–3NF + quando desnormalizar"
      icon="📐"
      xp={60}
      readTime={12}
      trailName="SQL & Databases"
      trailColor="#336791"
      nextSlug="migrations-profissionais"
      nextTitle="Migrations profissionais: reversíveis, zero-downtime"
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
        Normalização não é teoria acadêmica — é o que evita que seu banco de dados acumule inconsistências conforme cresce. Entender as formas normais resolve o "por que separar em tabelas?" e quando a desnormalização faz sentido como decisão consciente.
      </p>

      <Section accent={accent} title="1NF: atomicidade e sem repetição de grupos">
        <CodeBlock>{`-- ❌ Violação de 1NF: múltiplos valores em uma célula
CREATE TABLE pedidos_ruim (
    id INT,
    cliente TEXT,
    produtos TEXT,          -- "Camiseta, Calça, Tênis" ← não atômico
    precos TEXT             -- "50.00, 120.00, 200.00" ← não atômico
);

-- ❌ Violação de 1NF: grupos repetidos de colunas
CREATE TABLE pedidos_ruim2 (
    id INT,
    cliente TEXT,
    produto1 TEXT, preco1 DECIMAL,
    produto2 TEXT, preco2 DECIMAL,   -- grupo repetido
    produto3 TEXT, preco3 DECIMAL    -- limite arbitrário de 3 itens
);

-- ✅ 1NF: valores atômicos, sem grupos repetidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INT,
    data TIMESTAMP
);
CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id),
    produto TEXT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    quantidade INT NOT NULL DEFAULT 1
);
-- Cada célula tem um valor atômico, sem limite de itens por pedido`}</CodeBlock>
      </Section>

      <Section accent={accent} title="2NF e 3NF: eliminando dependências">
        <CodeBlock>{`-- ❌ Violação de 2NF (chave composta, dependência parcial):
CREATE TABLE item_pedido_ruim (
    pedido_id INT,
    produto_id INT,
    quantidade INT,
    -- Dependência parcial: estes dependem só de produto_id, não de (pedido_id, produto_id)
    produto_nome TEXT,
    produto_preco DECIMAL,
    categoria TEXT,
    PRIMARY KEY (pedido_id, produto_id)
);

-- ✅ 2NF: separar o que depende de produto_id
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    preco_base DECIMAL(10,2) NOT NULL,
    categoria_id INT REFERENCES categorias(id)
);
CREATE TABLE itens_pedido (
    pedido_id INT,
    produto_id INT,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,  -- preço no momento do pedido
    PRIMARY KEY (pedido_id, produto_id)
);

-- ❌ Violação de 3NF (dependência transitiva):
CREATE TABLE funcionarios_ruim (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    dept_id INT,
    dept_nome TEXT,         -- depende de dept_id, não de id diretamente
    dept_localizacao TEXT   -- idem
);

-- ✅ 3NF: dependência transitiva resolvida
CREATE TABLE departamentos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    localizacao TEXT
);
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    dept_id INT REFERENCES departamentos(id)
);`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Quando desnormalizar: técnicas práticas">
        <ComparisonTable
          headers={['Técnica', 'Quando usar', 'Trade-off']}
          rows={[
            ['Coluna calculada (GENERATED STORED)', 'total = SUM(itens) frequente na query', 'Espaço extra, automático pelo banco'],
            ['Coluna desnormalizada + trigger', 'Leitura crítica, escrita rara', 'Complexidade de manutenção'],
            ['Tabela de sumário', 'Dashboard com milhões de linhas', 'Staleness, ETL/trigger necessário'],
            ['JSONB para dados variáveis', 'Schema de produto varia por tipo', 'Queries menos eficientes'],
            ['Endereço embutido no pedido', 'Dados históricos imutáveis', 'Duplicação aceitável'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`-- Coluna calculada persistida (PostgreSQL GENERATED STORED):
CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED
    -- subtotal é calculado e armazenado automaticamente
);
SELECT SUM(subtotal) FROM itens_pedido WHERE pedido_id = 42;
-- Sem JOIN ou recálculo — diretamente da coluna

-- Endereço desnormalizado no pedido (dado histórico):
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id),
    -- Snapshot do endereço no momento do pedido:
    endereco_rua TEXT,
    endereco_cidade TEXT,
    endereco_cep TEXT,
    -- Mesmo que o cliente mude o endereço, o pedido histórico mantém o original
    total DECIMAL(10,2)
);

-- Trigger para manter total atualizado:
CREATE OR REPLACE FUNCTION atualizar_total_pedido()
RETURNS TRIGGER AS \$\$
BEGIN
    UPDATE pedidos
    SET total = (
        SELECT COALESCE(SUM(quantidade * preco_unitario), 0)
        FROM itens_pedido
        WHERE pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id)
    )
    WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Abordagem prática:</strong> normalize até 3NF por padrão — é a base correta. Desnormalize apenas quando EXPLAIN ANALYZE mostrar que JOINs são o gargalo real (não o que você acha). Use <code>GENERATED STORED</code> para colunas calculadas frequentes. Guarde snapshots de dados históricos (endereço, preço no momento) que não devem ser alterados retroativamente.
      </Callout>

      <Callout>
        Próximo: <strong>Migrations profissionais</strong> — como fazer mudanças de schema em produção sem downtime e sem perder dados.
      </Callout>
    </div>
  );
}
