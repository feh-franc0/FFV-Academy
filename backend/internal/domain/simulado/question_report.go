package simulado

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// ReportReason é o motivo do report de uma questão.
type ReportReason string

const (
	ReasonWrongAnswer ReportReason = "wrong_answer"
	ReasonTypo        ReportReason = "typo"
	ReasonAmbiguous   ReportReason = "ambiguous"
	ReasonOutdated    ReportReason = "outdated"
	ReasonOther       ReportReason = "other"
)

var validReasons = map[ReportReason]struct{}{
	ReasonWrongAnswer: {},
	ReasonTypo:        {},
	ReasonAmbiguous:   {},
	ReasonOutdated:    {},
	ReasonOther:       {},
}

// IsValid reporta se o motivo é um valor permitido.
func (r ReportReason) IsValid() bool {
	_, ok := validReasons[r]
	return ok
}

// MaxReportCommentLength é o limite de caracteres do comentário livre.
const MaxReportCommentLength = 1000

// QuestionReport é um feedback do usuário sobre uma questão específica.
//
// INVARIANTES:
//  1. reason deve ser um ReportReason válido.
//  2. comment <= 1000 chars (trimmed).
//  3. imutável após criação (resolvedAt é setado apenas pelo admin).
type QuestionReport struct {
	id         string
	userID     shared.UserID
	simuladoID shared.SimuladoID
	questionID shared.QuestionID
	reason     ReportReason
	comment    string
	createdAt  time.Time
	resolvedAt *time.Time
}

// NewQuestionReport cria e valida um novo report.
func NewQuestionReport(
	id string,
	userID shared.UserID,
	simuladoID shared.SimuladoID,
	questionID shared.QuestionID,
	reason ReportReason,
	comment string,
	now time.Time,
) (*QuestionReport, error) {
	if !reason.IsValid() {
		return nil, shared.NewValidationError(fmt.Sprintf("reason inválido: %q", reason))
	}
	comment = strings.TrimSpace(comment)
	if len(comment) > MaxReportCommentLength {
		return nil, shared.NewValidationError(
			fmt.Sprintf("comment deve ter até %d chars, got %d", MaxReportCommentLength, len(comment)),
		)
	}
	if userID.IsZero() {
		return nil, shared.NewValidationError("userID obrigatório")
	}
	if simuladoID.IsZero() {
		return nil, shared.NewValidationError("simuladoID obrigatório")
	}
	if questionID == "" {
		return nil, shared.NewValidationError("questionID obrigatório")
	}
	return &QuestionReport{
		id:         id,
		userID:     userID,
		simuladoID: simuladoID,
		questionID: questionID,
		reason:     reason,
		comment:    comment,
		createdAt:  now,
	}, nil
}

func (r *QuestionReport) ID() string                    { return r.id }
func (r *QuestionReport) UserID() shared.UserID         { return r.userID }
func (r *QuestionReport) SimuladoID() shared.SimuladoID { return r.simuladoID }
func (r *QuestionReport) QuestionID() shared.QuestionID { return r.questionID }
func (r *QuestionReport) Reason() ReportReason          { return r.reason }
func (r *QuestionReport) Comment() string               { return r.comment }
func (r *QuestionReport) CreatedAt() time.Time          { return r.createdAt }
func (r *QuestionReport) ResolvedAt() *time.Time        { return r.resolvedAt }

// QuestionReportRepository é o port de persistência de reports.
type QuestionReportRepository interface {
	Save(ctx context.Context, report *QuestionReport) error

	// CountByUserSince retorna quantos reports o usuário criou desde `since`.
	// Usado para rate-limit por usuário (X reports/24h).
	CountByUserSince(ctx context.Context, userID shared.UserID, since time.Time) (int, error)
}
