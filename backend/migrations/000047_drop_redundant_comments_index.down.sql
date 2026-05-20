-- Recria o index dropado pela migration 47.
CREATE INDEX idx_comments_target
    ON comments(target_type, target_id, created_at DESC)
    WHERE status = 'visible';
