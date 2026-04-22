# 🚀 LANCEMENT ET TEST - Mode Développement (Sans Docker)

**Environnement**: WSL2 / Linux  
**Mode**: Développement local avec npm directement

---

## 📋 Configuration Requise

### Prérequis
- ✅ Node.js 20+ (Vérifiez: `node --version`)
- ✅ npm 11+ (Vérifiez: `npm --version`)
- ❌ Docker NON requis (mode dev local)
- ❌ PostgreSQL/Redis NON requis (mode test basique)

### Fichiers .env

**backend/.env** (déjà créé avec défaut)
```bash
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# API Anthropic (IMPORTANT - voir plus bas)
ANTHROPIC_API_KEY=sk-ant-test-key-123

# Autres valeurs par défaut OK
```

**frontend/.env** (déjà créé avec défaut)
```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
NODE_ENV=development
```

---

## ⚡ Lancement Étape par Étape

### Étape 1: Vérifier la Structure du Projet
```bash
cd /mnt/c/Users/Tom/Documents/Github/BTP_B2/Chatops-commander

# Vérifier les répertoires
ls -la backend/ frontend/
```

✅ Attendu:
- `backend/src/` - Source TypeScript
- `frontend/src/` - Source React
- `backend/package.json` - Dépendances backend
- `frontend/package.json` - Dépendances frontend

---

### Étape 2: Installer les Dépendances

```bash
# Terminal 1 - Backend
cd backend
npm install --legacy-peer-deps

# Terminal 2 - Frontend  
cd frontend
npm install --legacy-peer-deps
```

⏱️ Durée: ~3-5 minutes chacun  
✅ Attendu: `added X packages`

---

### Étape 3: Démarrer le Backend

```bash
# Terminal 1 - Backend
cd backend
npm run dev
```

✅ Attendu:
```
Watching for file changes...
[nodemon] restarting due to changes...
🚀 Server running on http://localhost:3001
```

⚠️ Possibles Warnings (NORMAUX):
- `DATABASE_URL not set` → Database sera ignorée
- `REDIS_URL not set` → Redis sera ignoré
- C'est OK en mode test basique !

**Ne fermez PAS ce terminal**

---

### Étape 4: Démarrer le Frontend

```bash
# Terminal 2 - Frontend (dans un AUTRE terminal)
cd frontend
npm run dev
```

✅ Attendu:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Ne fermez PAS ce terminal**

---

## ✅ Tests de Vérification

### Test 1: Vérifier Backend Répond (Terminal 3)

```bash
# Dans un 3ème terminal
curl -s http://localhost:3001/health
```

✅ Réponse attendue:
```json
{"status":"ok"}
```

❌ Si erreur "Connection refused" → backend n'a pas démarré

---

### Test 2: Vérifier Frontend (Navigateur)

Ouvrir: **http://localhost:5173**

✅ Attendu:
- Page d'accueil AiSystant charge
- Pas d'erreur rouge en console
- Peut voir le design Tailwind

❌ Si écran blanc:
```bash
# Ouvrir la console (F12)
# Vérifier les erreurs
# Redémarrer frontend: Ctrl+C puis npm run dev
```

---

### Test 3: Test d'API Basique (Terminal 3)

```bash
# Test de l'endpoint health
curl http://localhost:3001/health

# Test GET sur un endpoint public
curl http://localhost:3001/api/stats
```

✅ Attendu:
```json
{"status":"ok"}
{"data":{...}}
```

---

## 🧪 Test Complet: Authentification

### Test d'Inscription

```bash
# Terminal 3 - Créer un compte
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
```

✅ Réponse attendue:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_xxx",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### Test de Connexion

