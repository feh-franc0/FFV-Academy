// Package handlers — validadores de input de request HTTP.
//
// RESPONSABILIDADE: Esta camada valida o contrato HTTP (tamanho, formato, charset)
// antes de passar o dado ao use case. Validações de regra de negócio pertencem
// ao domínio (Value Objects como Email, Phone). Aqui validamos apenas o que o
// domínio não consegue verificar: tamanho máximo, caracteres proibidos, presença.
package handlers

import (
	"fmt"
	"strings"
	"unicode/utf8"
)

// Limites definidos aqui para ficarem em um único lugar — fácil de ajustar.
const (
	maxEmailLen = 254 // RFC 5321 limite de endereço de email
	maxNameLen  = 100 // nome para exibição — generoso mas não infinito
	maxPhoneLen = 20  // E.164 máximo é 15 dígitos + prefixo '+' = 16; 20 tem margem
	maxTokenLen = 10  // magic token é 6 dígitos; 10 evita enumeração com payloads maiores
)

// validateEmail verifica presença e limites do email antes de passar ao domínio.
// O formato detalhado (regex RFC 5322) é validado pelo Value Object identity.Email.
func validateEmail(s string) error {
	s = strings.TrimSpace(s)
	if s == "" {
		return fmt.Errorf("%w: email é obrigatório", errValidation)
	}
	if utf8.RuneCountInString(s) > maxEmailLen {
		return fmt.Errorf("%w: email excede %d caracteres", errValidation, maxEmailLen)
	}
	// Verificação básica de '@' — erros mais específicos vêm do domínio.
	if !strings.Contains(s, "@") {
		return fmt.Errorf("%w: email inválido", errValidation)
	}
	return nil
}

// validatePhone verifica presença e limites do telefone.
// Normalização de formato (DDI, DDD) é feita no domínio (identity.Phone).
func validatePhone(s string) error {
	s = strings.TrimSpace(s)
	if s == "" {
		// Phone é opcional em algumas operações (ex: update parcial de perfil).
		return nil
	}
	if utf8.RuneCountInString(s) > maxPhoneLen {
		return fmt.Errorf("%w: telefone excede %d caracteres", errValidation, maxPhoneLen)
	}
	return nil
}

// validateName verifica presença e limites do nome.
// Nomes curtos (< 2 chars) são rejeitados aqui para dar feedback rápido.
func validateName(s string) error {
	s = strings.TrimSpace(s)
	if s == "" {
		// Nome pode ser omitido em usuários existentes — opcional.
		return nil
	}
	if utf8.RuneCountInString(s) < 2 {
		return fmt.Errorf("%w: nome deve ter pelo menos 2 caracteres", errValidation)
	}
	if utf8.RuneCountInString(s) > maxNameLen {
		return fmt.Errorf("%w: nome excede %d caracteres", errValidation, maxNameLen)
	}
	return nil
}

// validateToken verifica se o token de magic link tem tamanho razoável.
// Previne enumeration de tokens com payloads propositalmente grandes.
func validateToken(s string) error {
	s = strings.TrimSpace(s)
	if s == "" {
		return fmt.Errorf("%w: token é obrigatório", errValidation)
	}
	if len(s) > maxTokenLen {
		return fmt.Errorf("%w: token inválido", errValidation)
	}
	return nil
}

// errValidation é o sentinel de erro de validação deste package.
// Handlers convertem para 400 via HandleDomainError (que mapeia shared.ErrValidation).
// Usamos um tipo local para não importar shared aqui — handlers são agnósticos ao domínio.
type validationErr string

func (e validationErr) Error() string { return string(e) }
func (e validationErr) Is(target error) bool {
	_, ok := target.(validationErr)
	return ok
}

const errValidation validationErr = "validation error"
