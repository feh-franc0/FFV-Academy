// Package contract — testes de contrato HTTP do endpoint /api/v1/me/preferences.
//
// PADRÃO: contract tests sobem o handler com use cases reais + mock repo,
// chamam via httptest.NewRecorder e verificam status, headers, formato do
// JSON, valores de campo. Não precisam de Docker.
//
// O middleware Authenticate NÃO é exercitado aqui — injetamos o userID
// diretamente no Context via CtxKeyUserID, simulando que o middleware já
// passou. Auth gating em si é testado em test/security/auth_bypass_test.go.
package contract_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	apppref "github.com/fernandofv/api/internal/application/preferences"
	dompref "github.com/fernandofv/api/internal/domain/preferences"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// --- Mock repo (igual ao do unit test, replicado pra evitar dependência cross-package) ---

type stubPrefRepo struct {
	byUser    map[shared.UserID]*dompref.Preferences
	upserts   int
	upsertErr error
	findErr   error
}

func newStubPrefRepo() *stubPrefRepo {
	return &stubPrefRepo{byUser: make(map[shared.UserID]*dompref.Preferences)}
}

func (m *stubPrefRepo) FindByUser(_ context.Context, id shared.UserID) (*dompref.Preferences, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	if p, ok := m.byUser[id]; ok {
		return p, nil
	}
	return nil, shared.ErrNotFound
}
func (m *stubPrefRepo) Upsert(_ context.Context, p *dompref.Preferences) error {
	m.upserts++
	if m.upsertErr != nil {
		return m.upsertErr
	}
	m.byUser[p.UserID()] = p
	return nil
}
func (m *stubPrefRepo) DeleteByUser(_ context.Context, id shared.UserID) error {
	delete(m.byUser, id)
	return nil
}

func buildHandler(repo *stubPrefRepo) *handlers.PreferencesHandler {
	clk := shared.FixedClock{T: time.Date(2026, 5, 16, 12, 0, 0, 0, time.UTC)}
	getUC := apppref.NewGetPreferencesUseCase(repo, clk)
	updateUC := apppref.NewUpdatePreferencesUseCase(repo, clk)
	return handlers.NewPreferencesHandler(getUC, updateUC)
}

// authedRequest cria um httptest.Request com userID injetado no Context
// (simulando que middleware.Authenticate já passou).
func authedRequest(method, path string, body []byte, userID shared.UserID) *http.Request {
	var bodyReader *bytes.Reader
	if body != nil {
		bodyReader = bytes.NewReader(body)
	}
	var req *http.Request
	if bodyReader != nil {
		req = httptest.NewRequest(method, path, bodyReader)
	} else {
		req = httptest.NewRequest(method, path, http.NoBody)
	}
	ctx := context.WithValue(req.Context(), middleware.CtxKeyUserID, userID)
	return req.WithContext(ctx)
}

// ─── GET /api/v1/me/preferences ─────────────────────────────────────────

func Test_PreferencesHandler_Get_FirstTime_Returns200_DefaultEmpty(t *testing.T) {
	repo := newStubPrefRepo()
	h := buildHandler(repo)

	req := authedRequest(http.MethodGet, "/api/v1/me/preferences", nil, "user-1")
	rec := httptest.NewRecorder()
	h.Get(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Header().Get("Content-Type"), "json")

	var body map[string]interface{}
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))

	assert.Equal(t, false, body["onboarded"], "primeira visita = não onboarded")
	assert.Equal(t, true, body["dailyQuestionEnabled"], "default true")
	assert.Equal(t, "", body["skillLevel"], "skill ainda não respondido")
	assert.Equal(t, []interface{}{}, body["hubIds"])
	assert.Equal(t, []interface{}{}, body["certificationIds"])

	// IDEMPOTÊNCIA: GET nunca escreve.
	assert.Equal(t, 0, repo.upserts, "GET não deve escrever no repo")
}

func Test_PreferencesHandler_Get_Existing_ReturnsPersistedShape(t *testing.T) {
	repo := newStubPrefRepo()
	// Setup direto no repo (simula persistência prévia).
	clk := shared.FixedClock{T: time.Date(2026, 5, 16, 12, 0, 0, 0, time.UTC)}
	p := dompref.New("user-1", clk.Now().Add(-24*time.Hour))
	hubs := []string{"hub-aws", "hub-ia"}
	certs := []string{"aws-clf"}
	_ = p.Update(dompref.UpdateCommand{HubIDs: &hubs, CertificationIDs: &certs}, clk.Now().Add(-24*time.Hour))
	repo.byUser["user-1"] = p

	h := buildHandler(repo)
	req := authedRequest(http.MethodGet, "/api/v1/me/preferences", nil, "user-1")
	rec := httptest.NewRecorder()
	h.Get(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)

	var body map[string]interface{}
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))

	assert.Equal(t, true, body["onboarded"])
	hubsResp := body["hubIds"].([]interface{})
	assert.Len(t, hubsResp, 2, "esperado 2 hubs")
	assert.NotEmpty(t, body["onboardedAt"], "onboardedAt deve aparecer no JSON")
}

