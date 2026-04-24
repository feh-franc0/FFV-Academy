package identity

import (
	"context"
	"fmt"
	"time"

	domaudit "github.com/fernandofv/api/internal/domain/audit"
	domcert "github.com/fernandofv/api/internal/domain/certificate"
	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// ─────────────────────────────────────────────────────────────────
// Ports adicionais (read-only) — satisfeitos pelos repos existentes
// ─────────────────────────────────────────────────────────────────

// AttemptLister é um sub-conjunto mínimo da AttemptRepository usado apenas
// para listagens read-only (export + stats).
type AttemptLister interface {
	ListByUser(ctx context.Context, userID shared.UserID, limit, offset int) ([]*domsim.Attempt, int, error)
}

// CertLister é um sub-conjunto mínimo para listar certificados do usuário.
type CertLister interface {
	ListByUser(ctx context.Context, userID shared.UserID) ([]*domcert.Certificate, error)
}

// ProgressSnapshotLoader carrega o snapshot bruto do usuário.
// Retorna (nil, nil) se não houver snapshot (distinto de erro).
type ProgressSnapshotLoader interface {
	LoadSnapshot(ctx context.Context, userID shared.UserID) (*ExportedProgress, error)
}

// PurchaseLister expõe as compras finalizadas do usuário (opcional — repos
// podem retornar lista vazia para MVP).
type PurchaseLister interface {
	ListByUser(ctx context.Context, userID shared.UserID) ([]ExportedPurchase, error)
}

// ─────────────────────────────────────────────────────────────────
// Structs de exportação — serializáveis em JSON
// ─────────────────────────────────────────────────────────────────

// ExportedProgress é a representação simplificada de um snapshot de progresso.
type ExportedProgress struct {
	SchemaVersion   int       `json:"schemaVersion"`
	State           []byte    `json:"state"`
	ClientUpdatedAt time.Time `json:"clientUpdatedAt"`
	ServerUpdatedAt time.Time `json:"serverUpdatedAt"`
}

// ExportedPurchase é um registro mínimo de compra para exportação.
type ExportedPurchase struct {
	ID          string    `json:"id"`
	ProductID   string    `json:"productId"`
	AmountCents int64     `json:"amountCents"`
	Currency    string    `json:"currency"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	PaidAt      *time.Time `json:"paidAt,omitempty"`
}

// ExportedProfile é o recorte público do User para exportação LGPD.
type ExportedProfile struct {
	ID               string    `json:"id"`
	Email            string    `json:"email"`
	Name             string    `json:"name"`
	Phone            string    `json:"phone"`
	Role             string    `json:"role"`
	ReferralID       string    `json:"referralId"`
	Products         []string  `json:"products"`
	MarketingConsent bool      `json:"marketingConsent"`
	CreatedAt        time.Time `json:"createdAt"`
}

// ExportedAttempt é o metadata (sem respostas detalhadas) de uma attempt.
type ExportedAttempt struct {
	ID          string     `json:"id"`
	SimuladoID  string     `json:"simuladoId"`
	StartedAt   time.Time  `json:"startedAt"`
	DeadlineAt  time.Time  `json:"deadlineAt"`
	FinishedAt  *time.Time `json:"finishedAt,omitempty"`
	ScoreValue  *int       `json:"scoreValue,omitempty"`
	Passed      *bool      `json:"passed,omitempty"`
	AnswerCount int        `json:"answerCount"`
}

// ExportedCertificate é a representação do certificado para exportação.
type ExportedCertificate struct {
	Hash       string    `json:"hash"`
	SimuladoID string    `json:"simuladoId"`
	AttemptID  string    `json:"attemptId"`
	HolderName string    `json:"holderName"`
	Score      int       `json:"score"`
	IssuedAt   time.Time `json:"issuedAt"`
}

// ExportUserDataResult é o payload completo do /me/export.
type ExportUserDataResult struct {
	Profile      ExportedProfile       `json:"profile"`
	Certificates []ExportedCertificate `json:"certificates"`
	Attempts     []ExportedAttempt     `json:"attempts"`
	Progress     *ExportedProgress     `json:"progress,omitempty"`
	Purchases    []ExportedPurchase    `json:"purchases"`
	GeneratedAt  time.Time             `json:"generatedAt"`
}

// ─────────────────────────────────────────────────────────────────
// Use Case
// ─────────────────────────────────────────────────────────────────

// ExportUserDataUseCase compõe um snapshot JSON-serializável com todos
// os dados pessoais do usuário (LGPD — direito de portabilidade).
type ExportUserDataUseCase struct {
	userRepo     identity.UserRepository
	attemptRepo  AttemptLister
	certRepo     CertLister
	progressRepo ProgressSnapshotLoader
	purchaseRepo PurchaseLister
	audit        domaudit.Service
	clock        shared.Clock
}

func NewExportUserDataUseCase(
	userRepo identity.UserRepository,
	attemptRepo AttemptLister,
	certRepo CertLister,
	progressRepo ProgressSnapshotLoader,
	purchaseRepo PurchaseLister,
	audit domaudit.Service,
	clock shared.Clock,
) *ExportUserDataUseCase {
	if audit == nil {
		audit = domaudit.NoopService{}
	}
	return &ExportUserDataUseCase{
		userRepo:     userRepo,
		attemptRepo:  attemptRepo,
		certRepo:     certRepo,
		progressRepo: progressRepo,
		purchaseRepo: purchaseRepo,
		audit:        audit,
		clock:        clock,
	}
}

// ExportUserDataCommand é o comando de exportação.
type ExportUserDataCommand struct {
	UserID    shared.UserID
	IP        string
	UserAgent string
	RequestID string
}

func (uc *ExportUserDataUseCase) Execute(ctx context.Context, cmd ExportUserDataCommand) (ExportUserDataResult, error) {
	user, err := uc.userRepo.FindByID(ctx, cmd.UserID)
	if err != nil {
		return ExportUserDataResult{}, fmt.Errorf("export: user: %w", err)
	}

	// Attempts (metadata).
	var attempts []ExportedAttempt
	if uc.attemptRepo != nil {
		list, _, err := uc.attemptRepo.ListByUser(ctx, cmd.UserID, 1000, 0)
		if err != nil {
			return ExportUserDataResult{}, fmt.Errorf("export: attempts: %w", err)
		}
		attempts = make([]ExportedAttempt, 0, len(list))
		for _, a := range list {
			ea := ExportedAttempt{
				ID:          a.ID().String(),
				SimuladoID:  a.SimuladoID().String(),
				StartedAt:   a.StartedAt(),
				DeadlineAt:  a.Deadline(),
				FinishedAt:  a.FinishedAt(),
				AnswerCount: a.Answers().Count(),
			}
			if s := a.Score(); s != nil {
				v := s.Value()
				p := s.Passed()
				ea.ScoreValue = &v
				ea.Passed = &p
			}
			attempts = append(attempts, ea)
		}
	}

	// Certificados.
	var certs []ExportedCertificate
	if uc.certRepo != nil {
		list, err := uc.certRepo.ListByUser(ctx, cmd.UserID)
		if err != nil {
			return ExportUserDataResult{}, fmt.Errorf("export: certs: %w", err)
		}
		certs = make([]ExportedCertificate, 0, len(list))
		for _, c := range list {
			certs = append(certs, ExportedCertificate{
				Hash:       c.Hash().String(),
				SimuladoID: c.SimuladoID().String(),
				AttemptID:  c.AttemptID().String(),
				HolderName: c.HolderName(),
				Score:      c.Score(),
				IssuedAt:   c.IssuedAt(),
			})
		}
	}

	// Progress snapshot (opcional).
	var progress *ExportedProgress
	if uc.progressRepo != nil {
		p, err := uc.progressRepo.LoadSnapshot(ctx, cmd.UserID)
		if err != nil {
			return ExportUserDataResult{}, fmt.Errorf("export: progress: %w", err)
		}
		progress = p
	}

	// Purchases (opcional).
	var purchases []ExportedPurchase
	if uc.purchaseRepo != nil {
		p, err := uc.purchaseRepo.ListByUser(ctx, cmd.UserID)
		if err != nil {
			return ExportUserDataResult{}, fmt.Errorf("export: purchases: %w", err)
		}
		purchases = p
	}
	if purchases == nil {
		purchases = []ExportedPurchase{}
	}

	now := uc.clock.Now()
	result := ExportUserDataResult{
		Profile: ExportedProfile{
			ID:               user.ID().String(),
			Email:            user.Email().String(),
			Name:             user.Name(),
			Phone:            user.Phone().String(),
			Role:             string(user.Role()),
			ReferralID:       user.ReferralID().String(),
			Products:         productIDsToStrings(user.PaidProducts()),
			MarketingConsent: user.MarketingConsent(),
			CreatedAt:        user.CreatedAt(),
		},
		Certificates: certs,
		Attempts:     attempts,
		Progress:     progress,
		Purchases:    purchases,
		GeneratedAt:  now,
	}

	_ = uc.audit.AuditLog(ctx, domaudit.Entry{
		ActorID:    cmd.UserID.String(),
		ActorType:  domaudit.ActorUser,
		Action:     "account.export",
		TargetType: "user",
		TargetID:   cmd.UserID.String(),
		IP:         cmd.IP,
		UserAgent:  cmd.UserAgent,
		RequestID:  cmd.RequestID,
		OccurredAt: now,
	})

	return result, nil
}

func productIDsToStrings(ids []shared.ProductID) []string {
	out := make([]string, len(ids))
	for i, id := range ids {
		out[i] = id.String()
	}
	return out
}
