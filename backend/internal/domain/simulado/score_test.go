package simulado_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/domain/simulado"
)

func Test_Scorer_Calculate_AllCorrect_Returns100(t *testing.T) {
	sim := &simulado.Simulado{
		PassingScore: 70,
		Questions: []simulado.Question{
			{ID: shared.QuestionID("q1"), CorrectID: "A", Topic: "Cloud"},
			{ID: shared.QuestionID("q2"), CorrectID: "B", Topic: "Cloud"},
		},
	}

	answers := simulado.NewAnswers().
		Set(shared.QuestionID("q1"), simulado.OptionID("A")).
		Set(shared.QuestionID("q2"), simulado.OptionID("B"))

	result := simulado.Scorer{}.Calculate(sim, answers)

	assert.Equal(t, 100, result.Value)
	assert.Equal(t, 2, result.CorrectCount)
	assert.True(t, result.Passed)
}

func Test_Scorer_Calculate_AllWrong_Returns0(t *testing.T) {
	sim := &simulado.Simulado{
		PassingScore: 70,
		Questions: []simulado.Question{
			{ID: shared.QuestionID("q1"), CorrectID: "A", Topic: "Cloud"},
		},
	}

	answers := simulado.NewAnswers().
		Set(shared.QuestionID("q1"), simulado.OptionID("B"))

	result := simulado.Scorer{}.Calculate(sim, answers)

	assert.Equal(t, 0, result.Value)
	assert.False(t, result.Passed)
}

func Test_Scorer_Calculate_NoAnswers_Returns0NotPassed(t *testing.T) {
	sim := &simulado.Simulado{
		PassingScore: 70,
		Questions: []simulado.Question{
			{ID: shared.QuestionID("q1"), CorrectID: "A", Topic: "Cloud"},
		},
	}

	result := simulado.Scorer{}.Calculate(sim, simulado.NewAnswers())

	assert.Equal(t, 0, result.Value)
	assert.False(t, result.Passed)
}

func Test_PaywallPolicy_IsAccessible_FreeIndex_ReturnsTrue(t *testing.T) {
	p := simulado.PaywallPolicy{}
	assert.True(t, p.IsAccessible(0, false))
	assert.True(t, p.IsAccessible(9, false))
}

func Test_PaywallPolicy_IsAccessible_PaidIndex_RequiresPaid(t *testing.T) {
	p := simulado.PaywallPolicy{}
	assert.False(t, p.IsAccessible(10, false))
	assert.True(t, p.IsAccessible(10, true))
}

func Test_Score_WeakTopics_BelowThreshold_ReturnsTopics(t *testing.T) {
	result := simulado.ScoreResult{
		ByTopic: map[simulado.Topic]simulado.TopicCounts{
			"Cloud":    {Correct: 8, Total: 10}, // 80% — OK
			"Security": {Correct: 3, Total: 10}, // 30% — WEAK
		},
	}
	score := simulado.NewScore(result)
	weak := score.WeakTopics(0.7)
	assert.Contains(t, weak, simulado.Topic("Security"))
	assert.NotContains(t, weak, simulado.Topic("Cloud"))
}
