#!/bin/bash

# Admin Panel Server - Port 3000
# Sert le fichier HTML et l'API admin

cd "$(dirname "$0")"

# Servir le fichier HTML sur le port 3000
echo "🚀 Admin Panel Server démarrage..."
echo "📡 URL: http://localhost:3000"

# Simple HTTP server avec Python
python3 -m http.server 3000 --directory admin-panel &
PID=$!

echo "✅ Admin Panel running on port 3000 (PID: $PID)"
wait $PID
