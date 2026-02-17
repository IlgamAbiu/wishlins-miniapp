"""
User service containing business logic.
Service layer orchestrates domain logic and repository calls.
"""

from typing import Optional
from uuid import UUID

from src.domain.entities import User, UserCreate, UserUpdate
from src.repositories import UserRepository


# Analytics event names (placeholders for future implementation)
class AnalyticsEvents:
    BOT_START = "bot_start"
    USER_REGISTERED = "user_registered"
    MINIAPP_OPENED = "miniapp_opened"


class UserService:
    """Service for user-related business logic."""

    def __init__(self, repository: UserRepository):
        self._repository = repository

    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by internal UUID."""
        return await self._repository.get_by_id(user_id)

    async def get_user_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        """Get user by Telegram ID."""
        return await self._repository.get_by_telegram_id(telegram_id)

    async def update_user_profile(self, telegram_id: int, data: UserUpdate) -> Optional[User]:
        """Update user profile by Telegram ID."""
        return await self._repository.update_by_telegram_id(telegram_id, data)

    async def register_or_update_user(self, data: UserCreate) -> tuple[User, bool]:
        """
        Register a new user or update existing one.

        Implements idempotent registration logic:
        - If user does not exist -> create new user
        - If user exists -> update profile fields

        Returns:
            Tuple of (User, is_new_user)
        """
        existing_user = await self._repository.get_by_telegram_id(data.telegram_id)

        if existing_user is None:
            # Create new user
            user = await self._repository.create(data)
            
            # Create default "My Wishes" wishlist
            # We need a session, but repositories take session in init.
            # UserService takes UserRepository which has session.
            # We can reuse the session from UserRepository
            from src.repositories import WishlistRepository
            from src.domain.entities.wishlist import WishlistCreate
            
            wishlist_repo = WishlistRepository(self._repository._session)
            await wishlist_repo.create(
                WishlistCreate(
                    user_id=user.id,
                    title="Мои желания",
                    description="Мой основной список желаний",
                    is_public=True,
                    is_default=True
                )
            )

            # Placeholder: track analytics event
            self._track_event(AnalyticsEvents.USER_REGISTERED, user)
            return user, True

        # Update existing user with new profile data
        update_data = UserUpdate(
            username=data.username,
            first_name=data.first_name,
            last_name=data.last_name,
            avatar_url=data.avatar_url,
        )
        updated_user = await self._repository.update_by_telegram_id(
            data.telegram_id, update_data
        )
        return updated_user or existing_user, False

    def _track_event(self, event_name: str, user: User) -> None:
        """
        Placeholder for analytics tracking.

        Events to track:
        - bot_start: User started the bot
        - user_registered: New user was registered
        - miniapp_opened: User opened the Mini App
        """
        # TODO: Implement actual analytics tracking
        pass
