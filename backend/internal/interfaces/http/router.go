// Package http configura o roteador HTTP da aplicação.
//
// PADRÃO: Camada de Interfaces — conecta handlers ao transport (HTTP).
// Toda a configuração de rotas fica aqui; handlers não conhecem rotas.
package http

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	goredis "github.com/redis/go-redis/v9"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"

	"github.com/fernandofv/api/internal/infrastructure/auth"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// RouterConfig agrupa todos os handlers necessários para montar o router.
type RouterConfig struct {
	Logger     *slog.Logger
	JWTService *auth.JWTService
	CORS       []string
	Redis      *goredis.Client // usado pelos rate-limits por IP
	// RequestTimeout é o timeout máximo por request. Zero = desabilitado.
	RequestTimeout time.Duration
	// AuditLog é o repositório de audit log. Opcional — se nil, o middleware é omitido.
	AuditLog middleware.AuditLogger

	Health      *handlers.HealthHandler
	Auth        *handlers.AuthHandler
	Simulado    *handlers.SimuladoHandler
	Progress    *handlers.ProgressHandler
	Certificate *handlers.CertificateHandler
	Billing     *handlers.BillingHandler
	Tutor       *handlers.TutorHandler
	Leaderboard *handlers.LeaderboardHandler
	Stats       *handlers.StatsHandler
	Admin       *handlers.AdminHandler
	Curriculum  *handlers.CurriculumHandler     // opcional — nil desabilita rotas de currículo
	Features    *handlers.FeaturesHandler       // opcional — expõe estado das feature flags
	Metrics     *handlers.MetricsHandler        // opcional — se nil, /metrics não é registrado
	MetricsMW   func(http.Handler) http.Handler // opcional — middleware de instrumentação
}

