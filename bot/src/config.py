"""
Bot configuration module.
Environment-based configuration with validation.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Bot settings loaded from environment variables."""

    # Telegram Bot
    telegram_bot_token: str = Field(
        ...,
        description="Telegram Bot Token from @BotFather"
    )

    # Mini App
    miniapp_url: str = Field(
        default="https://your-miniapp-domain.com",
        description="URL of the Telegram Mini App"
    )

    # Backend API
    backend_api_url: str = Field(
        default="http://localhost:8000",
        description="Backend API base URL"
    )
    backend_api_timeout: int = Field(
        default=30,
        description="Backend API request timeout in seconds"
    )

    # Bot Settings
    bot_name: str = Field(
        default="Wishlist Bot",
        description="Bot display name"
    )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
