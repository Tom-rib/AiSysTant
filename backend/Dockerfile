# ==========================================
# AiSystant Backend - Dockerfile
# ==========================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm install

# Copier le code source
COPY src ./src

# Compiler TypeScript
RUN npm run build

# ==========================================
# Stage 2: Production
FROM node:20-alpine

# Installer dumb-init pour gérer les signaux
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer SEULEMENT les dépendances de production
RUN npm install --omit=dev

# Copier le code compilé depuis le builder
COPY --from=builder /app/dist ./dist

# Créer le dossier logs
RUN mkdir -p logs && chown -R node:node /app

# Utiliser l'utilisateur non-root
USER node

# Exposer le port
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Utiliser dumb-init comme PID 1
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "dist/server.js"]