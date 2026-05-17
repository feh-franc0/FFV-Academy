-- user_preferences: preferências pedagógicas do usuário, capturadas no onboarding
-- pós-primeiro-login. Determinam personalização de:
--   - Pergunta do Dia (filtra por certification_ids do user)
--   - Recomendações de trilhas e módulos
--   - SEO/copy contextualizado (objetivo principal)
--
-- 1:1 com users via PK = user_id (ON DELETE CASCADE para LGPD).
-- Listas armazenadas como TEXT[] (Postgres array nativo) — não usamos JSONB
-- aqui porque queremos GIN index por elemento (busca por "tem CLF na lista")
-- e operadores de array (@>, &&) são mais simples que jsonb_array.

CREATE TABLE user_preferences (
    -- users.id é TEXT (não UUID) — convenção do projeto.
    user_id            TEXT         PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- IDs dos hubs em que o user tem interesse (ex: ['hub-ia', 'hub-aws']).
    -- Vazio = aceita tudo (sem filtro). Validação dos IDs feita na app layer.
    hub_ids            TEXT[]       NOT NULL DEFAULT '{}',

    -- IDs das trilhas (ex: ['trail-aws-cloud-practitioner']). Subconjunto opcional
    -- dos hubs — pode ter trilhas sem ter o hub correspondente marcado.
    trail_ids          TEXT[]       NOT NULL DEFAULT '{}',

    -- IDs de certificações sendo estudadas (ex: ['aws-clf','aws-dva']).
    -- Direciona Pergunta do Dia e Simulados em destaque.
    certification_ids  TEXT[]       NOT NULL DEFAULT '{}',

    -- Objetivos do user (lista — não excludentes). Ex:
    --   - 'certifications': passar em provas
    --   - 'career_growth': evoluir profissionalmente
    --   - 'hobby': curiosidade técnica
    --   - 'career_switch': trocar de área
    objectives         TEXT[]       NOT NULL DEFAULT '{}',

    -- Nível autodeclarado. Filtra dificuldade inicial de questões.
    -- NULL = não respondido ainda (onboarding incompleto).
    skill_level        TEXT,

    -- Se Pergunta do Dia aparece no dashboard logado.
    daily_question_enabled BOOLEAN NOT NULL DEFAULT true,

    -- Marca conclusão do wizard de onboarding. Se NULL, frontend mostra
    -- modal bloqueante. Se preenchido, vai direto pro dashboard.
    onboarded_at       TIMESTAMPTZ,

    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT user_preferences_skill_level_valid
        CHECK (skill_level IS NULL OR skill_level IN ('beginner', 'intermediate', 'advanced'))
);

-- Índice GIN em certification_ids: query típica é "pegar uma questão random
-- onde simulado_id ∈ user.certification_ids", e GIN acelera contains/overlap.
CREATE INDEX idx_user_preferences_certifications
    ON user_preferences USING GIN (certification_ids);

-- Mesma justificativa para hub_ids (filtragem de conteúdo recomendado).
CREATE INDEX idx_user_preferences_hubs
    ON user_preferences USING GIN (hub_ids);

-- Trigger pra manter updated_at automaticamente.
CREATE OR REPLACE FUNCTION set_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at_trigger
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION set_user_preferences_updated_at();
