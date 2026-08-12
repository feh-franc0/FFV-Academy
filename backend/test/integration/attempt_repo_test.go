//go:build integration

package integration

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/infrastructure/persistence/postgres"
)

func Test_AttemptRepo_SaveAndFindByID_PreservesAnswers(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	if _, err := pool.Exec(ctx,
		`INSERT INTO users (id, email, phone, name, referral_id, role) VALUES ($1,$2,'','T',$3,'user')`,
		"u-att-1", "att1@x.com", "ref-att-1",
	); err != nil {
		t.Fatalf("seed user: %v", err)
	}

	repo := postgres.NewAttemptRepo(pool)
	now := time.Now().UTC().Truncate(time.Millisecond)
	a := domsim.StartAttempt(
		shared.AttemptID("att-1"),
		shared.UserID("u-att-1"),
		shared.SimuladoID("sim-x"),
		60, []shared.QuestionID{"q1", "q2"}, now,
	)
	if err := a.AnswerQuestion(shared.QuestionID("q1"), domsim.OptionA, now); err != nil {
		t.Fatalf("answer: %v", err)
	}
	if err := a.ToggleReviewFlag(shared.QuestionID("q2"), now); err != nil {
		t.Fatalf("toggle: %v", err)
	}

	if err := repo.Save(ctx, a); err != nil {
		t.Fatalf("save: %v", err)
	}

	got, err := repo.FindByID(ctx, a.ID())
	if err != nil {
		t.Fatalf("find: %v", err)
	}
	if got.Answers().Count() != 1 {
		t.Errorf("expected 1 answer, got %d", got.Answers().Count())
	}
	if v, ok := got.Answers().Get("q1"); !ok || v != domsim.OptionA {
		t.Errorf("answer q1 expected A, got %v (ok=%v)", v, ok)
	}
	if !got.ReviewFlags().Contains("q2") {
		t.Errorf("expected review flag q2")
	}
}

func Test_AttemptRepo_Save_RaceCondition_ReturnsConflict(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	if _, err := pool.Exec(ctx,
		`INSERT INTO users (id, email, phone, name, referral_id, role) VALUES ('u-race','r@x.com','','T','ref-race','user')`,
	); err != nil {
		t.Fatalf("seed: %v", err)
	}

	repo := postgres.NewAttemptRepo(pool)
	now := time.Now().UTC()
	newAttempt := func(id string) *domsim.Attempt {
		return domsim.StartAttempt(shared.AttemptID(id), "u-race", "sim-y", 60, []shared.QuestionID{"q1"}, now)
	}

	var wg sync.WaitGroup
	results := make([]error, 2)
	for i, id := range []string{"race-a", "race-b"} {
		wg.Add(1)
		go func(i int, id string) {
			defer wg.Done()
			results[i] = repo.Save(ctx, newAttempt(id))
		}(i, id)
	}
	wg.Wait()

	var successes, conflicts int
	for _, err := range results {
		switch {
		case err == nil:
			successes++
		case errors.Is(err, shared.ErrConflict):
			conflicts++
		default:
			t.Errorf("unexpected error: %v", err)
		}
	}
	if successes != 1 || conflicts != 1 {
		t.Errorf("expected 1 success + 1 conflict, got %d/%d", successes, conflicts)
	}
}

func Test_AttemptRepo_Update_FinalizesAttempt(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	if _, err := pool.Exec(ctx,
		`INSERT INTO users (id, email, phone, name, referral_id, role) VALUES ('u-fin','f@x.com','','T','ref-fin','user')`,
	); err != nil {
		t.Fatalf("seed: %v", err)
	}

	repo := postgres.NewAttemptRepo(pool)
	now := time.Now().UTC()
	a := domsim.StartAttempt("att-fin", "u-fin", "sim-z", 60, []shared.QuestionID{"q1"}, now)
	if err := repo.Save(ctx, a); err != nil {
		t.Fatalf("save: %v", err)
	}

	score := domsim.NewScore(domsim.ScoreResult{
		Value: 85, Passed: true,
		CorrectCount: 17, TotalQuestions: 20,
		ByTopic: map[domsim.Topic]domsim.TopicCounts{},
	})
	if err := a.Finish(score, now.Add(5*time.Minute)); err != nil {
		t.Fatalf("finish: %v", err)
	}
	if err := repo.Update(ctx, a); err != nil {
		t.Fatalf("update: %v", err)
	}

	got, err := repo.FindByID(ctx, a.ID())
	if err != nil {
		t.Fatalf("find: %v", err)
	}
	if !got.IsFinished() {
		t.Error("expected attempt finished")
	}
	if got.Score() == nil || !got.Score().Passed() {
		t.Error("expected passed score")
	}
	if got.Score().Value() != 85 {
		t.Errorf("expected score=85, got %d", got.Score().Value())
	}
}

