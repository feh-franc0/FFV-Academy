package handlers

import (
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"

	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// StudyHandler serves random questions for the free study mode.
type StudyHandler struct {
	questionRepo domsim.QuestionRepository
}

func NewStudyHandler(repo domsim.QuestionRepository) *StudyHandler {
	return &StudyHandler{questionRepo: repo}
}

// GetRandomQuestions — GET /api/v1/simulados/{simuladoId}/study/random?count=1&domain=X&difficulty=Y&excludeIds=a,b,c
// Auth: JWT required
// Returns random questions with full rich explanation for study mode.
// `count` is clamped to [1, 100]; default = 1. `excludeIds` is a CSV of question IDs to skip.
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
// Returns full questions for a given set of IDs (used by ResultadoClient to render the post-attempt review).
// Max 200 IDs per call (matches simulado.questionCount caps).
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

	dtos := make([]DBQuestionDTO, len(questions))
	for i, q := range questions {
		dtos[i] = dbQuestionToDTO(q)
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"questions": dtos,
		"total":     len(dtos),
	})
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
