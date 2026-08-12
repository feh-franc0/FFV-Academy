#!/usr/bin/env bash
#
# Teste de fumaça contra a IMAGEM do frontend.
#
# ─── Por que este arquivo existe ───────────────────────────────────────────────
#
# A varredura completa (16 checagens, 535 telas) roda contra `next start`, que lê
# de `.next/`. O contêiner NÃO roda `next start`: ele roda o servidor standalone,
# que depende de `.next/static` e `public` terem sido COPIADOS pelo Dockerfile —
# duas linhas que nenhum teste exercita.
#
#     COPY --from=builder /app/.next/standalone ./
#     COPY --from=builder /app/.next/static ./.next/static   ← esta
#     COPY --from=builder /app/public ./public               ← e esta
#
# Se a segunda desaparecer, o build passa, a varredura inteira passa, e a página
# sobe SEM CSS para o primeiro visitante. É o defeito que motivou este script: o
# CI provava o build e não provava o empacotamento.
#
# Escopo deliberadamente pequeno: home, uma página de módulo COM CSS aplicado,
# `/api/health` e um recurso estático. As 500 rotas o build já cobre; o que falta
# provar é que a imagem serve.
#
# Uso:
#     scripts/smoke-imagem-frontend.sh [tag]
#
set -euo pipefail

TAG="${1:-ffv-frontend:smoke}"
NOME="ffv-smoke-$$"
PORTA="${PORTA:-3399}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

vermelho() { printf '\033[31m✗ %s\033[0m\n' "$*"; }
verde()    { printf '\033[32m✓ %s\033[0m\n' "$*"; }
info()     { printf '  %s\n' "$*"; }

FALHAS=0
falhou() { vermelho "$*"; FALHAS=$((FALHAS + 1)); }

limpar() {
  docker rm -f "$NOME" >/dev/null 2>&1 || true
}
trap limpar EXIT

echo "═══ teste de fumaça contra a imagem ═══"

# ── 1. Construir com o MESMO Dockerfile do deploy ────────────────────────────
# Não uma variante "de teste": uma imagem construída por outro caminho não prova
# nada sobre a que vai ao ar.
info "construindo $TAG a partir de frontend/Dockerfile"
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL="https://api.fernandofrancovalle.com" \
  -t "$TAG" "$RAIZ/frontend" >/dev/null

# ── 2. Subir com o mesmo comando de entrada do ambiente real ─────────────────
# Sem `--entrypoint` e sem sobrescrever o CMD: o que se testa é o que o
# docker-compose de produção executa.
info "subindo o contêiner na porta $PORTA"
docker run -d --name "$NOME" -p "$PORTA:3000" \
  -e NEXT_PUBLIC_API_BASE_URL="https://api.fernandofrancovalle.com" \
  "$TAG" >/dev/null

BASE="http://localhost:$PORTA"

# Espera pelo healthcheck da aplicação, não por um `sleep` fixo: em runner lento
# um sleep curto produz falha intermitente, e um sleep longo desperdiça o CI.
info "aguardando /api/health"
for i in $(seq 1 60); do
  if curl -fsS "$BASE/api/health" >/dev/null 2>&1; then break; fi
  if [ "$i" -eq 60 ]; then
    falhou "o contêiner não respondeu /api/health em 60s"
    docker logs "$NOME" 2>&1 | tail -30
    exit 1
  fi
  sleep 1
done
verde "/api/health responde"

# ── 3. Home responde 200 com conteúdo ───────────────────────────────────────
html_home="$(curl -fsS "$BASE/" || true)"
if [ -z "$html_home" ]; then
  falhou "a home não respondeu"
else
  verde "home responde 200"
fi

# ── 4. Variável de ambiente presente no bundle ──────────────────────────────
# Imagem sem a URL da API sobe e parece sadia: a home renderiza, o healthcheck
# passa, e só o primeiro usuário autenticado descobre. Conferir aqui é o que
# transforma um defeito de produção num job vermelho.
if grep -q "api.fernandofrancovalle.com" <<<"$html_home"; then
  verde "URL da API presente no HTML servido"
else
  falhou "URL da API ausente — a imagem subiu sem NEXT_PUBLIC_API_BASE_URL"
fi

# ── 5. Página de módulo COM CSS aplicado ────────────────────────────────────
# A parte que a varredura não pode ver. Duas afirmações separadas, porque falham
# por motivos diferentes:
#   a) a página responde e traz o conteúdo   → problema de build ou de rota
#   b) a folha de estilo que ela referencia é SERVIDA → `.next/static` não copiado
SLUG="lab-app-web-ecs-fargate-rds"
html_mod="$(curl -fsS "$BASE/aprenda/$SLUG" || true)"
if grep -q "ECS Fargate" <<<"$html_mod"; then
  verde "página de módulo responde com conteúdo"
else
  falhou "página de módulo sem o conteúdo esperado"
fi

# O caminho do CSS NÃO é `/_next/static/css/...`.
#
# Medido em 07/ago/2026 contra o build servido: o Next 16 com Turbopack emite
# `<link rel="stylesheet" href="/_next/static/chunks/0.t10gm8uz2ei.css">`. A
# primeira versão deste script procurava `/css/` e não achava nada — teria
# reprovado o CI afirmando "a página não referencia folha de estilo" numa página
# perfeitamente estilizada, que é o pior tipo de falha de gate.
#
# Extrair do `<link rel="stylesheet">` em vez de casar um diretório fixo mantém a
# checagem válida se o caminho mudar de novo.
css="$(grep -oE '<link[^>]*rel="stylesheet"[^>]*>' <<<"$html_mod" \
        | grep -oE 'href="[^"]+"' | head -1 | sed 's/href="//; s/"$//' || true)"
if [ -z "$css" ]; then
  falhou "a página de módulo não referencia nenhuma folha de estilo"
else
  codigo="$(curl -s -o /dev/null -w '%{http_code}' "$BASE$css")"
  tamanho="$(curl -s "$BASE$css" | wc -c | tr -d ' ')"
  if [ "$codigo" = "200" ] && [ "$tamanho" -gt 1000 ]; then
    verde "CSS servido de .next/static ($tamanho bytes)"
  else
    falhou "CSS referenciado responde $codigo com $tamanho bytes — .next/static não foi copiado para a imagem"
  fi
fi

# ── 6. Recurso de `public/` ─────────────────────────────────────────────────
# Terceira linha de COPY do Dockerfile, e a que quebra o manifesto do PWA.
for recurso in /manifest.json /icon.svg /sw.js; do
  codigo="$(curl -s -o /dev/null -w '%{http_code}' "$BASE$recurso")"
  if [ "$codigo" = "200" ]; then
    verde "public$recurso servido"
  else
    falhou "public$recurso responde $codigo — o diretório public não foi copiado para a imagem"
  fi
done

echo
if [ "$FALHAS" -gt 0 ]; then
  vermelho "$FALHAS falha(s) — a imagem não está pronta para ir ao ar"
  echo "── últimas linhas do log do contêiner ──"
  docker logs "$NOME" 2>&1 | tail -20
  exit 1
fi
verde "a imagem serve home, módulo com CSS, estático e saúde"
