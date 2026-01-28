# Архитектура развертывания Wishlins Mini App

## Production архитектура

```
                                Internet
                                   │
                                   │ HTTPS (443)
                                   ▼
                         ┌─────────────────┐
                         │   Nginx Server  │
                         │  (Reverse Proxy)│
                         │   + SSL (Let's  │
                         │    Encrypt)     │
                         └────────┬────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
                  │ /                             │ /api/
                  ▼                               ▼
        ┌──────────────────┐           ┌──────────────────┐
        │   Frontend       │           │   Backend API    │
        │   Container      │           │   Container      │
        │   (Nginx)        │           │   (FastAPI)      │
        │   Port: 80       │           │   Port: 8000     │
        └──────────────────┘           └────────┬─────────┘
                                                 │
                                                 │ SQL
                                                 ▼
                                       ┌──────────────────┐
                                       │   PostgreSQL     │
                                       │   Container      │
                                       │   Port: 5432     │
                                       └──────────────────┘
                                                 │
                                                 │
        ┌──────────────────┐                    │
        │   Bot Container  │────────────────────┘
        │   (aiogram)      │    API calls
        │                  │
        └────────┬─────────┘
                 │
                 │ Bot API
                 ▼
        ┌──────────────────┐
        │  Telegram API    │
        │  (telegram.org)  │
        └──────────────────┘
```

## Сетевая архитектура

```
Server (Ubuntu)
├── Host Network
│   ├── Port 22   → SSH
│   ├── Port 80   → Nginx → Frontend Container (80)
│   ├── Port 443  → Nginx (SSL)
│   └── Port 8000 → Nginx → Backend Container (8000)
│
└── Docker Network (internal)
    ├── frontend:80
    ├── backend:8000
    ├── postgres:5432 (не открыт наружу)
    └── bot (no exposed ports)
```

## Структура контейнеров

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Host                          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Docker Network: wishlist_default       │    │
│  │                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐           │    │
│  │  │  Frontend    │  │   Backend    │           │    │
│  │  │              │  │              │           │    │
│  │  │  Vue.js +    │  │  FastAPI +   │           │    │
│  │  │  Nginx       │  │  Uvicorn     │           │    │
│  │  │              │  │              │           │    │
│  │  └──────────────┘  └──────┬───────┘           │    │
│  │                            │                   │    │
│  │                            │ DB Connection     │    │
│  │                            ▼                   │    │
│  │  ┌──────────────┐  ┌──────────────┐           │    │
│  │  │     Bot      │  │  PostgreSQL  │           │    │
│  │  │              │  │              │           │    │
│  │  │  aiogram +   │  │  + Volume    │           │    │
│  │  │  Python      │  │  (Data       │           │    │
│  │  │              │  │   persist)   │           │    │
│  │  └──────────────┘  └──────────────┘           │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Процесс запроса

### Пользовательский запрос к Mini App

```
1. User opens Mini App
   │
   ▼
2. Browser → https://your-domain.com
   │
   ▼
3. Nginx (SSL termination)
   │
   ▼
4. Nginx → Frontend Container (location /)
   │
   ▼
5. Frontend serves static files
   │
   ▼
6. Browser receives HTML/JS/CSS
```

### API запрос из Mini App

```
1. Frontend JavaScript makes request
   │
   ▼
2. Browser → https://your-domain.com/api/v1/users
   │
   ▼
3. Nginx (SSL termination)
   │
   ▼
4. Nginx → Backend Container (location /api/)
   │
   ▼
5. FastAPI processes request
   │
   ├─→ User Service (business logic)
   │   │
   │   ▼
   ├─→ User Repository (data access)
   │   │
   │   ▼
   └─→ PostgreSQL Database
       │
       ▼
   Response back to Frontend
```

### Telegram бот запрос

```
1. User sends /start in Telegram
   │
   ▼
2. Telegram API → Bot Container
   │
   ▼
3. Bot processes command
   │
   ├─→ Makes HTTP request to Backend API
   │   │
   │   ▼
   ├─→ Backend stores user data
   │   │
   │   ▼
   └─→ Backend → PostgreSQL
       │
       ▼
4. Bot sends response to Telegram API
   │
   ▼
5. User receives message in Telegram
```

## Хранилище данных

```
Host File System
│
├── ~/apps/wishlins-miniapp/          # Application code
│   ├── backend/
│   ├── bot/
│   ├── frontend/
│   ├── .env                           # Environment variables
│   └── docker-compose.prod.yml
│
└── /var/lib/docker/volumes/
    └── wishlins_postgres_data/       # PostgreSQL data (persistent)
        └── _data/
            └── [database files]
```

## Безопасность

