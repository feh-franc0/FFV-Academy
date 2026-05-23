-- Cria module_quizzes: questões de fixação por módulo (SRS pós-leitura).
-- Entidade separada de questions (que são questões de simulado/certificação).
-- Migra blocos block_type='quiz' existentes para esta tabela e os remove de module_blocks.

CREATE TABLE IF NOT EXISTS module_quizzes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_slug TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
    position    INT  NOT NULL DEFAULT 0,
    stem        TEXT NOT NULL,
    options     JSONB NOT NULL,
    correct_id  TEXT NOT NULL,
    explanation TEXT NOT NULL DEFAULT '',
    difficulty  TEXT NOT NULL DEFAULT 'medium',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT module_quizzes_correct_valid
        CHECK (correct_id IN ('A', 'B', 'C', 'D', 'E')),
    CONSTRAINT module_quizzes_difficulty_valid
        CHECK (difficulty IN ('easy', 'medium', 'hard')),
    CONSTRAINT module_quizzes_stem_length
        CHECK (length(stem) >= 5 AND length(stem) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_module_quizzes_module
    ON module_quizzes(module_slug, position);

-- Migra blocos quiz existentes para module_quizzes
INSERT INTO module_quizzes (module_slug, position, stem, options, correct_id, explanation, difficulty, created_at)
SELECT
    article_slug,
    position,
    COALESCE(block_data->>'stem', block_data->>'question', ''),
    COALESCE(block_data->'options', block_data->'choices', '[]'::jsonb),
    COALESCE(block_data->>'correct_id', block_data->>'correctId', block_data->>'answer', 'A'),
    COALESCE(block_data->>'explanation', ''),
    COALESCE(block_data->>'difficulty', 'medium'),
    created_at
FROM module_blocks
WHERE block_type = 'quiz'
  AND COALESCE(block_data->>'stem', block_data->>'question', '') <> ''
ON CONFLICT DO NOTHING;

-- Remove blocos quiz migrados
DELETE FROM module_blocks WHERE block_type = 'quiz';

-- Remove 'quiz' do CHECK constraint de block_type
ALTER TABLE module_blocks
    DROP CONSTRAINT IF EXISTS module_blocks_type_valid;

ALTER TABLE module_blocks
    ADD CONSTRAINT module_blocks_type_valid
        CHECK (block_type = ANY (ARRAY[
            'section', 'paragraph', 'callout', 'code_block',
            'comparison_table', 'decision_box', 'flow_diagram',
            'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
            'node_graph', 'annotated_formula', 'image', 'qa_item',
            'key_value', 'list', 'hierarchy_diagram', 'comparison_flow',
            'split_flow', 'layer_stack', 'mind_map', 'exam_domain_badge'
        ]));
