// Package handlers — testes unitários do LeaderboardHandler.
//
// PADRÃO: Contract tests com httptest — sem Docker, sem DB.
// Dependências são substituídas por mocks inline (structs locais).
// Testamos status HTTP, headers e formato da resposta JSON.
package handlers_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	domleaderboard "github.com/fernandofv/api/internal/domain/leaderboard"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// ─── Mock do repositório de leaderboard ──────────────────────────────────────

// mockLeaderboardRepo implementa domleaderboard.Repository para testes.
// Todos os métodos são configuráveis via campos; os não usados retornam zero.
type mockLeaderboardRepo struct {
	weeklyEntries        []domleaderboard.RankEntry
	weeklyErr            error
	periodEntries        []domleaderboard.RankEntry
	periodErr            error
	userRank             int
	userRankErr          error
	userRankByPeriodRank int
	userRankByPeriodXP   int
	userRankByPeriodErr  error
	optedIn              bool
	optedInErr           error
}

func (m *mockLeaderboardRepo) UpsertXP(_ context.Context, _ shared.UserID, _ time.Time, _ int) error {
	return nil
}

func (m *mockLeaderboardRepo) GetWeekly(_ context.Context, _ time.Time, _ int) ([]domleaderboard.RankEntry, error) {
	return m.weeklyEntries, m.weeklyErr
}

func (m *mockLeaderboardRepo) GetUserRank(_ context.Context, _ shared.UserID, _ time.Time) (int, error) {
	return m.userRank, m.userRankErr
}

func (m *mockLeaderboardRepo) GetByPeriod(_ context.Context, _ domleaderboard.Period, _ time.Time, _ int) ([]domleaderboard.RankEntry, error) {
	return m.periodEntries, m.periodErr
}

func (m *mockLeaderboardRepo) GetUserRankByPeriod(_ context.Context, _ shared.UserID, _ domleaderboard.Period, _ time.Time) (int, int, error) {
	return m.userRankByPeriodRank, m.userRankByPeriodXP, m.userRankByPeriodErr
}

func (m *mockLeaderboardRepo) SetOptIn(_ context.Context, _ shared.UserID, _ bool) error {
	return nil
}

func (m *mockLeaderboardRepo) IsOptedIn(_ context.Context, _ shared.UserID) (bool, error) {
	return m.optedIn, m.optedInErr
}

// compile-time check: mock implementa a interface completa.
var _ domleaderboard.Repository = (*mockLeaderboardRepo)(nil)

// ─── Testes de GetWeekly ─────────────────────────────────────────────────────

