// Package handlers — DTOs de resposta HTTP.
//
// PADRÃO: DTOs desacoplam o domínio do contrato HTTP.
// Nunca expor aggregates diretamente na resposta.
package handlers

import (
	"net"
	"net/http"
	"strings"
	"time"

	domcert "github.com/fernandofv/api/internal/domain/certificate"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
)

// clientIPFromRequest extrai o IP do cliente considerando proxies.
// Duplica a lógica do middleware.clientIP (não exportado) para uso em handlers.
func clientIPFromRequest(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	if xr := r.Header.Get("X-Real-IP"); xr != "" {
		return xr
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
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
}

// ScoreDTO é a representação pública do score.
type ScoreDTO struct {
	Value      int                    `json:"value"`
	Correct    int                    `json:"correct"`
	Total      int                    `json:"total"`
	Passed     bool                   `json:"passed"`
	ByTopic    map[string]TopicDTO    `json:"byTopic"`
}

// TopicDTO agrupa acertos e total por tópico.
type TopicDTO struct {
	Correct int `json:"correct"`
	Total   int `json:"total"`
}

func attemptToDTO(a *domsim.Attempt) AttemptDTO {
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

	return dto
}

// CertificateDTO é a representação pública de um certificado.
type CertificateDTO struct {
	Hash        string `json:"hash"`
	UserID      string `json:"userId"`
	SimuladoID  string `json:"simuladoId"`
	AttemptID   string `json:"attemptId"`
	HolderName  string `json:"holderName"`
	IssuedAt    string `json:"issuedAt"`
	VerifyURL   string `json:"verifyUrl"`
}

func certificateToDTO(c *domcert.Certificate, baseURL string) CertificateDTO {
	return CertificateDTO{
		Hash:       c.Hash().String(),
		UserID:     c.UserID().String(),
		SimuladoID: c.SimuladoID().String(),
		AttemptID:  c.AttemptID().String(),
		HolderName: c.HolderName(),
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

// hasProduct verifica se o usuário possui um produto específico.
func hasProduct(u *domidentity.User, productID shared.ProductID) bool {
	return u.HasProduct(productID)
}
