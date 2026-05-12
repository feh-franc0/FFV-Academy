// PADRÕES:
//   - DIP: Clock é uma interface (port); SystemClock é a impl de produção.
//   - Testabilidade: testes injetam MockClock para controlar o tempo.
package shared

import "time"

// Clock abstrai o acesso ao tempo atual.
// Toda lógica de domínio que depende de tempo usa Clock, nunca time.Now() direto.
//
// DIP: o domínio depende desta interface; a impl concreta vive em infrastructure/clock.
type Clock interface {
	Now() time.Time
}

// SystemClock implementa Clock usando o relógio do sistema operational.
type SystemClock struct{}

func (SystemClock) Now() time.Time { return time.Now().UTC() }

// FixedClock implementa Clock com um tempo fixo — útil em testes.
type FixedClock struct {
	T time.Time
}

func (c FixedClock) Now() time.Time { return c.T }

// NewFixedClock cria um FixedClock com o tempo fornecido.
func NewFixedClock(t time.Time) FixedClock { return FixedClock{T: t} }
