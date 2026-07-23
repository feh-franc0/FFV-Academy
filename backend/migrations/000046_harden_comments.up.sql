-- Harden comments: reduzir char limit, adicionar score denormalizado,
-- adicionar contadores de reports e flags pra moderação.
--
-- Por que reduzir char limit de 4000 → 1000:
--   - Comentários longos viram blog post: confunde a UX, polui a discussão.
--   - 1000 chars cobre 99% dos casos legítimos (~200 palavras / 1 parágrafo).
--   - Reduz superfície de spam/abuse (menos espaço pra payloads malformados).
--
-- Adicionamos `score` (sum de upvotes - downvotes) materializado no row do
-- comment pra evitar agregação em cada listagem (que com 1000 comments seria
-- O(N) por request). Trigger mantém em sincronia com comment_votes.
--
-- Reports: contador denormalizado + auto-flag quando ≥ 3 reports independentes.

-- 1) Migrar dados existentes: truncar comments > 1000 chars (raro em prod
--    porque schema é novo, mas defensivo).
UPDATE comments SET content = substring(content from 1 for 1000) WHERE length(content) > 1000;

-- 2) Trocar o CHECK constraint pra novo limite.
ALTER TABLE comments DROP CONSTRAINT comments_content_length;
ALTER TABLE comments
    ADD CONSTRAINT comments_content_length
    CHECK (length(content) BETWEEN 1 AND 1000);

-- 3) Adicionar score denormalizado (default 0 — recalculado por trigger).
ALTER TABLE comments
    ADD COLUMN score INTEGER NOT NULL DEFAULT 0;

-- 4) Adicionar contador de reports + flag auto-moderação.
ALTER TABLE comments
    ADD COLUMN report_count INTEGER NOT NULL DEFAULT 0;

-- 5) Trigger pra manter score em sincronia com comment_votes.
--    Inserts/updates/deletes em comment_votes propagam pro comments.score.
CREATE OR REPLACE FUNCTION update_comment_score() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE comments SET score = score + NEW.vote, updated_at = now() WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE comments SET score = score - OLD.vote + NEW.vote, updated_at = now() WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE comments SET score = score - OLD.vote, updated_at = now() WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comment_votes_score
AFTER INSERT OR UPDATE OR DELETE ON comment_votes
FOR EACH ROW EXECUTE FUNCTION update_comment_score();

-- 6) Tabela de reports — registra QUEM reportou, evita reports duplicados
--    do mesmo user, permite auditoria.
CREATE TABLE comment_reports (
    comment_id   UUID NOT NULL,
    reporter_id  TEXT NOT NULL,
    reason       TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (comment_id, reporter_id),

    CONSTRAINT comment_reports_reason_length
        CHECK (length(reason) BETWEEN 0 AND 200),

    CONSTRAINT fk_comment_reports_comment
        FOREIGN KEY (comment_id) REFERENCES comments(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_comment_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_comment_reports_comment ON comment_reports(comment_id, created_at DESC);
CREATE INDEX idx_comment_reports_reporter ON comment_reports(reporter_id, created_at DESC);

-- 7) Trigger pra atualizar report_count + auto-flag em ≥3 reports.
CREATE OR REPLACE FUNCTION update_comment_report_count() RETURNS TRIGGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE comments
        SET report_count = report_count + 1,
            -- Auto-flag quando atinge threshold. Admin pode revisar e
            -- ressuscitar ('visible') ou ocultar definitivamente ('hidden').
            status = CASE
                WHEN report_count + 1 >= 3 AND status = 'visible' THEN 'flagged'
                ELSE status
            END,
            updated_at = now()
        WHERE id = NEW.comment_id
        RETURNING report_count INTO new_count;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE comments
        SET report_count = GREATEST(report_count - 1, 0),
            updated_at = now()
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comment_reports_count
AFTER INSERT OR DELETE ON comment_reports
FOR EACH ROW EXECUTE FUNCTION update_comment_report_count();

-- 8) Index pra ordenação por score (helpful pra trazer melhores comments no topo).
CREATE INDEX idx_comments_target_score
    ON comments(target_type, target_id, score DESC, created_at DESC)
    WHERE status = 'visible';

COMMENT ON COLUMN comments.score        IS 'Soma de votes (upvote=+1, downvote=-1). Mantido por trigger.';
COMMENT ON COLUMN comments.report_count IS 'Quantos users reportaram. Auto-flag em ≥3.';
COMMENT ON TABLE  comment_reports       IS 'Reports de comentários por usuários. PK composta evita duplicata.';
