// Package handlers — AdminGrowth: time-series de crescimento para o painel admin.
//
// GET /api/v1/admin/growth?days=30
// Retorna arrays diários de cadastros e tentativas de simulado.
package handlers

import (
	"context"
	"net/http"
	"time"
)

// AdminGrowthRepository abstrai a fonte de dados do time-series de crescimento.
type AdminGrowthRepository interface {
	GetGrowth(ctx context.Context, days int) (GrowthData, error)
}

// DayCount representa a contagem de eventos em um dia específico.
type DayCount struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

// GrowthData contém as séries temporais de crescimento.
type GrowthData struct {
	UserSignups      []DayCount `json:"userSignups"`
	SimuladoAttempts []DayCount `json:"simuladoAttempts"`
}

// WithAdminGrowth injeta o repositório de growth via builder pattern.
func (h *AdminHandler) WithAdminGrowth(repo AdminGrowthRepository) *AdminHandler {
	h.growthRepo = repo
	return h
}

// GetGrowth retorna time-series de cadastros e tentativas de simulado.
//
// GET /api/v1/admin/growth?days=30
//
// Parâmetros:
//   - days: número de dias (padrão 30, mínimo 7, máximo 90)
func (h *AdminHandler) GetGrowth(w http.ResponseWriter, r *http.Request) {
	if h.growthRepo == nil {
		WriteJSON(w, http.StatusOK, map[string]interface{}{
			"days":             30,
			"userSignups":      []DayCount{},
			"simuladoAttempts": []DayCount{},
		})
		return
	}

	days := parseIntParam(r.URL.Query().Get("days"), 30)
	if days < 7 {
		days = 7
	}
	if days > 90 {
		days = 90
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	data, err := h.growthRepo.GetGrowth(ctx, days)
	if err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}

	// Garante arrays não-nulos na resposta.
	if data.UserSignups == nil {
		data.UserSignups = []DayCount{}
	}
	if data.SimuladoAttempts == nil {
		data.SimuladoAttempts = []DayCount{}
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"days":             days,
		"userSignups":      data.UserSignups,
		"simuladoAttempts": data.SimuladoAttempts,
	})
}
