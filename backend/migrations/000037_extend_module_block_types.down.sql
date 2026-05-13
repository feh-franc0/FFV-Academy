-- Reverte: volta ao CHECK constraint original (15 tipos).
ALTER TABLE module_blocks DROP CONSTRAINT IF EXISTS module_blocks_type_valid;

ALTER TABLE module_blocks ADD CONSTRAINT module_blocks_type_valid CHECK (block_type IN (
    'section', 'paragraph', 'callout', 'code_block',
    'comparison_table', 'decision_box', 'flow_diagram',
    'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
    'node_graph', 'annotated_formula', 'quiz', 'image'
));
