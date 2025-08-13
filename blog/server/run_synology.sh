cat > /volume1/web/blog/server/run_synology.sh <<'EOF'
#!/bin/bash
set -euo pipefail
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
LOG_DIR="/volume1/logs"
mkdir -p "$LOG_DIR"

# =========== (옵션) 환경변수 ===========
export DB_HOST="localhost"
export DB_USER="blog_user"
export DB_PASSWORD="jIrzur-9xoski-puxtag"
export DB_NAME="blog_db"
export BASE_URL="https://orange-man.xyz"

# =========== Python 경로 탐색 ===========
PY="/usr/local/bin/python3"
if [ ! -x "$PY" ]; then
  PY="$(command -v python3 || true)"
fi
if [ -z "${PY:-}" ]; then
  echo "ERROR: python3 not found. Check Python installation." >&2
  exit 1
fi

# =========== Requirements 설치 (최초/변경 시만) ===========
REQ_FILE="$SCRIPT_DIR/requirements.txt"
REQ_STAMP="$SCRIPT_DIR/.deps_installed.stamp"
if [ -f "$REQ_FILE" ]; then
  if [ ! -f "$REQ_STAMP" ] || [ "$REQ_FILE" -nt "$REQ_STAMP" ]; then
    echo "Installing/updating Python dependencies from $REQ_FILE ..."
    "$PY" -m pip install --upgrade pip
    "$PY" -m pip install -r "$REQ_FILE"
    touch "$REQ_STAMP"
    echo "Dependencies installed."
  else
    echo "Dependencies up-to-date (stamp: $REQ_STAMP)."
  fi
else
  echo "requirements.txt not found; skipping dependency installation"
fi

echo "================================================"
echo "Starting Flask server on port 5501..."
echo "PWD: $(pwd)"
echo "Python: $($PY --version 2>&1)"
echo "================================================"

# =========== 앱 실행 ===========
exec "$PY" -u app.py
EOF

chmod +x /volume1/web/blog/server/run_synology.sh
