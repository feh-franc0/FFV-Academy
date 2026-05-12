// Package contract — testes de contrato HTTP do endpoint GET /api/v1/features.
//
// PADRÃO: Contract tests testam o formato da resposta HTTP (status, headers, body)
// isolando os handlers de suas dependências. Endpoint é público — sem auth.
package contract_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/config"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// Test 1: rota é alcançável sem autenticação (endpoint público).
func Test_FeaturesHandler_Get_NoAuth_Returns200(t *testing.T) {
	h := handlers.NewFeaturesHandler(config.FeaturesConfig{})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/features", http.NoBody)
	// Sem header Authorization — o endpoint é público.
	rec := httptest.NewRecorder()

	h.Get(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Header().Get("Content-Type"), "json")
}

// Test 2: response tem o shape JSON esperado (200 + 3 chaves boolean).
func Test_FeaturesHandler_Get_ReturnsExpectedJSONShape(t *testing.T) {
	h := handlers.NewFeaturesHandler(config.FeaturesConfig{
		BillingEnabled:   true,
		TutorAIEnabled:   false,
		PhoneAuthEnabled: true,
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/features", http.NoBody)
	rec := httptest.NewRecorder()
	h.Get(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)

	var body map[string]bool
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))

	// Exatamente 3 chaves.
	assert.Len(t, body, 3, "esperado exatamente 3 feature flags no payload")
}

// Test 3: chaves do JSON usam snake_case conforme contrato com o frontend.
func Test_FeaturesHandler_Get_UsesSnakeCaseKeys(t *testing.T) {
	h := handlers.NewFeaturesHandler(config.FeaturesConfig{})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/features", http.NoBody)
	rec := httptest.NewRecorder()
	h.Get(rec, req)

	var body map[string]bool
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))

	// Garante o contrato exato com o frontend Next.js.
	_, hasBilling := body["billing_enabled"]
	_, hasTutor := body["tutor_ai_enabled"]
	_, hasPhone := body["phone_auth_enabled"]

	assert.True(t, hasBilling, "payload deve conter chave snake_case 'billing_enabled'")
	assert.True(t, hasTutor, "payload deve conter chave snake_case 'tutor_ai_enabled'")
	assert.True(t, hasPhone, "payload deve conter chave snake_case 'phone_auth_enabled'")
}

// Test 4: response respeita as feature flags configuradas.
func Test_FeaturesHandler_Get_RespectsConfiguredFlags(t *testing.T) {
	cases := []struct {
		name string
		cfg  config.FeaturesConfig
	}{
		{
			name: "all_disabled",
			cfg:  config.FeaturesConfig{},
		},
		{
			name: "all_enabled",
			cfg: config.FeaturesConfig{
				BillingEnabled:   true,
				TutorAIEnabled:   true,
				PhoneAuthEnabled: true,
			},
		},
		{
			name: "only_billing",
			cfg:  config.FeaturesConfig{BillingEnabled: true},
		},
		{
			name: "only_tutor",
			cfg:  config.FeaturesConfig{TutorAIEnabled: true},
		},
		{
			name: "only_phone_auth",
			cfg:  config.FeaturesConfig{PhoneAuthEnabled: true},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			h := handlers.NewFeaturesHandler(tc.cfg)

			req := httptest.NewRequest(http.MethodGet, "/api/v1/features", http.NoBody)
			rec := httptest.NewRecorder()
			h.Get(rec, req)

			require.Equal(t, http.StatusOK, rec.Code)

			var body map[string]bool
			require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))

			assert.Equal(t, tc.cfg.BillingEnabled, body["billing_enabled"])
			assert.Equal(t, tc.cfg.TutorAIEnabled, body["tutor_ai_enabled"])
			assert.Equal(t, tc.cfg.PhoneAuthEnabled, body["phone_auth_enabled"])

			// Cache-Control deve estar setado em qualquer configuração.
			assert.Equal(t, "public, max-age=60", rec.Header().Get("Cache-Control"))
		})
	}
}
