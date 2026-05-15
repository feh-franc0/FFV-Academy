package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// AdminQuestionsHandler — CRUD admin para questões.
// Todos os endpoints requerem role=admin.
type AdminQuestionsHandler struct {
	questionRepo domsim.QuestionRepository
}

func NewAdminQuestionsHandler(repo domsim.QuestionRepository) *AdminQuestionsHandler {
	return &AdminQuestionsHandler{questionRepo: repo}
}

// ListQuestions — GET /api/v1/admin/questions?simulado_id=aws-clf&domain=&difficulty=&search=&limit=50&offset=0
func (h *AdminQuestionsHandler) ListQuestions(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	limit := parseIntParam(q.Get("limit"), 50)
	if limit > 200 {
		limit = 200
	}
	if limit < 1 {
		limit = 1
	}
	offset := parseIntParam(q.Get("offset"), 0)
	if offset < 0 {
		offset = 0
	}

	filter := domsim.QuestionFilter{
		SimuladoID: q.Get("simulado_id"),
		Domain:     q.Get("domain"),
		Difficulty: q.Get("difficulty"),
		Status:     q.Get("status"),
		Search:     q.Get("search"),
		Limit:      limit,
		Offset:     offset,
	}

	questions, total, err := h.questionRepo.List(r.Context(), filter)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	dtos := make([]DBQuestionDTO, len(questions))
	for i, question := range questions {
		dtos[i] = dbQuestionToDTO(question)
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"data":   dtos,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// GetQuestion — GET /api/v1/admin/questions/{questionId}
func (h *AdminQuestionsHandler) GetQuestion(w http.ResponseWriter, r *http.Request) {
	questionID := chi.URLParam(r, "questionId")
	if questionID == "" {
		WriteError(w, http.StatusBadRequest, "questionId é obrigatório", "bad-request")
		return
	}

	question, err := h.questionRepo.FindByID(r.Context(), questionID)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, dbQuestionToDTO(question))
}

// createUpdateQuestionRequest é o body aceito em Create/Update.
type createUpdateQuestionRequest struct {
	ID           string             `json:"id"`
	SimuladoID   string             `json:"simuladoId"`
	Stem         string             `json:"stem"`
	Options      []optionRequest    `json:"options"`
	CorrectID    string             `json:"correctId"`
	Explanation  explanationRequest `json:"explanation"`
	Topic        string             `json:"topic"`
	Domain       string             `json:"domain"`
	Difficulty   string             `json:"difficulty"`
	ScenarioType string             `json:"scenarioType"`
	Tags         []string           `json:"tags"`
	Source       string             `json:"source"`
	Status       string             `json:"status"`
}

type optionRequest struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}

type explanationRequest struct {
	Summary          string            `json:"summary"`
	WhyCorrect       string            `json:"whyCorrect"`
	WhyWrong         map[string]string `json:"whyWrong,omitempty"`
	KeyConcept       string            `json:"keyConcept,omitempty"`
	CompareWith      []string          `json:"compareWith,omitempty"`
	RealWorldContext string            `json:"realWorldContext,omitempty"`
	CommonMistakes   []string          `json:"commonMistakes,omitempty"`
	TutorSeeds       []string          `json:"tutorSeeds,omitempty"`
}

// CreateQuestion — POST /api/v1/admin/questions
func (h *AdminQuestionsHandler) CreateQuestion(w http.ResponseWriter, r *http.Request) {
	var req createUpdateQuestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo inválido", "bad-request")
		return
	}

	if req.ID == "" {
		WriteError(w, http.StatusBadRequest, "campo 'id' é obrigatório", "validation-error")
		return
	}

	if err := validateQuestionRequest(req); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error(), "validation-error")
		return
	}

	question := requestToDBQuestion(req.ID, req)

	if err := h.questionRepo.Create(r.Context(), question); err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusCreated, dbQuestionToDTO(question))
}

