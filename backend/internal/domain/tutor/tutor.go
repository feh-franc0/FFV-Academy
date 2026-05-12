// Package tutor implementa o bounded context do Tutor de IA.
//
// PADRÕES:
//   - DIP: TutorProvider é interface — troca Claude por outro LLM sem mudar domínio.
//   - Cache: responses são cacheadas por (questionID, kind) — imutáveis.
//   - Rate limit: por usuário/plano, enforçado no use case.
package tutor

import (
	"context"

	"github.com/fernandofv/api/internal/domain/shared"
)

// QueryKind classifica o tipo de explicação solicitada.
type QueryKind string

const (
	KindPorQue   QueryKind = "por-que"  // Por que a resposta correta é correta?
	KindAnalogia QueryKind = "analogia" // Analogia do mundo real
	KindExemplo  QueryKind = "exemplo"  // Exemplo prático
)

// Query é um VO que representa uma pergunta ao tutor.
type Query struct {
	SimuladoID   shared.SimuladoID
	QuestionID   shared.QuestionID
	QuestionStem string
	Kind         QueryKind
}

// TutorResponse é o VO de resposta do tutor.
type TutorResponse struct {
	Explanation string
	CacheHit    bool
}

// TutorProvider é o port de integração com a IA.
//
// DIP: Claude fica em infrastructure/ai; domínio depende desta interface.
type TutorProvider interface {
	Ask(ctx context.Context, query Query) (TutorResponse, error)
}

// RateLimiter é o port de rate limiting do tutor.
type RateLimiter interface {
	// Check verifica se o usuário ainda pode fazer requests.
	// Retorna ErrRateLimited se o limite foi atingido.
	Check(ctx context.Context, userID shared.UserID, isPro bool) error

	// Increment incrementa o contador de uso do usuário.
	Increment(ctx context.Context, userID shared.UserID) error
}
