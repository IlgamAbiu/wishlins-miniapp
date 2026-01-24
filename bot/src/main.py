"""
Telegram Bot entry point.
"""

import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from src.api import BackendAPIClient
from src.config import get_settings
from src.handlers import start_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


async def main() -> None:
    """Main entry point for the bot."""
    settings = get_settings()

    # Initialize bot
    bot = Bot(
        token=settings.telegram_bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )

    # Initialize dispatcher
    dp = Dispatcher()

    # Initialize API client
    api_client = BackendAPIClient()

    # Register routers
    dp.include_router(start_router)

    # Inject dependencies into handlers
    dp["api_client"] = api_client

    logger.info(f"Starting {settings.bot_name}...")

    try:
        # Check backend health
        if await api_client.health_check():
            logger.info("Backend API is healthy")
        else:
            logger.warning("Backend API is not responding")

        # Start polling
        await dp.start_polling(bot, api_client=api_client)
    finally:
        await api_client.close()
        await bot.session.close()
        logger.info("Bot stopped")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
