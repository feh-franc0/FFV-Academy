#!/usr/bin/env bash
# Verifica o status atual do deploy: quando frontend e backend foram atualizados.
# Uso: bash scripts/check-deploy-status.sh [--watch]
set -euo pipefail

FRONT_URL="${FRONT_URL:-https://fernandofrancovalle.com}"
API_URL="${API_URL:-https://api.fernandofrancovalle.com}"

check_once() {
  echo "═══════════════════════════════════════════════════════"
  echo "  Deploy Status — $(date '+%Y-%m-%d %H:%M:%S')"
  echo "═══════════════════════════════════════════════════════"

  echo ""
  echo "▸ Frontend ($FRONT_URL)"
  headers=$(curl -sI "$FRONT_URL" 2>/dev/null || echo "")
  if [[ -z "$headers" ]]; then
    echo "  ✗ Site fora do ar"
  else
    last_mod=$(echo "$headers" | grep -i "last-modified" | cut -d' ' -f2- | tr -d '\r')
    server=$(echo "$headers" | grep -i "^server" | cut -d' ' -f2- | tr -d '\r')
    status=$(echo "$headers" | head -1 | tr -d '\r')
    echo "  Status:        $status"
    echo "  Server:        ${server:-?}"
    echo "  Last-Modified: ${last_mod:-?}"

    # Calcula quanto tempo passou
    if [[ -n "$last_mod" ]] && command -v date >/dev/null; then
      if last_epoch=$(date -j -f "%a, %d %b %Y %H:%M:%S GMT" "$last_mod" "+%s" 2>/dev/null); then
        now_epoch=$(date +%s)
        diff_sec=$((now_epoch - last_epoch))
        diff_hour=$((diff_sec / 3600))
        diff_day=$((diff_hour / 24))
        if (( diff_day > 0 )); then
          echo "  Atrás:         ${diff_day} dia(s) ${diff_hour}h"
        else
          echo "  Atrás:         ${diff_hour} hora(s)"
        fi
      fi
    fi
  fi

  echo ""
  echo "▸ Backend ($API_URL)"
  if health=$(curl -fsSL "$API_URL/healthz" 2>/dev/null); then
    echo "  Health: $health"
  else
    echo "  ✗ /healthz não respondeu"
  fi

  if features=$(curl -fsSL "$API_URL/api/v1/features" 2>/dev/null); then
    echo "  Features: $features"
  fi
}

if [[ "${1:-}" == "--watch" ]]; then
  while true; do
    clear
    check_once
    echo ""
    echo "(Ctrl+C para sair — atualizando a cada 30s)"
    sleep 30
  done
else
  check_once
fi
