package leaderboard_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/fernandofv/api/internal/domain/leaderboard"
)

// IsValidPeriod garante que apenas os 4 períodos conhecidos são aceitos —
// previne que um query param malicioso (?period=DROP_TABLE) chegue ao SQL.
func TestIsValidPeriod_AllValid(t *testing.T) {
	valid := []string{"weekly", "monthly", "yearly", "all-time"}
	for _, v := range valid {
		assert.True(t, leaderboard.IsValidPeriod(v), "period %s should be valid", v)
	}
}

func TestIsValidPeriod_RejectsInvalid(t *testing.T) {
	invalid := []string{"", "daily", "WEEKLY", "all_time", "drop;truncate", "<script>"}
	for _, v := range invalid {
		assert.False(t, leaderboard.IsValidPeriod(v), "period %s should be invalid", v)
	}
}

func TestPeriodWindow_Weekly_StartsOnMonday(t *testing.T) {
	// 2026-05-04 é segunda-feira UTC
	now := time.Date(2026, 5, 4, 14, 30, 0, 0, time.UTC)
	start, end := leaderboard.PeriodWindow(leaderboard.PeriodWeekly, now)

	assert.Equal(t, time.Date(2026, 5, 4, 0, 0, 0, 0, time.UTC), start)
	assert.Equal(t, time.Date(2026, 5, 11, 0, 0, 0, 0, time.UTC), end)
}

func TestPeriodWindow_Weekly_FromMidWeek(t *testing.T) {
	// 2026-05-07 (quinta) — janela ainda começa na segunda 04
	now := time.Date(2026, 5, 7, 10, 0, 0, 0, time.UTC)
	start, _ := leaderboard.PeriodWindow(leaderboard.PeriodWeekly, now)
	assert.Equal(t, time.Monday, start.Weekday())
	assert.Equal(t, 4, start.Day())
}

func TestPeriodWindow_Monthly(t *testing.T) {
	now := time.Date(2026, 5, 15, 12, 0, 0, 0, time.UTC)
	start, end := leaderboard.PeriodWindow(leaderboard.PeriodMonthly, now)
	assert.Equal(t, time.Date(2026, 5, 1, 0, 0, 0, 0, time.UTC), start)
	assert.Equal(t, time.Date(2026, 6, 1, 0, 0, 0, 0, time.UTC), end)
}

func TestPeriodWindow_Yearly(t *testing.T) {
	now := time.Date(2026, 8, 20, 0, 0, 0, 0, time.UTC)
	start, end := leaderboard.PeriodWindow(leaderboard.PeriodYearly, now)
	assert.Equal(t, time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC), start)
	assert.Equal(t, time.Date(2027, 1, 1, 0, 0, 0, 0, time.UTC), end)
}

func TestPeriodWindow_AllTime_StartIsZero(t *testing.T) {
	now := time.Date(2026, 5, 4, 12, 0, 0, 0, time.UTC)
	start, end := leaderboard.PeriodWindow(leaderboard.PeriodAllTime, now)
	assert.True(t, start.IsZero(), "all-time start should be zero")
	assert.False(t, end.IsZero(), "all-time end should be now")
}

func TestPeriodWindow_InvalidPeriod_FallsBackToWeekly(t *testing.T) {
	now := time.Date(2026, 5, 4, 10, 0, 0, 0, time.UTC)
	start, end := leaderboard.PeriodWindow(leaderboard.Period("invalid"), now)

	// Fallback defensivo — não deve crashar nem retornar zero
	assert.False(t, start.IsZero())
	assert.False(t, end.IsZero())
	assert.True(t, end.After(start))
}

// TestPeriodWindow_StartIsLessThanEnd — invariante crítica para qualquer período válido
func TestPeriodWindow_StartLessThanEnd(t *testing.T) {
	now := time.Now().UTC()
	periods := []leaderboard.Period{
		leaderboard.PeriodWeekly,
		leaderboard.PeriodMonthly,
		leaderboard.PeriodYearly,
	}
	for _, p := range periods {
		start, end := leaderboard.PeriodWindow(p, now)
		assert.True(t, start.Before(end), "start should be before end for period %s", p)
	}
}
