-- Drop idx_comments_target — substituído por idx_comments_target_score na
-- migration 46, que cobre o mesmo (target_type, target_id) + score ordering.
--
-- Manter os 2 índices duplica overhead em INSERT/UPDATE sem ganho de query.
-- Identificado pelo audit de performance (Comments Performance Audit #4).

DROP INDEX IF EXISTS idx_comments_target;
