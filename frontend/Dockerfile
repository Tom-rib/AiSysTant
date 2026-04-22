# Build stage
FROM node:20-alpine AS builder

# Installer les dépendances nécessaires pour les modules natifs
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (dev incluses) pour le build
RUN npm install

# Copier le reste des fichiers
COPY . .

# Build de l'application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copier la config nginx personnalisée si nécessaire
COPY nginx.conf /etc/nginx/conf.d/

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]