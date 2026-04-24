package identity

import (
	"crypto/rand"
	"crypto/subtle"
	"fmt"
	"math/big"
	"time"
)

// MagicToken é um Value Object que representa o token de 6 dígitos enviado
// por email/SMS para autenticação passwordless.
//
// CICLO DE VIDA:
//   1. Generate() → token criado (salvo em Redis com TTL)
//   2. Verify(input) → True se input == value e não expirado
//   3. Consumido: Redis GETDEL garante uso único
//
// INVARIANTES:
//   - Exatamente 6 dígitos numéricos.
//   - Expiração <= 10 minutos.
type MagicToken struct {
	value     string
	expiresAt time.Time
}

// GenerateMagicToken gera um token de 6 dígitos criptograficamente seguro.
func GenerateMagicToken(ttl time.Duration, now time.Time) (MagicToken, error) {
	digits, err := generateDigits(6)
	if err != nil {
		return MagicToken{}, fmt.Errorf("magic token: generate: %w", err)
	}
	return MagicToken{
		value:     digits,
		expiresAt: now.Add(ttl),
	}, nil
}

// Value retorna o valor do token (6 dígitos).
func (t MagicToken) Value() string { return t.value }

// ExpiresAt retorna o timestamp de expiração.
func (t MagicToken) ExpiresAt() time.Time { return t.expiresAt }

// IsExpired reporta se o token já expirou.
func (t MagicToken) IsExpired(now time.Time) bool { return now.After(t.expiresAt) }

// Matches verifica em tempo constante se a string de entrada corresponde ao token.
// subtle.ConstantTimeCompare elimina timing side-channel em comparação byte-a-byte.
func (t MagicToken) Matches(input string) bool {
	return subtle.ConstantTimeCompare([]byte(t.value), []byte(input)) == 1
}

// Reconstitute recria um MagicToken a partir de dados persistidos (ex: Redis).
// Usado pelo adapter de infraestrutura para reconstituir tokens armazenados.
func Reconstitute(value string, expiresAt time.Time) MagicToken {
	return MagicToken{value: value, expiresAt: expiresAt}
}

// generateDigits gera N dígitos numéricos usando crypto/rand.
func generateDigits(n int) (string, error) {
	digits := make([]byte, n)
	for i := range digits {
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		digits[i] = byte('0' + num.Int64())
	}
	return string(digits), nil
}
