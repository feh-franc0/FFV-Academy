package handlers

import (
	"encoding/json"
	"net/http"

	apptutor "github.com/fernandofv/api/internal/application/tutor"
	"github.com/fernandofv/api/internal/domain/shared"
	domtutor "github.com/fernandofv/api/internal/domain/tutor"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// TutorHandler expõe os endpoints do Tutor de IA.
//
// PADRÃO: rate-limit por usuário/plano enforçado no use case.
// Claude API chamado apenas se cache miss (infra layer).
type TutorHandler struct {
	ask     *apptutor.AskUseCase
	enabled bool
}

func NewTutorHandler(ask *apptutor.AskUseCase) *TutorHandler {
	return &TutorHandler{ask: ask, enabled: true}
}

// WithEnabled controla se o handler responde ou retorna 503.
// Quando desabilitado (FEATURE_TUTOR_AI_ENABLED=false), retorna 503 sem
// chamar a API do Anthropic — evita custos com a integração não configurada.
func (h *TutorHandler) WithEnabled(enabled bool) *TutorHandler {
	h.enabled = enabled
	return h
}

// Ask responde uma pergunta sobre uma questão de simulado.
// POST /api/v1/tutor/ask
func (h *TutorHandler) Ask(w http.ResponseWriter, r *http.Request) {
	if !h.enabled {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_, _ = w.Write([]byte(`{"error":"tutor_ai_disabled","message":"Tutor AI is temporarily disabled"}`))
		return
	}
	var req struct {
		SimuladoID string `json:"simuladoId"`
		QuestionID string `json:"questionId"`
		Kind       string `json:"kind"` // "explain_correct", "explain_wrong", "hint"
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo inválido", "bad-request")
		return
	}

	userID := middleware.UserIDFromContext(r.Context())
	kind := domtutor.QueryKind(req.Kind)
	switch kind {
	case domtutor.KindPorQue, domtutor.KindAnalogia, domtutor.KindExemplo:
		// válido
	default:
		WriteError(w, http.StatusBadRequest, "kind inválido: use por-que, analogia ou exemplo", "bad-request")
		return
	}

	cmd := apptutor.AskCommand{
		UserID:     userID,
		SimuladoID: shared.SimuladoID(req.SimuladoID),
		QuestionID: shared.QuestionID(req.QuestionID),
		Kind:       kind,
		IsPro:      false, // verificado via JWT claim em produção
	}

	response, err := h.ask.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"explanation": response.Explanation,
		"cacheHit":    response.CacheHit,
	})
}
