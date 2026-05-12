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
		60, now,
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
		return domsim.StartAttempt(shared.AttemptID(id), "u-race", "sim-y", 60, now)
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
	a := domsim.StartAttempt("att-fin", "u-fin", "sim-z", 60, now)
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
