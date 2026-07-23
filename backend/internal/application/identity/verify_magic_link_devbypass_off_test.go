//go:build !devbypass

package identity_test

import (
	"context"
	"errors"
	"testing"
	"time"

	appidentity "github.com/fernandofv/api/internal/application/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// Test_VerifyMagicLink_DevBypass_DisabledInDefaultBuild prova que no build
// padrão (sem -tags devbypass) o atalho "000000" NÃO é aceito, mesmo se o use
// case for instanciado com devMode=true (o que aconteceria por engano se
// APP_ENV vazasse como "development" em produção).
//
// Defesa em profundidade #1: o código do bypass só compila com -tags devbypass.
// Defesa em profundidade #2: main.go aborta startup se APP_ENV != "production"
// em host de prod. Mas este teste foca na camada #1 — prova matemática que o
// binário deployado (sem tag) não responde ao bypass.
func Test_VerifyMagicLink_DevBypass_DisabledInDefaultBuild(t *testing.T) {
	now := time.Now()
	tokenStore := &mockTokenStore{} // Redis vazio: nenhum token armazenado pra este email
	uc := appidentity.NewVerifyMagicLinkUseCase(
		tokenStore,
		newMockUserRepo(),
		newMockRefreshRepo(),
		&mockTokenIssuer{},
		shared.FixedClock{T: now},
		time.Hour,
		true, // devMode=true — simula o pior caso de regressão de config em prod
	)

	_, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: "qualquer@example.com",
		Token: "000000", // o token que era aceito antes do hardening
	})

	if !errors.Is(err, shared.ErrUnauthorized) {
		t.Fatalf("REGRESSÃO DE SEGURANÇA: bypass '000000' aceito no build sem -tags devbypass. "+
			"esperado ErrUnauthorized, recebido: %v", err)
	}
}
