# TESTING — FFV Academy Backend

Estratégia de testes em pirâmide. Regra geral: teste o comportamento no nível mais baixo que ainda exerce a lógica que importa.

## Pirâmide

```
        e2e / load          (poucos, caros, manuais ou on-demand)
       /-------------\
      / contract (HTTP)\    (handlers + DTOs, sem DB real)
     /-----------------\
    /   integration     \   (repo contra Postgres real via testcontainers)
   /---------------------\
  /        unit           \ (domain + application — mocks inline)
 /-------------------------\
```

Proporção-alvo: ~70% unit, ~15% integration, ~10% contract, ~5% e2e/load.

## Comandos

| Camada | Comando | Requer Docker? |
|--------|---------|----------------|
| Unit (domain + app) | `make test-unit` | Não |
| Contract (HTTP) | `make test-contract` | Não |
| Integration | `make test-integration` | **Sim** (testcontainers sobe Postgres + Redis) |
| Tudo | `make test` | Sim |
| Coverage HTML | `make test-cover` | Não |
| Um único teste | `go test ./internal/domain/simulado/... -run Test_Scorer -v` | Não |
| Lint | `make lint` | Não |

## Coverage target

| Camada | Target | Cobrança |
|--------|--------|----------|
| `internal/domain/**` | ≥ 70% | CI falha se cair |
| `internal/application/**` | ≥ 60% | CI falha se cair |
| `internal/infrastructure/**` | best-effort | não falha CI (integration cobre) |
| `internal/interfaces/http/**` | ≥ 50% contract | — |

Coverage report: `make test-cover` → abre `coverage.html`.

## Convenções

### Naming
`Test_<Type>_<Method>_<Scenario>_<Expected>`

Exemplos reais do repo:
- `Test_Scorer_Calculate_AllCorrect_Returns100`
- `Test_Attempt_AnswerQuestion_AfterFinish_ReturnsError`
- `Test_FinishAttemptUseCase_ScoreAboveThreshold_EmitsCertificateEvent`

### Layout
- Unit tests: ao lado do arquivo (`foo.go` + `foo_test.go`), mesmo package.
- Contract: `backend/test/contract/` com package próprio.
- Integration: `backend/test/integration/` com tag `//go:build integration`.

### Mocks
Sem gomock. Inline: struct anônima ou tipada que implementa a interface. Preferir fakes simples (`map` para storage in-memory) em vez de "mock que grava chamadas".

### Config em testes
Usar `config.LoadTest()` — preenche campos `required:"true"` com dummies. Nunca setar env vars reais em teste.

### Clock
`shared.Clock` injetado via construtor. Em teste usar `FixedClock{T: time.Date(...)}`; nunca `time.Now()` em domínio/application.

## Exemplo — Unit (domain)

Arquivo: `internal/domain/simulado/scorer_test.go`
```go
func Test_Scorer_Calculate_AllCorrect_Returns100(t *testing.T) {
    sim := newFixtureSimulado()   // helper local
    answers := fixtureAllCorrect(sim)

    result := simulado.Scorer{}.Calculate(sim, answers)

    if result.Value != 100 { t.Fatalf("got %d want 100", result.Value) }
    if !result.Passed { t.Fatal("expected passed=true") }
}
```

## Exemplo — Unit (application) com mock inline

Arquivo: `internal/application/simulado/finish_attempt_test.go` (referência real no repo).
```go
type stubAttemptRepo struct{ attempts map[shared.AttemptID]*simulado.Attempt }
func (s *stubAttemptRepo) FindByID(_ context.Context, id shared.AttemptID) (*simulado.Attempt, error) {
    a, ok := s.attempts[id]; if !ok { return nil, shared.ErrNotFound }
    return a, nil
}
// ... restante da interface

func Test_FinishAttemptUseCase_PassingScore_IssuesCertificateEvent(t *testing.T) {
    clock := shared.FixedClock{T: time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)}
    uc := simapp.NewFinishAttemptUseCase(&stubAttemptRepo{...}, &stubCatalog{}, &stubEventBus{}, clock)
    result, err := uc.Execute(ctx, simapp.FinishAttemptCommand{...})
    // asserts
}
```

## Exemplo — Contract (HTTP)

Testa o contrato do endpoint via `httptest.NewRecorder()`. Use case real + repos stub.
```go
func Test_AuthHandler_Verify_NewUser_Returns200WithAccessToken(t *testing.T) {
    h := newTestAuthHandler(t)
    body := strings.NewReader(`{"email":"a@b.com","token":"123456","name":"A","phone":"+5511..."}`)
    req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/verify", body)
    rec := httptest.NewRecorder()

    h.Verify(rec, req)

    if rec.Code != http.StatusOK { t.Fatalf("got %d body=%s", rec.Code, rec.Body.String()) }
    var resp map[string]any
    _ = json.Unmarshal(rec.Body.Bytes(), &resp)
    if resp["accessToken"] == "" { t.Fatal("expected access token") }
}
```

## Exemplo — Integration (testcontainers)

Arquivo com tag `//go:build integration`.
```go
//go:build integration

func Test_UserRepo_SaveAndFindByEmail_RoundTrip(t *testing.T) {
    ctx := context.Background()
    pg := startPostgres(t, ctx)       // helper que sobe container + aplica migrations
    repo := postgres.NewUserRepo(pg.DB)

    u, _, _ := identity.NewUser(...)
    if err := repo.Save(ctx, u); err != nil { t.Fatal(err) }

    got, err := repo.FindByEmail(ctx, u.Email())
    if err != nil { t.Fatal(err) }
    if got.ID() != u.ID() { t.Fatal("mismatched id") }
}
```

## Adicionando um teste novo

1. Comece pelo unit. Se a lógica está no domínio, prove no domínio.
2. Se envolve orquestração (multiple ports), teste o use case com mocks inline.
3. Contract tests só para rotas cujo contrato público importa documentar (ex: códigos de erro por caso).
4. Integration só se existir SQL/Redis não-trivial (ex: UNIQUE constraint + retry otimista).

## Testes de carga (opcional, não no CI)

Template `k6` sugerido em `backend/scripts/loadtest/` (criar on-demand). Alvo inicial:
- 100 RPS em `/simulados` (público, cacheable).
- 20 RPS em `/attempts/{id}/answers` com p95 < 300ms.

Executar fora do horário de pico e em ambiente de staging.
