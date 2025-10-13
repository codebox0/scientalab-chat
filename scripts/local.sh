#!/bin/bash

# Scienta Lab Chat - Local Management Script
# Simple script for local development and testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to show help
show_help() {
    echo "🚀 Scienta Lab Chat - Local Management"
    echo "======================================"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  test       Tester la configuration locale"
    echo "  build      Construire les images Docker localement"
    echo "  up         Démarrer les services localement"
    echo "  down       Arrêter les services locaux"
    echo "  logs       Afficher les logs des services"
    echo "  clean      Nettoyer les conteneurs et images"
    echo "  help       Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 test     # Tester la configuration"
    echo "  $0 build    # Construire les images"
    echo "  $0 up       # Démarrer les services"
}

# Function to test local configuration
test_configuration() {
    log_info "🧪 Test de la configuration locale"
    echo ""
    
    local tests_passed=0
    local tests_total=4
    
    # Test 1: Docker Compose configuration
    log_info "Test 1: Configuration Docker Compose"
    if [ ! -f "docker-compose.yml" ]; then
        log_error "docker-compose.yml not found"
        return 1
    fi
    
    if docker compose config > /dev/null 2>&1; then
        log_success "Configuration Docker Compose valide"
        ((tests_passed++))
    else
        log_error "Configuration Docker Compose invalide"
    fi
    
    # Test 2: Dockerfiles
    log_info "Test 2: Dockerfiles"
    if [ ! -f "chat-app/backend/Dockerfile" ]; then
        log_error "Backend Dockerfile not found"
    elif [ ! -f "chat-app/frontend/Dockerfile" ]; then
        log_error "Frontend Dockerfile not found"
    else
        log_success "Dockerfiles trouvés"
        ((tests_passed++))
    fi
    
    # Test 3: Environment files
    log_info "Test 3: Fichiers d'environnement"
    if [ -f "docker.env" ] || [ -f ".env" ]; then
        log_success "Fichier d'environnement trouvé"
        ((tests_passed++))
    else
        log_warning "Aucun fichier d'environnement trouvé (docker.env ou .env)"
    fi
    
    # Test 4: GitHub Actions workflow
    log_info "Test 4: Workflow GitHub Actions"
    if [ -f ".github/workflows/deploy.yml" ]; then
        log_success "Workflow GitHub Actions trouvé"
        ((tests_passed++))
    else
        log_error "Workflow GitHub Actions manquant"
    fi
    
    echo ""
    log_info "📊 Résultats: $tests_passed/$tests_total tests réussis"
    
    if [ $tests_passed -eq $tests_total ]; then
        log_success "🎉 Tous les tests sont passés !"
        return 0
    else
        log_error "Certains tests ont échoué"
        return 1
    fi
}

# Function to build images locally
build_images() {
    log_info "🔨 Construction des images Docker localement"
    
    # Build backend
    log_info "Construction du backend..."
    docker build -f chat-app/backend/Dockerfile -t scientalab-backend:local .
    
    # Build frontend
    log_info "Construction du frontend..."
    docker build -f chat-app/frontend/Dockerfile -t scientalab-frontend:local .
    
    log_success "Images construites avec succès"
}

# Function to start services locally
start_services() {
    log_info "🚀 Démarrage des services locaux"
    
    # Check if .env file exists
    if [ ! -f ".env" ] && [ ! -f "docker.env" ]; then
        log_warning "Aucun fichier .env trouvé, utilisation des valeurs par défaut"
    fi
    
    # Load environment file if it exists
    if [ -f "docker.env" ]; then
        export $(cat docker.env | grep -v '^#' | xargs)
    elif [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Start services
    docker compose up -d
    
    log_success "Services démarrés"
    echo ""
    echo "🌐 Frontend: http://localhost:3003"
    echo "🔌 API: http://localhost:4001"
}

# Function to stop services
stop_services() {
    log_info "🛑 Arrêt des services locaux"
    docker compose down
    log_success "Services arrêtés"
}

# Function to show logs
show_logs() {
    log_info "📋 Affichage des logs des services"
    docker compose logs -f --tail=50
}

# Function to clean up
clean_up() {
    log_info "🧹 Nettoyage des conteneurs et images"
    docker compose down --volumes --remove-orphans
    docker system prune -f
    log_success "Nettoyage terminé"
}

# Main function
main() {
    local command=${1:-help}
    
    case $command in
        test)
            test_configuration
            ;;
        build)
            build_images
            ;;
        up)
            start_services
            ;;
        down)
            stop_services
            ;;
        logs)
            show_logs
            ;;
        clean)
            clean_up
            ;;
        help)
            show_help
            ;;
        *)
            log_error "Commande inconnue: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
