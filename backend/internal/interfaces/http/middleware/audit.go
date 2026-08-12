// Package middleware — audit.go implementa o middleware de auditoria de mutations HTTP.
package middleware

import (
	"context"
	"log/slog"
	"net/http"
)

// auditQueueCapacity é o tamanho da fila de cada worker de auditoria.
// Folgado o suficiente para absorver picos sem crescer sem limite — acima
// disso, o worker descarta com log em vez de bloquear a request (achado
// P-15, auditoria de 11/ago/2026: a goroutine de auditoria era disparada
// solta por request, sem pool nem back-pressure — sob uma rajada, o número
// de goroutines em voo crescia sem limite, e cada uma competia pela mesma
// conexão de Postgres).
const auditQueueCapacity = 256

// auditWorker processa entradas de auditoria de um canal com capacidade
// fixa, numa única goroutine dedicada — inserções continuam assíncronas
// (não bloqueiam a resposta HTTP), mas o número de goroutines concorrentes
// escrevendo no repositório fica limitado a 1 por instância do middleware,
// em vez de 1 por request.
type auditWorker struct {
	entries chan AuditEntry
}

func newAuditWorker(repo AuditLogger) *auditWorker {
	w := &auditWorker{entries: make(chan AuditEntry, auditQueueCapacity)}
	go func() {
		for entry := range w.entries {
			_ = repo.InsertAuditEntry(context.Background(), entry) //nolint:errcheck — fire-and-forget
		}
	}()
	return w
}

// submit enfileira a entrada sem bloquear. Se a fila estiver cheia (repo
// lento ou fora do ar por tempo prolongado), a entrada é descartada com log
// em vez de crescer a fila ou bloquear a request — perder uma linha de
// auditoria é preferível a derrubar a resposta HTTP por causa dela.
func (w *auditWorker) submit(entry AuditEntry) {
	select {
	case w.entries <- entry:
	default:
		slog.Default().Warn("audit: fila cheia, entrada descartada",
			"action", entry.Action, "status", entry.StatusCode, "request_id", entry.RequestID)
	}
}

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

// AuditLogOptions controla variações de comportamento do middleware de
// auditoria — o padrão (zero value) preserva o comportamento histórico
// (só 2xx).
type AuditLogOptions struct {
	// IncludeFailures faz o middleware também registrar respostas 4xx/5xx.
	// Necessário em rotas onde a FALHA é o evento que interessa auditar —
	// ex.: tentativa de login com código errado, webhook com assinatura
	// inválida (achados P-13/P-15, auditoria de 11/ago/2026: até então a
	// tabela de auditoria só cobria o grupo autenticado e só respostas 2xx,
	// então tentativa de login falha e webhook rejeitado não deixavam trilha
	// nenhuma — nem de sucesso, já que /api/v1/auth/* fica fora do grupo
	// autenticado por desenho, e o webhook usa assinatura Stripe em vez de
	// JWT).
	IncludeFailures bool
}

// AuditLog registra mutations (POST/PATCH/PUT/DELETE) no audit_log.
// GET/HEAD/OPTIONS não são auditados — apenas mudanças de estado.
// Inserção é assíncrona via worker com fila limitada (ver auditWorker) para
// não impactar latência da request nem crescer sem limite se o repositório
// ficar lento.
func AuditLog(repo AuditLogger, opts ...AuditLogOptions) func(http.Handler) http.Handler {
	var o AuditLogOptions
	if len(opts) > 0 {
		o = opts[0]
	}
	worker := newAuditWorker(repo)

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

			is2xx := rec.statusCode >= 200 && rec.statusCode < 300
			if !is2xx && !o.IncludeFailures {
				return
			}

			// Extrai o user_id do contexto (pode ser nil para rotas semi-públicas
			// ou para tentativas que falharam antes de estabelecer identidade).
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

			worker.submit(entry)
		})
	}
}
