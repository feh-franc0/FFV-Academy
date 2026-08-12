package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

// unreachableRedisClient aponta para uma porta que recusa conexão de
// imediato — simula Redis indisponível sem precisar derrubar um Redis real.
func unreachableRedisClient() *goredis.Client {
	return goredis.NewClient(&goredis.Options{
		Addr:        "127.0.0.1:1",
		DialTimeout: 200 * time.Millisecond,
	})
}

// Test_ClientIP_UntrustedRemote_IgnoresForgedHeaders é o teste que faltava para
// o item 2.4 do pack endurecimento-de-autenticacao: um cliente que fala
// diretamente com a API (RemoteAddr não é um proxy confiável) não pode forjar
// X-Forwarded-For/X-Real-IP para esvaziar o rate limit de outra pessoa ou
// escapar do seu próprio limite.
func Test_ClientIP_UntrustedRemote_IgnoresForgedHeaders(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	r.RemoteAddr = "203.0.113.9:54321" // IP público, não é proxy confiável
	r.Header.Set("X-Real-IP", "10.0.0.1")
	r.Header.Set("X-Forwarded-For", "1.2.3.4, 5.6.7.8")

	got := ClientIP(r)
	if got != "203.0.113.9" {
		t.Fatalf("esperava o RemoteAddr real (203.0.113.9), veio %q — headers forjáveis foram respeitados de um IP não confiável", got)
	}
}

// Test_ClientIP_TrustedProxy_PrefersXRealIP cobre a preferência documentada em
// ClientIP: X-Real-IP vence X-Forwarded-For quando o request vem de um proxy
// confiável, porque X-Real-IP é sempre um único valor por construção.
func Test_ClientIP_TrustedProxy_PrefersXRealIP(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	r.RemoteAddr = "127.0.0.1:54321" // loopback — proxy confiável
	r.Header.Set("X-Real-IP", "198.51.100.7")
	r.Header.Set("X-Forwarded-For", "1.2.3.4, 5.6.7.8")

	got := ClientIP(r)
	if got != "198.51.100.7" {
		t.Fatalf("esperava X-Real-IP (198.51.100.7), veio %q", got)
	}
}

// Test_ClientIP_TrustedProxy_UsesLastXFFElement cobre o caso sem X-Real-IP: o
// ÚLTIMO elemento de X-Forwarded-For é o único que o proxy imediato controla —
// os elementos anteriores vêm do cliente e são forjáveis quando o proxy usa
// $proxy_add_x_forwarded_for (anexa) em vez de sobrescrever.
func Test_ClientIP_TrustedProxy_UsesLastXFFElement(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	r.RemoteAddr = "127.0.0.1:54321"
	r.Header.Set("X-Forwarded-For", "1.2.3.4, 5.6.7.8, 9.9.9.9")

	got := ClientIP(r)
	if got != "9.9.9.9" {
		t.Fatalf("esperava o último elemento de X-Forwarded-For (9.9.9.9), veio %q — usar o primeiro elemento é forjável pelo cliente", got)
	}
}

// Test_ClientIP_TrustedProxy_NoHeaders_FallsBackToRemoteAddr garante que, mesmo
// vindo de um proxy confiável, a ausência dos headers não quebra a extração.
func Test_ClientIP_TrustedProxy_NoHeaders_FallsBackToRemoteAddr(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	r.RemoteAddr = "10.0.0.5:54321"

	got := ClientIP(r)
	if got != "10.0.0.5" {
		t.Fatalf("esperava fallback para RemoteAddr (10.0.0.5), veio %q", got)
	}
}

// Test_ClientIP_VaryingXFF_DoesNotZeroOutRateLimitCounter é a prova direta do
// item 2.4: variar o valor de X-Forwarded-For de um cliente NÃO confiável não
// muda o identificador usado pelo rate limit — ele continua sendo o RemoteAddr
// real, então o contador por-IP não pode ser "zerado" trocando o header a cada
// request.
func Test_ClientIP_VaryingXFF_DoesNotZeroOutRateLimitCounter(t *testing.T) {
	xffValues := []string{"1.1.1.1", "2.2.2.2", "3.3.3.3, 4.4.4.4", ""}
	for _, xff := range xffValues {
		r := httptest.NewRequest(http.MethodGet, "/", nil)
		r.RemoteAddr = "203.0.113.9:54321"
		if xff != "" {
			r.Header.Set("X-Forwarded-For", xff)
		}

		got := ClientIP(r)
		if got != "203.0.113.9" {
			t.Fatalf("com X-Forwarded-For=%q, esperava sempre 203.0.113.9 (RemoteAddr), veio %q", xff, got)
		}
	}
}

// Test_RateLimiter_FailClosed_RedisDown_Returns503 é o teste da tarefa 4.1 do
// pack limites-de-recurso-e-auditoria (achado P-09): `rl:cert` migrou de
// NewRateLimiter (fail-open) para NewRateLimiterFailClosed exatamente porque
// a rota de verificação de certificado é um oráculo de enumeração — um Redis
// fora do ar não pode virar "sem limite nenhum".
func Test_RateLimiter_FailClosed_RedisDown_Returns503(t *testing.T) {
	rl := NewRateLimiterFailClosed(unreachableRedisClient(), 120, time.Minute, "rl:cert")
	handlerCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
		w.WriteHeader(http.StatusOK)
	})

	r := httptest.NewRequest(http.MethodGet, "/api/v1/certificates/abc123", nil)
	w := httptest.NewRecorder()
	rl.Middleware()(next).ServeHTTP(w, r)

	if w.Code != http.StatusServiceUnavailable {
		t.Fatalf("esperava 503 com Redis indisponível, veio %d", w.Code)
	}
	if handlerCalled {
		t.Fatal("handler não deveria ter sido chamado — rota fail-closed deve recusar antes de servir")
	}
}

// Test_RateLimiter_FailOpen_RedisDown_ServesRequest garante que rotas
// deliberadamente fail-open (leitura barata) continuam servindo quando o
// Redis está fora — contraste direto com o teste fail-closed acima, prova
// que os dois modos realmente se comportam diferente.
func Test_RateLimiter_FailOpen_RedisDown_ServesRequest(t *testing.T) {
	rl := NewRateLimiter(unreachableRedisClient(), 240, time.Minute, "rl:view")
	handlerCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
		w.WriteHeader(http.StatusOK)
	})

	r := httptest.NewRequest(http.MethodGet, "/api/v1/events/view", nil)
	w := httptest.NewRecorder()
	rl.Middleware()(next).ServeHTTP(w, r)

	if w.Code != http.StatusOK || !handlerCalled {
		t.Fatalf("esperava fail-open servir o request (200, handler chamado), veio %d, handlerCalled=%v", w.Code, handlerCalled)
	}
}
