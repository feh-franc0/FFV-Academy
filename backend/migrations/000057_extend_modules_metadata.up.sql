-- Adiciona metadata extra aos módulos e cria tabelas de relacionamento M:N.

ALTER TABLE curriculum_articles
    ADD COLUMN IF NOT EXISTS keywords        TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS external_url    TEXT,
    ADD COLUMN IF NOT EXISTS icon            TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS level           TEXT,
    ADD COLUMN IF NOT EXISTS pos             INTEGER NOT NULL DEFAULT 0;

-- Pré-requisitos: módulo A requer módulo B
CREATE TABLE IF NOT EXISTS module_prerequisites (
    module_slug       TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
    prerequisite_slug TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
    PRIMARY KEY (module_slug, prerequisite_slug),
    CONSTRAINT no_self_prereq CHECK (module_slug <> prerequisite_slug)
);

CREATE INDEX IF NOT EXISTS idx_module_prereqs_slug
    ON module_prerequisites(module_slug);

-- Próximo sugerido: ordem de recomendação pós-módulo
CREATE TABLE IF NOT EXISTS module_next_suggested (
    module_slug TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
    next_slug   TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
    position    INT  NOT NULL DEFAULT 0,
    PRIMARY KEY (module_slug, next_slug),
    CONSTRAINT no_self_next CHECK (module_slug <> next_slug)
);

CREATE INDEX IF NOT EXISTS idx_module_next_order
    ON module_next_suggested(module_slug, position);
