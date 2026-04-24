package handlers

import (
	"net/http"

	appevent "github.com/fernandofv/api/internal/application/event"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// AdminHandler expõe os endpoints de administração.
//
// PADRÃO: protegido pelo middleware RequireAdmin (role=admin no JWT).
// Acesso restrito — nunca exposto publicamente.
type AdminHandler struct {
	userRepo    domidentity.UserRepository
	attemptRepo domsim.AttemptRepository
	eventIngest *appevent.IngestEventUseCase
}

func NewAdminHandler(
	userRepo domidentity.UserRepository,
	attemptRepo domsim.AttemptRepository,
	eventIngest *appevent.IngestEventUseCase,
) *AdminHandler {
	return &AdminHandler{
		userRepo:    userRepo,
		attemptRepo: attemptRepo,
		eventIngest: eventIngest,
	}
}

// GetStats retorna métricas gerais do sistema.
// GET /api/v1/admin/stats
func (h *AdminHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"status": "operational",
	})
}
