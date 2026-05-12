// Package config carrega e valida todas as configurações da aplicação via
// variáveis de ambiente.
//
// PADRÕES:
//   - 12-Factor App: toda config vem de env vars.
//   - SOLID/SRP: struct única com responsabilidade de carregar config.
//   - Fail-fast: Load() retorna erro se algum campo required estiver ausente.
package config

import (
	"fmt"
	"time"

	"github.com/kelseyhightower/envconfig"
)

// Config agrega toda a configuração da aplicação. Campos marcados com
// `required:"true"` causam erro em Load() se não presents no ambiente.
type Config struct {
	App       AppConfig
	HTTP      HTTPConfig
	DB        DBConfig
	Redis     RedisConfig
	JWT       JWTConfig
	Stripe    StripeConfig
	Resend    ResendConfig
	Twilio    TwilioConfig
	Anthropic AnthropicConfig
	CORS      CORSConfig
	Telemetry TelemetryConfig
	Features  FeaturesConfig
}

// FeaturesConfig agrupa feature flags de funcionalidades opcionais.
// Permite desabilitar partes da plataforma (billing, tutor IA, phone auth)
// sem remover código — útil enquanto integrações externas (Stripe, Twilio,
// Anthropic) não estão configuradas em produção.
type FeaturesConfig struct {
	BillingEnabled   bool `envconfig:"FEATURE_BILLING_ENABLED" default:"false"`
	TutorAIEnabled   bool `envconfig:"FEATURE_TUTOR_AI_ENABLED" default:"false"`
	PhoneAuthEnabled bool `envconfig:"FEATURE_PHONE_AUTH_ENABLED" default:"false"`
}

type AppConfig struct {
	Env        string `envconfig:"APP_ENV" default:"development"`
	Name       string `envconfig:"APP_NAME" default:"ffv-api"`
	Version    string `envconfig:"APP_VERSION" default:"dev"`
	APIBaseURL string `envconfig:"API_BASE_URL" default:"https://api.fernandofrancovalle.com/api/v1"`
}

type HTTPConfig struct {
	Port            int           `envconfig:"HTTP_PORT" default:"8080"`
	ReadTimeout     time.Duration `envconfig:"HTTP_READ_TIMEOUT" default:"10s"`
	WriteTimeout    time.Duration `envconfig:"HTTP_WRITE_TIMEOUT" default:"30s"`
	IdleTimeout     time.Duration `envconfig:"HTTP_IDLE_TIMEOUT" default:"60s"`
	ShutdownTimeout time.Duration `envconfig:"HTTP_SHUTDOWN_TIMEOUT" default:"30s"`
	// RequestTimeout é o deadline por request. Cancela o context e aborta queries DB/Redis
	// pendentes automaticamente — evita goroutines presas durante incidents de infra.
	// 0 = desabilitado (útil em testes que não têm timeout de infra real).
	RequestTimeout time.Duration `envconfig:"HTTP_REQUEST_TIMEOUT" default:"15s"`
}

type DBConfig struct {
	URL             string        `envconfig:"DATABASE_URL" required:"true"`
	MaxConns        int32         `envconfig:"DB_MAX_CONNS" default:"25"`
	MinConns        int32         `envconfig:"DB_MIN_CONNS" default:"5"`
	ConnMaxLifetime time.Duration `envconfig:"DB_CONN_MAX_LIFETIME" default:"30m"`
	ConnMaxIdleTime time.Duration `envconfig:"DB_CONN_MAX_IDLE_TIME" default:"5m"`
}

type RedisConfig struct {
	URL      string `envconfig:"REDIS_URL" required:"true"`
	Password string `envconfig:"REDIS_PASSWORD" default:""`
	DB       int    `envconfig:"REDIS_DB" default:"0"`
}

type JWTConfig struct {
	// Secret deve ter >= 32 bytes de entropia.
	Secret          string        `envconfig:"JWT_SECRET" required:"true"`
	AccessTokenTTL  time.Duration `envconfig:"JWT_ACCESS_TTL" default:"15m"`
	RefreshTokenTTL time.Duration `envconfig:"JWT_REFRESH_TTL" default:"720h"` // 30d
	Issuer          string        `envconfig:"JWT_ISSUER" default:"ffv-api"`
	Audience        string        `envconfig:"JWT_AUDIENCE" default:"ffv-frontend"`
}

type StripeConfig struct {
	SecretKey       string `envconfig:"STRIPE_SECRET_KEY" default:""`
	WebhookSecret   string `envconfig:"STRIPE_WEBHOOK_SECRET" default:""`
	SuccessURL      string `envconfig:"STRIPE_SUCCESS_URL" default:"https://fernandofrancovalle.com/simulados?payment=success"`
	CancelURL       string `envconfig:"STRIPE_CANCEL_URL" default:"https://fernandofrancovalle.com/simulados?payment=cancelled"`
	SimuladoPriceID string `envconfig:"STRIPE_SIMULADO_PRICE_ID" default:"price_placeholder"`
}

type ResendConfig struct {
	APIKey    string `envconfig:"RESEND_API_KEY" required:"true"`
	FromEmail string `envconfig:"RESEND_FROM_EMAIL" default:"noreply@fernandofrancovalle.com"`
	FromName  string `envconfig:"RESEND_FROM_NAME" default:"FFV Academy"`
}

type TwilioConfig struct {
	AccountSID string `envconfig:"TWILIO_ACCOUNT_SID"`
	AuthToken  string `envconfig:"TWILIO_AUTH_TOKEN"`
	FromNumber string `envconfig:"TWILIO_FROM_NUMBER"`
}

