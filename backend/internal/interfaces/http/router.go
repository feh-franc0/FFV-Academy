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

	"github.com/fernandofv/api/internal/interfaces/http/handlers"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
	"github.com/fernandofv/api/internal/infrastructure/auth"
)

// RouterConfig agrupa todos os handlers necessários para montar o router.
type RouterConfig struct {
	Logger      *slog.Logger
	JWTService  *auth.JWTService
	CORS        []string
	Redis       *goredis.Client // usado pelos rate-limits por IP

	Health      *handlers.HealthHandler
	Auth        *handlers.AuthHandler
	Simulado    *handlers.SimuladoHandler
	Progress    *handlers.ProgressHandler
	Certificate *handlers.CertificateHandler
	Billing     *handlers.BillingHandler
	Tutor       *handlers.TutorHandler
	Leaderboard *handlers.LeaderboardHandler
	Admin       *handlers.AdminHandler
	Metrics     *handlers.MetricsHandler     // opcional — se nil, /metrics não é registrado
	MetricsMW   func(http.Handler) http.Handler // opcional — middleware de instrumentação
}

// NewRouter monta o chi.Router com todos os middlewares e rotas.
func NewRouter(cfg RouterConfig) http.Handler {
	r := chi.NewRouter()

	// Middlewares globais — ordem importa.
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger(cfg.Logger))
	r.Use(middleware.Recover(cfg.Logger))
	r.Use(middleware.CORS(cfg.CORS))
	r.Use(middleware.SecurityHeaders)
	r.Use(chimw.StripSlashes)
	if cfg.MetricsMW != nil {
		r.Use(cfg.MetricsMW)
	}

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

	// Rate-limits por IP — complementam o rate-limit por email/user já existente.
	// Limites conservadores: auth é o vetor mais crítico de DoS (email flood).
	authLimit := middleware.NewRateLimiter(cfg.Redis, 20, time.Minute, "rl:auth")
	tutorLimit := middleware.NewRateLimiter(cfg.Redis, 60, time.Minute, "rl:tutor")
	certLimit := middleware.NewRateLimiter(cfg.Redis, 120, time.Minute, "rl:cert")

	// Verificação pública de certificado com rate-limit — previne enumeração de hashes.
	r.With(certLimit.Middleware()).Get("/api/v1/certificates/{hash}", cfg.Certificate.VerifyCertificate)

	// Auth — rotas públicas com rate-limit agressivo.
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Use(authLimit.Middleware())
		r.Post("/request-token", cfg.Auth.RequestToken)
		r.Post("/verify", cfg.Auth.Verify)
		r.Post("/refresh", cfg.Auth.Refresh)
		// Google OAuth — sem rate-limit próprio, usa o authLimit do grupo.
		r.Get("/google", cfg.Auth.GoogleRedirect)
		r.Get("/google/callback", cfg.Auth.GoogleCallback)
		// Logout usa auth para revogar o refresh token correto.
		r.With(middleware.Authenticate(cfg.JWTService)).Post("/logout", cfg.Auth.Logout)
		r.With(middleware.Authenticate(cfg.JWTService)).Post("/logout-all", cfg.Auth.LogoutAll)
	})

	// Rotas autenticadas.
	r.Group(func(r chi.Router) {
		r.Use(middleware.Authenticate(cfg.JWTService))

		// Perfil do usuário.
		r.Get("/api/v1/me", cfg.Auth.GetProfile)
		r.Patch("/api/v1/me", cfg.Auth.UpdateProfile)
		r.Delete("/api/v1/me", cfg.Auth.DeleteAccount)
		r.Get("/api/v1/me/certificates", cfg.Certificate.ListCertificates)
		r.Get("/api/v1/me/export", cfg.Auth.ExportData)
		r.Get("/api/v1/me/stats", cfg.Auth.UserStats)

		// Simulados — tentativas.
		r.Post("/api/v1/simulados/{simuladoId}/attempts", cfg.Simulado.StartAttempt)
		r.Get("/api/v1/simulados/{simuladoId}/attempts/active", cfg.Simulado.ResumeAttempt)

		// Tentativas.
		r.Get("/api/v1/attempts", cfg.Simulado.ListAttempts)
		r.Post("/api/v1/attempts/{attemptId}/answers", cfg.Simulado.AnswerQuestion)
		r.Post("/api/v1/attempts/{attemptId}/flags/{questionId}", cfg.Simulado.ToggleReviewFlag)
		r.Post("/api/v1/attempts/{attemptId}/finish", cfg.Simulado.FinishAttempt)
		r.Post("/api/v1/attempts/{attemptId}/cancel", cfg.Simulado.CancelAttempt)

		// Report de questão.
		r.Post("/api/v1/questions/{questionId}/report", cfg.Simulado.ReportQuestion)

		// Progresso (GameState cloud sync).
		r.Get("/api/v1/progress", cfg.Progress.Pull)
		r.Put("/api/v1/progress", cfg.Progress.Push)

		// Certificados — emissão.
		r.Post("/api/v1/certificates", cfg.Certificate.IssueCertificate)

		// Billing.
		r.Post("/api/v1/billing/checkout", cfg.Billing.CreateCheckout)

		// Tutor IA — rate-limit por IP além do rate-limit por user já existente.
		r.With(tutorLimit.Middleware()).Post("/api/v1/tutor/ask", cfg.Tutor.Ask)

		// Leaderboard.
		r.Get("/api/v1/leaderboard", cfg.Leaderboard.GetWeekly)
		r.Get("/api/v1/leaderboard/me", cfg.Leaderboard.GetMyRank)

		// Admin — requer role=admin.
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAdmin)
			r.Get("/api/v1/admin/stats", cfg.Admin.GetStats)
		})
	})

	return r
}
