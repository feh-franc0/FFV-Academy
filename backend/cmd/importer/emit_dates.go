package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// emitDates escreve frontend/src/lib/content-dates.json com a data da última
// mudança REAL de conteúdo por slug.
//
// Só entra slug com `content_hash` preenchido. Slug com hash nulo é slug que
// nunca passou por uma importação com hash: a `updated_at` dele é a data de um
// deploy antigo, não a data de uma edição, e emitir isso como `lastmod` seria
// repetir exatamente o defeito que a coluna existe para corrigir.
//
// Arquivo vazio é estado válido e é o padrão. Sem banco — que é o caso do build
// no CI hoje — o sitemap não afirma data nenhuma, que é o comportamento anterior
// e a resposta honesta: ausência de `lastmod` o Google trata usando os sinais
// próprios de rastreamento, enquanto `lastmod` uniforme ele passa a IGNORAR,
// inclusive nas URLs onde seria verdade.
func emitDates(ctx context.Context, pool *pgxpool.Pool, destino string) error {
	rows, err := pool.Query(ctx, `
		SELECT slug, updated_at
		  FROM curriculum_articles
		 WHERE content_hash IS NOT NULL
		   AND published = true
		 ORDER BY slug;
	`)
	if err != nil {
		return fmt.Errorf("consultar datas: %w", err)
	}
	defer rows.Close()

	datas := map[string]string{}
	for rows.Next() {
		var slug string
		var quando time.Time
		if err := rows.Scan(&slug, &quando); err != nil {
			return fmt.Errorf("ler linha: %w", err)
		}
		// Data, não instante. `lastmod` com hora produz variação que não
		// corresponde a mudança percebida, e o formato de data é aceito pelo
		// protocolo de sitemap.
		datas[slug] = quando.UTC().Format("2006-01-02")
	}
	if err := rows.Err(); err != nil {
		return fmt.Errorf("iterar: %w", err)
	}

	slugs := make([]string, 0, len(datas))
	for s := range datas {
		slugs = append(slugs, s)
	}
	sort.Strings(slugs)

	saida := struct {
		Comentario string            `json:"_comentario"`
		GeradoEm   string            `json:"geradoEm"`
		Datas      map[string]string `json:"datas"`
	}{
		Comentario: "GERADO pelo importador (backend/cmd/importer, flag --emit-dates) — não edite à mão. " +
			"Mapeia slug → data da última mudança REAL de conteúdo, derivada de curriculum_articles.updated_at, " +
			"que só se move quando o hash do conteúdo muda (migration 000045). O sitemap emite <lastmod> apenas " +
			"para slug presente aqui. Vazio é estado válido: sem banco, o sitemap não afirma data nenhuma — que é " +
			"a resposta honesta e o comportamento anterior.",
		GeradoEm: time.Now().UTC().Format(time.RFC3339),
		Datas:    datas,
	}

	bruto, err := json.MarshalIndent(saida, "", "  ")
	if err != nil {
		return fmt.Errorf("serializar: %w", err)
	}
	if err := os.MkdirAll(filepath.Dir(destino), 0o750); err != nil {
		return fmt.Errorf("criar diretório: %w", err)
	}
	if err := os.WriteFile(destino, append(bruto, '\n'), 0o600); err != nil {
		return fmt.Errorf("escrever %s: %w", destino, err)
	}

	// Quantas datas DISTINTAS existem é o número que diz se o sinal presta: uma
	// só data para tudo é o estado que fez o campo ser removido em ago/2026, e
	// aqui ele reapareceria disfarçado.
	distintas := map[string]struct{}{}
	for _, d := range datas {
		distintas[d] = struct{}{}
	}
	fmt.Printf("content-dates.json: %d slugs, %d data(s) distinta(s)\n", len(datas), len(distintas))
	if len(datas) > 1 && len(distintas) == 1 {
		fmt.Println("  ATENÇÃO: uma única data para todos os artigos — é o sinal inútil que o hash")
		fmt.Println("  deveria eliminar. Provável causa: primeira execução do hash, em que nada mudou.")
	}
	return nil
}
