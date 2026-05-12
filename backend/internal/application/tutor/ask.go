// Package tutor contém os use cases do Tutor de IA.
package tutor

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	domtutor "github.com/fernandofv/api/internal/domain/tutor"
)

// AskCommand é o command de pergunta ao tutor.
type AskCommand struct {
	UserID     shared.UserID
	SimuladoID shared.SimuladoID
	QuestionID shared.QuestionID
	Kind       domtutor.QueryKind
	IsPro      bool
}

// AskUseCase orquestra a pergunta ao tutor de IA.
//
// FLUXO:
//  1. Verifica rate limit por usuário/plano.
//  2. Valida que a questão existe (no catálogo).
//  3. Delega para TutorProvider (Claude API via infra).
//  4. Incrementa contador de uso.
type AskUseCase struct {
	tutorProvider domtutor.TutorProvider
	rateLimiter   domtutor.RateLimiter
	catalog       domsim.CatalogProvider
}

func NewAskUseCase(
	provider domtutor.TutorProvider,
	rateLimiter domtutor.RateLimiter,
	catalog domsim.CatalogProvider,
) *AskUseCase {
	return &AskUseCase{tutorProvider: provider, rateLimiter: rateLimiter, catalog: catalog}
}

func (uc *AskUseCase) Execute(ctx context.Context, cmd AskCommand) (domtutor.TutorResponse, error) {
	// Verifica rate limit antes de qualquer processamento.
	if err := uc.rateLimiter.Check(ctx, cmd.UserID, cmd.IsPro); err != nil {
		return domtutor.TutorResponse{}, fmt.Errorf("ask tutor: rate limit: %w", err)
	}

	// Valida que a questão existe e extrai o stem para contexto.
	sim, err := uc.catalog.GetSimulado(cmd.SimuladoID)
	if err != nil {
		return domtutor.TutorResponse{}, fmt.Errorf("ask tutor: get simulado: %w", err)
	}

	q := sim.FindQuestion(cmd.QuestionID)
	if q == nil {
		return domtutor.TutorResponse{}, fmt.Errorf("ask tutor: %w", domsim.ErrQuestionNotFound)
	}

	query := domtutor.Query{
		SimuladoID:   cmd.SimuladoID,
		QuestionID:   cmd.QuestionID,
		QuestionStem: q.Stem,
		Kind:         cmd.Kind,
	}

	resp, err := uc.tutorProvider.Ask(ctx, query)
	if err != nil {
		return domtutor.TutorResponse{}, fmt.Errorf("ask tutor: provider: %w", err)
	}

	// Incrementa uso após sucesso. Falha não bloqueia a resposta (melhor servir
	// o conteúdo do que 500), mas é logada como WARN pois impacta enforcement
	// futuro do rate-limit.
	if err := uc.rateLimiter.Increment(ctx, cmd.UserID); err != nil {
		slog.WarnContext(ctx, "tutor rate-limit increment failed",
			"user_id", cmd.UserID.String(),
			"error", err,
		)
	}

	return resp, nil
}
