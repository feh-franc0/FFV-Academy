package identity_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/domain/identity"
)

func Test_MagicToken_GenerateMagicToken_IsValid(t *testing.T) {
	now := time.Now()
	ttl := 10 * time.Minute
	token, err := identity.GenerateMagicToken(ttl, now)
	require.NoError(t, err)

	assert.NotEmpty(t, token.Value())
	assert.False(t, token.IsExpired(now))
}

func Test_MagicToken_Matches_CorrectValue_ReturnsTrue(t *testing.T) {
	now := time.Now()
	token, _ := identity.GenerateMagicToken(10*time.Minute, now)
	assert.True(t, token.Matches(token.Value()))
}

func Test_MagicToken_Matches_WrongValue_ReturnsFalse(t *testing.T) {
	now := time.Now()
	token, _ := identity.GenerateMagicToken(10*time.Minute, now)
	assert.False(t, token.Matches("999999"))
}

func Test_MagicToken_IsExpired_PastDeadline_ReturnsTrue(t *testing.T) {
	past := time.Now().Add(-1 * time.Hour)
	token, _ := identity.GenerateMagicToken(10*time.Minute, past)
	assert.True(t, token.IsExpired(time.Now()))
}

func Test_MagicToken_Reconstitute_ReconstructsCorrectly(t *testing.T) {
	expiresAt := time.Now().Add(10 * time.Minute)
	token := identity.Reconstitute("123456", expiresAt)
	assert.True(t, token.Matches("123456"))
	assert.False(t, token.IsExpired(time.Now()))
}
