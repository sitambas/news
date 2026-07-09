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
  ./deploy/deploy.sh build       Install deps, build, and restart PM2 on EC2
  ./deploy/deploy.sh build-local Build on your Mac, sync .next, prod deps on EC2
  ./deploy/deploy.sh all         sync + env + build
  ./deploy/deploy.sh ssh           Open SSH session to EC2
  ./deploy/deploy.sh ssl           Let's Encrypt SSL (requires DOMAIN DNS → EC2)
  ./deploy/deploy.sh ssl-selfsigned Self-signed SSL for IP (browser warning)

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
    --exclude 'public/uploads' \
    --exclude 'public/uploads/**' \
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

ensure_swap_remote() {
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" bash -s <<'SWAP_CMD'
set -euo pipefail
if [ "$(swapon --show | wc -l)" -eq 0 ]; then
  echo "==> Enabling 2GB swap..."
  if sudo fallocate -l 2G /swapfile 2>/dev/null; then
    :
  else
    sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
  fi
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  fi
fi
free -h
SWAP_CMD
}

restart_pm2_remote() {
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" bash -s <<REMOTE_CMD
set -euo pipefail
cd "$APP_DIR"
mkdir -p public/uploads
if pm2 describe news >/dev/null 2>&1; then
  pm2 restart deploy/ecosystem.config.cjs
else
  pm2 start deploy/ecosystem.config.cjs
fi
pm2 save
REMOTE_CMD
}

run_build() {
  require_key
  echo "==> Building and restarting app on EC2..."
  ensure_swap_remote
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" bash -s <<REMOTE_CMD
set -euo pipefail
cd "$APP_DIR"
export NODE_OPTIONS="--max-old-space-size=768"
npm ci --no-audit --no-fund
npm run build
REMOTE_CMD
  restart_pm2_remote
}

run_build_local() {
  require_key
  echo "==> Building locally (avoids OOM on small EC2)..."
  cd "$PROJECT_ROOT"
  npm ci --no-audit --no-fund
  npm run build

  echo "==> Syncing build output to EC2..."
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "mkdir -p '$APP_DIR'"
  rsync -avz --delete \
    --exclude node_modules \
    --exclude '.next/cache' \
    --exclude .git \
    --exclude keypair \
    --exclude '.env*' \
    --exclude 'public/uploads' \
    --exclude 'public/uploads/**' \
    -e "ssh ${SSH_OPTS[*]}" \
    "$PROJECT_ROOT/" "$REMOTE/"

  echo "==> Installing production dependencies on EC2..."
  ensure_swap_remote
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" bash -s <<REMOTE_CMD
set -euo pipefail
cd "$APP_DIR"
export NODE_OPTIONS="--max-old-space-size=512"
npm ci --omit=dev --no-audit --no-fund
REMOTE_CMD
  restart_pm2_remote
  echo "==> Deploy complete: http://${EC2_HOST}"
}

run_ssh() {
  require_key
  exec ssh "${SSH_OPTS[@]}" "$SSH_TARGET"
}

run_ssl() {
  require_key
  if [ -z "${DOMAIN:-}" ]; then
    echo "ERROR: Set DOMAIN in deploy/config.sh or: DOMAIN=cgfile.in ./deploy/deploy.sh ssl"
    exit 1
  fi
  echo "==> Setting up Let's Encrypt SSL for $DOMAIN on $SSH_TARGET..."
  scp "${SSH_OPTS[@]}" "$SCRIPT_DIR/ssl-setup.sh" "$SSH_TARGET:/tmp/ssl-setup.sh"
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "DOMAIN='$DOMAIN' SSL_EMAIL='$SSL_EMAIL' bash /tmp/ssl-setup.sh"
}

run_ssl_selfsigned() {
  require_key
  echo "==> Setting up self-signed SSL on $SSH_TARGET..."
  scp "${SSH_OPTS[@]}" "$SCRIPT_DIR/ssl-selfsigned.sh" "$SSH_TARGET:/tmp/ssl-selfsigned.sh"
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "bash /tmp/ssl-selfsigned.sh"
  echo "==> HTTPS: https://${EC2_HOST}"
}

case "${1:-}" in
  setup) run_setup ;;
  sync) run_sync ;;
  env) run_env ;;
  build) run_build ;;
  build-local) run_build_local ;;
  all)
    run_sync
    run_env
    run_build
    echo "==> Deploy complete: http://${EC2_HOST}"
    ;;
  ssh) run_ssh ;;
  ssl) run_ssl ;;
  ssl-selfsigned) run_ssl_selfsigned ;;
  *)
    usage
    exit 1
    ;;
esac
