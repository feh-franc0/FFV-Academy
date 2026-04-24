package shared_test

import (
	"errors"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/fernandofv/api/internal/domain/shared"
)

func Test_Shared_NewValidationError_WrapsErrValidation(t *testing.T) {
	err := shared.NewValidationError("campo obrigatório")
	assert.True(t, errors.Is(err, shared.ErrValidation))
	assert.Equal(t, "campo obrigatório", err.Error())
}

func Test_Shared_NewNotFoundError_WrapsErrNotFound(t *testing.T) {
	err := shared.NewNotFoundError("user")
	assert.True(t, errors.Is(err, shared.ErrNotFound))
	assert.Contains(t, err.Error(), "user")
}

func Test_Shared_NewConflictError_WrapsErrConflict(t *testing.T) {
	err := shared.NewConflictError("estado inválido")
	assert.True(t, errors.Is(err, shared.ErrConflict))
	assert.Equal(t, "estado inválido", err.Error())
}

func Test_Shared_DomainError_Is_PropagatesThroughFmtErrorf(t *testing.T) {
	// Um erro embrulhado com %w deve ainda ser detectável via errors.Is.
	original := shared.NewValidationError("x")
	wrapped := fmt.Errorf("context: %w", original)
	assert.True(t, errors.Is(wrapped, shared.ErrValidation))
	assert.True(t, errors.Is(wrapped, original))
}

func Test_Shared_DomainError_Unwrap_ReturnsSentinel(t *testing.T) {
	de := shared.NewConflictError("dup")
	assert.Equal(t, shared.ErrConflict, de.Unwrap())
}

func Test_Shared_SentinelErrors_AreDistinct(t *testing.T) {
	sentinels := []error{
		shared.ErrNotFound,
		shared.ErrUnauthorized,
		shared.ErrForbidden,
		shared.ErrConflict,
		shared.ErrValidation,
		shared.ErrRateLimited,
	}
	for i, a := range sentinels {
		for j, b := range sentinels {
			if i == j {
				continue
			}
			assert.False(t, errors.Is(a, b), "sentinel[%d] should not Is sentinel[%d]", i, j)
		}
	}
}

func Test_Shared_DomainError_Is_OtherSentinel_ReturnsFalse(t *testing.T) {
	err := shared.NewValidationError("x")
	assert.False(t, errors.Is(err, shared.ErrNotFound))
	assert.False(t, errors.Is(err, shared.ErrConflict))
}
