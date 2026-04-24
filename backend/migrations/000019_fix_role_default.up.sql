-- Corrige o DEFAULT da coluna role: 'student' nunca foi uma role válida no código.
-- As roles válidas são 'user' e 'admin' (vide domain/identity/user.go).
-- Registros existentes com role='student' (criados fora do código) viram 'user'.
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';

UPDATE users SET role = 'user' WHERE role = 'student';
