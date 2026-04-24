package identity_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	appidentity "github.com/fernandofv/api/internal/application/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

func Test_UserStatsUseCase_Execute_AggregatesFinishedAttempts(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()

	a1 := domsim.StartAttempt(shared.NewAttemptID(), userID, shared.SimuladoID("s1"), 90, now)
	_ = a1.Finish(domsim.NewScore(domsim.ScoreResult{
		Value: 80, Passed: true, CorrectCount: 8, TotalQuestions: 10,
		ByTopic: map[domsim.Topic]domsim.TopicCounts{"Cloud": {Correct: 4, Total: 5}, "Net": {Correct: 4, Total: 5}},
	}), now)

	a2 := domsim.StartAttempt(shared.NewAttemptID(), userID, shared.SimuladoID("s2"), 90, now)
	_ = a2.Finish(domsim.NewScore(domsim.ScoreResult{
		Value: 40, Passed: false, CorrectCount: 4, TotalQuestions: 10,
		ByTopic: map[domsim.Topic]domsim.TopicCounts{"Cloud": {Correct: 2, Total: 5}, "Sec": {Correct: 2, Total: 5}},
	}), now)

	// Active attempt (ignored) and cancelled-like (score=nil).
	a3 := domsim.StartAttempt(shared.NewAttemptID(), userID, shared.SimuladoID("s3"), 90, now)

	attemptRepo := &exportAttemptLister{attempts: []*domsim.Attempt{a1, a2, a3}}
	certRepo := &exportCertLister{certs: nil}

	uc := appidentity.NewUserStatsUseCase(attemptRepo, certRepo)
	stats, err := uc.Execute(context.Background(), userID)

	require.NoError(t, err)
	assert.Equal(t, 2, stats.SimuladosDone)
	assert.Equal(t, 1, stats.SimuladosPassed)
	assert.Equal(t, 120, stats.XPTotal) // 80 + 40
	assert.InDelta(t, 12.0/20.0, stats.OverallAccuracy, 0.001)
	assert.Contains(t, stats.AccuracyByTopic, "Cloud")
	assert.Equal(t, 0, stats.CertificatesCount)
	assert.Equal(t, 0, stats.StreakCurrent)
}

func Test_UserStatsUseCase_Execute_NoAttempts_ReturnsZeros(t *testing.T) {
	userID := shared.NewUserID()
	attemptRepo := &exportAttemptLister{attempts: nil}
	certRepo := &exportCertLister{certs: nil}

	uc := appidentity.NewUserStatsUseCase(attemptRepo, certRepo)
	stats, err := uc.Execute(context.Background(), userID)
	require.NoError(t, err)
	assert.Equal(t, 0, stats.SimuladosDone)
	assert.Equal(t, 0.0, stats.OverallAccuracy)
	assert.Empty(t, stats.AccuracyByTopic)
}
