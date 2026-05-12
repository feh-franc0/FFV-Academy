//go:build security

// Package security — helpers compartilhados pela bateria de testes de segurança.
//
// Esses helpers permitem construir JWTs válidos, montar uma instância mínima do
// router de produção, e expor stubs de handlers/repositórios que satisfazem as
// interfaces do projeto sem depender de banco/Redis/Stripe/Anthropic reais.
//
// Build tag `security` garante que estes helpers só sejam compilados quando os
// testes da suite forem executados (`go test -tags security ./test/security/...`).
// Sem o tag, golangci-lint enxerga as funções como "unused" porque não vê os
// _test.go que as consomem.
package security

import (
	"time"

	"github.com/fernandofv/api/internal/config"
	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/infrastructure/auth"
)

// testJWTConfig retorna a configuração JWT padrão dos testes de segurança.
// Usa segredo dummy de 36 bytes — JAMAIS um segredo real.
func testJWTConfig() config.JWTConfig {
	return config.JWTConfig{
		Secret:          "test-secret-security-suite-32+chars!!",
		AccessTokenTTL:  15 * time.Minute,
		RefreshTokenTTL: 30 * 24 * time.Hour,
		Issuer:          "ffv-api-sec-test",
		Audience:        "ffv-frontend-sec-test",
	}
}

// newTestJWTService cria um JWTService isolado por teste, com config dummy.
func newTestJWTService() *auth.JWTService {
	return auth.NewJWTService(testJWTConfig())
}

// issueUserToken emite um JWT válido como usuário comum (role=user).
func issueUserToken(svc *auth.JWTService, userID string) (string, error) {
	em, err := identity.NewEmail("sec-user@example.com")
	if err != nil {
		return "", err
	}
	return svc.IssueAccessToken(shared.UserID(userID), em, identity.RoleUser)
}

// issueExpiredToken emite um JWT já expirado (TTL negativo) — útil para validar
// que o middleware Authenticate rejeita tokens fora da validade.
func issueExpiredToken(userID string) (string, error) {
	cfg := testJWTConfig()
	cfg.AccessTokenTTL = -1 * time.Hour
	svc := auth.NewJWTService(cfg)
	em, err := identity.NewEmail("sec-expired@example.com")
	if err != nil {
		return "", err
	}
	return svc.IssueAccessToken(shared.UserID(userID), em, identity.RoleUser)
}