type AnthropicConfig struct {
	APIKey        string        `envconfig:"ANTHROPIC_API_KEY" default:""`
	Model         string        `envconfig:"ANTHROPIC_MODEL" default:"claude-sonnet-4-6"`
	MaxTokens     int           `envconfig:"ANTHROPIC_MAX_TOKENS" default:"1024"`
	CacheTTL      time.Duration `envconfig:"ANTHROPIC_CACHE_TTL" default:"168h"` // 7 days
	RateLimitFree int           `envconfig:"ANTHROPIC_RATE_LIMIT_FREE" default:"50"`
	RateLimitPro  int           `envconfig:"ANTHROPIC_RATE_LIMIT_PRO" default:"1000"`
}

type CORSConfig struct {
	AllowedOrigins []string `envconfig:"CORS_ALLOWED_ORIGINS" default:"https://fernandofrancovalle.com"`
}

// TelemetryConfig contém as configurações do OpenTelemetry.
// Quando OTLPEndpoint está vazio, o tracing fica desabilitado (NoopProvider).
type TelemetryConfig struct {
	OTLPEndpoint string `envconfig:"OTEL_EXPORTER_OTLP_ENDPOINT"` // vazio = desabilitado
	OTLPInsecure bool   `envconfig:"OTEL_INSECURE" default:"false"`
}

// Load lê as variáveis de ambiente e valida os campos obrigatórios.
// Retorna erro descritivo se qualquer campo required estiver faltando.
//
// DIP: chamado apenas em main.go — a aplicação não depende de env vars diretamente.
func Load() (*Config, error) {
	var cfg Config

	groups := []struct {
		prefix string
		target interface{}
	}{
		{"", &cfg.App},
		{"", &cfg.HTTP},
		{"", &cfg.DB},
		{"", &cfg.Redis},
		{"", &cfg.JWT},
		{"", &cfg.Stripe},
		{"", &cfg.Resend},
		{"", &cfg.Twilio},
		{"", &cfg.Anthropic},
		{"", &cfg.CORS},
		{"", &cfg.Telemetry},
		{"", &cfg.Features},
	}

	for _, g := range groups {
		if err := envconfig.Process(g.prefix, g.target); err != nil {
			return nil, fmt.Errorf("config: %w", err)
		}
	}

	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("config validation: %w", err)
	}

	return &cfg, nil
}

// LoadTest retorna config com valores default seguros para testes.
// Campos required são preenchidos com valores dummy.
func LoadTest() *Config {
	return &Config{
		App: AppConfig{Env: "test", Name: "ffv-api-test", Version: "test", APIBaseURL: "http://localhost:8081/api/v1"},
		HTTP: HTTPConfig{
			Port:            8081,
			ReadTimeout:     5 * time.Second,
			WriteTimeout:    5 * time.Second,
			IdleTimeout:     5 * time.Second,
			ShutdownTimeout: 5 * time.Second,
			RequestTimeout:  0, // desabilitado em testes — sem infra real para cancelar
		},
		DB: DBConfig{
			URL:             "postgres://test:test@localhost:5432/test",
			MaxConns:        5,
			MinConns:        1,
			ConnMaxLifetime: 5 * time.Minute,
			ConnMaxIdleTime: 1 * time.Minute,
		},
		Redis: RedisConfig{URL: "redis://localhost:6379"},
		JWT: JWTConfig{
			Secret:          "test-secret-at-least-32-bytes-long!!",
			AccessTokenTTL:  15 * time.Minute,
			RefreshTokenTTL: 720 * time.Hour,
			Issuer:          "ffv-api-test",
			Audience:        "ffv-frontend-test",
		},
		Stripe: StripeConfig{
			SecretKey:     "sk_test_dummy",
			WebhookSecret: "whsec_test_dummy",
			SuccessURL:    "http://localhost:3000/success",
			CancelURL:     "http://localhost:3000/cancel",
		},
		Resend: ResendConfig{
			APIKey:    "re_test_dummy",
			FromEmail: "test@example.com",
			FromName:  "FFV Test",
		},
		Twilio: TwilioConfig{
			AccountSID: "AC_test",
			AuthToken:  "test_token",
			FromNumber: "+15555555555",
		},
		Anthropic: AnthropicConfig{
			APIKey:        "sk-ant-test",
			Model:         "claude-haiku-4-5-20251001",
			MaxTokens:     512,
			CacheTTL:      168 * time.Hour,
			RateLimitFree: 50,
			RateLimitPro:  1000,
		},
		CORS: CORSConfig{
			AllowedOrigins: []string{"http://localhost:3000"},
		},
		Telemetry: TelemetryConfig{}, // desabilitado em testes
		Features: FeaturesConfig{
			// Em testes habilitamos todas as features para não quebrar testes
			// existentes que cobrem billing/tutor/phone auth.
			BillingEnabled:   true,
			TutorAIEnabled:   true,
			PhoneAuthEnabled: true,
		},
	}
}

// IsDevelopment reporta se o ambiente é desenvolvimento.
func (c *Config) IsDevelopment() bool { return c.App.Env == "development" }

// IsProduction reporta se o ambiente é produção.
func (c *Config) IsProduction() bool { return c.App.Env == "production" }

// IsTest reporta se o ambiente é teste.
func (c *Config) IsTest() bool { return c.App.Env == "test" }

func (c *Config) validate() error {
	if len(c.JWT.Secret) < 32 {
		return fmt.Errorf("JWT_SECRET deve ter pelo menos 32 caracteres")
	}
	return nil
}
