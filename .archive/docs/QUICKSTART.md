# 🚀 Quick Start - AiSystant

Guide de démarrage rapide pour faire tourner AiSystant en moins de 5 minutes.

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Docker & Docker Compose installés
- ✅ Node.js 18+ (optionnel, pour développement local)
- ✅ Une clé API Anthropic ([obtenir ici](https://console.anthropic.com/))
- ✅ Git installé

## Installation rapide avec Docker (Recommandé)

### Étape 1 : Cloner le repository

```bash
git clone https://github.com/votre-username/aisystant.git
cd aisystant
```

### Étape 2 : Configuration de l'environnement

```bash
# Créer le fichier .env
make setup-env

# OU manuellement :
cp .env.example .env
```

**Éditer le fichier `.env` :**

```bash
nano .env  # ou vim, code, etc.
```

**Variables OBLIGATOIRES à remplir :**

```env
# Votre clé API Anthropic (OBLIGATOIRE)
ANTHROPIC_API_KEY=sk-ant-votre-cle-ici

# Secrets JWT (générer avec la commande ci-dessous)
JWT_SECRET=votre_secret_jwt
REFRESH_SECRET=votre_secret_refresh
ENCRYPTION_KEY=votre_cle_chiffrement

# Mot de passe base de données
DB_PASSWORD=un_mot_de_passe_securise
```

**Générer les secrets :**

```bash
# Pour JWT_SECRET et REFRESH_SECRET (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Pour ENCRYPTION_KEY (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Étape 3 : Lancer l'application

```bash
# Build et start
make build
make start

# OU en une commande
docker-compose up --build -d
```

### Étape 4 : Vérifier que tout fonctionne

```bash
# Vérifier les logs
make logs

# Ou vérifier la santé
make health
```

**L'application est accessible sur :**
- 🌐 Frontend : http://localhost:3000
- 🔧 Backend API : http://localhost:3001

### Étape 5 : Créer votre premier compte

1. Ouvrez http://localhost:3000
2. Cliquez sur "S'inscrire"
3. Créez votre compte admin
4. Connectez-vous

### Étape 6 : Ajouter votre premier serveur

Dans le chat, tapez :
```
Aide
```

Puis suivez les instructions pour ajouter un serveur.

## Installation locale (Développement)

Si vous préférez développer sans Docker :

### Étape 1 : Prérequis locaux

```bash
# PostgreSQL
brew install postgresql@15  # macOS
# ou
sudo apt install postgresql-15  # Linux

# Redis
brew install redis  # macOS
# ou
sudo apt install redis-server  # Linux
```

### Étape 2 : Démarrer les services

```bash
# PostgreSQL
brew services start postgresql@15  # macOS
# ou
sudo systemctl start postgresql  # Linux

# Redis
brew services start redis  # macOS
# ou
sudo systemctl start redis  # Linux
```

### Étape 3 : Créer la base de données

```bash
createdb aisystant
psql aisystant < backend/init.sql
```

### Étape 4 : Installer les dépendances

```bash
make install

# OU manuellement :
cd backend && npm install
cd ../frontend && npm install
```

### Étape 5 : Configuration

Créer `.env` comme expliqué plus haut, mais avec :

```env
DB_HOST=localhost
REDIS_URL=redis://localhost:6379
```

### Étape 6 : Lancer en mode dev

```bash
make dev

# OU manuellement dans 2 terminaux :
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

## Commandes utiles

```bash
# Voir les logs en temps réel
make logs-follow

# Arrêter les services
make stop

# Redémarrer
make restart

# Nettoyer complètement
make clean

# Lancer les tests
make test

# Backup de la base de données
make backup

# Voir l'aide complète
make help
```

## Résolution de problèmes

### Le backend ne démarre pas

**Vérifier les logs :**
```bash
make logs-backend
```

**Problèmes courants :**
- ❌ `ANTHROPIC_API_KEY` non définie
  - ✅ Vérifier le fichier `.env`
- ❌ Connexion à la base de données échoue
  - ✅ Vérifier que PostgreSQL est démarré
  - ✅ Vérifier `DATABASE_URL` dans `.env`

### Le frontend ne charge pas

**Vérifier les logs :**
```bash
make logs-frontend
```

**Problèmes courants :**
- ❌ CORS errors
  - ✅ Vérifier `FRONTEND_URL` et `CORS_ORIGIN` dans `.env`
- ❌ Can't connect to backend
  - ✅ Vérifier que le backend tourne sur le bon port

### Port déjà utilisé

Si un port (3000, 3001, 5432, 6379) est déjà utilisé :

```bash
# Trouver le processus
lsof -i :3000  # remplacer 3000 par le port concerné

# Tuer le processus
kill -9 <PID>
```

Ou modifier les ports dans `docker-compose.yml` et `.env`.

### Effacer et recommencer

```bash
# Tout nettoyer
make clean

# Supprimer les volumes Docker
docker-compose down -v

# Rebuilder from scratch
make build
make start
```

## Configuration avancée

### Ajouter un serveur SSH

Dans l'interface, allez dans "Paramètres" > "Serveurs" > "Ajouter"

Ou via le chat :
```
Ajoute un serveur nommé web-01 avec IP 192.168.1.10
```

### Configurer les notifications

Éditer `.env` :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASSWORD=votre_mot_de_passe_app
```

### Activer le monitoring

```env
SENTRY_DSN=https://votre-dsn@sentry.io/projet
```

## Prochaines étapes

1. **Lire la documentation** : [README.md](README.md)
2. **Explorer les commandes** : Tapez "Aide" dans le chat
3. **Ajouter vos serveurs** : Configurez votre infrastructure
4. **Tester les features** : Essayez les différentes commandes
5. **Consulter AGENTS.md** : Comprendre comment l'IA est utilisée

## Support

- 📖 Documentation : [README.md](README.md)
- 🐛 Bug reports : [GitHub Issues](https://github.com/votre-username/aisystant/issues)
- 💬 Questions : [Discord](https://discord.gg/aisystant)

---

**Besoin d'aide ?** Consultez les fichiers :
- `AGENTS.md` - Usage de l'IA
- `conception.md` - Architecture détaillée
- `benchmarks.md` - Comparaison des outils IA

---

**Bon démarrage avec AiSystant ! 🚀**