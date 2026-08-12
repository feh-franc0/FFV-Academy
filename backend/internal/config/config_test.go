package config

import "testing"

// validSecret satisfaz o mínimo de 32 caracteres exigido por validate().
const validSecret = "01234567890123456789012345678901"

func baseValidConfig() Config {
	return Config{
		App: AppConfig{Env: "development"},
		JWT: JWTConfig{Secret: validSecret},
	}
}

func Test_Config_Validate_RejectsShortJWTSecret(t *testing.T) {
	cfg := baseValidConfig()
	cfg.JWT.Secret = "curto-demais"

	if err := cfg.validate(); err == nil {
		t.Fatal("esperava erro para JWT_SECRET curto, veio nil")
	}
}

// Test_Config_Validate_RejectsDevBypassOutsideDevelopment é o teste que faltava
// para o item 1.4 do pack endurecimento-de-autenticacao: o boot precisa recusar
// a combinação AUTH_DEV_BYPASS_ENABLED=true fora de APP_ENV=development — sem
// isso, o bypass "000000" (autentica qualquer email sem Redis) poderia nascer
// ligado em produção por engano de configuração, e nada no build detectaria.
func Test_Config_Validate_RejectsDevBypassOutsideDevelopment(t *testing.T) {
	for _, env := range []string{"production", "staging", "test", ""} {
		cfg := baseValidConfig()
		cfg.App.Env = env
		cfg.Features.AuthDevBypassEnabled = true

		if err := cfg.validate(); err == nil {
			t.Fatalf("esperava erro para AUTH_DEV_BYPASS_ENABLED=true com APP_ENV=%q, veio nil", env)
		}
	}
}

func Test_Config_Validate_AllowsDevBypassInDevelopment(t *testing.T) {
	cfg := baseValidConfig()
	cfg.App.Env = "development"
	cfg.Features.AuthDevBypassEnabled = true

	if err := cfg.validate(); err != nil {
		t.Fatalf("bypass em development deveria ser aceito, erro: %v", err)
	}
}

func Test_Config_Validate_AllowsBypassDisabledInAnyEnv(t *testing.T) {
	for _, env := range []string{"production", "staging", "test", "development"} {
		cfg := baseValidConfig()
		cfg.App.Env = env
		cfg.Features.AuthDevBypassEnabled = false

		if err := cfg.validate(); err != nil {
			t.Fatalf("bypass desligado deveria passar em APP_ENV=%q, erro: %v", env, err)
		}
	}
}

func Test_Config_Validate_RejectsBillingEnabledWithoutStripeSecrets(t *testing.T) {
	cfg := baseValidConfig()
	cfg.Features.BillingEnabled = true

	if err := cfg.validate(); err == nil {
		t.Fatal("esperava erro para FEATURE_BILLING_ENABLED sem Stripe secrets, veio nil")
	}
}

func Test_Config_Validate_RejectsTutorAIEnabledWithoutAnthropicKey(t *testing.T) {
	cfg := baseValidConfig()
	cfg.Features.TutorAIEnabled = true

	if err := cfg.validate(); err == nil {
		t.Fatal("esperava erro para FEATURE_TUTOR_AI_ENABLED sem ANTHROPIC_API_KEY, veio nil")
	}
}
