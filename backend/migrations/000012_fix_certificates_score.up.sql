-- Adiciona coluna score aos certificados (necessária para o domínio)
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS score INT NOT NULL DEFAULT 0;
