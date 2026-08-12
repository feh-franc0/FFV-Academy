// PADRÕES:
//   - Sentinel errors do domínio: errors.Is() funciona em toda a stack.
//   - Clean Code: nomes descritivos que explicam o invariante violado.
//   - Nunca retornar strings crus; sempre usar tipos de erro.
package shared

import "errors"

// Erros de domínio comuns — exportados para uso em testes (errors.Is).
var (
	// ErrNotFound indica que o recurso solicitado não existe.
	ErrNotFound = errors.New("not found")

	// ErrUnauthorized indica que a operação requer autenticação.
	ErrUnauthorized = errors.New("unauthorized")

	// ErrForbidden indica que o usuário autenticado não tem permissão.
	ErrForbidden = errors.New("forbidden")

	// ErrConflict indica violação de unicidade ou estado inconsistente.
	ErrConflict = errors.New("conflict")

	// ErrValidation indica que os dados de entrada são inválidos.
	ErrValidation = errors.New("validation error")

	// ErrRateLimited indica que o limite de requisições foi atingido.
	ErrRateLimited = errors.New("rate limited")

	// ErrRegistrationRequired indica que o código foi validado com sucesso
	// mas o email é de um usuário novo sem dados de registro — o chamador
	// deve reenviar o MESMO código junto com nome/telefone. Sentinel próprio
	// (não sob ErrValidation) para que a resposta HTTP tenha um `type`
	// distinguível sem o frontend precisar casar string de mensagem.
	ErrRegistrationRequired = errors.New("registration required")
)

// DomainError encapsula um erro de domínio com mensagem legível.
// Permite usar errors.Is() mantendo mensagem contextual.
type DomainError struct {
	Err     error  // sentinel
	Message string // mensagem human-readable
}

func (e *DomainError) Error() string { return e.Message }
func (e *DomainError) Unwrap() error { return e.Err }

// NewValidationError cria um DomainError envolto em ErrValidation.
func NewValidationError(msg string) *DomainError {
	return &DomainError{Err: ErrValidation, Message: msg}
}

// NewNotFoundError cria um DomainError envolto em ErrNotFound.
func NewNotFoundError(resource string) *DomainError {
	return &DomainError{Err: ErrNotFound, Message: resource + " não encontrado"}
}

// NewConflictError cria um DomainError envolto em ErrConflict.
func NewConflictError(msg string) *DomainError {
	return &DomainError{Err: ErrConflict, Message: msg}
}
