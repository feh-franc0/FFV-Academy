// Comando importer: carrega seeds JSON (gerados pelo parser TSX) e popula o banco.
//
// Lê scripts/seeds/articles/*.json, para cada arquivo:
//   1. UPSERT em curriculum_articles
//   2. DELETE blocks antigos do slug
//   3. INSERT blocks novos em transação
//
// Idempotente: pode rodar quantas vezes quiser.
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Block struct {
	ID       string                 `json:"id"`
	Type     string                 `json:"type"`
	Position int                    `json:"position"`
	Data     map[string]interface{} `json:"data"`
	Children []Block                `json:"children,omitempty"`
}

type SeedFile struct {
	Slug   string  `json:"slug"`
	Title  *string `json:"title"`
	Blocks []Block `json:"blocks"`
}

type Stats struct {
	Articles  int
	Blocks    int
	Failed    int
	Skipped   int
	StartTime time.Time
}

func main() {
	seedsDir := flag.String("seeds", "", "diretório com *.json")
	singleSlug := flag.String("slug", "", "importa só este slug")
	dryRun := flag.Bool("dry-run", false, "não escreve no banco")
	verbose := flag.Bool("verbose", false, "log de cada arquivo")
	flag.Parse()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL é obrigatório")
	}

	if *seedsDir == "" {
		cwd, _ := os.Getwd()
		base := cwd
		for i := 0; i < 5; i++ {
			candidate := filepath.Join(base, "scripts", "seeds", "articles")
			if info, err := os.Stat(candidate); err == nil && info.IsDir() {
				*seedsDir = candidate
				break
			}
			base = filepath.Dir(base)
		}
		if *seedsDir == "" {
			log.Fatal("não encontrou scripts/seeds/articles — passe --seeds=<path>")
		}
	}

	files, err := os.ReadDir(*seedsDir)
	if err != nil {
		log.Fatalf("read seeds dir: %v", err)
	}

	var jsonFiles []string
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".json") && !strings.HasPrefix(f.Name(), "_") {
			slug := strings.TrimSuffix(f.Name(), ".json")
			if *singleSlug != "" && slug != *singleSlug {
				continue
			}
			jsonFiles = append(jsonFiles, f.Name())
		}
	}
	sort.Strings(jsonFiles)

	if len(jsonFiles) == 0 {
		log.Fatal("nenhum JSON encontrado")
	}

	fmt.Printf("Encontrados %d JSONs em %s\n", len(jsonFiles), *seedsDir)
	if *dryRun {
		fmt.Println("MODO DRY-RUN — nada será escrito")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	seedsRoot := filepath.Dir(*seedsDir)

	if !*dryRun {
		if err := ensureBaseRefs(ctx, pool); err != nil {
			log.Fatalf("ensure base refs: %v", err)
		}
		// FASE 1: sincroniza hubs + trails (FKs prontas antes do import)
		if err := seedHubsAndTrails(ctx, pool, seedsRoot); err != nil {
			log.Printf("WARN: seed hubs/trails: %v", err)
		}
	}

	stats := Stats{StartTime: time.Now()}

	for i, name := range jsonFiles {
		path := filepath.Join(*seedsDir, name)
		slug := strings.TrimSuffix(name, ".json")

		raw, err := os.ReadFile(path)
		if err != nil {
			log.Printf("[%d/%d] %s: read error: %v", i+1, len(jsonFiles), slug, err)
			stats.Failed++
			continue
		}
		var seed SeedFile
		if err := json.Unmarshal(raw, &seed); err != nil {
			log.Printf("[%d/%d] %s: parse error: %v", i+1, len(jsonFiles), slug, err)
			stats.Failed++
			continue
		}
		if seed.Slug == "" {
			seed.Slug = slug
		}

		if len(seed.Blocks) == 0 {
			if *verbose {
				log.Printf("[%d/%d] %s: 0 blocks — skip", i+1, len(jsonFiles), slug)
			}
			stats.Skipped++
			continue
		}

		if *dryRun {
			stats.Articles++
			stats.Blocks += countBlocks(seed.Blocks)
			continue
		}

		title := slug
		if seed.Title != nil && *seed.Title != "" {
			title = *seed.Title
		}

		blockCount, err := importOne(ctx, pool, seed.Slug, title, seed.Blocks)
		if err != nil {
			log.Printf("[%d/%d] %s: FAIL: %v", i+1, len(jsonFiles), slug, err)
			stats.Failed++
			continue
		}

		stats.Articles++
		stats.Blocks += blockCount

		if *verbose || (i+1)%50 == 0 {
			fmt.Printf("[%d/%d] %s: %d blocks ✓\n", i+1, len(jsonFiles), slug, blockCount)
		}
	}

	// FASE 2: depois do import, atualiza articles com title/hub/trail/xp reais
	// extraídos do curriculum.ts (article-mappings.json).
	if !*dryRun {
		fmt.Println()
		if err := seedArticleMappings(ctx, pool, seedsRoot); err != nil {
			log.Printf("WARN: seed article mappings: %v", err)
		}
	}

	elapsed := time.Since(stats.StartTime)
	fmt.Printf("\n═══════════════════════════════════════════════\n")
	fmt.Printf("  Import — sumário\n")
	fmt.Printf("═══════════════════════════════════════════════\n")
	fmt.Printf("Tempo total:       %s\n", elapsed.Round(time.Millisecond))
	fmt.Printf("Artigos:           %d\n", stats.Articles)
	fmt.Printf("Blocks:            %d\n", stats.Blocks)
	fmt.Printf("Pulados (vazios):  %d\n", stats.Skipped)
	fmt.Printf("Falhas:            %d\n", stats.Failed)
}

