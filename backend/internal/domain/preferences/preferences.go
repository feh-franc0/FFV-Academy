// Package preferences modela as preferências pedagógicas do usuário.
//
// PADRÕES:
//   - DDD: Preferences é o aggregate root (1:1 com User via UserID).
//   - Onboarded: marcador de conclusão do wizard inicial; null = wizard
//     bloqueante ainda deve aparecer.
//   - Listas (Hubs, Trails, Certifications, Objectives) usam slice de
//     string sem ordem semântica; deduplicação garantida no Update.
package preferences

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// SkillLevel — nível autodeclarado do usuário.
type SkillLevel string

const (
	SkillBeginner     SkillLevel = "beginner"
	SkillIntermediate SkillLevel = "intermediate"
	SkillAdvanced     SkillLevel = "advanced"
)

// IsValid retorna true se o nível é um dos valores conhecidos OU vazio (não respondido).
func (s SkillLevel) IsValid() bool {
	switch s {
	case "", SkillBeginner, SkillIntermediate, SkillAdvanced:
		return true
	}
	return false
}

// Objectives canônicos. Outros valores são rejeitados na validação.
const (
	ObjectiveCertifications = "certifications" // Passar em provas oficiais
	ObjectiveCareerGrowth   = "career_growth"  // Evoluir profissionalmente
	ObjectiveHobby          = "hobby"          // Curiosidade técnica
	ObjectiveCareerSwitch   = "career_switch"  // Trocar de área
)

var validObjectives = map[string]bool{
	ObjectiveCertifications: true,
	ObjectiveCareerGrowth:   true,
	ObjectiveHobby:          true,
	ObjectiveCareerSwitch:   true,
}

// Limites — defendem contra payloads abusivos e queries lentas.
const (
	MaxHubIDs           = 16
	MaxTrailIDs         = 64
	MaxCertificationIDs = 16
	MaxObjectives       = 4
	MaxIDLength         = 64
	// Adicionados na Fase 3 (PERSONALIZATION_PLAN_2026-05.md):
	MaxInterestedBases  = 50
	MaxTopicTags        = 50
	MaxLearningGoalsLen = 280
)

// Preferences é o aggregate root. Cada User tem no máximo um Preferences (1:1).
//
// INVARIANTES:
//  1. Slices são deduplicadas e ordenadas (diff estável).
//  2. Cada ID em qualquer slice é não-vazio, ≤ MaxIDLength e composto por
//     [a-z0-9-_] (slug-friendly).
//  3. Objectives ∈ {certifications, career_growth, hobby, career_switch}.
//  4. SkillLevel ∈ {"", beginner, intermediate, advanced}.
//  5. OnboardedAt é set automaticamente na PRIMEIRA chamada de Update com
//     ao menos hub/cert/objetivo preenchido — não pode voltar a NULL.
type Preferences struct {
	userID               shared.UserID
	hubIDs               []string
	trailIDs             []string
	certificationIDs     []string
	objectives           []string
	skillLevel           SkillLevel
	dailyQuestionEnabled bool
	onboardedAt          *time.Time
	createdAt            time.Time
	updatedAt            time.Time

	// Fase 3 (PERSONALIZATION_PLAN_2026-05.md) — modelagem da plataforma
	// ao perfil de aprendizado do aluno.
	interestedBases    []string
	homeBase           string // vazio = sem preferência
	learningGoals      string
	topicTags          []string
	frequency          Frequency
	preferredMaterials []MaterialKind
}

// New cria Preferences padrão para um usuário (estado "wizard pendente").
func New(userID shared.UserID, now time.Time) *Preferences {
	return &Preferences{
		userID:               userID,
		hubIDs:               []string{},
		trailIDs:             []string{},
		certificationIDs:     []string{},
		objectives:           []string{},
		skillLevel:           "",
		dailyQuestionEnabled: true,
		onboardedAt:          nil,
		createdAt:            now,
		updatedAt:            now,
		// Defaults da Fase 3.
		interestedBases:    []string{},
		homeBase:           "",
		learningGoals:      "",
		topicTags:          []string{},
		frequency:          DefaultFrequency(),
		preferredMaterials: DefaultMaterials(),
	}
}

