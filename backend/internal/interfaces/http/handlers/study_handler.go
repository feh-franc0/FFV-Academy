package handlers

import (
	"net/http"

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

// GetRandomQuestions — GET /api/v1/simulados/{simuladoId}/study/random?count=1
// Auth: JWT required
// Returns random questions with full rich explanation for study mode.
func (h *StudyHandler) GetRandomQuestions(w http.ResponseWriter, r *http.Request) {
	simuladoID := chi.URLParam(r, "simuladoId")
	count := parseIntParam(r.URL.Query().Get("count"), 1)
	if count < 1 || count > 50 {
		count = 1
	}

	domain := r.URL.Query().Get("domain")
	difficulty := r.URL.Query().Get("difficulty")

	questions, err := h.questionRepo.GetRandom(r.Context(), simuladoID, count, domsim.QuestionQueryOpts{
		Domain:     domain,
		Difficulty: difficulty,
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
