#!/usr/bin/env bash
set -euo pipefail

# Run on EC2 (or via: ./deploy/deploy.sh ssl-selfsigned)
# Self-signed SSL for IP access — browsers will show a security warning.

APP_PORT="${APP_PORT:-3000}"
CN="${SSL_CN:-13.215.161.54}"

CERT_DIR="/etc/ssl/newshub"
sudo mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/selfsigned.crt" ]; then
  echo "==> Generating self-signed certificate for CN=$CN..."
  sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/selfsigned.key" \
    -out "$CERT_DIR/selfsigned.crt" \
    -subj "/CN=${CN}/O=NewsHub/C=IN"
  sudo chmod 600 "$CERT_DIR/selfsigned.key"
fi

echo "==> Configuring nginx with HTTPS..."
sudo tee /etc/nginx/sites-available/newshub >/dev/null <<NGINX
server {
    listen 80;
    server_name _;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate     ${CERT_DIR}/selfsigned.crt;
    ssl_certificate_key ${CERT_DIR}/selfsigned.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    client_max_body_size 50M;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

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

        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/newshub /etc/nginx/sites-enabled/newshub
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "==> Self-signed SSL active: https://${CN}"
echo "    Browsers will show a warning — click Advanced → Proceed."
echo "    For trusted SSL, point a domain to this server and run: DOMAIN=your.domain ./deploy/deploy.sh ssl"
