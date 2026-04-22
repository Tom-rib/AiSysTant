# 🤖 AiSystant

<div align="center">

![AiSystant](https://img.shields.io/badge/AiSystant-Infrastructure%20AI-purple?style=for-the-badge)

**Parlez à votre infrastructure en langage naturel avec l'IA**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://docker.com)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet-purple.svg)](https://anthropic.com)

</div>

---

## 🎯 Vue d'ensemble

**AiSystant** est une plateforme moderne de gestion d'infrastructure qui utilise l'**IA générative (Claude Sonnet)** pour convertir le langage naturel en commandes système sécurisées et exécutables.

### Cas d'usage
- 💬 Demander "redémarre nginx sur web-01" → exécution automatique
- 📊 "Affiche l'utilisation CPU de tous les serveurs" → dashboard temps réel
- 🔍 "Cherche les services down" → diagnostic automatique
- 🚀 "Déploie la version 2.0 sur prod" → pipeline de déploiement

---

## ⚡ Démarrage Rapide

### Prérequis
- Node.js 20+
- Docker & Docker Compose
- Clé API Anthropic (Claude)
- SSH access aux serveurs

### Installation rapide

```bash
# Cloner le repo
git clone <repo-url>
cd chatops-commander

# Setup avec make
make install

# Ou manuellement:
cd backend && npm install && cd ../frontend && npm install
```

### Lancer le projet

```bash
# Développement (3 services)
make dev

# Ou individuellement:
cd backend && npm run dev      # API: port 3001
cd frontend && npm run dev     # UI: port 5173
cd backend && npm run admin    # Admin: port 3002
```

**Accès:**
- 🌐 Frontend: `http://localhost:5173`
- 🔌 API: `http://localhost:3001`
- 👨‍💼 Admin: `http://localhost:3002`

### Variables d'environnement

```bash
# backend/.env
ANTHROPIC_API_KEY=sk-xxx
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
SSH_KEY_PATH=/path/to/key

# frontend/.env
VITE_API_URL=http://localhost:3001
```

---

## 📁 Structure du Projet

```
├── frontend/              # Interface React + Vite
│   ├── src/
│   │   ├── pages/        # Pages (Chat, SSH, Admin, Landing)
│   │   ├── components/   # Composants React
│   │   ├── context/      # État global (ChatContext, SSHContext)
│   │   └── services/     # Appels API
│   └── package.json
│
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── server.ts     # Point d'entrée API
│   │   ├── admin-api-server.ts  # API Admin
│   │   ├── routes/       # Endpoints (chat, ssh, admin, stats)
│   │   ├── services/     # Logique métier
│   │   │   ├── AIEngine.ts       # Integration Claude
│   │   │   ├── SSHTerminalService.ts
│   │   │   └── PersistentShell.ts
│   │   ├── controllers/  # Requêtes HTTP
│   │   ├── middleware/   # Auth, logging
│   │   └── config/       # Base de données, migrations
│   └── package.json
│
├── admin-panel/          # Panel d'administration web
├── docs/                 # Documentation
├── docker-compose.yml    # Déploiement Docker
└── Makefile             # Commandes développement

```

---

## 🏗️ Architecture

### Stack Technique

| Couche | Tech |
|--------|------|
| **Frontend** | React 18 + TypeScript + Vite + TailwindCSS |
| **Backend** | Node.js + Express + TypeScript |
| **AI** | Claude Sonnet (Anthropic) |
| **Base de données** | PostgreSQL + TypeORM |
| **SSH** | node-ssh + socket.io |
| **Auth** | JWT + bcrypt |
| **Deploy** | Docker + Docker Compose |

### Flux Principal

```
User Input (Langage naturel)
    ↓
Frontend Chat UI
    ↓ HTTP POST /api/chat
Backend Express Server
    ↓
AIEngine (Claude Sonnet)
    ↓ Parsing d'intention
Security Check → SSH Command
    ↓ Confirmation utilisateur
    ↓
SSHTerminalService (exécution)
    ↓
Résultats en temps réel
    ↓ WebSocket
Frontend Terminal Emulator
```

---

## 🔑 Fonctionnalités Principales

### 💬 Chat Intelligent
- Interface conversationnelle fluide
- Support multilingue (FR/EN)
- Historique persistant
- Mentionner serveurs/commandes

### 🖥️ Terminal Multi-Serveurs
- Onglets SSH multiples
- Exécution parallèle
- Auto-completion
- Historique des commandes

### 🧠 IA Avancée
- Compréhension contextuelle
- Extraction de paramètres
- Évaluation des risques
- Suggestions intelligentes

### 👥 Gestion Multi-Utilisateurs
- Authentification JWT
- Rôles: Admin / Operator / Viewer
- Permissions granulaires
- Audit des actions

### 📊 Dashboard Admin
- Statistiques en temps réel
- Monitoring serveurs
- Gestion des utilisateurs
- Historique des commandes

### 🔒 Sécurité
- Confirmations critiques
- Logs d'audit complets
- Rate limiting
- Validations strictes

---

## 🚀 Développement

### Scripts disponibles

**Backend**
```bash
npm run dev      # Développement avec hot-reload
npm run build    # Compilation TypeScript
npm run start    # Production
npm run admin    # Panel admin sur port 3002
npm run migrate  # Migrations base de données
npm test         # Tests unitaires
```

**Frontend**
```bash
npm run dev      # Vite dev server
npm run build    # Build production
npm run preview  # Preview build
npm run lint     # ESLint
```

### Makefile Commands

```bash
make install     # npm install frontend + backend
make dev         # Lancer tous les services (dev)
make build       # Build frontend + backend
make docker      # Docker build & run
make clean       # Nettoyer node_modules
```

---

## 📚 Documentation

| Document | Contenu |
|----------|---------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Design système détaillé |
| [API.md](docs/API.md) | Endpoints et spécifications |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Déploiement production |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Guide de contribution |
| [SECURITY.md](docs/SECURITY.md) | Modèle de sécurité |

---

## 🔌 Intégrations & Extensions

### APIs Supportées
- SSH/SFTP natif
- Sockets.io (temps réel)
- REST API
- GraphQL (futur)

### Services Intégrables
- Slack / Teams notifications
- Prometheus monitoring
- ELK stack logs
- GitHub Actions CI/CD

---

## 🐛 Troubleshooting

### Port déjà utilisé
```bash
# Changer les ports
BACKEND_PORT=3003 npm run dev
VITE_PORT=5174 npm run dev
```

### Erreur de connexion SSH
```bash
# Vérifier la clé
ssh-add ~/.ssh/id_rsa
# Ou spécifier le chemin
SSH_KEY_PATH=/path/to/key npm run dev
```

### Base de données
```bash
# Migrations
npm run migrate
# Reset DB
npm run migrate -- --reset
```

---

## 🤝 Contribution

1. Fork le repo
2. Créer une branche (`git checkout -b feature/amazing`)
3. Commit (`git commit -m "Add amazing feature"`)
4. Push (`git push origin feature/amazing`)
5. Ouvrir une Pull Request

---

## 📄 License

MIT © 2025 AiSystant Team

---

## 📧 Support

- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/issues)
- 💬 [Discussions](https://github.com/discussions)
- 📧 [Contact](mailto:support@aisystant.dev)

