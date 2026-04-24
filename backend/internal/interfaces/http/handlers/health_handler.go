package handlers

import (
	"context"
	"net/http"
	"time"
)

// Pinger é qualquer dependência que pode ser verificada com um ping.
type Pinger interface {
	Ping(ctx context.Context) error
}

// HealthHandler expõe os endpoints de health check.
//
// PADRÃO: /healthz verifica apenas se o processo está vivo (liveness).
// /readyz verifica as dependências (readiness).
type HealthHandler struct {
	db    Pinger
	redis Pinger
}

func NewHealthHandler(db, redis Pinger) *HealthHandler {
	return &HealthHandler{db: db, redis: redis}
}

// Liveness responde 200 se o processo está vivo.
// GET /healthz
func (h *HealthHandler) Liveness(w http.ResponseWriter, _ *http.Request) {
	WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// Readiness verifica as dependências críticas.
// GET /readyz
func (h *HealthHandler) Readiness(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	checks := map[string]string{}
	allOK := true

	if err := h.db.Ping(ctx); err != nil {
		checks["postgres"] = "unhealthy: " + err.Error()
		allOK = false
	} else {
		checks["postgres"] = "ok"
	}

	if err := h.redis.Ping(ctx); err != nil {
		checks["redis"] = "unhealthy: " + err.Error()
		allOK = false
	} else {
		checks["redis"] = "ok"
	}

	status := http.StatusOK
	if !allOK {
		status = http.StatusServiceUnavailable
	}
	WriteJSON(w, status, map[string]interface{}{
		"status": map[bool]string{true: "ok", false: "degraded"}[allOK],
		"checks": checks,
	})
}
