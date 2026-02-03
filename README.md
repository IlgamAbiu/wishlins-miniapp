# Wishlist - Telegram Mini App

Сервис списков желаний для Telegram.

## Архитектура

```
Telegram Bot (Python) ──► Backend API (FastAPI) ◄── Mini App (Vue 3)
                                   │
                              PostgreSQL
```

## Структура проекта

```
├── backend/          # FastAPI backend
├── bot/              # Telegram bot (aiogram)
├── frontend/         # Vue 3 Mini App
├── scripts/
│   ├── dev/          # Скрипты для разработки
│   └── deploy/       # Скрипты для деплоя
├── docker-compose.yml      # Dev конфигурация
└── docker-compose.prod.yml # Prod конфигурация
```

## Локальная разработка

### Требования
- Docker + Docker Compose
- Node.js 18+ (для frontend без Docker)
- Python 3.12+ (для backend/bot без Docker)
- ngrok (для тестирования Mini App)

### Запуск

```bash
# 1. Создать .env из примера
cp .env.example .env

# 2. Заполнить .env:
#    - TELEGRAM_BOT_TOKEN (от @BotFather)
#    - MINIAPP_URL (ngrok URL)
#    - VITE_BOT_USERNAME (имя бота без @)

# 3. Настроить домен
# В продакшене используется: https://wishlist.splittrip.ru


# 4. Обновить MINIAPP_URL в .env на полученный URL

# 5. Запустить все сервисы
./scripts/dev/dev.sh
```

### Доступные сервисы
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Полезные команды

```bash
# Логи всех сервисов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f frontend|backend|bot

# Перезапуск сервиса
docker-compose restart bot

# Остановка
docker-compose down
```

## Деплой на сервер

### Требования
- Ubuntu 22.04+ / Debian 12+
- Docker + Docker Compose
- Домен с SSL (Let's Encrypt)

### Пошаговая инструкция

```bash
# 1. На сервере: клонировать репозиторий
git clone <repo-url> ~/apps/wishlist
cd ~/apps/wishlist

# 2. Настроить переменные окружения
cp .env.example .env
nano .env
# Указать:
#   TELEGRAM_BOT_TOKEN=токен_бота
#   MINIAPP_URL=https://your-domain.com
#   VITE_BOT_USERNAME=имя_бота
#   POSTGRES_PASSWORD=надежный_пароль

# 3. Запустить приложение
docker compose -f docker-compose.prod.yml up -d --build

# 4. Выполнить миграции БД
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 5. Настроить Nginx + SSL
./scripts/deploy/generate-nginx-config.sh your-domain.com
# Следовать инструкциям в выводе
```

### Обновление на сервере

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather |
| `MINIAPP_URL` | URL Mini App (ngrok для dev, домен для prod) |
| `VITE_BOT_USERNAME` | Username бота без @ |
| `VITE_API_URL` | URL Backend API |
| `POSTGRES_USER` | Пользователь PostgreSQL |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL |
| `POSTGRES_DB` | Имя базы данных |
