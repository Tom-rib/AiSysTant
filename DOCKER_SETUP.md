# 🐳 GUIDE: Activer Docker sur WSL2 et Lancer l'Application Complète

## Le Problème

Docker est installé sur Windows mais **pas accessible depuis WSL2**.  
L'application a besoin de:
- PostgreSQL (base de données)
- Redis (cache)
- Backend + Frontend

Sans Docker, vous ne pouvez tester que partiellement.

---

## ✅ Solution: Activer Docker WSL2 Integration

### Étape 1: Ouvrir Docker Desktop Settings

1. Ouvrir **Docker Desktop** (sur Windows)
2. Cliquer sur l'icône en haut à droite (☰ menu)
3. Cliquer sur **"Settings"**

### Étape 2: Activer WSL2 Integration

1. Dans le menu gauche, aller à: **Resources** → **WSL Integration**
2. Activer le toggle: **"Enable integration with my default WSL distro"**
3. (Optionnel) Cocher aussi le distro WSL spécifique (Debian, Ubuntu, etc.)
4. Cliquer **"Apply & Restart"**

### Étape 3: Patienter 1-2 minutes

Docker Desktop redémarre avec la support WSL2.

### Étape 4: Vérifier dans WSL

```bash
# Dans le terminal WSL, tester:
docker --version

# Résultat attendu:
# Docker version 27.x.x, build xxxxx
```

✅ Si ça marche, continue !

---

## 🚀 Lancer l'Application Complète

Maintenant que Docker fonctionne:

### Étape 1: Démarrer les Services (Docker)

```bash
cd /mnt/c/Users/Tom/Documents/Github/BTP_B2/Chatops-commander

# Démarrer tous les services
docker-compose up -d

# Vérifier que tout démarre
docker-compose ps

# Attendu:
# STATUS: Up (pour tous les services)
```

⏱️ Durée: ~2 minutes (première fois: télécharge les images)

### Étape 2: Attendre que PostgreSQL soit Prêt

```bash
# Vérifier les logs
docker-compose logs postgres

# Attendre le message:
# "ready to accept connections"
```

### Étape 3: Vérifier l'Accès

```bash
# Backend API
curl http://localhost:3001/health

# Réponse attendue:
# {"status":"ok","timestamp":"..."}

# Frontend
curl http://localhost:3000

# Doit retourner du HTML
```

### Étape 4: Ouvrir dans le Navigateur

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Adminer (optionnel)**: http://localhost:8080 (DB web UI)

---

## 📋 Services Disponibles

| Service | URL | Port | Status |
|---------|-----|------|--------|
| Frontend | http://localhost:3000 | 3000 | ✅ Nginx |
| Backend API | http://localhost:3001 | 3001 | ✅ Express |
| PostgreSQL | localhost:5432 | 5432 | ✅ Internal |
| Redis | localhost:6379 | 6379 | ✅ Internal |

---

## 🧪 Test Complet (Avec Database)

### Test 1: Créer un Compte

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@docker.com",
    "password": "TestPass123!",
    "name": "Docker Test"
  }'

# Réponse attendue:
# {"success":true,"token":"eyJ...","user":{...}}
```

### Test 2: Se Connecter

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@docker.com",
    "password": "TestPass123!"
  }'

# Réponse:
# {"success":true,"token":"eyJ..."}
```

### Test 3: Via le Frontend

1. Ouvrir http://localhost:3000
2. Cliquer "Sign Up"
3. Remplir le formulaire
4. Se connecter
5. Voir le chat fonctionnel!

---

## 🛠️ Commandes Utiles

### Démarrer

```bash
# Démarrer tous les services
docker-compose up -d

# Démarrer et voir les logs
docker-compose up
```

### Arrêter

```bash
# Arrêter tous les services
docker-compose down

# Arrêter ET supprimer les données
docker-compose down -v
```

### Logs

