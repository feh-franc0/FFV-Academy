package simulado

import (
	"context"
	"fmt"

	domaudit "github.com/fernandofv/api/internal/domain/audit"
	"github.com/fernandofv/api/internal/domain/shared"
	domsimulado "github.com/fernandofv/api/internal/domain/simulado"
)

// CancelAttemptCommand cancela uma attempt em andamento do usuário autenticado.
type CancelAttemptCommand struct {
	UserID    shared.UserID
	AttemptID shared.AttemptID
	IP        string
	UserAgent string
	RequestID string
}

// CancelAttemptUseCase marca uma attempt como cancelada (finished sem score).
//
// REGRAS:
//  1. IDOR: attempt.UserID() != cmd.UserID → ErrForbidden.
//  2. Attempt já finalizada → ErrConflict (via domain).
//  3. Audit log `attempt.cancel` (fire-and-forget).
type CancelAttemptUseCase struct {
	attemptRepo domsimulado.AttemptRepository
	audit       domaudit.Service
	clock       shared.Clock
}

func NewCancelAttemptUseCase(
	repo domsimulado.AttemptRepository,
	audit domaudit.Service,
	clock shared.Clock,
) *CancelAttemptUseCase {
	if audit == nil {
		audit = domaudit.NoopService{}
	}
	return &CancelAttemptUseCase{attemptRepo: repo, audit: audit, clock: clock}
}

func (uc *CancelAttemptUseCase) Execute(ctx context.Context, cmd CancelAttemptCommand) error {
	attempt, err := uc.attemptRepo.FindByID(ctx, cmd.AttemptID)
	if err != nil {
		return fmt.Errorf("cancel attempt: find: %w", err)
	}
	if attempt.UserID() != cmd.UserID {
		return fmt.Errorf("cancel attempt: %w", shared.ErrForbidden)
	}
	if attempt.IsFinished() {
		return fmt.Errorf("cancel attempt: %w: attempt já finalizada", shared.ErrValidation)
	}

	now := uc.clock.Now()
	if err := attempt.Cancel(now); err != nil {
		return fmt.Errorf("cancel attempt: %w", err)
	}
	if err := uc.attemptRepo.Update(ctx, attempt); err != nil {
		return fmt.Errorf("cancel attempt: update: %w", err)
	}

	_ = uc.audit.AuditLog(ctx, domaudit.Entry{
		ActorID:    cmd.UserID.String(),
		ActorType:  domaudit.ActorUser,
		Action:     "attempt.cancel",
		TargetType: "attempt",
		TargetID:   cmd.AttemptID.String(),
		IP:         cmd.IP,
		UserAgent:  cmd.UserAgent,
		RequestID:  cmd.RequestID,
		OccurredAt: now,
	})
	return nil
}
