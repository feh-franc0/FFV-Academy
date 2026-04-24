package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// QuestionReportRepo implementa domsim.QuestionReportRepository.
type QuestionReportRepo struct {
	pool *pgxpool.Pool
}

func NewQuestionReportRepo(pool *pgxpool.Pool) *QuestionReportRepo {
	return &QuestionReportRepo{pool: pool}
}

func (r *QuestionReportRepo) Save(ctx context.Context, rep *domsim.QuestionReport) error {
	const q = `
		INSERT INTO question_reports
			(id, user_id, simulado_id, question_id, reason, comment, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
	`
	_, err := r.pool.Exec(ctx, q,
		rep.ID(),
		rep.UserID().String(),
		rep.SimuladoID().String(),
		rep.QuestionID().String(),
		string(rep.Reason()),
		rep.Comment(),
		rep.CreatedAt(),
	)
	return err
}

func (r *QuestionReportRepo) CountByUserSince(ctx context.Context, userID shared.UserID, since time.Time) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM question_reports WHERE user_id = $1 AND created_at >= $2`,
		userID.String(), since,
	).Scan(&count)
	return count, err
}

// Compile-time check.
var _ domsim.QuestionReportRepository = (*QuestionReportRepo)(nil)
