package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	apppref "github.com/fernandofv/api/internal/application/preferences"
	dompref "github.com/fernandofv/api/internal/domain/preferences"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// PreferencesHandler expõe os endpoints de preferências pedagógicas do user.
//
//   - GET  /api/v1/me/preferences → retorna preferências (default vazio se 1ª vez)
//   - PUT  /api/v1/me/preferences → cria/atualiza (upsert). Marca onboarded.
//
// Ambos requerem JWT (montados dentro do grupo autenticado).
type PreferencesHandler struct {
	get    *apppref.GetPreferencesUseCase
	update *apppref.UpdatePreferencesUseCase
}

func NewPreferencesHandler(get *apppref.GetPreferencesUseCase, update *apppref.UpdatePreferencesUseCase) *PreferencesHandler {
	return &PreferencesHandler{get: get, update: update}
}

// frequencyDTO é a forma JSON de Frequency (discriminated union manual).
//   - kind: "daily" | "weekly" | "specific_days"
//   - daysPerWeek: presente quando kind == "weekly"
//   - weekdays: presente quando kind == "specific_days"
type frequencyDTO struct {
	Kind        string `json:"kind"`
	DaysPerWeek int    `json:"daysPerWeek,omitempty"`
	Weekdays    []int  `json:"weekdays,omitempty"`
}

// preferencesDTO é a forma do JSON exposta na API.
// Decisão: campos sempre presentes (nunca omitidos) para o frontend ter
// tipo estável. Listas vazias = []. SkillLevel "" = "not set".
//
// Campos da Fase 3 (mai/2026) — interestedBases, homeBase, learningGoals,
// topicTags, frequency, preferredMaterials — adicionados aditivamente.
// Frontend antigo (que só lê hubIds/etc.) continua funcionando.
type preferencesDTO struct {
	HubIDs               []string   `json:"hubIds"`
	TrailIDs             []string   `json:"trailIds"`
	CertificationIDs     []string   `json:"certificationIds"`
	Objectives           []string   `json:"objectives"`
	SkillLevel           string     `json:"skillLevel"`
	DailyQuestionEnabled bool       `json:"dailyQuestionEnabled"`
	Onboarded            bool       `json:"onboarded"`
	OnboardedAt          *time.Time `json:"onboardedAt,omitempty"`
	UpdatedAt            time.Time  `json:"updatedAt"`

	// Fase 3 — modelagem da plataforma ao perfil de aprendizado.
	InterestedBases    []string     `json:"interestedBases"`
	HomeBase           string       `json:"homeBase"` // "" = sem preferência
	LearningGoals      string       `json:"learningGoals"`
	TopicTags          []string     `json:"topicTags"`
	Frequency          frequencyDTO `json:"frequency"`
	PreferredMaterials []string     `json:"preferredMaterials"`
}

func toDTO(p *dompref.Preferences) preferencesDTO {
	freq := p.Frequency()
	mats := p.PreferredMaterials()
	matsStr := make([]string, 0, len(mats))
	for _, m := range mats {
		matsStr = append(matsStr, string(m))
	}
	return preferencesDTO{
		HubIDs:               p.HubIDs(),
		TrailIDs:             p.TrailIDs(),
		CertificationIDs:     p.CertificationIDs(),
		Objectives:           p.Objectives(),
		SkillLevel:           string(p.SkillLevel()),
		DailyQuestionEnabled: p.DailyQuestionEnabled(),
		Onboarded:            p.IsOnboarded(),
		OnboardedAt:          p.OnboardedAt(),
		UpdatedAt:            p.UpdatedAt(),
		InterestedBases:      p.InterestedBases(),
		HomeBase:             p.HomeBase(),
		LearningGoals:        p.LearningGoals(),
		TopicTags:            p.TopicTags(),
		Frequency: frequencyDTO{
			Kind:        string(freq.Kind),
			DaysPerWeek: freq.DaysPerWeek,
			Weekdays:    freq.Weekdays,
		},
		PreferredMaterials: matsStr,
	}
}

// Get — GET /api/v1/me/preferences
func (h *PreferencesHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	prefs, err := h.get.Execute(r.Context(), userID)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, toDTO(prefs))
}

// updateRequest replica os campos editáveis. Ponteiros distinguem "ausente"
// (não tocar) de "vazio" (limpar).
type updateRequest struct {
	HubIDs               *[]string `json:"hubIds"`
	TrailIDs             *[]string `json:"trailIds"`
	CertificationIDs     *[]string `json:"certificationIds"`
	Objectives           *[]string `json:"objectives"`
	SkillLevel           *string   `json:"skillLevel"`
	DailyQuestionEnabled *bool     `json:"dailyQuestionEnabled"`

	// Fase 3.
	InterestedBases    *[]string     `json:"interestedBases,omitempty"`
	HomeBase           *string       `json:"homeBase,omitempty"`
	LearningGoals      *string       `json:"learningGoals,omitempty"`
	TopicTags          *[]string     `json:"topicTags,omitempty"`
	Frequency          *frequencyDTO `json:"frequency,omitempty"`
	PreferredMaterials *[]string     `json:"preferredMaterials,omitempty"`
}

// Update — PUT /api/v1/me/preferences
func (h *PreferencesHandler) Update(w http.ResponseWriter, r *http.Request) {
	var req updateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo inválido", "bad-request")
		return
	}

	userID := middleware.UserIDFromContext(r.Context())
	cmd := apppref.UpdatePreferencesCommand{
		UserID:               userID,
		HubIDs:               req.HubIDs,
		TrailIDs:             req.TrailIDs,
		CertificationIDs:     req.CertificationIDs,
		Objectives:           req.Objectives,
		SkillLevel:           req.SkillLevel,
		DailyQuestionEnabled: req.DailyQuestionEnabled,
		InterestedBases:      req.InterestedBases,
		HomeBase:             req.HomeBase,
		LearningGoals:        req.LearningGoals,
		TopicTags:            req.TopicTags,
		PreferredMaterials:   req.PreferredMaterials,
	}
	if req.Frequency != nil {
		cmd.Frequency = &apppref.FrequencyInput{
			Kind:        req.Frequency.Kind,
			DaysPerWeek: req.Frequency.DaysPerWeek,
			Weekdays:    req.Frequency.Weekdays,
		}
	}

	prefs, err := h.update.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, toDTO(prefs))
}
