# 🚀 Guide Complet de Lancement et Test

## Phase 1: Préparation (5 minutes)

### Étape 1: Cloner et naviguer
```bash
cd /mnt/c/Users/Tom/Documents/Github/BTP_B2/Chatops-commander
git status
```

### Étape 2: Vérifier les prérequis
```bash
# Vérifier Node.js
node --version  # Doit être 20+

# Vérifier Docker
docker --version
docker-compose --version

# Vérifier npm
npm --version
```

### Étape 3: Créer les fichiers .env
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### Étape 4: Éditer backend/.env (IMPORTANT!)
```bash
# Les valeurs par défaut suffisent pour un test local
# SAUF pour ANTHROPIC_API_KEY - vous devez en avoir une

# Si vous n'avez pas de clé API Anthropic:
# 1. Allez sur https://console.anthropic.com
# 2. Créez une clé API
# 3. Remplacez dans backend/.env:
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Pour les tests sans IA:
# Vous pouvez utiliser une clé fictive (les tests seront limités)
ANTHROPIC_API_KEY=sk-ant-test-key-123
```

---

## Phase 2: Installation (10 minutes)

### Option A: Avec Docker Compose (RECOMMANDÉ - Plus facile)
```bash
# Démarrer tous les services
docker-compose up -d

# Attendre que tous les services soient prêts (30-60 secondes)
sleep 30

# Vérifier que tout est actif
docker-compose ps
```

### Option B: En mode développement local (Besoin de PostgreSQL & Redis local)
```bash
# 1. Démarrer la database seulement
docker-compose up -d postgres redis

# 2. Attendre que postgres soit prêt
sleep 10

# 3. Installer les dépendances
npm install

# 4. Dans un terminal: Backend
cd backend
npm run dev

# 5. Dans un autre terminal: Frontend
cd frontend
npm run dev

# 6. (Optionnel) Dans un 3ème terminal: Admin Panel
cd backend
npm run admin
```

---

## Phase 3: Vérification du Démarrage

### Vérifier Docker Compose (Si utilisé)
```bash
# Voir l'état des services
docker-compose ps

# Les trois containers doivent être "Up":
# - postgres:       Up
# - redis:          Up
# - backend:        Up (après quelques secondes)
```

### Vérifier les Logs
```bash
# Voir les logs du backend
docker-compose logs -f backend

# Voir les logs du frontend (si en dev mode)
# Ctrl+C dans le terminal frontend

# Vous devriez voir quelque chose comme:
# ✅ Database connected
# ✅ Redis connected
# 🚀 Server running on http://localhost:3001
```

### Vérifier les Ports
```bash
# Backend API
curl -s http://localhost:3001/health
# Réponse: {"status":"healthy","timestamp":"..."}

# Frontend (Vite)
curl -s http://localhost:5173 | head -20
# Doit retourner du HTML
```

---

## Phase 4: Tests Fonctionnels

### Test 1: Base de Données
```bash
# Vérifier la connexion PostgreSQL
docker-compose exec postgres psql -U aisystant -d aisystant_db -c "SELECT 1;"
# Réponse: 
#  ?column?
# ----------
#         1
```

### Test 2: Redis
```bash
# Vérifier la connexion Redis
docker-compose exec redis redis-cli ping
# Réponse: PONG
```

### Test 3: API Santé
```bash
# Vérifier que l'API répond
curl -s http://localhost:3001/health | jq .
# Réponse: {"status":"healthy"}
```

### Test 4: Frontend
Ouvrir dans un navigateur:
```
http://localhost:5173
```
Vous devriez voir:
- Page de login ou landing page
- Pas d'erreurs dans la console (F12)

---

## Phase 5: Test Complet (Frontend + Backend)

### Test d'Authentification
```bash
# Créer un nouvel utilisateur via API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'

# Réponse (si succès):
# {"token":"eyJhbGc...","user":{"id":"...","email":"test@example.com",...}}
```

### Test de Chat (Sans IA - mode test)
```bash
# Récupérer le token d'abord
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"Test123!","name":"Test"}' | jq -r '.token')

echo "Token: $TOKEN"

# Envoyer un message de test
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"Hello","conversationId":"test-1"}'

# Réponse:
# {"id":"msg_...","role":"assistant","content":"..."}
```

