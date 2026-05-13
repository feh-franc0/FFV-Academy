-- module_views: registra cada acesso a um módulo (/aprenda/<slug>).
-- Anônimos permitidos (user_id NULL). Usado para:
--   - Métricas admin: top trails / top modules / DAU
--   - Recomendação "trending" pra home
--   - Analytics editorial (módulos sem tráfego = candidatos a corte)
--
-- Granularidade: 1 row por (user_id|anon_id, slug, viewed_at) — sem dedupe.
-- Dedupe por sessão é responsabilidade do client (ping 1x/módulo/sessão).
CREATE TABLE module_views (
    id           BIGSERIAL PRIMARY KEY,
    user_id      TEXT,                                -- NULL = anônimo
    anon_id      TEXT,                                -- cookie/localStorage id, opcional
    slug         TEXT NOT NULL,
    hub_id       TEXT,
    trail_id     TEXT,
    duration_sec INTEGER,                             -- preenchido em beacon de saída (opcional)
    referrer     TEXT,
    user_agent   TEXT,
    viewed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para agregações típicas
CREATE INDEX idx_module_views_slug_viewed_at ON module_views (slug, viewed_at DESC);
CREATE INDEX idx_module_views_trail_id_viewed_at ON module_views (trail_id, viewed_at DESC) WHERE trail_id IS NOT NULL;
CREATE INDEX idx_module_views_hub_id_viewed_at ON module_views (hub_id, viewed_at DESC) WHERE hub_id IS NOT NULL;
CREATE INDEX idx_module_views_viewed_at ON module_views (viewed_at DESC);
CREATE INDEX idx_module_views_user_id ON module_views (user_id) WHERE user_id IS NOT NULL;
