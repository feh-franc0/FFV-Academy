// Package preferences (application) orquestra os casos de uso de
// preferências pedagógicas do usuário.
package preferences

import (
	"context"
	"errors"
	"fmt"

	dompref "github.com/fernandofv/api/internal/domain/preferences"
	"github.com/fernandofv/api/internal/domain/shared"
)

// GetPreferencesUseCase recupera as preferências do user.
// Se o user ainda não tem preferências persistidas (estado pós-cadastro,
// pré-onboarding), retorna um Preferences default — sem erro — para que
// o frontend possa renderizar a UI consistente e direcionar pro wizard.
type GetPreferencesUseCase struct {
	repo  dompref.Repository
	clock shared.Clock
}

func NewGetPreferencesUseCase(repo dompref.Repository, clock shared.Clock) *GetPreferencesUseCase {
	return &GetPreferencesUseCase{repo: repo, clock: clock}
}

// Execute retorna as preferências do user. Cria default in-memory se inexistente
// (NÃO persiste — preserva idempotência: GET nunca escreve).
func (uc *GetPreferencesUseCase) Execute(ctx context.Context, userID shared.UserID) (*dompref.Preferences, error) {
	if userID == "" {
		return nil, shared.NewValidationError("userID é obrigatório")
	}

	prefs, err := uc.repo.FindByUser(ctx, userID)
	if err == nil {
		return prefs, nil
	}
	if errors.Is(err, shared.ErrNotFound) {
		// Estado inicial — Preferences vazio. Onboarded=false, lista vazia.
		return dompref.New(userID, uc.clock.Now()), nil
	}
	return nil, fmt.Errorf("get preferences: %w", err)
}
