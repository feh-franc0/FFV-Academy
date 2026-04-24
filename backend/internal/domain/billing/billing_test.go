package billing_test

import (
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/domain/billing"
	"github.com/fernandofv/api/internal/domain/shared"
)

var (
	pid       = shared.PurchaseID("pur-1")
	uid       = shared.UserID("user-1")
	prodID    = shared.ProductID("simulado-aws")
	now       = time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
	sessionID = "cs_test_abc"
)

func Test_Billing_NewPurchase_Default_IsPending(t *testing.T) {
	p := billing.NewPurchase(pid, uid, prodID, 9900, sessionID, now)

	assert.Equal(t, pid, p.ID())
	assert.Equal(t, uid, p.UserID())
	assert.Equal(t, prodID, p.ProductID())
	assert.Equal(t, int64(9900), p.AmountCents())
	assert.Equal(t, billing.StatusPending, p.Status())
	assert.Equal(t, sessionID, p.StripeSessionID())
}

func Test_Billing_MarkPaid_Pending_TransitionsToPaid(t *testing.T) {
	p := billing.NewPurchase(pid, uid, prodID, 9900, sessionID, now)
	err := p.MarkPaid("pi_abc", now.Add(5*time.Minute))
	require.NoError(t, err)
	assert.Equal(t, billing.StatusPaid, p.Status())
}

func Test_Billing_MarkPaid_AlreadyPaid_ReturnsConflict(t *testing.T) {
	p := billing.NewPurchase(pid, uid, prodID, 9900, sessionID, now)
	require.NoError(t, p.MarkPaid("pi_abc", now))

	err := p.MarkPaid("pi_xyz", now)
	require.Error(t, err)
	assert.True(t, errors.Is(err, shared.ErrConflict))
	assert.Equal(t, billing.StatusPaid, p.Status(), "status não deve mudar em transição inválida")
}

func Test_Billing_PurchaseStatus_Constants(t *testing.T) {
	assert.Equal(t, billing.PurchaseStatus("pending"), billing.StatusPending)
	assert.Equal(t, billing.PurchaseStatus("paid"), billing.StatusPaid)
	assert.Equal(t, billing.PurchaseStatus("failed"), billing.StatusFailed)
	assert.Equal(t, billing.PurchaseStatus("refunded"), billing.StatusRefunded)
}
