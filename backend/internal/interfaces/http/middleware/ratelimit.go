package middleware

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/fernandofv/api/internal/interfaces/http/httputil"
	goredis "github.com/redis/go-redis/v9"
)

// RateLimiter limita requests por chave (geralmente IP) dentro de uma janela.
// Fixed-window simples via Redis INCR+EXPIRE — suficiente para proteção DoS
// de endpoints públicos, sem exigir estruturas sliding-window mais complexas.
type RateLimiter struct {
	client *goredis.Client
	limit  int
	window time.Duration
	prefix string
}

// NewRateLimiter cria um middleware de rate-limit.
//   - limit: máximo de requests por janela.
//   - window: duração da janela (ex: 1min).
//   - prefix: namespace da chave Redis (ex: "ratelimit:auth").
func NewRateLimiter(client *goredis.Client, limit int, window time.Duration, prefix string) *RateLimiter {
	return &RateLimiter{client: client, limit: limit, window: window, prefix: prefix}
}

// Middleware retorna um handler HTTP que aplica o rate-limit baseado no IP.
// Chaves são isoladas por `prefix` — permite limits diferentes por endpoint.
func (rl *RateLimiter) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := clientIP(r)
			key := fmt.Sprintf("%s:%s", rl.prefix, ip)

			allowed, remaining, reset, err := rl.check(r.Context(), key)
			if err != nil {
				// Fail-open em erro de Redis: servir o request é melhor do que 500
				// generalizado em incidente de infra. O risco é compensado pelas
				// outras camadas (rate-limit por email em auth, por user em tutor).
				next.ServeHTTP(w, r)
				return
			}

			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", rl.limit))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
			w.Header().Set("X-RateLimit-Reset", fmt.Sprintf("%d", reset))

			if !allowed {
				w.Header().Set("Retry-After", fmt.Sprintf("%d", reset))
				httputil.WriteError(w, http.StatusTooManyRequests, "too many requests", "rate-limited")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// check incrementa o contador e retorna (allowed, remaining, reset_in_seconds).
func (rl *RateLimiter) check(ctx context.Context, key string) (bool, int, int, error) {
	pipe := rl.client.TxPipeline()
	incr := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, rl.window)
	if _, err := pipe.Exec(ctx); err != nil {
		return false, 0, 0, err
	}

	count := int(incr.Val())
	remaining := rl.limit - count
	if remaining < 0 {
		remaining = 0
	}

	ttl, err := rl.client.TTL(ctx, key).Result()
	if err != nil {
		ttl = rl.window
	}
	return count <= rl.limit, remaining, int(ttl.Seconds()), nil
}

// clientIP extrai o IP real do client.
// X-Forwarded-For só é respeitado quando o request chega de um IP de proxy
// privado/loopback — evita que atacantes forjem o header para bypassar rate limit.
func clientIP(r *http.Request) string {
	remoteIP, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		remoteIP = r.RemoteAddr
	}
	if isTrustedProxy(remoteIP) {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			parts := strings.Split(xff, ",")
			return strings.TrimSpace(parts[0])
		}
		if xr := r.Header.Get("X-Real-IP"); xr != "" {
			return xr
		}
	}
	return remoteIP
}

// isTrustedProxy retorna true para IPs de loopback e redes privadas RFC-1918/4193.
// Em produção o reverse proxy (nginx/Caddy) roda no mesmo host ou rede privada.
func isTrustedProxy(ip string) bool {
	parsed := net.ParseIP(ip)
	if parsed == nil {
		return false
	}
	private := []string{
		"127.0.0.0/8",    // loopback
		"::1/128",        // IPv6 loopback
		"10.0.0.0/8",     // RFC-1918
		"172.16.0.0/12",  // RFC-1918
		"192.168.0.0/16", // RFC-1918
		"fc00::/7",       // IPv6 ULA
	}
	for _, cidr := range private {
		_, network, err := net.ParseCIDR(cidr)
		if err != nil {
			continue
		}
		if network.Contains(parsed) {
			return true
		}
	}
	return false
}
