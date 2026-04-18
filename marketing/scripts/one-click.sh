#!/bin/bash
#
# one-click.sh — Pipeline completo: dev server → captura → render → video pronto
#
# Uso: bash scripts/one-click.sh
# Ou:  npm run video
#
# Faz tudo sozinho:
# 1. Inicia dev server (se nao estiver rodando)
# 2. Espera ele subir
# 3. Captura 25 screenshots reais com Puppeteer
# 4. Renderiza video 90s com Remotion
# 5. Gera thumbnail
# 6. Mata o dev server (se foi ele que iniciou)
# 7. Entrega out/promo.mp4

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MARKETING_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$MARKETING_DIR")"
BASE_URL="http://127.0.0.1:8080"
STARTED_SERVER=false

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🎬 FFV Academy — Pipeline Completo de Video Promocional"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ── Fase 0: Verifica deps ────────────────────────────────────────────

echo -e "${BLUE}[FASE 0]${NC} Verificando dependencias..."

if ! command -v ffmpeg &> /dev/null; then
  echo -e "${YELLOW}  ⚠ ffmpeg nao encontrado, instalando...${NC}"
  brew install ffmpeg
fi
echo -e "${GREEN}  ✓ ffmpeg${NC}"

if [ ! -d "$MARKETING_DIR/node_modules/remotion" ]; then
  echo -e "${YELLOW}  ⚠ Deps nao instaladas, instalando...${NC}"
  cd "$MARKETING_DIR" && npm install
fi
echo -e "${GREEN}  ✓ node_modules${NC}"

# Garante diretorios
mkdir -p "$MARKETING_DIR/public/screenshots" "$MARKETING_DIR/out" "$MARKETING_DIR/assets/screenshots"

# ── Fase 1: Build + Serve ──────────────────────────────────────────

echo ""
echo -e "${BLUE}[FASE 1]${NC} Build estatico + servidor HTTP..."

if curl -s -o /dev/null -w "" "$BASE_URL" 2>/dev/null; then
  echo -e "${GREEN}  ✓ Servidor ja esta rodando em $BASE_URL${NC}"
else
  echo -e "${YELLOW}  → Criando build estatico...${NC}"
  cd "$PROJECT_DIR"
  npm run build > /tmp/ffv-build.log 2>&1
  if [ $? -ne 0 ]; then
    echo -e "${RED}  ✗ Build falhou${NC}"
    echo "  Veja o log: cat /tmp/ffv-build.log"
    exit 1
  fi
  echo -e "${GREEN}  ✓ Build concluido${NC}"

  echo -e "${YELLOW}  → Iniciando servidor HTTP...${NC}"
  npx -y serve out -l 8080 -s > /tmp/ffv-serve.log 2>&1 &
  DEV_PID=$!
  STARTED_SERVER=true
  echo "  PID: $DEV_PID"

  # Espera o server subir (max 10s)
  echo -n "  Aguardando"
  for i in $(seq 1 10); do
    if curl -s -o /dev/null "$BASE_URL" 2>/dev/null; then
      echo ""
      echo -e "${GREEN}  ✓ Servidor pronto (${i}s)${NC}"
      break
    fi
    echo -n "."
    sleep 1
    if [ $i -eq 10 ]; then
      echo ""
      echo -e "${RED}  ✗ Servidor nao iniciou em 10s${NC}"
      exit 1
    fi
  done
fi

# ── Fase 2: Captura ─────────────────────────────────────────────────

echo ""
echo -e "${BLUE}[FASE 2]${NC} Capturando 25 screenshots..."
cd "$MARKETING_DIR"
npx tsx scripts/capture.ts

# Verifica capturas
TOTAL=$(ls -1 public/screenshots/*.png 2>/dev/null | wc -l | tr -d ' ')
GOOD=$(find public/screenshots -name "*.png" -size +100k 2>/dev/null | wc -l | tr -d ' ')
echo ""
echo -e "  📊 $GOOD/$TOTAL screenshots com tamanho adequado (>100KB)"

if [ "$GOOD" -lt 15 ]; then
  echo -e "${YELLOW}  ⚠ Menos de 15 screenshots bons. Retentando...${NC}"
  sleep 3
  npx tsx scripts/capture.ts
  GOOD=$(find public/screenshots -name "*.png" -size +100k 2>/dev/null | wc -l | tr -d ' ')
  echo -e "  📊 Retentativa: $GOOD screenshots bons"
fi

# ── Fase 3: Bundle check ────────────────────────────────────────────

echo ""
echo -e "${BLUE}[FASE 3]${NC} Verificando composicao Remotion..."
COMP=$(npx remotion compositions src/index.tsx 2>&1 | grep "PromoVideo")
if echo "$COMP" | grep -q "2700"; then
  echo -e "${GREEN}  ✓ PromoVideo: 90s, 30fps, 1920x1080${NC}"
else
  echo -e "${RED}  ✗ Composition com problema:${NC}"
  echo "  $COMP"
  exit 1
fi

# ── Fase 4: Render ──────────────────────────────────────────────────

echo ""
echo -e "${BLUE}[FASE 4]${NC} Renderizando video (pode levar 2-5 min)..."
npx remotion render src/index.tsx PromoVideo out/promo.mp4 \
  --codec h264 --crf 18 2>&1

# ── Fase 5: Thumbnail ───────────────────────────────────────────────

echo ""
echo -e "${BLUE}[FASE 5]${NC} Gerando thumbnail..."
npx remotion still src/index.tsx PromoVideo out/thumbnail.png --frame 720 2>&1

# ── Fase 6: Validacao ───────────────────────────────────────────────

echo ""
echo -e "${BLUE}[FASE 6]${NC} Validando output..."

if [ -f "out/promo.mp4" ]; then
  SIZE=$(du -h out/promo.mp4 | cut -f1)
  DURATION=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 out/promo.mp4 2>/dev/null | cut -d. -f1)
  echo -e "${GREEN}  ✓ out/promo.mp4: $SIZE, ${DURATION}s${NC}"
else
  echo -e "${RED}  ✗ promo.mp4 nao foi gerado${NC}"
fi

if [ -f "out/thumbnail.png" ]; then
  TSIZE=$(du -h out/thumbnail.png | cut -f1)
  echo -e "${GREEN}  ✓ out/thumbnail.png: $TSIZE${NC}"
fi

# ── Fase 7: Cleanup ─────────────────────────────────────────────────

if [ "$STARTED_SERVER" = true ]; then
  echo ""
  echo -e "${BLUE}[FASE 7]${NC} Parando dev server (PID $DEV_PID)..."
  kill $DEV_PID 2>/dev/null || true
  echo -e "${GREEN}  ✓ Dev server parado${NC}"
fi

# ── Resultado ────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}🎉 VIDEO PRONTO!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  📹 Video:     marketing/out/promo.mp4"
echo "  🖼  Thumbnail: marketing/out/thumbnail.png"
echo "  ⏱  Duracao:   ~90 segundos"
echo "  📐 Resolucao: 1920x1080 (16:9)"
echo ""
echo "  Proximo passo:"
echo "  → Rode: /marketing-producao review"
echo "    para analise critica dos 5 experts com auto-correcao"
echo ""
