// Package middleware — audit.go implementa o middleware de auditoria de mutations HTTP.
package middleware

import (
	"context"
	"net/http"
)

// AuditEntry representa os metadados de uma ação auditável.
// Definida aqui para evitar import cycle com o pacote postgres.
type AuditEntry struct {
	UserID     *string // nil para usuários não autenticados
	Action     string  // "METHOD /path"
	StatusCode int
	IP         string
	UserAgent  string
	RequestID  string
}

// AuditLogger é a interface que o repositório de audit log deve implementar.
// Definida aqui para que o middleware não precise importar o pacote postgres.
type AuditLogger interface {
	InsertAuditEntry(ctx context.Context, entry AuditEntry) error
}

// statusRecorder captura o status code da resposta para registro no audit log.
// Necessário porque http.ResponseWriter não expõe o status após WriteHeader ser chamado.
type statusRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (sr *statusRecorder) WriteHeader(code int) {
	sr.statusCode = code
	sr.ResponseWriter.WriteHeader(code)
}

// AuditLog registra mutations (POST/PATCH/PUT/DELETE) com status 2xx no audit_log.
// GET/HEAD/OPTIONS não são auditados — apenas mudanças de estado.
// Inserção é assíncrona (goroutine) para não impactar latência da request.
func AuditLog(repo AuditLogger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Apenas métodos que mutam estado são auditados.
			method := r.Method
			if method == http.MethodGet || method == http.MethodHead || method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			// Envolve o ResponseWriter para capturar o status code.
			rec := &statusRecorder{ResponseWriter: w, statusCode: http.StatusOK}
			next.ServeHTTP(rec, r)

			// Apenas registra respostas 2xx — erros de validação ou auth não são mutations.
			if rec.statusCode < 200 || rec.statusCode >= 300 {
				return
			}

			// Extrai o user_id do contexto (pode ser nil para rotas semi-públicas).
			var userID *string
			if uid, ok := r.Context().Value(CtxKeyUserID).(interface{ String() string }); ok {
				s := uid.String()
				if s != "" {
					userID = &s
				}
			}

			entry := AuditEntry{
				UserID:     userID,
				Action:     method + " " + r.URL.Path,
				StatusCode: rec.statusCode,
				IP:         clientIP(r),
				UserAgent:  r.UserAgent(),
				RequestID:  RequestIDFromContext(r.Context()),
			}

			// Inserção assíncrona: goroutine dedicada para não bloquear a resposta.
			go func() {
				_ = repo.InsertAuditEntry(context.Background(), entry) //nolint:errcheck — fire-and-forget
			}()
		})
	}
}