// Reconstitute reconstrói um Preferences vindo do repositório.
// Use APENAS na camada de persistência ao hidratar do banco.
func Reconstitute(
	userID shared.UserID,
	hubIDs, trailIDs, certificationIDs, objectives []string,
	skillLevel SkillLevel,
	dailyQuestionEnabled bool,
	onboardedAt *time.Time,
	createdAt, updatedAt time.Time,
) *Preferences {
	return &Preferences{
		userID:               userID,
		hubIDs:               nilToEmpty(hubIDs),
		trailIDs:             nilToEmpty(trailIDs),
		certificationIDs:     nilToEmpty(certificationIDs),
		objectives:           nilToEmpty(objectives),
		skillLevel:           skillLevel,
		dailyQuestionEnabled: dailyQuestionEnabled,
		onboardedAt:          onboardedAt,
		createdAt:            createdAt,
		updatedAt:            updatedAt,
		// Fase 3 defaults — sobrescritos via SetPhase3 logo após reconstrução
		// pelo repo. Evita um construtor enorme.
		interestedBases:    []string{},
		homeBase:           "",
		learningGoals:      "",
		topicTags:          []string{},
		frequency:          DefaultFrequency(),
		preferredMaterials: DefaultMaterials(),
	}
}

// SetPhase3 popula campos da Fase 3 — usado pelo repo após Reconstitute
// pra evitar inflar a assinatura de Reconstitute.
func (p *Preferences) SetPhase3(
	interestedBases []string,
	homeBase string,
	learningGoals string,
	topicTags []string,
	frequency Frequency,
	preferredMaterials []MaterialKind,
) {
	p.interestedBases = nilToEmpty(interestedBases)
	p.homeBase = homeBase
	p.learningGoals = learningGoals
	p.topicTags = nilToEmpty(topicTags)
	p.frequency = frequency
	if preferredMaterials == nil {
		p.preferredMaterials = []MaterialKind{}
	} else {
		p.preferredMaterials = preferredMaterials
	}
}

// --- Getters (read-only fora do aggregate) ---
//
// Defensive copy + slice não-nil: o DTO da API promete `"hubIds": []`
// (nunca `null`). Slice vazio preservado via copySlice helper.

func (p *Preferences) UserID() shared.UserID      { return p.userID }
func (p *Preferences) HubIDs() []string           { return copySlice(p.hubIDs) }
func (p *Preferences) TrailIDs() []string         { return copySlice(p.trailIDs) }
func (p *Preferences) CertificationIDs() []string { return copySlice(p.certificationIDs) }
func (p *Preferences) Objectives() []string       { return copySlice(p.objectives) }
func (p *Preferences) SkillLevel() SkillLevel     { return p.skillLevel }
func (p *Preferences) DailyQuestionEnabled() bool { return p.dailyQuestionEnabled }
func (p *Preferences) OnboardedAt() *time.Time    { return p.onboardedAt }
func (p *Preferences) CreatedAt() time.Time       { return p.createdAt }
func (p *Preferences) UpdatedAt() time.Time       { return p.updatedAt }
func (p *Preferences) IsOnboarded() bool          { return p.onboardedAt != nil }

// Fase 3 — getters.
func (p *Preferences) InterestedBases() []string { return copySlice(p.interestedBases) }
func (p *Preferences) HomeBase() string          { return p.homeBase }
func (p *Preferences) LearningGoals() string     { return p.learningGoals }
func (p *Preferences) TopicTags() []string       { return copySlice(p.topicTags) }
func (p *Preferences) Frequency() Frequency      { return p.frequency }
func (p *Preferences) PreferredMaterials() []MaterialKind {
	if len(p.preferredMaterials) == 0 {
		return []MaterialKind{}
	}
	out := make([]MaterialKind, len(p.preferredMaterials))
	copy(out, p.preferredMaterials)
	return out
}

