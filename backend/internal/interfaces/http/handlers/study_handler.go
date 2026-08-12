package handlers

import (
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// StudyHandler serves random questions for the free study mode.
type StudyHandler struct {
	questionRepo domsim.QuestionRepository
	attemptRepo  domsim.AttemptRepository
}

func NewStudyHandler(repo domsim.QuestionRepository, attemptRepo domsim.AttemptRepository) *StudyHandler {
	return &StudyHandler{questionRepo: repo, attemptRepo: attemptRepo}
}

// hasActiveAttempt reporta se o usuário autenticado tem uma tentativa ATIVA
// (não finalizada) do simulado — achado P-01 da auditoria de 11/ago/2026:
// enquanto uma prova cronometrada está em andamento, NENHUMA rota pode
// revelar correctId/explanation para questões daquele simulado, seja
// `study/random`, `questions` (listagem) ou `questions/batch`. Função de
// pacote (não método) porque `StudyHandler` e `SimuladoHandler` precisam da
// MESMA checagem — duas implementações que podem divergir foi exatamente
// como o achado original nasceu (dto.go tinha essa lição pra outro caso).
// Sem `attemptRepo` configurado (nunca deveria acontecer em produção) ou sem
// userID no contexto, falha fechado — trata como "tem tentativa ativa" para
// nunca vazar gabarito por má configuração.
func hasActiveAttempt(r *http.Request, attemptRepo domsim.AttemptRepository, simuladoID string) bool {
	if attemptRepo == nil {
		return true
	}
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		return true
	}
	_, err := attemptRepo.FindActiveByUserAndSimulado(r.Context(), userID, shared.SimuladoID(simuladoID))
	return err == nil
}

// GetRandomQuestions — GET /api/v1/simulados/{simuladoId}/study/random?count=1&domain=X&difficulty=Y&excludeIds=a,b,c
// Auth: JWT required
// Returns random questions with full rich explanation for study mode — EXCETO
// quando o usuário tem uma tentativa ativa do mesmo simulado, caso em que
// retorna o DTO sem gabarito (mesmo contrato do runner de prova). `count` é
// clamped a [1, 100]; default = 1. `excludeIds` é uma CSV de IDs a pular.
func (h *StudyHandler) GetRandomQuestions(w http.ResponseWriter, r *http.Request) {
	simuladoID := chi.URLParam(r, "simuladoId")
	count := parseIntParam(r.URL.Query().Get("count"), 1)
	if count < 1 {
		count = 1
	}
	if count > 100 {
		count = 100
	}

	domain := r.URL.Query().Get("domain")
	difficulty := r.URL.Query().Get("difficulty")
	excludeIDs := parseCSV(r.URL.Query().Get("excludeIds"))

	questions, err := h.questionRepo.GetRandom(r.Context(), simuladoID, count, domsim.QuestionQueryOpts{
		Domain:     domain,
		Difficulty: difficulty,
		ExcludeIDs: excludeIDs,
	})
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	if hasActiveAttempt(r, h.attemptRepo, simuladoID) {
		dtos := make([]ExamQuestionDTO, len(questions))
		for i, q := range questions {
			dtos[i] = dbQuestionToExamDTO(q)
		}
		WriteJSON(w, http.StatusOK, map[string]interface{}{
			"questions": dtos,
			"total":     len(dtos),
		})
		return
	}

	dtos := make([]DBQuestionDTO, len(questions))
	for i, q := range questions {
		dtos[i] = dbQuestionToDTO(q)
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"questions": dtos,
		"total":     len(dtos),
	})
}

// GetQuestionsByIDs — GET /api/v1/simulados/{simuladoId}/questions/batch?ids=a,b,c
// Auth: JWT required
// Usado por ResultadoClient pra render da revisão pós-prova. Antes da
// correção de P-01, servia gabarito para QUALQUER id, pra qualquer
// autenticado — sem checar tentativa ativa nem ownership. Regra agora:
//  1. Tentativa ativa do mesmo simulado → nenhum id revela gabarito.
//  2. Sem tentativa ativa → só ids que pertencem a QuestionIDs() de alguma
//     tentativa FINALIZADA do próprio usuário revelam gabarito; os demais
//     vêm sem correctId/explanation (não é erro — só não abrem a chave).
//
// Max 200 IDs por call (mesmo teto de simulado.questionCount).
func (h *StudyHandler) GetQuestionsByIDs(w http.ResponseWriter, r *http.Request) {
	simuladoID := chi.URLParam(r, "simuladoId")
	ids := parseCSV(r.URL.Query().Get("ids"))
	if len(ids) == 0 {
		WriteJSON(w, http.StatusOK, map[string]interface{}{"questions": []DBQuestionDTO{}, "total": 0})
		return
	}
	if len(ids) > 200 {
		ids = ids[:200]
	}

	questions, err := h.questionRepo.FindByIDs(r.Context(), simuladoID, ids)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	allowedIDs := h.ownedFinishedQuestionIDs(r, simuladoID)

	dtos := make([]interface{}, len(questions))
	for i, q := range questions {
		if allowedIDs[q.ID] {
			dtos[i] = dbQuestionToDTO(q)
		} else {
			dtos[i] = dbQuestionToExamDTO(q)
		}
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"questions": dtos,
		"total":     len(dtos),
	})
}

// ownedFinishedQuestionIDs retorna o conjunto de questionIDs que o usuário
// autenticado pode ver com gabarito: união de QuestionIDs() de todas as suas
// tentativas FINALIZADAS do simulado — desde que não haja uma tentativa
// ATIVA do mesmo simulado agora (nesse caso, conjunto vazio: nada revela
// gabarito enquanto uma prova está em andamento). Sem `attemptRepo`
// configurado ou sem userID no contexto, falha fechado (conjunto vazio).
func (h *StudyHandler) ownedFinishedQuestionIDs(r *http.Request, simuladoID string) map[string]bool {
	empty := map[string]bool{}
	if h.attemptRepo == nil {
		return empty
	}
	userID := middleware.UserIDFromContext(r.Context())
	if userID == "" {
		return empty
	}
	if hasActiveAttempt(r, h.attemptRepo, simuladoID) {
		return empty
	}
	finished, err := h.attemptRepo.ListFinishedByUserAndSimulado(r.Context(), userID, shared.SimuladoID(simuladoID))
	if err != nil {
		return empty
	}
	allowed := make(map[string]bool)
	for _, attempt := range finished {
		for _, qid := range attempt.QuestionIDs() {
			allowed[string(qid)] = true
		}
	}
	return allowed
}

// parseCSV splits a comma-separated string into trimmed non-empty tokens.
func parseCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

// CountQuestions — GET /api/v1/simulados/{simuladoId}/questions/count
// Public endpoint: returns count of active questions (used to gate UI).
func (h *StudyHandler) CountQuestions(w http.ResponseWriter, r *http.Request) {
	simuladoID := chi.URLParam(r, "simuladoId")
	count, err := h.questionRepo.CountBySimulado(r.Context(), simuladoID)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"simuladoId": simuladoID,
		"count":      count,
	})
}
