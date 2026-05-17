// Command gen-seed-migration: lê os arquivos JSON do question-bank e gera
// uma migration SQL idempotente (INSERT ... ON CONFLICT DO UPDATE).
//
// Uso:
//
//	go run ./cmd/gen-seed-migration [bank-dir] [out-up-path]
//
// Defaults:
//
//	bank-dir    = ../frontend/data/question-bank
//	out-up-path = ./migrations/000042_reseed_clf_questions_v2.up.sql
//	(o .down.sql correspondente NÃO é regenerado — é no-op fixo)
//
// Por que 000042 em vez de 000041:
//
//	A 000041_seed_clf_questions já foi aplicada em prod (com 595 questões
//	das versões antigas dos JSONs). golang-migrate marca como aplicada e
//	NUNCA re-roda. Para fazer os novos 420 INSERTs + UPDATEs in-place
//	chegarem em prod, gera-se uma migration NOVA (000042) que o cluster
//	enxerga como "pendente". Esta 000042 é regenerada a cada edição de
//	JSON — para evitar ter que criar 000043, 000044, ... a cada commit,
//	o fluxo em dev/prod é `make reseed-clf` (down 1 + up) que re-aplica.
//
// Decisões:
//   - Apenas arquivos `clf-c02-*.json` (ignora `.v1-backup.json` e outras certs).
//     Outras certificações (DVA, AIF, anthropic) usam outras migrations
//     dedicadas — mantém o blast radius da regeneração restrito ao CLF.
//   - SQL com `INSERT ... ON CONFLICT (id) DO UPDATE SET ...`: idempotente —
//     re-aplicar a migration sobrescreve campos editados nos JSONs.
//   - Strings escapadas via duplicação de apóstrofo (padrão SQL); JSONB
//     serializado uma única vez para garantir validade.
//   - Ordem determinística (ordenação por filename, depois por id) para que
//     `git diff` na migration regenerada seja fácil de revisar.
//
// IMPORTANTE — limitação do golang-migrate:
//
//	Uma migration já aplicada NÃO é re-executada por `migrate up` mesmo que o
//	arquivo mude. Para aplicar edições de questão depois de já ter rodado em
//	prod: `make migrate-down 1 && make gen-seed-migration && make migrate up`.
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// --- JSON input structs (espelham `data/question-bank/SCHEMA.md`) ---

type questionFileJSON struct {
	Certification string         `json:"certification"`
	Questions     []questionJSON `json:"questions"`
}

// Explanation é aceito tanto como string (schema v1 — formato `(a) ... (b) ...`)
// quanto como objeto rico (schema v2). Mantemos como RawMessage para emitir o
// JSONB exatamente como veio no JSON.
type questionJSON struct {
	ID           string          `json:"id"`
	Stem         string          `json:"stem"`
	Options      []optionJSON    `json:"options"`
	CorrectID    string          `json:"correctId"`
	Explanation  json.RawMessage `json:"explanation"`
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

const (
	defaultBankDir    = "../frontend/data/question-bank"
	defaultUpPath     = "migrations/000042_reseed_clf_questions_v2.up.sql"
	clfPrefix         = "clf-c02-"
	backupSuffix      = ".v1-backup.json"
	simuladoID        = "aws-clf"
	defaultDifficulty = "medium"
)

func main() {
	bankDir := defaultBankDir
	if len(os.Args) > 1 {
		bankDir = os.Args[1]
	}
	upPath := defaultUpPath
	if len(os.Args) > 2 {
		upPath = os.Args[2]
	}

	if info, err := os.Stat(bankDir); err != nil || !info.IsDir() { //nolint:gosec // G703,G304: path vem do operador via CLI args, não de input externo
		log.Fatalf("bank-dir não encontrado: %s", bankDir) //nolint:gosec // G706: log de path controlado pelo operador
	}

	files, err := selectFiles(bankDir)
	if err != nil {
		log.Fatalf("listar arquivos: %v", err)
	}
	if len(files) == 0 {
		log.Fatal("nenhum arquivo clf-c02-*.json encontrado")
	}

	questions, byFile, err := loadAll(bankDir, files)
	if err != nil {
		log.Fatalf("carregar JSONs: %v", err)
	}

	// Ordenação determinística por ID para diff estável entre regenerações.
	sort.SliceStable(questions, func(i, j int) bool {
		return questions[i].ID < questions[j].ID
	})

	upSQL := buildUpSQL(questions, byFile)
	if err := os.WriteFile(upPath, []byte(upSQL), 0o600); err != nil { //nolint:gosec // G304,G703: upPath vem de CLI args do operador, não de input externo
		log.Fatalf("escrever up.sql: %v", err)
	}

	// Não regeneramos o .down.sql — ele é escrito a mão como no-op (ver
	// 000042_reseed_clf_questions_v2.down.sql). A migration 000042 não
	// APAGA dados, só atualiza via ON CONFLICT, então um DELETE genérico
	// no down quebraria invariantes da 000041 (que tem o estado base).
	fmt.Printf("✓ Gerado %s (%d questões de %d arquivos)\n", upPath, len(questions), len(files))
}

func selectFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var out []string
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		if !strings.HasPrefix(name, clfPrefix) || !strings.HasSuffix(name, ".json") {
			continue
		}
		if strings.HasSuffix(name, backupSuffix) {
			continue
		}
		out = append(out, name)
	}
	sort.Strings(out)
	return out, nil
}

