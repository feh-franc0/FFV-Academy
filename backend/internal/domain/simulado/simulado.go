// Package simulado implementa o bounded context de simulados pagos.
//
// PADRÕES:
//   - DDD: Attempt é o aggregate root; Simulado é entidade read-only do catálogo.
//   - Clean Arch: zero deps de infra — catálogo injetado via CatalogProvider.
//   - SOLID/OCP: novos tipos de simulado adicionam implementações de CatalogProvider,
//     sem modificar este package.
package simulado

import "github.com/fernandofv/api/internal/domain/shared"

// OptionID representa uma opção de resposta (A-E).
//
// Object Calisthenics #3: VO para evitar string crua em assinaturas públicas.
type OptionID string

const (
	OptionA OptionID = "A"
	OptionB OptionID = "B"
	OptionC OptionID = "C"
	OptionD OptionID = "D"
	OptionE OptionID = "E"
)

// validOptions lista as opções permitidas.
var validOptions = map[OptionID]struct{}{
	OptionA: {}, OptionB: {}, OptionC: {},
	OptionD: {}, OptionE: {},
}

// IsValid reporta se o OptionID é um valor válido.
func (o OptionID) IsValid() bool {
	_, ok := validOptions[o]
	return ok
}

// Difficulty classifica a dificuldade de uma questão.
type Difficulty string

const (
	DifficultyEasy   Difficulty = "easy"
	DifficultyMedium Difficulty = "medium"
	DifficultyHard   Difficulty = "hard"
)

// Topic classifica o assunto de uma questão.
type Topic string

// QuestionOption representa uma alternativa de resposta.
type QuestionOption struct {
	ID   OptionID
	Text string
}

// Question é uma questão do simulado (imutável — vem do catálogo estático).
type Question struct {
	ID          shared.QuestionID
	Stem        string
	Options     []QuestionOption
	CorrectID   OptionID
	Explanation string
	Topic       Topic
	Difficulty  Difficulty
	RelatedSlug string
}

// Simulado representa um simulado completo do catálogo (imutável).
//
// POR QUÊ imutável: o conteúdo é editorial e vem do repo estático do frontend.
// O backend só valida respostas e calcula scores.
type Simulado struct {
	ID           shared.SimuladoID
	Certification string
	Title        string
	Description  string
	PriceCents   int64
	QuestionCount int
	TimeLimitMin  int
	Topics       []Topic
	Questions    []Question
	PassingScore  int // 0-100
	ComingSoon   bool
}

// FindQuestion retorna a questão pelo ID. Nil se não encontrada.
func (s *Simulado) FindQuestion(id shared.QuestionID) *Question {
	for i := range s.Questions {
		if s.Questions[i].ID == id {
			return &s.Questions[i]
		}
	}
	return nil
}

// CatalogProvider é o port de acesso ao catálogo estático de simulados.
//
// DIP: domínio depende desta interface; a impl concreta (embed JSON) vive na infra.
type CatalogProvider interface {
	GetSimulado(id shared.SimuladoID) (*Simulado, error)
	ListSimulados() ([]*Simulado, error)
}
