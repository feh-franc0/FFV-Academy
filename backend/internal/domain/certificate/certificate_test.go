package certificate_test

import (
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/domain/certificate"
	"github.com/fernandofv/api/internal/domain/shared"
)

var (
	testUser     = shared.UserID("user-1")
	testSimulado = shared.SimuladoID("sim-aws")
	testAttempt  = shared.AttemptID("att-1")
	testNow      = time.Date(2026, 4, 24, 12, 0, 0, 0, time.UTC)
)

func Test_Certificate_Issue_ValidScore_ReturnsCertificate(t *testing.T) {
	cert, err := certificate.Issue(testUser, testSimulado, testAttempt, "Fernando", 80, testNow)
	require.NoError(t, err)
	assert.Equal(t, testUser, cert.UserID())
	assert.Equal(t, testSimulado, cert.SimuladoID())
	assert.Equal(t, testAttempt, cert.AttemptID())
	assert.Equal(t, "Fernando", cert.HolderName())
	assert.Equal(t, 80, cert.Score())
	assert.Equal(t, testNow, cert.IssuedAt())
	assert.NotEmpty(t, cert.Hash().String())
}

func Test_Certificate_Issue_ScoreBelowZero_ReturnsValidationError(t *testing.T) {
	_, err := certificate.Issue(testUser, testSimulado, testAttempt, "F", -1, testNow)
	require.Error(t, err)
	assert.True(t, errors.Is(err, shared.ErrValidation))
}

func Test_Certificate_Issue_ScoreAbove100_ReturnsValidationError(t *testing.T) {
	_, err := certificate.Issue(testUser, testSimulado, testAttempt, "F", 101, testNow)
	require.Error(t, err)
	assert.True(t, errors.Is(err, shared.ErrValidation))
}

func Test_Certificate_Issue_Boundaries_Accepted(t *testing.T) {
	for _, s := range []int{0, 100} {
		_, err := certificate.Issue(testUser, testSimulado, testAttempt, "F", s, testNow)
		assert.NoError(t, err, "score=%d should be valid", s)
	}
}

func Test_Certificate_Issue_SameInputs_ProduceSameHash(t *testing.T) {
	c1, err := certificate.Issue(testUser, testSimulado, testAttempt, "A", 80, testNow)
	require.NoError(t, err)
	later := testNow.Add(24 * time.Hour)
	// Nome, score e issuedAt não participam do hash — apenas (userID, simuladoID, attemptID).
	c2, err := certificate.Issue(testUser, testSimulado, testAttempt, "B", 90, later)
	require.NoError(t, err)
	assert.Equal(t, c1.Hash(), c2.Hash())
}

func Test_Certificate_Issue_DifferentUser_ProducesDifferentHash(t *testing.T) {
	c1, _ := certificate.Issue(testUser, testSimulado, testAttempt, "X", 80, testNow)
	c2, _ := certificate.Issue(shared.UserID("user-2"), testSimulado, testAttempt, "X", 80, testNow)
	assert.NotEqual(t, c1.Hash(), c2.Hash())
}

func Test_Certificate_Issue_DifferentAttempt_ProducesDifferentHash(t *testing.T) {
	c1, _ := certificate.Issue(testUser, testSimulado, testAttempt, "X", 80, testNow)
	c2, _ := certificate.Issue(testUser, testSimulado, shared.AttemptID("att-2"), "X", 80, testNow)
	assert.NotEqual(t, c1.Hash(), c2.Hash())
}

func Test_Certificate_Issue_HashFormat_Is64HexChars(t *testing.T) {
	cert, _ := certificate.Issue(testUser, testSimulado, testAttempt, "F", 80, testNow)
	assert.Len(t, cert.Hash().String(), 64)
}

func Test_Certificate_Reconstitute_PreservesFields(t *testing.T) {
	hash := shared.CertificateHash("abc123")
	cert := certificate.Reconstitute(hash, testUser, testSimulado, testAttempt, "Fernando", 85, testNow)
	assert.Equal(t, hash, cert.Hash())
	assert.Equal(t, testUser, cert.UserID())
	assert.Equal(t, testSimulado, cert.SimuladoID())
	assert.Equal(t, testAttempt, cert.AttemptID())
	assert.Equal(t, "Fernando", cert.HolderName())
	assert.Equal(t, 85, cert.Score())
	assert.Equal(t, testNow, cert.IssuedAt())
}
