-- Promove simulado_id de TEXT solto para FK real contra simulados.
-- Adiciona related_module_slug para ligar questão ao módulo explicativo.

ALTER TABLE questions
    ADD CONSTRAINT fk_questions_simulado
        FOREIGN KEY (simulado_id) REFERENCES simulados(id)
        ON DELETE RESTRICT
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS related_module_slug TEXT
        REFERENCES curriculum_articles(slug)
        ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_questions_related_module
    ON questions(related_module_slug)
    WHERE related_module_slug IS NOT NULL;
