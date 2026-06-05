#!/bin/bash
# ─── MUFASAL Server Setup Script ────────────────────────
# شغّل هذا السكربت مرة واحدة على السيرفر الجديد
# chmod +x scripts/setup-server.sh && ./scripts/setup-server.sh

set -e

echo "🚀 Setting up MUFASAL server..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    sudo apt install -y docker-compose-plugin
fi

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p /opt/mufasal
sudo chown $USER:$USER /opt/mufasal

# Clone repository
echo "📥 Cloning repository..."
cd /opt/mufasal
if [ ! -d ".git" ]; then
    git clone https://github.com/BINNISER10/mufasal-web.git .
fi

# Create .env from template
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.production.example .env
    echo "⚠️  Please edit .env file with your actual values!"
    echo "   nano /opt/mufasal/.env"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p docker/certs
mkdir -p uploads

# Start services
echo "🚀 Starting services..."
docker compose -f docker-compose.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Show status
echo "📊 Service status:"
docker compose ps

echo ""
echo "✅ MUFASAL server setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano /opt/mufasal/.env"
echo "2. Setup SSL: See scripts/setup-ssl.sh"
echo "3. Configure DNS: Point mufasal.com to this server IP"
echo ""
echo "Access the application at: http://$(hostname -I | awk '{print $1}')"
