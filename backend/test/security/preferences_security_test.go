//go:build security

// Threat model — preferências pedagógicas (POST/GET /api/v1/me/preferences):
//
//	T1. IDOR — usuário A tenta ler/escrever preferências de outro user.
//	    Mitigação: handler usa UserIDFromContext (do JWT), nunca aceita
//	    userID via body/query. Teste confirma isolamento.
//
//	T2. Payload abuse — listas oversize, IDs gigantes, caracteres especiais
//	    (ataque ao índice GIN, SQL injection via campo TEXT[]).
//	    Mitigação: limites no domain (MaxHubIDs, MaxIDLength) + sanitização
//	    slug-like.
//
//	T3. Enum injection — objective/skillLevel com valor fora da allow-list.
//	    Mitigação: validação no domain rejeita com ErrValidation.
//
//	T4. JSON bomb / negative arrays — body malformado ou tipos errados.
//	    Mitigação: decoder estrito retorna 400 sem chegar no use case.
package security

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	apppref "github.com/fernandofv/api/internal/application/preferences"
	dompref "github.com/fernandofv/api/internal/domain/preferences"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// --- Stub repo replicado (test/security é build-tagged, isolado) ---

type secStubRepo struct {
	byUser map[shared.UserID]*dompref.Preferences
}

func newSecStub() *secStubRepo {
	return &secStubRepo{byUser: make(map[shared.UserID]*dompref.Preferences)}
}
func (s *secStubRepo) FindByUser(_ context.Context, id shared.UserID) (*dompref.Preferences, error) {
	if p, ok := s.byUser[id]; ok {
		return p, nil
	}
	return nil, shared.ErrNotFound
}
func (s *secStubRepo) Upsert(_ context.Context, p *dompref.Preferences) error {
	s.byUser[p.UserID()] = p
	return nil
}
func (s *secStubRepo) DeleteByUser(_ context.Context, id shared.UserID) error {
	delete(s.byUser, id)
	return nil
}

func newPrefHandler(repo *secStubRepo) *handlers.PreferencesHandler {
	clk := shared.FixedClock{T: time.Date(2026, 5, 16, 12, 0, 0, 0, time.UTC)}
	return handlers.NewPreferencesHandler(
		apppref.NewGetPreferencesUseCase(repo, clk),
		apppref.NewUpdatePreferencesUseCase(repo, clk),
	)
}

func authReq(method, body string, userID shared.UserID) *http.Request {
	var req *http.Request
	if body == "" {
		req = httptest.NewRequest(method, "/api/v1/me/preferences", http.NoBody)
	} else {
		req = httptest.NewRequest(method, "/api/v1/me/preferences", bytes.NewReader([]byte(body)))
	}
	ctx := context.WithValue(req.Context(), middleware.CtxKeyUserID, userID)
	return req.WithContext(ctx)
}

// T1. IDOR — isolation entre users

func Test_Security_Preferences_GET_OnlyReturnsRequesterPreferences(t *testing.T) {
	repo := newSecStub()
	h := newPrefHandler(repo)

	pa := dompref.New("user-A", time.Now())
	hubsA := []string{"hub-claude"}
	_ = pa.Update(dompref.UpdateCommand{HubIDs: &hubsA}, time.Now())
	repo.byUser["user-A"] = pa

	rec := httptest.NewRecorder()
	h.Get(rec, authReq(http.MethodGet, "", "user-B"))

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d", rec.Code)
	}
	var body map[string]any
	_ = json.NewDecoder(rec.Body).Decode(&body)

	hubsResp := body["hubIds"].([]any)
	if len(hubsResp) != 0 {
		t.Fatalf("IDOR detectado: user-B leu hubs de user-A: %v", hubsResp)
	}
	if body["onboarded"] != false {
		t.Fatal("IDOR: user-B viu onboarded=true que pertence ao user-A")
	}
}

func Test_Security_Preferences_PUT_OnlyMutatesRequesterPreferences(t *testing.T) {
	repo := newSecStub()
	h := newPrefHandler(repo)

	pa := dompref.New("user-A", time.Now())
	hubsA := []string{"hub-aws"}
	_ = pa.Update(dompref.UpdateCommand{HubIDs: &hubsA}, time.Now())
	repo.byUser["user-A"] = pa

	body := `{"hubIds": ["hub-ia"]}`
	rec := httptest.NewRecorder()
	h.Update(rec, authReq(http.MethodPut, body, "user-B"))

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d body=%s", rec.Code, rec.Body.String())
	}

	stored := repo.byUser["user-A"]
	if stored == nil || len(stored.HubIDs()) != 1 || stored.HubIDs()[0] != "hub-aws" {
		t.Fatal("IDOR: PUT do user-B sobrescreveu prefs do user-A")
	}
	storedB := repo.byUser["user-B"]
	if storedB == nil || len(storedB.HubIDs()) != 1 || storedB.HubIDs()[0] != "hub-ia" {
		t.Fatal("user-B nao conseguiu salvar suas proprias prefs")
	}
}

