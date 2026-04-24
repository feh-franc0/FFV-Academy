// Package certificate implementa o bounded context de emissão e verificação de
// certificados.
//
// PADRÕES:
//   - DDD Aggregate Root: Certificate.
//   - Certificado é imutável após emissão: sem Update().
//   - Hash determinístico garante idempotência na emissão.
package certificate

import (
	"context"
	"crypto/sha256"
	"fmt"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// Certificate é o aggregate root deste bounded context.
//
// INVARIANTES:
//   1. Hash é derivado deterministicamente de (userID, simuladoID, attemptID, score).
//   2. Score >= passingScore do simulado (validado no UC de emissão).
//   3. Imutável após criação.
type Certificate struct {
	hash       shared.CertificateHash
	userID     shared.UserID
	simuladoID shared.SimuladoID
	attemptID  shared.AttemptID
	name       string // nome do portador no momento da emissão
	score      int
	issuedAt   time.Time
}

// Issue cria um novo Certificate.
// Idempotente: para os mesmos inputs, o hash será sempre o mesmo.
func Issue(
	userID shared.UserID,
	simuladoID shared.SimuladoID,
	attemptID shared.AttemptID,
	holderName string,
	score int,
	now time.Time,
) (*Certificate, error) {
	if score < 0 || score > 100 {
		return nil, shared.NewValidationError(fmt.Sprintf("score deve ser 0-100, got %d", score))
	}
	hash := computeHash(userID, simuladoID, attemptID)
	return &Certificate{
		hash:       hash,
		userID:     userID,
		simuladoID: simuladoID,
		attemptID:  attemptID,
		name:       holderName,
		score:      score,
		issuedAt:   now,
	}, nil
}

// Reconstitute reconstrói um Certificate a partir de dados persistidos.
func Reconstitute(
	hash shared.CertificateHash,
	userID shared.UserID,
	simuladoID shared.SimuladoID,
	attemptID shared.AttemptID,
	name string,
	score int,
	issuedAt time.Time,
) *Certificate {
	return &Certificate{
		hash:       hash,
		userID:     userID,
		simuladoID: simuladoID,
		attemptID:  attemptID,
		name:       name,
		score:      score,
		issuedAt:   issuedAt,
	}
}

func (c *Certificate) Hash() shared.CertificateHash  { return c.hash }
func (c *Certificate) UserID() shared.UserID          { return c.userID }
func (c *Certificate) SimuladoID() shared.SimuladoID  { return c.simuladoID }
func (c *Certificate) AttemptID() shared.AttemptID    { return c.attemptID }
func (c *Certificate) HolderName() string             { return c.name }
func (c *Certificate) Score() int                     { return c.score }
func (c *Certificate) IssuedAt() time.Time            { return c.issuedAt }

// computeHash gera hash SHA-256 truncado a 64 chars hex.
// Determinístico: mesmo input → mesmo hash (idempotência).
func computeHash(userID shared.UserID, simuladoID shared.SimuladoID, attemptID shared.AttemptID) shared.CertificateHash {
	input := fmt.Sprintf("%s|%s|%s", userID, simuladoID, attemptID)
	sum := sha256.Sum256([]byte(input))
	return shared.CertificateHash(fmt.Sprintf("%x", sum))
}

// Repository port
type Repository interface {
	Save(ctx context.Context, cert *Certificate) error
	FindByHash(ctx context.Context, hash shared.CertificateHash) (*Certificate, error)
	ListByUser(ctx context.Context, userID shared.UserID) ([]*Certificate, error)
	ExistsByAttempt(ctx context.Context, attemptID shared.AttemptID) (bool, error)
}
