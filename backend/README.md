# Wishlist Backend API

FastAPI-based backend service for the Wishlist Telegram Mini App.

## Architecture

```
src/
├── api/                    # API Layer
│   ├── routes/             # Route handlers
│   ├── schemas.py          # Pydantic schemas
│   └── dependencies.py     # FastAPI dependencies
│
├── domain/                 # Domain Layer (pure Python)
│   └── entities/           # Business entities
│
├── services/               # Service Layer
│   └── user_service.py     # Business logic
│
├── repositories/           # Repository Layer
│   └── user_repository.py  # Database access
│
├── infrastructure/         # Infrastructure Layer
│   ├── database.py         # DB connection
│   └── models/             # SQLAlchemy models
│
├── config.py               # Configuration
└── main.py                 # Entry point
```

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
python -m src.main
```

## API Documentation

When running in debug mode, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql+asyncpg://...` |
| `DEBUG` | Enable debug mode | `false` |
| `CORS_ORIGINS` | Allowed CORS origins | `["*"]` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
