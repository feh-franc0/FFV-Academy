package simulado

import (
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// Cancel marca a attempt como cancelada pelo usuário.
//
// INVARIANTES:
//  1. Attempt não pode estar finalizada.
//  2. Após cancel, finishedAt = now, score = nil (cancelamento sem pontuação).
//  3. Idempotência: não altera uma attempt já finalizada (retorna ErrConflict).
//
// NOTA: o campo "status" derivado no DB é distinto do campo `cancelled`:
// como o schema não tem coluna status explícita, a diferenciação entre
// "cancelada" e "tempo esgotado" fica a cargo de convenção:
// finishedAt != nil && score == nil  →  cancelada ou expirada sem score.
func (a *Attempt) Cancel(now time.Time) error {
	if a.IsFinished() {
		return shared.NewConflictError("attempt já finalizada")
	}
	a.finishedAt = &now
	a.score = nil
	return nil
}

// IsCancelled é uma conveniência: finished sem score indica cancelamento.
func (a *Attempt) IsCancelled() bool {
	return a.IsFinished() && a.score == nil
}
