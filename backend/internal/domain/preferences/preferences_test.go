package preferences_test

import (
	"errors"
	"testing"
	"time"

	dompref "github.com/fernandofv/api/internal/domain/preferences"
	"github.com/fernandofv/api/internal/domain/shared"
)

var fixedNow = time.Date(2026, 5, 16, 12, 0, 0, 0, time.UTC)

func Test_Preferences_New_StartsEmptyAndNotOnboarded(t *testing.T) {
	p := dompref.New("user-1", fixedNow)
	if p.IsOnboarded() {
		t.Fatal("preferences recém-criadas não devem estar onboarded")
	}
	if len(p.HubIDs()) != 0 || len(p.TrailIDs()) != 0 ||
		len(p.CertificationIDs()) != 0 || len(p.Objectives()) != 0 {
		t.Fatal("listas devem nascer vazias")
	}
	if p.SkillLevel() != "" {
		t.Fatalf("skillLevel deve nascer vazio, got %q", p.SkillLevel())
	}
	if !p.DailyQuestionEnabled() {
		t.Fatal("dailyQuestionEnabled deve nascer true (default)")
	}
}

func Test_Preferences_Update_FirstSubstantiveCall_MarksOnboarded(t *testing.T) {
	p := dompref.New("user-1", fixedNow)
	hubs := []string{"hub-ia"}

	err := p.Update(dompref.UpdateCommand{HubIDs: &hubs}, fixedNow)
	if err != nil {
		t.Fatalf("update válido falhou: %v", err)
	}
	if !p.IsOnboarded() {
		t.Fatal("após preencher hub, deveria estar onboarded")
	}
	if p.OnboardedAt() == nil || !p.OnboardedAt().Equal(fixedNow) {
		t.Fatalf("onboardedAt deve ser %v, got %v", fixedNow, p.OnboardedAt())
	}
}

func Test_Preferences_Update_OnboardedAt_NeverGoesBackToNil(t *testing.T) {
	p := dompref.New("user-1", fixedNow)
	hubs := []string{"hub-ia"}
	_ = p.Update(dompref.UpdateCommand{HubIDs: &hubs}, fixedNow)

	// Limpa tudo num segundo update — onboardedAt deve PERMANECER.
	empty := []string{}
	later := fixedNow.Add(time.Hour)
	_ = p.Update(dompref.UpdateCommand{HubIDs: &empty}, later)

	if p.OnboardedAt() == nil {
		t.Fatal("onboardedAt não pode voltar a NULL após primeira marcação")
	}
	if !p.OnboardedAt().Equal(fixedNow) {
		t.Fatalf("onboardedAt deve preservar timestamp original, got %v", p.OnboardedAt())
	}
}

func Test_Preferences_Update_TogglingDailyQuestion_DoesNotMarkOnboarded(t *testing.T) {
	p := dompref.New("user-1", fixedNow)
	disabled := false
	err := p.Update(dompref.UpdateCommand{DailyQuestionEnabled: &disabled}, fixedNow)
	if err != nil {
		t.Fatalf("update falhou: %v", err)
	}
	if p.IsOnboarded() {
		t.Fatal("toggle de dailyQuestion sozinho NÃO conta como onboarding")
	}
}

func Test_Preferences_Update_DeduplicatesAndSortsIDs(t *testing.T) {
	p := dompref.New("user-1", fixedNow)
	hubs := []string{"hub-aws", "hub-ia", "hub-aws", "hub-engenharia"}
	err := p.Update(dompref.UpdateCommand{HubIDs: &hubs}, fixedNow)
	if err != nil {
		t.Fatalf("update falhou: %v", err)
	}
	got := p.HubIDs()
	expected := []string{"hub-aws", "hub-engenharia", "hub-ia"}
	if len(got) != len(expected) {
		t.Fatalf("esperado %d hubs deduplicados, got %d (%v)", len(expected), len(got), got)
	}
	for i, v := range expected {
		if got[i] != v {
			t.Fatalf("ordem alfabética esperada: %v, got %v", expected, got)
		}
	}
}

func Test_Preferences_Update_RejectsInvalidObjective(t *testing.T) {
	p := dompref.New("user-1", fixedNow)
	bad := []string{"certifications", "invasao-do-sistema"}

	err := p.Update(dompref.UpdateCommand{Objectives: &bad}, fixedNow)
	if err == nil {
		t.Fatal("objective inválido deveria falhar validação")
	}
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("esperado ErrValidation, got %v", err)
	}
}

func Test_Preferences_Update_RejectsTooLongID(t *testing.T) {
	p := dompref.New("user-1", fixedNow)
	long := []string{string(make([]byte, dompref.MaxIDLength+1))}
	for i := range long[0] {
		// preenche com 'a' para passar slug-check
		long[0] = long[0][:i] + "a" + long[0][i+1:]
	}
	err := p.Update(dompref.UpdateCommand{HubIDs: &long}, fixedNow)
	if err == nil {
		t.Fatal("id muito longo deveria falhar validação")
	}
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("esperado ErrValidation, got %v", err)
	}
}

func Test_Preferences_Update_RejectsTooManyHubs(t *testing.T) {
	p := dompref.New("user-1", fixedNow)
	tooMany := make([]string, dompref.MaxHubIDs+1)
	for i := range tooMany {
		tooMany[i] = "hub-" + string(rune('a'+i%26)) + "-" + string(rune('0'+i/26))
	}
	err := p.Update(dompref.UpdateCommand{HubIDs: &tooMany}, fixedNow)
	if err == nil {
		t.Fatal("lista acima do limite deveria falhar")
	}
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("esperado ErrValidation, got %v", err)
	}
}

func Test_Preferences_Update_RejectsInvalidSkillLevel(t *testing.T) {
	p := dompref.New("user-1", fixedNow)
	bad := dompref.SkillLevel("god-tier")
	err := p.Update(dompref.UpdateCommand{SkillLevel: &bad}, fixedNow)
	if err == nil {
		t.Fatal("skillLevel inválido deveria falhar")
	}
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("esperado ErrValidation, got %v", err)
	}
}

func Test_Preferences_Update_AcceptsValidSkillLevel(t *testing.T) {
	p := dompref.New("user-1", fixedNow)
	level := dompref.SkillIntermediate
	err := p.Update(dompref.UpdateCommand{SkillLevel: &level}, fixedNow)
	if err != nil {
		t.Fatalf("update válido falhou: %v", err)
	}
	if p.SkillLevel() != dompref.SkillIntermediate {
		t.Fatalf("esperado intermediate, got %q", p.SkillLevel())
	}
	if !p.IsOnboarded() {
		t.Fatal("setar skillLevel deveria onboardar")
	}
}

func Test_Preferences_Reconstitute_PreservesAllFields(t *testing.T) {
	onboarded := fixedNow.Add(-24 * time.Hour)
	p := dompref.Reconstitute(
		"user-1",
		[]string{"hub-aws"},
		[]string{"trail-clf"},
		[]string{"aws-clf"},
		[]string{"certifications"},
		dompref.SkillBeginner,
		false,
		&onboarded,
		fixedNow.Add(-48*time.Hour),
		fixedNow,
	)
	if !p.IsOnboarded() {
		t.Fatal("reconstitute com onboardedAt deve marcar onboarded")
	}
	if p.DailyQuestionEnabled() {
		t.Fatal("dailyQuestionEnabled deveria ser false")
	}
	if p.SkillLevel() != dompref.SkillBeginner {
		t.Fatalf("skillLevel: got %q", p.SkillLevel())
	}
}
