# 🚀 Быстрый старт - Деплой за 5 минут

Этот гайд поможет вам задеплоить Wishlins Mini App на ваш сервер за несколько минут.

## Что вам понадобится

- ✅ Сервер с Ubuntu 20.04+ (VPS/Dedicated)
- ✅ SSH доступ к серверу (пользователь с sudo)
- ✅ Домен, указывающий на IP сервера (опционально, но рекомендуется)
- ✅ Telegram Bot Token от [@BotFather](https://t.me/botfather)

## Шаг 1: Создайте Telegram бота (2 минуты)

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям и получите токен
4. **Сохраните токен** - он понадобится позже

## Шаг 2: Настройте сервер (5 минут)

### На вашей локальной машине:

```bash
# Клонируйте репозиторий
git clone <your-repo-url> wishlins-miniapp
cd wishlins-miniapp

# Настройте сервер одной командой
./setup-server.sh user@your-server-ip
```

После выполнения:
1. **Выйдите и войдите** на сервер снова
2. Продолжите со следующего шага

## Шаг 3: Разверните приложение (3 минуты)

### SSH на сервер:

```bash
ssh user@your-server-ip
```

### Клонируйте репозиторий на сервер:

```bash
cd ~/apps
git clone <your-repo-url> wishlins-miniapp
cd wishlins-miniapp
```

### Запустите быстрый старт:

```bash
./quick-start.sh
```

Скрипт попросит вас настроить `.env` файл. Укажите:

```bash
# Обязательные параметры:
TELEGRAM_BOT_TOKEN=ваш_токен_от_botfather
MINIAPP_URL=https://your-domain.com  # или http://ваш-ip если нет домена
VITE_API_URL=https://your-domain.com/api/v1
POSTGRES_PASSWORD=сильный_пароль_здесь
CORS_ORIGINS=["https://your-domain.com"]
```

## Шаг 4: Настройте Nginx и SSL (5 минут)

### Если у вас есть домен:

```bash
# Сгенерируйте конфигурацию Nginx
./generate-nginx-config.sh your-domain.com

# Установите конфигурацию (следуйте инструкциям из вывода)
sudo mv nginx-your-domain.com.conf /etc/nginx/sites-available/wishlins
sudo ln -s /etc/nginx/sites-available/wishlins /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Установите SSL сертификат
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Если нет домена (временное решение):

Пока можете использовать приложение по IP:
- Frontend: `http://your-server-ip`
- Backend API: `http://your-server-ip:8000`

⚠️ **Для production обязательно нужен домен и HTTPS!**

## Шаг 5: Настройте Telegram бота (2 минуты)

1. Откройте [@BotFather](https://t.me/botfather)
2. Отправьте `/setmenubutton`
3. Выберите вашего бота
4. Введите текст кнопки: `Открыть Wishlins`
5. Введите URL: `https://your-domain.com` (или `http://your-ip` без домена)

## ✅ Готово! Проверьте работу

1. Откройте вашего бота в Telegram
2. Отправьте `/start`
3. Нажмите кнопку меню внизу
4. Mini App должно открыться!

---

## Что дальше?

### Проверка статуса

```bash
# На сервере
./check-status.sh

# С локальной машины
./check-status.sh user@your-server-ip
```

### Обновление приложения

```bash
# С локальной машины (после git push)
./deploy.sh user@your-server-ip
```

### Просмотр логов

```bash
# Все сервисы
docker compose -f docker-compose.prod.yml logs -f

# Конкретный сервис
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f bot
```

### Резервное копирование

```bash
# Создать бэкап базы данных
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres wishlist > backup_$(date +%Y%m%d).sql
```

---

## 🆘 Что-то пошло не так?

### Backend не запускается

```bash
# Проверьте логи
docker compose -f docker-compose.prod.yml logs backend

# Проверьте переменные окружения
cat .env
```

### Бот не отвечает

```bash
# Проверьте логи бота
docker compose -f docker-compose.prod.yml logs bot

# Убедитесь что токен правильный
grep TELEGRAM_BOT_TOKEN .env
```

### База данных не работает

```bash
# Проверьте статус PostgreSQL
docker compose -f docker-compose.prod.yml ps postgres

# Попробуйте подключиться
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres -d wishlist
```

### Nginx выдает ошибку

```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/error.log
```

---

## 📚 Полезные ссылки

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Полная документация по деплою
- **[SCRIPTS.md](SCRIPTS.md)** - Описание всех скриптов
- **[CHEATSHEET.md](CHEATSHEET.md)** - Шпаргалка по командам
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Архитектура приложения

---

## 📊 Типичное время деплоя

| Этап | Время |
|------|-------|
| Создание бота | 2 мин |
| Настройка сервера | 5 мин |
| Развертывание | 3 мин |
| Nginx + SSL | 5 мин |
| Настройка бота | 2 мин |
| **Итого** | **~17 минут** |

---

## ⚡ Еще быстрее?

Если сервер уже настроен, повторное развертывание занимает < 2 минуты:

```bash
./deploy.sh user@your-server-ip
```

---

## 🎉 Поздравляем!

Ваше приложение запущено и работает!

Следующие шаги:
1. Настройте автоматические бэкапы
2. Настройте мониторинг
3. Добавьте больше функций
4. Расскажите друзьям!

---

## 💡 Pro Tips

### Автоматический деплой через GitHub Actions

Добавьте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd ~/apps/wishlins-miniapp
            git pull
            docker compose -f docker-compose.prod.yml up -d --build
            docker compose -f docker-compose.prod.yml exec -T backend alembic upgrade head
```

### Автоматические бэкапы

Добавьте в crontab на сервере:

```bash
# Открыть crontab
crontab -e

# Добавить бэкап каждый день в 2:00
0 2 * * * cd ~/apps/wishlins-miniapp && \
  docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U postgres wishlist | gzip > \
  ~/backups/wishlist_$(date +\%Y\%m\%d).sql.gz
```

### Мониторинг

Установите Uptime Kuma для мониторинга доступности:

```bash
docker run -d --restart=always -p 3001:3001 \
  -v uptime-kuma:/app/data \
  --name uptime-kuma \
  louislam/uptime-kuma:1
```

---

**Нужна помощь?** Проверьте [DEPLOYMENT.md](DEPLOYMENT.md) для подробной информации!
