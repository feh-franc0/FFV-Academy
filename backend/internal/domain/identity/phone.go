package identity

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/fernandofv/api/internal/domain/shared"
)

// phoneRegex aceita formatos BR com DDI obrigatório: +5511987654321 ou 5511987654321.
// Espelha phoneBRSchema do frontend (schemas.ts).
// NOTA: 55? (antigo) aceitava +511XXXXXXXX (DDI incompleto); 55 (fixo) exige DDI correto.
var phoneRegex = regexp.MustCompile(`^\+?55\d{10,11}$`)

// Phone é um Value Object que representa um telefone brasileiro validado.
//
// INVARIANTE: formato BR válido — DDI 55 obrigatório, DDD 2 dígitos, 8-9 dígitos locais.
type Phone struct {
	value string
}

// NewPhone constrói um Phone validado. String vazia retorna Phone zero (campo opcional).
func NewPhone(raw string) (Phone, error) {
	v := strings.TrimSpace(raw)
	if v == "" {
		return Phone{}, nil
	}
	// Remove espaços e hifens para normalização
	v = strings.ReplaceAll(v, " ", "")
	v = strings.ReplaceAll(v, "-", "")
	if !phoneRegex.MatchString(v) {
		return Phone{}, fmt.Errorf("%w: phone formato BR inválido %q (esperado: +55DDDNNNNNNNNN)", shared.ErrValidation, raw)
	}
	// Normaliza: garante prefixo +55
	if !strings.HasPrefix(v, "+") {
		if strings.HasPrefix(v, "55") {
			v = "+" + v
		} else {
			v = "+55" + v
		}
	}
	return Phone{value: v}, nil
}

func (p Phone) String() string        { return p.value }
func (p Phone) Equals(other Phone) bool { return p.value == other.value }
func (p Phone) IsZero() bool           { return p.value == "" }

func MustNewPhone(raw string) Phone {
	p, err := NewPhone(raw)
	if err != nil {
		panic(fmt.Sprintf("MustNewPhone: %v", err))
	}
	return p
}
