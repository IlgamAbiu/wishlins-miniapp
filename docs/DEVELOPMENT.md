# Руководство по локальной разработке

Это руководство поможет вам настроить проект для локальной разработки и изменения фич.

## 🚀 Быстрый старт (Docker)

Самый простой способ запустить все сервисы с hot reload:

```bash
./dev.sh
```

Этот скрипт:
- ✅ Запускает все сервисы через Docker Compose
- ✅ Настраивает базу данных и миграции
- ✅ Включает hot reload для всех компонентов
- ✅ Показывает логи всех сервисов

### Доступные сервисы

После запуска доступны:

| Сервис | URL | Описание |
|--------|-----|----------|
| Frontend | http://localhost:5173 | Vue 3 приложение с Vite HMR |
| Backend API | http://localhost:8000 | FastAPI с auto-reload |
| API Docs | http://localhost:8000/docs | Swagger UI документация |
| PostgreSQL | localhost:5432 | База данных |

### Вспомогательные скрипты

```bash
# Остановить все сервисы
./dev-stop.sh

# Просмотр логов всех сервисов
./dev-logs.sh

# Просмотр логов конкретного сервиса
./dev-logs.sh frontend
./dev-logs.sh backend
./dev-logs.sh bot

# Перезапуск сервиса
./dev-restart.sh frontend
./dev-restart.sh backend
./dev-restart.sh bot
```

---

## 🛠 Разработка без Docker

Если вы хотите запускать отдельные компоненты локально без Docker (например, для отладки в IDE).

### Предварительные требования

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+

### 1. База данных

Запустите PostgreSQL (можно через Docker или локально):

```bash
# Вариант 1: Только PostgreSQL через Docker
docker run -d \
  --name wishlist-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wishlist \
  -p 5432:5432 \
  postgres:16-alpine

# Вариант 2: Локальная установка PostgreSQL
# Создайте базу данных:
createdb wishlist
```

### 2. Backend API

```bash
cd backend

# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate  # macOS/Linux
# или: venv\Scripts\activate  # Windows

# Установить зависимости
pip install -r requirements.txt

# Создать .env файл
cp .env.example .env

# Отредактировать .env (если нужно)
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/wishlist
# DEBUG=true

# Запустить миграции
alembic upgrade head

# Запустить сервер с auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend будет доступен на http://localhost:8000

#### Полезные команды

```bash
# Создать новую миграцию
alembic revision --autogenerate -m "описание изменений"

# Применить миграции
alembic upgrade head

# Откатить последнюю миграцию
alembic downgrade -1

# Посмотреть текущую версию БД
alembic current

# История миграций
alembic history
```

### 3. Frontend (Vue 3)

```bash
cd frontend

# Установить зависимости
npm install

# Создать .env файл
cp .env.example .env

# Отредактировать .env (если нужно)
# VITE_API_URL=http://localhost:8000/api/v1

# Запустить dev сервер
npm run dev
```

Frontend будет доступен на http://localhost:5173

#### Полезные команды

```bash
# Запустить dev сервер
npm run dev

# Проверка типов TypeScript
npm run type-check

# Lint и автофикс
npm run lint

# Production build
npm run build

# Просмотр production build
npm run preview
```

### 4. Telegram Bot

```bash
cd bot

# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Создать .env файл
cp .env.example .env

# ВАЖНО: Добавить токен бота в .env
# TELEGRAM_BOT_TOKEN=your_token_from_botfather
# MINIAPP_URL=http://localhost:5173
# BACKEND_API_URL=http://localhost:8000

# Запустить бота
python -m src.main
```

---

## 📝 Типичные сценарии разработки

### Разработка фронтенда

Если вы работаете только с фронтендом:

```bash
# Запустить только backend и DB через Docker
docker-compose up -d postgres backend

# Запустить frontend локально
cd frontend
npm run dev
```

Преимущества:
- ⚡ Быстрый hot reload
- 🔧 Удобная отладка в браузере
- 📝 Лучшая работа с Vue DevTools

### Разработка бэкенда

Если вы работаете только с бэкендом:

```bash
# Запустить только DB через Docker
docker-compose up -d postgres

# Запустить backend локально
cd backend
source venv/bin/activate
uvicorn src.main:app --reload
```

Преимущества:
- 🐛 Удобная отладка в IDE (PyCharm, VS Code)
- ⚡ Быстрый перезапуск
- 📊 Прямой доступ к логам

### Разработка бота

Если вы работаете с ботом:

```bash
# Запустить backend и DB через Docker
docker-compose up -d postgres backend

# Запустить бота локально
cd bot
source venv/bin/activate
python -m src.main
```

### Полная локальная разработка

Запустите все компоненты в отдельных терминалах:

```bash
# Терминал 1: База данных
docker run -d --name wishlist-postgres -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wishlist \
  postgres:16-alpine

# Терминал 2: Backend
cd backend
source venv/bin/activate
uvicorn src.main:app --reload

# Терминал 3: Frontend
cd frontend
npm run dev

# Терминал 4: Bot
cd bot
source venv/bin/activate
python -m src.main
```

---

## 🧪 Тестирование Telegram Mini App

Для тестирования Mini App в Telegram нужен публичный URL (localhost не работает в Telegram).

### Использование ngrok

```bash
# Установить ngrok (если еще не установлен)
brew install ngrok  # macOS
# или скачать с https://ngrok.com/

# Запустить ngrok для фронтенда
ngrok http 5173
```

Ngrok выдаст публичный URL (например: `https://abc123.ngrok-free.app`)

Обновите переменные окружения:

```bash
# В .env
MINIAPP_URL=https://abc123.ngrok-free.app

# Перезапустите бота
docker-compose restart bot
# или локально:
cd bot && python -m src.main
```