// question_ids é o sorteio server-side (StartAttempt) — precisa sobreviver ao
// round-trip Save → FindByID intacto, na mesma ordem.
func Test_AttemptRepo_Save_PreservesQuestionIDs(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	if _, err := pool.Exec(ctx,
		`INSERT INTO users (id, email, phone, name, referral_id, role) VALUES ('u-qids','q@x.com','','T','ref-qids','user')`,
	); err != nil {
		t.Fatalf("seed: %v", err)
	}

	repo := postgres.NewAttemptRepo(pool)
	now := time.Now().UTC()
	drawn := []shared.QuestionID{"q10", "q20", "q30"}
	a := domsim.StartAttempt("att-qids", "u-qids", "sim-qids", 60, drawn, now)
	if err := repo.Save(ctx, a); err != nil {
		t.Fatalf("save: %v", err)
	}

	got, err := repo.FindByID(ctx, a.ID())
	if err != nil {
		t.Fatalf("find: %v", err)
	}
	if len(got.QuestionIDs()) != 3 {
		t.Fatalf("expected 3 question ids, got %d", len(got.QuestionIDs()))
	}
	for i, id := range drawn {
		if got.QuestionIDs()[i] != id {
			t.Errorf("question id[%d]: expected %s, got %s", i, id, got.QuestionIDs()[i])
		}
	}
}

// Prova direta do fix de ago/2026: a 2ª tentativa do MESMO simulado, depois
// de a 1ª ser finalizada, tem de funcionar. Antes, `status` nunca era escrito
// e a UNIQUE(user_id, simulado_id, status) bloqueava a 2ª tentativa
// permanentemente (toda linha ficava com status='active' para sempre).
func Test_AttemptRepo_SecondAttempt_AfterFirstFinished_Succeeds(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	if _, err := pool.Exec(ctx,
		`INSERT INTO users (id, email, phone, name, referral_id, role) VALUES ('u-retry','retry@x.com','','T','ref-retry','user')`,
	); err != nil {
		t.Fatalf("seed: %v", err)
	}

	repo := postgres.NewAttemptRepo(pool)
	now := time.Now().UTC()

	first := domsim.StartAttempt("att-retry-1", "u-retry", "sim-retry", 60, []shared.QuestionID{"q1"}, now)
	if err := repo.Save(ctx, first); err != nil {
		t.Fatalf("save first: %v", err)
	}
	score := domsim.NewScore(domsim.ScoreResult{Value: 50, Passed: false, ByTopic: map[domsim.Topic]domsim.TopicCounts{}})
	if err := first.Finish(score, now.Add(10*time.Minute)); err != nil {
		t.Fatalf("finish first: %v", err)
	}
	if err := repo.Update(ctx, first); err != nil {
		t.Fatalf("update first: %v", err)
	}

	// A 2ª tentativa do MESMO usuário+simulado precisa ser aceita — é
	// exatamente o caso que a UNIQUE antiga (por status, nunca atualizado)
	// bloqueava.
	second := domsim.StartAttempt("att-retry-2", "u-retry", "sim-retry", 60, []shared.QuestionID{"q1"}, now.Add(20*time.Minute))
	if err := repo.Save(ctx, second); err != nil {
		t.Fatalf("expected second attempt to save successfully after first finished, got: %v", err)
	}

	active, err := repo.FindActiveByUserAndSimulado(ctx, "u-retry", "sim-retry")
	if err != nil {
		t.Fatalf("expected active attempt (the second one) to be found: %v", err)
	}
	if active.ID() != second.ID() {
		t.Errorf("expected active attempt to be the second one, got %s", active.ID())
	}
}

