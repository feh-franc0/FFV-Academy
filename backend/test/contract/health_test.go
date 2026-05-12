// Package contract verifica o contrato HTTP dos handlers.
//
// PADRÃO: Contract tests testam o formato da resposta HTTP (status, headers, body)
// isolando os handlers de suas dependências via stubs.
package contract_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// --- Stubs ---

type healthyPinger struct{}

func (p *healthyPinger) Ping(_ context.Context) error { return nil }

// --- Tests ---

func Test_HealthHandler_Liveness_Returns200(t *testing.T) {
	h := handlers.NewHealthHandler(&healthyPinger{}, &healthyPinger{})

	req := httptest.NewRequest(http.MethodGet, "/healthz", http.NoBody)
	rec := httptest.NewRecorder()

	h.Liveness(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Header().Get("Content-Type"), "json")

	var body map[string]string
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))
	assert.Equal(t, "ok", body["status"])
}

func Test_HealthHandler_Readiness_AllHealthy_Returns200(t *testing.T) {
	h := handlers.NewHealthHandler(&healthyPinger{}, &healthyPinger{})

	req := httptest.NewRequest(http.MethodGet, "/readyz", http.NoBody)
	rec := httptest.NewRecorder()

	h.Readiness(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)

	var body map[string]interface{}
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))
	assert.Equal(t, "ok", body["status"])
}

type unhealthyPinger struct{}

func (p *unhealthyPinger) Ping(_ context.Context) error { return assert.AnError }

func Test_HealthHandler_Readiness_DBUnhealthy_Returns503(t *testing.T) {
	h := handlers.NewHealthHandler(&unhealthyPinger{}, &healthyPinger{})

	req := httptest.NewRequest(http.MethodGet, "/readyz", http.NoBody)
	rec := httptest.NewRecorder()

	h.Readiness(rec, req)

	assert.Equal(t, http.StatusServiceUnavailable, rec.Code)
}
