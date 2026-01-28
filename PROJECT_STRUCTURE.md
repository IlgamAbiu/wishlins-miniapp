# 📂 Структура проекта

Организация файлов и папок в проекте Wishlist Mini App.

## Корневая структура

```
wishlins-miniapp/
├── 📁 backend/              # FastAPI бэкенд
├── 📁 bot/                  # Telegram бот (aiogram)
├── 📁 frontend/             # Vue 3 фронтенд
├── 📁 docs/                 # Вся документация
├── 📁 scripts/              # Все скрипты
│   ├── dev/                # Скрипты для разработки
│   └── deploy/             # Скрипты для деплоя
│
├── 📄 README.md             # Главное описание проекта
├── 📄 Makefile              # Удобные команды
├── 📄 docker-compose.yml    # Development конфигурация
├── 📄 docker-compose.prod.yml # Production конфигурация
├── 📄 .env                  # Переменные окружения
├── 📄 .gitignore
│
└── 🔗 Символические ссылки для удобства:
    ├── dev -> scripts/dev/dev.sh
    ├── dev-stop -> scripts/dev/dev-stop.sh
    ├── dev-logs -> scripts/dev/dev-logs.sh
    └── dev-restart -> scripts/dev/dev-restart.sh
```

## 📚 docs/ - Документация

Вся документация проекта организована в одной папке.

```
docs/
├── README.md                # Навигация по документации
│
├── 🚀 Быстрый старт
│   ├── START_HERE.md        # Начните отсюда!
│   ├── DEVELOPMENT.md       # Полное руководство
│   └── CHEATSHEET.md        # Шпаргалка
│
├── 🏗 Архитектура
│   ├── ARCHITECTURE.md      # Архитектура проекта
│   └── FRONTEND_STRUCTURE.md # Структура фронтенда
│
└── 🚀 Деплой
    ├── QUICKSTART.md        # Быстрый деплой
    ├── DEPLOYMENT.md        # Полный гайд
    ├── WORKFLOW.md          # Workflow
    ├── SCRIPTS.md           # Описание скриптов
    └── DEPLOYMENT_SUMMARY.md # Краткая сводка
```

[Перейти в docs/ →](docs/)

## 🛠 scripts/ - Скрипты

Все скрипты организованы по назначению.

### scripts/dev/ - Development

Скрипты для локальной разработки:

```
scripts/dev/
├── dev.sh              # Запустить все сервисы (main)
├── dev-stop.sh         # Остановить все сервисы
├── dev-logs.sh         # Просмотр логов
└── dev-restart.sh      # Перезапуск сервисов
```

**Использование:**
```bash
# Через симлинки из корня (удобно):
./dev
./dev-stop
./dev-logs
./dev-restart

# Или напрямую:
./scripts/dev/dev.sh

# Или через make:
make dev
make stop
```

### scripts/deploy/ - Deployment

Скрипты для деплоя на production:

```
scripts/deploy/
├── setup-server.sh         # Первоначальная настройка сервера
├── deploy.sh               # Автоматический деплой
├── quick-start.sh          # Быстрый старт
├── check-status.sh         # Проверка статуса
├── generate-nginx-config.sh # Генерация Nginx конфига
└── fix-port-80.sh          # Исправление конфликтов портов
```

**Использование:**
```bash
# Первоначальная настройка
./scripts/deploy/setup-server.sh user@server-ip

# Деплой обновлений
./scripts/deploy/deploy.sh user@server-ip

# Проверка статуса
./scripts/deploy/check-status.sh
```

[Перейти в scripts/ →](scripts/)

## 🏗 backend/ - FastAPI Backend

```
backend/
├── src/
│   ├── api/              # API routes и schemas
│   ├── domain/           # Доменные сущности
│   ├── services/         # Бизнес-логика
│   ├── repositories/     # Работа с БД
│   ├── infrastructure/   # ORM модели, БД
│   ├── config.py
│   └── main.py
│
├── alembic/              # Миграции БД
├── requirements.txt
├── Dockerfile
└── .env.example
```

## 🤖 bot/ - Telegram Bot

```
bot/
├── src/
│   ├── handlers/         # Обработчики команд
│   ├── keyboards/        # UI компоненты
│   ├── api/              # Клиент для Backend API
│   ├── config.py
│   └── main.py
│
├── requirements.txt
├── Dockerfile
└── .env.example
```

## 🎨 frontend/ - Vue 3 Frontend

```
frontend/
├── src/
│   ├── components/       # Vue компоненты
│   │   └── navigation/   # TabBar навигация
│   ├── views/            # Страницы
│   ├── stores/           # State management
│   ├── composables/      # Vue композиции
│   ├── types/            # TypeScript типы
│   ├── App.vue
│   └── main.ts
│
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── Dockerfile
├── nginx.conf
└── .env.example
```

## 🎯 Принципы организации

### ✅ Что в корне

- Только самое необходимое
- Главный README.md
- Конфигурационные файлы (docker-compose, .env)
- Makefile для удобных команд
- Симлинки на часто используемые скрипты

### ✅ Документация

- Вся документация в `docs/`
- Логическая группировка по назначению
- README.md для навигации

### ✅ Скрипты

- Разделение на dev и deploy
- Понятные названия
- README.md с описанием
- Симлинки в корне для удобства

### ✅ Код приложения

- Каждый компонент в своей папке
- Слоистая архитектура
- Разделение ответственности

## 🔍 Навигация

- **[README.md](README.md)** - Главная страница проекта
- **[docs/](docs/)** - Вся документация
- **[scripts/](scripts/)** - Все скрипты
- **[backend/](backend/)** - Бэкенд код
- **[bot/](bot/)** - Бот код
- **[frontend/](frontend/)** - Фронтенд код

## 💡 Быстрый старт

```bash
# 1. Запустить разработку
make dev

# 2. Посмотреть логи
make logs

# 3. Остановить
make stop
```

**Подробнее**: [docs/START_HERE.md](docs/START_HERE.md)
