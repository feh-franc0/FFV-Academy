// Package curriculum — search_curriculum.go implementa o caso de uso de busca full-text.
package curriculum

import (
	"context"
	"fmt"

	domcurriculum "github.com/fernandofv/api/internal/domain/curriculum"
)

// SearchCurriculumUseCase executa busca por similaridade no título dos artigos.
type SearchCurriculumUseCase struct {
	repo domcurriculum.Repository
}

// NewSearchCurriculumUseCase cria um novo SearchCurriculumUseCase.
func NewSearchCurriculumUseCase(repo domcurriculum.Repository) *SearchCurriculumUseCase {
	return &SearchCurriculumUseCase{repo: repo}
}

// Execute busca artigos cujo título seja similar à query q.
// Retorna no máximo limit artigos (padrão 10, máximo 50).
func (uc *SearchCurriculumUseCase) Execute(ctx context.Context, q string) ([]*domcurriculum.Article, error) {
	if q == "" {
		return nil, fmt.Errorf("search curriculum: query não pode ser vazia")
	}
	if len(q) < 2 {
		return nil, fmt.Errorf("search curriculum: query deve ter pelo menos 2 caracteres")
	}
	// Limite fixo de 10 para o endpoint público — admin pode usar listagem direta.
	return uc.repo.Search(ctx, q, 10)
}
