package simulado

import (
	"context"
	"fmt"

	"github.com/fernandofv/api/internal/domain/shared"
	domsimulado "github.com/fernandofv/api/internal/domain/simulado"
)

// FinishAttemptCommand finaliza uma tentativa de simulado.
type FinishAttemptCommand struct {
	UserID    shared.UserID
	AttemptID shared.AttemptID
}

// FinishAttemptResult contém o resultado após finalização.
type FinishAttemptResult struct {
	Attempt     *domsimulado.Attempt
	ScoreResult domsimulado.ScoreResult
	WeakTopics  []domsimulado.Topic
}

// FinishAttemptUseCase finaliza e calcula o score server-side.
//
// IDEMPOTENTE: se já finalizada, retorna o resultado existente.
// SEGURANÇA: score calculado contra as questões REAIS que foram sorteadas
// para esta tentativa (attempt.QuestionIDs(), buscadas no Postgres) — não
// mais o catálogo estático embutido no binário, que ficou desatualizado em
// relação ao banco real assim que os bancos de questão passaram a viver no
// Postgres (CLF/DVA/AIF/SAA). O cliente não pode mentir o score nem escolher
// contra qual gabarito ele é medido.
type FinishAttemptUseCase struct {
	attemptRepo  domsimulado.AttemptRepository
	catalog      domsimulado.CatalogProvider
	questionRepo domsimulado.QuestionRepository
	scorer       domsimulado.Scorer
	clock        shared.Clock
}

func NewFinishAttemptUseCase(
	repo domsimulado.AttemptRepository,
	catalog domsimulado.CatalogProvider,
	questionRepo domsimulado.QuestionRepository,
	clock shared.Clock,
) *FinishAttemptUseCase {
	return &FinishAttemptUseCase{
		attemptRepo:  repo,
		catalog:      catalog,
		questionRepo: questionRepo,
		scorer:       domsimulado.Scorer{},
		clock:        clock,
	}
}

func (uc *FinishAttemptUseCase) Execute(ctx context.Context, cmd FinishAttemptCommand) (FinishAttemptResult, error) {
	attempt, err := uc.attemptRepo.FindByID(ctx, cmd.AttemptID)
	if err != nil {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: find: %w", err)
	}

	if attempt.UserID() != cmd.UserID {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: %w", shared.ErrForbidden)
	}

	sim, err := uc.catalog.GetSimulado(attempt.SimuladoID())
	if err != nil {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: get simulado: %w", err)
	}

	examSim, err := uc.buildExamSimulado(ctx, attempt, sim.PassingScore)
	if err != nil {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: build exam: %w", err)
	}

	// Calcula score server-side, contra as questões reais desta tentativa.
	scoreResult := uc.scorer.Calculate(examSim, attempt.Answers())

	// Se já finalizada, retorna resultado existente (idempotência).
	// Usa NewScore(scoreResult) — Score{} é zero-value e WeakTopics retornaria
	// sempre vazio, perdendo a informação para o cliente em retries.
	if attempt.IsFinished() {
		return FinishAttemptResult{
			Attempt:     attempt,
			ScoreResult: scoreResult,
			WeakTopics:  domsimulado.NewScore(scoreResult).WeakTopics(0.7),
		}, nil
	}

	score := domsimulado.NewScore(scoreResult)
	now := uc.clock.Now()
	if err := attempt.Finish(score, now); err != nil {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: %w", err)
	}

	if err := uc.attemptRepo.Update(ctx, attempt); err != nil {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: save: %w", err)
	}

	weakTopics := score.WeakTopics(0.7)

	return FinishAttemptResult{
		Attempt:     attempt,
		ScoreResult: scoreResult,
		WeakTopics:  weakTopics,
	}, nil
}

