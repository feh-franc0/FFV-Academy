package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	appprogress "github.com/fernandofv/api/internal/application/progress"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// ProgressHandler expõe os endpoints de cloud sync do GameState.
//
// PADRÃO: LWW (last-write-wins) — cliente envia clientUpdatedAt para
// detecção de conflito. O servidor é autoritativo em caso de conflito.
type ProgressHandler struct {
	push *appprogress.SyncPushUseCase
	pull *appprogress.SyncPullUseCase
}

func NewProgressHandler(push *appprogress.SyncPushUseCase, pull *appprogress.SyncPullUseCase) *ProgressHandler {
	return &ProgressHandler{push: push, pull: pull}
}

// Push salva o GameState do cliente no servidor.
// PUT /api/v1/progress
func (h *ProgressHandler) Push(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SchemaVersion   int             `json:"schemaVersion"`
		State           json.RawMessage `json:"state"`
		ClientUpdatedAt time.Time       `json:"clientUpdatedAt"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo inválido", "bad-request")
		return
	}

	userID := middleware.UserIDFromContext(r.Context())
	cmd := appprogress.SyncPushCommand{
		UserID:          userID,
		SchemaVersion:   req.SchemaVersion,
		State:           req.State,
		ClientUpdatedAt: req.ClientUpdatedAt,
	}

	if err := h.push.Execute(r.Context(), cmd); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// Pull retorna o GameState armazenado no servidor.
// GET /api/v1/progress
func (h *ProgressHandler) Pull(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	result, err := h.pull.Execute(r.Context(), userID)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"schemaVersion":   result.SchemaVersion,
		"state":           result.State,
		"clientUpdatedAt": result.ClientUpdatedAt.UTC().Format(time.RFC3339),
		"serverUpdatedAt": result.ServerUpdatedAt.UTC().Format(time.RFC3339),
	})
}
