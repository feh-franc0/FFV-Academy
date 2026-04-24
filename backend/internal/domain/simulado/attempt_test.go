package simulado_test

import (
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/domain/simulado"
)

func newAttemptFixture(now time.Time) *simulado.Attempt {
	return simulado.StartAttempt(
		shared.AttemptID("att-1"),
		shared.UserID("user-1"),
		shared.SimuladoID("sim-1"),
		60,
		now,
	)
}

func Test_Attempt_StartAttempt_CreatesActiveWithDeadline(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)

	assert.False(t, a.IsFinished())
	assert.Equal(t, now, a.StartedAt())
	assert.Equal(t, now.Add(60*time.Minute), a.Deadline())
	assert.Nil(t, a.FinishedAt())
	assert.Nil(t, a.Score())
	assert.Equal(t, 0, a.Answers().Count())
}

func Test_Attempt_AnswerQuestion_Active_RegistersAnswer(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)

	err := a.AnswerQuestion(shared.QuestionID("q1"), simulado.OptionA, now)
	require.NoError(t, err)

	assert.Equal(t, 1, a.Answers().Count())
	got, ok := a.Answers().Get(shared.QuestionID("q1"))
	assert.True(t, ok)
	assert.Equal(t, simulado.OptionA, got)
}

func Test_Attempt_AnswerQuestion_Idempotent_OverwritesPrevious(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)

	_ = a.AnswerQuestion(shared.QuestionID("q1"), simulado.OptionA, now)
	_ = a.AnswerQuestion(shared.QuestionID("q1"), simulado.OptionB, now)

	got, _ := a.Answers().Get(shared.QuestionID("q1"))
	assert.Equal(t, simulado.OptionB, got)
	assert.Equal(t, 1, a.Answers().Count())
}

func Test_Attempt_AnswerQuestion_Finished_ReturnsError(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)
	require.NoError(t, a.Finish(simulado.NewScore(simulado.ScoreResult{}), now))

	err := a.AnswerQuestion(shared.QuestionID("q1"), simulado.OptionA, now)
	assert.ErrorIs(t, err, simulado.ErrAttemptAlreadyFinished)
}

func Test_Attempt_AnswerQuestion_Expired_ReturnsError(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)
	past := now.Add(2 * time.Hour) // deadline é now + 60min

	err := a.AnswerQuestion(shared.QuestionID("q1"), simulado.OptionA, past)
	assert.ErrorIs(t, err, simulado.ErrAttemptExpired)
}

func Test_Attempt_AnswerQuestion_InvalidOption_ReturnsError(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)

	err := a.AnswerQuestion(shared.QuestionID("q1"), simulado.OptionID("Z"), now)
	assert.ErrorIs(t, err, simulado.ErrInvalidOptionID)
}

func Test_Attempt_ToggleReviewFlag_TwiceIsNoop(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)
	q := shared.QuestionID("q1")

	require.NoError(t, a.ToggleReviewFlag(q, now))
	assert.True(t, a.ReviewFlags().Contains(q))

	require.NoError(t, a.ToggleReviewFlag(q, now))
	assert.False(t, a.ReviewFlags().Contains(q), "segunda chamada deve remover a flag")
}

func Test_Attempt_ToggleReviewFlag_Finished_ReturnsError(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)
	require.NoError(t, a.Finish(simulado.NewScore(simulado.ScoreResult{}), now))

	err := a.ToggleReviewFlag(shared.QuestionID("q1"), now)
	assert.ErrorIs(t, err, simulado.ErrAttemptAlreadyFinished)
}

func Test_Attempt_Finish_Active_TransitionsToFinished(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)
	finishAt := now.Add(30 * time.Minute)
	score := simulado.NewScore(simulado.ScoreResult{Value: 80, Passed: true})

	err := a.Finish(score, finishAt)
	require.NoError(t, err)

	assert.True(t, a.IsFinished())
	require.NotNil(t, a.FinishedAt())
	assert.Equal(t, finishAt, *a.FinishedAt())
	require.NotNil(t, a.Score())
	assert.Equal(t, 80, a.Score().Value())
}

// Finish em attempt já finalizada: código atual retorna nil (idempotente),
// mantendo o score original.
func Test_Attempt_Finish_AlreadyFinished_IsIdempotent(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)
	first := simulado.NewScore(simulado.ScoreResult{Value: 80})
	second := simulado.NewScore(simulado.ScoreResult{Value: 10})

	require.NoError(t, a.Finish(first, now))
	err := a.Finish(second, now.Add(5*time.Minute))

	assert.NoError(t, err)
	assert.Equal(t, 80, a.Score().Value(), "score original deve ser preservado")
}

func Test_Attempt_IsFinished_ReflectsStatus(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)
	assert.False(t, a.IsFinished())

	_ = a.Finish(simulado.NewScore(simulado.ScoreResult{}), now)
	assert.True(t, a.IsFinished())
}

func Test_Attempt_Deadline_EqualsStartPlusTimeLimit(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := simulado.StartAttempt(
		shared.AttemptID("att-x"),
		shared.UserID("u-x"),
		shared.SimuladoID("s-x"),
		45,
		now,
	)
	assert.Equal(t, now.Add(45*time.Minute), a.Deadline())
}

func Test_Attempt_IsExpired_AfterDeadline_ReturnsTrue(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)
	assert.False(t, a.IsExpired(now.Add(30*time.Minute)))
	assert.True(t, a.IsExpired(now.Add(2*time.Hour)))
}

func Test_Attempt_TimeRemaining_Finished_ReturnsZero(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	a := newAttemptFixture(now)
	_ = a.Finish(simulado.NewScore(simulado.ScoreResult{}), now)
	assert.Equal(t, time.Duration(0), a.TimeRemaining(now))
}

func Test_Attempt_ReconstituteAttempt_PreservesAllFields(t *testing.T) {
	now := time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	finishedAt := now.Add(30 * time.Minute)
	score := simulado.NewScore(simulado.ScoreResult{Value: 75})

	a := simulado.ReconstituteAttempt(
		shared.AttemptID("att-1"),
		shared.UserID("u-1"),
		shared.SimuladoID("s-1"),
		now,
		now.Add(time.Hour),
		&finishedAt,
		map[shared.QuestionID]simulado.OptionID{"q1": simulado.OptionA},
		[]shared.QuestionID{"q2"},
		&score,
	)

	assert.True(t, a.IsFinished())
	assert.Equal(t, 1, a.Answers().Count())
	assert.True(t, a.ReviewFlags().Contains(shared.QuestionID("q2")))
	assert.Equal(t, 75, a.Score().Value())
}

// Guarda contra regressão no detecção de invariantes via errors.Is.
func Test_Attempt_Errors_AreDistinct(t *testing.T) {
	assert.False(t, errors.Is(simulado.ErrAttemptAlreadyFinished, simulado.ErrAttemptExpired))
}
