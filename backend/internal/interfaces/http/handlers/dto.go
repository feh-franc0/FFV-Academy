// Package handlers — DTOs de resposta HTTP.
//
// PADRÃO: DTOs desacoplam o domínio do contrato HTTP.
// Nunca expor aggregates diretamente na resposta.
package handlers

import (
	"net/http"
	"time"

	domcert "github.com/fernandofv/api/internal/domain/certificate"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// clientIPFromRequest extrai o IP do cliente considerando proxies — delega a
// middleware.ClientIP para não ter duas implementações que podem divergir (a
// duplicação anterior confiava em X-Forwarded-For sem checar proxy confiável).
func clientIPFromRequest(r *http.Request) string {
	return middleware.ClientIP(r)
}

// UserDTO é a representação pública do usuário.
type UserDTO struct {
	ID               string   `json:"id"`
	Email            string   `json:"email"`
	Phone            string   `json:"phone"`
	Name             string   `json:"name"`
	Role             string   `json:"role"`
	ReferralID       string   `json:"referralId"`
	Products         []string `json:"products"`
	MarketingConsent bool     `json:"marketingConsent"`
	CreatedAt        string   `json:"createdAt"`
}

func userToDTO(u *domidentity.User) UserDTO {
	products := make([]string, 0, len(u.PaidProducts()))
	for _, p := range u.PaidProducts() {
		products = append(products, string(p))
	}
	return UserDTO{
		ID:               u.ID().String(),
		Email:            u.Email().String(),
		Phone:            u.Phone().String(),
		Name:             u.Name(),
		Role:             string(u.Role()),
		ReferralID:       u.ReferralID().String(),
		Products:         products,
		MarketingConsent: u.MarketingConsent(),
		CreatedAt:        u.CreatedAt().UTC().Format(time.RFC3339),
	}
}

// AttemptDTO é a representação pública de uma tentativa de simulado.
type AttemptDTO struct {
	ID          string            `json:"id"`
	SimuladoID  string            `json:"simuladoId"`
	Status      string            `json:"status"`
	Answers     map[string]string `json:"answers"`
	Flagged     []string          `json:"flagged"`
	Score       *ScoreDTO         `json:"score,omitempty"`
	StartedAt   string            `json:"startedAt"`
	DeadlineAt  string            `json:"deadlineAt"`
	FinishedAt  *string           `json:"finishedAt,omitempty"`
	TimeLeftSec int64             `json:"timeLeftSec"`
	Questions   []ExamQuestionDTO `json:"questions,omitempty"`
}

// ExamQuestionDTO é a questão como o cliente vê DURANTE a prova — sem
// correctId e sem explanation. O gabarito só é revelado depois do finish
// (ver Requirement "O gabarito não é entregue durante a prova" no pack
// prova-integra-e-anti-fraude). Deliberadamente um tipo PRÓPRIO, não um
// subconjunto de campos de DBQuestionDTO: assim um campo novo adicionado a
// DBQuestionDTO no futuro (ex: mais um dado de explicação) não vaza para cá
// por acidente — quem quiser expor algo aqui tem de fazer isso explicitamente.
type ExamQuestionDTO struct {
	ID         string              `json:"id"`
	Stem       string              `json:"stem"`
	Options    []QuestionOptionDTO `json:"options"`
	Topic      string              `json:"topic"`
	Difficulty string              `json:"difficulty"`
}

func dbQuestionToExamDTO(q *domsim.DBQuestion) ExamQuestionDTO {
	opts := make([]QuestionOptionDTO, len(q.Options))
	for i, o := range q.Options {
		opts[i] = QuestionOptionDTO{ID: string(o.ID), Text: o.Text}
	}
	return ExamQuestionDTO{
		ID:         q.ID,
		Stem:       q.Stem,
		Options:    opts,
		Topic:      string(q.Topic),
		Difficulty: string(q.Difficulty),
	}
}

// ScoreDTO é a representação pública do score.
type ScoreDTO struct {
	Value   int                 `json:"value"`
	Correct int                 `json:"correct"`
	Total   int                 `json:"total"`
	Passed  bool                `json:"passed"`
	ByTopic map[string]TopicDTO `json:"byTopic"`
}

// TopicDTO agrupa acertos e total por tópico.
type TopicDTO struct {
	Correct int `json:"correct"`
	Total   int `json:"total"`
}

// attemptToDTO converte o aggregate em DTO. `questions` é opcional (nil
// omite o campo) — usado para carregar as questões sorteadas (sem gabarito)
// junto da resposta de Start/Resume, poupando uma segunda chamada do cliente.
func attemptToDTO(a *domsim.Attempt, questions []*domsim.DBQuestion) AttemptDTO {
	answers := make(map[string]string, a.Answers().Count())
	for qID, optID := range a.Answers().ToMap() {
		answers[string(qID)] = string(optID)
	}

	flagged := make([]string, 0)
	for _, qID := range a.ReviewFlags().ToSlice() {
		flagged = append(flagged, string(qID))
	}

	status := "active"
	if a.IsFinished() {
		status = "finished"
	}

	now := time.Now()
	dto := AttemptDTO{
		ID:          a.ID().String(),
		SimuladoID:  a.SimuladoID().String(),
		Status:      status,
		Answers:     answers,
		Flagged:     flagged,
		StartedAt:   a.StartedAt().UTC().Format(time.RFC3339),
		DeadlineAt:  a.Deadline().UTC().Format(time.RFC3339),
		TimeLeftSec: max(0, int64(a.TimeRemaining(now).Seconds())),
	}

	if a.IsFinished() && a.FinishedAt() != nil {
		t := a.FinishedAt().UTC().Format(time.RFC3339)
		dto.FinishedAt = &t
	}

	if s := a.Score(); s != nil {
		byTopic := make(map[string]TopicDTO)
		for topic, counts := range s.ByTopic() {
			byTopic[string(topic)] = TopicDTO{Correct: counts.Correct, Total: counts.Total}
		}
		dto.Score = &ScoreDTO{
			Value:   s.Value(),
			Correct: s.CorrectCount(),
			Total:   s.TotalQuestions(),
			Passed:  s.Passed(),
			ByTopic: byTopic,
		}
	}

	if len(questions) > 0 {
		dto.Questions = make([]ExamQuestionDTO, len(questions))
		for i, q := range questions {
			dto.Questions[i] = dbQuestionToExamDTO(q)
		}
	}

	return dto
}

// CertificateDTO é a representação pública de um certificado.
//
// `Score` foi acrescentado em ago/2026. O agregado sempre teve `Score()`, mas o
// DTO não o expunha — e a tela `/verificar` é a que mais precisa dele: quem abre
// aquela página é um terceiro conferindo o documento de outra pessoa, e "válido"
// sem pontuação não diz se a pessoa passou. O cliente contornava lendo o score
// do `localStorage`, o que só funciona no dispositivo que emitiu o certificado —
// exatamente o caso que a verificação por terceiro não é.
//
// Pontuação de aprovação não é dado sensível: ela já está impressa no próprio
// certificado que o titular compartilha. O que continua fora do DTO é o que não
// pertence a um verificador — e `UserID` está aqui porque a rota autenticada de
// listagem usa o mesmo tipo.
type CertificateDTO struct {
	Hash       string `json:"hash"`
	UserID     string `json:"userId"`
	SimuladoID string `json:"simuladoId"`
	AttemptID  string `json:"attemptId"`
	HolderName string `json:"holderName"`
	Score      int    `json:"score"`
	IssuedAt   string `json:"issuedAt"`
	VerifyURL  string `json:"verifyUrl"`
}

func certificateToDTO(c *domcert.Certificate, baseURL string) CertificateDTO {
	return CertificateDTO{
		Hash:       c.Hash().String(),
		UserID:     c.UserID().String(),
		SimuladoID: c.SimuladoID().String(),
		AttemptID:  c.AttemptID().String(),
		HolderName: c.HolderName(),
		Score:      c.Score(),
		IssuedAt:   c.IssuedAt().UTC().Format(time.RFC3339),
		VerifyURL:  baseURL + "/certificates/" + c.Hash().String(),
	}
}

// SimuladoDTO é a representação pública de um simulado do catálogo.
type SimuladoDTO struct {
	ID            string   `json:"id"`
	Certification string   `json:"certification"`
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	PriceCents    int64    `json:"priceCents"`
	QuestionCount int      `json:"questionCount"`
	TimeLimitMin  int      `json:"timeLimitMin"`
	Topics        []string `json:"topics"`
	PassingScore  int      `json:"passingScore"`
	ComingSoon    bool     `json:"comingSoon"`
}

func simuladoToDTO(s *domsim.Simulado) SimuladoDTO {
	topics := make([]string, len(s.Topics))
	for i, t := range s.Topics {
		topics[i] = string(t)
	}
	return SimuladoDTO{
		ID:            s.ID.String(),
		Certification: s.Certification,
		Title:         s.Title,
		Description:   s.Description,
		PriceCents:    s.PriceCents,
		QuestionCount: s.QuestionCount,
		TimeLimitMin:  s.TimeLimitMin,
		Topics:        topics,
		PassingScore:  s.PassingScore,
		ComingSoon:    s.ComingSoon,
	}
}

// LeaderboardEntryDTO é a representação de uma entrada no ranking.
type LeaderboardEntryDTO struct {
	Rank     int64  `json:"rank"`
	UserID   string `json:"userId"`
	UserName string `json:"userName"`
	Score    int    `json:"score"`
}

func max(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}

// --- DBQuestion DTOs ---

// QuestionOptionDTO é a representação pública de uma opção de resposta.
type QuestionOptionDTO struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}

