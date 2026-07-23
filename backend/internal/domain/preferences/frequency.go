// Frequency e MaterialKind — VOs da Fase 3 do PERSONALIZATION_PLAN.
//
// Frequency representa o ritmo declarado pelo aluno. 3 tipos:
//   - Daily: todo dia
//   - Weekly: N dias por semana (1-7)
//   - SpecificDays: dias específicos (subset de 0=dom..6=sáb)
//
// MaterialKind é o formato preferido de material: video, text, quiz, srs, cheatsheet.

package preferences

import (
	"fmt"

	"github.com/fernandofv/api/internal/domain/shared"
)

// FrequencyKind — tipo do ritmo declarado.
type FrequencyKind string

const (
	FrequencyDaily        FrequencyKind = "daily"
	FrequencyWeekly       FrequencyKind = "weekly"
	FrequencySpecificDays FrequencyKind = "specific_days"
)

// IsValid retorna true se é um dos kinds conhecidos.
func (k FrequencyKind) IsValid() bool {
	switch k {
	case FrequencyDaily, FrequencyWeekly, FrequencySpecificDays:
		return true
	}
	return false
}

// Frequency é o VO que carrega o kind + payload.
//
// INVARIANTES:
//   - Daily: DaysPerWeek e Weekdays ignorados (zerados)
//   - Weekly: DaysPerWeek ∈ [1, 7]
//   - SpecificDays: Weekdays é subset não-vazio de [0..6] sem duplicatas
type Frequency struct {
	Kind        FrequencyKind
	DaysPerWeek int   // só se Kind == Weekly
	Weekdays    []int // só se Kind == SpecificDays, ordenado, 0=dom..6=sáb
}

// DefaultFrequency é o valor inicial pra usuários novos.
func DefaultFrequency() Frequency {
	return Frequency{Kind: FrequencyWeekly, DaysPerWeek: 3}
}

// NewFrequency constrói + valida o VO.
func NewFrequency(kind FrequencyKind, daysPerWeek int, weekdays []int) (Frequency, error) {
	if !kind.IsValid() {
		return Frequency{}, shared.NewValidationError(fmt.Sprintf("frequency.kind inválido: %q", kind))
	}

	switch kind {
	case FrequencyDaily:
		return Frequency{Kind: kind}, nil

	case FrequencyWeekly:
		if daysPerWeek < 1 || daysPerWeek > 7 {
			return Frequency{}, shared.NewValidationError(
				fmt.Sprintf("frequency.daysPerWeek deve ser entre 1 e 7, got %d", daysPerWeek),
			)
		}
		return Frequency{Kind: kind, DaysPerWeek: daysPerWeek}, nil

	case FrequencySpecificDays:
		if len(weekdays) == 0 {
			return Frequency{}, shared.NewValidationError("frequency.weekdays não pode estar vazio")
		}
		seen := make(map[int]bool, len(weekdays))
		clean := make([]int, 0, len(weekdays))
		for _, d := range weekdays {
			if d < 0 || d > 6 {
				return Frequency{}, shared.NewValidationError(
					fmt.Sprintf("frequency.weekdays contém valor inválido: %d (esperado 0-6)", d),
				)
			}
			if !seen[d] {
				seen[d] = true
				clean = append(clean, d)
			}
		}
		// Ordena pra ter saída estável
		for i := 0; i < len(clean); i++ {
			for j := i + 1; j < len(clean); j++ {
				if clean[i] > clean[j] {
					clean[i], clean[j] = clean[j], clean[i]
				}
			}
		}
		return Frequency{Kind: kind, Weekdays: clean}, nil
	}

	return Frequency{}, shared.NewValidationError(fmt.Sprintf("frequency.kind não suportado: %q", kind))
}

// MaterialKind — formato preferido de material.
type MaterialKind string

const (
	MaterialVideo      MaterialKind = "video"
	MaterialText       MaterialKind = "text"
	MaterialQuiz       MaterialKind = "quiz"
	MaterialSRS        MaterialKind = "srs"
	MaterialCheatsheet MaterialKind = "cheatsheet"
)

var validMaterialKinds = map[MaterialKind]bool{
	MaterialVideo:      true,
	MaterialText:       true,
	MaterialQuiz:       true,
	MaterialSRS:        true,
	MaterialCheatsheet: true,
}

// IsValid retorna true se é uma kind conhecida.
func (m MaterialKind) IsValid() bool {
	return validMaterialKinds[m]
}

// MaxMaterials — limite no array preferred_materials.
const MaxMaterials = 5

// sanitizeMaterials valida + dedup. Ordena alfabeticamente.
func sanitizeMaterials(input []MaterialKind) ([]MaterialKind, error) {
	if len(input) > MaxMaterials {
		return nil, shared.NewValidationError(
			fmt.Sprintf("preferredMaterials excede máximo %d", MaxMaterials),
		)
	}
	seen := make(map[MaterialKind]bool, len(input))
	out := make([]MaterialKind, 0, len(input))
	for _, m := range input {
		if !m.IsValid() {
			return nil, shared.NewValidationError(fmt.Sprintf("material inválido: %q", m))
		}
		if !seen[m] {
			seen[m] = true
			out = append(out, m)
		}
	}
	// Ordena pra estabilidade
	for i := 0; i < len(out); i++ {
		for j := i + 1; j < len(out); j++ {
			if out[i] > out[j] {
				out[i], out[j] = out[j], out[i]
			}
		}
	}
	return out, nil
}

// DefaultMaterials — escolha conservadora pra usuários novos.
func DefaultMaterials() []MaterialKind {
	return []MaterialKind{MaterialText, MaterialQuiz}
}
