#!/usr/bin/env bash
set -euo pipefail

# Run on EC2 (or via: ./deploy/deploy.sh ssl)
# Let's Encrypt SSL — requires DOMAIN DNS A record pointing to this server.

DOMAIN="${DOMAIN:-}"
EMAIL="${SSL_EMAIL:-admin@cgfile.in}"
APP_PORT="${APP_PORT:-3000}"
EXTRA_DOMAINS="${EXTRA_DOMAINS:-www.cgfile.in}"

if [ -z "$DOMAIN" ]; then
  echo "ERROR: Set DOMAIN (e.g. cgfile.in) before running SSL setup."
  echo "  DOMAIN=cgfile.in ./deploy/deploy.sh ssl"
  exit 1
fi

echo "==> Installing certbot..."
sudo apt-get update -y
sudo apt-get install -y certbot python3-certbot-nginx

echo "==> Configuring nginx for $DOMAIN..."
sudo tee /etc/nginx/sites-available/newshub >/dev/null <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} ${EXTRA_DOMAINS};

    client_max_body_size 50M;

    location / {
        proxy_pass         http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/newshub /etc/nginx/sites-enabled/newshub
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "==> Requesting Let's Encrypt certificate for $DOMAIN ${EXTRA_DOMAINS}..."
CERTBOT_DOMAINS=(-d "$DOMAIN")
for extra in $EXTRA_DOMAINS; do
  [ -n "$extra" ] && CERTBOT_DOMAINS+=(-d "$extra")
done
sudo certbot --nginx \
  "${CERTBOT_DOMAINS[@]}" \
  --non-interactive \
  --agree-tos \
  -m "$EMAIL" \
  --redirect

echo "==> Testing renewal dry-run..."
sudo certbot renew --dry-run

echo "==> SSL setup complete: https://${DOMAIN}"
