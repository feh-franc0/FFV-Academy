// Package handlers — StatsHandler expõe estatísticas públicas da plataforma
// usadas pela home page (social proof, métricas agregadas).
package handlers

import (
	"context"
	"net/http"
	"time"
)

// StatsRepository é o port que o StatsHandler usa para buscar métricas agregadas.
// Implementado pela camada de infraestrutura (postgres.StatsRepo).
// A interface isola o handler de pgxpool.Pool, permitindo testes unitários sem DB.
type StatsRepository interface {
	// GetStats retorna as métricas públicas da plataforma.
	GetStats(ctx context.Context) (PlatformStats, error)
}

// PlatformStats é o modelo de domínio com as métricas públicas.
// Separado do DTO para manter o handler desacoplado do payload HTTP.
type PlatformStats struct {
	TotalUsers     int64
	ActiveWeekly   int64
	TotalXPAwarded int64
}

// StatsHandler agrega contagens públicas — sem informação pessoalmente identificável.
//
// Os números servem como social proof na home: "X devs estudando aqui", "Y XP
// acumulados pela comunidade". Nenhum endpoint autenticado é necessário para
// servir esses números, e nenhum dado por usuário é exposto.
type StatsHandler struct {
	repo StatsRepository
}

// NewStatsHandler cria o handler com o repositório de stats.
func NewStatsHandler(repo StatsRepository) *StatsHandler {
	return &StatsHandler{repo: repo}
}

// PlatformStatsDTO é o payload retornado por GET /api/v1/stats.
type PlatformStatsDTO struct {
	TotalUsers     int64 `json:"totalUsers"`
	ActiveWeekly   int64 `json:"activeWeekly"`
	TotalXPAwarded int64 `json:"totalXpAwarded"`
}

// GetPublic responde com contagens agregadas. Endpoint público, sem auth.
//
// Cache curto (60s) é razoável — números mudam pouco e a home recebe muito
// tráfego não autenticado.
func (h *StatsHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	stats, err := h.repo.GetStats(ctx)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	dto := PlatformStatsDTO(stats)

	// Cache 60s no edge/CDN — números agregados não precisam ser real-time.
	w.Header().Set("Cache-Control", "public, max-age=60, s-maxage=60")
	WriteJSON(w, http.StatusOK, dto)
}
