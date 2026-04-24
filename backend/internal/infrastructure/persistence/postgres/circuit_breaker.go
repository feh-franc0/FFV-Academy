// Package postgres — Circuit Breaker para o banco de dados PostgreSQL.
//
// O circuit breaker protege a aplicação de tentativas repetidas de acesso a um
// banco instável. Quando muitas falhas ocorrem em um curto intervalo, o circuito
// "abre" e rejeita imediatamente novos requests — evitando latência de timeout
// e aliviando a pressão sobre o banco.
//
// ESTADOS:
//   - Fechado (closed): operação normal. Falhas são contadas.
//   - Aberto (open): rejeita requests sem tentar o banco. Após timeout, vai para half-open.
//   - Meio-aberto (half-open): testa 1 request. Sucesso → fecha; falha → reabre.
//
// THRESHOLD: 5 falhas em uma janela deslizante de 10s → abre o circuito.
// RESET: 30s no estado open → entra em half-open para testar.
//
// Thread-safe: sync.Mutex protege todos os campos mutáveis.
package postgres

import (
	"sync"
	"time"
)

// Estado representa o estado atual do circuit breaker.
type Estado int

const (
	// EstadoClosed é o estado normal de operação (circuito fechado = corrente flui).
	EstadoClosed Estado = iota
	// EstadoOpen indica que o circuito está aberto — requests são rejeitados.
	EstadoOpen
	// EstadoHalfOpen indica o estado de teste — um único request é permitido.
	EstadoHalfOpen
)

// circuitBreakerDefaults agrupa as constantes de configuração do breaker.
// Separadas do struct para facilitar testes e ajustes futuros.
const (
	// defaultFailureThreshold: 5 falhas dentro da janela de tempo abrem o circuito.
	defaultFailureThreshold = 5
	// defaultFailureWindow: janela deslizante de 10s para contar falhas.
	defaultFailureWindow = 10 * time.Second
	// defaultOpenTimeout: circuito permanece aberto por 30s antes de testar half-open.
	defaultOpenTimeout = 30 * time.Second
)

// CircuitBreaker implementa o padrão circuit breaker thread-safe.
// Deve ser instanciado uma vez e compartilhado entre todas as operações do pool.
type CircuitBreaker struct {
	mu sync.Mutex

	// Configuração (imutável após criação).
	failureThreshold int
	failureWindow    time.Duration
	openTimeout      time.Duration

	// Estado mutável (protegido por mu).
	state         Estado
	failureCount  int
	windowStart   time.Time // início da janela de contagem de falhas
	openedAt      time.Time // momento em que o circuito foi aberto
	halfOpenTried bool      // true se já enviamos o request de teste em half-open
}

// NewCircuitBreaker cria um circuit breaker com os parâmetros padrão.
//
// threshold  = 5 falhas em 10s → abre
// openTimeout = 30s → entra em half-open
func NewCircuitBreaker() *CircuitBreaker {
	return &CircuitBreaker{
		failureThreshold: defaultFailureThreshold,
		failureWindow:    defaultFailureWindow,
		openTimeout:      defaultOpenTimeout,
		state:            EstadoClosed,
		windowStart:      time.Now(),
	}
}

// NewCircuitBreakerWithConfig cria um circuit breaker com configuração customizada.
// Útil para testes onde queremos thresholds menores.
func NewCircuitBreakerWithConfig(threshold int, window, openTimeout time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		failureThreshold: threshold,
		failureWindow:    window,
		openTimeout:      openTimeout,
		state:            EstadoClosed,
		windowStart:      time.Now(),
	}
}

// IsOpen retorna true se o circuito está aberto e deve-se rejeitar o request.
//
// Transições automáticas:
//   - open + openTimeout expirado → half-open (testa 1 request)
//   - half-open + já tentou → open (o request de teste já foi enviado, aguarda resultado)
func (cb *CircuitBreaker) IsOpen() bool {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	switch cb.state {
	case EstadoClosed:
		return false

	case EstadoOpen:
		// Verifica se o timeout de abertura expirou — hora de tentar half-open.
		if time.Since(cb.openedAt) >= cb.openTimeout {
			cb.state = EstadoHalfOpen
			cb.halfOpenTried = false
			return false // permite o request de teste
		}
		return true // ainda aberto: rejeita

	case EstadoHalfOpen:
		if cb.halfOpenTried {
			// Já enviamos o request de teste, aguardando RecordSuccess ou RecordFailure.
			// Rejeita requests adicionais enquanto o teste está em andamento.
			return true
		}
		// Primeiro request em half-open: marca como tentado e permite.
		cb.halfOpenTried = true
		return false
	}

	return false
}

// RecordSuccess registra uma operação bem-sucedida.
//
// Transições:
//   - half-open → closed (teste passou, circuito se fecha)
//   - closed → reseta contadores da janela (operação normal)
func (cb *CircuitBreaker) RecordSuccess() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	switch cb.state {
	case EstadoHalfOpen:
		// Teste bem-sucedido: fecha o circuito e reseta contadores.
		cb.state = EstadoClosed
		cb.failureCount = 0
		cb.windowStart = time.Now()
		cb.halfOpenTried = false

	case EstadoClosed:
		// Operação normal bem-sucedida: não precisa fazer nada além de
		// garantir que a janela está atualizada (RecordFailure cuida disso).
	}
}

// RecordFailure registra uma operação falha.
//
// Transições:
//   - closed + falhas >= threshold → open
//   - half-open → open (teste falhou, reabre o circuito)
//   - janela expirada → reseta contadores e começa nova janela
func (cb *CircuitBreaker) RecordFailure() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	switch cb.state {
	case EstadoHalfOpen:
		// O request de teste falhou: reabre o circuito.
		cb.state = EstadoOpen
		cb.openedAt = time.Now()
		cb.halfOpenTried = false

	case EstadoClosed:
		// Verifica se a janela de contagem expirou; se sim, reseta.
		if time.Since(cb.windowStart) >= cb.failureWindow {
			cb.failureCount = 0
			cb.windowStart = time.Now()
		}

		cb.failureCount++

		// Abre o circuito se atingiu o threshold.
		if cb.failureCount >= cb.failureThreshold {
			cb.state = EstadoOpen
			cb.openedAt = time.Now()
		}
	}
}

// State retorna o estado atual do circuit breaker (para observabilidade).
// Útil para expor no /readyz sem precisar chamar IsOpen (que tem side effects).
func (cb *CircuitBreaker) State() Estado {
	cb.mu.Lock()
	defer cb.mu.Unlock()
	return cb.state
}

// String implementa fmt.Stringer para facilitar logging.
func (e Estado) String() string {
	switch e {
	case EstadoClosed:
		return "closed"
	case EstadoOpen:
		return "open"
	case EstadoHalfOpen:
		return "half-open"
	default:
		return "unknown"
	}
}
