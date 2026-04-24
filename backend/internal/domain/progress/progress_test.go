package progress_test

import (
	"encoding/json"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/domain/progress"
	"github.com/fernandofv/api/internal/domain/shared"
)

var (
	uid      = shared.UserID("user-1")
	baseTime = time.Date(2026, 4, 24, 10, 0, 0, 0, time.UTC)
)

func Test_Progress_NewSnapshot_ValidState_ReturnsSnapshot(t *testing.T) {
	state := json.RawMessage(`{"xp":100}`)
	snap, err := progress.NewSnapshot(uid, 1, state, baseTime, baseTime)

	require.NoError(t, err)
	assert.Equal(t, uid, snap.UserID())
	assert.Equal(t, 1, snap.SchemaVersion())
	assert.JSONEq(t, `{"xp":100}`, string(snap.State()))
	assert.Equal(t, baseTime, snap.ClientUpdatedAt())
	assert.Equal(t, baseTime, snap.ServerUpdatedAt())
}

func Test_Progress_NewSnapshot_InvalidSchemaVersion_ReturnsValidationError(t *testing.T) {
	_, err := progress.NewSnapshot(uid, 0, json.RawMessage(`{}`), baseTime, baseTime)
	require.Error(t, err)
	assert.True(t, errors.Is(err, shared.ErrValidation))
}

func Test_Progress_NewSnapshot_InvalidJSON_ReturnsValidationError(t *testing.T) {
	_, err := progress.NewSnapshot(uid, 1, json.RawMessage(`{not json}`), baseTime, baseTime)
	require.Error(t, err)
	assert.True(t, errors.Is(err, shared.ErrValidation))
}

func Test_Progress_NewSnapshot_ExceedsMaxSize_ReturnsValidationError(t *testing.T) {
	// payload JSON válido > 2MB
	huge := `"` + strings.Repeat("a", progress.MaxStateSizeBytes+10) + `"`
	_, err := progress.NewSnapshot(uid, 1, json.RawMessage(huge), baseTime, baseTime)
	require.Error(t, err)
	assert.True(t, errors.Is(err, shared.ErrValidation))
}

func Test_Progress_Update_NewerClientTimestamp_Accepts(t *testing.T) {
	snap, _ := progress.NewSnapshot(uid, 1, json.RawMessage(`{"v":1}`), baseTime, baseTime)
	newer := baseTime.Add(1 * time.Minute)

	err := snap.Update(2, json.RawMessage(`{"v":2}`), newer, newer)
	require.NoError(t, err)
	assert.Equal(t, 2, snap.SchemaVersion())
	assert.JSONEq(t, `{"v":2}`, string(snap.State()))
	assert.Equal(t, newer, snap.ClientUpdatedAt())
}

func Test_Progress_Update_EqualClientTimestamp_ReturnsConflict(t *testing.T) {
	snap, _ := progress.NewSnapshot(uid, 1, json.RawMessage(`{"v":1}`), baseTime, baseTime)

	err := snap.Update(2, json.RawMessage(`{"v":2}`), baseTime, baseTime)
	require.Error(t, err)
	assert.True(t, errors.Is(err, shared.ErrConflict))
}

func Test_Progress_Update_OlderClientTimestamp_ReturnsConflict(t *testing.T) {
	snap, _ := progress.NewSnapshot(uid, 1, json.RawMessage(`{"v":1}`), baseTime, baseTime)
	older := baseTime.Add(-1 * time.Minute)

	err := snap.Update(2, json.RawMessage(`{"v":2}`), older, baseTime)
	require.Error(t, err)
	assert.True(t, errors.Is(err, shared.ErrConflict))
	// estado original preservado em conflito
	assert.Equal(t, 1, snap.SchemaVersion())
}

func Test_Progress_Update_PreservesSchemaVersionProgression(t *testing.T) {
	snap, _ := progress.NewSnapshot(uid, 3, json.RawMessage(`{}`), baseTime, baseTime)
	newer := baseTime.Add(1 * time.Second)
	require.NoError(t, snap.Update(5, json.RawMessage(`{}`), newer, newer))
	assert.Equal(t, 5, snap.SchemaVersion())
}

func Test_Progress_IsNewerThan_ReturnsTrueWhenClientMoreRecent(t *testing.T) {
	a, _ := progress.NewSnapshot(uid, 1, json.RawMessage(`{}`), baseTime.Add(time.Hour), baseTime)
	b, _ := progress.NewSnapshot(uid, 1, json.RawMessage(`{}`), baseTime, baseTime)
	assert.True(t, a.IsNewerThan(b))
	assert.False(t, b.IsNewerThan(a))
}

func Test_Progress_Reconstitute_PreservesAllFields(t *testing.T) {
	state := json.RawMessage(`{"k":"v"}`)
	srv := baseTime.Add(2 * time.Hour)
	snap := progress.Reconstitute(uid, 2, state, baseTime, srv)
	assert.Equal(t, uid, snap.UserID())
	assert.Equal(t, 2, snap.SchemaVersion())
	assert.Equal(t, state, snap.State())
	assert.Equal(t, baseTime, snap.ClientUpdatedAt())
	assert.Equal(t, srv, snap.ServerUpdatedAt())
}
