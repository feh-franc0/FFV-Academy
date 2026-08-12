-- Reverte para o constraint da migration 037 (sem os tipos de diagrama).
-- ATENÇÃO: o down falha se existirem linhas com block_type IN
-- ('arch_diagram','aws_diagram') — remova-as antes, ou aceite que este down não
-- é aplicável depois que os seeds com diagrama forem importados.

ALTER TABLE module_blocks DROP CONSTRAINT IF EXISTS module_blocks_type_valid;

ALTER TABLE module_blocks ADD CONSTRAINT module_blocks_type_valid CHECK (block_type IN (
    'section', 'paragraph', 'callout', 'code_block',
    'comparison_table', 'decision_box', 'flow_diagram',
    'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
    'node_graph', 'annotated_formula', 'quiz', 'image',
    'qa_item', 'key_value', 'list',
    'hierarchy_diagram', 'comparison_flow', 'split_flow',
    'layer_stack', 'mind_map', 'exam_domain_badge'
));
