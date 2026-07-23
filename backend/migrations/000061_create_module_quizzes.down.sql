-- Reverte migration 000061
-- Restaura 'quiz' no CHECK de module_blocks e remove module_quizzes.

ALTER TABLE module_blocks
    DROP CONSTRAINT IF EXISTS module_blocks_type_valid;

ALTER TABLE module_blocks
    ADD CONSTRAINT module_blocks_type_valid
        CHECK (block_type = ANY (ARRAY[
            'section', 'paragraph', 'callout', 'code_block',
            'comparison_table', 'decision_box', 'flow_diagram',
            'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
            'node_graph', 'annotated_formula', 'quiz', 'image', 'qa_item',
            'key_value', 'list', 'hierarchy_diagram', 'comparison_flow',
            'split_flow', 'layer_stack', 'mind_map', 'exam_domain_badge'
        ]));

DROP INDEX IF EXISTS idx_module_quizzes_module;
DROP TABLE IF EXISTS module_quizzes;
