// Command seed-clf-questions: lê arquivos JSON do question-bank e faz upsert no banco.
//
// Uso:
//
//	DATABASE_URL=postgres://... ./seed-clf-questions [path-to-question-bank]
//
// O path padrão é ../../frontend/data/question-bank (relativo ao binário).
// Processa apenas arquivos clf-c02-*.json, pulando *.v1-backup.json.
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// --- JSON input structs ---

type questionFileJSON struct {
	Certification string         `json:"certification"`
	Questions     []questionJSON `json:"questions"`
}

type questionJSON struct {
	ID           string          `json:"id"`
	Stem         string          `json:"stem"`
	Options      []optionJSON    `json:"options"`
	CorrectID    string          `json:"correctId"`
	Explanation  explanationJSON `json:"explanation"`
	Topic        string          `json:"topic"`
	Domain       string          `json:"domain"`
	Difficulty   string          `json:"difficulty"`
	ScenarioType string          `json:"scenarioType"`
	Tags         []string        `json:"tags"`
	Source       string          `json:"source"`
}

type optionJSON struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}

type explanationJSON struct {
	Summary          string            `json:"summary"`
	WhyCorrect       string            `json:"whyCorrect"`
	WhyWrong         map[string]string `json:"whyWrong,omitempty"`
	KeyConcept       string            `json:"keyConcept,omitempty"`
	CompareWith      []string          `json:"compareWith,omitempty"`
	RealWorldContext string            `json:"realWorldContext,omitempty"`
	CommonMistakes   []string          `json:"commonMistakes,omitempty"`
	TutorSeeds       []string          `json:"tutorSeeds,omitempty"`
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL é obrigatório")
	}

	bankPath := "../../frontend/data/question-bank"
	if len(os.Args) > 1 {
		bankPath = os.Args[1]
	}

	if info, err := os.Stat(bankPath); err != nil || !info.IsDir() { //nolint:gosec // G703: path vem do operador via CLI args, não de input externo
		log.Fatalf("diretório não encontrado: %s", bankPath) //nolint:gosec // G706: log de path controlado pelo operador
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("ping: %v", err)
	}

	entries, err := os.ReadDir(bankPath)
	if err != nil {
		log.Fatalf("read dir: %v", err)
	}

	var clfFiles []string
	for _, e := range entries {
		name := e.Name()
		if e.IsDir() {
			continue
		}
		if !strings.HasSuffix(name, ".json") {
			continue
		}
		if strings.HasSuffix(name, ".v1-backup.json") {
			continue
		}
		if !strings.HasPrefix(name, "clf-c02-") {
			continue
		}
		clfFiles = append(clfFiles, filepath.Join(bankPath, name))
	}

	if len(clfFiles) == 0 {
		log.Fatal("nenhum arquivo clf-c02-*.json encontrado")
	}

	fmt.Printf("Encontrados %d arquivos CLF\n", len(clfFiles))

	start := time.Now()
	var totalUpserted int

	for _, path := range clfFiles {
		count, err := processFile(ctx, pool, path)
		if err != nil {
			log.Printf("ERRO %s: %v", filepath.Base(path), err) //nolint:gosec // G706: filename é do question-bank do repositório
			continue
		}
		fmt.Printf("  %s: %d questoes\n", filepath.Base(path), count)
		totalUpserted += count
	}

	elapsed := time.Since(start)
	fmt.Printf("\n=================================================\n")
	fmt.Printf("  Seed CLF concluido\n")
	fmt.Printf("=================================================\n")
	fmt.Printf("Tempo:     %s\n", elapsed.Round(time.Millisecond))
	fmt.Printf("Questoes:  %d\n", totalUpserted)
}

func processFile(ctx context.Context, pool *pgxpool.Pool, path string) (int, error) {
	raw, err := os.ReadFile(path) //nolint:gosec // G304,G703: path vem do operador via CLI args
	if err != nil {
		return 0, fmt.Errorf("read file: %w", err)
	}

	var file questionFileJSON
	if err := json.Unmarshal(raw, &file); err != nil {
		return 0, fmt.Errorf("parse json: %w", err)
	}

	if len(file.Questions) == 0 {
		return 0, nil
	}

	const simuladoID = "aws-clf"

	count := 0
	for _, q := range file.Questions {
		if err := upsertQuestion(ctx, pool, simuladoID, q); err != nil {
			return count, fmt.Errorf("upsert %s: %w", q.ID, err)
		}
		count++
	}
	return count, nil
}

func upsertQuestion(ctx context.Context, pool *pgxpool.Pool, simuladoID string, q questionJSON) error {
	optionsJSON, err := json.Marshal(q.Options)
	if err != nil {
		return fmt.Errorf("marshal options: %w", err)
	}

	explJSON, err := json.Marshal(q.Explanation)
	if err != nil {
		return fmt.Errorf("marshal explanation: %w", err)
	}

	tags := q.Tags
	if tags == nil {
		tags = []string{}
	}
	tagsJSON, err := json.Marshal(tags)
	if err != nil {
		return fmt.Errorf("marshal tags: %w", err)
	}

	difficulty := q.Difficulty
	if difficulty == "" {
		difficulty = "medium"
	}

	var scenarioType *string
	if q.ScenarioType != "" {
		scenarioType = &q.ScenarioType
	}

	var source *string
	if q.Source != "" {
		source = &q.Source
	}

	const query = `
		INSERT INTO questions
			(id, simulado_id, stem, options, correct_id, explanation, topic, domain,
			 difficulty, scenario_type, tags, source, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active', now(), now())
		ON CONFLICT (id) DO UPDATE SET
			simulado_id   = EXCLUDED.simulado_id,
			stem          = EXCLUDED.stem,
			options       = EXCLUDED.options,
			correct_id    = EXCLUDED.correct_id,
			explanation   = EXCLUDED.explanation,
			topic         = EXCLUDED.topic,
			domain        = EXCLUDED.domain,
			difficulty    = EXCLUDED.difficulty,
			scenario_type = EXCLUDED.scenario_type,
			tags          = EXCLUDED.tags,
			source        = EXCLUDED.source,
			updated_at    = now()
	`

	_, err = pool.Exec(ctx, query,
		q.ID, simuladoID, q.Stem, optionsJSON, q.CorrectID, explJSON,
		q.Topic, q.Domain, difficulty, scenarioType, tagsJSON, source,
	)
	return err
}