// UpdateQuestion — PUT /api/v1/admin/questions/{questionId}
func (h *AdminQuestionsHandler) UpdateQuestion(w http.ResponseWriter, r *http.Request) {
	questionID := chi.URLParam(r, "questionId")
	if questionID == "" {
		WriteError(w, http.StatusBadRequest, "questionId é obrigatório", "bad-request")
		return
	}

	var req createUpdateQuestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo inválido", "bad-request")
		return
	}

	if err := validateQuestionRequest(req); err != nil {
		WriteError(w, http.StatusBadRequest, err.Error(), "validation-error")
		return
	}

	question := requestToDBQuestion(questionID, req)

	if err := h.questionRepo.Update(r.Context(), question); err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, dbQuestionToDTO(question))
}

// DeleteQuestion — DELETE /api/v1/admin/questions/{questionId}
func (h *AdminQuestionsHandler) DeleteQuestion(w http.ResponseWriter, r *http.Request) {
	questionID := chi.URLParam(r, "questionId")
	if questionID == "" {
		WriteError(w, http.StatusBadRequest, "questionId é obrigatório", "bad-request")
		return
	}

	if err := h.questionRepo.Delete(r.Context(), questionID); err != nil {
		HandleDomainError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// --- helpers ---

func validateQuestionRequest(req createUpdateQuestionRequest) error {
	if req.Stem == "" {
		return fmt.Errorf("%w: stem é obrigatório", shared.ErrValidation)
	}
	if len(req.Options) < 2 || len(req.Options) > 5 {
		return fmt.Errorf("%w: questão deve ter entre 2 e 5 opções", shared.ErrValidation)
	}

	optIDs := make(map[string]struct{}, len(req.Options))
	for _, o := range req.Options {
		if o.ID == "" {
			return fmt.Errorf("%w: cada opção precisa de um id", shared.ErrValidation)
		}
		optIDs[o.ID] = struct{}{}
	}

	if req.CorrectID == "" {
		return fmt.Errorf("%w: correctId é obrigatório", shared.ErrValidation)
	}
	if _, ok := optIDs[req.CorrectID]; !ok {
		return fmt.Errorf("%w: correctId deve estar entre as opções", shared.ErrValidation)
	}

	switch domsim.Difficulty(req.Difficulty) {
	case domsim.DifficultyEasy, domsim.DifficultyMedium, domsim.DifficultyHard, "":
		// ok
	default:
		return fmt.Errorf("%w: difficulty inválida (easy|medium|hard)", shared.ErrValidation)
	}

	return nil
}

func requestToDBQuestion(id string, req createUpdateQuestionRequest) *domsim.DBQuestion {
	opts := make([]domsim.QuestionOption, len(req.Options))
	for i, o := range req.Options {
		opts[i] = domsim.QuestionOption{ID: domsim.OptionID(o.ID), Text: o.Text}
	}

	difficulty := domsim.Difficulty(req.Difficulty)
	if difficulty == "" {
		difficulty = domsim.DifficultyMedium
	}

	status := req.Status
	if status == "" {
		status = "active"
	}

	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	return &domsim.DBQuestion{
		ID:         id,
		SimuladoID: req.SimuladoID,
		Stem:       req.Stem,
		Options:    opts,
		CorrectID:  domsim.OptionID(req.CorrectID),
		Explanation: domsim.QuestionExplanation{
			Summary:          req.Explanation.Summary,
			WhyCorrect:       req.Explanation.WhyCorrect,
			WhyWrong:         req.Explanation.WhyWrong,
			KeyConcept:       req.Explanation.KeyConcept,
			CompareWith:      req.Explanation.CompareWith,
			RealWorldContext: req.Explanation.RealWorldContext,
			CommonMistakes:   req.Explanation.CommonMistakes,
			TutorSeeds:       req.Explanation.TutorSeeds,
		},
		Topic:        domsim.Topic(req.Topic),
		Domain:       req.Domain,
		Difficulty:   difficulty,
		ScenarioType: req.ScenarioType,
		Tags:         tags,
		Source:       req.Source,
		Status:       status,
	}
}
