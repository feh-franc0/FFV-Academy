// Package main é o entry point da aplicação FFV Academy API.
//
// PADRÃO: Composition Root — único lugar onde dependências concretas
// são instanciadas e conectadas. Nenhum outro pacote instancia infra.
//
// FLUXO: Config → Telemetry → Infra → Domain/App → Handlers → Router → Server
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	goredis "github.com/redis/go-redis/v9"

	appbilling "github.com/fernandofv/api/internal/application/billing"
	appcert "github.com/fernandofv/api/internal/application/certificate"
	appcurriculum "github.com/fernandofv/api/internal/application/curriculum"
	appevent "github.com/fernandofv/api/internal/application/event"
	appidentity "github.com/fernandofv/api/internal/application/identity"
	apppref "github.com/fernandofv/api/internal/application/preferences"
	appprogress "github.com/fernandofv/api/internal/application/progress"
	appsim "github.com/fernandofv/api/internal/application/simulado"
	apptutor "github.com/fernandofv/api/internal/application/tutor"
	"github.com/fernandofv/api/internal/config"
	domleaderboard "github.com/fernandofv/api/internal/domain/leaderboard"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/infrastructure/ai"
	"github.com/fernandofv/api/internal/infrastructure/audit"
	"github.com/fernandofv/api/internal/infrastructure/auth"
	"github.com/fernandofv/api/internal/infrastructure/catalog"
	"github.com/fernandofv/api/internal/infrastructure/email"
	"github.com/fernandofv/api/internal/infrastructure/payment"
	postgresinfra "github.com/fernandofv/api/internal/infrastructure/persistence/postgres"
	redisinfra "github.com/fernandofv/api/internal/infrastructure/persistence/redis"
	httpserver "github.com/fernandofv/api/internal/interfaces/http"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
	"github.com/fernandofv/api/internal/platform/logger"
	"github.com/fernandofv/api/internal/platform/telemetry"
)

func main() {
	if len(os.Args) > 1 && os.Args[1] == "--healthcheck" {
		healthCheck()
		return
	}
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "fatal: %v\n", err)
		os.Exit(1)
	}
}

// healthCheck faz GET /healthz no próprio processo e sai com 0 (ok) ou 1 (falha).
// Chamado pelo Docker HEALTHCHECK CMD — distroless não tem curl/wget.
func healthCheck() {
	port := os.Getenv("HTTP_PORT")
	if port == "" {
		port = "8080"
	}
	// G107/G704 — URL contém variável de ambiente HTTP_PORT lida do processo,
	// não input externo. Healthcheck local não tem superfície de ataque SSRF.
	resp, err := http.Get("http://localhost:" + port + "/healthz") //nolint:noctx,gosec
	if err != nil {
		fmt.Fprintf(os.Stderr, "healthcheck: %v\n", err)
		os.Exit(1)
	}
	_ = resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		fmt.Fprintf(os.Stderr, "healthcheck: status %d\n", resp.StatusCode)
		os.Exit(1)
	}
	os.Exit(0)
}

