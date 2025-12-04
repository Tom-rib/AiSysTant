#!/bin/bash

# Script pour démarrer le serveur Admin Panel
# Usage: ./start-admin.sh

cd "$(dirname "$0")/backend"

echo "🛡️ Démarrage du serveur Admin Panel..."
echo "📡 Port: 3002"
echo "🌐 URL: http://192.168.136.149:3002"
echo ""
echo "Logs: admin-panel.log"
echo "Pour arrêter: pkill -f 'ts-node src/admin-api-server.ts'"
echo ""

ADMIN_PORT=3002 BACKEND_URL=http://localhost:3001 npx ts-node src/admin-api-server.ts
