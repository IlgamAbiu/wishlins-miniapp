"""
Application configuration module.
Environment-based configuration with validation.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "Wishlist API"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/wishlist",
        description="PostgreSQL connection URL"
    )

    # Telegram
    telegram_bot_token: str = Field(
        default="",
        description="Telegram Bot Token for validation"
    )

    # CORS
    cors_origins: list[str] = ["*"]

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