// QuestionExplanationDTO é a representação pública da explicação rica.
type QuestionExplanationDTO struct {
	Summary          string            `json:"summary"`
	WhyCorrect       string            `json:"whyCorrect"`
	WhyWrong         map[string]string `json:"whyWrong,omitempty"`
	KeyConcept       string            `json:"keyConcept,omitempty"`
	CompareWith      []string          `json:"compareWith,omitempty"`
	RealWorldContext string            `json:"realWorldContext,omitempty"`
	CommonMistakes   []string          `json:"commonMistakes,omitempty"`
	TutorSeeds       []string          `json:"tutorSeeds,omitempty"`
}

// DBQuestionDTO é a representação pública de uma questão persistida.
type DBQuestionDTO struct {
	ID           string                 `json:"id"`
	SimuladoID   string                 `json:"simuladoId"`
	Stem         string                 `json:"stem"`
	Options      []QuestionOptionDTO    `json:"options"`
	CorrectID    string                 `json:"correctId"`
	Explanation  QuestionExplanationDTO `json:"explanation"`
	Topic        string                 `json:"topic"`
	Domain       string                 `json:"domain"`
	Difficulty   string                 `json:"difficulty"`
	ScenarioType string                 `json:"scenarioType,omitempty"`
	Tags         []string               `json:"tags"`
	Source       string                 `json:"source,omitempty"`
	Status       string                 `json:"status"`
}

