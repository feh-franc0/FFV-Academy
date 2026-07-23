-- Cria materialized view base_stats para counters de hubs/trilhas/módulos por base.
-- Substitui as colunas estáticas bases.hubs, bases.trails, bases.modules.
-- Refresh: CONCURRENTLY a cada 5min via aplicação Go (não depende de pg_cron).

CREATE MATERIALIZED VIEW IF NOT EXISTS base_stats AS
SELECT
    b.slug                                                          AS base_slug,
    COUNT(DISTINCT h.id)                                            AS hubs_count,
    COUNT(DISTINCT t.id)                                            AS trails_count,
    COUNT(DISTINCT ca.slug) FILTER (
        WHERE ca.status = 'published' AND ca.deleted_at IS NULL
    )                                                               AS modules_count
FROM bases b
LEFT JOIN hubs h
    ON h.base_slug = b.slug
LEFT JOIN trails t
    ON t.hub_id = h.id
LEFT JOIN curriculum_articles ca
    ON ca.trail_id = t.id
GROUP BY b.slug;

CREATE UNIQUE INDEX IF NOT EXISTS idx_base_stats_slug
    ON base_stats(base_slug);

-- Executa primeiro refresh para popular a view
REFRESH MATERIALIZED VIEW base_stats;
