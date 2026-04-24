package identity_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/domain/identity"
)

func Test_Email_NewEmail_ValidEmail_ReturnsLowercased(t *testing.T) {
	email, err := identity.NewEmail("Test@EXAMPLE.com")
	require.NoError(t, err)
	assert.Equal(t, "test@example.com", email.String())
}

func Test_Email_NewEmail_EmptyString_ReturnsError(t *testing.T) {
	_, err := identity.NewEmail("")
	assert.Error(t, err)
}

func Test_Email_NewEmail_InvalidFormat_ReturnsError(t *testing.T) {
	cases := []string{
		"notanemail",
		"@example.com",
		"user@",
		"user name@example.com",
		"user@exam ple.com",
	}
	for _, tc := range cases {
		_, err := identity.NewEmail(tc)
		assert.Error(t, err, "expected error for %q", tc)
	}
}

func Test_Email_Equals_SameEmail_ReturnsTrue(t *testing.T) {
	a, _ := identity.NewEmail("user@example.com")
	b, _ := identity.NewEmail("USER@EXAMPLE.COM")
	assert.True(t, a.Equals(b))
}

func Test_Email_IsZero_EmptyEmail_ReturnsTrue(t *testing.T) {
	var e identity.Email
	assert.True(t, e.IsZero())
}
