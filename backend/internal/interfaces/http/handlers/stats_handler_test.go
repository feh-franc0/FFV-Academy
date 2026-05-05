// Package handlers — testes unitários do StatsHandler.
//
// PADRÃO: Contract tests com httptest — sem Docker, sem DB.
// A interface StatsRepository é mockada inline.
package handlers_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// ─── Mock do repositório de stats ────────────────────────────────────────────

type mockStatsRepo struct {
	stats handlers.PlatformStats
	err   error
}

func (m *mockStatsRepo) GetStats(_ context.Context) (handlers.PlatformStats, error) {
	return m.stats, m.err
}

// compile-time check: mock implementa a interface.
var _ handlers.StatsRepository = (*mockStatsRepo)(nil)

// ─── Testes ───────────────────────────────────────────────────────────────────

// Test 1: GET /stats com dados → 200, JSON com campos esperados
func Test_StatsHandler_GetPublic_Returns200(t *testing.T) {
	repo := &mockStatsRepo{
		stats: handlers.PlatformStats{
			TotalUsers:     1234,
			ActiveWeekly:   89,
			TotalXPAwarded: 500000,
		},
	}
	h := handlers.NewStatsHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/stats", nil)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var dto handlers.PlatformStatsDTO
	if err := json.NewDecoder(w.Body).Decode(&dto); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	if dto.TotalUsers != 1234 {
		t.Errorf("esperado totalUsers=1234, got %d", dto.TotalUsers)
	}
	if dto.ActiveWeekly != 89 {
		t.Errorf("esperado activeWeekly=89, got %d", dto.ActiveWeekly)
	}
	if dto.TotalXPAwarded != 500000 {
		t.Errorf("esperado totalXpAwarded=500000, got %d", dto.TotalXPAwarded)
	}
}

// Test 2: GET /stats com erro no repo → não deve retornar 200
func Test_StatsHandler_GetPublic_RepoError_ReturnsError(t *testing.T) {
	repo := &mockStatsRepo{err: errors.New("db unavailable")}
	h := handlers.NewStatsHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/stats", nil)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	if w.Code == http.StatusOK {
		t.Fatal("esperado status de erro quando repo falha, got 200")
	}
}

// Test 3: Cache-Control header deve estar presente na resposta
func Test_StatsHandler_GetPublic_SetsCacheControlHeader(t *testing.T) {
	repo := &mockStatsRepo{}
	h := handlers.NewStatsHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/stats", nil)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	cc := w.Header().Get("Cache-Control")
	if cc == "" {
		t.Error("esperado Cache-Control header, mas estava vazio")
	}
}

// Test 4: GET /stats com dados zerados → 200, campos zerados
func Test_StatsHandler_GetPublic_ZeroValues_Returns200(t *testing.T) {
	repo := &mockStatsRepo{stats: handlers.PlatformStats{}}
	h := handlers.NewStatsHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/stats", nil)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200 com stats zeradas, got %d: %s", w.Code, w.Body.String())
	}

	var dto handlers.PlatformStatsDTO
	if err := json.NewDecoder(w.Body).Decode(&dto); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	if dto.TotalUsers != 0 || dto.ActiveWeekly != 0 || dto.TotalXPAwarded != 0 {
		t.Errorf("esperado zeros, got %+v", dto)
	}
}
