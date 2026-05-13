-- Trail enrollments: tracking de quem começou cada trilha + onde parou.
-- Permite features "Continuar de onde parou", certificate ao completar,
-- métricas de funil/dropoff por trilha.
--
-- HANDLERS HTTP AINDA NÃO EXISTEM. Schema preparado.
--
-- Hoje há `completedModules` no GameState (localStorage). Quando ativar,
-- inferir enrollment a partir do primeiro módulo completado de cada trilha.

CREATE TABLE trail_enrollments (
    user_id          TEXT NOT NULL,
    trail_id         TEXT NOT NULL,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at     TIMESTAMPTZ,
    last_seen_slug   TEXT,

    PRIMARY KEY (user_id, trail_id),

    -- Coerência: completion >= start.
    CONSTRAINT trail_enrollments_completed_after_start
        CHECK (completed_at IS NULL OR completed_at >= started_at),

    CONSTRAINT fk_trail_enrollments_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trail_enrollments_trail
        FOREIGN KEY (trail_id) REFERENCES trails(id)
        ON DELETE CASCADE,

    -- last_seen_slug pode virar NULL se o artigo for deletado.
    CONSTRAINT fk_trail_enrollments_last_seen
        FOREIGN KEY (last_seen_slug) REFERENCES curriculum_articles(slug)
        ON DELETE SET NULL
);

-- Index para "minhas trilhas em andamento" no profile.
CREATE INDEX idx_trail_enrollments_user_active
    ON trail_enrollments(user_id, started_at DESC)
    WHERE completed_at IS NULL;

-- Index para "trilhas concluídas" (certificate elegibility).
CREATE INDEX idx_trail_enrollments_user_completed
    ON trail_enrollments(user_id, completed_at DESC)
    WHERE completed_at IS NOT NULL;

-- Index para analytics: quantas pessoas estão numa trilha.
CREATE INDEX idx_trail_enrollments_trail
    ON trail_enrollments(trail_id);

COMMENT ON TABLE  trail_enrollments               IS 'Tracking de quem começou cada trilha. completed_at NULL = em andamento.';
COMMENT ON COLUMN trail_enrollments.last_seen_slug IS 'Último módulo aberto pelo usuário (para "Continuar de onde parou").';
COMMENT ON COLUMN trail_enrollments.completed_at  IS 'Momento que completou TODOS os módulos da trilha. NULL = ainda fazendo.';
