package identity

import (
	"fmt"
	"strings"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// AGGREGATE ROOT: User
//
// INVARIANTES:
//   1. Email é único no sistema (enforçado pela DB e pelo UserRepository).
//   2. Phone é único no sistema.
//   3. Name tem 1-120 chars.
//   4. paidProducts só pode crescer via GrantProduct (nunca setado direto).
//   5. marketingConsent começa false; somente o usuário pode mudar.
//   6. Conta deletada não pode ser usada para login.
//
// PADRÕES:
//   - DDD Aggregate Root: User protege seus invariantes.
//   - OC#8 relaxado: 9 campos — aggregate root legítimo.
//   - SRP: User não sabe como persiste; isso é responsabilidade do Repository.
type User struct {
	id               shared.UserID
	email            Email
	phone            Phone
	name             string
	createdAt        time.Time
	marketingConsent bool
	paidProducts     ProductSet
	referralID       shared.ReferralID
	role             Role
	deletedAt        *time.Time
}

// Role representa o papel do usuário no sistema.
type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

// ProductSet é uma coleção de primeira classe de ProductIDs.
// Object Calisthenics #4: coleções envolvidas em tipo próprio.
type ProductSet struct {
	items map[shared.ProductID]struct{}
}

func NewProductSet(ids ...shared.ProductID) ProductSet {
	ps := ProductSet{items: make(map[shared.ProductID]struct{})}
	for _, id := range ids {
		ps.items[id] = struct{}{}
	}
	return ps
}

func (ps ProductSet) Contains(id shared.ProductID) bool {
	_, ok := ps.items[id]
	return ok
}

func (ps ProductSet) Add(id shared.ProductID) ProductSet {
	next := ProductSet{items: make(map[shared.ProductID]struct{}, len(ps.items)+1)}
	for k := range ps.items {
		next.items[k] = struct{}{}
	}
	next.items[id] = struct{}{}
	return next
}

func (ps ProductSet) ToSlice() []shared.ProductID {
	result := make([]shared.ProductID, 0, len(ps.items))
	for k := range ps.items {
		result = append(result, k)
	}
	return result
}

// ─────────────────────────────────────────────────────────────────
// Constructor
// ─────────────────────────────────────────────────────────────────

// NewUser cria um novo User, validando todos os invariantes.
// Retorna evento UserRegistered para notificar outros bounded contexts.
func NewUser(
	id shared.UserID,
	email Email,
	phone Phone,
	name string,
	marketingConsent bool,
	referralID shared.ReferralID,
	now time.Time,
) (*User, UserRegistered, error) {
	name = strings.TrimSpace(name)
	if len(name) < 1 || len(name) > 120 {
		return nil, UserRegistered{}, shared.NewValidationError(
			fmt.Sprintf("name deve ter 1-120 chars, got %d", len(name)),
		)
	}
	u := &User{
		id:               id,
		email:            email,
		phone:            phone,
		name:             name,
		createdAt:        now,
		marketingConsent: marketingConsent,
		paidProducts:     NewProductSet(),
		referralID:       referralID,
		role:             RoleUser,
	}
	evt := UserRegistered{UserID: id, Email: email, Phone: phone, OccurredAt: now}
	return u, evt, nil
}

// ReconstituteUser reconstrói um User a partir de dados persistidos (sem validação
// de invariantes de criação — os dados já foram validados ao persistir).
func ReconstituteUser(
	id shared.UserID,
	email Email,
	phone Phone,
	name string,
	createdAt time.Time,
	marketingConsent bool,
	paidProducts []shared.ProductID,
	referralID shared.ReferralID,
	role Role,
	deletedAt *time.Time,
) *User {
	return &User{
		id:               id,
		email:            email,
		phone:            phone,
		name:             name,
		createdAt:        createdAt,
		marketingConsent: marketingConsent,
		paidProducts:     NewProductSet(paidProducts...),
		referralID:       referralID,
		role:             role,
		deletedAt:        deletedAt,
	}
}

// ─────────────────────────────────────────────────────────────────
// Queries (expõem estado sem modificar)
// ─────────────────────────────────────────────────────────────────

func (u *User) ID() shared.UserID            { return u.id }
func (u *User) Email() Email                  { return u.email }
func (u *User) Phone() Phone                  { return u.phone }
func (u *User) Name() string                  { return u.name }
func (u *User) CreatedAt() time.Time          { return u.createdAt }
func (u *User) MarketingConsent() bool        { return u.marketingConsent }
func (u *User) ReferralID() shared.ReferralID { return u.referralID }
func (u *User) Role() Role                    { return u.role }
func (u *User) IsDeleted() bool               { return u.deletedAt != nil }
func (u *User) DeletedAt() *time.Time         { return u.deletedAt }

// HasProduct reporta se o usuário possui o produto.
func (u *User) HasProduct(id shared.ProductID) bool { return u.paidProducts.Contains(id) }

// PaidProducts retorna os produtos pagos.
func (u *User) PaidProducts() []shared.ProductID { return u.paidProducts.ToSlice() }

// IsAdmin reporta se o usuário tem papel de admin.
func (u *User) IsAdmin() bool { return u.role == RoleAdmin }

// ─────────────────────────────────────────────────────────────────
// Commands (modificam estado; retornam eventos)
// ─────────────────────────────────────────────────────────────────

// GrantProduct concede um produto ao usuário.
// Idempotente: se o usuário já tem o produto, não faz nada.
// Retorna o evento ProductGranted (mesmo se idempotente).
//
// INVARIANTE: apenas o servidor pode conceder produtos (nunca client-side).
func (u *User) GrantProduct(productID shared.ProductID, purchaseID shared.PurchaseID, now time.Time) ProductGranted {
	u.paidProducts = u.paidProducts.Add(productID)
	return ProductGranted{
		UserID:     u.id,
		ProductID:  productID,
		PurchaseID: purchaseID,
		OccurredAt: now,
	}
}

// UpdateProfile atualiza nome e/ou telefone.
func (u *User) UpdateProfile(name string, phone Phone) error {
	name = strings.TrimSpace(name)
	if len(name) < 1 || len(name) > 120 {
		return shared.NewValidationError("name deve ter 1-120 chars")
	}
	u.name = name
	u.phone = phone
	return nil
}

// UpdateMarketingConsent atualiza o consentimento de marketing (LGPD).
func (u *User) UpdateMarketingConsent(consent bool) {
	u.marketingConsent = consent
}

// Delete marca a conta como deletada (soft-delete para LGPD).
// Retorna evento AccountDeleted.
func (u *User) Delete(now time.Time) (AccountDeleted, error) {
	if u.deletedAt != nil {
		return AccountDeleted{}, shared.NewConflictError("conta já foi deletada")
	}
	u.deletedAt = &now
	return AccountDeleted{UserID: u.id, OccurredAt: now}, nil
}