// ─── PUT /api/v1/me/preferences ─────────────────────────────────────────

func Test_PreferencesHandler_Update_ValidBody_Returns200_Persists(t *testing.T) {
	repo := newStubPrefRepo()
	h := buildHandler(repo)

	payload, _ := json.Marshal(map[string]interface{}{
		"hubIds":     []string{"hub-aws", "hub-ia"},
		"skillLevel": "intermediate",
		"objectives": []string{"certifications", "career_growth"},
	})
	req := authedRequest(http.MethodPut, "/api/v1/me/preferences", payload, "user-1")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.Update(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, 1, repo.upserts, "esperado 1 upsert")

	var body map[string]interface{}
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))

	assert.Equal(t, true, body["onboarded"], "preferência substantiva = onboarded")
	assert.Equal(t, "intermediate", body["skillLevel"])

	hubs := body["hubIds"].([]interface{})
	// Domain ordena alfabeticamente.
	assert.Equal(t, []interface{}{"hub-aws", "hub-ia"}, hubs)
}

func Test_PreferencesHandler_Update_MalformedJSON_Returns400(t *testing.T) {
	repo := newStubPrefRepo()
	h := buildHandler(repo)

	req := authedRequest(http.MethodPut, "/api/v1/me/preferences",
		[]byte(`{"hubIds": [malformed`), "user-1")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.Update(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Equal(t, 0, repo.upserts, "nada deve ser persistido com body malformado")
}

func Test_PreferencesHandler_Update_InvalidObjective_Returns400(t *testing.T) {
	repo := newStubPrefRepo()
	h := buildHandler(repo)

	payload, _ := json.Marshal(map[string]interface{}{
		"objectives": []string{"certifications", "hack-system"},
	})
	req := authedRequest(http.MethodPut, "/api/v1/me/preferences", payload, "user-1")
	rec := httptest.NewRecorder()
	h.Update(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code,
		"objective inválido = 400 (validação de domínio mapeia pra 400)")
	assert.Equal(t, 0, repo.upserts)
}

func Test_PreferencesHandler_Update_InvalidSkillLevel_Returns400(t *testing.T) {
	repo := newStubPrefRepo()
	h := buildHandler(repo)

	payload, _ := json.Marshal(map[string]interface{}{
		"skillLevel": "god-tier",
	})
	req := authedRequest(http.MethodPut, "/api/v1/me/preferences", payload, "user-1")
	rec := httptest.NewRecorder()
	h.Update(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_PreferencesHandler_Update_TooManyHubs_Returns400(t *testing.T) {
	repo := newStubPrefRepo()
	h := buildHandler(repo)

	// MaxHubIDs + 1 = 17 — domain rejeita.
	hubs := make([]string, dompref.MaxHubIDs+1)
	for i := range hubs {
		hubs[i] = "hub-" + string(rune('a'+i%26))
	}
	payload, _ := json.Marshal(map[string]interface{}{"hubIds": hubs})
	req := authedRequest(http.MethodPut, "/api/v1/me/preferences", payload, "user-1")
	rec := httptest.NewRecorder()
	h.Update(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code,
		"lista oversize = 400")
}

func Test_PreferencesHandler_Update_RepoFailure_Returns500(t *testing.T) {
	repo := newStubPrefRepo()
	repo.upsertErr = errors.New("simulated db failure")
	h := buildHandler(repo)

	payload, _ := json.Marshal(map[string]interface{}{
		"hubIds": []string{"hub-ia"},
	})
	req := authedRequest(http.MethodPut, "/api/v1/me/preferences", payload, "user-1")
	rec := httptest.NewRecorder()
	h.Update(rec, req)

	assert.Equal(t, http.StatusInternalServerError, rec.Code,
		"falha de repo = 500 (não 4xx)")
}

func Test_PreferencesHandler_Update_PreservesUntouchedFields(t *testing.T) {
	repo := newStubPrefRepo()
	h := buildHandler(repo)

	// Primeiro PUT define hubs.
	payload1, _ := json.Marshal(map[string]interface{}{
		"hubIds": []string{"hub-aws"},
	})
	req1 := authedRequest(http.MethodPut, "/api/v1/me/preferences", payload1, "user-1")
	rec1 := httptest.NewRecorder()
	h.Update(rec1, req1)
	require.Equal(t, http.StatusOK, rec1.Code)

	// Segundo PUT muda APENAS skillLevel — hubs devem ser preservados.
	payload2, _ := json.Marshal(map[string]interface{}{
		"skillLevel": "advanced",
	})
	req2 := authedRequest(http.MethodPut, "/api/v1/me/preferences", payload2, "user-1")
	rec2 := httptest.NewRecorder()
	h.Update(rec2, req2)
	require.Equal(t, http.StatusOK, rec2.Code)

	var body map[string]interface{}
	require.NoError(t, json.NewDecoder(rec2.Body).Decode(&body))

	hubs := body["hubIds"].([]interface{})
	assert.Equal(t, []interface{}{"hub-aws"}, hubs, "hub deve ser preservado")
	assert.Equal(t, "advanced", body["skillLevel"])
}
