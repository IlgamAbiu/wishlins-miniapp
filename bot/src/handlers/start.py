"""
Start command handler.
Handles /start command and user registration flow with optional birth date collection.
"""

import logging
from datetime import datetime

from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import Message

from src.api import BackendAPIClient
from src.keyboards import get_main_keyboard, get_remove_keyboard, get_skip_keyboard

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


class RegistrationStates(StatesGroup):
    waiting_for_birth_date = State()


@router.message(CommandStart())
async def handle_start(message: Message, state: FSMContext, api_client: BackendAPIClient) -> None:
    """
    Handle /start command.

    Flow:
    1. Extract user data from message
    2. Register/update user in backend
    3. Ask for birth date (optional)
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

    # Save telegram_id for the next step and set FSM state
    await state.set_data({"telegram_id": telegram_id})
    await state.set_state(RegistrationStates.waiting_for_birth_date)

    await message.answer(
        "🎂 Когда твой день рождения?\n\n"
        "Введи дату в формате ДД.ММ.ГГГГ\n"
        "Например: 15.03.1995\n\n"
        "Или нажми «Пропустить», если не хочешь указывать.",
        reply_markup=get_skip_keyboard(),
    )


@router.message(RegistrationStates.waiting_for_birth_date)
async def handle_birth_date(message: Message, state: FSMContext, api_client: BackendAPIClient) -> None:
    """
    Handle birth date input after /start.
    Accepts DD.MM.YYYY format or 'Пропустить'.
    """
    data = await state.get_data()
    telegram_id = data.get("telegram_id")

    text = (message.text or "").strip()

    if text != "Пропустить":
        try:
            birth_date = datetime.strptime(text, "%d.%m.%Y").date()
        except ValueError:
            await message.answer(
                "Не могу распознать дату 😔\n\n"
                "Пожалуйста, введи в формате ДД.ММ.ГГГГ, например: 15.03.1995\n"
                "Или нажми «Пропустить»."
            )
            return  # Stay in the same state, wait for correct input

        if telegram_id:
            try:
                await api_client.update_user_profile(telegram_id=telegram_id, birth_date=birth_date)
                logger.info(f"Birth date saved for user {telegram_id}: {birth_date}")
            except Exception as e:
                logger.error(f"Failed to save birth date for user {telegram_id}: {e}")

    await state.clear()

    # Send welcome messages with Mini App button
    await message.answer(text=WELCOME_INFO_MESSAGE, reply_markup=get_remove_keyboard())
    await message.answer(text=WELCOME_CTA_MESSAGE, reply_markup=get_main_keyboard())
