// Package handlers — ModuleViews: registra acessos a artigos para métricas.
//
// Endpoint público (sem auth). O cliente envia ping 1x por sessão por slug.
// Usado pelo /admin/stats pra Top Trails / Top Modules.
package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// ModuleViewRepository — port de escrita.
type ModuleViewRepository interface {
	Insert(ctx context.Context, view ModuleViewInput) error
}

// ModuleViewInput — payload normalizado pelo handler antes de chegar no repo.
type ModuleViewInput struct {
	UserID    string
	AnonID    string
	Slug      string
	HubID     string
	TrailID   string
	Referrer  string
	UserAgent string
	ViewedAt  time.Time
}

// ModuleViewHandler — dependência única.
type ModuleViewHandler struct {
	repo ModuleViewRepository
}

func NewModuleViewHandler(repo ModuleViewRepository) *ModuleViewHandler {
	return &ModuleViewHandler{repo: repo}
}

// moduleViewRequest — corpo aceito por POST /api/v1/events/view.
type moduleViewRequest struct {
	Slug    string `json:"slug"`
	HubID   string `json:"hubId,omitempty"`
	TrailID string `json:"trailId,omitempty"`
	AnonID  string `json:"anonId,omitempty"`
}

// Record — POST /api/v1/events/view
//
// Aceita JSON `{slug, hubId?, trailId?, anonId?}`. Slug é obrigatório.
// Tamanho máx 256B (body limit aplicado no router).
//
// userId vem do middleware Authenticate (opcional — endpoint é público).
func (h *ModuleViewHandler) Record(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "view tracking não configurado", "service-unavailable")
		return
	}

	var req moduleViewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "json inválido", "validation")
		return
	}

	slug := strings.TrimSpace(req.Slug)
	if slug == "" || len(slug) > 200 {
		WriteError(w, http.StatusBadRequest, "slug obrigatório (≤200 chars)", "validation")
		return
	}

	// userID se autenticado, vazio caso contrário. O middleware Authenticate
	// põe o ID no contexto via chave do pacote auth — usamos helper genérico.
	userID := string(middleware.UserIDFromContext(r.Context()))

	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	err := h.repo.Insert(ctx, ModuleViewInput{
		UserID:    userID,
		AnonID:    truncate(req.AnonID, 80),
		Slug:      slug,
		HubID:     truncate(req.HubID, 80),
		TrailID:   truncate(req.TrailID, 80),
		Referrer:  truncate(r.Header.Get("Referer"), 256),
		UserAgent: truncate(r.UserAgent(), 256),
		ViewedAt:  time.Now().UTC(),
	})
	if err != nil {
		// Falha de tracking nunca derruba a UX — log e responde 202.
		w.WriteHeader(http.StatusAccepted)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max]
}
