# Шпаргалка по командам Wishlins Mini App

## Быстрый деплой

```bash
# Первоначальная настройка сервера
./setup-server.sh user@server_ip

# Автоматический деплой
./deploy.sh user@server_ip

# Проверка статуса
./check-status.sh user@server_ip

# Генерация Nginx конфигурации
./generate-nginx-config.sh your-domain.com
```

## Docker команды

### Запуск и остановка

```bash
# Запустить все сервисы
docker compose -f docker-compose.prod.yml up -d

# Запустить с пересборкой
docker compose -f docker-compose.prod.yml up -d --build

# Остановить все сервисы
docker compose -f docker-compose.prod.yml down

# Остановить с удалением volumes (ВНИМАНИЕ: удалит БД!)
docker compose -f docker-compose.prod.yml down -v

# Перезапустить конкретный сервис
docker compose -f docker-compose.prod.yml restart backend
```

### Логи

```bash
# Все логи (следить в реальном времени)
docker compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f bot
docker compose -f docker-compose.prod.yml logs -f frontend

# Последние N строк логов
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Статус и мониторинг

```bash
# Статус контейнеров
docker compose -f docker-compose.prod.yml ps

# Использование ресурсов
docker stats

# Проверка здоровья
curl http://localhost:8000/health
```

### Доступ к контейнерам

```bash
# Войти в контейнер backend
docker compose -f docker-compose.prod.yml exec backend sh

# Войти в контейнер bot
docker compose -f docker-compose.prod.yml exec bot sh

# Войти в PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d wishlist
```

## База данных

### Миграции

```bash
# Применить все миграции
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Откатить последнюю миграцию
docker compose -f docker-compose.prod.yml exec backend alembic downgrade -1

# Создать новую миграцию
docker compose -f docker-compose.prod.yml exec backend alembic revision --autogenerate -m "description"

# Посмотреть историю миграций
docker compose -f docker-compose.prod.yml exec backend alembic history
```

### Резервное копирование

```bash
# Создать бэкап
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres wishlist > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из бэкапа
cat backup_20240115_120000.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres wishlist

# Создать бэкап с сжатием
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres wishlist | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Восстановить из сжатого бэкапа
gunzip -c backup_20240115_120000.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres wishlist
```

### SQL запросы

```bash
# Выполнить SQL запрос
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d wishlist -c "SELECT * FROM users LIMIT 10;"

# Посмотреть все таблицы
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d wishlist -c "\dt"

# Посмотреть структуру таблицы
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d wishlist -c "\d users"
```

## Nginx

```bash
# Проверить конфигурацию
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx

# Перезапустить Nginx
sudo systemctl restart nginx

# Посмотреть логи
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Посмотреть статус
sudo systemctl status nginx
```

## SSL / Certbot

```bash
# Установить SSL сертификат
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Обновить все сертификаты
sudo certbot renew

# Проверить статус сертификата
sudo certbot certificates

# Тестовое обновление (dry-run)
sudo certbot renew --dry-run
```

## Git

```bash
# Получить последние изменения
git pull origin main

# Посмотреть статус
git status

# Посмотреть последние коммиты
git log --oneline -10

# Откатиться на определенный коммит
git checkout <commit-hash>
```

## Системные команды

```bash
# Проверить использование диска
df -h

# Проверить использование памяти
free -h

# Проверить запущенные процессы
top
htop

# Проверить открытые порты
sudo netstat -tulpn | grep LISTEN

# Очистить Docker (удалить неиспользуемые образы и контейнеры)
docker system prune -a

# Очистить Docker (включая volumes - ОСТОРОЖНО!)
docker system prune -a --volumes
```

## Troubleshooting

### Контейнер не запускается

```bash
# Проверить логи
docker compose -f docker-compose.prod.yml logs <service_name>

# Проверить что порты не заняты
sudo netstat -tulpn | grep -E ':(80|8000|5432)'

# Пересобрать и перезапустить
docker compose -f docker-compose.prod.yml up -d --build --force-recreate <service_name>
```

### База данных не подключается

```bash
# Проверить что postgres запущен
docker compose -f docker-compose.prod.yml ps postgres

# Проверить переменные окружения
docker compose -f docker-compose.prod.yml exec backend env | grep DATABASE

# Попробовать подключиться вручную
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres
```

### Бот не отвечает

```bash
# Проверить логи бота
docker compose -f docker-compose.prod.yml logs bot

# Проверить что токен правильный
cat .env | grep TELEGRAM_BOT_TOKEN

# Перезапустить бота
docker compose -f docker-compose.prod.yml restart bot
```

### API не отвечает

```bash
# Проверить здоровье API
curl http://localhost:8000/health

# Проверить логи backend
docker compose -f docker-compose.prod.yml logs backend

# Проверить что backend запущен
docker compose -f docker-compose.prod.yml ps backend
```

## Мониторинг в реальном времени

```bash
# Следить за логами всех сервисов
docker compose -f docker-compose.prod.yml logs -f

# Следить за использованием ресурсов
watch -n 2 'docker stats --no-stream'

# Следить за количеством запросов к API
docker compose -f docker-compose.prod.yml logs -f backend | grep "GET\|POST\|PUT\|DELETE"
```

## Переменные окружения

Основные переменные в `.env` файле:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token      # Токен Telegram бота
MINIAPP_URL=https://your-domain.com    # URL Mini App
VITE_API_URL=https://your-domain.com/api/v1  # URL API для фронтенда
POSTGRES_USER=postgres                 # Пользователь PostgreSQL
POSTGRES_PASSWORD=strong_password      # Пароль PostgreSQL
POSTGRES_DB=wishlist                   # Имя базы данных
CORS_ORIGINS=["https://your-domain.com"]  # Разрешенные CORS origins
```

## Полезные ссылки

- **Полная документация**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Backend API**: http://localhost:8000/docs (в debug режиме)
- **Backend Health**: http://localhost:8000/health
- **Frontend**: http://localhost:80
- **PostgreSQL**: localhost:5432

## Автоматизация

Добавьте в crontab для автоматического обновления SSL:

```bash
# Открыть crontab
sudo crontab -e

# Добавить обновление certbot (каждый день в 3:00)
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

Добавьте автоматический бэкап БД:

```bash
# Добавить в crontab (каждый день в 2:00)
0 2 * * * cd ~/apps/wishlins-miniapp && docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres wishlist | gzip > ~/backups/wishlist_$(date +\%Y\%m\%d).sql.gz

# Создать директорию для бэкапов
mkdir -p ~/backups
```
