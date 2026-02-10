#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$DIR/multi-rtsp-bitrate"

LOG_DIR="${XDG_STATE_HOME:-$HOME/.local}/multi-rtsp-bitrate"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/multi-rtsp-bitrate-$(date +%F_%H%M%S).log"

echo "=== multi-rtsp-bitrate ==="
echo "App:    $APP"
echo "Log:    $LOG"
echo

if [[ ! -x "$APP" ]]; then
  echo "ERROR: executable not found or not executable:"
  echo "  $APP"
  echo
  read -p "Press Enter to close..."
  exit 1
fi

# 執行主程式，保留參數，log 全收
"$APP" "$@" 2>&1 | tee "$LOG"

EXIT_CODE=${PIPESTATUS[0]}
echo
echo "Exit code: $EXIT_CODE"
echo "Log saved to: $LOG"

read -p "Press Enter to close..."
exit "$EXIT_CODE"

