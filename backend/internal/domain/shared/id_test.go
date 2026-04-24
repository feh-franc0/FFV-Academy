package shared_test

import (
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/domain/shared"
)

func Test_Shared_NewUserID_ProducesValidUUID(t *testing.T) {
	id := shared.NewUserID()
	_, err := uuid.Parse(id.String())
	assert.NoError(t, err)
	assert.False(t, id.IsZero())
}

func Test_Shared_NewUserID_IsUnique(t *testing.T) {
	a := shared.NewUserID()
	b := shared.NewUserID()
	assert.NotEqual(t, a, b)
}

func Test_Shared_ParseUserID_Valid_ReturnsUserID(t *testing.T) {
	raw := uuid.NewString()
	id, err := shared.ParseUserID(raw)
	require.NoError(t, err)
	assert.Equal(t, raw, id.String())
}

func Test_Shared_ParseUserID_Invalid_ReturnsError(t *testing.T) {
	cases := []string{"", "not-a-uuid", "12345"}
	for _, c := range cases {
		_, err := shared.ParseUserID(c)
		assert.Error(t, err, "expected error for %q", c)
	}
}

func Test_Shared_UserID_IsZero_ZeroValue_ReturnsTrue(t *testing.T) {
	var id shared.UserID
	assert.True(t, id.IsZero())
}

func Test_Shared_ParseAttemptID_Valid_ReturnsAttemptID(t *testing.T) {
	raw := uuid.NewString()
	id, err := shared.ParseAttemptID(raw)
	require.NoError(t, err)
	assert.Equal(t, raw, id.String())
}

func Test_Shared_ParseAttemptID_Invalid_ReturnsError(t *testing.T) {
	_, err := shared.ParseAttemptID("bogus")
	assert.Error(t, err)
}

func Test_Shared_NewAttemptID_IsUnique(t *testing.T) {
	a := shared.NewAttemptID()
	b := shared.NewAttemptID()
	assert.NotEqual(t, a, b)
	assert.False(t, a.IsZero())
}

func Test_Shared_ParseProductID_TrimsWhitespace(t *testing.T) {
	id, err := shared.ParseProductID("  simulado-aws  ")
	require.NoError(t, err)
	assert.Equal(t, "simulado-aws", id.String())
}

func Test_Shared_ParseProductID_Empty_ReturnsError(t *testing.T) {
	_, err := shared.ParseProductID("")
	assert.Error(t, err)
	_, err = shared.ParseProductID("   ")
	assert.Error(t, err)
}

func Test_Shared_ParseProductID_TooLong_ReturnsError(t *testing.T) {
	long := strings.Repeat("a", 81)
	_, err := shared.ParseProductID(long)
	assert.Error(t, err)
}

func Test_Shared_ParseProductID_MaxLen_IsAccepted(t *testing.T) {
	// 80 chars é o limite superior inclusivo
	s := strings.Repeat("a", 80)
	id, err := shared.ParseProductID(s)
	require.NoError(t, err)
	assert.Equal(t, 80, len(id.String()))
}

func Test_Shared_ProductID_IsZero_ZeroValue_ReturnsTrue(t *testing.T) {
	var id shared.ProductID
	assert.True(t, id.IsZero())
}

func Test_Shared_NewPurchaseID_ProducesValidUUID(t *testing.T) {
	id := shared.NewPurchaseID()
	_, err := uuid.Parse(id.String())
	assert.NoError(t, err)
}

func Test_Shared_ZeroValues_AllIsZeroTrue(t *testing.T) {
	var (
		u shared.UserID
		a shared.AttemptID
		c shared.CertificateHash
		p shared.ProductID
		s shared.SimuladoID
		r shared.ReferralID
	)
	assert.True(t, u.IsZero())
	assert.True(t, a.IsZero())
	assert.True(t, c.IsZero())
	assert.True(t, p.IsZero())
	assert.True(t, s.IsZero())
	assert.True(t, r.IsZero())
}
