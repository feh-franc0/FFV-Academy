package middleware

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// ctxKeyRequestID é a chave de contexto para o request ID.
// Tipada para evitar colisão com outras chaves de contexto.
type ctxKeyRequestID struct{}

// RequestID injeta um UUID único no header X-Request-ID e no contexto de cada request.
// O ID é propagado para logs e traces — essential para correlacionar eventos de uma mesma request.
func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("X-Request-ID")
		if id == "" {
			id = uuid.NewString()
		}
		w.Header().Set("X-Request-ID", id)
		// Injeta no contexto para que use cases e repositórios possam logar com correlação.
		ctx := context.WithValue(r.Context(), ctxKeyRequestID{}, id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequestIDFromContext extrai o request ID do contexto.
// Retorna string vazia se não houver (requests fora do middleware pipeline).
func RequestIDFromContext(ctx context.Context) string {
	id, _ := ctx.Value(ctxKeyRequestID{}).(string)
	return id
}

// Logger loga cada request com método, path, status, duração e tamanho do body.
// O campo request_id correlaciona esta linha com logs de use cases e repositórios.
func Logger(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(rw, r)
			logger.Info("http request",
				"method", r.Method,
				"path", r.URL.Path,
				"status", rw.status,
				"duration_ms", time.Since(start).Milliseconds(),
				"request_id", w.Header().Get("X-Request-ID"),
				// Content-Length pode ser -1 se não informado — registrar para detectar uploads grandes.
				"content_length", r.ContentLength,
				"user_agent", r.UserAgent(),
			)
		})
	}
}

// RequestTimeout envolve cada request em um contexto com deadline.
// Se o handler não responder em d, o contexto é cancelado e o pgx/redis aborta
// operações em andamento automaticamente — evita goroutines presas por minutos.
//
// IMPORTANTE: O middleware apenas cancela o contexto; o próprio handler deve
// verificar ctx.Err() ou usar select. Handlers baseados em pgx e redis fazem
// isso automaticamente pois aceitam context.Context nas queries.
func RequestTimeout(d time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx, cancel := context.WithTimeout(r.Context(), d)
			defer cancel()
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// BodyLimit limita o tamanho máximo do corpo da request.
// Requests com body maior que maxBytes retornam 413 Request Entity Too Large.
//
// Diferente de http.MaxBytesReader aplicado por handler, este middleware é
// aplicado globalmente por grupo de rota no router — centraliza a política e
// evita esquecer em endpoints novos.
func BodyLimit(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Apenas requests com body (POST, PUT, PATCH) precisam de limitação.
			// GET, DELETE, HEAD, OPTIONS não têm body semanticamente significativo.
			if r.Method == http.MethodPost || r.Method == http.MethodPut || r.Method == http.MethodPatch {
				r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			}
			next.ServeHTTP(w, r)
		})
	}
}

// Recover captura panics e retorna 500 sem derrubar o servidor.
func Recover(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					logger.Error("panic recovered", "error", err, "path", r.URL.Path)
					http.Error(w, "internal server error", http.StatusInternalServerError)
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

// IsBodyTooLarge informa se o erro retornado pelo json.Decoder é de body que excedeu
// o limite do MaxBytesReader. Handlers usam isso para retornar 413 em vez de 400.
//
// O Go não fornece um tipo específico para este erro — comparamos a string.
// Ref: https://github.com/golang/go/blob/master/src/net/http/request.go
func IsBodyTooLarge(err error) bool {
	return err != nil && err.Error() == "http: request body too large"
}

// CORS configura os headers de Cross-Origin Resource Sharing.
func CORS(allowedOrigins []string) func(http.Handler) http.Handler {
	originsMap := make(map[string]struct{}, len(allowedOrigins))
	for _, o := range allowedOrigins {
		originsMap[o] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if _, ok := originsMap[origin]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Max-Age", "86400")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// SecurityHeaders adiciona headers de segurança recomendados.
// HSTS é emitido quando há TLS direto OU quando o proxy sinalizou HTTPS via
// X-Forwarded-Proto — cobre deploys atrás de nginx/Caddy que terminam TLS.
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=(self)")
		// COOP isola contexto JS — bloqueia ataques tipo Spectre via window.opener.
		// "same-origin-allow-popups" preserva fluxos OAuth/Stripe (popups legítimos).
		w.Header().Set("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
		if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
			// Preload elegível: max-age >= 1 ano + includeSubDomains + preload.
			w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		}
		next.ServeHTTP(w, r)
	})
}

// responseWriter captura o status code para logging.
// Necessário porque http.ResponseWriter não expõe o status após ser escrito.
type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(status int) {
	rw.status = status
	rw.ResponseWriter.WriteHeader(status)
}
