.PHONY: build run test test-unit test-integration test-contract test-e2e test-security test-load test-cover lint migrate migrate-down generate clean docker-up docker-down

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
	go test ./... -coverprofile=coverage.out -timeout 120s
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

# ─── Lint ────────────────────────────────────────────────────────────────────
lint:
	golangci-lint run ./...

lint-fix:
	golangci-lint run --fix ./...

# ─── Database Migrations ─────────────────────────────────────────────────────
migrate:
	migrate -path migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path migrations -database "$(DATABASE_URL)" down 1

migrate-reset:
	migrate -path migrations -database "$(DATABASE_URL)" drop -f
	migrate -path migrations -database "$(DATABASE_URL)" up

migrate-status:
	migrate -path migrations -database "$(DATABASE_URL)" version

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

# ─── Clean ───────────────────────────────────────────────────────────────────
clean:
	rm -rf bin/ coverage.out coverage.html

# ─── CI ──────────────────────────────────────────────────────────────────────
ci: lint test-unit test-cover
