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
//
// Campos enriquecidos pela migration 51 (2026-05-21):
//   - BaseSlug:        qual base de conhecimento disparou a view
//   - UserEmail/Name:  identidade denormalizada pra admin não fazer JOIN
//   - SessionID:       correlaciona pageviews da mesma visita
//   - Path:            URL completa (não só slug do módulo)
//   - Kind:            module | page | simulado | admin | other
type ModuleViewInput struct {
	UserID          string
	UserEmail       string
	UserDisplayName string
	AnonID          string
	SessionID       string
	BaseSlug        string
	Slug            string
	HubID           string
	TrailID         string
	Path            string
	Kind            string
	Referrer        string
	UserAgent       string
	ViewedAt        time.Time
}

// ModuleViewHandler — dependência única.
type ModuleViewHandler struct {
	repo ModuleViewRepository
}

func NewModuleViewHandler(repo ModuleViewRepository) *ModuleViewHandler {
	return &ModuleViewHandler{repo: repo}
}

// moduleViewRequest — corpo aceito por POST /api/v1/events/view.
//
// Campos novos da migration 51:
//   - baseSlug:  base de conhecimento ativa no momento (tecnologia, medicina-veterinaria, …)
//   - path:      URL completa (ex. /tecnologia/postgres-mvcc) — permite tracking
//     de páginas que não são módulos (ranking, admin, etc.)
//   - kind:      categoriza a view (module, page, simulado, admin, other)
type moduleViewRequest struct {
	Slug     string `json:"slug"`
	HubID    string `json:"hubId,omitempty"`
	TrailID  string `json:"trailId,omitempty"`
	BaseSlug string `json:"baseSlug,omitempty"`
	Path     string `json:"path,omitempty"`
	Kind     string `json:"kind,omitempty"`
	// AnonID continua aceito no body como fallback pra clients antigos que
	// não enviam X-FFV-Anon-Id ainda. Header tem precedência.
	AnonID string `json:"anonId,omitempty"`
}

// validKinds — set fechado pra defender contra valores arbitrários no DB.
var validKinds = map[string]struct{}{
	"module":   {},
	"page":     {},
	"simulado": {},
	"admin":    {},
	"other":    {},
}

// Record — POST /api/v1/events/view
//
// Aceita JSON com slug, hub, trail, base, path, kind, anonId.
// Identidade preferencialmente vem dos headers X-FFV-* (via middleware
// IdentityHeaders) — body é fallback. Slug é obrigatório APENAS para
// kind=module; outras kinds podem omitir.
//
// userId vem do middleware Authenticate quando JWT presente.
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
	kind := strings.TrimSpace(req.Kind)
	if kind == "" {
		kind = "module"
	}
	if _, ok := validKinds[kind]; !ok {
		kind = "other"
	}
	// Slug obrigatório para kind=module; outras kinds podem ser sem slug.
	if kind == "module" && (slug == "" || len(slug) > 200) {
		WriteError(w, http.StatusBadRequest, "slug obrigatório (≤200 chars)", "validation")
		return
	}
	if len(slug) > 200 {
		slug = slug[:200]
	}

	// Identidade: prefere headers (sanitizados pelo middleware) e cai pro JWT
	// e pro body como fallback. Email/nome só vêm de headers — não confiamos
	// em body pra esses campos.
	id := middleware.IdentityFromContext(r.Context())
	userID := string(middleware.UserIDFromContext(r.Context()))
	if userID == "" {
		userID = id.UserID
	}
	anonID := id.AnonID
	if anonID == "" {
		anonID = truncate(req.AnonID, 80)
	}

	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	err := h.repo.Insert(ctx, ModuleViewInput{
		UserID:          userID,
		UserEmail:       id.UserEmail,
		UserDisplayName: id.UserName,
		AnonID:          anonID,
		SessionID:       id.SessionID,
		BaseSlug:        truncate(req.BaseSlug, 80),
		Slug:            slug,
		HubID:           truncate(req.HubID, 80),
		TrailID:         truncate(req.TrailID, 80),
		Path:            truncate(req.Path, 512),
		Kind:            kind,
		Referrer:        truncate(r.Header.Get("Referer"), 256),
		UserAgent:       truncate(r.UserAgent(), 256),
		ViewedAt:        time.Now().UTC(),
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
