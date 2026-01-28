# Рабочий процесс (Workflow)

Пошаговая инструкция что делать после внесения изменений в код.

---

## 🔄 Быстрый деплой (Рекомендуется)

### Шаг 1: Коммит и пуш изменений

```bash
# Проверьте изменения
git status

# Добавьте файлы
git add .

# Создайте коммит
git commit -m "Описание изменений"

# Запушьте на GitHub/GitLab
git push origin main
```

### Шаг 2: Автоматический деплой с помощью скрипта

```bash
# Запустите deploy скрипт (замените на ваши данные)
./deploy.sh root@wishlist.splittrip.ru
```

**Что делает скрипт:**
- Подключается к серверу
- Делает `git pull` последних изменений
- Пересобирает и перезапускает Docker контейнеры
- Выполняет миграции БД
- Проверяет статус сервисов

### Шаг 3: Проверка

```bash
# Проверьте логи на сервере (опционально)
ssh root@wishlist.splittrip.ru
cd ~/apps/wishlins-miniapp
docker compose -f docker-compose.prod.yml logs -f
```

---

## 📋 Ручной деплой (альтернатива)

Если автоматический скрипт не работает или нужен больший контроль:

### 1. Локально: Коммит и пуш

```bash
git add .
git commit -m "Ваше сообщение"
git push origin main
```

### 2. На сервере: Обновление кода

```bash
# Подключитесь к серверу
ssh root@wishlist.splittrip.ru

# Перейдите в директорию проекта
cd ~/apps/wishlins-miniapp

# Получите последние изменения
git pull origin main
```

### 3. На сервере: Обновление .env (если нужно)

Если вы изменили переменные окружения:

```bash
# Отредактируйте .env в корне проекта
nano .env

# Убедитесь, что указаны правильные значения:
# TELEGRAM_BOT_TOKEN=8597188852:AAFt3kRm_aUXGY3DBcdT-4gMv8yJCa8jv0g
# MINIAPP_URL=https://wishlist.splittrip.ru
# VITE_API_URL=https://wishlist.splittrip.ru/api/v1
# POSTGRES_PASSWORD=ваш_пароль
# CORS_ORIGINS=["https://wishlist.splittrip.ru"]
```

### 4. На сервере: Перезапуск контейнеров

```bash
# Остановите контейнеры
docker compose -f docker-compose.prod.yml down

# Пересоберите и запустите (важно --build для обновления кода!)
docker compose -f docker-compose.prod.yml up -d --build

# Выполните миграции БД (если были изменения в схеме)
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Проверьте статус
docker compose -f docker-compose.prod.yml ps
```

### 5. Проверка логов

```bash
# Все сервисы
docker compose -f docker-compose.prod.yml logs -f

# Только бот
docker compose -f docker-compose.prod.yml logs -f bot

# Только backend
docker compose -f docker-compose.prod.yml logs -f backend

# Только frontend
docker compose -f docker-compose.prod.yml logs -f frontend
```

---

## 🎯 Частые сценарии

### Изменили только frontend (Vue.js)

```bash
# Локально
git add frontend/
git commit -m "Update frontend"
git push

# На сервере (или через deploy.sh)
cd ~/apps/wishlins-miniapp
git pull
docker compose -f docker-compose.prod.yml up -d --build frontend
```

### Изменили только backend (FastAPI)

```bash
# Локально
git add backend/
git commit -m "Update backend API"
git push

# На сервере
cd ~/apps/wishlins-miniapp
git pull
docker compose -f docker-compose.prod.yml up -d --build backend
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head  # если были миграции
```

### Изменили только бота (Python aiogram)

```bash
# Локально
git add bot/
git commit -m "Update bot handlers"
git push

# На сервере
cd ~/apps/wishlins-miniapp
git pull
docker compose -f docker-compose.prod.yml up -d --build bot
docker compose -f docker-compose.prod.yml logs -f bot  # проверка
```

### Изменили .env конфигурацию

```bash
# ⚠️ ВАЖНО: .env файл НЕ должен быть в git!
# Изменения в .env нужно делать вручную на сервере:

ssh root@wishlist.splittrip.ru
cd ~/apps/wishlins-miniapp
nano .env  # внесите изменения
docker compose -f docker-compose.prod.yml restart  # перезапустите все
```

### Добавили новые зависимости

**Backend (requirements.txt):**
```bash
# На сервере нужен --build для переустановки зависимостей
docker compose -f docker-compose.prod.yml up -d --build backend
```

**Frontend (package.json):**
```bash
docker compose -f docker-compose.prod.yml up -d --build frontend
```

---

## ⚠️ Важные замечания

1. **Всегда используйте `--build`** при обновлении кода, чтобы Docker пересобрал образы
2. **.env файл не должен быть в git** - он только на сервере
3. **Миграции БД** выполняются после обновления backend
4. **Проверяйте логи** после деплоя на наличие ошибок
5. **Резервное копирование** БД перед большими обновлениями:
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres wishlist > backup_$(date +%Y%m%d).sql
   ```

---

## 🚀 Быстрый чеклист

После каждого изменения кода:

- [ ] `git add .`
- [ ] `git commit -m "Описание"`
- [ ] `git push origin main`
- [ ] `./deploy.sh root@wishlist.splittrip.ru` ИЛИ ручной деплой на сервере
- [ ] Проверить логи: `docker compose -f docker-compose.prod.yml logs -f`
- [ ] Протестировать в Telegram боте

---

## 📚 Дополнительные ресурсы

- [DEPLOYMENT.md](DEPLOYMENT.md) - Полная документация по деплою
- [README.md](README.md) - Общая информация о проекте
- [deploy.sh](deploy.sh) - Скрипт автоматического деплоя
