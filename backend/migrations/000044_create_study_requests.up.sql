-- study_requests: solicitações de experiências de estudo personalizadas.
--
-- Esta tabela suporta o pivot de "plataforma para devs" para "plataforma de
-- educação personalizada multiárea". O fluxo é:
--   1. Estudante de qualquer área (Vet, Eng, Direito, Dev, etc.) preenche o
--      formulário público dizendo o que precisa estudar.
--   2. Solicitação fica em status="pending" para revisão manual (V1).
--   3. Time interno produz o conteúdo manualmente e marca como "ready".
--   4. V2 automatiza com IA usando os arquivos anexados como contexto.
--
-- Lead anônimo é permitido — user_id é nullable. Se o lead se cadastrar depois,
-- pode-se associar via match por email (não fazemos isso na V1).

CREATE TABLE study_requests (
    id                  TEXT         PRIMARY KEY,

    -- Identidade do solicitante (pode estar deslogado).
    -- user_id é nullable porque a maioria das solicitações virão de leads.
    user_id             TEXT         REFERENCES users(id) ON DELETE SET NULL,
    name                TEXT         NOT NULL,
    email               TEXT         NOT NULL,
    phone               TEXT,

    -- Dados de estudo: o que ele quer aprender e em qual contexto.
    study_area          TEXT         NOT NULL,  -- ex: 'medicina-veterinaria', 'engenharia', 'desenvolvimento'
    institution         TEXT,                   -- faculdade / curso / instituição
    subject             TEXT         NOT NULL,  -- matéria ou tema específico
    goal                TEXT,                   -- objetivo do estudo (prova, concurso, carreira)
    description         TEXT         NOT NULL,  -- descrição livre detalhada

    -- Workflow interno.
    -- pending    = recém-recebida
    -- in_review  = sendo analisada pelo time
    -- in_production = conteúdo sendo produzido manualmente (ou via Claude CLI)
    -- ready      = entregue ao estudante
    -- rejected   = recusada (fora de escopo, spam, etc.)
    status              TEXT         NOT NULL DEFAULT 'pending',

    -- Notas internas que não voltam pro estudante.
    internal_notes      TEXT,

    -- Consentimento LGPD para contato (WhatsApp/email).
    marketing_consent   BOOLEAN      NOT NULL DEFAULT false,

    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT study_requests_status_valid CHECK (
        status IN ('pending', 'in_review', 'in_production', 'ready', 'rejected')
    ),
    CONSTRAINT study_requests_name_not_blank CHECK (length(trim(name)) > 0),
    CONSTRAINT study_requests_email_has_at CHECK (email LIKE '%@%'),
    CONSTRAINT study_requests_subject_not_blank CHECK (length(trim(subject)) > 0),
    CONSTRAINT study_requests_description_not_blank CHECK (length(trim(description)) > 0)
);

-- Filtro mais comum no painel admin é "pendentes mais recentes".
CREATE INDEX idx_study_requests_status_created
    ON study_requests (status, created_at DESC);

-- Match por email permite associar solicitação anônima ao user no futuro.
CREATE INDEX idx_study_requests_email
    ON study_requests (lower(email));

-- Painel admin: filtrar por user.
CREATE INDEX idx_study_requests_user
    ON study_requests (user_id)
    WHERE user_id IS NOT NULL;


-- study_request_attachments: arquivos anexados pelo estudante (PDF, slides,
-- prints, apostilas) que ajudam o time a entender o conteúdo a produzir.
--
-- Storage é referenciado por URL — pode ser uma URL S3 (s3://bucket/key) ou
-- um caminho local (file://...) durante a V1. A implementação concreta vive
-- na camada infrastructure (FileStorage port).

CREATE TABLE study_request_attachments (
    id                  TEXT         PRIMARY KEY,
    study_request_id    TEXT         NOT NULL REFERENCES study_requests(id) ON DELETE CASCADE,
    file_name           TEXT         NOT NULL,
    content_type        TEXT         NOT NULL,
    size_bytes          BIGINT       NOT NULL,
    storage_url         TEXT         NOT NULL,  -- ex: s3://ffv-uploads/study-requests/<id>/<key>
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT study_request_attachments_size_positive CHECK (size_bytes > 0),
    CONSTRAINT study_request_attachments_size_max CHECK (size_bytes <= 26214400) -- 25 MiB
);

-- Lookup por solicitação é o único acesso esperado.
CREATE INDEX idx_study_request_attachments_request
    ON study_request_attachments (study_request_id);


-- Trigger para manter updated_at automaticamente.
CREATE OR REPLACE FUNCTION set_study_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER study_requests_updated_at_trigger
    BEFORE UPDATE ON study_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_study_requests_updated_at();
