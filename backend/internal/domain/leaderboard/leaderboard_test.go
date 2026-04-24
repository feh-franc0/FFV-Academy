package leaderboard_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/fernandofv/api/internal/domain/leaderboard"
)

func Test_Leaderboard_RankEntry_ZeroValue_IsValid(t *testing.T) {
	var e leaderboard.RankEntry
	assert.Empty(t, e.DisplayName)
	assert.Equal(t, 0, e.XPGained)
	assert.Equal(t, 0, e.Rank)
}

func Test_Leaderboard_WeekStart_Monday_ReturnsSameDate(t *testing.T) {
	// 2026-04-20 é segunda-feira
	monday := time.Date(2026, 4, 20, 15, 30, 0, 0, time.UTC)
	got := leaderboard.WeekStart(monday)
	assert.Equal(t, time.Date(2026, 4, 20, 0, 0, 0, 0, time.UTC), got)
}

func Test_Leaderboard_WeekStart_Wednesday_ReturnsPreviousMonday(t *testing.T) {
	wed := time.Date(2026, 4, 22, 12, 0, 0, 0, time.UTC)
	got := leaderboard.WeekStart(wed)
	assert.Equal(t, time.Date(2026, 4, 20, 0, 0, 0, 0, time.UTC), got)
}

func Test_Leaderboard_WeekStart_Sunday_ReturnsPreviousMondayNotNext(t *testing.T) {
	// 2026-04-26 é domingo — deve voltar p/ 2026-04-20 (segunda passada), não avançar p/ 2026-04-27.
	sun := time.Date(2026, 4, 26, 23, 59, 0, 0, time.UTC)
	got := leaderboard.WeekStart(sun)
	assert.Equal(t, time.Date(2026, 4, 20, 0, 0, 0, 0, time.UTC), got)
}

func Test_Leaderboard_WeekStart_IsAlwaysUTC(t *testing.T) {
	// Input em fuso local qualquer: resultado deve estar em UTC.
	loc, err := time.LoadLocation("America/Sao_Paulo")
	if err != nil {
		t.Skip("timezone data indisponível")
	}
	local := time.Date(2026, 4, 22, 22, 0, 0, 0, loc) // 22h em SP = 01h UTC quinta-feira
	got := leaderboard.WeekStart(local)
	assert.Equal(t, time.UTC, got.Location())
	assert.Equal(t, 0, got.Hour())
	assert.Equal(t, 0, got.Minute())
}

func Test_Leaderboard_WeekStart_ZerosTimeComponents(t *testing.T) {
	t0 := time.Date(2026, 4, 22, 13, 45, 30, 123, time.UTC)
	got := leaderboard.WeekStart(t0)
	assert.Equal(t, 0, got.Hour())
	assert.Equal(t, 0, got.Minute())
	assert.Equal(t, 0, got.Second())
	assert.Equal(t, 0, got.Nanosecond())
}
