package simulado

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	domaudit "github.com/fernandofv/api/internal/domain/audit"
	"github.com/fernandofv/api/internal/domain/shared"
	domsimulado "github.com/fernandofv/api/internal/domain/simulado"
)

// MaxReportsPerDay é o limite de reports por usuário em 24h.
const MaxReportsPerDay = 10

// ReportQuestionCommand registra o report de uma questão.
type ReportQuestionCommand struct {
	UserID     shared.UserID
	SimuladoID shared.SimuladoID
	QuestionID shared.QuestionID
	Reason     string
	Comment    string
	IP         string
	UserAgent  string
	RequestID  string
}

// ReportQuestionResult retorna o ID do report persistido.
type ReportQuestionResult struct {
	ReportID string
}

// ReportQuestionUseCase registra um report e aplica rate-limit por usuário.
//
// REGRAS:
//  1. Rate-limit: 10 reports/24h (via CountByUserSince).
//  2. Validação de reason/comment no construtor do domain.
//  3. Audit log `question.report` (fire-and-forget).
type ReportQuestionUseCase struct {
	reportRepo domsimulado.QuestionReportRepository
	audit      domaudit.Service
	clock      shared.Clock
}

func NewReportQuestionUseCase(
	repo domsimulado.QuestionReportRepository,
	audit domaudit.Service,
	clock shared.Clock,
) *ReportQuestionUseCase {
	if audit == nil {
		audit = domaudit.NoopService{}
	}
	return &ReportQuestionUseCase{reportRepo: repo, audit: audit, clock: clock}
}

func (uc *ReportQuestionUseCase) Execute(ctx context.Context, cmd ReportQuestionCommand) (ReportQuestionResult, error) {
	now := uc.clock.Now()

	// Rate-limit: 10 reports/24h.
	since := now.Add(-24 * time.Hour)
	count, err := uc.reportRepo.CountByUserSince(ctx, cmd.UserID, since)
	if err != nil {
		return ReportQuestionResult{}, fmt.Errorf("report question: rate-limit check: %w", err)
	}
	if count >= MaxReportsPerDay {
		return ReportQuestionResult{}, fmt.Errorf("report question: %w: limite de %d reports/24h atingido", shared.ErrRateLimited, MaxReportsPerDay)
	}

	reportID := uuid.NewString()
	report, err := domsimulado.NewQuestionReport(
		reportID,
		cmd.UserID,
		cmd.SimuladoID,
		cmd.QuestionID,
		domsimulado.ReportReason(cmd.Reason),
		cmd.Comment,
		now,
	)
	if err != nil {
		return ReportQuestionResult{}, fmt.Errorf("report question: %w", err)
	}
	if err := uc.reportRepo.Save(ctx, report); err != nil {
		return ReportQuestionResult{}, fmt.Errorf("report question: save: %w", err)
	}

	_ = uc.audit.AuditLog(ctx, domaudit.Entry{
		ActorID:    cmd.UserID.String(),
		ActorType:  domaudit.ActorUser,
		Action:     "question.report",
		TargetType: "question",
		TargetID:   cmd.QuestionID.String(),
		Metadata: map[string]any{
			"simulado_id": cmd.SimuladoID.String(),
			"reason":      cmd.Reason,
			"report_id":   reportID,
		},
		IP:         cmd.IP,
		UserAgent:  cmd.UserAgent,
		RequestID:  cmd.RequestID,
		OccurredAt: now,
	})

	return ReportQuestionResult{ReportID: reportID}, nil
}
