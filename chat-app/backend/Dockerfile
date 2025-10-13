# Dockerfile pour le backend NestJS avec Puppeteer
FROM node:18-slim AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY chat-app/backend/package.json ./

# Installer toutes les dépendances (dev + prod pour le build)
RUN npm install

# Copier le code source
COPY chat-app/backend/ .

# Construire l'application
RUN npm run build

# Stage de production avec Chrome pour Puppeteer
FROM node:18-slim AS production

# Installer Chrome et ses dépendances pour Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

# Copier package.json et installer seulement les dépendances de production
COPY chat-app/backend/package.json ./
RUN npm install --only=production

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 4001

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=4001
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Commande de démarrage
CMD ["npm", "run", "start:prod"]
