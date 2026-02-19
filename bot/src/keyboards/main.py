"""
Keyboard and button builders for Telegram Bot.
"""

from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    WebAppInfo,
)

from src.config import get_settings


def get_miniapp_button() -> InlineKeyboardButton:
    """Create button that opens the Mini App."""
    settings = get_settings()
    return InlineKeyboardButton(
        text="Создать мой список желаний",
        web_app=WebAppInfo(url=settings.miniapp_url),
    )


def get_skip_keyboard() -> ReplyKeyboardMarkup:
    """Create keyboard with a single 'Пропустить' button."""
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="Пропустить")]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


def get_remove_keyboard() -> ReplyKeyboardRemove:
    """Remove reply keyboard."""
    return ReplyKeyboardRemove()


def get_main_keyboard() -> InlineKeyboardMarkup:
    """
    Create main keyboard with Mini App button.

    Returns:
        InlineKeyboardMarkup with the main CTA button
    """
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [get_miniapp_button()],
        ]
    )