---

## Phase 6: Test en Interface (Manuel)

### Via le Frontend
1. Ouvrir http://localhost:5173
2. Cliquer sur "Sign Up"
3. Remplir le formulaire:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Name: `Test User`
4. Cliquer "Register"
5. Vous devriez être connecté et voir:
   - Chat interface
   - Terminal
   - Serveurs (vides au début)

### Via cURL (Tests API)
```bash
# Test 1: Health Check
curl http://localhost:3001/health

# Test 2: Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user1@test.com",
    "password":"Pass123!",
    "name":"User 1"
  }'

# Test 3: Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user1@test.com",
    "password":"Pass123!"
  }'

# Test 4: Get Stats (avec token)
TOKEN="your_token_here"
curl http://localhost:3001/api/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Dépannage

### ❌ "Port 5432 already in use"
```bash
# Arrêter les services existants
docker-compose down

# Ou changer le port
docker-compose --project-name test1 up -d
```

### ❌ "Cannot GET /api/health"
```bash
# Le backend n'a peut-être pas démarré
# Vérifier les logs
docker-compose logs backend

# Attendre 30 secondes et réessayer
sleep 30
curl http://localhost:3001/health
```

### ❌ "API Key not found" (Lors du chat)
```bash
# Vous n'avez pas configuré ANTHROPIC_API_KEY
# Éditer backend/.env et ajouter votre clé
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Redémarrer le backend
docker-compose restart backend
```

### ❌ "Frontend shows blank page"
```bash
# 1. Ouvrir F12 (DevTools)
# 2. Vérifier la console pour les erreurs
# 3. Vérifier Network tab
# 4. Si erreur de CORS, redémarrer backend:
docker-compose restart backend
```

### ❌ "Database connection error"
```bash
# Vérifier que postgres est prêt
docker-compose logs postgres

# Attendre et réessayer
sleep 10
docker-compose exec postgres pg_isready -U aisystant
```

---

## Checklist de Vérification

- [ ] Node.js 20+ installé
- [ ] Docker et Docker Compose installés
- [ ] Backend .env créé avec ANTHROPIC_API_KEY
- [ ] Frontend .env créé
- [ ] `docker-compose up -d` exécuté
- [ ] Tous les containers "Up" (`docker-compose ps`)
- [ ] `curl http://localhost:3001/health` répond
- [ ] Frontend accessible à `http://localhost:5173`
- [ ] Créer un compte via frontend fonctionne
- [ ] Envoyer un message de chat fonctionne
- [ ] Pas d'erreurs dans les logs (`docker-compose logs`)

---

## Arrêter l'Application

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (données)
docker-compose down -v

# Redémarrer
docker-compose up -d
```

---

## État Attendu Après Lancement

### Services Actifs
```
CONTAINER ID   IMAGE                    STATUS
abc123...      postgres:15-alpine       Up 2 minutes
def456...      redis:7-alpine           Up 2 minutes
ghi789...      aisystant-backend:...    Up 1 minute
```

### Endpoints Fonctionnels
```
✅ http://localhost:3001/health          → {"status":"healthy"}
✅ http://localhost:5173                  → Frontend UI
✅ http://localhost:3001/api/auth/login   → API endpoint
✅ WebSocket ws://localhost:3001/socket.io
```

### Logs Attendus
```
Backend:
  ✅ Database connected successfully
  ✅ Redis connected
  ✅ Server running on port 3001

Frontend:
  ✅ Vite dev server running at http://localhost:5173
  ✅ ready in XXX ms
```

---

## Prochaines Étapes

Une fois que tout fonctionne:

1. **Tester le Chat**:
   - Envoyer des messages
   - Vérifier les réponses de l'IA

2. **Ajouter des Serveurs SSH** (optionnel):
   - Interface Admin
   - Configurer des serveurs

3. **Tester Terminal SSH** (optionnel):
   - Si serveurs configurés

4. **Merger la branche** (si tout fonctionne):
   - `git checkout main`
   - `git merge improvement/project-enhancement`

