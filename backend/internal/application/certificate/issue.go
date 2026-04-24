// Package certificate contém os use cases de emissão e verificação de certificados.
package certificate

import (
	"context"
	"errors"
	"fmt"

	domcert "github.com/fernandofv/api/internal/domain/certificate"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
)

// IssueCertificateCommand é o command de emissão de certificado.
type IssueCertificateCommand struct {
	UserID    shared.UserID
	AttemptID shared.AttemptID
	Name      string // nome do portador
}

// IssueCertificateUseCase emite um certificado para uma tentativa aprovada.
//
// PRÉ-CONDIÇÕES:
//   - Attempt existe e pertence ao UserID.
//   - Attempt está finalizada (finishedAt != nil).
//   - Attempt passou (score >= passingScore).
//
// IDEMPOTENTE: emitir duas vezes para o mesmo attemptID retorna o mesmo certificado.
type IssueCertificateUseCase struct {
	certRepo    domcert.Repository
	attemptRepo domsim.AttemptRepository
	clock       shared.Clock
}

func NewIssueCertificateUseCase(
	certRepo domcert.Repository,
	attemptRepo domsim.AttemptRepository,
	clock shared.Clock,
) *IssueCertificateUseCase {
	return &IssueCertificateUseCase{certRepo: certRepo, attemptRepo: attemptRepo, clock: clock}
}

func (uc *IssueCertificateUseCase) Execute(ctx context.Context, cmd IssueCertificateCommand) (*domcert.Certificate, error) {
	attempt, err := uc.attemptRepo.FindByID(ctx, cmd.AttemptID)
	if err != nil {
		return nil, fmt.Errorf("issue certificate: find attempt: %w", err)
	}

	if attempt.UserID() != cmd.UserID {
		return nil, fmt.Errorf("issue certificate: %w", shared.ErrForbidden)
	}
	if !attempt.IsFinished() {
		return nil, fmt.Errorf("%w: tentativa ainda não foi finalizada", shared.ErrValidation)
	}

	score := attempt.Score()
	if score == nil || !score.Passed() {
		return nil, fmt.Errorf("%w: score insuficiente para emitir certificado", shared.ErrValidation)
	}

	// Idempotência: se já existe certificado para esta attempt, retorna o existente.
	exists, err := uc.certRepo.ExistsByAttempt(ctx, cmd.AttemptID)
	if err != nil {
		return nil, fmt.Errorf("issue certificate: check existing: %w", err)
	}
	if exists {
		// Busca o certificado existente pelo hash determinístico.
		hash := computeHashForLookup(cmd.UserID, attempt.SimuladoID(), cmd.AttemptID)
		return uc.certRepo.FindByHash(ctx, hash)
	}

	now := uc.clock.Now()
	cert, err := domcert.Issue(
		cmd.UserID,
		attempt.SimuladoID(),
		cmd.AttemptID,
		cmd.Name,
		score.Value(),
		now,
	)
	if err != nil {
		return nil, fmt.Errorf("issue certificate: %w", err)
	}

	if err := uc.certRepo.Save(ctx, cert); err != nil {
		if errors.Is(err, shared.ErrConflict) {
			// Race condition: outro request criou antes. Busca o existente.
			return uc.certRepo.FindByHash(ctx, cert.Hash())
		}
		return nil, fmt.Errorf("issue certificate: save: %w", err)
	}

	return cert, nil
}

// computeHashForLookup recria o hash para lookup idempotente.
// Usa a mesma lógica do domain para consistência.
func computeHashForLookup(userID shared.UserID, simID shared.SimuladoID, attemptID shared.AttemptID) shared.CertificateHash {
	import_note := "Delegate to domain — evitar duplicar lógica de hash"
	_ = import_note
	// Cria um certificado temporário só para extrair o hash.
	cert, _ := domcert.Issue(userID, simID, attemptID, "", 0, shared.FixedClock{}.Now())
	if cert != nil {
		return cert.Hash()
	}
	return ""
}

// VerifyCertificateUseCase verifica um certificado pelo hash (endpoint público).
type VerifyCertificateUseCase struct {
	certRepo domcert.Repository
}

func NewVerifyCertificateUseCase(certRepo domcert.Repository) *VerifyCertificateUseCase {
	return &VerifyCertificateUseCase{certRepo: certRepo}
}

func (uc *VerifyCertificateUseCase) Execute(ctx context.Context, hash shared.CertificateHash) (*domcert.Certificate, error) {
	cert, err := uc.certRepo.FindByHash(ctx, hash)
	if err != nil {
		return nil, fmt.Errorf("verify certificate: %w", err)
	}
	return cert, nil
}

// ListUserCertificatesUseCase lista os certificados do usuário.
type ListUserCertificatesUseCase struct {
	certRepo domcert.Repository
}

func NewListUserCertificatesUseCase(certRepo domcert.Repository) *ListUserCertificatesUseCase {
	return &ListUserCertificatesUseCase{certRepo: certRepo}
}

func (uc *ListUserCertificatesUseCase) Execute(ctx context.Context, userID shared.UserID) ([]*domcert.Certificate, error) {
	certs, err := uc.certRepo.ListByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("list certificates: %w", err)
	}
	return certs, nil
}
