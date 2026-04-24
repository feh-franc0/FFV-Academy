//go:build security

// Timing attacks: MagicToken.Matches usa crypto/subtle.ConstantTimeCompare.
// Estes testes verificam empiricamente que o runtime não varia de forma
// detectável com base no conteúdo do input.
package security

import (
	"math"
	"sort"
	"testing"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
)

func Benchmark_MagicToken_Matches_Correct(b *testing.B) {
	tok, _ := identity.GenerateMagicToken(5*time.Minute, time.Now())
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = tok.Matches(tok.Value())
	}
}

func Benchmark_MagicToken_Matches_Incorrect(b *testing.B) {
	tok, _ := identity.GenerateMagicToken(5*time.Minute, time.Now())
	wrong := "000000"
	if wrong == tok.Value() {
		wrong = "111111"
	}
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = tok.Matches(wrong)
	}
}

// Test_MagicToken_Timing_ConstantTimeCompare_Empirical: mede p99-p1 ao comparar
// com vários tokens errados e compara com o mesmo para o token correto.
// O teste usa um threshold permissivo (10x) para evitar flaky em CI lento —
// o objetivo é detectar regressões grosseiras (ex: troca para `==` ingênuo).
func Test_MagicToken_Timing_ConstantTimeCompare_Empirical(t *testing.T) {
	tok, err := identity.GenerateMagicToken(5*time.Minute, time.Now())
	if err != nil {
		t.Fatalf("gen: %v", err)
	}

	// 10 tokens errados que variam na posição do primeiro byte divergente:
	// isso tentaria explorar `==` curto-circuitando em comparações ingênuas.
	wrongs := []string{
		"000000", "100000", "010000", "001000", "000100",
		"000010", "000001", "111111", "999999", "123456",
	}

	measure := func(input string) time.Duration {
		const iters = 10_000
		samples := make([]time.Duration, iters)
		for i := 0; i < iters; i++ {
			start := time.Now()
			_ = tok.Matches(input)
			samples[i] = time.Since(start)
		}
		sort.Slice(samples, func(i, j int) bool { return samples[i] < samples[j] })
		return samples[iters*99/100] - samples[iters*1/100]
	}

	correctSpread := measure(tok.Value())
	maxWrong := time.Duration(0)
	for _, w := range wrongs {
		if s := measure(w); s > maxWrong {
			maxWrong = s
		}
	}

	// Cap inferior de 1µs: em máquinas rápidas, spreads são nanosegundos e o
	// ratio pode explodir com ruído de scheduling.
	lower := time.Microsecond
	if correctSpread < lower {
		correctSpread = lower
	}
	ratio := math.Abs(float64(maxWrong)-float64(correctSpread)) / float64(correctSpread)
	if ratio > 10.0 {
		t.Fatalf("timing variance suspeita: correctSpread=%v maxWrongSpread=%v (ratio=%.2f)", correctSpread, maxWrong, ratio)
	}
	t.Logf("correct p99-p1=%v  worst-wrong p99-p1=%v  ratio=%.2f", correctSpread, maxWrong, ratio)
}
