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

	Health            *handlers.HealthHandler
	Auth              *handlers.AuthHandler
	Simulado          *handlers.SimuladoHandler
	Progress          *handlers.ProgressHandler
	Certificate       *handlers.CertificateHandler
	Billing           *handlers.BillingHandler
	Tutor             *handlers.TutorHandler
	Leaderboard       *handlers.LeaderboardHandler
	Stats             *handlers.StatsHandler
	Admin             *handlers.AdminHandler
	AdminViews        *handlers.AdminViewsHandler        // opcional — feed admin de pageviews
	AdminMetrics      *handlers.AdminMetricsHandler      // opcional — overview KPIs por base
	AdminEvents       *handlers.AdminEventsHandler       // opcional — feed admin de interações
	UserEvents        *handlers.UserEventsHandler        // opcional — ingest público de eventos (POST /events/track)
	ModuleView        *handlers.ModuleViewHandler        // opcional — registra views de módulos (public)
	Comments          *handlers.CommentsHandler          // opcional — comentários por artigo/trilha/bloco
	Trending          *handlers.TrendingHandler          // opcional — top módulos por views recentes
	TrailLeaderboard  *handlers.TrailLeaderboardHandler  // opcional — top users por trilha
	News              *handlers.NewsHandler              // opcional — notícias curadas
	Cheatsheets       *handlers.CheatsheetsHandler       // opcional — referências rápidas em markdown
	Playlists         *handlers.PlaylistsHandler         // opcional — agrupamentos curados de módulos
	Curriculum        *handlers.CurriculumHandler        // opcional — nil desabilita rotas de currículo
	Features          *handlers.FeaturesHandler          // opcional — expõe estado das feature flags
	Metrics           *handlers.MetricsHandler           // opcional — se nil, /metrics não é registrado
	MetricsMW         func(http.Handler) http.Handler    // opcional — middleware de instrumentação
	Study             *handlers.StudyHandler             // opcional — modo estudo livre (JWT)
	AdminQuestions    *handlers.AdminQuestionsHandler    // opcional — CRUD admin de questões
	Preferences       *handlers.PreferencesHandler       // opcional — preferências pedagógicas do user (JWT)
	StudyRequest      *handlers.StudyRequestHandler      // opcional — solicitações de estudo personalizado (público, multipart)
	StudyRequestAdmin *handlers.StudyRequestAdminHandler // opcional — admin CRUD das solicitações
	Bases             *handlers.BasesHandler             // opcional — lista pública de bases de conhecimento
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
	// IdentityHeaders — captura X-FFV-User-Email/Id/Name/Anon-Id/Session-Id em
	// TODA request. Permite ao admin saber "quem acessou cada módulo" mesmo em
	// endpoints públicos sem JWT. NÃO substitui autorização (Authenticate
	// middleware continua sendo source of truth). Ver identity_headers.go.
	r.Use(middleware.IdentityHeadersMiddleware)
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

	// Contagem pública de questões — frontend usa para gate de UI.
	if cfg.Study != nil {
		r.Get("/api/v1/simulados/{simuladoId}/questions/count", cfg.Study.CountQuestions)
	}

	// Stats agregados públicos para a home (social proof).
	if cfg.Stats != nil {
		r.Get("/api/v1/stats", cfg.Stats.GetPublic)
	}

	// Lista pública de bases de conhecimento — frontend usa em /bases.
	// /api/v1/bases/{slug}/page — descritor completo para renderizar a home
	// da base via KnowledgeBaseHome (template universal). Ver UNIFICATION_PLAN.md.
	if cfg.Bases != nil {
		r.Get("/api/v1/bases", cfg.Bases.List)
		r.Get("/api/v1/bases/{slug}/page", cfg.Bases.GetPage)
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
		// NEW: rota CMS-driven, retorna artigo + árvore de blocks JSON estruturados.
		// Frontend dinâmico (BlockRenderer) consome este endpoint.
		r.Get("/api/v1/curriculum/{slug}/blocks", cfg.Curriculum.GetBlocks)
	}

	// Comments — leitura pública com auth opcional (pra exibir userVote do
	// viewer quando autenticado). MaybeAuthenticate não falha em token
	// ausente/inválido — apenas não injeta contexto.
	if cfg.Comments != nil {
		r.With(middleware.MaybeAuthenticate(cfg.JWTService)).Get("/api/v1/comments", cfg.Comments.List)
	}

	// Trending — público, módulos mais acessados.
	if cfg.Trending != nil {
		r.Get("/api/v1/curriculum/trending", cfg.Trending.Get)
	}

	// Trail leaderboard — público, top users de uma trilha.
	if cfg.TrailLeaderboard != nil {
		r.Get("/api/v1/leaderboard/trail/{trailId}", cfg.TrailLeaderboard.Get)
	}

	// Os endpoints públicos de news/cheatsheets/playlists ficam após a
	// declaração de `contentLimit` mais abaixo nesta função — Go é fluent
	// sobre escopo léxico mas precisa que a variável esteja declarada antes
	// do uso. Veja o bloco logo após `viewLimit`.

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
	// events/view é público — limite generoso pra usuários reais (1-2 pings/min
	// por slug) e estrangular bots de scraping abusivo.
	viewLimit := middleware.NewRateLimiter(cfg.Redis, 240, time.Minute, "rl:view")
	// Listagens públicas (news, cheatsheets, playlists) — cache de 5-10min no
	// header já protege, mas rate-limit fecha vetor de scraping massivo.
	contentLimit := middleware.NewRateLimiter(cfg.Redis, 300, time.Minute, "rl:content")

	// Comments — escrita autenticada. Limite agressivo pra prevenir spam:
	// 10 comentários/minuto/IP é generoso pra usuário humano. Bot que tenta
	// inundar trava no 429 em 6 segundos.
	commentCreateLimit := middleware.NewRateLimiter(cfg.Redis, 10, time.Minute, "rl:comment:create")
	// Vote e Report — operações leves, mas alvos óbvios pra abuse (brigadeiro
	// de upvotes, mass-report pra silenciar). Limite mais alto que create.
	commentVoteLimit := middleware.NewRateLimiter(cfg.Redis, 60, time.Minute, "rl:comment:vote")
	commentReportLimit := middleware.NewRateLimiter(cfg.Redis, 20, time.Minute, "rl:comment:report")

	// Tracking de acesso a módulo — público, fire-and-forget. Body limit
	// pequeno + rate limit por IP previnem abuso.
	if cfg.ModuleView != nil {
		r.With(viewLimit.Middleware()).
			With(middleware.BodyLimit(2*1024)).
			Post("/api/v1/events/view", cfg.ModuleView.Record)
	}

	// Ingest de interações deliberadas (CTAs, search, quiz, login). Mesma
	// rate-limit envelope (240/min/IP) e body bem maior (4KB metadata).
	if cfg.UserEvents != nil {
		r.With(viewLimit.Middleware()).
			With(middleware.BodyLimit(8*1024)).
			Post("/api/v1/events/track", cfg.UserEvents.Track)
	}

	// News, cheatsheets, playlists — leitura pública com rate-limit.
	if cfg.News != nil {
		r.With(contentLimit.Middleware()).Get("/api/v1/news", cfg.News.List)
		r.With(contentLimit.Middleware()).Get("/api/v1/news/{slug}", cfg.News.Get)
	}
	if cfg.Cheatsheets != nil {
		r.With(contentLimit.Middleware()).Get("/api/v1/cheatsheets", cfg.Cheatsheets.List)
		r.With(contentLimit.Middleware()).Get("/api/v1/cheatsheets/{slug}", cfg.Cheatsheets.Get)
	}
	if cfg.Playlists != nil {
		r.With(contentLimit.Middleware()).Get("/api/v1/playlists", cfg.Playlists.List)
		r.With(contentLimit.Middleware()).Get("/api/v1/playlists/{slug}", cfg.Playlists.Get)
	}

	// Verificação pública de certificado com rate-limit — previne enumeração de hashes.
	r.With(certLimit.Middleware()).Get("/api/v1/certificates/{hash}", cfg.Certificate.VerifyCertificate)

	// Solicitações de experiência de estudo personalizada — captura de lead público.
	// Aceita multipart/form-data com até 10 anexos. Rate-limit por IP para conter abuso
	// (formulário público é vetor clássico de spam). Body limit definido no próprio handler
	// via http.MaxBytesReader (multipart precisa de leitor capado, não BodyLimit middleware).
	if cfg.StudyRequest != nil {
		studyRequestLimit := middleware.NewRateLimiter(cfg.Redis, 10, time.Minute, "rl:study-request")
		r.With(studyRequestLimit.Middleware()).
			Post("/api/v1/study-requests", cfg.StudyRequest.Create)

		// Status público (sem auth) — rate-limit mais permissivo (60/min)
		// porque é polling esperado do SLA tracker no frontend.
		statusLimit := middleware.NewRateLimiter(cfg.Redis, 60, time.Minute, "rl:study-request-status")
		r.With(statusLimit.Middleware()).
			Get("/api/v1/study-requests/{id}/status", cfg.StudyRequest.GetStatus)
	}

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

		// Questões do simulado — requer JWT (não admin).
		r.Get("/api/v1/simulados/{simuladoId}/questions", cfg.Simulado.ListSimuladoQuestions)

		// Modo estudo livre — questões aleatórias sem timer (requer login).
		if cfg.Study != nil {
			r.Get("/api/v1/simulados/{simuladoId}/study/random", cfg.Study.GetRandomQuestions)
			r.Get("/api/v1/simulados/{simuladoId}/questions/batch", cfg.Study.GetQuestionsByIDs)
		}

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

		// Preferências pedagógicas (onboarding + filtros de conteúdo).
		// Tamanho do body é pequeno (~1KB típico), reaproveita profileBodyLimit (64KB).
		if cfg.Preferences != nil {
			r.Get("/api/v1/me/preferences", cfg.Preferences.Get)
			r.With(profileBodyLimit).Put("/api/v1/me/preferences", cfg.Preferences.Update)
		}

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

		// Comments — escrita autenticada (body ≤ 8KB) + rate limit anti-spam.
		// Vote/Report têm limits próprios e body pequeno (≤512B).
		if cfg.Comments != nil {
			r.With(commentCreateLimit.Middleware(), middleware.BodyLimit(8*1024)).
				Post("/api/v1/comments", cfg.Comments.Create)
			r.Delete("/api/v1/comments/{id}", cfg.Comments.Delete)
			r.With(commentVoteLimit.Middleware(), middleware.BodyLimit(512)).
				Post("/api/v1/comments/{id}/vote", cfg.Comments.Vote)
			r.With(commentReportLimit.Middleware(), middleware.BodyLimit(512)).
				Post("/api/v1/comments/{id}/report", cfg.Comments.Report)
		}

		// Admin — requer role=admin.
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAdmin)
			r.Get("/api/v1/admin/stats", cfg.Admin.GetStats)
			r.Get("/api/v1/admin/audit", cfg.Admin.GetAuditLog)
			r.Get("/api/v1/admin/users", cfg.Admin.ListUsers)
			r.Get("/api/v1/admin/growth", cfg.Admin.GetGrowth)

			// Métricas profissionais: feed de pageviews + overview por base.
			// Adicionados em 2026-05-21 pra que admin veja "quem acessou o quê"
			// e tenha breakdown por base de conhecimento. Ver migration 51 e
			// docs em UNIFICATION_PLAN.md.
			if cfg.AdminViews != nil {
				r.Get("/api/v1/admin/views", cfg.AdminViews.List)
			}
			if cfg.AdminMetrics != nil {
				r.Get("/api/v1/admin/metrics/overview", cfg.AdminMetrics.GetOverview)
			}
			if cfg.AdminEvents != nil {
				r.Get("/api/v1/admin/events", cfg.AdminEvents.List)
			}

			// Endpoints admin do currículo.
			if cfg.Curriculum != nil {
				r.With(middleware.BodyLimit(256*1024)).Post("/api/v1/admin/curriculum", cfg.Curriculum.Create)
				r.With(middleware.BodyLimit(256*1024)).Patch("/api/v1/admin/curriculum/{slug}", cfg.Curriculum.Update)
				r.Delete("/api/v1/admin/curriculum/{slug}", cfg.Curriculum.Delete)
				// Editor de blocks — limit 2MB pois árvore inteira de blocks viaja junta.
				r.With(middleware.BodyLimit(2*1024*1024)).Put("/api/v1/admin/curriculum/{slug}/blocks", cfg.Curriculum.SaveBlocks)
			}

			// Moderação de comentários.
			if cfg.Comments != nil {
				r.Get("/api/v1/admin/comments", cfg.Comments.AdminList)
				r.Post("/api/v1/admin/comments/{id}/hide", cfg.Comments.Hide)
				r.Post("/api/v1/admin/comments/{id}/restore", cfg.Comments.Restore)
			}

			// CRUD admin: news, cheatsheets, playlists.
			if cfg.News != nil {
				r.With(middleware.BodyLimit(64*1024)).Post("/api/v1/admin/news", cfg.News.Create)
				r.With(middleware.BodyLimit(64*1024)).Patch("/api/v1/admin/news/{slug}", cfg.News.Update)
				r.Delete("/api/v1/admin/news/{slug}", cfg.News.Delete)
			}
			if cfg.Cheatsheets != nil {
				r.With(middleware.BodyLimit(256*1024)).Post("/api/v1/admin/cheatsheets", cfg.Cheatsheets.Create)
				r.With(middleware.BodyLimit(256*1024)).Patch("/api/v1/admin/cheatsheets/{slug}", cfg.Cheatsheets.Update)
				r.Delete("/api/v1/admin/cheatsheets/{slug}", cfg.Cheatsheets.Delete)
			}
			if cfg.Playlists != nil {
				r.With(middleware.BodyLimit(32*1024)).Post("/api/v1/admin/playlists", cfg.Playlists.Create)
				r.With(middleware.BodyLimit(32*1024)).Patch("/api/v1/admin/playlists/{slug}", cfg.Playlists.Update)
				r.Delete("/api/v1/admin/playlists/{slug}", cfg.Playlists.Delete)
			}

			// CRUD admin: questões de simulado.
			if cfg.AdminQuestions != nil {
				r.Get("/api/v1/admin/questions", cfg.AdminQuestions.ListQuestions)
				r.Get("/api/v1/admin/questions/{questionId}", cfg.AdminQuestions.GetQuestion)
				r.With(middleware.BodyLimit(64*1024)).Post("/api/v1/admin/questions", cfg.AdminQuestions.CreateQuestion)
				r.With(middleware.BodyLimit(64*1024)).Put("/api/v1/admin/questions/{questionId}", cfg.AdminQuestions.UpdateQuestion)
				r.Delete("/api/v1/admin/questions/{questionId}", cfg.AdminQuestions.DeleteQuestion)
			}

			// CRUD admin: solicitações de estudo personalizado.
			if cfg.StudyRequestAdmin != nil {
				r.Get("/api/v1/admin/study-requests", cfg.StudyRequestAdmin.List)
				r.Get("/api/v1/admin/study-requests/{id}", cfg.StudyRequestAdmin.Get)
				r.With(middleware.BodyLimit(32*1024)).Patch("/api/v1/admin/study-requests/{id}", cfg.StudyRequestAdmin.Update)
				r.Get("/api/v1/admin/study-requests/{id}/attachments/{attachmentId}", cfg.StudyRequestAdmin.DownloadAttachment)
			}
		})
	})

	return r
}
