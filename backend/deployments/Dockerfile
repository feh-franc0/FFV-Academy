# Stage 1: Build
# Build context = raiz do monorepo (configurado em .github/workflows/deploy.yml:
# context: .). Permite COPY tanto de backend/ quanto de scripts/seeds/ pra
# bundling do curriculum no binário sem precisar de SCP/upload manual em prod.
# Pinada por digest (achado P-12, auditoria de 11/ago/2026) — tag flutuante
# como "1.26-alpine" pode apontar pra uma imagem diferente amanhã sem
# nenhuma mudança neste arquivo. Dependabot mantém o digest atualizado
# (ver .github/dependabot.yml, ecosystem docker).
FROM golang:1.26-alpine@sha256:0178a641fbb4858c5f1b48e34bdaabe0350a330a1b1149aabd498d0699ff5fb2 AS builder

WORKDIR /app

# Cache de deps Go — copia primeiro só go.mod/go.sum, depois roda mod download.
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copia todo o backend (código fonte).
COPY backend/ ./

# -s -w reduz tamanho; CGO desabilitado pra binário estático em distroless.
# Buildamos DOIS binários:
#   1. /api          — entrypoint principal (servidor HTTP)
#   2. /importer     — CLI one-shot rodado pelo deploy.sh para popular
#                      hubs/trails/articles/blocks a partir dos seeds JSONs.
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /api      ./cmd/api && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /importer ./cmd/importer

# Stage 2: Runtime (distroless, non-root, sem shell)
# Pinada por digest (achado P-12) — mesma razão do stage de build acima.
FROM gcr.io/distroless/static-debian12:nonroot@sha256:afa5c872c891853ca7fcf1f12c3edb23f7eeef36189728842dd51042ff57f7ab

COPY --from=builder /api      /api
COPY --from=builder /importer /importer

# Seeds do curriculum (hubs/trails/article-mappings + 767 *.json com blocks).
# Embarcados na imagem pra que o deploy.sh possa rodar:
#   docker run --rm <image> --entrypoint /importer --seeds /seeds
# sem precisar SCP manual ou volume mount externo.
COPY scripts/seeds /seeds

USER nonroot:nonroot

EXPOSE 8080

# Distroless não tem curl — usamos o próprio binário + /healthz via TCP check.
# Orquestradores reais (K8s) devem usar httpGet probe ao invés desta HEALTHCHECK.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/api", "--healthcheck"]

ENTRYPOINT ["/api"]
