# Шпаргалка по разработке

Краткая справка по основным командам для работы с проектом.

## 🚀 Быстрый старт

```bash
# Запустить проект
make dev
# или
./dev.sh

# Остановить проект
make stop
# или
./dev-stop.sh
```

## 📋 Основные команды (Makefile)

```bash
make help           # Показать все доступные команды
make dev            # Запустить development режим
make stop           # Остановить все сервисы
make logs           # Показать логи всех сервисов
make restart        # Перезапустить все сервисы
make clean          # Очистить кеши
```

## 🔍 Логи

```bash
# Все сервисы
make logs
docker-compose logs -f

# Конкретный сервис
make logs-backend
make logs-frontend
make logs-bot

# Последние 100 строк
docker-compose logs --tail=100 backend
```

## 🗄 База данных

```bash
# Применить миграции
make db-migrate
docker-compose exec backend alembic upgrade head

# Откатить миграцию
make db-rollback
docker-compose exec backend alembic downgrade -1

# Сбросить БД (удалить все данные!)
make db-reset

# Открыть psql консоль
make db-shell
docker-compose exec postgres psql -U postgres -d wishlist

# Полезные SQL команды
\dt                 # Список таблиц
\d users            # Структура таблицы
SELECT * FROM users;
```

## 🔄 Перезапуск сервисов

```bash
# Все сервисы
make restart

# Конкретный сервис
make restart-backend
make restart-frontend
make restart-bot

# Или через docker-compose
docker-compose restart backend
```

## 🏗 Локальная разработка (без Docker)

### Backend

```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --reload
```

### Frontend

```bash
cd frontend
npm run dev
```

### Bot

```bash
cd bot
source venv/bin/activate
python -m src.main
```

## 🧪 Тестирование

```bash
# Проверка типов TypeScript
make type-check
cd frontend && npm run type-check

# Линтер
make lint
cd frontend && npm run lint

# Статус сервисов
make status
docker-compose ps
```

## 🐛 Отладка

```bash
# Войти в контейнер
make shell-backend
make shell-frontend
make shell-bot

# Или через docker-compose
docker-compose exec backend /bin/sh
```

## 🔧 Production

```bash
# Собрать production версию
make prod-build

# Запустить production
make prod-up

# Остановить production
make prod-down

# Логи production
make prod-logs
```

## 📦 Установка зависимостей

```bash
# Установить все зависимости локально
make install

# Или по отдельности:
cd backend && pip install -r requirements.txt
cd bot && pip install -r requirements.txt
cd frontend && npm install
```

## 🌐 Доступ к сервисам

| Сервис | URL | Описание |
|--------|-----|----------|
| Frontend | http://localhost:5173 | Vue 3 приложение |
| Backend | http://localhost:8000 | FastAPI |
| API Docs | http://localhost:8000/docs | Swagger UI |
| PostgreSQL | localhost:5432 | База данных |

## 🔑 Переменные окружения

```bash
# Создать .env файл
cp .env.example .env

# Отредактировать (нужен TELEGRAM_BOT_TOKEN)
nano .env
```

## 🧹 Очистка

```bash
# Очистить кеши
make clean

# Удалить все контейнеры и volumes
docker-compose down -v

# Пересоздать все с нуля
docker-compose down -v
docker-compose up -d --build
make db-migrate
```

## 🚨 Troubleshooting

### Порт занят

```bash
# Проверить что использует порт
lsof -i :5173
lsof -i :8000

# Убить процесс
kill -9 <PID>
```

### Ошибки с БД

```bash
# Пересоздать БД
docker-compose down -v
docker-compose up -d postgres
sleep 3
make db-migrate
```

### Frontend не обновляется

```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Backend не видит изменения

```bash
# Убедитесь что uvicorn запущен с --reload
docker-compose logs backend | grep reload
```

## 📱 Telegram Mini App тестирование

```bash
# Установить ngrok
brew install ngrok

# Запустить ngrok
ngrok http 5173

# Скопировать URL (например: https://abc123.ngrok-free.app)
# Обновить в .env:
MINIAPP_URL=https://abc123.ngrok-free.app

# Перезапустить бота
make restart-bot
```

## 📚 Git workflow

```bash
# Создать feature branch
git checkout -b feature/my-feature

# Коммит
git add .
git commit -m "feat: add my feature"

# Push
git push origin feature/my-feature

# Создать PR
gh pr create --title "Add my feature" --body "Description"
```

## 💡 Полезные алиасы (добавьте в ~/.bashrc или ~/.zshrc)

```bash
alias dc='docker-compose'
alias dcl='docker-compose logs -f'
alias dce='docker-compose exec'
alias dcr='docker-compose restart'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'

# Использование:
dcl backend          # Логи backend
dce backend /bin/sh  # Shell в backend
dcr frontend         # Перезапуск frontend
```

---

Подробнее: [DEVELOPMENT.md](DEVELOPMENT.md)
