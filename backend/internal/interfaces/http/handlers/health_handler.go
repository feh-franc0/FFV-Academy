// Package handlers — Health check endpoints do serviço.
//
// PADRÃO: /healthz (liveness) verifica apenas se o processo está vivo.
//         /readyz (readiness) verifica dependências externas e o circuit breaker.
//
// Kubernetes usa liveness para reiniciar pods travados e readiness para
// remover pods do load balancer quando dependências estão indisponíveis.
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

// CircuitBreakerChecker permite verificar o estado do circuit breaker sem
// depender diretamente do pacote postgres (evita ciclo de importação).
// O health handler verifica o estado via esta interface.
type CircuitBreakerChecker interface {
	// IsOpen retorna true se o circuito está aberto (banco inacessível).
	IsOpen() bool
}

// HealthHandler expõe os endpoints de health check.
//
// PADRÃO: /healthz verifica apenas se o processo está vivo (liveness).
// /readyz verifica as dependências (readiness) incluindo o circuit breaker.
type HealthHandler struct {
	db             Pinger
	redis          Pinger
	circuitBreaker CircuitBreakerChecker // opcional — nil desabilita a verificação
}

// NewHealthHandler cria o handler sem circuit breaker (compatibilidade retroativa).
func NewHealthHandler(db, redis Pinger) *HealthHandler {
	return &HealthHandler{db: db, redis: redis}
}

// WithCircuitBreaker injeta o circuit breaker do Postgres para verificação no /readyz.
// Chamado em main.go após criação do handler para não quebrar a assinatura existente.
func (h *HealthHandler) WithCircuitBreaker(cb CircuitBreakerChecker) *HealthHandler {
	h.circuitBreaker = cb
	return h
}

// Liveness responde 200 se o processo está vivo.
// GET /healthz — Kubernetes usa este endpoint para liveness probe.
func (h *HealthHandler) Liveness(w http.ResponseWriter, _ *http.Request) {
	WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// Readiness verifica as dependências críticas e o circuit breaker.
// GET /readyz — retorna 503 se qualquer dependência estiver indisponível.
//
// O circuit breaker aberto indica que o Postgres está instável — retornamos 503
// para que o load balancer redirecione o tráfego para instâncias saudáveis.
func (h *HealthHandler) Readiness(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	checks := map[string]string{}
	allOK := true

	// Verifica o circuit breaker ANTES de tentar pingar o banco.
	// Se o circuito está aberto, o banco está instável — não tentamos pingar
	// (evitamos acumular mais falhas durante um incidente).
	if h.circuitBreaker != nil && h.circuitBreaker.IsOpen() {
		checks["circuit_breaker"] = "open — postgres unreachable"
		allOK = false
	} else {
		checks["circuit_breaker"] = "closed"

		// Só pinga o Postgres se o circuito está fechado.
		if err := h.db.Ping(ctx); err != nil {
			checks["postgres"] = "unhealthy: " + err.Error()
			allOK = false
		} else {
			checks["postgres"] = "ok"
		}
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
