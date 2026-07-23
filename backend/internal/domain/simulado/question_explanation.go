package simulado

import (
	"encoding/json"
	"fmt"
)

// QuestionExplanation é o schema rico de explicação (v2).
// whyWrong mapeia optionID → razão (ex: {"A": "...", "C": "..."}).
type QuestionExplanation struct {
	Summary          string            `json:"summary"`
	WhyCorrect       string            `json:"whyCorrect"`
	WhyWrong         map[string]string `json:"whyWrong,omitempty"`
	KeyConcept       string            `json:"keyConcept,omitempty"`
	CompareWith      []string          `json:"compareWith,omitempty"`
	RealWorldContext string            `json:"realWorldContext,omitempty"`
	CommonMistakes   []string          `json:"commonMistakes,omitempty"`
	TutorSeeds       []string          `json:"tutorSeeds,omitempty"`
}

// UnmarshalJSON tolera dados legados onde `compareWith`, `commonMistakes` ou
// `tutorSeeds` foram seedeados como STRING em vez de []string. Antes da
// migration 50, ~541 questões CLF tinham `commonMistakes` como string e isso
// crashava o /admin/questions com 500. A migration normaliza no banco, mas
// mantemos esta tolerância para sobreviver a qualquer reincidência em outro
// seed ou dump.
//
// Estratégia: usa shadow struct com json.RawMessage nos 3 campos suspeitos,
// e decodifica cada um aceitando ambos os formatos.
func (e *QuestionExplanation) UnmarshalJSON(data []byte) error {
	type shadow struct {
		Summary          string            `json:"summary"`
		WhyCorrect       string            `json:"whyCorrect"`
		WhyWrong         map[string]string `json:"whyWrong,omitempty"`
		KeyConcept       string            `json:"keyConcept,omitempty"`
		CompareWith      json.RawMessage   `json:"compareWith,omitempty"`
		RealWorldContext string            `json:"realWorldContext,omitempty"`
		CommonMistakes   json.RawMessage   `json:"commonMistakes,omitempty"`
		TutorSeeds       json.RawMessage   `json:"tutorSeeds,omitempty"`
	}
	var s shadow
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	e.Summary = s.Summary
	e.WhyCorrect = s.WhyCorrect
	e.WhyWrong = s.WhyWrong
	e.KeyConcept = s.KeyConcept
	e.RealWorldContext = s.RealWorldContext

	var err error
	if e.CompareWith, err = decodeStringOrSlice(s.CompareWith); err != nil {
		return fmt.Errorf("compareWith: %w", err)
	}
	if e.CommonMistakes, err = decodeStringOrSlice(s.CommonMistakes); err != nil {
		return fmt.Errorf("commonMistakes: %w", err)
	}
	if e.TutorSeeds, err = decodeStringOrSlice(s.TutorSeeds); err != nil {
		return fmt.Errorf("tutorSeeds: %w", err)
	}
	return nil
}

// decodeStringOrSlice aceita um JSON value que é string OR []string e
// devolve []string. Tolera null/ausente.
func decodeStringOrSlice(raw json.RawMessage) ([]string, error) {
	if len(raw) == 0 || string(raw) == "null" {
		return nil, nil
	}
	// Tenta array primeiro (caminho normal).
	var arr []string
	if err := json.Unmarshal(raw, &arr); err == nil {
		return arr, nil
	}
	// Cai pra string — envolve em slice de 1 elemento.
	var s string
	if err := json.Unmarshal(raw, &s); err == nil {
		if s == "" {
			return nil, nil
		}
		return []string{s}, nil
	}
	return nil, fmt.Errorf("valor deve ser string ou []string")
}

// DBQuestion é a struct de questão persistida no banco (schema completo).
// Separada de Question para não quebrar o catálogo estático existente.
type DBQuestion struct {
	ID           string
	SimuladoID   string
	Stem         string
	Options      []QuestionOption
	CorrectID    OptionID
	Explanation  QuestionExplanation
	Topic        Topic
	Domain       string
	Difficulty   Difficulty
	ScenarioType string
	Tags         []string
	Source       string
	Status       string
}
