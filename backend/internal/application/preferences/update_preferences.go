package preferences

import (
	"context"
	"errors"
	"fmt"

	dompref "github.com/fernandofv/api/internal/domain/preferences"
	"github.com/fernandofv/api/internal/domain/shared"
)

// UpdatePreferencesCommand é o input do caso de uso. Replica UpdateCommand do
// domain, mas vive na app layer para que os handlers HTTP não importem domain
// diretamente para tipos de input.
type UpdatePreferencesCommand struct {
	UserID               shared.UserID
	HubIDs               *[]string
	TrailIDs             *[]string
	CertificationIDs     *[]string
	Objectives           *[]string
	SkillLevel           *string
	DailyQuestionEnabled *bool
}

// UpdatePreferencesUseCase aplica mutações ao Preferences. Comportamento:
//  1. Se user não tem Preferences ainda, cria novo (upsert).
//  2. Valida invariantes via domain.Update.
//  3. Persiste atomicamente.
//  4. Marca OnboardedAt na primeira preferência substantiva (lógica no domain).
type UpdatePreferencesUseCase struct {
	repo  dompref.Repository
	clock shared.Clock
}

func NewUpdatePreferencesUseCase(repo dompref.Repository, clock shared.Clock) *UpdatePreferencesUseCase {
	return &UpdatePreferencesUseCase{repo: repo, clock: clock}
}

func (uc *UpdatePreferencesUseCase) Execute(ctx context.Context, cmd UpdatePreferencesCommand) (*dompref.Preferences, error) {
	if cmd.UserID == "" {
		return nil, shared.NewValidationError("userID é obrigatório")
	}

	prefs, err := uc.repo.FindByUser(ctx, cmd.UserID)
	if err != nil {
		if !errors.Is(err, shared.ErrNotFound) {
			return nil, fmt.Errorf("update preferences: load: %w", err)
		}
		prefs = dompref.New(cmd.UserID, uc.clock.Now())
	}

	domainCmd := dompref.UpdateCommand{
		HubIDs:               cmd.HubIDs,
		TrailIDs:             cmd.TrailIDs,
		CertificationIDs:     cmd.CertificationIDs,
		Objectives:           cmd.Objectives,
		DailyQuestionEnabled: cmd.DailyQuestionEnabled,
	}
	if cmd.SkillLevel != nil {
		sl := dompref.SkillLevel(*cmd.SkillLevel)
		domainCmd.SkillLevel = &sl
	}

	if err := prefs.Update(domainCmd, uc.clock.Now()); err != nil {
		return nil, err
	}

	if err := uc.repo.Upsert(ctx, prefs); err != nil {
		return nil, fmt.Errorf("update preferences: upsert: %w", err)
	}

	return prefs, nil
}
