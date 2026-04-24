package identity_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

func mustEmail(t *testing.T, s string) identity.Email {
	t.Helper()
	e, err := identity.NewEmail(s)
	require.NoError(t, err)
	return e
}

func mustPhone(t *testing.T, s string) identity.Phone {
	t.Helper()
	p, err := identity.NewPhone(s)
	require.NoError(t, err)
	return p
}

func Test_User_NewUser_ValidData_CreatesUser(t *testing.T) {
	now := time.Now()
	user, event, err := identity.NewUser(
		shared.NewUserID(),
		mustEmail(t, "user@example.com"),
		mustPhone(t, "+5511999999999"),
		"João Silva",
		true,
		shared.ReferralID("abc123"),
		now,
	)

	require.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, "user@example.com", user.Email().String())
	assert.Equal(t, "João Silva", user.Name())
	assert.Equal(t, identity.RoleUser, user.Role())
	assert.Equal(t, "user@example.com", event.Email.String())
}

func Test_User_GrantProduct_AddsProduct(t *testing.T) {
	now := time.Now()
	user, _, _ := identity.NewUser(
		shared.NewUserID(),
		mustEmail(t, "user@example.com"),
		mustPhone(t, "+5511999999999"),
		"Test",
		false,
		shared.ReferralID("ref1"),
		now,
	)

	productID := shared.ProductID("aws-clf")
	purchaseID := shared.NewPurchaseID()
	user.GrantProduct(productID, purchaseID, now)

	assert.True(t, user.HasProduct(productID))
}

func Test_User_Delete_SoftDeletesAccount(t *testing.T) {
	now := time.Now()
	user, _, _ := identity.NewUser(
		shared.NewUserID(),
		mustEmail(t, "user@example.com"),
		mustPhone(t, "+5511999999999"),
		"Test",
		false,
		shared.ReferralID("ref2"),
		now,
	)

	_, err := user.Delete(now)
	require.NoError(t, err)
	assert.True(t, user.IsDeleted())
}

func Test_User_Delete_AlreadyDeleted_ReturnsError(t *testing.T) {
	now := time.Now()
	user, _, _ := identity.NewUser(
		shared.NewUserID(),
		mustEmail(t, "user@example.com"),
		mustPhone(t, "+5511999999999"),
		"Test",
		false,
		shared.ReferralID("ref3"),
		now,
	)

	_, _ = user.Delete(now)
	_, err := user.Delete(now) // segunda vez
	assert.Error(t, err)
}
