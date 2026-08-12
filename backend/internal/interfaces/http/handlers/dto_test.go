package handlers

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// Prova estrutural (não só comportamental) de que o gabarito não pode vazar
// no payload servido durante a prova: ExamQuestionDTO não declara CorrectID
// nem Explanation — não é um campo "esquecido vazio", é um campo que o tipo
// nem tem. Serializa e confere que a string "correctId"/"explanation" não
// aparece em lugar nenhum do JSON, como cinto-e-suspensório contra uma
// regressão que reintroduza o campo sem querer.
func Test_DBQuestionToExamDTO_NeverLeaksAnswerKey(t *testing.T) {
	q := &domsim.DBQuestion{
		ID:   "q1",
		Stem: "Qual serviço...",
		Options: []domsim.QuestionOption{
			{ID: "A", Text: "S3"},
			{ID: "B", Text: "EBS"},
		},
		CorrectID: "B",
		Explanation: domsim.QuestionExplanation{
			Summary:    "segredo",
			WhyCorrect: "segredo",
		},
		Topic:      "Storage",
		Difficulty: "medium",
	}

	dto := dbQuestionToExamDTO(q)
	b, err := json.Marshal(dto)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	body := string(b)

	if strings.Contains(strings.ToLower(body), "correctid") {
		t.Fatalf("gabarito vazou no payload de prova: %s", body)
	}
	if strings.Contains(strings.ToLower(body), "explanation") || strings.Contains(body, "segredo") {
		t.Fatalf("explicação vazou no payload de prova: %s", body)
	}
	if !strings.Contains(body, "Qual serviço") {
		t.Fatalf("stem ausente do payload de prova: %s", body)
	}
}

// AttemptDTO.Questions só é preenchido quando `questions` é não-vazio — o
// caller controla isso (loadAttemptQuestions retorna nil para attempts
// finalizadas), então o campo omite (`omitempty`) em vez de aparecer como [].
func Test_AttemptToDTO_QuestionsOmittedWhenNil(t *testing.T) {
	a := domsim.StartAttempt("att-1", "u-1", "sim-1", 60, []shared.QuestionID{"q1"}, time.Now())
	dto := attemptToDTO(a, nil)
	b, err := json.Marshal(dto)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	if strings.Contains(string(b), `"questions"`) {
		t.Fatalf("esperado 'questions' omitido quando nil, got: %s", string(b))
	}
}
