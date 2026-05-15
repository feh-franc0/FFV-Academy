package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	appsim "github.com/fernandofv/api/internal/application/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// SimuladoHandler expõe os endpoints de simulados e tentativas.
//
// PADRÃO: Server-authoritative design — score calculado no servidor,
// paywall enforçado no servidor, timer no servidor.
type SimuladoHandler struct {
	catalog        domsim.CatalogProvider
	startAttempt   *appsim.StartAttemptUseCase
	answerQ        *appsim.AnswerQuestionUseCase
	toggleFlag     *appsim.ToggleReviewFlagUseCase
	finishAttempt  *appsim.FinishAttemptUseCase
	resumeAttempt  *appsim.ResumeAttemptUseCase
	listAttempts   *appsim.ListAttemptsUseCase
	cancelAttempt  *appsim.CancelAttemptUseCase
	reportQuestion *appsim.ReportQuestionUseCase
}

// WithCancelAttempt injeta o use case de cancelamento.
func (h *SimuladoHandler) WithCancelAttempt(uc *appsim.CancelAttemptUseCase) *SimuladoHandler {
	h.cancelAttempt = uc
	return h
}

// WithReportQuestion injeta o use case de report de questão.
func (h *SimuladoHandler) WithReportQuestion(uc *appsim.ReportQuestionUseCase) *SimuladoHandler {
	h.reportQuestion = uc
	return h
}

func NewSimuladoHandler(
	catalog domsim.CatalogProvider,
	start *appsim.StartAttemptUseCase,
	answer *appsim.AnswerQuestionUseCase,
	toggle *appsim.ToggleReviewFlagUseCase,
	finish *appsim.FinishAttemptUseCase,
	resume *appsim.ResumeAttemptUseCase,
	list *appsim.ListAttemptsUseCase,
) *SimuladoHandler {
	return &SimuladoHandler{
		catalog:       catalog,
		startAttempt:  start,
		answerQ:       answer,
		toggleFlag:    toggle,
		finishAttempt: finish,
		resumeAttempt: resume,
		listAttempts:  list,
	}
}

// ListSimulados retorna o catálogo de simulados disponíveis.
// GET /api/v1/simulados
func (h *SimuladoHandler) ListSimulados(w http.ResponseWriter, r *http.Request) {
	simulados, err := h.catalog.ListSimulados()
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	dtos := make([]SimuladoDTO, len(simulados))
	for i, s := range simulados {
		dtos[i] = simuladoToDTO(s)
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"simulados": dtos,
		"total":     len(dtos),
	})
}

// GetSimulado retorna um simulado específico do catálogo.
// GET /api/v1/simulados/{simuladoId}
func (h *SimuladoHandler) GetSimulado(w http.ResponseWriter, r *http.Request) {
	id := shared.SimuladoID(chi.URLParam(r, "simuladoId"))
	sim, err := h.catalog.GetSimulado(id)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, simuladoToDTO(sim))
}

// StartAttempt inicia ou retoma uma tentativa de simulado.
// POST /api/v1/simulados/{simuladoId}/attempts
func (h *SimuladoHandler) StartAttempt(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	simuladoID := shared.SimuladoID(chi.URLParam(r, "simuladoId"))

	cmd := appsim.StartAttemptCommand{
		UserID:     userID,
		SimuladoID: simuladoID,
	}

	result, err := h.startAttempt.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	status := http.StatusCreated
	if !result.IsNew {
		status = http.StatusOK
	}
	WriteJSON(w, status, map[string]interface{}{
		"attempt":  attemptToDTO(result.Attempt),
		"simulado": simuladoToDTO(result.Simulado),
	})
}

// ResumeAttempt retorna o estado atual de uma attempt ativa.
// GET /api/v1/simulados/{simuladoId}/attempts/active
func (h *SimuladoHandler) ResumeAttempt(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	simuladoID := shared.SimuladoID(chi.URLParam(r, "simuladoId"))

	result, err := h.resumeAttempt.Execute(r.Context(), userID, simuladoID)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"attempt":  attemptToDTO(result.Attempt),
		"simulado": simuladoToDTO(result.Simulado),
	})
}

