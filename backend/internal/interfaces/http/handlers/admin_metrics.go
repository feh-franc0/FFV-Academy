// Package handlers — AdminMetrics: KPIs reais com breakdown por base.
//
// Decisão de produto (2026-05-21): além do /admin/stats global (que existe
// desde a primeira release), o admin precisa de visão POR BASE — DAU/MAU
// por base, top módulos da base, view counts. Sem isso é impossível decidir
// "tech vs medvet — qual está crescendo? Qual precisa de conteúdo?".
package handlers

import (
	"context"
	"net/http"
	"time"
)

// AdminMetricsRepository — port de leitura agregada por base.
type AdminMetricsRepository interface {
	GetOverview(ctx context.Context, since time.Time, until time.Time) (MetricsOverview, error)
}

// BaseMetrics — KPIs por base.
type BaseMetrics struct {
	BaseSlug       string `json:"baseSlug"`
	ViewsTotal     int64  `json:"viewsTotal"`
	ViewsLogged    int64  `json:"viewsLogged"`
	ViewsAnon      int64  `json:"viewsAnon"`
	UniqueUsers    int64  `json:"uniqueUsers"`    // logged users distintos
	UniqueVisitors int64  `json:"uniqueVisitors"` // anon_id distintos
	UniqueSessions int64  `json:"uniqueSessions"` // session_id distintos
	TopModule      string `json:"topModule,omitempty"`
	TopModuleViews int64  `json:"topModuleViews,omitempty"`
}

// MetricsOverview — agregação por base + globais.
type MetricsOverview struct {
	Since       time.Time     `json:"since"`
	Until       time.Time     `json:"until"`
	ViewsTotal  int64         `json:"viewsTotal"`
	ViewsLogged int64         `json:"viewsLogged"`
	ViewsAnon   int64         `json:"viewsAnon"`
	ByBase      []BaseMetrics `json:"byBase"`
	ByKind      []KindCount   `json:"byKind"`
	GeneratedAt time.Time     `json:"generatedAt"`
}

// KindCount — distribuição por kind (module/page/simulado/admin/other).
type KindCount struct {
	Kind  string `json:"kind"`
	Count int64  `json:"count"`
}

// AdminMetricsHandler — GET /api/v1/admin/metrics/overview.
type AdminMetricsHandler struct {
	repo AdminMetricsRepository
}

func NewAdminMetricsHandler(repo AdminMetricsRepository) *AdminMetricsHandler {
	return &AdminMetricsHandler{repo: repo}
}

// GetOverview retorna métricas de 7 dias por padrão. Aceita `?days=30`.
func (h *AdminMetricsHandler) GetOverview(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteJSON(w, http.StatusOK, MetricsOverview{GeneratedAt: time.Now().UTC()})
		return
	}

	days := 7
	if s := r.URL.Query().Get("days"); s != "" {
		// Aceita 1..90 — janelas maiores demoram.
		if n, ok := parseIntInRange(s, 1, 90); ok {
			days = n
		}
	}

	until := time.Now().UTC()
	since := until.AddDate(0, 0, -days)

	ctx, cancel := context.WithTimeout(r.Context(), 6*time.Second)
	defer cancel()

	overview, err := h.repo.GetOverview(ctx, since, until)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	overview.Since = since
	overview.Until = until
	overview.GeneratedAt = time.Now().UTC()

	w.Header().Set("Cache-Control", "private, max-age=60")
	WriteJSON(w, http.StatusOK, overview)
}

func parseIntInRange(s string, lo, hi int) (int, bool) {
	n := 0
	for _, ch := range s {
		if ch < '0' || ch > '9' {
			return 0, false
		}
		n = n*10 + int(ch-'0')
		if n > hi {
			return 0, false
		}
	}
	if n < lo {
		return 0, false
	}
	return n, true
}