func dbQuestionToDTO(q *domsim.DBQuestion) DBQuestionDTO {
	opts := make([]QuestionOptionDTO, len(q.Options))
	for i, o := range q.Options {
		opts[i] = QuestionOptionDTO{ID: string(o.ID), Text: o.Text}
	}

	tags := q.Tags
	if tags == nil {
		tags = []string{}
	}

	return DBQuestionDTO{
		ID:         q.ID,
		SimuladoID: q.SimuladoID,
		Stem:       q.Stem,
		Options:    opts,
		CorrectID:  string(q.CorrectID),
		Explanation: QuestionExplanationDTO{
			Summary:          q.Explanation.Summary,
			WhyCorrect:       q.Explanation.WhyCorrect,
			WhyWrong:         q.Explanation.WhyWrong,
			KeyConcept:       q.Explanation.KeyConcept,
			CompareWith:      q.Explanation.CompareWith,
			RealWorldContext: q.Explanation.RealWorldContext,
			CommonMistakes:   q.Explanation.CommonMistakes,
			TutorSeeds:       q.Explanation.TutorSeeds,
		},
		Topic:        string(q.Topic),
		Domain:       q.Domain,
		Difficulty:   string(q.Difficulty),
		ScenarioType: q.ScenarioType,
		Tags:         tags,
		Source:       q.Source,
		Status:       q.Status,
	}
}