// NewRouter monta o chi.Router com todos os middlewares e rotas.
func NewRouter(cfg RouterConfig) http.Handler {
	r := chi.NewRouter()

	// Middlewares globais — a ordem é crítica:
	// 1. RequestID: deve ser o primeiro para que todos os logs subsequentes tenham o ID.
	// 2. Logger: logo após o ID para logar com correlação.
	// 3. Recover: captura panics em qualquer middleware subsequente.
	// 4. RequestTimeout: cancela context antes de qualquer IO — DB/Redis aborta automaticamente.
	// 5. CORS: antes de qualquer lógica de negócio.
	// 6. SecurityHeaders: aplica headers de proteção em todas as respostas.
	// 7. OTel: após Logger para que spans incluam o request_id.
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger(cfg.Logger))
	r.Use(middleware.Recover(cfg.Logger))
	if cfg.RequestTimeout > 0 {
		r.Use(middleware.RequestTimeout(cfg.RequestTimeout))
	}
	r.Use(middleware.CORS(cfg.CORS))
	r.Use(middleware.SecurityHeaders)
	r.Use(chimw.StripSlashes)
	if cfg.MetricsMW != nil {
		r.Use(cfg.MetricsMW)
	}
	// OpenTelemetry: instrumenta todas as rotas com spans HTTP.
	// Posicionado após Logger para que spans incluam o request_id do middleware.
	r.Use(func(next http.Handler) http.Handler {
		return otelhttp.NewHandler(next, "http.request",
			otelhttp.WithSpanNameFormatter(func(_ string, r *http.Request) string {
				return r.Method + " " + r.URL.Path
			}),
		)
	})

	// Health checks (sem autenticação).
	r.Get("/healthz", cfg.Health.Liveness)
	r.Get("/readyz", cfg.Health.Readiness)

	// Prometheus /metrics — exposição pública (ver MetricsHandler doc).
	if cfg.Metrics != nil {
		r.Method(http.MethodGet, "/metrics", cfg.Metrics)
	}

	// Webhook Stripe (sem auth JWT — usa assinatura Stripe).
	r.Post("/api/v1/webhooks/stripe", cfg.Billing.StripeWebhook)

	// Endpoints públicos do catálogo (leitura sem auth).
	r.Get("/api/v1/simulados", cfg.Simulado.ListSimulados)
	r.Get("/api/v1/simulados/{simuladoId}", cfg.Simulado.GetSimulado)

	// Stats agregados públicos para a home (social proof).
	if cfg.Stats != nil {
		r.Get("/api/v1/stats", cfg.Stats.GetPublic)
	}

	// Top-10 do ranking semanal — público, anonimizado para visitantes.
	r.Get("/api/v1/leaderboard/public", cfg.Leaderboard.GetPublic)

	// Feature flags — público, permite ao frontend descobrir features ativas em runtime.
	if cfg.Features != nil {
		r.Get("/api/v1/features", cfg.Features.Get)
	}

	// Endpoints públicos do currículo — leitura sem autenticação.
	if cfg.Curriculum != nil {
		r.Get("/api/v1/curriculum", cfg.Curriculum.List)
		// Rota search deve vir ANTES de /{slug} para não capturar "search" como slug.
		r.Get("/api/v1/curriculum/search", cfg.Curriculum.Search)
		r.Get("/api/v1/curriculum/{slug}", cfg.Curriculum.GetBySlug)
	}

	// Body size limits por grupo de rota.
	// Aplicar antes do rate-limit para rejeitar payloads gigantes antes de qualquer processamento.
	// Auth endpoints: 10KB — email + token cabem em < 1KB; limit generoso para evitar falsos positivos.
	// Perfil (PATCH): 64KB — nome, telefone, consent — bem abaixo do default de 1MB do Go.
	// Simulado (answers): 256KB — map de {questionID: optionID} para exames grandes.
	// Progression (PUT): 512KB — GameState serializado pode ser grande com muitos artigos.
	authBodyLimit := middleware.BodyLimit(10 * 1024)      // 10KB
	profileBodyLimit := middleware.BodyLimit(64 * 1024)   // 64KB
	simuladoBodyLimit := middleware.BodyLimit(256 * 1024) // 256KB
	progressBodyLimit := middleware.BodyLimit(512 * 1024) // 512KB

	// Rate-limits por IP — complementam o rate-limit por email/user já existente.
	// Limites conservadores: auth é o vetor mais crítico de DoS (email flood).
	authLimit := middleware.NewRateLimiter(cfg.Redis, 20, time.Minute, "rl:auth")
	tutorLimit := middleware.NewRateLimiter(cfg.Redis, 60, time.Minute, "rl:tutor")
	certLimit := middleware.NewRateLimiter(cfg.Redis, 120, time.Minute, "rl:cert")

	// Verificação pública de certificado com rate-limit — previne enumeração de hashes.
	r.With(certLimit.Middleware()).Get("/api/v1/certificates/{hash}", cfg.Certificate.VerifyCertificate)

	// Auth — rotas públicas com rate-limit agressivo e body limit pequeno.
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Use(authLimit.Middleware())
		r.Use(authBodyLimit)
		r.Post("/request-token", cfg.Auth.RequestToken)
		r.Post("/verify", cfg.Auth.Verify)
		r.Post("/refresh", cfg.Auth.Refresh)
		// Logout usa auth para revogar o refresh token correto.
		r.With(middleware.Authenticate(cfg.JWTService)).Post("/logout", cfg.Auth.Logout)
		r.With(middleware.Authenticate(cfg.JWTService)).Post("/logout-all", cfg.Auth.LogoutAll)
	})

	// Rotas autenticadas.
	r.Group(func(r chi.Router) {
		r.Use(middleware.Authenticate(cfg.JWTService))

		// Middleware de audit log para mutations autenticadas.
		// Registra POST/PATCH/PUT/DELETE com status 2xx de forma assíncrona.
		if cfg.AuditLog != nil {
			r.Use(middleware.AuditLog(cfg.AuditLog))
		}

		// Perfil do usuário.
		r.Get("/api/v1/me", cfg.Auth.GetProfile)
		r.With(profileBodyLimit).Patch("/api/v1/me", cfg.Auth.UpdateProfile)
		r.Delete("/api/v1/me", cfg.Auth.DeleteAccount)
		r.Get("/api/v1/me/certificates", cfg.Certificate.ListCertificates)
		r.Get("/api/v1/me/export", cfg.Auth.ExportData)
		r.Get("/api/v1/me/stats", cfg.Auth.UserStats)

		// Simulados — tentativas.
		r.Post("/api/v1/simulados/{simuladoId}/attempts", cfg.Simulado.StartAttempt)
		r.Get("/api/v1/simulados/{simuladoId}/attempts/active", cfg.Simulado.ResumeAttempt)

		// Tentativas.
		r.Get("/api/v1/attempts", cfg.Simulado.ListAttempts)
		r.With(simuladoBodyLimit).Post("/api/v1/attempts/{attemptId}/answers", cfg.Simulado.AnswerQuestion)
		r.Post("/api/v1/attempts/{attemptId}/flags/{questionId}", cfg.Simulado.ToggleReviewFlag)
		r.Post("/api/v1/attempts/{attemptId}/finish", cfg.Simulado.FinishAttempt)
		r.Post("/api/v1/attempts/{attemptId}/cancel", cfg.Simulado.CancelAttempt)

		// Report de questão.
		r.Post("/api/v1/questions/{questionId}/report", cfg.Simulado.ReportQuestion)

		// Progression (GameState cloud sync).
		r.Get("/api/v1/progress", cfg.Progress.Pull)
		r.With(progressBodyLimit).Put("/api/v1/progress", cfg.Progress.Push)

		// Certificados — emissão.
		r.Post("/api/v1/certificates", cfg.Certificate.IssueCertificate)

		// Billing.
		r.Post("/api/v1/billing/checkout", cfg.Billing.CreateCheckout)

		// Tutor IA — rate-limit por IP além do rate-limit por user já existente.
		r.With(tutorLimit.Middleware()).Post("/api/v1/tutor/ask", cfg.Tutor.Ask)

		// Leaderboard.
		r.Get("/api/v1/leaderboard", cfg.Leaderboard.GetWeekly)
		r.Get("/api/v1/leaderboard/me", cfg.Leaderboard.GetMyRank)
		r.Get("/api/v1/leaderboard/me/all", cfg.Leaderboard.GetMyRankAll)

		// Admin — requer role=admin.
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAdmin)
			r.Get("/api/v1/admin/stats", cfg.Admin.GetStats)
			r.Get("/api/v1/admin/audit", cfg.Admin.GetAuditLog)

			// Endpoints admin do currículo.
			if cfg.Curriculum != nil {
				r.Post("/api/v1/admin/curriculum", cfg.Curriculum.Create)
				r.Patch("/api/v1/admin/curriculum/{slug}", cfg.Curriculum.Update)
				r.Delete("/api/v1/admin/curriculum/{slug}", cfg.Curriculum.Delete)
			}
		})
	})

	return r
}
