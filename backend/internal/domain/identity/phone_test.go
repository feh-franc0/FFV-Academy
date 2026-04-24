package identity_test

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

func Test_Phone_NewPhone_EmptyString_ReturnsZero(t *testing.T) {
	p, err := identity.NewPhone("")
	require.NoError(t, err)
	assert.True(t, p.IsZero())
}

func Test_Phone_NewPhone_WhitespaceOnly_ReturnsZero(t *testing.T) {
	p, err := identity.NewPhone("   ")
	require.NoError(t, err)
	assert.True(t, p.IsZero())
}

func Test_Phone_NewPhone_ValidE164_ReturnsNormalized(t *testing.T) {
	p, err := identity.NewPhone("+5511987654321")
	require.NoError(t, err)
	assert.Equal(t, "+5511987654321", p.String())
}

// NOTA DE BUG DE DOMÍNIO: a regex `^\+?55?\d{10,11}$` exige que o número comece com "5"
// (o segundo 5 é opcional). Logo, "11987654321" (sem DDI) é rejeitado, embora o comentário
// da regex diga "DDI opcional". O teste documenta o comportamento atual.
func Test_Phone_NewPhone_WithoutCountryCode_CurrentlyRejected(t *testing.T) {
	_, err := identity.NewPhone("11987654321")
	require.Error(t, err)
}

func Test_Phone_NewPhone_WithCountryCodeNoPlus_AddsPlus(t *testing.T) {
	p, err := identity.NewPhone("5511987654321")
	require.NoError(t, err)
	assert.Equal(t, "+5511987654321", p.String())
}

func Test_Phone_NewPhone_WithSpacesAndDashes_Normalizes(t *testing.T) {
	p, err := identity.NewPhone("+55 11 98765-4321")
	require.NoError(t, err)
	assert.Equal(t, "+5511987654321", p.String())
}

func Test_Phone_NewPhone_Invalid_ReturnsValidationError(t *testing.T) {
	cases := []string{
		"invalido",
		"abc12345678",
		"++5511987654321",
		"123",
	}
	for _, tc := range cases {
		_, err := identity.NewPhone(tc)
		require.Error(t, err, "expected error for %q", tc)
		assert.True(t, errors.Is(err, shared.ErrValidation), "err should wrap ErrValidation for %q", tc)
	}
}

func Test_Phone_IsZero_ZeroValue_ReturnsTrue(t *testing.T) {
	var p identity.Phone
	assert.True(t, p.IsZero())
}

func Test_Phone_IsZero_NonEmpty_ReturnsFalse(t *testing.T) {
	p, _ := identity.NewPhone("+5511987654321")
	assert.False(t, p.IsZero())
}

func Test_Phone_Equals_SameValue_IsSymmetric(t *testing.T) {
	a, _ := identity.NewPhone("+5511987654321")
	b, _ := identity.NewPhone("5511987654321") // normaliza p/ o mesmo
	assert.True(t, a.Equals(b))
	assert.True(t, b.Equals(a))
}

func Test_Phone_Equals_DifferentValues_ReturnsFalse(t *testing.T) {
	a, _ := identity.NewPhone("+5511987654321")
	b, _ := identity.NewPhone("+5511912345678")
	assert.False(t, a.Equals(b))
}

func Test_Phone_MustNewPhone_Invalid_Panics(t *testing.T) {
	assert.Panics(t, func() { identity.MustNewPhone("invalido") })
}