// Duas respostas concorrentes de questões DIFERENTES na mesma tentativa não
// podem se perder uma à outra — prova do fix do lost update (UpsertAnswer).
func Test_AttemptRepo_UpsertAnswer_ConcurrentDifferentQuestions_BothPersist(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	if _, err := pool.Exec(ctx,
		`INSERT INTO users (id, email, phone, name, referral_id, role) VALUES ('u-race2','race2@x.com','','T','ref-race2','user')`,
	); err != nil {
		t.Fatalf("seed: %v", err)
	}

	repo := postgres.NewAttemptRepo(pool)
	now := time.Now().UTC()
	a := domsim.StartAttempt("att-race2", "u-race2", "sim-race2", 60, []shared.QuestionID{"q1", "q2"}, now)
	if err := repo.Save(ctx, a); err != nil {
		t.Fatalf("save: %v", err)
	}

	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		if _, err := repo.UpsertAnswer(ctx, a.ID(), "q1", domsim.OptionA, now); err != nil {
			t.Errorf("upsert q1: %v", err)
		}
	}()
	go func() {
		defer wg.Done()
		if _, err := repo.UpsertAnswer(ctx, a.ID(), "q2", domsim.OptionB, now); err != nil {
			t.Errorf("upsert q2: %v", err)
		}
	}()
	wg.Wait()

	got, err := repo.FindByID(ctx, a.ID())
	if err != nil {
		t.Fatalf("find: %v", err)
	}
	if got.Answers().Count() != 2 {
		t.Fatalf("expected both concurrent answers persisted, got %d", got.Answers().Count())
	}
}

// UpsertAnswer não escreve se a tentativa já está finalizada — a cláusula
// WHERE finished_at IS NULL protege mesmo sob corrida com um Finish.
func Test_AttemptRepo_UpsertAnswer_OnFinishedAttempt_DoesNotUpdate(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	if _, err := pool.Exec(ctx,
		`INSERT INTO users (id, email, phone, name, referral_id, role) VALUES ('u-fin2','fin2@x.com','','T','ref-fin2','user')`,
	); err != nil {
		t.Fatalf("seed: %v", err)
	}

	repo := postgres.NewAttemptRepo(pool)
	now := time.Now().UTC()
	a := domsim.StartAttempt("att-fin2", "u-fin2", "sim-fin2", 60, []shared.QuestionID{"q1"}, now)
	if err := repo.Save(ctx, a); err != nil {
		t.Fatalf("save: %v", err)
	}
	score := domsim.NewScore(domsim.ScoreResult{ByTopic: map[domsim.Topic]domsim.TopicCounts{}})
	if err := a.Finish(score, now); err != nil {
		t.Fatalf("finish: %v", err)
	}
	if err := repo.Update(ctx, a); err != nil {
		t.Fatalf("update: %v", err)
	}

	updated, err := repo.UpsertAnswer(ctx, a.ID(), "q1", domsim.OptionA, now)
	if err != nil {
		t.Fatalf("upsert: %v", err)
	}
	if updated {
		t.Error("expected updated=false for a finished attempt")
	}
}

