#!/usr/bin/env bash
set -euo pipefail

# Run this script ON the EC2 instance after first SSH login.
# Or from your Mac: ./deploy/deploy.sh setup

APP_DIR="${APP_DIR:-$HOME/news}"
APP_NAME="${APP_NAME:-news}"
NODE_MAJOR="${NODE_MAJOR:-20}"

echo "==> Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo "==> Installing Node.js ${NODE_MAJOR}..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Installing git, nginx, and build tools..."
sudo apt-get install -y git nginx build-essential

echo "==> Installing PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

echo "==> Configuring nginx..."
sudo tee /etc/nginx/sites-available/newshub >/dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/newshub /etc/nginx/sites-enabled/newshub
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "==> Creating app directory..."
mkdir -p "$APP_DIR/public/uploads"

if [ ! -f "$APP_DIR/.env.local" ]; then
  echo "WARNING: $APP_DIR/.env.local not found."
  echo "Copy your .env.local from your Mac before building:"
  echo "  ./deploy/deploy.sh env"
fi

echo "==> Server setup complete."
echo "Next steps:"
echo "  1. ./deploy/deploy.sh sync"
echo "  2. ./deploy/deploy.sh env"
echo "  3. ./deploy/deploy.sh build"
