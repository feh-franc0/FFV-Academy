#!/bin/bash
# drawio-iter.sh — Uma iteração completa: score XML + fix + export PNG.
# Usado pelo /drawio-master em loops até score visual ≥ 95%.
#
# Uso:
#   bash scripts/drawio/drawio-iter.sh <arquivo.drawio> [label]
#
# Saídas:
#   - <arquivo>.png regerado (alta resolução)
#   - [label opcional] copia versão em docs/architecture/versoes/<label>.{drawio,png}
#   - Stdout: XML score + fixes aplicados
#   - Exit 0 se XML ≥ 80, 1 caso contrário

set -euo pipefail

INPUT="${1:?uso: $0 <arquivo.drawio> [label]}"
LABEL="${2:-}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if [ ! -f "$INPUT" ]; then
  echo "ERRO: arquivo não encontrado: $INPUT" >&2
  exit 2
fi

echo "================================================================"
echo " drawio-iter — arquivo: $(basename "$INPUT")"
[ -n "$LABEL" ] && echo " label: $LABEL"
echo "================================================================"

# 1. Scorer
echo
echo "[1/3] XML Scorer"
python3 "$ROOT/scripts/drawio/aws-arch-scorer.py" "$INPUT" | head -20

# 2. Fixer
echo
echo "[2/3] Auto-fixer (AUTO fixes apenas)"
python3 "$ROOT/scripts/drawio/aws-arch-fixer.py" "$INPUT" | tail -10

# 3. Export PNG
echo
echo "[3/3] Export PNG (scale=2)"
bash "$ROOT/scripts/drawio/export-png.sh" "$INPUT"

# 4. Versionar se label fornecida
if [ -n "$LABEL" ]; then
  VDIR="$ROOT/docs/architecture/versoes"
  mkdir -p "$VDIR"
  cp "$INPUT" "$VDIR/${LABEL}.drawio"
  cp "${INPUT%.drawio}.png" "$VDIR/${LABEL}.png"
  echo
  echo "✅ Versão salva: docs/architecture/versoes/${LABEL}.{drawio,png}"
fi

# 5. Retornar score XML para shell
SCORE=$(python3 "$ROOT/scripts/drawio/aws-arch-scorer.py" "$INPUT" --quiet)
echo
echo "XML_SCORE=$SCORE"
[ "$SCORE" -ge 80 ] && exit 0 || exit 1
