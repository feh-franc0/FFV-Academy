//go:build security

package security

import (
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/fernandofv/api/internal/config"
	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/infrastructure/auth"
)

func newJWT(t *testing.T) (*auth.JWTService, config.JWTConfig) {
	t.Helper()
	cfg := config.LoadTest().JWT
	return auth.NewJWTService(cfg), cfg
}

func issue(t *testing.T, svc *auth.JWTService) string {
	t.Helper()
	em, _ := identity.NewEmail("sec@example.com")
	tok, err := svc.IssueAccessToken(shared.UserID("u-sec"), em, identity.RoleUser)
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	return tok
}

func Test_JWT_TamperedSignature_Invalid(t *testing.T) {
	svc, _ := newJWT(t)
	tok := issue(t, svc)
	parts := strings.Split(tok, ".")
	if len(parts) != 3 {
		t.Fatalf("expected 3 parts, got %d", len(parts))
	}
	tampered := parts[0] + "." + parts[1] + "." + "AAAA" + parts[2][4:]
	if _, err := svc.ValidateAccessToken(tampered); err == nil {
		t.Fatal("expected error for tampered signature")
	}
}

func Test_JWT_AlgNone_Rejected(t *testing.T) {
	svc, cfg := newJWT(t)
	// Constrói um token "alg=none" manualmente — deve ser rejeitado pela
	// validação que exige HS256 em WithValidMethods.
	claims := jwt.RegisteredClaims{
		Issuer:    cfg.Issuer,
		Subject:   "attacker",
		Audience:  jwt.ClaimStrings{cfg.Audience},
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodNone, claims)
	signed, err := tok.SignedString(jwt.UnsafeAllowNoneSignatureType)
	if err != nil {
		t.Fatalf("sign none: %v", err)
	}
	if _, err := svc.ValidateAccessToken(signed); err == nil {
		t.Fatal("alg=none must be rejected")
	}
}

func Test_JWT_Expired_Rejected(t *testing.T) {
	cfg := config.LoadTest().JWT
	cfg.AccessTokenTTL = -1 * time.Hour // já expirado
	svc := auth.NewJWTService(cfg)

	em, _ := identity.NewEmail("exp@example.com")
	tok, err := svc.IssueAccessToken("u-exp", em, identity.RoleUser)
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	// Valida com svc normal (Secret/issuer iguais)
	if _, err := svc.ValidateAccessToken(tok); err == nil {
		t.Fatal("expired token must be rejected")
	}
}

func Test_JWT_NonexistentUserID_StillValidJWT(t *testing.T) {
	// Este teste documenta que o JWT isolado não valida existência do user
	// (isso é trabalho do handler/middleware consultar o userRepo).
	svc, _ := newJWT(t)
	em, _ := identity.NewEmail("ghost@example.com")
	tok, err := svc.IssueAccessToken("user-that-never-existed", em, identity.RoleUser)
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	claims, err := svc.ValidateAccessToken(tok)
	if err != nil {
		t.Fatalf("JWT em si deve ser estruturalmente válido: %v", err)
	}
	if claims.Subject != "user-that-never-existed" {
		t.Errorf("subject mismatch: %s", claims.Subject)
	}
	// O handler DEVE consultar o userRepo e retornar 401/404 — garantido
	// em teste de integração / contract, não aqui.
}
