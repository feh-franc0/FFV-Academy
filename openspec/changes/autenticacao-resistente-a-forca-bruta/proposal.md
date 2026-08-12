## Why

A auditoria (achado P-03) encontrou que o código de magic-link (6 dígitos numéricos, TTL 10 min) não tem
lockout por email nem é invalidado após tentativas erradas — `IncrAttempts` existe no port
(`domain/identity/repository.go`) mas nunca é chamado no fluxo de `verify`. O único freio é o rate-limit de
20 req/min por IP; um atacante com poucos IPs consegue varrer o espaço de 10⁶ códigos dentro do TTL.

## What Changes

- `verify_magic_link.go` incrementa `IncrAttempts(email)` a cada tentativa de verificação (correta ou não).
- Acima de um teto (5 tentativas) dentro do TTL, `verify` recusa com `ErrRateLimited`, mesmo com o código certo.
- `Peek` (não-destrutivo) continua sendo usado para checar o código sem queimar o token em um palpite errado —
  só o CONTADOR de tentativas é afetado, não o token em si.

## Fora de escopo

- Não muda o tamanho do código (6 dígitos) nem o TTL nesta mudança — o lockout por tentativas já fecha a
  janela de exploração prática; aumentar o espaço fica como hardening futuro, não bloqueante.
- Não adiciona CAPTCHA nem MFA.

## Impact

- `backend/internal/application/identity/verify_magic_link.go`
- Achado coberto: P-03 (Alta, gate de lançamento).
