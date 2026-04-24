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

func Test_CancelAttemptUseCase_Execute_ValidAttempt_Cancels(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("aws-clf")
	attemptID := shared.NewAttemptID()

	attempt := domsim.StartAttempt(attemptID, userID, simID, 90, now)
	repo := &mockAttemptRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}

	uc := appsim.NewCancelAttemptUseCase(repo, nil, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.CancelAttemptCommand{
		UserID:    userID,
		AttemptID: attemptID,
	})

	require.NoError(t, err)
	assert.True(t, attempt.IsFinished())
	assert.True(t, attempt.IsCancelled())
	assert.Nil(t, attempt.Score())
}

func Test_CancelAttemptUseCase_Execute_WrongOwner_ReturnsForbidden(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	other := shared.NewUserID()
	simID := shared.SimuladoID("aws-clf")
	attemptID := shared.NewAttemptID()

	attempt := domsim.StartAttempt(attemptID, userID, simID, 90, now)
	repo := &mockAttemptRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}

	uc := appsim.NewCancelAttemptUseCase(repo, nil, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.CancelAttemptCommand{
		UserID:    other,
		AttemptID: attemptID,
	})

	require.Error(t, err)
	assert.ErrorIs(t, err, shared.ErrForbidden)
	assert.False(t, attempt.IsFinished())
}

func Test_CancelAttemptUseCase_Execute_AlreadyFinished_ReturnsValidation(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("aws-clf")
	attemptID := shared.NewAttemptID()

	attempt := domsim.StartAttempt(attemptID, userID, simID, 90, now)
	_ = attempt.Finish(domsim.NewScore(domsim.ScoreResult{Value: 50}), now)
	repo := &mockAttemptRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}

	uc := appsim.NewCancelAttemptUseCase(repo, nil, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.CancelAttemptCommand{
		UserID:    userID,
		AttemptID: attemptID,
	})

	require.Error(t, err)
	assert.ErrorIs(t, err, shared.ErrValidation)
}
