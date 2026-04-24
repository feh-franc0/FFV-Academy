// Package identity implementa o bounded context "Identity & Access".
//
// PADRÕES:
//   - DDD: Value Objects self-validating (Email, Phone, Name, MagicToken).
//   - Clean Arch: domain puro — nenhuma dependência de framework ou infra.
//   - Object Calisthenics #3: Email é VO, não string em assinaturas públicas.
//   - SOLID/SRP: cada VO tem responsabilidade de validar seu próprio invariante.
package identity

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/fernandofv/api/internal/domain/shared"
)

// emailRegex espelha a validação Zod do frontend para consistência.
// POR QUÊ regexp simples: validação real de email é feita pelo backend de envio
// (Resend) — aqui apenas garantimos formato básico sem DNS lookup.
var emailRegex = regexp.MustCompile(`^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$`)

// Email é um Value Object que representa um endereço de email validado.
//
// INVARIANTE: formato válido, lowercase, 5-254 chars.
type Email struct {
	value string
}

// NewEmail constrói um Email validado a partir de uma string.
// Retorna erro descritivo se a string violar o invariante.
func NewEmail(raw string) (Email, error) {
	v := strings.ToLower(strings.TrimSpace(raw))
	if len(v) < 5 || len(v) > 254 {
		return Email{}, fmt.Errorf("%w: email comprimento deve estar entre 5 e 254 chars, got %d", shared.ErrValidation, len(v))
	}
	if !emailRegex.MatchString(v) {
		return Email{}, fmt.Errorf("%w: email formato inválido %q", shared.ErrValidation, v)
	}
	return Email{value: v}, nil
}

// String retorna o valor do email como string.
// OC#9: expõe somente valor imutável, sem setter.
func (e Email) String() string { return e.value }

// Equals compara dois Emails por valor.
func (e Email) Equals(other Email) bool { return e.value == other.value }

// IsZero reporta se o Email está vazio (zero-value).
func (e Email) IsZero() bool { return e.value == "" }

// MustNewEmail cria um Email sem verificar erro — use apenas em fixtures de teste.
func MustNewEmail(raw string) Email {
	e, err := NewEmail(raw)
	if err != nil {
		panic(fmt.Sprintf("MustNewEmail: %v", err))
	}
	return e
}
