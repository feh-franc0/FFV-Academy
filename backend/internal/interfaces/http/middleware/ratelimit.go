package middleware

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	goredis "github.com/redis/go-redis/v9"

	"github.com/fernandofv/api/internal/interfaces/http/httputil"
)

// RateLimiter limita requests por chave (geralmente IP) dentro de uma janela.
// Fixed-window simples via Redis INCR+EXPIRE — suficiente para proteção DoS
// de endpoints públicos, sem exigir estruturas sliding-window mais complexas.
type RateLimiter struct {
	client     *goredis.Client
	limit      int
	window     time.Duration
	prefix     string
	failClosed bool
}

// NewRateLimiter cria um middleware de rate-limit que falha ABERTO em erro de
// Redis (serve o request sem limite) — apropriado para rotas de leitura
// barata. Para rotas de custo (auth, tutor), use NewRateLimiterFailClosed.
//   - limit: máximo de requests por janela.
//   - window: duração da janela (ex: 1min).
//   - prefix: namespace da chave Redis (ex: "ratelimit:auth").
func NewRateLimiter(client *goredis.Client, limit int, window time.Duration, prefix string) *RateLimiter {
	return &RateLimiter{client: client, limit: limit, window: window, prefix: prefix, failClosed: false}
}

// NewRateLimiterFailClosed cria um rate-limit que RECUSA o request em erro de
// Redis, em vez de servir sem limite. Uso: rotas de custo (auth, tutor) onde
// um Redis fora do ar não pode virar "sem defesa nenhuma" — combinado com o
// rate-limit por email/usuário (também Redis), derrubar o Redis não pode
// remover TODAS as camadas de proteção de uma vez.
func NewRateLimiterFailClosed(client *goredis.Client, limit int, window time.Duration, prefix string) *RateLimiter {
	return &RateLimiter{client: client, limit: limit, window: window, prefix: prefix, failClosed: true}
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
				if rl.failClosed {
					// Rota de custo: Redis fora não pode significar "sem defesa
					// nenhuma". Recusa em vez de servir sem limite.
					httputil.WriteError(w, http.StatusServiceUnavailable, "rate limit indisponível — tente novamente em instantes", "rate-limit-unavailable")
					return
				}
				// Fail-open em erro de Redis: servir o request é melhor do que 500
				// generalizado em incidente de infra, em rotas de leitura barata.
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
// ExpireNX define o TTL apenas quando a chave é criada pela primeira vez (count==1).
// Isso implementa uma fixed-window real: a janela fecha exatamente em `window` a partir
// do primeiro request, sem ser estendida por requests subsequentes.
// Usar Expire em vez de ExpireNX reiniciaria o TTL a cada request, permitindo que
// atacantes persistentes mantivessem a janela viva indefinidamente.
func (rl *RateLimiter) check(ctx context.Context, key string) (bool, int, int, error) {
	pipe := rl.client.TxPipeline()
	incr := pipe.Incr(ctx, key)
	pipe.ExpireNX(ctx, key, rl.window)
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
// X-Real-IP/X-Forwarded-For só são respeitados quando o request chega de um IP
// de proxy privado/loopback confiável — evita que atacantes forjem o header
// para bypassar rate limit.
//
// X-Real-IP é preferido a X-Forwarded-For: o nginx do repositório (ver
// deployments/nginx/conf.d/api.conf) SOBRESCREVE os dois com $remote_addr, mas
// X-Real-IP é sempre um único valor por construção — X-Forwarded-For é uma
// lista e, se algum proxy futuro voltar a usar $proxy_add_x_forwarded_for (que
// ANEXA ao valor enviado pelo cliente em vez de sobrescrever), o primeiro
// elemento volta a ser forjável pelo cliente. Usar X-Real-IP fecha essa classe
// de regressão sem depender de disciplina de configuração do proxy.
func clientIP(r *http.Request) string {
	return ClientIP(r)
}

// ClientIP extrai o IP real do cliente, considerando proxy confiável.
// Exportada para que handlers/dto.go (auditoria) use a MESMA lógica do
// rate-limit — duas implementações divergentes é como o achado original
// nasceu: dto.go confiava em X-Forwarded-For sem checar se o request vinha
// de um proxy confiável.
func ClientIP(r *http.Request) string {
	remoteIP, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		remoteIP = r.RemoteAddr
	}
	if isTrustedProxy(remoteIP) {
		if xr := r.Header.Get("X-Real-IP"); xr != "" {
			return xr
		}
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			parts := strings.Split(xff, ",")
			return strings.TrimSpace(parts[len(parts)-1])
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
