package identity

import (
	"context"
	"fmt"

	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// UserStatsResult é o payload de /me/stats.
type UserStatsResult struct {
	XPTotal           int                `json:"xpTotal"`
	SimuladosDone     int                `json:"simuladosDone"`
	SimuladosPassed   int                `json:"simuladosPassed"`
	OverallAccuracy   float64            `json:"overallAccuracy"`
	AccuracyByTopic   map[string]float64 `json:"accuracyByTopic"`
	StreakCurrent     int                `json:"streakCurrent"`
	CertificatesCount int                `json:"certificatesCount"`
}

// UserStatsUseCase compõe estatísticas consolidadas do usuário a partir de
// attempts finalizadas e certificados emitidos.
//
// NOTA: streakCurrent é um stub (0) até existir tabela dedicada de daily-xp.
type UserStatsUseCase struct {
	attemptRepo AttemptLister
	certRepo    CertLister
}

func NewUserStatsUseCase(attemptRepo AttemptLister, certRepo CertLister) *UserStatsUseCase {
	return &UserStatsUseCase{attemptRepo: attemptRepo, certRepo: certRepo}
}

func (uc *UserStatsUseCase) Execute(ctx context.Context, userID shared.UserID) (UserStatsResult, error) {
	attempts, _, err := uc.attemptRepo.ListByUser(ctx, userID, 1000, 0)
	if err != nil {
		return UserStatsResult{}, fmt.Errorf("user stats: attempts: %w", err)
	}

	var (
		done     int
		passed   int
		correct  int
		total    int
		xp       int
		byTopic  = map[domsim.Topic]domsim.TopicCounts{}
	)
	for _, a := range attempts {
		if !a.IsFinished() {
			continue
		}
		s := a.Score()
		if s == nil {
			// cancelada/expirada sem score — ignora.
			continue
		}
		done++
		if s.Passed() {
			passed++
		}
		correct += s.CorrectCount()
		total += s.TotalQuestions()
		xp += s.Value() // proxy simples: XP ganho = score value

		for topic, counts := range s.ByTopic() {
			existing := byTopic[topic]
			existing.Correct += counts.Correct
			existing.Total += counts.Total
			byTopic[topic] = existing
		}
	}

	var overall float64
	if total > 0 {
		overall = float64(correct) / float64(total)
	}

	accuracyByTopic := make(map[string]float64, len(byTopic))
	for topic, counts := range byTopic {
		if counts.Total == 0 {
			continue
		}
		accuracyByTopic[string(topic)] = float64(counts.Correct) / float64(counts.Total)
	}

	certs, err := uc.certRepo.ListByUser(ctx, userID)
	if err != nil {
		return UserStatsResult{}, fmt.Errorf("user stats: certs: %w", err)
	}

	return UserStatsResult{
		XPTotal:           xp,
		SimuladosDone:     done,
		SimuladosPassed:   passed,
		OverallAccuracy:   overall,
		AccuracyByTopic:   accuracyByTopic,
		StreakCurrent:     0, // stub até existir daily-xp dedicado
		CertificatesCount: len(certs),
	}, nil
}
