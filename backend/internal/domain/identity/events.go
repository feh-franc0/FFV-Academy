package identity

import (
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// Domain Events — padrão DDD para comunicação entre bounded contexts
// sem acoplamento direto.
//
// PADRÃO DDD: eventos expressam o que aconteceu (passado), imutáveis.

// UserRegistered é publicado quando um novo usuário se registra.
type UserRegistered struct {
	UserID    shared.UserID
	Email     Email
	Phone     Phone
	OccurredAt time.Time
}

// UserLoggedIn é publicado quando um usuário existente faz login.
type UserLoggedIn struct {
	UserID     shared.UserID
	Email      Email
	OccurredAt time.Time
}

// ProductGranted é publicado quando um produto é concedido a um usuário.
// Emitido após webhook de pagamento bem-sucedido.
//
// POR QUÊ evento: desacopla billing do identity; outros BCs podem reagir
// (ex: enviar email de confirmação, desbloquear features).
type ProductGranted struct {
	UserID     shared.UserID
	ProductID  shared.ProductID
	PurchaseID shared.PurchaseID
	OccurredAt time.Time
}

// AccountDeleted é publicado quando um usuário solicita deleção da conta (LGPD).
type AccountDeleted struct {
	UserID     shared.UserID
	OccurredAt time.Time
}
