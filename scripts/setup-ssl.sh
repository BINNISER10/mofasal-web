#!/bin/bash
# ─── MUFASAL SSL Setup Script ──────────────────────────
# شغّل هذا السكربت بعد إعداد DNS
# chmod +x scripts/setup-ssl.sh && ./scripts/setup-ssl.sh

set -e

DOMAIN="mufasal.com"
EMAIL="admin@mufasal.com"

echo "🔐 Setting up SSL for $DOMAIN..."

# Install Certbot
echo "📦 Installing Certbot..."
sudo apt install -y certbot

# Stop Nginx temporarily
echo "⏸️  Stopping Nginx..."
docker compose stop nginx

# Get SSL certificate
echo "📜 Getting SSL certificate..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Copy certificates
echo "📋 Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem docker/certs/$DOMAIN.crt
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem docker/certs/$DOMAIN.key
sudo chown $USER:$USER docker/certs/*

# Update Nginx config for SSL
echo "📝 Updating Nginx config..."
cat > docker/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream web {
        server web:3000;
    }

    upstream api {
        server api:4001;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name mufasal.com www.mufasal.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name mufasal.com www.mufasal.com;

        ssl_certificate /etc/nginx/certs/mufasal.com.crt;
        ssl_certificate_key /etc/nginx/certs/mufasal.com.key;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Frontend
        location / {
            proxy_pass http://web;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API
        location /api/ {
            proxy_pass http://api;
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
}
EOF

# Restart Nginx
echo "🔄 Restarting Nginx..."
docker compose up -d nginx

# Setup auto-renewal
echo "🔄 Setting up auto-renewal..."
sudo crontab -l 2>/dev/null | { cat; echo "0 0 1 * * certbot renew --quiet && docker compose restart nginx"; } | sudo crontab -

echo ""
echo "✅ SSL setup completed!"
echo "🔒 Your site is now available at: https://$DOMAIN"
