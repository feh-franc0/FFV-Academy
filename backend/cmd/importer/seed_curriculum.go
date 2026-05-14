// seed_curriculum.go — importa hubs.json, trails.json e article-mappings.json.
//
// Estes seeds vêm do extract-curriculum.ts (parser TS que lê curriculum.ts).
// Roda automaticamente antes do import de blocks — garante FKs válidos.
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/jackc/pgx/v5/pgxpool"
)

type HubSeed struct {
	ID        string   `json:"id"`
	Slug      string   `json:"slug"`
	Name      string   `json:"name"`
	ShortName string   `json:"shortName"`
	Color     string   `json:"color"`
	Icon      string   `json:"icon"`
	Tagline   string   `json:"tagline"`
	Desc      string   `json:"desc"`
	TrailIDs  []string `json:"trailIds"`
}

type TrailSeed struct {
	ID      string                   `json:"id"`
	Name    string                   `json:"name"`
	Color   string                   `json:"color"`
	Icon    string                   `json:"icon"`
	Desc    string                   `json:"desc"`
	Level   string                   `json:"level"`
	Href    string                   `json:"href"`
	Modules []map[string]interface{} `json:"modules"`
}

type ArticleMapping struct {
	Slug     string `json:"slug"`
	Title    string `json:"title"`
	TrailID  string `json:"trail_id"`
	Order    int    `json:"order"`
	XP       int    `json:"xp"`
	ReadTime int    `json:"readTime"`
}

// seedHubsAndTrails lê hubs.json e trails.json e popula só essas tabelas.
// Chame ANTES de importar artigos (pra FKs estarem prontas).
func seedHubsAndTrails(ctx context.Context, pool *pgxpool.Pool, seedsRoot string) error {
	return seedCurriculumImpl(ctx, pool, seedsRoot, false /* updateArticles */)
}

// seedArticleMappings atualiza articles existentes com title/hub/trail corretos.
// Chame DEPOIS de importar artigos.
func seedArticleMappings(ctx context.Context, pool *pgxpool.Pool, seedsRoot string) error {
	return seedCurriculumImpl(ctx, pool, seedsRoot, true /* updateArticles */)
}

func seedCurriculumImpl(ctx context.Context, pool *pgxpool.Pool, seedsRoot string, updateArticles bool) error {
	// 1. Hubs — paths montados a partir de seedsRoot controlado pela CLI.
	// Importer só roda em build/dev/CI, nunca em runtime exposto.
	hubsPath := filepath.Join(seedsRoot, "hubs.json")
	if raw, err := os.ReadFile(hubsPath); err == nil { // #nosec G304
		var hubs []HubSeed
		if err := json.Unmarshal(raw, &hubs); err != nil {
			return fmt.Errorf("parse hubs.json: %w", err)
		}
		for i, h := range hubs {
			// Limpa prefixo "hub-" do id pra usar slug puro
			hubID := h.Slug
			if hubID == "" {
				hubID = h.ID
			}
			_, err := pool.Exec(ctx, `
				INSERT INTO hubs (id, name, short_name, description, icon, color, position)
				VALUES ($1, $2, $3, $4, $5, $6, $7)
				ON CONFLICT (id) DO UPDATE
					SET name = EXCLUDED.name,
					    short_name = EXCLUDED.short_name,
					    description = EXCLUDED.description,
					    icon = EXCLUDED.icon,
					    color = EXCLUDED.color,
					    position = EXCLUDED.position,
					    updated_at = now();
			`, hubID, h.Name, h.ShortName, h.Tagline, h.Icon, h.Color, i)
			if err != nil {
				return fmt.Errorf("upsert hub %s: %w", hubID, err)
			}
		}
		fmt.Printf("✓ %d hubs sincronizados\n", len(hubs))
	}

	// 2. Trails — também precisamos saber a qual hub cada trilha pertence.
	// O hubs.json tem trailIds; invertemos isso aqui.
	trailToHub := make(map[string]string)
	if raw, err := os.ReadFile(hubsPath); err == nil { // #nosec G304
		var hubs []HubSeed
		if err := json.Unmarshal(raw, &hubs); err == nil {
			for _, h := range hubs {
				hubID := h.Slug
				if hubID == "" {
					hubID = h.ID
				}
				for _, tid := range h.TrailIDs {
					trailToHub[tid] = hubID
				}
			}
		}
	}

	trailsPath := filepath.Join(seedsRoot, "trails.json")
	if raw, err := os.ReadFile(trailsPath); err == nil { // #nosec G304
		var trails []TrailSeed
		if err := json.Unmarshal(raw, &trails); err != nil {
			return fmt.Errorf("parse trails.json: %w", err)
		}
		ok := 0
		failed := 0
		for i, tr := range trails {
			hubID, found := trailToHub[tr.ID]
			if !found {
				// Trail órfã (não está em nenhum hub) — usa "legacy"
				hubID = "legacy"
			}
			// Normaliza levels desconhecidos
			level := tr.Level
			switch level {
			case "beginner", "intermediate", "advanced":
				// ok
			case "foundational":
				level = "beginner"
			default:
				level = "" // nullable
			}
			_, err := pool.Exec(ctx, `
				INSERT INTO trails (id, hub_id, name, description, difficulty, icon, position)
				VALUES ($1, $2, $3, $4, $5, $6, $7)
				ON CONFLICT (id) DO UPDATE
					SET hub_id = EXCLUDED.hub_id,
					    name = EXCLUDED.name,
					    description = EXCLUDED.description,
					    difficulty = EXCLUDED.difficulty,
					    icon = EXCLUDED.icon,
					    position = EXCLUDED.position,
					    updated_at = now();
			`, tr.ID, hubID, tr.Name, tr.Desc, nullIfEmpty(level), tr.Icon, i)
			if err != nil {
				failed++
				continue
			}
			ok++
		}
		fmt.Printf("✓ %d trails sincronizados (%d falhas)\n", ok, failed)
	}

	// 3. Article mappings — só roda se solicitado (depois do import).
	if !updateArticles {
		return nil
	}
	mapPath := filepath.Join(seedsRoot, "article-mappings.json")
	if raw, err := os.ReadFile(mapPath); err == nil { // #nosec G304
		var maps []ArticleMapping
		if err := json.Unmarshal(raw, &maps); err != nil {
			return fmt.Errorf("parse article-mappings.json: %w", err)
		}
		updated := 0
		for _, m := range maps {
			hubID, found := trailToHub[m.TrailID]
			if !found {
				hubID = "legacy"
			}
			res, err := pool.Exec(ctx, `
				UPDATE curriculum_articles
				   SET title = $2,
				       trail_id = $3,
				       hub_id = $4,
				       xp = COALESCE(NULLIF($5, 0), xp),
				       read_time = COALESCE(NULLIF($6, 0), read_time),
				       "order" = $7,
				       updated_at = now()
				 WHERE slug = $1;
			`, m.Slug, m.Title, m.TrailID, hubID, m.XP, m.ReadTime, m.Order)
			if err != nil {
				return fmt.Errorf("update article %s: %w", m.Slug, err)
			}
			if res.RowsAffected() > 0 {
				updated++
			}
		}
		fmt.Printf("✓ %d articles atualizados com hub/trail reais\n", updated)
	}

	return nil
}

func nullIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
