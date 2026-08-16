#!/usr/bin/env bash
# Resize master card PNGs (512×839 @3x) into @1x/@2x/@3x bundles.
# Usage: ./scripts/generate-card-sizes.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MASTER="$ROOT/assets/cards/master"
OUT_1X="$ROOT/assets/cards/1x"
OUT_2X="$ROOT/assets/cards/2x"
OUT_3X="$ROOT/assets/cards/3x"

mkdir -p "$OUT_1X" "$OUT_2X" "$OUT_3X"

for src in "$MASTER"/*.png; do
  [ -f "$src" ] || { echo "No PNGs in $MASTER — run import-card-source.mjs first."; exit 1; }
  base="$(basename "$src")"
  # @3x = 512×839, @2x = 341×560, @1x = 171×280
  sips -z 280 171 "$src" --out "$OUT_1X/$base" >/dev/null
  sips -z 560 341 "$src" --out "$OUT_2X/$base" >/dev/null
  cp "$src" "$OUT_3X/$base"
  echo "✓ $base"
done

echo "Done. Assets ready in assets/cards/{1x,2x,3x}/"