func ensureBaseRefs(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		INSERT INTO hubs (id, name, short_name, description, icon, color, position)
		VALUES ('legacy', 'Legacy (auto-import)', 'Legacy', 'Hub temporário para módulos importados via parser TSX', '📦', '#666666', 99)
		ON CONFLICT (id) DO NOTHING;
	`)
	if err != nil {
		return fmt.Errorf("ensure hub legacy: %w", err)
	}
	_, err = pool.Exec(ctx, `
		INSERT INTO trails (id, hub_id, name, description, position)
		VALUES ('legacy-auto', 'legacy', 'Legacy (auto-import)', 'Trilha temporária para módulos auto-importados', 99)
		ON CONFLICT (id) DO NOTHING;
	`)
	if err != nil {
		return fmt.Errorf("ensure trail legacy: %w", err)
	}
	return nil
}

func countBlocks(blocks []Block) int {
	n := len(blocks)
	for _, b := range blocks {
		n += countBlocks(b.Children)
	}
	return n
}

func importOne(ctx context.Context, pool *pgxpool.Pool, slug, title string, blocks []Block) (int, error) {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	_, err = tx.Exec(ctx, `
		INSERT INTO curriculum_articles
			(slug, title, trail_id, hub_id, content_md, xp, read_time, difficulty, "order", published, status, published_at, updated_at)
		VALUES ($1, $2, 'legacy-auto', 'legacy', '', 10, 5, 'beginner', 0, true, 'published', now(), now())
		ON CONFLICT (slug) DO UPDATE
			SET title = EXCLUDED.title,
			    updated_at = now();
	`, slug, title)
	if err != nil {
		return 0, fmt.Errorf("upsert article: %w", err)
	}

	_, err = tx.Exec(ctx, `DELETE FROM module_blocks WHERE article_slug = $1`, slug)
	if err != nil {
		return 0, fmt.Errorf("delete old blocks: %w", err)
	}

	count, err := insertBlocks(ctx, tx, slug, nil, blocks)
	if err != nil {
		return 0, err
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("commit: %w", err)
	}
	return count, nil
}

// sanitizeJSONB remove escapes NUL que o JSONB do Postgres rejeita
// (SQLSTATE 22P05). Strip silencioso da sequência de escape de 6 chars e do
// byte NUL literal — blocks de código podem ter um desses por acidente do
// parser AST sem que isso afete o significado.
func sanitizeJSONB(b []byte) []byte {
	s := string(b)
	s = strings.ReplaceAll(s, "\\u0000", "")
	s = strings.ReplaceAll(s, "\x00", "")
	return []byte(s)
}

func insertBlocks(ctx context.Context, tx pgx.Tx, slug string, parentID *string, blocks []Block) (int, error) {
	count := 0
	for i, b := range blocks {
		dataJSON, err := json.Marshal(b.Data)
		if err != nil {
			return count, fmt.Errorf("marshal data block %d: %w", i, err)
		}
		dataJSON = sanitizeJSONB(dataJSON)

		var insertedID string
		err = tx.QueryRow(ctx, `
			INSERT INTO module_blocks (article_slug, parent_id, position, block_type, block_data)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id::text
		`, slug, parentID, b.Position, b.Type, dataJSON).Scan(&insertedID)
		if err != nil {
			return count, fmt.Errorf("insert block %d (type=%s): %w", i, b.Type, err)
		}
		count++

		if len(b.Children) > 0 {
			childCount, err := insertBlocks(ctx, tx, slug, &insertedID, b.Children)
			if err != nil {
				return count, err
			}
			count += childCount
		}
	}
	return count, nil
}