// buildExamSimulado monta um *Simulado transiente cujas Questions vêm do
// Postgres real (attempt.QuestionIDs(), via QuestionRepository.FindByIDs) —
// não do catálogo estático embutido. Usado por FinishAttempt e por
// ResumeAttempt (no auto-finish por expiração) para que os dois pontuem
// exatamente as mesmas questões que o usuário de fato recebeu.
func buildExamSimulado(
	ctx context.Context,
	questionRepo domsimulado.QuestionRepository,
	attempt *domsimulado.Attempt,
	passingScore int,
) (*domsimulado.Simulado, error) {
	ids := make([]string, len(attempt.QuestionIDs()))
	for i, id := range attempt.QuestionIDs() {
		ids[i] = string(id)
	}

	dbQuestions, err := questionRepo.FindByIDs(ctx, attempt.SimuladoID().String(), ids)
	if err != nil {
		return nil, fmt.Errorf("find by ids: %w", err)
	}

	questions := make([]domsimulado.Question, len(dbQuestions))
	for i, q := range dbQuestions {
		questions[i] = domsimulado.Question{
			ID:         shared.QuestionID(q.ID),
			Stem:       q.Stem,
			Options:    q.Options,
			CorrectID:  q.CorrectID,
			Topic:      q.Topic,
			Difficulty: q.Difficulty,
		}
	}

	return &domsimulado.Simulado{
		ID:            attempt.SimuladoID(),
		Questions:     questions,
		QuestionCount: len(questions),
		PassingScore:  passingScore,
	}, nil
}

func (uc *FinishAttemptUseCase) buildExamSimulado(ctx context.Context, attempt *domsimulado.Attempt, passingScore int) (*domsimulado.Simulado, error) {
	return buildExamSimulado(ctx, uc.questionRepo, attempt, passingScore)
}

// ResumeAttemptUseCase retorna o estado atual de uma attempt ativa.
type ResumeAttemptUseCase struct {
	attemptRepo  domsimulado.AttemptRepository
	catalog      domsimulado.CatalogProvider
	questionRepo domsimulado.QuestionRepository
	clock        shared.Clock
}

func NewResumeAttemptUseCase(
	repo domsimulado.AttemptRepository,
	catalog domsimulado.CatalogProvider,
	questionRepo domsimulado.QuestionRepository,
	clock shared.Clock,
) *ResumeAttemptUseCase {
	return &ResumeAttemptUseCase{attemptRepo: repo, catalog: catalog, questionRepo: questionRepo, clock: clock}
}

type ResumeAttemptResult struct {
	Attempt  *domsimulado.Attempt
	Simulado *domsimulado.Simulado
}

func (uc *ResumeAttemptUseCase) Execute(ctx context.Context, userID shared.UserID, simuladoID shared.SimuladoID) (ResumeAttemptResult, error) {
	attempt, err := uc.attemptRepo.FindActiveByUserAndSimulado(ctx, userID, simuladoID)
	if err != nil {
		return ResumeAttemptResult{}, fmt.Errorf("resume attempt: %w", err)
	}

	sim, err := uc.catalog.GetSimulado(simuladoID)
	if err != nil {
		return ResumeAttemptResult{}, fmt.Errorf("resume attempt: get simulado: %w", err)
	}

	// Verifica se expirou — se sim, finaliza automaticamente.
	now := uc.clock.Now()
	if attempt.IsExpired(now) {
		examSim, buildErr := buildExamSimulado(ctx, uc.questionRepo, attempt, sim.PassingScore)
		if buildErr != nil {
			return ResumeAttemptResult{}, fmt.Errorf("resume attempt: build exam: %w", buildErr)
		}
		scoreResult := domsimulado.Scorer{}.Calculate(examSim, attempt.Answers())
		score := domsimulado.NewScore(scoreResult)
		_ = attempt.Finish(score, now)
		_ = uc.attemptRepo.Update(ctx, attempt)
	}

	return ResumeAttemptResult{Attempt: attempt, Simulado: sim}, nil
}

// ListAttemptsUseCase lista as tentativas do usuário.
type ListAttemptsUseCase struct {
	attemptRepo domsimulado.AttemptRepository
}

func NewListAttemptsUseCase(repo domsimulado.AttemptRepository) *ListAttemptsUseCase {
	return &ListAttemptsUseCase{attemptRepo: repo}
}

type ListAttemptsResult struct {
	Attempts []*domsimulado.Attempt
	Total    int
}

func (uc *ListAttemptsUseCase) Execute(ctx context.Context, userID shared.UserID, limit, offset int) (ListAttemptsResult, error) {
	attempts, total, err := uc.attemptRepo.ListByUser(ctx, userID, limit, offset)
	if err != nil {
		return ListAttemptsResult{}, fmt.Errorf("list attempts: %w", err)
	}
	return ListAttemptsResult{Attempts: attempts, Total: total}, nil
}