```bash
# Voir tous les logs
docker-compose logs

# Voir les logs du backend
docker-compose logs -f backend

# Voir les logs de PostgreSQL
docker-compose logs -f postgres
```

### Base de Données

```bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U aisystant -d aisystant_db

# Voir les tables
\dt

# Quitter
\q
```

### Redémarrer

```bash
# Redémarrer un service
docker-compose restart backend

# Redémarrer tous
docker-compose restart
```

---

## ❌ Dépannage

### ❌ "Docker not found in WSL"

**Solution**: Vous n'avez pas activé la WSL2 integration.  
→ Voir section "Activer Docker WSL2 Integration" ci-dessus

### ❌ "Cannot connect to Docker daemon"

**Cause**: Docker Desktop n'est pas en train de tourner  
**Solution**: 
```bash
# Ouvrir Docker Desktop sur Windows
# Ou relancer: net stop docker & net start docker (admin)
```

### ❌ "Port 3000 already in use"

```bash
# Voir quel processus utilise le port
lsof -i :3000

# Ou via Docker si en conflit:
docker-compose down
```

### ❌ "cannot connect to PostgreSQL"

```bash
# Vérifier que postgres est ready
docker-compose ps postgres
docker-compose logs postgres

# Attendre le message "ready to accept connections"
```

### ❌ "ECONNREFUSED on port 3001"

```bash
# Le backend n'a pas démarré. Vérifier:
docker-compose logs backend

# Redémarrer:
docker-compose restart backend
```

---

## 📊 Architecture Complète (Avec Docker)

```
┌─────────────────────────────────────┐
│   Docker Compose (3 services)       │
├─────────────────────────────────────┤
│ frontend:3000                       │
│   ├─ React + Vite                   │
│   └─ nginx container                │
│                                     │
│ backend:3001                        │
│   ├─ Node.js + Express              │
│   ├─ Claude AI integration          │
│   └─ SSH management                 │
│                                     │
│ postgres:5432                       │
│   ├─ PostgreSQL 15                  │
│   ├─ Database: aisystant_db         │
│   └─ User: aisystant                │
│                                     │
│ redis:6379                          │
│   ├─ Redis 7                        │
│   └─ Cache & Sessions               │
└─────────────────────────────────────┘
```

---

## ✅ Checklist Après Activation

- [ ] Docker Desktop running sur Windows
- [ ] WSL2 Integration activée
- [ ] `docker --version` fonctionne dans WSL
- [ ] `docker-compose up -d` démarre tous les services
- [ ] `docker-compose ps` montre tous "Up"
- [ ] `curl http://localhost:3001/health` répond
- [ ] http://localhost:3000 se charge
- [ ] Créer un compte fonctionne
- [ ] Login fonctionne
- [ ] Chat page accessible

---

## 🚀 Prochaines Étapes

Une fois Docker activé et tout fonctionne:

1. **Tester le chat**: Envoyer un message (avec ANTHROPIC_API_KEY)
2. **Ajouter des serveurs**: Configuration dans admin
3. **Terminal SSH**: Si serveurs configurés
4. **Explorer l'app**: Tous les features en action

---

## 📝 Notes Importantes

- **Docker Desktop sur Windows**: Requiert WSL2 (pas compatible avec Hyper-V seul)
- **Performance**: WSL2 + Docker c'est lent sur HDD, rapide sur SSD
- **Volumes**: Les fichiers PostgreSQL/Redis sont dans `./postgres_data` et `./redis_data`
- **Réseau**: Les containers communiquent via `aisystant-network`

---

## 🆘 Besoin d'Aide?

Si Docker reste inaccessible:
1. Vérifier Docker Desktop est installé sur Windows
2. Vérifier Windows Subsystem for Linux 2 est activé
3. Vérifier la version de Docker (27+ recommandé)
4. Relancer Docker Desktop
5. Redémarrer WSL: `wsl --shutdown` puis réouvrir terminal

