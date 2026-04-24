package simulado_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	appsim "github.com/fernandofv/api/internal/application/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

type mockReportRepo struct {
	saved []*domsim.QuestionReport
	count int
}

func (m *mockReportRepo) Save(_ context.Context, r *domsim.QuestionReport) error {
	m.saved = append(m.saved, r)
	return nil
}

func (m *mockReportRepo) CountByUserSince(_ context.Context, _ shared.UserID, _ time.Time) (int, error) {
	return m.count, nil
}

func Test_ReportQuestionUseCase_Execute_Valid_Persists(t *testing.T) {
	now := time.Now()
	repo := &mockReportRepo{}
	uc := appsim.NewReportQuestionUseCase(repo, nil, shared.FixedClock{T: now})

	res, err := uc.Execute(context.Background(), appsim.ReportQuestionCommand{
		UserID:     shared.NewUserID(),
		SimuladoID: shared.SimuladoID("aws-clf"),
		QuestionID: shared.QuestionID("q1"),
		Reason:     "typo",
		Comment:    "pequeno erro de digitação",
	})

	require.NoError(t, err)
	assert.NotEmpty(t, res.ReportID)
	assert.Len(t, repo.saved, 1)
	assert.Equal(t, domsim.ReasonTypo, repo.saved[0].Reason())
}

func Test_ReportQuestionUseCase_Execute_InvalidReason_ReturnsValidation(t *testing.T) {
	now := time.Now()
	repo := &mockReportRepo{}
	uc := appsim.NewReportQuestionUseCase(repo, nil, shared.FixedClock{T: now})

	_, err := uc.Execute(context.Background(), appsim.ReportQuestionCommand{
		UserID:     shared.NewUserID(),
		SimuladoID: shared.SimuladoID("aws-clf"),
		QuestionID: shared.QuestionID("q1"),
		Reason:     "not-a-real-reason",
	})

	require.Error(t, err)
	assert.ErrorIs(t, err, shared.ErrValidation)
	assert.Empty(t, repo.saved)
}

func Test_ReportQuestionUseCase_Execute_OverLimit_ReturnsRateLimited(t *testing.T) {
	now := time.Now()
	repo := &mockReportRepo{count: appsim.MaxReportsPerDay}
	uc := appsim.NewReportQuestionUseCase(repo, nil, shared.FixedClock{T: now})

	_, err := uc.Execute(context.Background(), appsim.ReportQuestionCommand{
		UserID:     shared.NewUserID(),
		SimuladoID: shared.SimuladoID("aws-clf"),
		QuestionID: shared.QuestionID("q1"),
		Reason:     "typo",
	})

	require.Error(t, err)
	assert.ErrorIs(t, err, shared.ErrRateLimited)
	assert.Empty(t, repo.saved)
}
