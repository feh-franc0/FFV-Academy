-- module_views++: enriquece o tracking pra suportar admin profissional.
--
-- Contexto: o pedido do PO (2026-05-21) foi "métricas reais de acessos por
-- módulo, quem acessou cada módulo, enviando via headers algo da sessão".
-- As colunas atuais (user_id, anon_id, slug) NÃO permitem:
--   - filtrar por base (tecnologia vs medicina-veterinaria)
--   - mostrar EMAIL/NOME do usuário no admin sem JOIN caro a cada view
--   - agrupar por sessão pra "atividade de um usuário hoje"
--   - rastrear páginas que não são /aprenda/<slug> (admin, ranking, simulado)
--
-- Esta migration adiciona:
--   - base_slug:         qual base disparou a view (tecnologia, medicina-veterinaria, …)
--   - user_email:        email do usuário LOGADO no momento (denormalizado pra UI rápida)
--   - user_display_name: nome amigável pra exibir no admin
--   - session_id:        UUID por sessão de navegador — correlaciona pageviews
--   - path:              URL completa (não só slug) — rastreia /ranking, /admin/x, /simulados, etc.
--   - kind:              'module' | 'page' | 'simulado' | 'admin' (categoriza pra dashboard)
--
-- Todas as colunas são NULLABLE — eventos antigos continuam válidos.
-- Não há backfill: dados existentes ficam como "kind=module sem base_slug".

ALTER TABLE module_views
    ADD COLUMN IF NOT EXISTS base_slug          TEXT,
    ADD COLUMN IF NOT EXISTS user_email         TEXT,
    ADD COLUMN IF NOT EXISTS user_display_name  TEXT,
    ADD COLUMN IF NOT EXISTS session_id         TEXT,
    ADD COLUMN IF NOT EXISTS path               TEXT,
    ADD COLUMN IF NOT EXISTS kind               TEXT NOT NULL DEFAULT 'module';

-- Filtro mais comum no admin: "views por base nos últimos 7 dias".
CREATE INDEX IF NOT EXISTS idx_module_views_base_viewed
    ON module_views (base_slug, viewed_at DESC)
    WHERE base_slug IS NOT NULL;

-- Filtro "atividade do usuário X": lookup por email + ordem cronológica.
-- Denormalizar email permite admin/views sem JOIN com users (que pode ser
-- deletado — soft-delete) e mantém histórico mesmo após exclusão de conta.
CREATE INDEX IF NOT EXISTS idx_module_views_user_email_viewed
    ON module_views (lower(user_email), viewed_at DESC)
    WHERE user_email IS NOT NULL;

-- Sessão: agrupa pageviews de uma mesma "visita" no admin.
CREATE INDEX IF NOT EXISTS idx_module_views_session
    ON module_views (session_id, viewed_at)
    WHERE session_id IS NOT NULL;

-- kind: filtro rápido pra dashboards ("só simulados", "só admin pages").
CREATE INDEX IF NOT EXISTS idx_module_views_kind_viewed
    ON module_views (kind, viewed_at DESC);

COMMENT ON COLUMN module_views.base_slug IS 'slug da base de conhecimento (tecnologia, medicina-veterinaria, …) — NULL para páginas globais';
COMMENT ON COLUMN module_views.user_email IS 'email denormalizado do usuário logado no momento da view (snapshot — não joina users)';
COMMENT ON COLUMN module_views.user_display_name IS 'nome amigável pra exibir no admin';
COMMENT ON COLUMN module_views.session_id IS 'UUID gerado pelo client no init da sessão de navegador';
COMMENT ON COLUMN module_views.path IS 'URL completa da página (não só slug do módulo)';
COMMENT ON COLUMN module_views.kind IS 'module | page | simulado | admin | other';
