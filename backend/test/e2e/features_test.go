//go:build e2e

// Package e2e — testes end-to-end do endpoint público GET /api/v1/features.
//
// PADRÃO: sobe um servidor HTTP real via httptest.NewServer e exerce o
// endpoint pela rede (cliente HTTP real). Como o endpoint não depende de
// Postgres/Redis/Stripe, o bootstrap é minimalista — não há necessidade de
// testcontainers.
package e2e

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/config"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// newFeaturesServer sobe um servidor HTTP real com a rota /api/v1/features
// registrada exatamente como em internal/interfaces/http/router.go.
func newFeaturesServer(t *testing.T, cfg config.FeaturesConfig) *httptest.Server {
	t.Helper()
	r := chi.NewRouter()
	r.Get("/api/v1/features", handlers.NewFeaturesHandler(cfg).Get)
	srv := httptest.NewServer(r)
	t.Cleanup(srv.Close)
	return srv
}

// Test 1: happy path end-to-end — servidor real → GET /api/v1/features → 200 + JSON válido.
func Test_FeaturesEndpoint_E2E_HappyPath_Returns200AndJSON(t *testing.T) {
	srv := newFeaturesServer(t, config.FeaturesConfig{
		BillingEnabled:   false,
		TutorAIEnabled:   false,
		PhoneAuthEnabled: false,
	})

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(srv.URL + "/api/v1/features")
	require.NoError(t, err)
	defer func() { _ = resp.Body.Close() }()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Contains(t, resp.Header.Get("Content-Type"), "json")
	assert.Equal(t, "public, max-age=60", resp.Header.Get("Cache-Control"))

	raw, err := io.ReadAll(resp.Body)
	require.NoError(t, err)

	var body map[string]bool
	require.NoError(t, json.Unmarshal(raw, &body))

	// Shape do contrato com o frontend: 3 chaves snake_case boolean.
	require.Len(t, body, 3)
	_, hasBilling := body["billing_enabled"]
	_, hasTutor := body["tutor_ai_enabled"]
	_, hasPhone := body["phone_auth_enabled"]
	assert.True(t, hasBilling)
	assert.True(t, hasTutor)
	assert.True(t, hasPhone)
}

// Test 2: as flags refletem a configuração carregada no startup do servidor.
// Usamos config.LoadTest() como referência canônica do que o servidor real veria
// quando booted com APP_ENV=test, garantindo que mudanças em LoadTest fiquem
// alinhadas com o que o endpoint reporta.
func Test_FeaturesEndpoint_E2E_ReflectsLoadedConfig(t *testing.T) {
	loaded := config.LoadTest()
	srv := newFeaturesServer(t, loaded.Features)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(srv.URL + "/api/v1/features")
	require.NoError(t, err)
	defer func() { _ = resp.Body.Close() }()

	require.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]bool
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))

	assert.Equal(t, loaded.Features.BillingEnabled, body["billing_enabled"])
	assert.Equal(t, loaded.Features.TutorAIEnabled, body["tutor_ai_enabled"])
	assert.Equal(t, loaded.Features.PhoneAuthEnabled, body["phone_auth_enabled"])
}
