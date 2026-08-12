-- Migration 044: adiciona 'arch_diagram' (e o alias legado 'aws_diagram') ao
-- CHECK constraint de module_blocks.block_type.
--
-- POR QUE ISSO É CRÍTICO: o bloco de diagrama de arquitetura foi criado no
-- frontend em jul/2026 e usado em 105 módulos dos seeds — mas NINGUÉM estendeu
-- este constraint. A migration 037 (última a tocá-lo) lista 24 tipos e nenhum
-- dos dois. Consequência: o importer falharia no INSERT de todo bloco de
-- diagrama, derrubando a importação dos módulos das trilhas de certificação e
-- do Bedrock inteiras. O defeito nunca apareceu porque o deploy com esses seeds
-- ainda não aconteceu — foi pego em validação, não em incidente.
--
-- 'arch_diagram' é o tipo canônico (o componente é agnóstico: serve topologia
-- AWS e conceito de arquitetura — RLHF, HNSW, consenso). 'aws_diagram' é o nome
-- original, mantido como alias aceito para seed antigo; o frontend renderiza os
-- dois com o mesmo adapter.

ALTER TABLE module_blocks DROP CONSTRAINT IF EXISTS module_blocks_type_valid;

ALTER TABLE module_blocks ADD CONSTRAINT module_blocks_type_valid CHECK (block_type IN (
    -- Sprint 1 (originais)
    'section', 'paragraph', 'callout', 'code_block',
    'comparison_table', 'decision_box', 'flow_diagram',
    'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
    'node_graph', 'annotated_formula', 'quiz', 'image',
    -- Sprint 2.5
    'qa_item', 'key_value', 'list',
    'hierarchy_diagram', 'comparison_flow', 'split_flow',
    'layer_stack', 'mind_map', 'exam_domain_badge',
    -- Diagrama de arquitetura com ícones (jul/2026)
    'arch_diagram', 'aws_diagram'
));
