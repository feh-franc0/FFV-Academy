-- Adiciona FK base_slug em hubs para fechar o relacionamento Base → Hub.
-- Backfill usa o mapeamento canônico definido no plano de migração.

-- 1. Adiciona colunas novas (sem FK ainda, para poder indexar depois)
ALTER TABLE hubs
    ADD COLUMN IF NOT EXISTS base_slug TEXT NOT NULL DEFAULT 'tecnologia',
    ADD COLUMN IF NOT EXISTS slug    TEXT,
    ADD COLUMN IF NOT EXISTS tagline TEXT NOT NULL DEFAULT '';

-- 2. Backfill: slug = id (hubs já usam id legível, ex.: 'ia', 'aws')
UPDATE hubs SET slug = id WHERE slug IS NULL;

ALTER TABLE hubs ALTER COLUMN slug SET NOT NULL;

-- 3. Backfill canônico Hub → Base
UPDATE hubs SET base_slug = 'tecnologia'
WHERE id IN (
    'ia', 'aws', 'engenharia', 'claude-anthropic',
    'fundamentos', 'programacao', 'dados',
    'construcao', 'seguranca-hardware-hacking',
    'profissional-digital', 'legacy'
);

-- 4. Índice e constraint unique após backfill
CREATE INDEX IF NOT EXISTS idx_hubs_base_position ON hubs(base_slug, position);
ALTER TABLE hubs ADD CONSTRAINT hubs_slug_per_base_unique UNIQUE (base_slug, slug);

-- 5. Adiciona FK (após dados estarem corretos)
ALTER TABLE hubs
    ADD CONSTRAINT fk_hubs_base_slug
        FOREIGN KEY (base_slug) REFERENCES bases(slug) ON DELETE RESTRICT;
