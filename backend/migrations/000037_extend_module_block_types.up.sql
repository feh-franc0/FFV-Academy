-- Migration 037: estende o CHECK constraint de module_blocks.block_type para
-- incluir tipos avançados extraídos pelo parser TSX (Sprint 2.5).
--
-- Tipos novos:
--   - qa_item              (QAItem — pergunta/resposta)
--   - key_value            (KeyValue — tabela chave/valor)
--   - list                 (ul/ol — listas com items)
--   - hierarchy_diagram    (HierarchyDiagram — árvore de níveis)
--   - comparison_flow      (ComparisonFlow — comparação left vs right)
--   - split_flow           (SplitFlow — left + center + right)
--   - layer_stack          (LayerStack — pilha de camadas)
--   - mind_map             (MindMap — root + branches)
--   - exam_domain_badge    (ExamDomainBadge — badge de domínio em simulados)

ALTER TABLE module_blocks DROP CONSTRAINT IF EXISTS module_blocks_type_valid;

ALTER TABLE module_blocks ADD CONSTRAINT module_blocks_type_valid CHECK (block_type IN (
    -- Sprint 1 (originais)
    'section', 'paragraph', 'callout', 'code_block',
    'comparison_table', 'decision_box', 'flow_diagram',
    'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
    'node_graph', 'annotated_formula', 'quiz', 'image',
    -- Sprint 2.5 (novos)
    'qa_item', 'key_value', 'list',
    'hierarchy_diagram', 'comparison_flow', 'split_flow',
    'layer_stack', 'mind_map', 'exam_domain_badge'
));
