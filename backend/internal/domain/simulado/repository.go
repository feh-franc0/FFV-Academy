package simulado

import (
	"context"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// AttemptRepository é o port de persistência de Attempts.
//
// DIP: o domínio depende desta interface; a impl concreta vive em infra/postgres.
type AttemptRepository interface {
	// Save persiste uma nova Attempt.
	// Retorna ErrConflict se já existe attempt ativa para (userID, simuladoID).
	Save(ctx context.Context, attempt *Attempt) error

	// Update persiste alterações em uma Attempt existente.
	Update(ctx context.Context, attempt *Attempt) error

	// UpsertAnswer grava uma resposta ATOMICAMENTE (via jsonb_set no SQL, sem
	// o padrão find→mutate→Update que perde escrita em corrida entre duas
	// respostas concorrentes da mesma tentativa). Retorna updated=false sem
	// erro quando a tentativa não existe, já terminou ou expirou — o chamador
	// mapeia isso para o erro de domínio apropriado.
	UpsertAnswer(ctx context.Context, attemptID shared.AttemptID, questionID shared.QuestionID, optionID OptionID, now time.Time) (updated bool, err error)

	// FindByID retorna uma Attempt pelo ID. Retorna ErrNotFound se não existe.
	FindByID(ctx context.Context, id shared.AttemptID) (*Attempt, error)

	// FindActiveByUserAndSimulado retorna a attempt ativa (não finalizada) para o par.
	// Retorna ErrNotFound se não existe.
	FindActiveByUserAndSimulado(ctx context.Context, userID shared.UserID, simuladoID shared.SimuladoID) (*Attempt, error)

	// ListFinishedByUserAndSimulado retorna todas as tentativas FINALIZADAS do
	// usuário para o simulado (pode haver mais de uma — retries são
	// permitidos). Usado para checar ownership de gabarito na revisão pós-
	// prova: um questionID só pode revelar correctId se estiver em
	// QuestionIDs() de alguma dessas tentativas. Slice vazio, sem erro,
	// quando não há nenhuma.
	ListFinishedByUserAndSimulado(ctx context.Context, userID shared.UserID, simuladoID shared.SimuladoID) ([]*Attempt, error)

	// ListByUser retorna as attempts do usuário, ordenadas por startedAt DESC.
	ListByUser(ctx context.Context, userID shared.UserID, limit, offset int) ([]*Attempt, int, error)

	// ClaimXPCredit reivindica atomicamente o crédito de XP de uma tentativa
	// finalizada. Só a PRIMEIRA chamada (de qualquer aba, dispositivo ou
	// reload) recebe claimed=true — chamadas seguintes para o mesmo attemptID
	// recebem claimed=false, sem erro. Não faz parte do cálculo de XP em si
	// (que continua no cliente, no GameState) — só decide, de forma
	// server-authoritative, se ESTA chamada é a primeira.
	ClaimXPCredit(ctx context.Context, attemptID shared.AttemptID, userID shared.UserID, now time.Time) (claimed bool, err error)
}
