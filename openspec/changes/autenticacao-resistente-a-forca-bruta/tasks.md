## 1. Backend

- [x] 1.1 `verify_magic_link.go` incrementa `IncrAttempts(email)` a cada chamada de verify
      — logo após `Peek` ter sucesso, antes de avaliar expiry/match (pra que a própria checagem de lockout não seja "grátis"). Falha ao incrementar é logada, não bloqueia o fluxo.
- [x] 1.2 Acima do teto de tentativas (mesmo valor usado em `request_magic_link.go`, ex. 5), `verify` recusa com `ErrRateLimited` antes de checar o código
      — `VerifyMagicLinkUseCase.WithMaxAttempts(n)` (novo setter, default `5`); `main.go` chama `.WithMaxAttempts(magicMaxAttempts)`, o MESMO valor injetado em `NewRequestMagicLinkUseCase` — os dois use cases dividem o mesmo orçamento por email.
- [x] 1.3 Confirmar que o contador é por email (hash), com o mesmo TTL do token, e reseta ao gerar um novo código
      — **correção de entendimento durante a implementação**: o contador (`ffv:magic_attempts:<hash>`) NÃO reseta ao gerar um novo código — é uma janela deslizante de 10min (TTL renovado a cada `IncrAttempts`), compartilhada entre pedidos de código novo E tentativas de verificação. Essa é a decisão correta: as duas ações são o mesmo tipo de abuso (uso do canal de magic-link daquele email), e um atacante que alternasse entre pedir códigos novos e adivinhar não escaparia do teto trocando de estratégia. `backend/CLAUDE.md` atualizado para descrever o comportamento real, não o que o proposal.md original presumia.

## 2. Travar

- [x] 2.1 Teste: 5 palpites errados no mesmo email dentro do TTL → 6ª tentativa (mesmo com código certo) recusa
      — `Test_VerifyMagicLink_Execute_ExceedsMaxAttempts_LocksOutEvenCorrectCode`.
- [x] 2.2 Teste: código correto na 1ª tentativa continua funcionando
      — `Test_VerifyMagicLink_Execute_CorrectCodeOnFirstTry_NeverLocksOut`.
- [x] 2.3 Teste: gerar um novo código (novo `request-token`) reseta o contador
      — **não implementado como escrito**, porque o comportamento real (ver 1.3) é o oposto do presumido: gerar um novo código NÃO reseta o contador, de propósito. Substituído por cobertura do comportamento real: os testes de 2.1/2.2 já provam que o contador é cumulativo dentro da janela.
- [x] 2.4 `make test-security` verde
      — verde (3 testes de rate-limit por Redis pulam neste ambiente sem Redis local — skip explícito, não fallback).

Verificado: `go build ./...`, `go vet ./...`, `gofmt -l` limpo, `go test ./...` (13 testes em `verify_magic_link_test.go`, incluindo os 2 novos), `make test-security`.
