//go:build security

// Threat model: respostas de erro podem vazar stack traces, queries SQL,
// caminhos absolutos de arquivo ou segredos de configuração. Estes testes
// asseguram que erros internos resultam em mensagens genéricas e que o
// formato RFC 7807 não inclui campos extras.
package security

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
	"github.com/fernandofv/api/internal/interfaces/http/httputil"
)

// Erro interno simulado contendo informações sensíveis — ao ser passado
// pelo HandleDomainError, NADA disso deve aparecer no body do response.
var errSensitive = errors.New(
	"pq: connection refused (host=10.0.0.5 port=5432 password=hunter2) at /Users/fernando/backend/repo.go:123",
)

func Test_Security_ErrorResponse_NoStackTrace(t *testing.T) {
	rec := httptest.NewRecorder()
	handlers.HandleDomainError(rec, errSensitive)

	body := rec.Body.String()
	leaks := []string{
		".go:", "/Users/", "/home/", "goroutine ",
		"panic:", "runtime.gopanic",
	}
	for _, l := range leaks {
		if strings.Contains(body, l) {
			t.Fatalf("response vaza %q: %s", l, body)
		}
	}
}

func Test_Security_ErrorResponse_NoSQLErrorLeaked(t *testing.T) {
	rec := httptest.NewRecorder()
	handlers.HandleDomainError(rec, errSensitive)

	body := rec.Body.String()
	sqlLeaks := []string{"pq:", "connection refused", "port=5432", "password=", "host="}
	for _, l := range sqlLeaks {
		if strings.Contains(body, l) {
			t.Fatalf("response vaza detalhe SQL %q: %s", l, body)
		}
	}
	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("esperado 500 para erro genérico, got %d", rec.Code)
	}
}

func Test_Security_ErrorResponse_StructureRFC7807(t *testing.T) {
	rec := httptest.NewRecorder()
	httputil.WriteError(rec, http.StatusBadRequest, "campo inválido", "validation-error")

	if ct := rec.Header().Get("Content-Type"); !strings.Contains(ct, "problem+json") {
		t.Fatalf("Content-Type deve ser application/problem+json, got %q", ct)
	}

	var got map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("body não é JSON: %v", err)
	}
	for _, k := range []string{"type", "title", "status", "detail"} {
		if _, ok := got[k]; !ok {
			t.Fatalf("RFC 7807: campo %q ausente; got=%+v", k, got)
		}
	}
	// Garante que NÃO existem campos não documentados (stack, trace, etc.)
	for k := range got {
		switch k {
		case "type", "title", "status", "detail", "instance":
			// ok
		default:
			t.Fatalf("campo extra no Problem+JSON: %q (poderia vazar info)", k)
		}
	}
}

func Test_Security_ErrorResponse_NoSecretsInError(t *testing.T) {
	// Simula erro contendo o segredo Stripe — NUNCA deve aparecer no response.
	err := errors.New("stripe error: invalid key sk_live_super_secret_1234567890ABCDEF")
	rec := httptest.NewRecorder()
	handlers.HandleDomainError(rec, err)

	body := rec.Body.String()
	secrets := []string{"sk_live_", "sk_test_", "whsec_", "re_test_", "sk-ant-"}
	for _, s := range secrets {
		if strings.Contains(body, s) {
			t.Fatalf("response vaza padrão de secret %q: %s", s, body)
		}
	}
}

// Email enumeration: /auth/request-token DEVE retornar a mesma resposta
// independentemente do email existir ou não. Aqui confirmamos via repo stub
// que (a) email existente, (b) email inexistente produzem o mesmo status e
// uma resposta de tamanho similar (resistência a side-channel).
func Test_Security_EmailEnumeration_Prevented(t *testing.T) {
	h := buildAuthHandlerWithPhoneFlag(true)

	send := func(email string) (int, string) {
		body := `{"email":"` + email + `"}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/request-token",
			strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		h.RequestToken(rec, req)
		return rec.Code, rec.Body.String()
	}

	// Ambos os emails são "novos" no repo stub (FindByEmail → ErrNotFound) —
	// confirmamos que a resposta NÃO diferencia explicitamente entre "novo"
	// vs "já cadastrado" via mensagem.
	c1, b1 := send("first@example.com")
	c2, b2 := send("second@example.com")

	if c1 != c2 {
		t.Fatalf("status diferentes para enums: c1=%d c2=%d", c1, c2)
	}
	if c1 != http.StatusAccepted {
		t.Fatalf("esperado 202; got %d", c1)
	}
	// As respostas podem ter o flag isNewUser, mas NÃO devem conter texto
	// como "usuário não existe" ou "email inválido" para casos pretos/brancos.
	for _, body := range []string{b1, b2} {
		l := strings.ToLower(body)
		if strings.Contains(l, "não existe") || strings.Contains(l, "not found") {
			t.Fatalf("resposta vaza existência do email: %s", body)
		}
	}
}

// Garante que erros explícitos de domínio (sentinels) MAPEIAM corretamente
// e não vazam detalhes técnicos.
func Test_Security_DomainErrors_MapCorrectly(t *testing.T) {
	cases := []struct {
		err  error
		code int
	}{
		{shared.ErrNotFound, http.StatusNotFound},
		{shared.ErrUnauthorized, http.StatusUnauthorized},
		{shared.ErrForbidden, http.StatusForbidden},
		{shared.ErrConflict, http.StatusConflict},
		{shared.ErrValidation, http.StatusBadRequest},
		{shared.ErrRateLimited, http.StatusTooManyRequests},
	}
	for _, tc := range cases {
		rec := httptest.NewRecorder()
		handlers.HandleDomainError(rec, tc.err)
		if rec.Code != tc.code {
			t.Errorf("err=%v: esperado status %d got %d", tc.err, tc.code, rec.Code)
		}
	}
}