// Test_AttemptRepo_ClaimXPCredit_ConcurrentClaims_OnlyOneSucceeds é a prova
// de integração do requisito "Crédito de XP... idempotente no servidor": duas
// reivindicações concorrentes para o MESMO attemptId (ex.: duas abas abrindo
// /resultado ao mesmo tempo) só podem resultar em UM claimed=true — a query
// atômica (`UPDATE ... WHERE xp_credited_at IS NULL`) é quem garante isso,
// não um lock em memória do processo Go.
func Test_AttemptRepo_ClaimXPCredit_ConcurrentClaims_OnlyOneSucceeds(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	if _, err := pool.Exec(ctx,
		`INSERT INTO users (id, email, phone, name, referral_id, role) VALUES ('u-xp1','xp1@x.com','','T','ref-xp1','user')`,
	); err != nil {
		t.Fatalf("seed: %v", err)
	}

	repo := postgres.NewAttemptRepo(pool)
	now := time.Now().UTC()
	a := domsim.StartAttempt("att-xp1", "u-xp1", "sim-xp1", 60, []shared.QuestionID{"q1"}, now)
	if err := repo.Save(ctx, a); err != nil {
		t.Fatalf("save: %v", err)
	}
	score := domsim.NewScore(domsim.ScoreResult{ByTopic: map[domsim.Topic]domsim.TopicCounts{}})
	if err := a.Finish(score, now); err != nil {
		t.Fatalf("finish: %v", err)
	}
	if err := repo.Update(ctx, a); err != nil {
		t.Fatalf("update: %v", err)
	}

	results := make([]bool, 2)
	var wg sync.WaitGroup
	wg.Add(2)
	for i := 0; i < 2; i++ {
		go func(idx int) {
			defer wg.Done()
			claimed, err := repo.ClaimXPCredit(ctx, a.ID(), a.UserID(), now)
			if err != nil {
				t.Errorf("claim: %v", err)
			}
			results[idx] = claimed
		}(i)
	}
	wg.Wait()

	claimedCount := 0
	for _, c := range results {
		if c {
			claimedCount++
		}
	}
	if claimedCount != 1 {
		t.Fatalf("esperava exatamente 1 claim bem-sucedido entre 2 chamadas concorrentes, teve %d", claimedCount)
	}
}

// Test_AttemptRepo_ClaimXPCredit_WrongUser_ReturnsFalse cobre ownership: o
// mesmo attemptId não pode ser reivindicado por outro usuário — a query filtra
// por user_id, então mesmo sabendo o attemptId real de outra pessoa a
// reivindicação simplesmente não afeta nenhuma linha.
func Test_AttemptRepo_ClaimXPCredit_WrongUser_ReturnsFalse(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	if _, err := pool.Exec(ctx,
		`INSERT INTO users (id, email, phone, name, referral_id, role) VALUES ('u-xp2','xp2@x.com','','T','ref-xp2','user')`,
	); err != nil {
		t.Fatalf("seed: %v", err)
	}

	repo := postgres.NewAttemptRepo(pool)
	now := time.Now().UTC()
	a := domsim.StartAttempt("att-xp2", "u-xp2", "sim-xp2", 60, []shared.QuestionID{"q1"}, now)
	if err := repo.Save(ctx, a); err != nil {
		t.Fatalf("save: %v", err)
	}
	score := domsim.NewScore(domsim.ScoreResult{ByTopic: map[domsim.Topic]domsim.TopicCounts{}})
	if err := a.Finish(score, now); err != nil {
		t.Fatalf("finish: %v", err)
	}
	if err := repo.Update(ctx, a); err != nil {
		t.Fatalf("update: %v", err)
	}

	claimed, err := repo.ClaimXPCredit(ctx, a.ID(), shared.UserID("u-outro-usuario"), now)
	if err != nil {
		t.Fatalf("claim: %v", err)
	}
	if claimed {
		t.Fatal("esperava claimed=false para user_id que não é o dono da tentativa")
	}
}

// Test_AttemptRepo_ClaimXPCredit_UnfinishedAttempt_ReturnsFalse: XP só pode
// ser reivindicado para tentativa finalizada — a query exige finished_at
// IS NOT NULL.
func Test_AttemptRepo_ClaimXPCredit_UnfinishedAttempt_ReturnsFalse(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	if _, err := pool.Exec(ctx,
		`INSERT INTO users (id, email, phone, name, referral_id, role) VALUES ('u-xp3','xp3@x.com','','T','ref-xp3','user')`,
	); err != nil {
		t.Fatalf("seed: %v", err)
	}

	repo := postgres.NewAttemptRepo(pool)
	now := time.Now().UTC()
	a := domsim.StartAttempt("att-xp3", "u-xp3", "sim-xp3", 60, []shared.QuestionID{"q1"}, now)
	if err := repo.Save(ctx, a); err != nil {
		t.Fatalf("save: %v", err)
	}

	claimed, err := repo.ClaimXPCredit(ctx, a.ID(), a.UserID(), now)
	if err != nil {
		t.Fatalf("claim: %v", err)
	}
	if claimed {
		t.Fatal("esperava claimed=false para tentativa não finalizada")
	}
}
