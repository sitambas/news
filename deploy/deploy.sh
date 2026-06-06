#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=config.sh
source "$SCRIPT_DIR/config.sh"

SSH_OPTS=(-i "$KEY_PATH" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
SSH_TARGET="${EC2_USER}@${EC2_HOST}"
REMOTE="${EC2_USER}@${EC2_HOST}:${APP_DIR}"

usage() {
  cat <<EOF
Deploy NewsHub to AWS EC2

Usage:
  ./deploy/deploy.sh setup     Run first-time server setup over SSH
  ./deploy/deploy.sh sync      Sync project files to EC2 (excludes node_modules/.next)
  ./deploy/deploy.sh env       Copy local .env.local to EC2
  ./deploy/deploy.sh build     Install deps, build, and restart PM2 on EC2
  ./deploy/deploy.sh all       sync + env + build
  ./deploy/deploy.sh ssh       Open SSH session to EC2

Environment overrides:
  EC2_HOST, EC2_USER, KEY_PATH, APP_DIR, AWS_REGION

Example:
  EC2_HOST=ec2-xx.eu-north-1.compute.amazonaws.com ./deploy/deploy.sh all
EOF
}

require_key() {
  if [ ! -f "$KEY_PATH" ]; then
    echo "ERROR: SSH key not found at $KEY_PATH"
    exit 1
  fi
  chmod 400 "$KEY_PATH"
}

run_setup() {
  require_key
  echo "==> Running server setup on $SSH_TARGET..."
  scp "${SSH_OPTS[@]}" "$SCRIPT_DIR/server-setup.sh" "$SSH_TARGET:/tmp/server-setup.sh"
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "bash /tmp/server-setup.sh"
}

run_sync() {
  require_key
  echo "==> Syncing project to $REMOTE..."
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "mkdir -p '$APP_DIR'"
  rsync -avz --delete \
    --exclude node_modules \
    --exclude .next \
    --exclude .git \
    --exclude keypair \
    --exclude '.env*' \
    -e "ssh ${SSH_OPTS[*]}" \
    "$PROJECT_ROOT/" "$REMOTE/"
}

run_env() {
  require_key
  if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
    echo "ERROR: $PROJECT_ROOT/.env.local not found. Copy .env.example to .env.local and fill in values."
    exit 1
  fi
  if grep -q 'YOUR_CLUSTER_HOST' "$PROJECT_ROOT/.env.local"; then
    echo "ERROR: Replace YOUR_CLUSTER_HOST in .env.local with your MongoDB Atlas cluster host."
    exit 1
  fi
  echo "==> Copying .env.local to EC2..."
  scp "${SSH_OPTS[@]}" "$PROJECT_ROOT/.env.local" "$SSH_TARGET:$APP_DIR/.env.local"
}

run_build() {
  require_key
  echo "==> Building and restarting app on EC2..."
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" bash -s <<REMOTE_CMD
set -euo pipefail
cd "$APP_DIR"
npm ci
npm run build
mkdir -p public/uploads
if pm2 describe news >/dev/null 2>&1; then
  pm2 restart deploy/ecosystem.config.cjs
else
  pm2 start deploy/ecosystem.config.cjs
fi
pm2 save
REMOTE_CMD
}

run_ssh() {
  require_key
  exec ssh "${SSH_OPTS[@]}" "$SSH_TARGET"
}

case "${1:-}" in
  setup) run_setup ;;
  sync) run_sync ;;
  env) run_env ;;
  build) run_build ;;
  all)
    run_sync
    run_env
    run_build
    echo "==> Deploy complete: http://${EC2_HOST}"
    ;;
  ssh) run_ssh ;;
  *)
    usage
    exit 1
    ;;
esac
