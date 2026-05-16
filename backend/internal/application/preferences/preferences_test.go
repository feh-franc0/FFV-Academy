package preferences_test

import (
	"context"
	"errors"
	"testing"
	"time"

	apppref "github.com/fernandofv/api/internal/application/preferences"
	dompref "github.com/fernandofv/api/internal/domain/preferences"
	"github.com/fernandofv/api/internal/domain/shared"
)

// --- Test double: mock do Repository ---

type mockRepo struct {
	byUser    map[shared.UserID]*dompref.Preferences
	upserts   int
	upsertErr error
	findErr   error // se != nil e não ErrNotFound, retornado por FindByUser
	deletes   []shared.UserID
}

func newMockRepo() *mockRepo {
	return &mockRepo{byUser: make(map[shared.UserID]*dompref.Preferences)}
}

func (m *mockRepo) FindByUser(_ context.Context, id shared.UserID) (*dompref.Preferences, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	p, ok := m.byUser[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return p, nil
}

func (m *mockRepo) Upsert(_ context.Context, p *dompref.Preferences) error {
	m.upserts++
	if m.upsertErr != nil {
		return m.upsertErr
	}
	m.byUser[p.UserID()] = p
	return nil
}

func (m *mockRepo) DeleteByUser(_ context.Context, id shared.UserID) error {
	m.deletes = append(m.deletes, id)
	delete(m.byUser, id)
	return nil
}

var fixedNow = time.Date(2026, 5, 16, 12, 0, 0, 0, time.UTC)
var clk = shared.FixedClock{T: fixedNow}

// ─── GetPreferencesUseCase ────────────────────────────────────────────────

func Test_GetPreferences_Execute_RequiresUserID(t *testing.T) {
	repo := newMockRepo()
	uc := apppref.NewGetPreferencesUseCase(repo, clk)

	_, err := uc.Execute(context.Background(), "")
	if err == nil {
		t.Fatal("esperado ErrValidation com userID vazio")
	}
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("esperado ErrValidation, got %v", err)
	}
}

func Test_GetPreferences_Execute_NotFound_ReturnsDefault_DoesNotPersist(t *testing.T) {
	repo := newMockRepo()
	uc := apppref.NewGetPreferencesUseCase(repo, clk)

	got, err := uc.Execute(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if got.IsOnboarded() {
		t.Fatal("default deve nascer não-onboarded")
	}
	if len(got.HubIDs()) != 0 {
		t.Fatalf("default deve vir com hubs vazios, got %v", got.HubIDs())
	}
	// IDEMPOTÊNCIA: GET nunca persiste.
	if repo.upserts != 0 {
		t.Fatalf("GET não deve escrever no repo, upserts=%d", repo.upserts)
	}
}

func Test_GetPreferences_Execute_Existing_ReturnsPersistedState(t *testing.T) {
	repo := newMockRepo()
	uc := apppref.NewGetPreferencesUseCase(repo, clk)

	// Setup: simula prefs já persistidas.
	stored := dompref.New("user-1", fixedNow.Add(-24*time.Hour))
	hubs := []string{"hub-ia"}
	_ = stored.Update(dompref.UpdateCommand{HubIDs: &hubs}, fixedNow.Add(-24*time.Hour))
	repo.byUser["user-1"] = stored

	got, err := uc.Execute(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if !got.IsOnboarded() {
		t.Fatal("esperado onboarded=true")
	}
	if len(got.HubIDs()) != 1 || got.HubIDs()[0] != "hub-ia" {
		t.Fatalf("hubs preservados? got %v", got.HubIDs())
	}
}

func Test_GetPreferences_Execute_RepoErr_PropagatedNotMasked(t *testing.T) {
	repo := newMockRepo()
	bad := errors.New("db connection lost")
	repo.findErr = bad
	uc := apppref.NewGetPreferencesUseCase(repo, clk)

	_, err := uc.Execute(context.Background(), "user-1")
	if err == nil {
		t.Fatal("erro do repo deve ser propagado")
	}
	if !errors.Is(err, bad) {
		t.Fatalf("erro do repo deve estar wrapeado (errors.Is), got %v", err)
	}
}

// ─── UpdatePreferencesUseCase ──────────────────────────────────────────────

func Test_UpdatePreferences_Execute_RequiresUserID(t *testing.T) {
	repo := newMockRepo()
	uc := apppref.NewUpdatePreferencesUseCase(repo, clk)

	hubs := []string{"hub-ia"}
	_, err := uc.Execute(context.Background(), apppref.UpdatePreferencesCommand{
		HubIDs: &hubs,
	})
	if err == nil {
		t.Fatal("esperado erro com userID vazio")
	}
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("esperado ErrValidation, got %v", err)
	}
}

func Test_UpdatePreferences_Execute_FirstCall_CreatesAndMarksOnboarded(t *testing.T) {
	repo := newMockRepo()
	uc := apppref.NewUpdatePreferencesUseCase(repo, clk)

	hubs := []string{"hub-ia", "hub-aws"}
	got, err := uc.Execute(context.Background(), apppref.UpdatePreferencesCommand{
		UserID: "user-1",
		HubIDs: &hubs,
	})
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if !got.IsOnboarded() {
		t.Fatal("onboarded deve ser marcado na 1ª preferência substantiva")
	}
	if repo.upserts != 1 {
		t.Fatalf("esperado 1 upsert, got %d", repo.upserts)
	}
}

func Test_UpdatePreferences_Execute_OnlyToggle_DoesNotMarkOnboarded(t *testing.T) {
	repo := newMockRepo()
	uc := apppref.NewUpdatePreferencesUseCase(repo, clk)

	disabled := false
	got, err := uc.Execute(context.Background(), apppref.UpdatePreferencesCommand{
		UserID:               "user-1",
		DailyQuestionEnabled: &disabled,
	})
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if got.IsOnboarded() {
		t.Fatal("toggle de dailyQuestion sozinho NÃO deve onboardar")
	}
}

func Test_UpdatePreferences_Execute_InvalidObjective_NotPersisted(t *testing.T) {
	repo := newMockRepo()
	uc := apppref.NewUpdatePreferencesUseCase(repo, clk)

	bad := []string{"certifications", "hack-system"}
	_, err := uc.Execute(context.Background(), apppref.UpdatePreferencesCommand{
		UserID:     "user-1",
		Objectives: &bad,
	})
	if err == nil {
		t.Fatal("esperado ErrValidation por objective inválido")
	}
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("esperado ErrValidation, got %v", err)
	}
	if repo.upserts != 0 {
		t.Fatalf("nada deve ser persistido em caso de validação falha, upserts=%d", repo.upserts)
	}
}