// UpdateCommand carrega os campos editáveis. Use ponteiros para distinguir
// "não tocar" (nil) de "limpar" (slice/string vazia).
type UpdateCommand struct {
	HubIDs               *[]string
	TrailIDs             *[]string
	CertificationIDs     *[]string
	Objectives           *[]string
	SkillLevel           *SkillLevel
	DailyQuestionEnabled *bool

	// Fase 3 — modelagem da plataforma ao perfil de aprendizado.
	InterestedBases    *[]string
	HomeBase           *string // ponteiro pra string distingue "set vazio" (limpar) vs "não tocar"
	LearningGoals      *string
	TopicTags          *[]string
	Frequency          *Frequency
	PreferredMaterials *[]MaterialKind
}

// Update aplica a mutação validando invariantes. Retorna erro de validação se
// algum campo violar regras. Marca OnboardedAt automaticamente quando o user
// preenche ao menos uma preferência substantiva (hub/trail/cert/objetivo)
// pela primeira vez.
func (p *Preferences) Update(cmd UpdateCommand, now time.Time) error {
	if cmd.HubIDs != nil {
		clean, err := sanitizeIDs(*cmd.HubIDs, MaxHubIDs, "hubIds")
		if err != nil {
			return err
		}
		p.hubIDs = clean
	}
	if cmd.TrailIDs != nil {
		clean, err := sanitizeIDs(*cmd.TrailIDs, MaxTrailIDs, "trailIds")
		if err != nil {
			return err
		}
		p.trailIDs = clean
	}
	if cmd.CertificationIDs != nil {
		clean, err := sanitizeIDs(*cmd.CertificationIDs, MaxCertificationIDs, "certificationIds")
		if err != nil {
			return err
		}
		p.certificationIDs = clean
	}
	if cmd.Objectives != nil {
		clean, err := sanitizeObjectives(*cmd.Objectives)
		if err != nil {
			return err
		}
		p.objectives = clean
	}
	if cmd.SkillLevel != nil {
		if !cmd.SkillLevel.IsValid() {
			return shared.NewValidationError(fmt.Sprintf("skillLevel inválido: %q", *cmd.SkillLevel))
		}
		p.skillLevel = *cmd.SkillLevel
	}
	if cmd.DailyQuestionEnabled != nil {
		p.dailyQuestionEnabled = *cmd.DailyQuestionEnabled
	}

	// Fase 3 — campos de modelagem do aprendizado.
	if cmd.InterestedBases != nil {
		clean, err := sanitizeIDs(*cmd.InterestedBases, MaxInterestedBases, "interestedBases")
		if err != nil {
			return err
		}
		p.interestedBases = clean
	}
	if cmd.HomeBase != nil {
		homeBase := strings.TrimSpace(*cmd.HomeBase)
		if homeBase != "" {
			if len(homeBase) > MaxIDLength {
				return shared.NewValidationError("homeBase muito longo")
			}
			if !isSlugLike(homeBase) {
				return shared.NewValidationError(fmt.Sprintf("homeBase com slug inválido: %q", homeBase))
			}
		}
		p.homeBase = homeBase
	}
	if cmd.LearningGoals != nil {
		goals := strings.TrimSpace(*cmd.LearningGoals)
		if len(goals) > MaxLearningGoalsLen {
			return shared.NewValidationError(
				fmt.Sprintf("learningGoals excede %d caracteres", MaxLearningGoalsLen),
			)
		}
		p.learningGoals = goals
	}
	if cmd.TopicTags != nil {
		clean, err := sanitizeIDs(*cmd.TopicTags, MaxTopicTags, "topicTags")
		if err != nil {
			return err
		}
		p.topicTags = clean
	}
	if cmd.Frequency != nil {
		// Re-valida via construtor — comando pode trazer struct mal-formado
		freq, err := NewFrequency(cmd.Frequency.Kind, cmd.Frequency.DaysPerWeek, cmd.Frequency.Weekdays)
		if err != nil {
			return err
		}
		p.frequency = freq
	}
	if cmd.PreferredMaterials != nil {
		clean, err := sanitizeMaterials(*cmd.PreferredMaterials)
		if err != nil {
			return err
		}
		p.preferredMaterials = clean
	}

	// Marca onboarded na primeira preferência substantiva.
	if p.onboardedAt == nil && p.hasSubstantivePreference() {
		t := now
		p.onboardedAt = &t
	}

	p.updatedAt = now
	return nil
}