Теперь можно тестировать Mini App в Telegram!

### Настройка бота для Mini App

1. Откройте [@BotFather](https://t.me/botfather)
2. Выберите вашего бота
3. `/setmenubutton` - Настроить кнопку меню
4. Введите:
   - Text: "Открыть Wishlist" (или любой текст)
   - URL: ваш ngrok URL

---

## 🔧 Конфигурация для разработки

### Переменные окружения

#### Корневой `.env`

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
MINIAPP_URL=http://localhost:5173
VITE_API_URL=http://localhost:8000/api/v1
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=wishlist
CORS_ORIGINS=["*"]
```

#### `backend/.env`

```bash
DEBUG=true
APP_NAME=Wishlist API
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/wishlist
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","*"]
HOST=0.0.0.0
PORT=8000
```

#### `bot/.env`

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
MINIAPP_URL=http://localhost:5173  # или ngrok URL
BACKEND_API_URL=http://localhost:8000
BACKEND_API_TIMEOUT=30
BOT_NAME=Wishlist Bot
```

#### `frontend/.env`

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

### Порты по умолчанию

| Сервис | Development | Production |
|--------|-------------|------------|
| Frontend | 5173 | 3000 |
| Backend | 8000 | 3001 |
| PostgreSQL | 5432 | 5432 (внутренний) |

---

## 🏗 Архитектура проекта

### Backend (FastAPI)

```
backend/src/
├── api/              # API слой (routes, schemas)
│   ├── routes/       # Эндпоинты
│   └── schemas/      # Pydantic модели для API
├── domain/           # Доменный слой (чистые сущности)
│   └── entities/     # Бизнес-сущности
├── services/         # Бизнес-логика
├── repositories/     # Работа с БД
└── infrastructure/   # Инфраструктура (ORM модели, БД)
```

**Принципы:**
- 📦 Слоистая архитектура
- 🔄 Dependency Injection через FastAPI
- ⚡ Асинхронная работа с БД (asyncpg)
- 🎯 Разделение ответственности

### Frontend (Vue 3)

```
frontend/src/
├── components/       # Переиспользуемые компоненты
│   └── navigation/   # Навигация (TabBar)
├── views/            # Страницы приложения
├── stores/           # State management (Pinia-style)
├── composables/      # Vue композиции
├── types/            # TypeScript типы
└── App.vue           # Корневой компонент
```

**Принципы:**
- 🎨 Composition API
- 📱 Компонентный подход
- 🔄 Реактивное состояние
- 🎯 TypeScript для type safety

### Bot (aiogram)

```
bot/src/
├── handlers/         # Обработчики команд
├── keyboards/        # UI компоненты бота
└── api/              # Клиент для Backend API
```

---

## 🐛 Отладка

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f bot

# Последние N строк
docker-compose logs --tail=100 backend
```

### Подключение к БД

```bash
# Через Docker
docker-compose exec postgres psql -U postgres -d wishlist

# Локально
psql -h localhost -U postgres -d wishlist

# Полезные SQL команды
\dt              # Список таблиц
\d users         # Структура таблицы users
SELECT * FROM users;
```

### Перезапуск контейнера

```bash
# Перезапуск с пересборкой
docker-compose up -d --build backend

# Просто перезапуск
docker-compose restart backend
```

### Очистка и переустановка

```bash
# Остановить и удалить все контейнеры
docker-compose down

# Удалить volumes (БД будет очищена!)
docker-compose down -v

# Полная пересборка
docker-compose up -d --build --force-recreate
```

---

## 💡 Полезные советы

### Hot Reload

Все сервисы настроены на автоматическую перезагрузку при изменении кода:

- **Frontend**: Vite HMR (мгновенное обновление)
- **Backend**: uvicorn --reload (перезапуск при изменениях)
- **Bot**: перезапуск при изменениях (через volume mount)

### VS Code настройки

Рекомендуемые расширения:

```json
{
  "recommendations": [
    "vue.volar",
    "dbaeumer.vscode-eslint",
    "ms-python.python",
    "ms-python.vscode-pylance"
  ]
}
```

### PyCharm настройки

1. Настройте Python Interpreter на виртуальное окружение
2. Включите автоматическое сохранение для hot reload
3. Настройте Debug конфигурацию для FastAPI

---

## 🚨 Troubleshooting

### Порт уже занят

```bash
# Проверить, что использует порт
lsof -i :5173
lsof -i :8000
lsof -i :5432

# Убить процесс
kill -9 <PID>
```

### База данных не запускается

```bash
# Проверить логи PostgreSQL
docker-compose logs postgres

# Пересоздать контейнер с БД
docker-compose down
docker volume rm wishlins-miniapp_postgres_data
docker-compose up -d postgres
```

### Frontend не обновляется

```bash
# Очистить кеш Vite
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Backend не видит изменения

```bash
# Убедитесь, что uvicorn запущен с --reload
# Проверьте, что volume примонтирован
docker-compose exec backend ls /app/src
```

### Ошибки миграций

```bash
# Посмотреть текущую версию
docker-compose exec backend alembic current

# Откатить все миграции
docker-compose exec backend alembic downgrade base

# Применить заново
docker-compose exec backend alembic upgrade head
```

---

## 📚 Дополнительные ресурсы

- [Vue 3 документация](https://vuejs.org/)
- [FastAPI документация](https://fastapi.tiangolo.com/)
- [aiogram документация](https://docs.aiogram.dev/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)

---

## 🎯 Следующие шаги

1. ✅ Запустите проект через `./dev.sh`
2. 📝 Изучите структуру кода
3. 🔨 Начните разработку новых фич
4. 🧪 Протестируйте изменения в Telegram
5. 📤 Создайте коммит и push в Git

**Happy coding! 🚀**
