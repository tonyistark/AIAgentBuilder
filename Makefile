.PHONY: help setup run clean install-backend install-frontend dev-backend dev-frontend dev stop

# Default target
.DEFAULT_GOAL := help

# Colors
GREEN := \033[0;32m
BLUE := \033[0;34m
RED := \033[0;31m
NC := \033[0m

help: ## Show this help message
	@echo '${BLUE}LangFlow Clone - Available Commands${NC}'
	@echo ''
	@echo 'Usage:'
	@echo '  make ${GREEN}<target>${NC}'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  ${GREEN}%-15s${NC} %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Complete setup - install all dependencies and create config files
	@echo '${BLUE}Running complete setup...${NC}'
	@./setup.sh

install-backend: ## Install backend dependencies
	@echo '${BLUE}Installing backend dependencies...${NC}'
	@cd backend && poetry install

install-frontend: ## Install frontend dependencies
	@echo '${BLUE}Installing frontend dependencies...${NC}'
	@cd frontend && npm install

install: install-backend install-frontend ## Install all dependencies

dev-backend: ## Run backend in development mode
	@echo '${BLUE}Starting backend...${NC}'
	@cd backend && poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Run frontend in development mode
	@echo '${BLUE}Starting frontend...${NC}'
	@cd frontend && npm run dev

dev: ## Run both frontend and backend in development mode
	@echo '${BLUE}Starting LangFlow Clone...${NC}'
	@./run.sh

run: dev ## Alias for 'make dev'

build-frontend: ## Build frontend for production
	@echo '${BLUE}Building frontend...${NC}'
	@cd frontend && npm run build

test-backend: ## Run backend tests
	@echo '${BLUE}Running backend tests...${NC}'
	@cd backend && poetry run pytest

test-frontend: ## Run frontend tests
	@echo '${BLUE}Running frontend tests...${NC}'
	@cd frontend && npm test

test: test-backend test-frontend ## Run all tests

lint-backend: ## Lint backend code
	@echo '${BLUE}Linting backend...${NC}'
	@cd backend && poetry run black . && poetry run isort . && poetry run flake8

lint-frontend: ## Lint frontend code
	@echo '${BLUE}Linting frontend...${NC}'
	@cd frontend && npm run lint

lint: lint-backend lint-frontend ## Lint all code

clean: ## Clean up generated files and caches
	@echo '${RED}Cleaning up...${NC}'
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "build" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type f -name ".DS_Store" -delete 2>/dev/null || true
	@rm -f backend/langflow.db 2>/dev/null || true
	@echo '${GREEN}Cleanup complete${NC}'

reset: clean ## Complete reset - remove all dependencies and generated files
	@echo '${RED}Resetting project...${NC}'
	@rm -rf backend/.venv 2>/dev/null || true
	@rm -rf frontend/package-lock.json 2>/dev/null || true
	@rm -rf backend/poetry.lock 2>/dev/null || true
	@echo '${GREEN}Reset complete. Run "make setup" to start fresh.${NC}'

docker-build: ## Build Docker containers
	@echo '${BLUE}Building Docker containers...${NC}'
	@docker-compose build

docker-up: ## Start Docker containers
	@echo '${BLUE}Starting Docker containers...${NC}'
	@docker-compose up -d

docker-down: ## Stop Docker containers
	@echo '${BLUE}Stopping Docker containers...${NC}'
	@docker-compose down

docker-logs: ## View Docker container logs
	@docker-compose logs -f

stop: ## Stop all running services
	@echo '${RED}Stopping all services...${NC}'
	@pkill -f "uvicorn app.main:app" || true
	@pkill -f "npm run dev" || true
	@pkill -f "vite" || true
	@echo '${GREEN}All services stopped${NC}'
