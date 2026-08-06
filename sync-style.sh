#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR_RAW="$SCRIPT_DIR/../dbc-site/dbc-site-live"
SOURCE="$SOURCE_DIR_RAW/style.css"
DEST="$SCRIPT_DIR/style.css"

if [[ ! -f "$SOURCE" ]]; then
  echo "ERROR: source style.css not found at: $SOURCE" >&2
  echo "Expected dbc-site-live to live at $SOURCE_DIR_RAW (sibling of dbc-resources, under dbc-site/)." >&2
  exit 1
fi

# Resolve to a clean absolute path for display
SOURCE="$(cd "$SOURCE_DIR_RAW" && pwd)/style.css"

cp "$SOURCE" "$DEST"

echo "style.css synced (dbc-site-live -> dbc-resources)"
echo "  source:      $SOURCE"
echo "  destination: $DEST"
echo "  timestamp:   $(date '+%Y-%m-%d %H:%M:%S %Z')"