// hasSubstantivePreference: true se ao menos uma lista chave foi preenchida.
// dailyQuestionEnabled (toggle binário) sozinho NÃO conta como onboarded.
// Campos da Fase 3 (interestedBases, homeBase, learningGoals) também contam.
func (p *Preferences) hasSubstantivePreference() bool {
	return len(p.hubIDs) > 0 ||
		len(p.trailIDs) > 0 ||
		len(p.certificationIDs) > 0 ||
		len(p.objectives) > 0 ||
		p.skillLevel != "" ||
		len(p.interestedBases) > 0 ||
		p.homeBase != "" ||
		len(p.learningGoals) > 0
}

// --- Helpers de validação ---

func sanitizeIDs(input []string, maxCount int, fieldName string) ([]string, error) {
	if len(input) > maxCount {
		return nil, shared.NewValidationError(fmt.Sprintf("%s excede máximo %d", fieldName, maxCount))
	}
	seen := make(map[string]bool, len(input))
	out := make([]string, 0, len(input))
	for _, raw := range input {
		id := strings.TrimSpace(raw)
		if id == "" {
			continue
		}
		if len(id) > MaxIDLength {
			return nil, shared.NewValidationError(fmt.Sprintf("%s contém id muito longo: %q", fieldName, id))
		}
		if !isSlugLike(id) {
			return nil, shared.NewValidationError(fmt.Sprintf("%s contém id inválido: %q", fieldName, id))
		}
		if !seen[id] {
			seen[id] = true
			out = append(out, id)
		}
	}
	sort.Strings(out)
	return out, nil
}

func sanitizeObjectives(input []string) ([]string, error) {
	if len(input) > MaxObjectives {
		return nil, shared.NewValidationError(fmt.Sprintf("objectives excede máximo %d", MaxObjectives))
	}
	seen := make(map[string]bool, len(input))
	out := make([]string, 0, len(input))
	for _, raw := range input {
		id := strings.TrimSpace(raw)
		if id == "" {
			continue
		}
		if !validObjectives[id] {
			return nil, shared.NewValidationError(fmt.Sprintf("objective inválido: %q", id))
		}
		if !seen[id] {
			seen[id] = true
			out = append(out, id)
		}
	}
	sort.Strings(out)
	return out, nil
}

// isSlugLike valida [a-z0-9_-]+ — alinhado com IDs de hub/trail/cert do projeto.
func isSlugLike(s string) bool {
	for _, r := range s {
		if (r >= 'a' && r <= 'z') ||
			(r >= '0' && r <= '9') ||
			r == '-' || r == '_' {
			continue
		}
		return false
	}
	return len(s) > 0
}

func nilToEmpty(s []string) []string {
	if s == nil {
		return []string{}
	}
	return s
}

// copySlice retorna uma cópia defensiva, **sempre não-nil** (preserva
// vazio como []string{} ao invés de nil). Crítico para o contrato JSON.
func copySlice(s []string) []string {
	if len(s) == 0 {
		return []string{}
	}
	out := make([]string, len(s))
	copy(out, s)
	return out
}

// --- Repository port ---

type Repository interface {
	// FindByUser retorna as preferências de um usuário. Retorna shared.ErrNotFound
	// se o usuário não tem preferências persistidas (estado inicial).
	FindByUser(ctx context.Context, userID shared.UserID) (*Preferences, error)

	// Upsert insere ou atualiza atomicamente.
	Upsert(ctx context.Context, prefs *Preferences) error

	// DeleteByUser remove (LGPD). Idempotente — retornar nil mesmo se não existir.
	DeleteByUser(ctx context.Context, userID shared.UserID) error
}
