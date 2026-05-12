// Package catalog implementa o CatalogProvider a partir do catálogo estático embebido.
//
// PADRÕES:
//   - //go:embed carrega catalog.json em tempo de build (zero I/O em runtime).
//   - DIP: implementa domsim.CatalogProvider.
//   - Segurança: o catálogo embebido contém o gabarito — o servidor é autoritativo
//     no cálculo de score. O cliente nunca pode mentir a resposta correta.
//
// GERAÇÃO: scripts/gen-catalog.sh extrai do frontend repo → catalog.json.
// CI falha se hash diverge sem bump explícito.
package catalog

import (
	_ "embed"
	"encoding/json"
	"fmt"

	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// catalogJSON é o catálogo de simulados serializado em JSON.
// Gerado por scripts/gen-catalog.sh a partir do frontend.
//
//go:embed catalog.json
var catalogJSON []byte

// catalogEntry espelha a estrutura de Simulado do frontend para deserialização.
type catalogEntry struct {
	ID            string          `json:"id"`
	Certification string          `json:"certification"`
	Title         string          `json:"title"`
	Description   string          `json:"description"`
	PriceCents    int64           `json:"priceCents"`
	QuestionCount int             `json:"questionCount"`
	TimeLimitMin  int             `json:"timeLimitMin"`
	Topics        []string        `json:"topics"`
	Questions     []questionEntry `json:"questions"`
	PassingScore  int             `json:"passingScore"`
	ComingSoon    bool            `json:"comingSoon"`
}

type questionEntry struct {
	ID          string        `json:"id"`
	Stem        string        `json:"stem"`
	Options     []optionEntry `json:"options"`
	CorrectID   string        `json:"correctId"`
	Explanation string        `json:"explanation"`
	Topic       string        `json:"topic"`
	Difficulty  string        `json:"difficulty"`
	RelatedSlug string        `json:"relatedSlug"`
}

type optionEntry struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}

// StaticCatalogProvider carrega e serve o catálogo embebido.
type StaticCatalogProvider struct {
	simulados map[shared.SimuladoID]*domsim.Simulado
}

// NewStaticCatalogProvider inicializa o provider carregando o catálogo embebido.
// Panic em startup se o catalog.json estiver malformado — fail-fast.
func NewStaticCatalogProvider() (*StaticCatalogProvider, error) {
	var entries []catalogEntry
	if err := json.Unmarshal(catalogJSON, &entries); err != nil {
		return nil, fmt.Errorf("catalog: unmarshal: %w", err)
	}

	simulados := make(map[shared.SimuladoID]*domsim.Simulado, len(entries))
	for _, e := range entries {
		sim := toSimulado(e)
		simulados[sim.ID] = sim
	}

	return &StaticCatalogProvider{simulados: simulados}, nil
}

func (p *StaticCatalogProvider) GetSimulado(id shared.SimuladoID) (*domsim.Simulado, error) {
	sim, ok := p.simulados[id]
	if !ok {
		return nil, fmt.Errorf("%w: simulado %q", shared.ErrNotFound, id)
	}
	return sim, nil
}

func (p *StaticCatalogProvider) ListSimulados() ([]*domsim.Simulado, error) {
	result := make([]*domsim.Simulado, 0, len(p.simulados))
	for _, s := range p.simulados {
		result = append(result, s)
	}
	return result, nil
}

func toSimulado(e catalogEntry) *domsim.Simulado {
	questions := make([]domsim.Question, len(e.Questions))
	for i, q := range e.Questions {
		options := make([]domsim.QuestionOption, len(q.Options))
		for j, o := range q.Options {
			options[j] = domsim.QuestionOption{ID: domsim.OptionID(o.ID), Text: o.Text}
		}
		questions[i] = domsim.Question{
			ID:          shared.QuestionID(q.ID),
			Stem:        q.Stem,
			Options:     options,
			CorrectID:   domsim.OptionID(q.CorrectID),
			Explanation: q.Explanation,
			Topic:       domsim.Topic(q.Topic),
			Difficulty:  domsim.Difficulty(q.Difficulty),
			RelatedSlug: q.RelatedSlug,
		}
	}

	topics := make([]domsim.Topic, len(e.Topics))
	for i, t := range e.Topics {
		topics[i] = domsim.Topic(t)
	}

	return &domsim.Simulado{
		ID:            shared.SimuladoID(e.ID),
		Certification: e.Certification,
		Title:         e.Title,
		Description:   e.Description,
		PriceCents:    e.PriceCents,
		QuestionCount: e.QuestionCount,
		TimeLimitMin:  e.TimeLimitMin,
		Topics:        topics,
		Questions:     questions,
		PassingScore:  e.PassingScore,
		ComingSoon:    e.ComingSoon,
	}
}

// Compile-time check
var _ domsim.CatalogProvider = (*StaticCatalogProvider)(nil)