// AnswerQuestion registra a resposta do usuário para uma questão.
// POST /api/v1/attempts/{attemptId}/answers
func (h *SimuladoHandler) AnswerQuestion(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	attemptID, err := shared.ParseAttemptID(chi.URLParam(r, "attemptId"))
	if err != nil {
		WriteError(w, http.StatusBadRequest, "attemptId inválido", "bad-request")
		return
	}

	var req struct {
		QuestionID string `json:"questionId"`
		OptionID   string `json:"optionId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo inválido", "bad-request")
		return
	}

	cmd := appsim.AnswerQuestionCommand{
		UserID:     userID,
		AttemptID:  attemptID,
		QuestionID: shared.QuestionID(req.QuestionID),
		OptionID:   domsim.OptionID(req.OptionID),
	}

	if err := h.answerQ.Execute(r.Context(), cmd); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ToggleReviewFlag marca/desmarca uma questão para revisão.
// POST /api/v1/attempts/{attemptId}/flags/{questionId}
func (h *SimuladoHandler) ToggleReviewFlag(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	attemptID, err := shared.ParseAttemptID(chi.URLParam(r, "attemptId"))
	if err != nil {
		WriteError(w, http.StatusBadRequest, "attemptId inválido", "bad-request")
		return
	}

	cmd := appsim.ToggleReviewFlagCommand{
		UserID:     userID,
		AttemptID:  attemptID,
		QuestionID: shared.QuestionID(chi.URLParam(r, "questionId")),
	}

	if err := h.toggleFlag.Execute(r.Context(), cmd); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// FinishAttempt finaliza e calcula o score da tentativa.
// POST /api/v1/attempts/{attemptId}/finish
func (h *SimuladoHandler) FinishAttempt(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	attemptID, err := shared.ParseAttemptID(chi.URLParam(r, "attemptId"))
	if err != nil {
		WriteError(w, http.StatusBadRequest, "attemptId inválido", "bad-request")
		return
	}

	cmd := appsim.FinishAttemptCommand{
		UserID:    userID,
		AttemptID: attemptID,
	}

	result, err := h.finishAttempt.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	weakTopics := make([]string, len(result.WeakTopics))
	for i, t := range result.WeakTopics {
		weakTopics[i] = string(t)
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"attempt":    attemptToDTO(result.Attempt),
		"weakTopics": weakTopics,
	})
}

// ListAttempts lista as tentativas do usuário autenticado.
// GET /api/v1/attempts
func (h *SimuladoHandler) ListAttempts(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	result, err := h.listAttempts.Execute(r.Context(), userID, 20, 0)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	dtos := make([]AttemptDTO, len(result.Attempts))
	for i, a := range result.Attempts {
		dtos[i] = attemptToDTO(a)
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"attempts": dtos,
		"total":    result.Total,
	})
}

// CancelAttempt cancela uma attempt em andamento.
// POST /api/v1/attempts/{attemptId}/cancel
func (h *SimuladoHandler) CancelAttempt(w http.ResponseWriter, r *http.Request) {
	if h.cancelAttempt == nil {
		WriteError(w, http.StatusNotImplemented, "cancel não configurado", "not-implemented")
		return
	}
	userID := middleware.UserIDFromContext(r.Context())
	attemptID, err := shared.ParseAttemptID(chi.URLParam(r, "attemptId"))
	if err != nil {
		WriteError(w, http.StatusBadRequest, "attemptId inválido", "bad-request")
		return
	}

	cmd := appsim.CancelAttemptCommand{
		UserID:    userID,
		AttemptID: attemptID,
		IP:        clientIPFromRequest(r),
		UserAgent: r.UserAgent(),
		RequestID: w.Header().Get("X-Request-ID"),
	}
	if err := h.cancelAttempt.Execute(r.Context(), cmd); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ReportQuestion registra um report sobre uma questão específica.
// POST /api/v1/questions/{questionId}/report
func (h *SimuladoHandler) ReportQuestion(w http.ResponseWriter, r *http.Request) {
	if h.reportQuestion == nil {
		WriteError(w, http.StatusNotImplemented, "report não configurado", "not-implemented")
		return
	}
	userID := middleware.UserIDFromContext(r.Context())
	questionID := shared.QuestionID(chi.URLParam(r, "questionId"))

	var req struct {
		SimuladoID string `json:"simuladoId"`
		Reason     string `json:"reason"`
		Comment    string `json:"comment"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo inválido", "bad-request")
		return
	}

	cmd := appsim.ReportQuestionCommand{
		UserID:     userID,
		SimuladoID: shared.SimuladoID(req.SimuladoID),
		QuestionID: questionID,
		Reason:     req.Reason,
		Comment:    req.Comment,
		IP:         clientIPFromRequest(r),
		UserAgent:  r.UserAgent(),
		RequestID:  w.Header().Get("X-Request-ID"),
	}
	res, err := h.reportQuestion.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusCreated, map[string]string{"reportId": res.ReportID})
}

