"""
Start command handler.
Handles /start command and user registration flow.
"""

import logging

from aiogram import Router
from aiogram.filters import Command, CommandStart
from aiogram.types import Message

from src.api import BackendAPIClient
from src.keyboards import get_main_keyboard

logger = logging.getLogger(__name__)
router = Router(name="start")

# Welcome messages
WELCOME_INFO_MESSAGE = """
👋 Добро пожаловать в список желаний!

Создавайте и делитесь списками желаний с друзьями и семьей. Больше никогда не получайте повторяющиеся подарки.
""".strip()

WELCOME_CTA_MESSAGE = """
Нажмите кнопку ниже, чтобы создать свой список желаний.
""".strip()


@router.message(CommandStart())
async def handle_start(message: Message, api_client: BackendAPIClient) -> None:
    """
    Handle /start command.

    Flow:
    1. Extract user data from message
    2. Register/update user in backend
    3. Send welcome message with Mini App button
    """
    user = message.from_user
    if not user:
        logger.warning("Received /start without user info")
        return

    # Extract user data
    telegram_id = user.id
    username = user.username
    first_name = user.first_name or "User"
    last_name = user.last_name

    # Get user avatar URL (optional)
    avatar_url = None
    try:
        photos = await message.bot.get_user_profile_photos(telegram_id, limit=1)
        if photos.photos and photos.photos[0]:
            file = await message.bot.get_file(photos.photos[0][0].file_id)
            if file.file_path:
                avatar_url = f"https://api.telegram.org/file/bot{message.bot.token}/{file.file_path}"
    except Exception as e:
        logger.debug(f"Could not get avatar: {e}")

    # Register user in backend
    try:
        result = await api_client.register_user(
            telegram_id=telegram_id,
            username=username,
            first_name=first_name,
            last_name=last_name,
            avatar_url=avatar_url,
        )
        logger.info(
            f"User {'registered' if result.is_new_user else 'updated'}: "
            f"{telegram_id} (@{username})"
        )
    except Exception as e:
        logger.error(f"Failed to register user {telegram_id}: {e}")
        # Continue anyway - show welcome message even if registration fails
        # User can be registered on next interaction

    # Send welcome info message (without buttons)
    await message.answer(text=WELCOME_INFO_MESSAGE)

    # Send CTA message with Mini App button
    await message.answer(
        text=WELCOME_CTA_MESSAGE,
        reply_markup=get_main_keyboard(),
    )
