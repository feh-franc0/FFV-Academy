.PHONY: build run test test-unit test-integration test-contract test-e2e test-security test-load test-cover lint migrate migrate-down generate clean docker-up docker-down seed-questions gen-seed-migration

# ─── Build & Run ─────────────────────────────────────────────────────────────
build:
	go build -o bin/api ./cmd/api

run:
	go run ./cmd/api

run-watch:
	air -c .air.toml

# ─── Tests ───────────────────────────────────────────────────────────────────
test:
	go test ./... -timeout 120s

test-unit:
	go test ./internal/domain/... ./internal/application/... -timeout 30s -v

test-integration:
	go test ./test/integration/... -timeout 120s -v -tags integration

test-contract:
	go test ./test/contract/... -timeout 60s -v

test-e2e:
	go test ./test/e2e/... -timeout 300s -v -tags e2e

test-security:
	go test ./test/security/... -timeout 60s -v -tags security

test-load:
	@cd test/load && bash run-local.sh

test-cover:
	# Mede cobertura só nos pacotes que TÊM testes (TestGoFiles/XTestGoFiles)
	# e exclui cmd/ (entrypoints/CLIs integration-tested via shell, não unit).
	# Sem essa filtragem:
	#   1. adicionar uma ferramenta CLI sem testes dilui a métrica e quebra o
	#      coverage gate (ratchet pattern no CI);
	#   2. instrumentar pacotes sem testes dispara `covdata` que pode faltar
	#      no toolchain em alguns ambientes.
	# Padrão da indústria.
	go test $$(go list -f '{{if or .TestGoFiles .XTestGoFiles}}{{.ImportPath}}{{end}}' ./... | grep -v /cmd/) \
		-coverprofile=coverage.out -timeout 120s
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

# ─── Lint ────────────────────────────────────────────────────────────────────
lint:
	golangci-lint run ./...

lint-fix:
	golangci-lint run --fix ./...

# ─── Database Migrations ─────────────────────────────────────────────────────
# Fluxo padrão: rode `make migrate` normalmente — aplica todas as migrations
# commited (incluindo o seed CLF-C02 base em 000041_seed_clf_questions e o
# overlay idempotente em 000042_reseed_clf_questions_v2).
#
# Fluxo para EDITAR uma questão CLF-C02:
#   1. edita frontend/data/question-bank/clf-c02-*.json
#   2. `make gen-seed-migration`  (regenera 000042_reseed_clf_questions_v2.up.sql)
#   3. commita o .sql regenerado
#   4. dev local → `make reseed-clf` (down 1 + up, re-aplica a 000042)
#   5. prod (deploy.sh) → o down+up acontece no script de deploy quando o
#      arquivo da 000042 muda. golang-migrate detecta a nova versão e aplica.
migrate:
	migrate -path migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path migrations -database "$(DATABASE_URL)" down 1

migrate-reset:
	migrate -path migrations -database "$(DATABASE_URL)" drop -f
	migrate -path migrations -database "$(DATABASE_URL)" up

migrate-status:
	migrate -path migrations -database "$(DATABASE_URL)" version

# Regenera migrations/000041_seed_clf_questions.{up,down}.sql lendo os JSONs em
# frontend/data/question-bank. Idempotente — pode rodar sempre.
# Em CI: roda automaticamente para verificar drift entre JSONs e SQL commited.
gen-seed-migration:
	@go run ./cmd/gen-seed-migration

# Re-aplica o seed (down + up + regen) — útil em dev quando você edita uma
# questão no JSON e quer aplicar a edição num banco já populado.
# Equivale a: reverter a migration 000041 → regerar o SQL → re-aplicar.
reseed-clf:
	migrate -path migrations -database "$(DATABASE_URL)" down 1
	$(MAKE) gen-seed-migration
	migrate -path migrations -database "$(DATABASE_URL)" up

# ─── Code Generation ─────────────────────────────────────────────────────────
generate:
	go generate ./...

mocks:
	go generate ./internal/domain/...
	go generate ./internal/application/...

# ─── Docker ──────────────────────────────────────────────────────────────────
docker-up:
	docker compose -f deployments/docker-compose.yml up -d

docker-down:
	docker compose -f deployments/docker-compose.yml down

docker-build:
	docker build -f deployments/Dockerfile -t ffv-api:latest .

docker-logs:
	docker compose -f deployments/docker-compose.yml logs -f api

# ─── Catalog ─────────────────────────────────────────────────────────────────
gen-catalog:
	bash scripts/gen-catalog.sh

# ─── Seed Questions ──────────────────────────────────────────────────────────
# DEPRECATED: o seed agora é feito pela migration 000041_seed_clf_questions
# (regenerada via `make gen-seed-migration`). Este target permanece apenas
# para popular bancos sem rodar migrations — uso raro.
seed-questions:
	go run ./cmd/seed-questions

# ─── Clean ───────────────────────────────────────────────────────────────────
clean:
	rm -rf bin/ coverage.out coverage.html

# ─── CI ──────────────────────────────────────────────────────────────────────
ci: lint test-unit test-cover
