// Package curriculum — get_article.go implementa o caso de uso de busca de artigo por slug.
package curriculum

import (
	"context"
	"fmt"

	domcurriculum "github.com/fernandofv/api/internal/domain/curriculum"
)

// GetArticleUseCase busca um artigo do currículo pelo seu slug.
type GetArticleUseCase struct {
	repo domcurriculum.Repository
}

// NewGetArticleUseCase cria um novo GetArticleUseCase.
func NewGetArticleUseCase(repo domcurriculum.Repository) *GetArticleUseCase {
	return &GetArticleUseCase{repo: repo}
}

// Execute busca o artigo pelo slug.
// Retorna shared.ErrNotFound se o artigo não existir.
func (uc *GetArticleUseCase) Execute(ctx context.Context, slug string) (*domcurriculum.Article, error) {
	if slug == "" {
		return nil, fmt.Errorf("get article: slug é obrigatório")
	}
	return uc.repo.FindBySlug(ctx, slug)
}
