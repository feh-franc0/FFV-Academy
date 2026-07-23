-- Promove o owner (fernandofv1110@gmail.com) a admin.
--
-- ⚠️ SEGURANÇA — DEFESA EM PROFUNDIDADE:
-- Esta migration setta role='admin' no DB, mas o middleware RequireAdmin
-- também exige que o email esteja em ADMIN_EMAIL_ALLOWLIST (env var em prod).
-- Setar role='admin' aqui sozinho NÃO é suficiente — sem o email no allowlist,
-- todas as rotas /admin/* retornam 403.
--
-- Por que isso é importante:
--   • Um atacante que conseguir SQL injection pra promover seu próprio user
--     ainda falha porque o email dele não está na allowlist do env var.
--   • Um atacante que vazar o .env e descobrir a allowlist ainda precisa
--     também ter acesso ao DB pra setar role='admin'.
--   • Os dois vetores (DB + env) são independentes — comprometer um não é
--     suficiente pra escalar privilégio.
--
-- Idempotente: se user não existe (ainda não fez magic-link login), no-op.
-- Se já é admin, no-op. Atualiza updated_at pra trilha de auditoria.

UPDATE users
   SET role       = 'admin',
       updated_at = NOW()
 WHERE email = 'fernandofv1110@gmail.com'
   AND role  <> 'admin'
   AND deleted_at IS NULL;

-- Sanity: confirma que existe NO MÁXIMO 1 admin (defesa contra promoção
-- acidental de múltiplos users). Se isso falhar, alguém promoveu manualmente
-- e a operação deve ser revisada.
DO $$
DECLARE
    admin_count INT;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin' AND deleted_at IS NULL;
    IF admin_count > 1 THEN
        RAISE WARNING 'Atenção: % usuários com role=admin (esperado: 0 ou 1). Revise manualmente.', admin_count;
    END IF;
END $$;