func Test_Security_Preferences_PUT_BodyWithUserID_IsIgnored(t *testing.T) {
	repo := newSecStub()
	h := newPrefHandler(repo)

	body := `{"userId": "victim-uuid", "userID": "victim-uuid", "hubIds": ["hub-ia"]}`
	rec := httptest.NewRecorder()
	h.Update(rec, authReq(http.MethodPut, body, "attacker"))

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200 (userId do body ignorado), got %d", rec.Code)
	}
	if _, exists := repo.byUser["victim-uuid"]; exists {
		t.Fatal("SPOOFING: handler aceitou userID do body")
	}
	if _, exists := repo.byUser["attacker"]; !exists {
		t.Fatal("update deveria afetar apenas o user do JWT")
	}
}

// T2. Payload abuse

func Test_Security_Preferences_PUT_OversizeHubsList_Returns400(t *testing.T) {
	repo := newSecStub()
	h := newPrefHandler(repo)

	hubs := make([]string, 200)
	for i := range hubs {
		hubs[i] = "hub-flood-" + string(rune('a'+i%26))
	}
	payload, _ := json.Marshal(map[string]any{"hubIds": hubs})

	rec := httptest.NewRecorder()
	h.Update(rec, authReq(http.MethodPut, string(payload), "user-1"))

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("listas oversize devem ser 400, got %d", rec.Code)
	}
	if _, exists := repo.byUser["user-1"]; exists {
		t.Fatal("payload abusivo NAO deve ser persistido")
	}
}

func Test_Security_Preferences_PUT_GiantSingleID_Returns400(t *testing.T) {
	repo := newSecStub()
	h := newPrefHandler(repo)

	bigID := strings.Repeat("a", 10000)
	payload, _ := json.Marshal(map[string]any{"hubIds": []string{bigID}})

	rec := httptest.NewRecorder()
	h.Update(rec, authReq(http.MethodPut, string(payload), "user-1"))

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("ID gigante deve ser 400, got %d", rec.Code)
	}
}

// T3. Enum injection

func Test_Security_Preferences_PUT_InjectionInObjective_Returns400(t *testing.T) {
	repo := newSecStub()
	h := newPrefHandler(repo)

	payload := `{"objectives": ["'; DROP TABLE users; --"]}`
	rec := httptest.NewRecorder()
	h.Update(rec, authReq(http.MethodPut, payload, "user-1"))

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("payload de injection deve ser 400, got %d", rec.Code)
	}
}

func Test_Security_Preferences_PUT_NonSlugIDs_Returns400(t *testing.T) {
	repo := newSecStub()
	h := newPrefHandler(repo)

	cases := []string{
		`{"hubIds": ["hub-ia/../etc/passwd"]}`,
		`{"hubIds": ["hub-ia$(rm -rf /)"]}`,
		`{"hubIds": ["hub with spaces"]}`,
		`{"hubIds": ["HUB-WITH-UPPERCASE"]}`,
		`{"hubIds": ["hub-with-special-chars!@#"]}`,
	}
	for _, payload := range cases {
		rec := httptest.NewRecorder()
		h.Update(rec, authReq(http.MethodPut, payload, "user-1"))
		if rec.Code != http.StatusBadRequest {
			t.Errorf("payload %q deveria ser 400, got %d", payload, rec.Code)
		}
	}
	if _, exists := repo.byUser["user-1"]; exists {
		t.Fatal("nenhum payload malicioso deveria ter sido persistido")
	}
}

func Test_Security_Preferences_PUT_TooManyObjectives_Returns400(t *testing.T) {
	repo := newSecStub()
	h := newPrefHandler(repo)

	objs := make([]string, 50)
	for i := range objs {
		objs[i] = "certifications"
	}
	payload, _ := json.Marshal(map[string]any{"objectives": objs})

	rec := httptest.NewRecorder()
	h.Update(rec, authReq(http.MethodPut, string(payload), "user-1"))

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("lista oversize deve ser 400, got %d", rec.Code)
	}
}

// T4. JSON malformado

func Test_Security_Preferences_PUT_TypeMismatch_Returns400(t *testing.T) {
	repo := newSecStub()
	h := newPrefHandler(repo)

	cases := []string{
		`{"hubIds": "not-an-array"}`,
		`{"skillLevel": 42}`,
		`{"dailyQuestionEnabled": "yes"}`,
		``,
	}
	for _, payload := range cases {
		rec := httptest.NewRecorder()
		h.Update(rec, authReq(http.MethodPut, payload, "user-1"))
		if rec.Code != http.StatusBadRequest {
			t.Errorf("body invalido %q deveria ser 400, got %d", payload, rec.Code)
		}
	}
}

func Test_Security_Preferences_PUT_OnboardedAt_CannotBeOverwrittenByUser(t *testing.T) {
	repo := newSecStub()
	h := newPrefHandler(repo)

	body := `{"onboardedAt": "1999-01-01T00:00:00Z", "hubIds": ["hub-ia"]}`
	rec := httptest.NewRecorder()
	h.Update(rec, authReq(http.MethodPut, body, "user-1"))

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200 com campo extra (deve ser ignorado), got %d", rec.Code)
	}

	stored := repo.byUser["user-1"]
	if stored.OnboardedAt() == nil {
		t.Fatal("onboardedAt deveria ter sido marcado pelo servidor")
	}
	if stored.OnboardedAt().Year() == 1999 {
		t.Fatal("usuario sobrescreveu onboardedAt - bypass de invariante")
	}
}
