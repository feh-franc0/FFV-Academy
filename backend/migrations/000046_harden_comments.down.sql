-- Rollback: restaurar char limit antigo (4000), remover score, report_count,
-- triggers e tabela de reports.

DROP TRIGGER IF EXISTS trg_comment_reports_count ON comment_reports;
DROP TRIGGER IF EXISTS trg_comment_votes_score ON comment_votes;
DROP FUNCTION IF EXISTS update_comment_report_count();
DROP FUNCTION IF EXISTS update_comment_score();

DROP INDEX IF EXISTS idx_comment_reports_reporter;
DROP INDEX IF EXISTS idx_comment_reports_comment;
DROP TABLE IF EXISTS comment_reports;

DROP INDEX IF EXISTS idx_comments_target_score;

ALTER TABLE comments DROP COLUMN IF EXISTS report_count;
ALTER TABLE comments DROP COLUMN IF EXISTS score;

ALTER TABLE comments DROP CONSTRAINT comments_content_length;
ALTER TABLE comments
    ADD CONSTRAINT comments_content_length
    CHECK (length(content) BETWEEN 1 AND 4000);
