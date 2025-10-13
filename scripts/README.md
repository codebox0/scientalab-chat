# Scienta Lab Chat - Scripts de Gestion

## 📋 **Scripts disponibles**

### **1. `scripts/local.sh`** - Gestion locale

Script pour le développement et les tests locaux.

```bash
# Tester la configuration
./scripts/local.sh test

# Construire les images Docker
./scripts/local.sh build

# Démarrer les services localement
./scripts/local.sh up

# Arrêter les services
./scripts/local.sh down

# Voir les logs
./scripts/local.sh logs

# Nettoyer
./scripts/local.sh clean
```

### **2. `scripts/deploy-server.sh`** - Déploiement serveur

Script sécurisé qui s'exécute automatiquement sur le serveur via GitHub Actions.

**⚠️ Ne pas exécuter manuellement** - Ce script est appelé automatiquement par le workflow GitHub Actions.

## 🚀 **Déploiement automatique**

Le déploiement se fait automatiquement via GitHub Actions quand vous poussez sur la branche `main` :

1. **Build** des images Docker (backend + frontend)
2. **Push** vers GitHub Container Registry
3. **Deploy** sur le serveur avec `deploy-server.sh`

## 🔧 **Configuration requise**

### **Variables d'environnement locales** (pour `local.sh`)

Créez un fichier `docker.env` ou `.env` avec :

```bash
OPENAI_API_KEY=your-openai-api-key
BIOMCP_URL=https://biomcp-server-452652483423.europe-west4.run.app
BIO_MCP_SSE_PATH=/sse
```

### **Secrets GitHub** (pour le déploiement automatique)

Configurez ces secrets dans votre repository GitHub :

- `SSH_KEY` - Clé SSH privée
- `SSH_HOST` - Adresse du serveur
- `SSH_USERNAME` - Utilisateur SSH
- `GHCR_PAT` - Token GitHub Container Registry
- `GH_USERNAME` - Nom d'utilisateur GitHub
- `OPENAI_API_KEY` - Clé API OpenAI
- `BIOMCP_URL` - URL du serveur BioMCP
- `BIO_MCP_SSE_PATH` - Chemin SSE BioMCP

## 🌐 **URLs**

### **Production**

- **Frontend** : https://scientalab.coulibalymamadou.com
- **API** : https://api.scientalab.coulibalymamadou.com

### **Local (développement)**

- **Frontend** : http://localhost:3003
- **API** : http://localhost:4001

## 🔒 **Sécurité**

- Le fichier `.env` est créé temporairement sur le serveur et supprimé après déploiement
- Permissions sécurisées (`chmod 600`) sur le fichier `.env`
- Variables d'environnement passées directement au script sans persistance
