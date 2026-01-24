# Wishlist - Telegram Mini App

A production-ready MVP for a Telegram-based Wishlist service.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Telegram Bot   │────▶│   Backend API   │◀────│   Mini App      │
│    (Python)     │     │    (FastAPI)    │     │    (Vue 3)      │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   PostgreSQL    │
                        └─────────────────┘
```

### Components

1. **Telegram Bot** (`/bot`) - Handles Telegram interactions
2. **Backend API** (`/backend`) - Business logic and data persistence
3. **Mini App Frontend** (`/frontend`) - Vue 3 web application

## Features (MVP Scope)

- ✅ `/start` command handling
- ✅ Welcome message with service description
- ✅ Automatic user registration
- ✅ Button to open Mini App
- ✅ Mini App with empty wishlist screen
- ✅ User profile display (name, avatar)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Bot | Python 3.12, aiogram 3.x |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic |
| Frontend | Vue 3, TypeScript, Vite |
| Database | PostgreSQL 16 |
| Container | Docker, Docker Compose |

## Project Structure

```
Wishlist/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── api/            # API routes and schemas
│   │   ├── domain/         # Pure domain entities
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Database access
│   │   └── infrastructure/ # DB setup, ORM models
│   ├── alembic/            # Database migrations
│   └── Dockerfile
│
├── bot/                     # Telegram Bot
│   ├── src/
│   │   ├── handlers/       # Command handlers
│   │   ├── keyboards/      # UI components
│   │   └── api/            # Backend API client
│   └── Dockerfile
│
├── frontend/               # Mini App
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── composables/    # Vue composables
│   │   ├── components/     # Vue components
│   │   └── pages/          # Page components
│   └── Dockerfile
│
├── docker-compose.yml      # Development setup
└── docker-compose.prod.yml # Production setup
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))

### 1. Clone and Configure

```bash
# Clone the repository
cd Wishlist

# Copy environment file
cp .env.example .env

# Edit .env and add your Telegram Bot Token
```

### 2. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Run Database Migrations

```bash
# Run migrations
docker-compose exec backend alembic upgrade head
```

### 4. Access Services

- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (debug mode only)
- **Frontend**: http://localhost:5173
- **PostgreSQL**: localhost:5432

## Development Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run migrations
alembic upgrade head

# Start development server
python -m src.main
```

### Bot

```bash
cd bot

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env and add your TELEGRAM_BOT_TOKEN

# Start the bot
python -m src.main
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | Register or update user |
| GET | `/api/v1/users/telegram/{telegram_id}` | Get user by Telegram ID |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## User Flow

```
┌─────────────┐
│ User opens  │
│    bot      │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ /start cmd  │────▶│ Bot sends   │
│             │     │ user data   │
└─────────────┘     │ to backend  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Backend     │
                    │ registers   │
                    │ user        │
                    └──────┬──────┘
                           │
                           ▼
┌─────────────┐     ┌─────────────┐
│ User sees   │◀────│ Bot sends   │
│ welcome msg │     │ welcome +   │
│ + button    │     │ CTA button  │
└──────┬──────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ User clicks │────▶│ Mini App    │
│ button      │     │ opens       │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Empty       │
                    │ wishlist    │
                    │ screen      │
                    └─────────────┘
```

## Analytics Events (Placeholders)

| Event | Description |
|-------|-------------|
| `bot_start` | User started the bot |
| `user_registered` | New user was registered |
| `miniapp_opened` | User opened the Mini App |

## Architecture Principles

### Backend Layers

1. **API Layer** - Request/response handling only
2. **Service Layer** - Business logic
3. **Repository Layer** - Database access only
4. **Domain Layer** - Pure entities, no frameworks

### Bot Layers

1. **Handlers** - Telegram event processing
2. **Keyboards** - UI component builders
3. **API Client** - Backend communication

### Frontend Layers

1. **Pages** - Route-level components
2. **Components** - Reusable UI components
3. **Composables** - Shared logic (Telegram SDK)
4. **API** - Backend communication

## Production Deployment

### 1. Configure Production Environment

```bash
cp .env.example .env
# Edit .env with production values:
# - Strong POSTGRES_PASSWORD
# - Your domain in MINIAPP_URL
# - CORS_ORIGINS with your domain
```

### 2. Deploy with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Set Up Telegram Bot Webhook (Optional)

For production, configure webhook instead of polling:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook"}'
```

### 4. Configure HTTPS

Use a reverse proxy (nginx, Traefik, Caddy) with SSL certificates for production deployment.

## Testing Telegram Mini App

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Configure Mini App URL via `/setmenubutton`
3. Or use inline button with `web_app` parameter

For local development, use [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 5173
```

Then update your `MINIAPP_URL` with the ngrok URL.

## Extending the Project

The architecture is designed for easy feature expansion:

1. **Add new bot commands**: Create handler in `bot/src/handlers/`
2. **Add new API endpoints**: Create route in `backend/src/api/routes/`
3. **Add new business logic**: Create service in `backend/src/services/`
4. **Add new frontend pages**: Create component in `frontend/src/pages/`

## License

MIT
