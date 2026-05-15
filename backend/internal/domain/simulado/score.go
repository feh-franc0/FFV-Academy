package simulado

import "github.com/fernandofv/api/internal/domain/shared"

// Score é um Value Object imutável que representa o resultado de uma Attempt.
//
// INVARIANTE: value ∈ [0,100]; só existe após Attempt.Finish().
// Produzido pelo Scorer — nunca criado diretamente pelo cliente.
type Score struct {
	value          int
	passed         bool
	byTopic        map[Topic]TopicCounts
	correctCount   int
	totalQuestions int
}

// TopicCounts agrupa acertos e total por tópico.
type TopicCounts struct {
	Correct int
	Total   int
}

// ScoreResult é o DTO intermediário retornado pelo Scorer.
// Usado para construir Score e para serialização.
type ScoreResult struct {
	Value          int
	Passed         bool
	ByTopic        map[Topic]TopicCounts
	CorrectCount   int
	TotalQuestions int
	TotalAnswered  int
}

func NewScore(r ScoreResult) Score {
	return Score{
		value:          r.Value,
		passed:         r.Passed,
		byTopic:        r.ByTopic,
		correctCount:   r.CorrectCount,
		totalQuestions: r.TotalQuestions,
	}
}

func (s Score) Value() int                     { return s.value }
func (s Score) Passed() bool                   { return s.passed }
func (s Score) CorrectCount() int              { return s.correctCount }
func (s Score) TotalQuestions() int            { return s.totalQuestions }
func (s Score) ByTopic() map[Topic]TopicCounts { return s.byTopic }

// WeakTopics retorna os tópicos com taxa de acerto < threshold (0.0-1.0).
func (s Score) WeakTopics(threshold float64) []Topic {
	weak := make([]Topic, 0)
	for topic, counts := range s.byTopic {
		if counts.Total == 0 {
			continue
		}
		if float64(counts.Correct)/float64(counts.Total) < threshold {
			weak = append(weak, topic)
		}
	}
	return weak
}

// ─────────────────────────────────────────────────────────────────
// Scorer — Domain Service
// ─────────────────────────────────────────────────────────────────

// Scorer é um domain service puro que calcula o score de uma Attempt.
//
// PADRÕES:
//   - DDD Domain Service: lógica que não pertence a um único aggregate.
//   - Pure function: dado mesmo input, sempre mesmo output (testável isoladamente).
//   - POR QUÊ servidor calcula score: o cliente não pode mentir que acertou uma
//     questão. O backend valida contra o catálogo embebido.
type Scorer struct{}

// Calculate computa o score da attempt contra o gabarito do simulado.
func (Scorer) Calculate(simulado *Simulado, answers Answers) ScoreResult {
	byTopic := make(map[Topic]TopicCounts)
	correctCount := 0
	totalAnswered := 0

	for _, q := range simulado.Questions {
		if _, exists := byTopic[q.Topic]; !exists {
			byTopic[q.Topic] = TopicCounts{}
		}
		counts := byTopic[q.Topic]
		counts.Total++

		chosen, answered := answers.Get(shared.QuestionID(q.ID))
		if answered {
			totalAnswered++
			if chosen == q.CorrectID {
				correctCount++
				counts.Correct++
			}
		}
		byTopic[q.Topic] = counts
	}

	total := len(simulado.Questions)
	var scoreValue int
	if total > 0 {
		scoreValue = int(float64(correctCount) / float64(total) * 100)
	}

	return ScoreResult{
		Value:          scoreValue,
		Passed:         scoreValue >= simulado.PassingScore,
		ByTopic:        byTopic,
		CorrectCount:   correctCount,
		TotalQuestions: total,
		TotalAnswered:  totalAnswered,
	}
}

// ─────────────────────────────────────────────────────────────────
// Paywall Policy
// ─────────────────────────────────────────────────────────────────

// PaywallPolicy controla o acesso às questões do simulado.
//
// Todas as questões são gratuitas — acesso via nível do usuário, não pagamento.
type PaywallPolicy struct{}

// IsAccessible retorna true para qualquer questão: simulados são 100% gratuitos.
func (PaywallPolicy) IsAccessible(_ int, _ bool) bool {
	return true
}