// Test 1: GET /leaderboard com repo vazio → 200 com entries []
func Test_LeaderboardHandler_GetWeekly_EmptyRepo_Returns200(t *testing.T) {
	repo := &mockLeaderboardRepo{}
	h := handlers.NewLeaderboardHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard", http.NoBody)
	w := httptest.NewRecorder()
	h.GetWeekly(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	if _, ok := resp["entries"]; !ok {
		t.Error("resposta sem campo 'entries'")
	}
	if _, ok := resp["weekStart"]; !ok {
		t.Error("resposta sem campo 'weekStart'")
	}
	if _, ok := resp["total"]; !ok {
		t.Error("resposta sem campo 'total'")
	}
}

// Test 2: GET /leaderboard com entradas → 200, entries preenchido
func Test_LeaderboardHandler_GetWeekly_WithEntries_Returns200(t *testing.T) {
	uid := shared.NewUserID()
	repo := &mockLeaderboardRepo{
		weeklyEntries: []domleaderboard.RankEntry{
			{UserID: uid, DisplayName: "Ana Silva", XPGained: 1500, Rank: 1},
			{UserID: shared.NewUserID(), DisplayName: "Bruno Costa", XPGained: 900, Rank: 2},
		},
	}
	h := handlers.NewLeaderboardHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard", http.NoBody)
	w := httptest.NewRecorder()
	h.GetWeekly(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	entries, ok := resp["entries"].([]interface{})
	if !ok {
		t.Fatal("'entries' não é array")
	}
	if len(entries) != 2 {
		t.Fatalf("esperado 2 entries, got %d", len(entries))
	}

	// Verifica que total bate com len(entries)
	total, ok := resp["total"].(float64)
	if !ok {
		t.Fatal("'total' ausente ou tipo incorreto")
	}
	if int(total) != 2 {
		t.Fatalf("esperado total=2, got %v", total)
	}
}

// Test 3: GET /leaderboard com erro no repo → não deve retornar 200
func Test_LeaderboardHandler_GetWeekly_RepoError_Returns5xx(t *testing.T) {
	repo := &mockLeaderboardRepo{
		weeklyErr: errors.New("db unavailable"),
	}
	h := handlers.NewLeaderboardHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard", http.NoBody)
	w := httptest.NewRecorder()
	h.GetWeekly(w, req)

	if w.Code == http.StatusOK {
		t.Fatal("esperado status de erro, got 200")
	}
}

// ─── Testes de GetPublic ─────────────────────────────────────────────────────

// Test 4: GET /leaderboard/public sem ?period → default weekly, 200
func Test_LeaderboardHandler_GetPublic_DefaultPeriod_Returns200(t *testing.T) {
	repo := &mockLeaderboardRepo{
		periodEntries: []domleaderboard.RankEntry{
			{UserID: shared.NewUserID(), DisplayName: "Carol", XPGained: 800, Rank: 1},
		},
	}
	h := handlers.NewLeaderboardHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard/public", http.NoBody)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	period, _ := resp["period"].(string)
	if period != "weekly" {
		t.Errorf("esperado period='weekly', got %q", period)
	}
	if _, ok := resp["periodStart"]; !ok {
		t.Error("resposta sem campo 'periodStart'")
	}
	if _, ok := resp["periodEnd"]; !ok {
		t.Error("resposta sem campo 'periodEnd'")
	}
	if _, ok := resp["entries"]; !ok {
		t.Error("resposta sem campo 'entries'")
	}
}

// Test 5: GET /leaderboard/public?period=monthly → retorna period=monthly
func Test_LeaderboardHandler_GetPublic_MonthlyPeriod_Returns200(t *testing.T) {
	repo := &mockLeaderboardRepo{
		periodEntries: []domleaderboard.RankEntry{},
	}
	h := handlers.NewLeaderboardHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard/public?period=monthly", http.NoBody)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	period, _ := resp["period"].(string)
	if period != "monthly" {
		t.Errorf("esperado period='monthly', got %q", period)
	}
}

// Test 6: GET /leaderboard/public?period=invalido → fallback para weekly
func Test_LeaderboardHandler_GetPublic_InvalidPeriod_FallsBackToWeekly(t *testing.T) {
	repo := &mockLeaderboardRepo{}
	h := handlers.NewLeaderboardHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard/public?period=invalido", http.NoBody)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	period, _ := resp["period"].(string)
	if period != "weekly" {
		t.Errorf("período inválido deve cair em 'weekly', got %q", period)
	}
}

// Test 7: GET /leaderboard/public?period=all-time → periodStart vazio (PeriodAllTime tem start zero)
func Test_LeaderboardHandler_GetPublic_AllTime_PeriodStartEmpty(t *testing.T) {
	repo := &mockLeaderboardRepo{}
	h := handlers.NewLeaderboardHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard/public?period=all-time", http.NoBody)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	periodStart, _ := resp["periodStart"].(string)
	if periodStart != "" {
		t.Errorf("all-time deve ter periodStart vazio, got %q", periodStart)
	}
}

// Test 8: GET /leaderboard/public?limit=5 → limita resposta
func Test_LeaderboardHandler_GetPublic_LimitParam_AcceptsValidLimit(t *testing.T) {
	repo := &mockLeaderboardRepo{
		periodEntries: []domleaderboard.RankEntry{
			{UserID: shared.NewUserID(), DisplayName: "User1", XPGained: 500, Rank: 1},
		},
	}
	h := handlers.NewLeaderboardHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard/public?limit=5", http.NoBody)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}
}

// Test 9: Endpoint público não deve expor UserID nas entradas
func Test_LeaderboardHandler_GetPublic_DoesNotExposeUserID(t *testing.T) {
	uid := shared.NewUserID()
	repo := &mockLeaderboardRepo{
		periodEntries: []domleaderboard.RankEntry{
			{UserID: uid, DisplayName: "Privado", XPGained: 1000, Rank: 1},
		},
	}
	h := handlers.NewLeaderboardHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard/public", http.NoBody)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	entries, _ := resp["entries"].([]interface{})
	if len(entries) == 0 {
		t.Fatal("esperado ao menos 1 entry")
	}

	entry, _ := entries[0].(map[string]interface{})
	userID, _ := entry["userId"].(string)
	if userID != "" {
		t.Errorf("endpoint público não deve expor userId, got %q", userID)
	}
}

// Test 10: GET /leaderboard/public com Cache-Control no response header
func Test_LeaderboardHandler_GetPublic_SetsCacheControlHeader(t *testing.T) {
	repo := &mockLeaderboardRepo{}
	h := handlers.NewLeaderboardHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard/public", http.NoBody)
	w := httptest.NewRecorder()
	h.GetPublic(w, req)

	cc := w.Header().Get("Cache-Control")
	if cc == "" {
		t.Error("esperado Cache-Control header, mas estava vazio")
	}
}

// ─── Testes de GetMyRank ─────────────────────────────────────────────────────

// Test 11: GET /leaderboard/me com userID no contexto → 200 com rank
func Test_LeaderboardHandler_GetMyRank_AuthenticatedUser_Returns200(t *testing.T) {
	repo := &mockLeaderboardRepo{userRank: 3}
	h := handlers.NewLeaderboardHandler(repo)

	userID := shared.NewUserID()
	ctx := context.WithValue(context.Background(), middleware.CtxKeyUserID, userID)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard/me", http.NoBody).WithContext(ctx)
	w := httptest.NewRecorder()
	h.GetMyRank(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	rank, ok := resp["rank"].(float64)
	if !ok {
		t.Fatal("campo 'rank' ausente ou tipo incorreto")
	}
	if int(rank) != 3 {
		t.Errorf("esperado rank=3, got %v", rank)
	}
	if _, ok := resp["weekStart"]; !ok {
		t.Error("resposta sem campo 'weekStart'")
	}
}

// ─── Testes de GetMyRankAll ──────────────────────────────────────────────────

// Test 12: GET /leaderboard/me/all → 200 com ranks dos 4 períodos
func Test_LeaderboardHandler_GetMyRankAll_Returns200WithAllPeriods(t *testing.T) {
	repo := &mockLeaderboardRepo{
		userRankByPeriodRank: 5,
		userRankByPeriodXP:   200,
	}
	h := handlers.NewLeaderboardHandler(repo)

	userID := shared.NewUserID()
	ctx := context.WithValue(context.Background(), middleware.CtxKeyUserID, userID)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/leaderboard/me/all", http.NoBody).WithContext(ctx)
	w := httptest.NewRecorder()
	h.GetMyRankAll(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	ranks, ok := resp["ranks"].([]interface{})
	if !ok {
		t.Fatal("campo 'ranks' ausente ou não é array")
	}
	// 4 períodos: weekly, monthly, yearly, all-time
	if len(ranks) != 4 {
		t.Fatalf("esperado 4 períodos em 'ranks', got %d", len(ranks))
	}
}
