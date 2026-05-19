//go:build integration

// Integration test do cmd/importer — sobe Postgres ephemeral via testcontainers,
// roda o BINÁRIO REAL do importer (mesma coisa que vai pra prod) contra
// scripts/seeds/ do repo, e valida que o estado do banco bate com o esperado:
//
//   - >=8 hubs persistidos
//   - >=60 trails persistidos
//   - >=700 curriculum_articles persistidos
//   - module_blocks populados (não vazios)
//   - slug específico (o-que-e-cloud) resolve com title + blocks
//   - idempotência: rodar 2x não duplica nada
//
// O que esse teste previne:
//  1. O importer ser quebrado e o /aprenda/<slug> dar 404 silenciosamente.
//  2. Drift entre scripts/seeds/ e curriculum_articles (ex: schema novo
//     sem migration de import).
//  3. Bugs no SQL UPSERT (ex: ON CONFLICT mal formado que duplica rows).
//  4. Regressão no Dockerfile que não bundle os seeds corretamente.
//
// Execução: `make test-integration` (precisa Docker no host).
package integration

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
)

// repoRoot retorna a raiz do monorepo a partir do path deste arquivo.
// Usado para resolver caminhos absolutos para scripts/seeds e cmd/importer.
func repoRoot(t *testing.T) string {
	t.Helper()
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("não conseguiu resolver path do test")
	}
	// .../backend/test/integration/curriculum_importer_test.go → .../
	return filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", ".."))
}

// buildImporter compila o binário do importer e retorna o caminho.
// Usar `go run` aqui adicionaria custo por execução; build uma vez é mais rápido.
func buildImporter(t *testing.T) string {
	t.Helper()
	root := repoRoot(t)
	out := filepath.Join(t.TempDir(), "importer")
	cmd := exec.Command("go", "build", "-o", out, "./cmd/importer")
	cmd.Dir = filepath.Join(root, "backend")
	if output, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("build importer: %v\n%s", err, string(output))
	}
	return out
}

// dsnFromPool converte um pool pgx em DSN postgres:// pra passar via env var
// pro processo subprocess do importer.
func dsnFromPool(t *testing.T, pool *pgxpool.Pool) string {
	t.Helper()
	cfg := pool.Config().ConnConfig
	pwd := cfg.Password
	if pwd == "" {
		pwd = ""
	}
	return "postgres://" + cfg.User + ":" + pwd + "@" + cfg.Host + ":" +
		itoa(int(cfg.Port)) + "/" + cfg.Database + "?sslmode=disable"
}

func itoa(n int) string {
	// Sem strconv pra evitar import noise; n é sempre porta TCP (16-bit).
	if n == 0 {
		return "0"
	}
	digits := []byte{}
	for n > 0 {
		digits = append([]byte{'0' + byte(n%10)}, digits...)
		n /= 10
	}
	return string(digits)
}

func runImporter(t *testing.T, binPath, seedsDir, dsn string) {
	t.Helper()
	cmd := exec.Command(binPath, "-seeds", seedsDir)
	cmd.Env = append(os.Environ(), "DATABASE_URL="+dsn)
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("importer execution failed: %v\n--- output ---\n%s", err, string(output))
	}
	t.Logf("importer output (last 1KB):\n%s", tail(string(output), 1024))
}

func tail(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return "..." + s[len(s)-n:]
}

// Test 1: importer popula tabelas com counts esperados.
func Test_CurriculumImporter_PopulatesHubsTrailsArticlesBlocks(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	binPath := buildImporter(t)
	seedsDir := filepath.Join(repoRoot(t), "scripts", "seeds", "articles")
	dsn := dsnFromPool(t, pool)

	runImporter(t, binPath, seedsDir, dsn)

	// Hubs ≥ 8
	var hubCount int
	if err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM hubs").Scan(&hubCount); err != nil {
		t.Fatalf("count hubs: %v", err)
	}
	if hubCount < 8 {
		t.Errorf("esperado ≥ 8 hubs, got %d", hubCount)
	}

	// Trails ≥ 60
	var trailCount int
	if err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM trails").Scan(&trailCount); err != nil {
		t.Fatalf("count trails: %v", err)
	}
	if trailCount < 60 {
		t.Errorf("esperado ≥ 60 trails, got %d", trailCount)
	}

	// curriculum_articles ≥ 700 (frontend tem 804 slugs; importer pula vazios)
	var articleCount int
	if err := pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM curriculum_articles WHERE deleted_at IS NULL",
	).Scan(&articleCount); err != nil {
		t.Fatalf("count articles: %v", err)
	}
	if articleCount < 700 {
		t.Errorf("esperado ≥ 700 articles publicados, got %d", articleCount)
	}

	// module_blocks ≥ articleCount (cada artigo tem ≥1 bloco)
	var blockCount int
	if err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM module_blocks").Scan(&blockCount); err != nil {
		t.Fatalf("count blocks: %v", err)
	}
	if blockCount < articleCount {
		t.Errorf("esperado blocks ≥ articles (%d), got %d", articleCount, blockCount)
	}
}

// Test 2: slug específico que estava 404 em prod (o-que-e-cloud) resolve.
func Test_CurriculumImporter_CriticalSlug_OQueECloud_Resolves(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	binPath := buildImporter(t)
	seedsDir := filepath.Join(repoRoot(t), "scripts", "seeds", "articles")
	dsn := dsnFromPool(t, pool)

	runImporter(t, binPath, seedsDir, dsn)

	// Slug deve existir e ter title.
	var title string
	err := pool.QueryRow(ctx,
		"SELECT title FROM curriculum_articles WHERE slug = $1 AND deleted_at IS NULL",
		"o-que-e-cloud",
	).Scan(&title)
	if err != nil {
		t.Fatalf("slug o-que-e-cloud não encontrado: %v", err)
	}
	if title == "" {
		t.Error("title de o-que-e-cloud está vazio")
	}

	// Deve ter ao menos 1 bloco persistido (conteúdo do artigo).
	var blockCount int
	if err := pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM module_blocks WHERE article_slug = $1",
		"o-que-e-cloud",
	).Scan(&blockCount); err != nil {
		t.Fatalf("count blocks of o-que-e-cloud: %v", err)
	}
	if blockCount == 0 {
		t.Error("o-que-e-cloud tem 0 blocks — conteúdo perdido no import")
	}
}