func Test_UpdatePreferences_Execute_SkillLevelPassedThrough(t *testing.T) {
	repo := newMockRepo()
	uc := apppref.NewUpdatePreferencesUseCase(repo, clk)

	level := "advanced"
	got, err := uc.Execute(context.Background(), apppref.UpdatePreferencesCommand{
		UserID:     "user-1",
		SkillLevel: &level,
	})
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if got.SkillLevel() != dompref.SkillAdvanced {
		t.Fatalf("esperado advanced, got %q", got.SkillLevel())
	}
}

func Test_UpdatePreferences_Execute_PreservesOnboardedOnSubsequentUpdates(t *testing.T) {
	repo := newMockRepo()
	uc := apppref.NewUpdatePreferencesUseCase(repo, clk)

	// 1ª chamada: marca onboarded
	hubs := []string{"hub-ia"}
	_, err := uc.Execute(context.Background(), apppref.UpdatePreferencesCommand{
		UserID: "user-1",
		HubIDs: &hubs,
	})
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	firstOnboarded := repo.byUser["user-1"].OnboardedAt()

	// 2ª chamada: limpa hubs — onboardedAt deve permanecer.
	empty := []string{}
	got, err := uc.Execute(context.Background(), apppref.UpdatePreferencesCommand{
		UserID: "user-1",
		HubIDs: &empty,
	})
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if got.OnboardedAt() == nil {
		t.Fatal("onboardedAt deve permanecer setado após limpar listas")
	}
	if !got.OnboardedAt().Equal(*firstOnboarded) {
		t.Fatalf("onboardedAt mudou: era %v, ficou %v", firstOnboarded, got.OnboardedAt())
	}
}

func Test_UpdatePreferences_Execute_NilFields_DontTouchExisting(t *testing.T) {
	repo := newMockRepo()
	uc := apppref.NewUpdatePreferencesUseCase(repo, clk)

	// Setup com hubs preenchidos.
	hubs := []string{"hub-ia", "hub-aws"}
	_, _ = uc.Execute(context.Background(), apppref.UpdatePreferencesCommand{
		UserID: "user-1",
		HubIDs: &hubs,
	})

	// 2ª chamada com APENAS skillLevel — hubs não devem mudar.
	level := "intermediate"
	got, err := uc.Execute(context.Background(), apppref.UpdatePreferencesCommand{
		UserID:     "user-1",
		SkillLevel: &level,
	})
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if len(got.HubIDs()) != 2 {
		t.Fatalf("hubs deveriam ser preservados, got %v", got.HubIDs())
	}
	if got.SkillLevel() != dompref.SkillIntermediate {
		t.Fatalf("skillLevel não foi aplicado, got %q", got.SkillLevel())
	}
}

func Test_UpdatePreferences_Execute_RepoUpsertErr_Propagated(t *testing.T) {
	repo := newMockRepo()
	repo.upsertErr = errors.New("disk full")
	uc := apppref.NewUpdatePreferencesUseCase(repo, clk)

	hubs := []string{"hub-ia"}
	_, err := uc.Execute(context.Background(), apppref.UpdatePreferencesCommand{
		UserID: "user-1",
		HubIDs: &hubs,
	})
	if err == nil {
		t.Fatal("erro do repo.Upsert deve ser propagado")
	}
}
