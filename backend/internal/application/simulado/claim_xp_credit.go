package simulado

import (
	"context"
	"fmt"

	"github.com/fernandofv/api/internal/domain/shared"
	domsimulado "github.com/fernandofv/api/internal/domain/simulado"
)

// ClaimXPCreditCommand reivindica o crédito de XP de uma tentativa finalizada.
type ClaimXPCreditCommand struct {
	UserID    shared.UserID
	AttemptID shared.AttemptID
}

// ClaimXPCreditResult indica se ESTA chamada foi a primeira a reivindicar.
type ClaimXPCreditResult struct {
	Claimed bool
}

// ClaimXPCreditUseCase é o requisito "Crédito de XP... idempotente" do pack
// prova-integra-e-anti-fraude: reabrir a tela de resultado em outra aba (ou
// recarregar) não pode conceder XP duas vezes. O cálculo do XP em si continua
// no GameState do cliente — este use case só decide, de forma
// server-authoritative (não em sessionStorage), SE o cliente pode conceder.
//
// Não há Find prévio: a query atômica do repositório já cobre ownership
// (user_id = cmd.UserID) e "está finalizada" (finished_at IS NOT NULL) na
// MESMA operação que reivindica — checar antes abriria uma janela de corrida
// entre duas abas chamando ao mesmo tempo.
type ClaimXPCreditUseCase struct {
	attemptRepo domsimulado.AttemptRepository
	clock       shared.Clock
}

func NewClaimXPCreditUseCase(repo domsimulado.AttemptRepository, clock shared.Clock) *ClaimXPCreditUseCase {
	return &ClaimXPCreditUseCase{attemptRepo: repo, clock: clock}
}

func (uc *ClaimXPCreditUseCase) Execute(ctx context.Context, cmd ClaimXPCreditCommand) (ClaimXPCreditResult, error) {
	claimed, err := uc.attemptRepo.ClaimXPCredit(ctx, cmd.AttemptID, cmd.UserID, uc.clock.Now())
	if err != nil {
		return ClaimXPCreditResult{}, fmt.Errorf("claim xp credit: %w", err)
	}
	return ClaimXPCreditResult{Claimed: claimed}, nil
}
