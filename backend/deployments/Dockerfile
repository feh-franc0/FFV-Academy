# Stage 1: Build
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Cache dependencies first
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
# -s -w reduz tamanho do binário; CGO desabilitado para binário estático.
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /api ./cmd/api

# Stage 2: Runtime (distroless, non-root, sem shell)
FROM gcr.io/distroless/static-debian12:nonroot

COPY --from=builder /api /api

USER nonroot:nonroot

EXPOSE 8080

# Distroless não tem curl — usamos o próprio binário + /healthz via TCP check.
# Orquestradores reais (K8s) devem usar httpGet probe ao invés desta HEALTHCHECK.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/api", "--healthcheck"]

ENTRYPOINT ["/api"]
