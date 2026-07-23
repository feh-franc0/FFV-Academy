-- user_events: catálogo de TODAS as interações do usuário na plataforma.
--
-- Decisão de produto (2026-05-21): além de pageviews (module_views), o admin
-- precisa entender o COMPORTAMENTO — quais CTAs convertem, quais buscas
-- aparecem, quais quizzes são abandonados, quem completou cadastro. Sem isso
-- o produto fica cego entre "viu" e "agiu".
--
-- Diferente de module_views (uma linha por page hit), user_events captura
-- AÇÕES DELIBERADAS: click em botão, submit de form, conclusão de módulo,
-- abandono de quiz, etc.
--
-- Schema:
--   - event_type: namespace.action (ex: cta.signup_click, search.submit,
--                                       module.completed, quiz.abandoned,
--                                       auth.signup_started, auth.signup_completed)
--   - target_type/target_id: alvo da ação (ex: module/postgres-mvcc)
--   - value_num: métrica numérica opcional (ex: XP ganho, score do quiz)
--   - metadata: JSONB livre pra props adicionais (ex: {query: "rag", results: 12})
--   - base_slug: base ativa no momento — pra agregação por base
--   - identidade: user_id (logado) + anon_id (sempre) + session_id (correlaciona)
--
-- Naming convention dos event_types (escolhida pra ordenação alfabética
-- agrupar por feature): `<area>.<action>` com snake_case.
--
-- Exemplos canônicos:
--   auth.signup_started      → submit do form de cadastro
--   auth.signup_completed    → magic link confirmado, conta ativada
--   auth.login_started       → request de magic link
--   auth.login_completed     → token verificado, sessão iniciada
--   cta.click                → clique em CTA com identifier
--   search.submit            → enter na busca
--   search.result_click      → clique em resultado da busca
--   module.completed         → markComplete disparado
--   quiz.answered            → resposta submetida
--   quiz.completed           → quiz finalizado (100% das questões respondidas)
--   simulado.started         → tentativa iniciada
--   simulado.finished        → tentativa finalizada
--   share.click              → clique em compartilhar
--   bookmark.toggled         → bookmark adicionado/removido
--   ratings.module           → rating dado a um módulo
--
-- Convenção: NUNCA armazenar PII (telefone, endereço, senha) em metadata.
-- Email vem só no audit_logs / users (já regulamentado).

CREATE TABLE user_events (
    id            BIGSERIAL PRIMARY KEY,

    -- Categorização
    event_type    TEXT NOT NULL,
    target_type   TEXT,
    target_id     TEXT,

    -- Identidade (igual a module_views.51)
    user_id       TEXT,
    user_email    TEXT,
    anon_id       TEXT,
    session_id    TEXT,

    -- Contexto
    base_slug     TEXT,
    path          TEXT,
    referrer      TEXT,
    user_agent    TEXT,

    -- Payload
    value_num     DOUBLE PRECISION,
    metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,

    occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT user_events_event_type_not_blank CHECK (length(trim(event_type)) > 0),
    CONSTRAINT user_events_event_type_len CHECK (length(event_type) <= 80),
    CONSTRAINT user_events_metadata_size CHECK (length(metadata::text) <= 4096)
);

-- Acesso típico do admin: "últimos eventos da plataforma" ordenado por tempo.
CREATE INDEX idx_user_events_occurred_at
    ON user_events (occurred_at DESC);

-- Filtro por tipo (mais comum nas queries de funil/conversão).
CREATE INDEX idx_user_events_type_occurred
    ON user_events (event_type, occurred_at DESC);

-- Filtro "tudo que aconteceu nesta base".
CREATE INDEX idx_user_events_base_occurred
    ON user_events (base_slug, occurred_at DESC)
    WHERE base_slug IS NOT NULL;

-- "Atividade desse usuário" (logged): combina email + ordem cronológica.
CREATE INDEX idx_user_events_user_email_occurred
    ON user_events (lower(user_email), occurred_at DESC)
    WHERE user_email IS NOT NULL;

-- "Atividade desse anônimo" (pre-login).
CREATE INDEX idx_user_events_anon_occurred
    ON user_events (anon_id, occurred_at DESC)
    WHERE anon_id IS NOT NULL;

-- Sessão: agrupa o "funil" da visita.
CREATE INDEX idx_user_events_session
    ON user_events (session_id, occurred_at)
    WHERE session_id IS NOT NULL;

-- Filtro por alvo: "tudo que aconteceu com o módulo X".
CREATE INDEX idx_user_events_target
    ON user_events (target_type, target_id, occurred_at DESC)
    WHERE target_id IS NOT NULL;

COMMENT ON TABLE user_events IS 'Catálogo de ações deliberadas dos usuários — complementa module_views (pageviews)';
COMMENT ON COLUMN user_events.event_type IS 'namespace.action snake_case (ex: cta.signup_click, module.completed)';
COMMENT ON COLUMN user_events.target_type IS 'tipo do alvo da ação: module | trail | quiz | simulado | cta | base | none';
COMMENT ON COLUMN user_events.target_id IS 'id/slug do alvo (ex: postgres-mvcc, signup-hero)';
COMMENT ON COLUMN user_events.value_num IS 'métrica numérica opcional (XP, score, latência)';
COMMENT ON COLUMN user_events.metadata IS 'JSONB livre — máx 4KB; NUNCA PII (phone, senha, endereço)';
