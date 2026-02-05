"""
Telegram Bot entry point.
"""

import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.types import BotCommand

from src.api.client import backend_client
from src.config import get_settings
from src.handlers import start, web_app

# Configure logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

# Bot description texts
BOT_DESCRIPTION = """
Создавайте и делитесь списками желаний с друзьями и семьей.
""".strip()

BOT_ABOUT = """
👋 Добро пожаловать в список желаний!

Создавайте и делитесь списками желаний с друзьями и семьей. Больше никогда не получайте повторяющиеся подарки.

Нажмите "Start", чтобы начать! 🎁
""".strip()


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
        # Set bot description and about text
        try:
            await bot.set_my_description(description=BOT_DESCRIPTION)
            await bot.set_my_short_description(short_description=BOT_DESCRIPTION)
            logger.info("Bot description set successfully")
        except Exception as e:
            logger.warning(f"Failed to set bot description: {e}")

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