func run() error {
	// ─── Config ────────────────────────────────────────────────────────────────
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("config: %w", err)
	}

	// ─── Logger ────────────────────────────────────────────────────────────────
	log := logger.New(cfg.App.Env)
	log.Info("starting ffv-api", "version", cfg.App.Version, "env", cfg.App.Env)

	// ─── Telemetry: OpenTelemetry ───────────────────────────────────────────────
	// Setup inicializa o TracerProvider e retorna um shutdown para flush gracioso.
	// Se OTLPEndpoint estiver vazio, usa NoopProvider (zero overhead).
	ctx := context.Background()
	telemetryShutdown, err := telemetry.Setup(ctx, telemetry.Config{
		ServiceName:    cfg.App.Name,
		ServiceVersion: cfg.App.Version,
		Endpoint:       cfg.Telemetry.OTLPEndpoint,
		Insecure:       cfg.Telemetry.OTLPInsecure,
	})
	if err != nil {
		return fmt.Errorf("telemetry: %w", err)
	}
	defer telemetryShutdown(ctx) //nolint:errcheck

	// ─── Infra: Postgres ────────────────────────────────────────────────────────
	pool, err := postgresinfra.NewPool(ctx, cfg.DB)
	if err != nil {
		return fmt.Errorf("postgres: %w", err)
	}
	defer pool.Close()

	// ─── Infra: Redis ───────────────────────────────────────────────────────────
	redisClient, err := redisinfra.NewClient(cfg.Redis)
	if err != nil {
		return fmt.Errorf("redis: %w", err)
	}
	defer redisClient.Close()

	// ─── Infra: Repositórios ────────────────────────────────────────────────────
	userRepo := postgresinfra.NewUserRepo(pool)
	refreshRepo := postgresinfra.NewRefreshTokenRepo(pool)
	attemptRepo := postgresinfra.NewAttemptRepo(pool)
	progressRepo := postgresinfra.NewProgressRepo(pool)
	preferencesRepo := postgresinfra.NewPreferencesRepo(pool)
	certRepo := postgresinfra.NewCertificateRepo(pool)
	purchaseRepo := postgresinfra.NewPurchaseRepo(pool)
	stripeEventRepo := postgresinfra.NewStripeEventRepo(pool)
	leaderboardRepo := postgresinfra.NewLeaderboardRepo(pool)
	eventRepo := postgresinfra.NewEventRepo(pool)
	questionReportRepo := postgresinfra.NewQuestionReportRepo(pool)
	progressExportAdapter := postgresinfra.NewProgressExportAdapter(pool)
	purchaseExportAdapter := postgresinfra.NewPurchaseExportAdapter(pool)

	// Repositório de audit log HTTP (TASK-18).
	auditLogRepo := postgresinfra.NewAuditLogRepo(pool)

	// Repositório de artigos do currículo (TASK-20).
	curriculumRepo := postgresinfra.NewCurriculumRepo(pool)

	// ─── Audit Service ──────────────────────────────────────────────────────────
	auditService := audit.NewPostgresService(pool, log)

	// ─── Infra: Stores Redis ────────────────────────────────────────────────────
	magicTokenStore := redisinfra.NewMagicTokenStore(redisClient)
	tutorRateLimiter := redisinfra.NewTutorRateLimiter(
		redisClient,
		cfg.Anthropic.RateLimitFree,
		cfg.Anthropic.RateLimitPro,
	)
	tutorCache := redisinfra.NewTutorCache(redisClient, cfg.Anthropic.CacheTTL)

	// ─── Infra: Serviços externos ───────────────────────────────────────────────
	jwtService := auth.NewJWTService(cfg.JWT)
	var emailClient appidentity.EmailSender
	if cfg.App.Env == "development" {
		emailClient = email.NewMailhogClient("localhost:1025", "dev@ffv.local")
	} else {
		emailClient = email.NewResendClient(cfg.Resend)
	}
	stripeClient := payment.NewStripeClient(cfg.Stripe)
	claudeClient := ai.NewClaudeClient(cfg.Anthropic, tutorCache)

	// ─── Infra: Catálogo ────────────────────────────────────────────────────────
	catalogProvider, err := catalog.NewStaticCatalogProvider()
	if err != nil {
		return fmt.Errorf("catalog: %w", err)
	}
	productCatalog := catalog.NewDefaultProductCatalog(cfg.Stripe.SimuladoPriceID)

	// ─── Domínio: Clock ─────────────────────────────────────────────────────────
	clock := shared.SystemClock{}

	// ─── Application: Use Cases ─────────────────────────────────────────────────
	const magicTokenTTL = 15 * time.Minute
	// Limite alto de tentativas só quando o bypass de dev está explicitamente
	// ligado (nunca por env ausente — ver config.FeaturesConfig.AuthDevBypassEnabled).
	magicMaxAttempts := int64(5)
	if cfg.Features.AuthDevBypassEnabled {
		magicMaxAttempts = 999
	}
	// Cada use case recebe o logger via WithLogger para correlacionar logs com
	// o request_id injetado pelo middleware. O padrão WithLogger mantém
	// retrocompatibilidade — testes usam o construtor sem logger.
	requestMagicLinkUC := appidentity.NewRequestMagicLinkUseCase(
		magicTokenStore, userRepo, emailClient, clock,
		magicTokenTTL, magicMaxAttempts, cfg.Features.AuthDevBypassEnabled,
	).WithLogger(log)
	verifyMagicLinkUC := appidentity.NewVerifyMagicLinkUseCase(
		magicTokenStore, userRepo, refreshRepo, jwtService, clock, cfg.JWT.RefreshTokenTTL,
		cfg.Features.AuthDevBypassEnabled,
	).WithLogger(log).WithMaxAttempts(magicMaxAttempts)
	refreshTokenUC := appidentity.NewRefreshTokenUseCase(
		refreshRepo, userRepo, jwtService, clock, cfg.JWT.RefreshTokenTTL,
	)
	logoutUC := appidentity.NewLogoutUseCase(refreshRepo).WithLogger(log)
	logoutAllUC := appidentity.NewLogoutAllUseCase(refreshRepo).WithLogger(log)
	getProfileUC := appidentity.NewGetProfileUseCase(userRepo).WithLogger(log)
	updateProfileUC := appidentity.NewUpdateProfileUseCase(userRepo).WithLogger(log)
	deleteAccountUC := appidentity.NewDeleteAccountUseCase(userRepo, refreshRepo, clock).WithLogger(log)

	// questionRepo é usado tanto pelo motor de prova (sorteio server-side em
	// StartAttempt, pontuação real em Finish/Resume) quanto pelo modo de
	// estudo livre (studyH mais abaixo) — instanciado aqui, cedo, para os dois.
	questionRepo := postgresinfra.NewQuestionRepo(pool)

	startAttemptUC := appsim.NewStartAttemptUseCase(attemptRepo, catalogProvider, questionRepo, clock)
	answerQUC := appsim.NewAnswerQuestionUseCase(attemptRepo, clock)
	toggleFlagUC := appsim.NewToggleReviewFlagUseCase(attemptRepo, clock)
	finishAttemptUC := appsim.NewFinishAttemptUseCase(attemptRepo, catalogProvider, questionRepo, clock)
	resumeAttemptUC := appsim.NewResumeAttemptUseCase(attemptRepo, catalogProvider, questionRepo, clock)
	listAttemptsUC := appsim.NewListAttemptsUseCase(attemptRepo)
	cancelAttemptUC := appsim.NewCancelAttemptUseCase(attemptRepo, auditService, clock)
	reportQuestionUC := appsim.NewReportQuestionUseCase(questionReportRepo, auditService, clock)
	claimXPCreditUC := appsim.NewClaimXPCreditUseCase(attemptRepo, clock)

	exportDataUC := appidentity.NewExportUserDataUseCase(
		userRepo, attemptRepo, certRepo, progressExportAdapter, purchaseExportAdapter,
		auditService, clock,
	)
	userStatsUC := appidentity.NewUserStatsUseCase(attemptRepo, certRepo)

	syncPushUC := appprogress.NewSyncPushUseCase(progressRepo, clock)
	syncPullUC := appprogress.NewSyncPullUseCase(progressRepo)

	getPreferencesUC := apppref.NewGetPreferencesUseCase(preferencesRepo, clock)
	updatePreferencesUC := apppref.NewUpdatePreferencesUseCase(preferencesRepo, clock)

	issueCertUC := appcert.NewIssueCertificateUseCase(certRepo, attemptRepo, clock)
	verifyCertUC := appcert.NewVerifyCertificateUseCase(certRepo)
	listCertsUC := appcert.NewListUserCertificatesUseCase(certRepo)

	createCheckoutUC := appbilling.NewCreateCheckoutUseCase(
		purchaseRepo, stripeClient, productCatalog, userRepo, clock,
		cfg.Stripe.SuccessURL, cfg.Stripe.CancelURL,
	)
	// Ordem: purchaseRepo primeiro, stripeEventRepo segundo.
	handleWebhookUC := appbilling.NewHandleStripeWebhookUseCase(
		purchaseRepo, stripeEventRepo, userRepo, clock,
	)

	askTutorUC := apptutor.NewAskUseCase(claudeClient, tutorRateLimiter, catalogProvider)

	eventUC := appevent.NewIngestEventUseCase(eventRepo, clock)

	// Use cases do currículo (TASK-20).
	getArticleUC := appcurriculum.NewGetArticleUseCase(curriculumRepo)
	listCurriculumUC := appcurriculum.NewListCurriculumUseCase(curriculumRepo)
	searchCurriculumUC := appcurriculum.NewSearchCurriculumUseCase(curriculumRepo)

	// ─── Handlers ───────────────────────────────────────────────────────────────
	baseURL := cfg.App.APIBaseURL

	redisPinger := &redisPingerAdapter{client: redisClient}
	healthH := handlers.NewHealthHandler(pool, redisPinger)
	authH := handlers.NewAuthHandler(
		requestMagicLinkUC, verifyMagicLinkUC, refreshTokenUC,
		logoutUC, logoutAllUC, getProfileUC, updateProfileUC, deleteAccountUC,
	).WithExportData(exportDataUC).WithUserStats(userStatsUC)
	simuladoH := handlers.NewSimuladoHandler(
		catalogProvider, startAttemptUC, answerQUC, toggleFlagUC,
		finishAttemptUC, resumeAttemptUC, listAttemptsUC,
	).WithCancelAttempt(cancelAttemptUC).WithReportQuestion(reportQuestionUC).
		WithClaimXPCredit(claimXPCreditUC).WithQuestionRepo(questionRepo).
		WithAttemptRepoForQuestions(attemptRepo)
	progressH := handlers.NewProgressHandler(syncPushUC, syncPullUC)
	preferencesH := handlers.NewPreferencesHandler(getPreferencesUC, updatePreferencesUC)
	certH := handlers.NewCertificateHandler(issueCertUC, verifyCertUC, listCertsUC, baseURL)
	billingH := handlers.NewBillingHandler(createCheckoutUC, handleWebhookUC, stripeClient).
		WithEnabled(cfg.Features.BillingEnabled)
	tutorH := handlers.NewTutorHandler(askTutorUC).
		WithEnabled(cfg.Features.TutorAIEnabled)
	featuresH := handlers.NewFeaturesHandler(cfg.Features)
	leaderboardH := handlers.NewLeaderboardHandler(leaderboardRepo)
	statsH := handlers.NewStatsHandler(&pgxStatsRepo{pool: pool})
	adminH := handlers.NewAdminHandler(userRepo, attemptRepo, eventUC).
		WithAuditLog(auditLogRepo).
		WithAdminStats(&pgxAdminStatsRepo{pool: pool}).
		WithAdminUsers(&pgxAdminUsersRepo{pool: pool}).
		WithAdminGrowth(&pgxAdminGrowthRepo{pool: pool})
	curriculumH := handlers.NewCurriculumHandler(getArticleUC, listCurriculumUC, searchCurriculumUC, curriculumRepo)
	moduleViewH := handlers.NewModuleViewHandler(&pgxModuleViewRepo{pool: pool})
	commentsH := handlers.NewCommentsHandler(&pgxCommentsRepo{pool: pool})
	trendingH := handlers.NewTrendingHandler(&pgxTrendingRepo{pool: pool})
	trailLbH := handlers.NewTrailLeaderboardHandler(&pgxTrailLeaderboardRepo{pool: pool})
	newsH := handlers.NewNewsHandler(&pgxNewsRepo{pool: pool})
	cheatH := handlers.NewCheatsheetsHandler(&pgxCheatsheetsRepo{pool: pool})
	playH := handlers.NewPlaylistsHandler(&pgxPlaylistsRepo{pool: pool})
	studyH := handlers.NewStudyHandler(questionRepo, attemptRepo)
	adminQuestionsH := handlers.NewAdminQuestionsHandler(questionRepo)

	// ─── Observabilidade: Prometheus ────────────────────────────────────────────
	metricsReg := middleware.NewMetricsRegistry()
	metricsH := handlers.NewMetricsHandler(metricsReg.Registry)

	// ─── Router ──────────────────────────────────────────────────────────────────
	// auditLogAdapter adapta AuditLogRepo para a interface middleware.AuditLogger.
	var auditLogMW middleware.AuditLogger = &auditLogAdapter{repo: auditLogRepo}

	routerCfg := httpserver.RouterConfig{
		Logger:           log,
		JWTService:       jwtService,
		CORS:             cfg.CORS.AllowedOrigins,
		Redis:            redisClient,
		RequestTimeout:   cfg.HTTP.RequestTimeout,
		AuditLog:         auditLogMW,
		Health:           healthH,
		Auth:             authH,
		Simulado:         simuladoH,
		Progress:         progressH,
		Preferences:      preferencesH,
		Certificate:      certH,
		Billing:          billingH,
		Tutor:            tutorH,
		Leaderboard:      leaderboardH,
		Stats:            statsH,
		Admin:            adminH,
		ModuleView:       moduleViewH,
		Comments:         commentsH,
		Trending:         trendingH,
		TrailLeaderboard: trailLbH,
		News:             newsH,
		Cheatsheets:      cheatH,
		Playlists:        playH,
		Curriculum:       curriculumH,
		Features:         featuresH,
		Metrics:          metricsH,
		MetricsMW:        metricsReg.Middleware(),
		Study:            studyH,
		AdminQuestions:   adminQuestionsH,
	}
	router := httpserver.NewRouter(routerCfg)

	// ─── Servidor ────────────────────────────────────────────────────────────────
	addr := fmt.Sprintf(":%d", cfg.HTTP.Port)
	srv := httpserver.NewServer(addr, router)

	// Graceful shutdown via signal.
	shutdownCh := make(chan error, 1)
	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		sig := <-quit
		log.Info("shutdown signal received", "signal", sig)

		shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.HTTP.ShutdownTimeout)
		defer cancel()
		shutdownCh <- srv.Shutdown(shutdownCtx)
	}()

	log.Info("server listening", "addr", srv.Addr())
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("server: %w", err)
	}

	if err := <-shutdownCh; err != nil {
		return fmt.Errorf("shutdown: %w", err)
	}

	log.Info("server stopped gracefully")
	return nil
}

// redisPingerAdapter adapta o go-redis Client para a interface handlers.Pinger.
type redisPingerAdapter struct {
	client *goredis.Client
}

func (a *redisPingerAdapter) Ping(ctx context.Context) error {
	return a.client.Ping(ctx).Err()
}

// auditLogAdapter adapta postgresinfra.AuditLogRepo para a interface middleware.AuditLogger.
// Converte middleware.AuditEntry para postgresinfra.LogEntry sem criar import cycle.
type auditLogAdapter struct {
	repo *postgresinfra.AuditLogRepo
}

func (a *auditLogAdapter) InsertAuditEntry(ctx context.Context, entry middleware.AuditEntry) error {
	return a.repo.Insert(ctx, postgresinfra.LogEntry{
		UserID:     entry.UserID,
		Action:     entry.Action,
		StatusCode: entry.StatusCode,
		IP:         entry.IP,
		UserAgent:  entry.UserAgent,
		RequestID:  entry.RequestID,
	})
}

// Compile-time checks — garante que tipos concretos satisfazem interfaces.
var _ domleaderboard.Repository = (*postgresinfra.LeaderboardRepo)(nil)
var _ middleware.AuditLogger = (*auditLogAdapter)(nil)
