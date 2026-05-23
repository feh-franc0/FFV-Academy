-- Reverter: rebaixa o owner a user normal.
-- Idempotente.
UPDATE users
   SET role       = 'user',
       updated_at = NOW()
 WHERE email = 'fernandofv1110@gmail.com'
   AND role  = 'admin';
