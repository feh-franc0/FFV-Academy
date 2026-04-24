// Package shared contém tipos e abstrações compartilhados por todos os bounded contexts.
//
// PADRÕES:
//   - DDD: Value Objects tipados para IDs (evita confundir UserID com AttemptID).
//   - Object Calisthenics #3: sem primitivos em assinaturas públicas do domínio.
//   - Clean Arch: zero deps externas — apenas stdlib.
package shared

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
)

// ─────────────────────────────────────────────────────────────────
// ID Value Objects — tipados para prevenir confusão entre IDs
// ─────────────────────────────────────────────────────────────────

// UserID identifica unicamente um User no sistema.
type UserID string

// NewUserID gera um novo UserID aleatório (UUIDv4).
func NewUserID() UserID { return UserID(uuid.NewString()) }

// ParseUserID valida e converte uma string em UserID.
func ParseUserID(s string) (UserID, error) {
	if _, err := uuid.Parse(s); err != nil {
		return "", fmt.Errorf("invalid UserID %q: %w", s, err)
	}
	return UserID(s), nil
}

func (id UserID) String() string { return string(id) }

// IsZero reporta se o ID está vazio.
func (id UserID) IsZero() bool { return id == "" }

// AttemptID identifica unicamente uma tentativa de simulado.
type AttemptID string

func NewAttemptID() AttemptID { return AttemptID(uuid.NewString()) }

func ParseAttemptID(s string) (AttemptID, error) {
	if _, err := uuid.Parse(s); err != nil {
		return "", fmt.Errorf("invalid AttemptID %q: %w", s, err)
	}
	return AttemptID(s), nil
}

func (id AttemptID) String() string  { return string(id) }
func (id AttemptID) IsZero() bool    { return id == "" }

// CertificateHash identifica um certificado emitido.
// Formato: hex string 64 chars (SHA-256).
type CertificateHash string

func (h CertificateHash) String() string { return string(h) }
func (h CertificateHash) IsZero() bool   { return h == "" }

// PurchaseID identifica uma compra.
type PurchaseID string

func NewPurchaseID() PurchaseID { return PurchaseID(uuid.NewString()) }
func (id PurchaseID) String() string { return string(id) }

// ProductID identifica um produto (ex: "simulado-aws-practitioner").
type ProductID string

func (id ProductID) String() string   { return string(id) }
func (id ProductID) IsZero() bool     { return id == "" }

// ParseProductID valida que o ProductID segue o formato esperado.
func ParseProductID(s string) (ProductID, error) {
	s = strings.TrimSpace(s)
	if len(s) == 0 || len(s) > 80 {
		return "", fmt.Errorf("ProductID must be 1-80 chars, got %d", len(s))
	}
	return ProductID(s), nil
}

// SimuladoID identifica um simulado no catálogo.
type SimuladoID string

func (id SimuladoID) String() string { return string(id) }
func (id SimuladoID) IsZero() bool   { return id == "" }

// QuestionID identifica uma questão dentro de um simulado.
type QuestionID string

func (id QuestionID) String() string { return string(id) }

// ReferralID é o ID público de referral de um usuário.
type ReferralID string

func (id ReferralID) String() string { return string(id) }
func (id ReferralID) IsZero() bool   { return id == "" }
