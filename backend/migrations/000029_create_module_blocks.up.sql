-- Module blocks: árvore de blocos JSON estruturados que compõem um artigo.
-- Cada bloco corresponde 1:1 a um componente React em primitives.tsx
-- (Section, Callout, CodeBlock, FlowDiagram, etc).
--
-- Estrutura recursiva via parent_id: Section pode conter Callouts,
-- Callouts contêm parágrafos com inline marks (bold/italic/link).
-- Recursão limitada a 3 níveis pela camada de aplicação.
--
-- Fetch eficiente: CTE recursivo (ver block_repo.go) traz tudo em 1 query.

CREATE TABLE module_blocks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_slug  TEXT NOT NULL,
    parent_id     UUID,
    position      INT  NOT NULL,
    block_type    TEXT NOT NULL,
    block_data    JSONB NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT module_blocks_type_valid CHECK (block_type IN (
        'section', 'paragraph', 'callout', 'code_block',
        'comparison_table', 'decision_box', 'flow_diagram',
        'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
        'node_graph', 'annotated_formula', 'quiz', 'image'
    )),

    CONSTRAINT module_blocks_position_non_negative CHECK (position >= 0),

    -- FK para artigo: se artigo for deletado, blocos vão junto.
    CONSTRAINT fk_module_blocks_article
        FOREIGN KEY (article_slug) REFERENCES curriculum_articles(slug)
        ON DELETE CASCADE,

    -- Self-reference: se parent for deletado, filhos vão junto.
    CONSTRAINT fk_module_blocks_parent
        FOREIGN KEY (parent_id) REFERENCES module_blocks(id)
        ON DELETE CASCADE
);

-- Index principal: pegar todos os blocks de um artigo em ordem.
-- Cobre o uso mais comum: GET /api/v1/curriculum/:slug.
CREATE INDEX idx_module_blocks_article_position
    ON module_blocks(article_slug, position);

-- Index para CTE recursivo: encontrar filhos de um parent rapidamente.
CREATE INDEX idx_module_blocks_parent
    ON module_blocks(parent_id, position)
    WHERE parent_id IS NOT NULL;

-- Index para queries em block_data (JSONB) — uso futuro pra busca em conteúdo.
CREATE INDEX idx_module_blocks_data_gin
    ON module_blocks USING gin(block_data jsonb_path_ops);

COMMENT ON TABLE  module_blocks            IS 'Árvore de blocos JSON que compõem cada módulo (artigo).';
COMMENT ON COLUMN module_blocks.block_type IS 'Tipo discriminador (section, callout, code_block, ...). Validado por CHECK constraint.';
COMMENT ON COLUMN module_blocks.block_data IS 'Props do componente React em formato JSON. Schema validado na app layer (Go validator + Zod).';
COMMENT ON COLUMN module_blocks.parent_id  IS 'NULL para blocos top-level. UUID do parent para blocos aninhados (ex: Callout dentro de Section).';
COMMENT ON COLUMN module_blocks.position   IS 'Ordem dentro do parent (ou do artigo se parent_id IS NULL).';
