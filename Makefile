.PHONY: help dev stop logs restart clean db-migrate db-reset install test

# Цвета для вывода
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

help: ## Показать эту справку
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} { \
		if (/^[a-zA-Z_-]+:.*?##.*$$/) {printf "  ${YELLOW}%-15s${GREEN}%s${RESET}\n", $$1, $$2} \
		else if (/^## .*$$/) {printf "  ${YELLOW}%s${RESET}\n", substr($$1,4)} \
		}' $(MAKEFILE_LIST)

## Development

dev: ## Запустить все сервисы в development режиме
	@./scripts/dev/dev.sh

stop: ## Остановить все сервисы
	@./scripts/dev/dev-stop.sh

logs: ## Показать логи всех сервисов
	@docker-compose logs -f

logs-backend: ## Показать логи backend
	@docker-compose logs -f backend

logs-frontend: ## Показать логи frontend
	@docker-compose logs -f frontend

logs-bot: ## Показать логи bot
	@docker-compose logs -f bot

restart: ## Перезапустить все сервисы
	@docker-compose restart

restart-backend: ## Перезапустить backend
	@docker-compose restart backend

restart-frontend: ## Перезапустить frontend
	@docker-compose restart frontend

restart-bot: ## Перезапустить bot
	@docker-compose restart bot

## Database

db-migrate: ## Применить миграции БД
	@docker-compose exec backend alembic upgrade head

db-rollback: ## Откатить последнюю миграцию
	@docker-compose exec backend alembic downgrade -1

db-reset: ## Сбросить БД (удалить все данные!)
	@docker-compose down -v
	@docker-compose up -d postgres
	@sleep 3
	@docker-compose exec backend alembic upgrade head
	@echo "${GREEN}База данных сброшена${RESET}"

db-shell: ## Открыть psql консоль
	@docker-compose exec postgres psql -U postgres -d wishlist

## Installation & Setup

install: ## Установить все зависимости локально
	@echo "${YELLOW}Installing backend dependencies...${RESET}"
	@cd backend && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	@echo "${YELLOW}Installing bot dependencies...${RESET}"
	@cd bot && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	@echo "${YELLOW}Installing frontend dependencies...${RESET}"
	@cd frontend && npm install
	@echo "${GREEN}All dependencies installed${RESET}"

clean: ## Очистить кеши и временные файлы
	@echo "${YELLOW}Cleaning up...${RESET}"
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@rm -rf frontend/node_modules/.vite 2>/dev/null || true
	@echo "${GREEN}Cleanup complete${RESET}"

## Production

prod-build: ## Собрать production версию
	@docker-compose -f docker-compose.prod.yml build

prod-up: ## Запустить production версию
	@docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Остановить production версию
	@docker-compose -f docker-compose.prod.yml down

prod-logs: ## Логи production
	@docker-compose -f docker-compose.prod.yml logs -f

## Testing & Development Tools

shell-backend: ## Открыть shell в backend контейнере
	@docker-compose exec backend /bin/sh

shell-frontend: ## Открыть shell в frontend контейнере
	@docker-compose exec frontend /bin/sh

shell-bot: ## Открыть shell в bot контейнере
	@docker-compose exec bot /bin/sh

type-check: ## Проверка типов TypeScript
	@cd frontend && npm run type-check

lint: ## Запустить линтер для frontend
	@cd frontend && npm run lint

status: ## Показать статус всех сервисов
	@docker-compose ps