func loadAll(dir string, files []string) ([]questionJSON, map[string]int, error) {
	var all []questionJSON
	byFile := make(map[string]int)
	seenIDs := make(map[string]string)

	for _, f := range files {
		raw, err := os.ReadFile(filepath.Join(dir, f)) //nolint:gosec // G304: f vem de selectFiles que só permite clf-c02-*.json; dir é controlado pelo operador
		if err != nil {
			return nil, nil, fmt.Errorf("read %s: %w", f, err)
		}
		var file questionFileJSON
		if err := json.Unmarshal(raw, &file); err != nil {
			return nil, nil, fmt.Errorf("parse %s: %w", f, err)
		}
		for _, q := range file.Questions {
			if prev, dup := seenIDs[q.ID]; dup {
				return nil, nil, fmt.Errorf("id duplicado %q (encontrado em %s e %s)", q.ID, prev, f)
			}
			seenIDs[q.ID] = f
			all = append(all, q)
		}
		byFile[f] = len(file.Questions)
	}
	return all, byFile, nil
}

// --- SQL emission ---

func buildUpSQL(qs []questionJSON, byFile map[string]int) string {
	var b strings.Builder
	b.WriteString("-- Seed: AWS CLF-C02 questions\n")
	// Sem timestamp no header — caso contrário o drift check do CI quebra todo
	// dia quando o relógio do CI passa pra um dia diferente do último commit
	// (gera diff falso sem mudar conteúdo real). Conteúdo determinístico = diff
	// só quando os JSONs mudam de verdade.
	b.WriteString("-- Generated by cmd/gen-seed-migration (deterministic, no timestamp).\n")
	b.WriteString("-- DO NOT EDIT BY HAND — run `make gen-seed-migration` to regenerate.\n")
	fmt.Fprintf(&b, "-- Total: %d questões\n", len(qs))
	b.WriteString("-- Fontes (clf-c02-*.json):\n")

	files := make([]string, 0, len(byFile))
	for f := range byFile {
		files = append(files, f)
	}
	sort.Strings(files)
	for _, f := range files {
		fmt.Fprintf(&b, "--   %s — %d\n", f, byFile[f])
	}
	b.WriteString("\n")

	// Strategy: 1 INSERT por questão (não multi-VALUES) — mais limpo no diff
	// quando uma questão é editada, e cada UPDATE ON CONFLICT atua sobre 1 row.
	for _, q := range qs {
		writeInsert(&b, q)
	}
	return b.String()
}

func writeInsert(b *strings.Builder, q questionJSON) {
	tags := q.Tags
	if tags == nil {
		tags = []string{}
	}
	difficulty := q.Difficulty
	if difficulty == "" {
		difficulty = defaultDifficulty
	}

	optionsJSON, err := json.Marshal(q.Options)
	if err != nil {
		log.Fatalf("marshal options de %s: %v", q.ID, err)
	}
	// Explanation: usa RawMessage diretamente (já é JSON válido); fallback p/ "{}" se vazio.
	explJSON := []byte(q.Explanation)
	if len(explJSON) == 0 {
		explJSON = []byte(`"{}"`)
	}
	tagsJSON, err := json.Marshal(tags)
	if err != nil {
		log.Fatalf("marshal tags de %s: %v", q.ID, err)
	}

	b.WriteString("INSERT INTO questions (id, simulado_id, stem, options, correct_id, explanation, topic, domain, difficulty, scenario_type, tags, source, status, created_at, updated_at) VALUES (\n  ")
	b.WriteString(sqlString(q.ID))
	b.WriteString(", ")
	b.WriteString(sqlString(simuladoID))
	b.WriteString(", ")
	b.WriteString(sqlString(q.Stem))
	b.WriteString(",\n  ")
	b.WriteString(sqlJSONB(optionsJSON))
	b.WriteString(", ")
	b.WriteString(sqlString(q.CorrectID))
	b.WriteString(",\n  ")
	b.WriteString(sqlJSONB(explJSON))
	b.WriteString(",\n  ")
	b.WriteString(sqlString(q.Topic))
	b.WriteString(", ")
	b.WriteString(sqlString(q.Domain))
	b.WriteString(", ")
	b.WriteString(sqlString(difficulty))
	b.WriteString(", ")
	b.WriteString(sqlNullableString(q.ScenarioType))
	b.WriteString(", ")
	b.WriteString(sqlJSONB(tagsJSON))
	b.WriteString(", ")
	b.WriteString(sqlNullableString(q.Source))
	b.WriteString(", 'active', now(), now()\n)\n")
	b.WriteString("ON CONFLICT (id) DO UPDATE SET\n")
	b.WriteString("  simulado_id   = EXCLUDED.simulado_id,\n")
	b.WriteString("  stem          = EXCLUDED.stem,\n")
	b.WriteString("  options       = EXCLUDED.options,\n")
	b.WriteString("  correct_id    = EXCLUDED.correct_id,\n")
	b.WriteString("  explanation   = EXCLUDED.explanation,\n")
	b.WriteString("  topic         = EXCLUDED.topic,\n")
	b.WriteString("  domain        = EXCLUDED.domain,\n")
	b.WriteString("  difficulty    = EXCLUDED.difficulty,\n")
	b.WriteString("  scenario_type = EXCLUDED.scenario_type,\n")
	b.WriteString("  tags          = EXCLUDED.tags,\n")
	b.WriteString("  source        = EXCLUDED.source,\n")
	b.WriteString("  status        = 'active',\n")
	b.WriteString("  updated_at    = now();\n\n")
}

// --- SQL helpers ---

func sqlString(s string) string {
	return "'" + strings.ReplaceAll(s, "'", "''") + "'"
}

func sqlNullableString(s string) string {
	if s == "" {
		return "NULL"
	}
	return sqlString(s)
}

func sqlJSONB(raw []byte) string {
	// Escapa apenas apóstrofos — JSON já lida com aspas duplas, quebras de linha, etc.
	return sqlString(string(raw)) + "::jsonb"
}
