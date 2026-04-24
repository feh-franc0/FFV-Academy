// Package referral implementa o tracking de indicações.
package referral

import (
	"context"
	"fmt"
	"regexp"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

var referralIDRegex = regexp.MustCompile(`^[a-z0-9]{3,32}$`)

// ValidateReferralID valida o formato do referral ID.
// Proteção XSS: whitelist apenas chars alphanumeric.
func ValidateReferralID(id string) error {
	if !referralIDRegex.MatchString(id) {
		return shared.NewValidationError(
			fmt.Sprintf("referral ID inválido %q: apenas [a-z0-9], 3-32 chars", id),
		)
	}
	return nil
}

// Referral representa um link entre referenciador e referenciado.
type Referral struct {
	id          string
	referrerID  shared.UserID
	referredID  *shared.UserID // nil se o referido ainda não se cadastrou
	createdAt   time.Time
	convertedAt *time.Time
	bonusGranted bool
}

func New(id string, referrerID shared.UserID, now time.Time) *Referral {
	return &Referral{
		id:         id,
		referrerID: referrerID,
		createdAt:  now,
	}
}

func (r *Referral) ID() string               { return r.id }
func (r *Referral) ReferrerID() shared.UserID { return r.referrerID }
func (r *Referral) BonusGranted() bool        { return r.bonusGranted }

// Convert marca que o referido se cadastrou.
func (r *Referral) Convert(referredID shared.UserID, now time.Time) {
	r.referredID = &referredID
	r.convertedAt = &now
}

// Repository port
type Repository interface {
	RecordVisit(ctx context.Context, referrerID shared.UserID, visitorToken string, now time.Time) error
	Convert(ctx context.Context, referrerID shared.UserID, referredID shared.UserID, now time.Time) error
	CountConversions(ctx context.Context, referrerID shared.UserID) (int, error)
}
