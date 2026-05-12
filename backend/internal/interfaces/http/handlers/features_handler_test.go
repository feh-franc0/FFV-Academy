// Package handlers — testes unitários do FeaturesHandler.
//
// PADRÃO: testes com httptest — sem Docker, sem DB.
// O handler é stateless e depende apenas de uma struct de config simples.
package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/fernandofv/api/internal/config"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// Test 1: todas as flags desabilitadas → response com todas em false.
func Test_FeaturesHandler_AllDisabled_ReturnsAllFalse(t *testing.T) {
	h := handlers.NewFeaturesHandler(config.FeaturesConfig{
		BillingEnabled:   false,
		TutorAIEnabled:   false,
		PhoneAuthEnabled: false,
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/features", http.NoBody)
	w := httptest.NewRecorder()
	h.Get(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var body map[string]bool
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	if body["billing_enabled"] {
		t.Errorf("esperado billing_enabled=false, got true")
	}
	if body["tutor_ai_enabled"] {
		t.Errorf("esperado tutor_ai_enabled=false, got true")
	}
	if body["phone_auth_enabled"] {
		t.Errorf("esperado phone_auth_enabled=false, got true")
	}
}

// Test 2: todas as flags habilitadas → response com todas em true.
func Test_FeaturesHandler_AllEnabled_ReturnsAllTrue(t *testing.T) {
	h := handlers.NewFeaturesHandler(config.FeaturesConfig{
		BillingEnabled:   true,
		TutorAIEnabled:   true,
		PhoneAuthEnabled: true,
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/features", http.NoBody)
	w := httptest.NewRecorder()
	h.Get(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var body map[string]bool
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	if !body["billing_enabled"] {
		t.Errorf("esperado billing_enabled=true, got false")
	}
	if !body["tutor_ai_enabled"] {
		t.Errorf("esperado tutor_ai_enabled=true, got false")
	}
	if !body["phone_auth_enabled"] {
		t.Errorf("esperado phone_auth_enabled=true, got false")
	}
}

// Test 3: flags mistas (apenas billing on) → response reflete o estado misto.
func Test_FeaturesHandler_MixedFlags_ReturnsCorrectState(t *testing.T) {
	h := handlers.NewFeaturesHandler(config.FeaturesConfig{
		BillingEnabled:   true,
		TutorAIEnabled:   false,
		PhoneAuthEnabled: false,
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/features", http.NoBody)
	w := httptest.NewRecorder()
	h.Get(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}

	var body map[string]bool
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}

	if !body["billing_enabled"] {
		t.Errorf("esperado billing_enabled=true, got false")
	}
	if body["tutor_ai_enabled"] {
		t.Errorf("esperado tutor_ai_enabled=false, got true")
	}
	if body["phone_auth_enabled"] {
		t.Errorf("esperado phone_auth_enabled=false, got true")
	}
}

// Test 4: Content-Type deve ser JSON (handler usa WriteJSON do httputil, que seta
// application/problem+json para padronizar com responses de erro RFC 7807 —
// verificamos apenas que o subtipo "json" está presente, como em health_test).
func Test_FeaturesHandler_ResponseHasContentType_ApplicationJSON(t *testing.T) {
	h := handlers.NewFeaturesHandler(config.FeaturesConfig{})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/features", http.NoBody)
	w := httptest.NewRecorder()
	h.Get(w, req)

	ct := w.Header().Get("Content-Type")
	if ct == "" {
		t.Fatal("esperado Content-Type não vazio")
	}
	// O httputil.WriteJSON sempre seta um content-type contendo "json".
	if !containsSubstring(ct, "json") {
		t.Errorf("esperado Content-Type contendo 'json', got %q", ct)
	}
}

// Test 5: Cache-Control deve ser public, max-age=60.
func Test_FeaturesHandler_ResponseHasCacheControl_60s(t *testing.T) {
	h := handlers.NewFeaturesHandler(config.FeaturesConfig{})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/features", http.NoBody)
	w := httptest.NewRecorder()
	h.Get(w, req)

	cc := w.Header().Get("Cache-Control")
	if cc != "public, max-age=60" {
		t.Errorf("esperado Cache-Control 'public, max-age=60', got %q", cc)
	}
}

// Test 6: o handler.Get ignora o método HTTP (não checa) — método é responsabilidade
// do router (chi.Get). Chamar diretamente com POST/PUT/DELETE ainda retorna 200.
// Esse teste documenta esse comportamento explicitamente para evitar regressões.
func Test_FeaturesHandler_OnlyGETAllowed(t *testing.T) {
	h := handlers.NewFeaturesHandler(config.FeaturesConfig{})

	for _, method := range []string{http.MethodPost, http.MethodPut, http.MethodDelete} {
		req := httptest.NewRequest(method, "/api/v1/features", http.NoBody)
		w := httptest.NewRecorder()
		h.Get(w, req)

		// O handler em si não filtra método — o roteamento é feito pelo chi.
		// Aqui apenas garantimos que ele não panica e responde 200 quando invocado
		// diretamente. A restrição de método é coberta pelo teste de contrato.
		if w.Code != http.StatusOK {
			t.Errorf("método %s: esperado 200 do handler isolado, got %d", method, w.Code)
		}
	}
}

func containsSubstring(s, substr string) bool {
	for i := 0; i+len(substr) <= len(s); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
