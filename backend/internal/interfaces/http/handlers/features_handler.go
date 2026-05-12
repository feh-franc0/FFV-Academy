package handlers

import (
	"net/http"

	"github.com/fernandofv/api/internal/config"
)

// FeaturesHandler expõe o estado das feature flags ao frontend.
//
// Permite que o build estático do Next.js consulte em runtime quais features
// estão ativas (em vez de depender apenas de NEXT_PUBLIC_* em build time).
type FeaturesHandler struct {
	features config.FeaturesConfig
}

func NewFeaturesHandler(f config.FeaturesConfig) *FeaturesHandler {
	return &FeaturesHandler{features: f}
}

// Get retorna o estado público das feature flags.
// GET /api/v1/features
func (h *FeaturesHandler) Get(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Cache-Control", "public, max-age=60")
	WriteJSON(w, http.StatusOK, map[string]bool{
		"billing_enabled":    h.features.BillingEnabled,
		"tutor_ai_enabled":   h.features.TutorAIEnabled,
		"phone_auth_enabled": h.features.PhoneAuthEnabled,
	})
}
