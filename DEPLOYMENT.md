# Руководство по деплою на production сервер

## Предварительные требования

На вашем сервере должны быть установлены:
- Docker (версия 20.10+)
- Docker Compose (версия 2.0+)
- Git
- Nginx (опционально, для SSL и reverse proxy)

## Шаг 1: Подготовка сервера

### 1.1 Подключитесь к серверу

```bash
ssh your_user@your_server_ip
```

### 1.2 Установите Docker (если еще не установлен)

```bash
# Обновите пакеты
sudo apt update && sudo apt upgrade -y

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER

# Установите Docker Compose
sudo apt install docker-compose-plugin -y

# Выйдите и войдите снова для применения изменений группы
exit
```

### 1.3 Настройте firewall

```bash
# Разрешите SSH, HTTP и HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Шаг 2: Клонирование проекта

```bash
# Создайте директорию для проекта
mkdir -p ~/apps
cd ~/apps

# Клонируйте репозиторий (замените на ваш URL)
git clone <ваш-репозиторий-url> wishlins-miniapp
cd wishlins-miniapp
```

## Шаг 3: Настройка окружения

### 3.1 Создайте .env файл

```bash
cp .env.example .env
nano .env
```

### 3.2 Заполните переменные окружения

```bash
# Telegram Bot Token (получите у @BotFather)
TELEGRAM_BOT_TOKEN=ваш_токен_бота

# Mini App URL (ваш домен)
MINIAPP_URL=https://your-domain.com

# Backend API URL для фронтенда
VITE_API_URL=https://your-domain.com/api/v1

# PostgreSQL настройки
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ваш_сильный_пароль_здесь
POSTGRES_DB=wishlist

# CORS origins (ваш домен)
CORS_ORIGINS=["https://your-domain.com"]
```

## Шаг 4: Запуск приложения

### 4.1 Запустите с помощью Docker Compose

```bash
# Соберите и запустите контейнеры
docker compose -f docker-compose.prod.yml up -d --build

# Проверьте статус контейнеров
docker compose -f docker-compose.prod.yml ps

# Посмотрите логи
docker compose -f docker-compose.prod.yml logs -f
```

### 4.2 Выполните миграции базы данных

```bash
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Шаг 5: Настройка Nginx и SSL

### 5.1 Установите Nginx и Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 5.2 Создайте конфигурацию Nginx

```bash
sudo nano /etc/nginx/sites-available/wishlins
```

Добавьте следующую конфигурацию:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend docs (опционально, отключите на production)
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5.3 Активируйте конфигурацию

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/wishlins /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx
```

### 5.4 Установите SSL сертификат

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot автоматически настроит HTTPS и перенаправление с HTTP.

## Шаг 6: Настройка Telegram бота

### 6.1 Настройте Mini App кнопку

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте `/setmenubutton`
3. Выберите вашего бота
4. Введите текст кнопки: "Открыть Wishlins"
5. Введите URL: `https://your-domain.com`

### 6.2 (Опционально) Настройте webhook

Для production рекомендуется использовать webhook вместо polling:

```bash
curl -X POST "https://api.telegram.org/bot<ВАШ_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook"}'
```

## Шаг 7: Проверка работы

1. Откройте вашего бота в Telegram
2. Отправьте `/start`
3. Нажмите кнопку меню для открытия Mini App
4. Проверьте, что приложение загружается и работает

## Обновление приложения

```bash
cd ~/apps/wishlins-miniapp

# Получите последние изменения
git pull origin main

# Пересоберите и перезапустите контейнеры
docker compose -f docker-compose.prod.yml up -d --build

# Выполните новые миграции (если есть)
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Полезные команды

```bash
# Посмотреть логи всех сервисов
docker compose -f docker-compose.prod.yml logs -f

# Посмотреть логи конкретного сервиса
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f bot
docker compose -f docker-compose.prod.yml logs -f frontend

# Остановить все контейнеры
docker compose -f docker-compose.prod.yml down

# Остановить и удалить volumes (ВНИМАНИЕ: удалит данные БД!)
docker compose -f docker-compose.prod.yml down -v

# Перезапустить конкретный сервис
docker compose -f docker-compose.prod.yml restart backend

# Зайти внутрь контейнера
docker compose -f docker-compose.prod.yml exec backend sh
docker compose -f docker-compose.prod.yml exec bot sh

# Посмотреть использование ресурсов
docker stats
```

## Резервное копирование базы данных

```bash
# Создать бэкап
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres wishlist > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из бэкапа
cat backup_20240115_120000.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres wishlist
```

## Мониторинг

### Проверка здоровья сервисов

```bash
# Backend health check
curl https://your-domain.com/api/v1/health

# Проверка работы контейнеров
docker compose -f docker-compose.prod.yml ps
```

### Настройка логов (опционально)

Создайте файл `docker-compose.override.yml` для ротации логов:

```yaml
version: '3.8'

services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  bot:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Troubleshooting

### Контейнеры не запускаются

```bash
# Проверьте логи
docker compose -f docker-compose.prod.yml logs

# Проверьте, что порты свободны
sudo netstat -tulpn | grep -E ':(80|8000|5432)'
```

### База данных не подключается

```bash
# Проверьте, что postgres контейнер работает
docker compose -f docker-compose.prod.yml ps postgres

# Проверьте логи postgres
docker compose -f docker-compose.prod.yml logs postgres

# Подключитесь к БД напрямую
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d wishlist
```

### Бот не отвечает

```bash
# Проверьте логи бота
docker compose -f docker-compose.prod.yml logs bot

# Убедитесь, что токен правильный в .env файле
cat .env | grep TELEGRAM_BOT_TOKEN
```

## Безопасность

1. **Не публикуйте .env файл** в репозиторий
2. **Используйте сильные пароли** для PostgreSQL
3. **Настройте firewall** правильно
4. **Используйте HTTPS** для всех соединений
5. **Регулярно обновляйте** Docker образы и систему
6. **Делайте резервные копии** базы данных
7. **Ограничьте доступ** к /docs эндпоинту на production

## Мониторинг производительности (опционально)

Для более продвинутого мониторинга можно использовать:
- **Portainer** - UI для управления Docker
- **Prometheus + Grafana** - метрики и графики
- **Sentry** - отслеживание ошибок
- **Uptime Kuma** - мониторинг доступности

## Автоматизация деплоя с GitHub Actions

Создайте файл `.github/workflows/deploy.yml` для автоматического деплоя при push в main:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ~/apps/wishlins-miniapp
            git pull origin main
            docker compose -f docker-compose.prod.yml up -d --build
            docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```
