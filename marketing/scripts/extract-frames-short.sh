#!/bin/bash
#
# extract-frames-short.sh — Extrai 1 frame/s dos 4 videos para review visual
#
# Uso: bash scripts/extract-frames-short.sh --id=Hero-H-Phone
#      bash scripts/extract-frames-short.sh --id=all

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MARKETING_DIR="$(dirname "$SCRIPT_DIR")"

ID=""
for arg in "$@"; do
  case $arg in
    --id=*) ID="${arg#*=}" ;;
  esac
done

if [ -z "$ID" ]; then
  echo "❌ Uso: --id=Hero-H-Phone|Hero-H-Computer|Hero-V-Phone|Hero-V-Computer|all"
  exit 1
fi

extract_one() {
  local id=$1
  local file=$2
  local video="$MARKETING_DIR/out/$file"
  local review_dir="$MARKETING_DIR/out/review-$id"

  if [ ! -f "$video" ]; then
    echo "⚠ Video nao encontrado: $video"
    return
  fi

  mkdir -p "$review_dir"
  rm -f "$review_dir"/*.png

  echo "🔍 Extraindo 1 frame/s de $id..."
  ffmpeg -i "$video" -vf "fps=1" -y "$review_dir/s-%02d.png" 2>/dev/null

  local total=$(ls -1 "$review_dir"/*.png 2>/dev/null | wc -l | tr -d ' ')
  echo "✓ $total frames em out/review-$id/"
}

case "$ID" in
  Hero-H-Phone)         extract_one "Hero-H-Phone"         "hero-horizontal-phone.mp4" ;;
  Hero-H-Computer)      extract_one "Hero-H-Computer"      "hero-horizontal-computer.mp4" ;;
  Hero-V-Phone)         extract_one "Hero-V-Phone"         "hero-vertical-phone.mp4" ;;
  Hero-V-Computer)      extract_one "Hero-V-Computer"      "hero-vertical-computer.mp4" ;;
  Hero-H-Phone-Text)    extract_one "Hero-H-Phone-Text"    "hero-horizontal-phone-text.mp4" ;;
  Hero-H-Computer-Text) extract_one "Hero-H-Computer-Text" "hero-horizontal-computer-text.mp4" ;;
  Hero-V-Phone-Text)    extract_one "Hero-V-Phone-Text"    "hero-vertical-phone-text.mp4" ;;
  Hero-V-Computer-Text) extract_one "Hero-V-Computer-Text" "hero-vertical-computer-text.mp4" ;;
  all)
    extract_one "Hero-H-Phone"         "hero-horizontal-phone.mp4"
    extract_one "Hero-H-Computer"      "hero-horizontal-computer.mp4"
    extract_one "Hero-V-Phone"         "hero-vertical-phone.mp4"
    extract_one "Hero-V-Computer"      "hero-vertical-computer.mp4"
    extract_one "Hero-H-Phone-Text"    "hero-horizontal-phone-text.mp4"
    extract_one "Hero-H-Computer-Text" "hero-horizontal-computer-text.mp4"
    extract_one "Hero-V-Phone-Text"    "hero-vertical-phone-text.mp4"
    extract_one "Hero-V-Computer-Text" "hero-vertical-computer-text.mp4"
    ;;
  *) echo "❌ id invalido: $ID"; exit 1 ;;
esac

echo ""
echo "Proximo passo: /marketing-diretor-executivo revisar <id>"
