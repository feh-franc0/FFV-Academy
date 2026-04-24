// Package curriculum — list_curriculum.go implementa o caso de uso de listagem de artigos.
package curriculum

import (
	"context"

	domcurriculum "github.com/fernandofv/api/internal/domain/curriculum"
)

// ListCurriculumUseCase lista artigos do currículo com paginação e filtro por trilha.
type ListCurriculumUseCase struct {
	repo domcurriculum.Repository
}

// NewListCurriculumUseCase cria um novo ListCurriculumUseCase.
func NewListCurriculumUseCase(repo domcurriculum.Repository) *ListCurriculumUseCase {
	return &ListCurriculumUseCase{repo: repo}
}

// Execute retorna artigos paginados.
// trailID vazio retorna artigos de todas as trilhas.
// Sempre filtra apenas artigos publicados (publishedOnly=true).
func (uc *ListCurriculumUseCase) Execute(ctx context.Context, trailID string, limit, offset int) ([]*domcurriculum.Article, int, error) {
	// Limites defensivos para evitar queries custosas.
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}
	return uc.repo.List(ctx, trailID, true, limit, offset)
}