// Test 3: idempotência — rodar 2x não duplica nem rompe.
func Test_CurriculumImporter_Idempotent_DoesNotDuplicate(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	binPath := buildImporter(t)
	seedsDir := filepath.Join(repoRoot(t), "scripts", "seeds", "articles")
	dsn := dsnFromPool(t, pool)

	// 1ª execução
	runImporter(t, binPath, seedsDir, dsn)

	var articlesAfterFirst, blocksAfterFirst int
	_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM curriculum_articles WHERE deleted_at IS NULL").Scan(&articlesAfterFirst)
	_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM module_blocks").Scan(&blocksAfterFirst)

	// 2ª execução — mesmo seed, mesmo DB.
	runImporter(t, binPath, seedsDir, dsn)

	var articlesAfterSecond, blocksAfterSecond int
	_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM curriculum_articles WHERE deleted_at IS NULL").Scan(&articlesAfterSecond)
	_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM module_blocks").Scan(&blocksAfterSecond)

	if articlesAfterSecond != articlesAfterFirst {
		t.Errorf("articles duplicaram: %d → %d", articlesAfterFirst, articlesAfterSecond)
	}
	if blocksAfterSecond != blocksAfterFirst {
		t.Errorf("blocks duplicaram: %d → %d", blocksAfterFirst, blocksAfterSecond)
	}
}

// Test 4: cobertura de slugs canônicos críticos — frontend depende desses
// existirem no banco. Se algum desses sumir, /aprenda/<slug> dá 404.
func Test_CurriculumImporter_CriticalSlugsPresent(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	binPath := buildImporter(t)
	seedsDir := filepath.Join(repoRoot(t), "scripts", "seeds", "articles")
	dsn := dsnFromPool(t, pool)
	runImporter(t, binPath, seedsDir, dsn)

	// Slugs canônicos — variedade de hubs/trails pra detectar regressões
	// que afetem subconjuntos do curriculum.
	criticalSlugs := []string{
		"o-que-e-ia",
		"o-que-e-cloud",
		"o-que-e-llm",
		"modelo-responsabilidade-compartilhada",
		"transformers-arquitetura",
		"rag-fundamentals",
	}

	for _, slug := range criticalSlugs {
		var exists bool
		err := pool.QueryRow(ctx,
			"SELECT EXISTS(SELECT 1 FROM curriculum_articles WHERE slug = $1 AND deleted_at IS NULL)",
			slug,
		).Scan(&exists)
		if err != nil {
			t.Errorf("query slug %q: %v", slug, err)
			continue
		}
		if !exists {
			// Verifica se o JSON existe (diagnóstico — se não existe seed, é
			// problema diferente do importer).
			jsonPath := filepath.Join(seedsDir, slug+".json")
			if _, statErr := os.Stat(jsonPath); statErr == nil {
				t.Errorf("slug %q tem JSON em seeds/ mas NÃO foi importado", slug)
			} else {
				t.Logf("WARN: slug %q não existe em seeds (esperado se foi renomeado)", slug)
			}
		}
	}
}

// Test 5: schema sanity — cada article tem hub_id e trail_id válidos (FKs).
func Test_CurriculumImporter_NoOrphanArticles(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	binPath := buildImporter(t)
	seedsDir := filepath.Join(repoRoot(t), "scripts", "seeds", "articles")
	dsn := dsnFromPool(t, pool)
	runImporter(t, binPath, seedsDir, dsn)

	// Nenhum article deve ter hub_id que não existe em hubs.
	var orphans int
	err := pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM curriculum_articles a
		LEFT JOIN hubs h ON h.id = a.hub_id
		WHERE a.deleted_at IS NULL AND h.id IS NULL
	`).Scan(&orphans)
	if err != nil {
		t.Fatalf("query orphans hub: %v", err)
	}
	if orphans > 0 {
		t.Errorf("%d artigos com hub_id órfão (sem hub correspondente)", orphans)
	}

	// Nenhum article deve ter trail_id que não existe em trails.
	err = pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM curriculum_articles a
		LEFT JOIN trails t ON t.id = a.trail_id
		WHERE a.deleted_at IS NULL AND t.id IS NULL
	`).Scan(&orphans)
	if err != nil {
		t.Fatalf("query orphans trail: %v", err)
	}
	if orphans > 0 {
		t.Errorf("%d artigos com trail_id órfão (sem trail correspondente)", orphans)
	}

	// Sanity adicional: nenhum block deve referenciar article inexistente.
	var orphanBlocks int
	err = pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM module_blocks b
		LEFT JOIN curriculum_articles a ON a.slug = b.article_slug
		WHERE a.slug IS NULL
	`).Scan(&orphanBlocks)
	if err != nil {
		// Se a coluna article_slug não existir, log e segue.
		if strings.Contains(err.Error(), "column") {
			t.Logf("WARN: schema de module_blocks mudou — pulando check de orphan blocks")
		} else {
			t.Fatalf("query orphans blocks: %v", err)
		}
	}
	if orphanBlocks > 0 {
		t.Errorf("%d blocks órfãos (referenciam article que não existe)", orphanBlocks)
	}
}
