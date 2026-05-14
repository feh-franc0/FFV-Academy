// Package handlers — AdminStats: métricas reais para o painel admin.
//
// Substitui o placeholder antigo (`{"status":"operational"}`) por um snapshot
// rico de saúde do produto: usuários, atividade, XP, conteúdo mais acessado.
//
// Todas as queries são agregadas — nenhum dado pessoalmente identificável é
// retornado pelo endpoint, apenas contagens e top-N anonimizado por slug.
package handlers

import (
	"context"
	"net/http"
	"time"
)

// AdminStatsRepository abstrai a fonte de dados das métricas administrativas.
type AdminStatsRepository interface {
	GetAdminStats(ctx context.Context) (AdminStats, error)
	GetTopTrails(ctx context.Context, since time.Time, limit int) ([]TrailViewStat, error)
	GetTopModules(ctx context.Context, since time.Time, limit int) ([]ModuleViewStat, error)
}

// AdminStats é o snapshot agregado retornado por /api/v1/admin/stats.
type AdminStats struct {
	TotalUsers      int64     `json:"totalUsers"`
	UsersLast7Days  int64     `json:"usersLast7Days"`
	UsersLast30Days int64     `json:"usersLast30Days"`
	ActiveDaily     int64     `json:"activeDaily"`
	ActiveWeekly    int64     `json:"activeWeekly"`
	ActiveMonthly   int64     `json:"activeMonthly"`
	TotalXPAwarded  int64     `json:"totalXpAwarded"`
	TotalAttempts   int64     `json:"totalAttempts"`
	TotalCertifs    int64     `json:"totalCertificates"`
	TotalArticles   int64     `json:"totalArticles"`
	TotalBlocks     int64     `json:"totalBlocks"`
	ViewsLast7Days  int64     `json:"viewsLast7Days"`
	ViewsLast30Days int64     `json:"viewsLast30Days"`
	GeneratedAt     time.Time `json:"generatedAt"`
}

// TrailViewStat — entrada do top trails (views agregados por trilha).
type TrailViewStat struct {
	TrailID string `json:"trailId"`
	Views   int64  `json:"views"`
}

// ModuleViewStat — entrada do top modules (views por slug).
type ModuleViewStat struct {
	Slug    string `json:"slug"`
	Title   string `json:"title"`
	TrailID string `json:"trailId,omitempty"`
	Views   int64  `json:"views"`
}

// adminStatsResponse compõe o payload completo retornado.
type adminStatsResponse struct {
	Stats      AdminStats       `json:"stats"`
	TopTrails  []TrailViewStat  `json:"topTrails"`
	TopModules []ModuleViewStat `json:"topModules"`
}

// WithAdminStats anexa o repo de stats administrativas via builder pattern.
func (h *AdminHandler) WithAdminStats(repo AdminStatsRepository) *AdminHandler {
	h.adminStatsRepo = repo
	return h
}

// GetAdminStats — handler real (substitui o placeholder GetStats).
// GET /api/v1/admin/stats
//
// Retorna um snapshot agregado para o dashboard admin. Sem PII.
func (h *AdminHandler) GetAdminStats(w http.ResponseWriter, r *http.Request) {
	if h.adminStatsRepo == nil {
		// Fallback gracioso pra ambientes onde o repo não foi injetado ainda.
		WriteJSON(w, http.StatusOK, adminStatsResponse{Stats: AdminStats{GeneratedAt: time.Now().UTC()}})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	stats, err := h.adminStatsRepo.GetAdminStats(ctx)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	stats.GeneratedAt = time.Now().UTC()

	// Top-N usa janela de 30d. Falhas são toleradas — dashboard mostra vazio.
	since := time.Now().UTC().AddDate(0, 0, -30)
	topTrails, _ := h.adminStatsRepo.GetTopTrails(ctx, since, 10)
	topModules, _ := h.adminStatsRepo.GetTopModules(ctx, since, 10)

	// Cache curto pra reduzir custo de queries pesadas em refresh frequente.
	w.Header().Set("Cache-Control", "private, max-age=30")

	WriteJSON(w, http.StatusOK, adminStatsResponse{
		Stats:      stats,
		TopTrails:  topTrails,
		TopModules: topModules,
	})
}
