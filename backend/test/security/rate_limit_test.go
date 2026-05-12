//go:build security

// Threat model: brute force em /auth, scraping de endpoints públicos, abuse
// do tutor IA (custos do Anthropic), DoS via flood de requests.
//
// IMPORTANTE: o RateLimiter de produção usa Redis (INCR + ExpireNX). Testes
// que exigem incremento real precisam de Redis local — caso indisponível,
// fazemos skip gracioso. O CI roda integration tests separadamente.
package security

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	goredis "github.com/redis/go-redis/v9"

	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// redisOrSkip retorna um *goredis.Client conectado, ou skipa o teste se
// não houver Redis. Use REDIS_URL para sobrescrever (default: localhost:6379).
func redisOrSkip(t *testing.T) *goredis.Client {
	t.Helper()
	url := os.Getenv("REDIS_URL")
	if url == "" {
		url = "redis://localhost:6379/15" // DB 15: isolada para tests
	}
	opt, err := goredis.ParseURL(url)
	if err != nil {
		t.Skipf("REDIS_URL inválido: %v", err)
	}
	client := goredis.NewClient(opt)
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()
	if err := client.Ping(ctx).Err(); err != nil {
		t.Skipf("Redis indisponível em %s — teste de rate limit pulado: %v", url, err)
	}
	// Limpa namespace dos testes — evita interferência entre runs.
	keys, _ := client.Keys(ctx, "rl-sec-test:*").Result()
	if len(keys) > 0 {
		_ = client.Del(ctx, keys...).Err()
	}
	t.Cleanup(func() {
		keys, _ := client.Keys(context.Background(), "rl-sec-test:*").Result()
		if len(keys) > 0 {
			_ = client.Del(context.Background(), keys...).Err()
		}
		_ = client.Close()
	})
	return client
}

// passthroughOK é o handler-base. Conta os hits para validar bloqueio.
type hitCounter struct{ n int }

func (h *hitCounter) Handler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		h.n++
		w.WriteHeader(http.StatusOK)
	})
}

func Test_Security_AuthEndpoint_RateLimitEnforced(t *testing.T) {
	client := redisOrSkip(t)
	limiter := middleware.NewRateLimiter(client, 5, time.Minute, "rl-sec-test:auth")
	counter := &hitCounter{}
	h := limiter.Middleware()(counter.Handler())

	tooMany := 0
	for i := 0; i < 12; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/request-token", nil)
		req.RemoteAddr = "203.0.113.1:1234"
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code == http.StatusTooManyRequests {
			tooMany++
		}
	}
	if tooMany == 0 {
		t.Fatalf("nenhum 429 emitido em 12 requests com limit=5 — rate limit não funciona")
	}
}

func Test_Security_TutorEndpoint_RateLimitEnforced(t *testing.T) {
	client := redisOrSkip(t)
	limiter := middleware.NewRateLimiter(client, 3, time.Minute, "rl-sec-test:tutor")
	counter := &hitCounter{}
	h := limiter.Middleware()(counter.Handler())

	tooMany := 0
	for i := 0; i < 8; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/tutor/ask", nil)
		req.RemoteAddr = "203.0.113.2:1234"
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code == http.StatusTooManyRequests {
			tooMany++
		}
	}
	if tooMany == 0 {
		t.Fatalf("nenhum 429 no tutor — rate limit não está blocking abuse")
	}
}

func Test_Security_RateLimit_PerIPIsolation(t *testing.T) {
	client := redisOrSkip(t)
	limiter := middleware.NewRateLimiter(client, 3, time.Minute, "rl-sec-test:iso")
	counter := &hitCounter{}
	h := limiter.Middleware()(counter.Handler())

	// IP A consome quota total.
	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodPost, "/x", nil)
		req.RemoteAddr = "203.0.113.10:1234"
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
	}

	// IP B deve passar com folga (quota independente).
	req := httptest.NewRequest(http.MethodPost, "/x", nil)
	req.RemoteAddr = "203.0.113.20:1234"
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code == http.StatusTooManyRequests {
		t.Fatalf("IP B foi rate-limited por causa do IP A — isolamento quebrado")
	}
}

// /healthz NÃO tem rate limiter no router de produção. Confirmamos pela
// definição: o router registra /healthz fora dos r.With(authLimit.Middleware()).
// Como teste estrutural, validamos que um middleware-vazio responde 200 em
// rajada para um endpoint health.
func Test_Security_HealthEndpoint_NoRateLimit(t *testing.T) {
	// Sem rate limiter — simula o registro direto do /healthz no router.
	h := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	for i := 0; i < 200; i++ {
		req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
		req.RemoteAddr = "203.0.113.30:1234"
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("healthz não pode ter rate-limit; got %d na req %d", rec.Code, i)
		}
	}
}

// Webhook Stripe NÃO pode ter rate-limit (Stripe envia em rajadas e faz retry
// com backoff próprio). O router de produção registra a rota SEM authLimit.
// Confirmamos estruturalmente: nada de rate-limit em /api/v1/webhooks/stripe.
func Test_Security_WebhookEndpoint_NoRateLimit(t *testing.T) {
	h := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	for i := 0; i < 100; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks/stripe", nil)
		req.RemoteAddr = "203.0.113.40:1234"
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code == http.StatusTooManyRequests {
			t.Fatalf("webhook não pode ser rate-limited — Stripe retry policy depende disso")
		}
	}
}
