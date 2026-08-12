package simulado

import (
	"errors"
	"fmt"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// AGGREGATE ROOT: Attempt
//
// INVARIANTES:
//  1. Uma attempt ativa por (userID, simuladoID) — enforçada por UNIQUE INDEX na DB.
//  2. finishedAt só existe se >= startedAt.
//  3. Respostas só podem ser adicionadas antes de finishedAt e antes do deadline.
//  4. Score só existe quando finishedAt != nil.
//  5. AnswerQuestion é idempotente (sobrescreve a resposta anterior).
//  6. Timer é server-authoritative: o cliente não pode alterar o deadline.
//
// OC#8 relaxado: 9 campos — aggregate root tem mais campos que OC sugere; documentado.
type Attempt struct {
	id          shared.AttemptID
	userID      shared.UserID
	simuladoID  shared.SimuladoID
	startedAt   time.Time
	deadline    time.Time // server-authoritative
	finishedAt  *time.Time
	answers     Answers
	reviewFlags QuestionIDSet
	score       *Score
	// questionIDs é o sorteio de questões feito pelo SERVIDOR em StartAttempt —
	// fixo para a vida da tentativa. AnswerQuestion só aceita IDs deste
	// conjunto, e FinishAttempt pontua exatamente estas questões (buscadas no
	// Postgres real, não no catálogo estático). Sem isso, o sorteio acontecia
	// no cliente, que também tinha o gabarito em mãos.
	questionIDs []shared.QuestionID
}

// Erros de domínio da Attempt.
var (
	ErrAttemptAlreadyFinished = errors.New("attempt already finished")
	ErrAttemptExpired         = errors.New("attempt expired: time limit exceeded")
	ErrQuestionNotFound       = errors.New("question not found in simulado")
	ErrInvalidOptionID        = errors.New("invalid option id: must be A-E")
	ErrPaywallBlocked         = errors.New("question requires payment")
)

// Answers é uma coleção de primeira classe de respostas.
// Object Calisthenics #4: coleção envolvida em tipo próprio.
type Answers struct {
	data map[shared.QuestionID]OptionID
}

func NewAnswers() Answers {
	return Answers{data: make(map[shared.QuestionID]OptionID)}
}

func (a Answers) Set(qID shared.QuestionID, opt OptionID) Answers {
	next := Answers{data: make(map[shared.QuestionID]OptionID, len(a.data)+1)}
	for k, v := range a.data {
		next.data[k] = v
	}
	next.data[qID] = opt
	return next
}

func (a Answers) Get(qID shared.QuestionID) (OptionID, bool) {
	v, ok := a.data[qID]
	return v, ok
}

func (a Answers) Count() int { return len(a.data) }

func (a Answers) ToMap() map[shared.QuestionID]OptionID {
	cp := make(map[shared.QuestionID]OptionID, len(a.data))
	for k, v := range a.data {
		cp[k] = v
	}
	return cp
}

// QuestionIDSet é uma coleção de primeira classe de IDs de questões marcadas.
type QuestionIDSet struct {
	data map[shared.QuestionID]struct{}
}

func NewQuestionIDSet(ids ...shared.QuestionID) QuestionIDSet {
	s := QuestionIDSet{data: make(map[shared.QuestionID]struct{})}
	for _, id := range ids {
		s.data[id] = struct{}{}
	}
	return s
}

func (s QuestionIDSet) Toggle(id shared.QuestionID) QuestionIDSet {
	next := QuestionIDSet{data: make(map[shared.QuestionID]struct{}, len(s.data))}
	for k := range s.data {
		next.data[k] = struct{}{}
	}
	if _, exists := next.data[id]; exists {
		delete(next.data, id)
	} else {
		next.data[id] = struct{}{}
	}
	return next
}

func (s QuestionIDSet) Contains(id shared.QuestionID) bool {
	_, ok := s.data[id]
	return ok
}

func (s QuestionIDSet) ToSlice() []shared.QuestionID {
	result := make([]shared.QuestionID, 0, len(s.data))
	for k := range s.data {
		result = append(result, k)
	}
	return result
}

// ─────────────────────────────────────────────────────────────────
// Constructors
// ─────────────────────────────────────────────────────────────────

// StartAttempt cria uma nova Attempt para o usuário/simulado.
// questionIDs é o sorteio já feito pelo caller (server-side, contra o banco
// real) — a Attempt só guarda o resultado, não sorteia.
func StartAttempt(
	id shared.AttemptID,
	userID shared.UserID,
	simuladoID shared.SimuladoID,
	timeLimitMin int,
	questionIDs []shared.QuestionID,
	now time.Time,
) *Attempt {
	return &Attempt{
		id:          id,
		userID:      userID,
		simuladoID:  simuladoID,
		startedAt:   now,
		deadline:    now.Add(time.Duration(timeLimitMin) * time.Minute),
		answers:     NewAnswers(),
		reviewFlags: NewQuestionIDSet(),
		questionIDs: questionIDs,
	}
}

// Reconstitute reconstrói uma Attempt a partir de dados persistidos.
func ReconstituteAttempt(
	id shared.AttemptID,
	userID shared.UserID,
	simuladoID shared.SimuladoID,
	startedAt time.Time,
	deadline time.Time,
	finishedAt *time.Time,
	answers map[shared.QuestionID]OptionID,
	reviewFlags []shared.QuestionID,
	score *Score,
	questionIDs []shared.QuestionID,
) *Attempt {
	a := &Attempt{
		id:          id,
		userID:      userID,
		simuladoID:  simuladoID,
		startedAt:   startedAt,
		deadline:    deadline,
		finishedAt:  finishedAt,
		reviewFlags: NewQuestionIDSet(reviewFlags...),
		score:       score,
		questionIDs: questionIDs,
	}
	ans := NewAnswers()
	for k, v := range answers {
		ans = ans.Set(k, v)
	}
	a.answers = ans
	return a
}

// ─────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────

func (a *Attempt) ID() shared.AttemptID             { return a.id }
func (a *Attempt) UserID() shared.UserID            { return a.userID }
func (a *Attempt) SimuladoID() shared.SimuladoID    { return a.simuladoID }
func (a *Attempt) StartedAt() time.Time             { return a.startedAt }
func (a *Attempt) Deadline() time.Time              { return a.deadline }
func (a *Attempt) FinishedAt() *time.Time           { return a.finishedAt }
func (a *Attempt) Answers() Answers                 { return a.answers }
func (a *Attempt) ReviewFlags() QuestionIDSet       { return a.reviewFlags }
func (a *Attempt) Score() *Score                    { return a.score }
func (a *Attempt) QuestionIDs() []shared.QuestionID { return a.questionIDs }

// HasQuestion reporta se qID faz parte do sorteio desta tentativa.
func (a *Attempt) HasQuestion(qID shared.QuestionID) bool {
	for _, id := range a.questionIDs {
		if id == qID {
			return true
		}
	}
	return false
}

func (a *Attempt) IsFinished() bool { return a.finishedAt != nil }

// IsExpired reporta se o tempo limite foi ultrapassado.
func (a *Attempt) IsExpired(now time.Time) bool {
	if a.IsFinished() {
		return false
	}
	return now.After(a.deadline)
}

// TimeRemaining calcula o tempo restante. Retorna 0 se expirado ou finalizado.
func (a *Attempt) TimeRemaining(now time.Time) time.Duration {
	if a.IsFinished() || a.IsExpired(now) {
		return 0
	}
	return a.deadline.Sub(now)
}

// ─────────────────────────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────────────────────────

// AnswerQuestion registra ou substitui a resposta para uma questão.
//
// INVARIANTE: rejeita se attempt finalizada ou expirada.
// IDEMPOTENTE: chamar duas vezes com mesmos args tem mesmo efeito.
func (a *Attempt) AnswerQuestion(qID shared.QuestionID, opt OptionID, now time.Time) error {
	if a.IsFinished() {
		return ErrAttemptAlreadyFinished
	}
	if a.IsExpired(now) {
		return ErrAttemptExpired
	}
	if !opt.IsValid() {
		return fmt.Errorf("%w: %q", ErrInvalidOptionID, opt)
	}
	// Só aceita resposta para questão que fez parte do sorteio desta
	// tentativa — fecha a possibilidade de responder uma questão arbitrária
	// que nunca foi mostrada ao usuário.
	if len(a.questionIDs) > 0 && !a.HasQuestion(qID) {
		return fmt.Errorf("%w: %q", ErrQuestionNotFound, qID)
	}
	a.answers = a.answers.Set(qID, opt)
	return nil
}

// ToggleReviewFlag marca/desmarca uma questão para revisão.
func (a *Attempt) ToggleReviewFlag(qID shared.QuestionID, now time.Time) error {
	if a.IsFinished() {
		return ErrAttemptAlreadyFinished
	}
	if a.IsExpired(now) {
		return ErrAttemptExpired
	}
	a.reviewFlags = a.reviewFlags.Toggle(qID)
	return nil
}

// Finish finaliza a attempt e persiste o score calculado.
// Idempotente: se já finalizada, retorna o score existente.
func (a *Attempt) Finish(score Score, now time.Time) error {
	if a.IsFinished() {
		return nil // idempotente
	}
	a.finishedAt = &now
	a.score = &score
	return nil
}