```bash
# Terminal 3 - Se connecter
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

✅ Réponse attendue:
```json
{
  "token": "eyJhbGc...",
  "user": {...}
}
```

❌ Réponse "Invalid credentials" → mot de passe incorrect

---

## 🎯 Test Manuel dans le Frontend

1. **Ouvrir**: http://localhost:5173

2. **Cliquer** sur "Sign Up" (ou "S'inscrire")

3. **Remplir le formulaire**:
   ```
   Email:    test@localhost.com
   Password: TestPass123!
   Name:     Local Test User
   ```

4. **Cliquer** "Register" / "S'inscrire"

5. **Vérifier**:
   - ✅ Redirigé vers le dashboard
   - ✅ Voir "Welcome, Local Test User"
   - ✅ Voir la page de chat
   - ✅ F12 (Console) = Pas d'erreurs rouges

---

## 🔍 Vérifier les Logs

### Backend Logs

Les logs du backend s'affichent dans Terminal 1:

```bash
# Vous verrez les requêtes API comme:
GET /health
POST /api/auth/register
GET /api/stats
```

### Frontend Logs

Ouvrir F12 dans le navigateur:

```javascript
// Onglet "Console" pour voir:
✓ Requests réussies
✗ Erreurs de réseau
```

---

## 🐛 Dépannage

### ❌ "Cannot find module" lors de npm install

```bash
# Solution
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### ❌ "Port 3001 already in use"

```bash
# Vérifier quel processus utilise le port
lsof -i :3001

# Arrêter:
kill <PID>

# Ou utiliser un autre port:
PORT=3003 npm run dev  # Backend
```

### ❌ "Cannot GET /api/auth/register"

- Backend n'a pas démarré → Vérifier Terminal 1
- Attendre 10 secondes après le démarrage
- Vérifier: `curl http://localhost:3001/health`

### ❌ Frontend affiche écran blanc

```bash
# Dans la console (F12):
# Vérifier les erreurs

# Redémarrer frontend:
# Terminal 2: Ctrl+C
# Puis: npm run dev
```

### ❌ "ANTHROPIC_API_KEY is required"

En mode test basique, vous pouvez ajouter une clé fictive:

```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-test-dummy-key-123
```

La plupart des endpoints de base fonctionne sans clé réelle.

---

## 📊 État du Système Attendu

### Terminals

**Terminal 1 (Backend)**:
```
🚀 Server running on http://localhost:3001
GET /health
POST /api/auth/register
```

**Terminal 2 (Frontend)**:
```
➜  Local:   http://localhost:5173/
✓ Client connected
```

**Terminal 3 (Tests)**:
```bash
curl http://localhost:3001/health
# Répond OK
```

### Navigateur

http://localhost:5173:
```
✓ Page charge
✓ Design visible
✓ No red errors in F12 console
✓ Can sign up and log in
```

---

## ✅ Checklist de Succès

- [ ] Backend démarre: `npm run dev` → "Server running"
- [ ] Frontend démarre: `npm run dev` → "Local: http://localhost:5173"
- [ ] Health check répond: `curl http://localhost:3001/health`
- [ ] Navigateur charge: http://localhost:5173
- [ ] Page n'a pas d'erreurs (F12 console)
- [ ] Peut créer un compte (via curl OU frontend)
- [ ] Peut se connecter
- [ ] Pas d'erreurs TypeScript (backend compile)
- [ ] Logs montrent les requêtes API

**Si tout ✅ → L'APPLICATION MARCHE !**

---

## 🎓 Prochaines Étapes de Test

Si tout fonctionne ci-dessus ✅:

### 1. Test Chat (Besoin d'API Key Anthropic)
```bash
# Récupérer un token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@localhost.com","password":"TestPass123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Envoyer un message (nécessite ANTHROPIC_API_KEY valide)
curl -X POST http://localhost:3001/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","conversationId":"test-1"}'
```

### 2. Test WebSocket
```javascript
// Dans la console du navigateur (F12)
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log('WebSocket connecté!'));
```

### 3. Test Complet du Workflow

Via le frontend à http://localhost:5173:
1. Sign up
2. Log in
3. Voir le chat
4. Voir la page des serveurs
5. Envoyer un message (si API Key)

---

## 🛑 Arrêter l'Application

```bash
# Terminal 1 (Backend): Ctrl+C
# Terminal 2 (Frontend): Ctrl+C

# Vérifier que les ports sont libérés:
lsof -i :3001  # Doit être vide
lsof -i :5173  # Doit être vide
```

---

## 📝 Résumé

```
Étape          Terminal    Commande                Durée   Port
═════════════════════════════════════════════════════════════════
1. Install     1,2         npm install             3-5m    -
2. Backend     1           npm run dev             30s     3001
3. Frontend    2           npm run dev             10s     5173
4. Test        3           curl/browser            instant -
```

**Temps total**: ~10-15 minutes pour avoir une application complètement fonctionnelle !

