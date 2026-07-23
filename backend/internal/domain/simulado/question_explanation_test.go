package simulado_test

import (
	"encoding/json"
	"testing"

	"github.com/fernandofv/api/internal/domain/simulado"
)

// Regression: ~541 questões CLF foram seedeadas com `commonMistakes` como
// STRING em vez de []string. Isso crashava /admin/questions com 500.
// Migration 50 normaliza no banco, mas mantemos UnmarshalJSON tolerante.
func Test_QuestionExplanation_Unmarshal_CommonMistakesAsString(t *testing.T) {
	in := `{
		"summary": "s",
		"whyCorrect": "wc",
		"commonMistakes": "Confundir A com B."
	}`
	var e simulado.QuestionExplanation
	if err := json.Unmarshal([]byte(in), &e); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if len(e.CommonMistakes) != 1 || e.CommonMistakes[0] != "Confundir A com B." {
		t.Fatalf("got %v, want [\"Confundir A com B.\"]", e.CommonMistakes)
	}
}

func Test_QuestionExplanation_Unmarshal_CommonMistakesAsArray(t *testing.T) {
	in := `{"commonMistakes": ["a", "b"]}`
	var e simulado.QuestionExplanation
	if err := json.Unmarshal([]byte(in), &e); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if len(e.CommonMistakes) != 2 || e.CommonMistakes[0] != "a" || e.CommonMistakes[1] != "b" {
		t.Fatalf("got %v, want [a b]", e.CommonMistakes)
	}
}

func Test_QuestionExplanation_Unmarshal_CompareWithAsString(t *testing.T) {
	in := `{"compareWith": "X vs Y"}`
	var e simulado.QuestionExplanation
	if err := json.Unmarshal([]byte(in), &e); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if len(e.CompareWith) != 1 || e.CompareWith[0] != "X vs Y" {
		t.Fatalf("compareWith mismatch: %v", e.CompareWith)
	}
}

func Test_QuestionExplanation_Unmarshal_TutorSeedsAsString(t *testing.T) {
	in := `{"tutorSeeds": "Por que VPC?"}`
	var e simulado.QuestionExplanation
	if err := json.Unmarshal([]byte(in), &e); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if len(e.TutorSeeds) != 1 || e.TutorSeeds[0] != "Por que VPC?" {
		t.Fatalf("tutorSeeds mismatch: %v", e.TutorSeeds)
	}
}

func Test_QuestionExplanation_Unmarshal_EmptyString_OmittedAsNil(t *testing.T) {
	in := `{"commonMistakes": ""}`
	var e simulado.QuestionExplanation
	if err := json.Unmarshal([]byte(in), &e); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if e.CommonMistakes != nil {
		t.Fatalf("expected nil for empty string, got %v", e.CommonMistakes)
	}
}

func Test_QuestionExplanation_Unmarshal_Null_OmittedAsNil(t *testing.T) {
	in := `{"commonMistakes": null}`
	var e simulado.QuestionExplanation
	if err := json.Unmarshal([]byte(in), &e); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if e.CommonMistakes != nil {
		t.Fatalf("expected nil for null, got %v", e.CommonMistakes)
	}
}

func Test_QuestionExplanation_Unmarshal_Absent_OmittedAsNil(t *testing.T) {
	in := `{"summary":"s"}`
	var e simulado.QuestionExplanation
	if err := json.Unmarshal([]byte(in), &e); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if e.CommonMistakes != nil || e.CompareWith != nil || e.TutorSeeds != nil {
		t.Fatalf("expected all nil when absent")
	}
	if e.Summary != "s" {
		t.Fatalf("summary lost: %q", e.Summary)
	}
}

// Roundtrip: marshal volta com array, mesmo quando o input foi string.
// Travamos a normalização — se o repo deserializar + serializar, a saída
// é sempre array.
func Test_QuestionExplanation_Roundtrip_NormalizesStringToArray(t *testing.T) {
	in := `{"commonMistakes": "single value"}`
	var e simulado.QuestionExplanation
	if err := json.Unmarshal([]byte(in), &e); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	out, err := json.Marshal(e)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	var roundtrip map[string]any
	_ = json.Unmarshal(out, &roundtrip)
	cm, ok := roundtrip["commonMistakes"].([]any)
	if !ok || len(cm) != 1 || cm[0] != "single value" {
		t.Fatalf("roundtrip não normalizou pra array: %s", out)
	}
}