### Слои безопасности

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: Firewall (UFW)                             │
│  - Allow: 22 (SSH), 80 (HTTP), 443 (HTTPS)         │
│  - Deny: Everything else                            │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ Layer 2: Nginx                                      │
│  - SSL/TLS encryption                               │
│  - Security headers                                 │
│  - Rate limiting (optional)                         │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ Layer 3: Application (Backend)                      │
│  - CORS configuration                               │
│  - Input validation                                 │
│  - Authentication/Authorization                     │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│ Layer 4: Database                                   │
│  - Not exposed to internet                          │
│  - Password protected                               │
│  - Internal Docker network only                     │
└─────────────────────────────────────────────────────┘
```

### Порты и доступность

| Service    | Internal Port | External Port | Access       |
|------------|---------------|---------------|--------------|
| Frontend   | 80            | 80 → Nginx    | Public       |
| Backend    | 8000          | 8000 → Nginx  | Via Nginx    |
| PostgreSQL | 5432          | None          | Internal only|
| Bot        | None          | None          | Internal only|
| SSH        | 22            | 22            | Admin only   |
| Nginx HTTPS| 443           | 443           | Public       |

## Мониторинг и логи

```
Logs Location
│
├── Docker Logs (in-memory + files)
│   ├── Backend: docker logs wishlist-backend
│   ├── Bot: docker logs wishlist-bot
│   ├── Frontend: docker logs wishlist-frontend
│   └── PostgreSQL: docker logs wishlist-postgres
│
└── Nginx Logs (on host)
    ├── /var/log/nginx/access.log
    └── /var/log/nginx/error.log
```

## Масштабирование (Future)

### Горизонтальное масштабирование

```
                    Load Balancer
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   Server 1          Server 2          Server 3
   (Backend)         (Backend)         (Backend)
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                Shared PostgreSQL
                 (Master-Replica)
```

### Рекомендации по масштабированию

1. **Увеличение нагрузки (до 1000 пользователей)**:
   - Увеличить ресурсы сервера (CPU, RAM)
   - Добавить Redis для кэширования
   - Настроить connection pooling для БД

2. **Средняя нагрузка (1000-10000 пользователей)**:
   - Разделить backend на несколько инстансов
   - Использовать load balancer (Nginx/HAProxy)
   - PostgreSQL с read replicas
   - Redis для сессий и кэша

3. **Высокая нагрузка (10000+ пользователей)**:
   - Kubernetes для оркестрации
   - Managed PostgreSQL (AWS RDS, GCP Cloud SQL)
   - CDN для фронтенда
   - Microservices architecture
   - Message queue (RabbitMQ/Kafka)

## Backup стратегия

```
┌──────────────────────────────────────────────────┐
│ Automated Backup Schedule                        │
│                                                   │
│ Daily (2:00 AM):                                 │
│   └─ PostgreSQL dump → ~/backups/daily/         │
│                                                   │
│ Weekly (Sunday 3:00 AM):                         │
│   └─ Full backup → ~/backups/weekly/            │
│                                                   │
│ Monthly (1st day 4:00 AM):                       │
│   └─ Full backup → ~/backups/monthly/           │
│                                                   │
│ Retention:                                       │
│   ├─ Daily: 7 days                              │
│   ├─ Weekly: 4 weeks                            │
│   └─ Monthly: 6 months                          │
└──────────────────────────────────────────────────┘
```

## CI/CD Pipeline (Опционально)

```
GitHub Repository
      │
      │ git push
      ▼
GitHub Actions
      │
      ├─ Run tests
      ├─ Build Docker images
      ├─ Push to registry (optional)
      │
      ▼
SSH to Production Server
      │
      ├─ Pull latest code
      ├─ docker compose up -d --build
      ├─ Run migrations
      └─ Health check
      │
      ▼
Deployment Complete
```

## Troubleshooting Flow

```
Issue Detected
      │
      ▼
Check Container Status
      │
      ├─ All running? → Check logs
      ├─ One down? → Restart container
      └─ All down? → Check Docker service
      │
      ▼
Check Logs
      │
      ├─ Connection errors? → Check network
      ├─ Database errors? → Check PostgreSQL
      └─ Application errors? → Check code/env
      │
      ▼
Check Resources
      │
      ├─ Disk full? → Clean up old images/logs
      ├─ Memory full? → Restart containers
      └─ CPU high? → Investigate load
```

## Performance Optimization

### Current Setup (Single Server)

| Component  | Bottleneck        | Optimization                    |
|------------|-------------------|---------------------------------|
| Frontend   | Network latency   | Enable gzip, add CDN            |
| Backend    | CPU/Memory        | Add connection pooling, caching |
| Database   | Disk I/O          | Use SSD, optimize queries       |
| Bot        | Rate limits       | Implement queue, throttling     |

### Recommended Server Specs

#### Minimal (< 100 users)
- 2 CPU cores
- 2GB RAM
- 20GB SSD
- 100 Mbps network

#### Production (100-1000 users)
- 4 CPU cores
- 4GB RAM
- 50GB SSD
- 1 Gbps network

#### Scale (1000+ users)
- 8+ CPU cores
- 8GB+ RAM
- 100GB+ SSD
- 1 Gbps+ network
- Load balancer

## Заключение

Эта архитектура обеспечивает:
- ✅ Простое развертывание с Docker Compose
- ✅ Изоляция сервисов в контейнерах
- ✅ Безопасное хранение данных
- ✅ Легкое масштабирование при необходимости
- ✅ Простой процесс обновления
- ✅ Удобный мониторинг и troubleshooting
