"""
User repository for database operations.
Repository layer handles only database interactions.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities import User, UserCreate, UserUpdate
from src.infrastructure.models import UserModel


class UserRepository:
    """Repository for User entity database operations."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by UUID."""
        stmt = select(UserModel).where(UserModel.id == user_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        """Get user by Telegram ID."""
        stmt = select(UserModel).where(UserModel.telegram_id == telegram_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def create(self, data: UserCreate) -> User:
        """Create a new user."""
        model = UserModel(
            telegram_id=data.telegram_id,
            username=data.username,
            first_name=data.first_name,
            last_name=data.last_name,
            avatar_url=data.avatar_url,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, user_id: UUID, data: UserUpdate) -> Optional[User]:
        """Update an existing user."""
        update_data = {}
        if data.username is not None:
            update_data["username"] = data.username
        if data.first_name is not None:
            update_data["first_name"] = data.first_name
        if data.last_name is not None:
            update_data["last_name"] = data.last_name
        if data.avatar_url is not None:
            update_data["avatar_url"] = data.avatar_url
        if data.profile_text is not None:
            update_data["profile_text"] = data.profile_text

        if not update_data:
            return await self.get_by_id(user_id)

        stmt = (
            update(UserModel)
            .where(UserModel.id == user_id)
            .values(**update_data)
            .returning(UserModel)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update_by_telegram_id(
        self, telegram_id: int, data: UserUpdate
    ) -> Optional[User]:
        """Update user by Telegram ID."""
        update_data = {}
        if data.username is not None:
            update_data["username"] = data.username
        if data.first_name is not None:
            update_data["first_name"] = data.first_name
        if data.last_name is not None:
            update_data["last_name"] = data.last_name
        if data.avatar_url is not None:
            update_data["avatar_url"] = data.avatar_url
        if data.profile_text is not None:
            update_data["profile_text"] = data.profile_text

        if not update_data:
            return await self.get_by_telegram_id(telegram_id)

        stmt = (
            update(UserModel)
            .where(UserModel.telegram_id == telegram_id)
            .values(**update_data)
            .returning(UserModel)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    @staticmethod
    def _to_entity(model: UserModel) -> User:
        """Convert ORM model to domain entity."""
        return User(
            id=model.id,
            telegram_id=model.telegram_id,
            username=model.username,
            first_name=model.first_name,
            last_name=model.last_name,
            avatar_url=model.avatar_url,
            profile_text=model.profile_text,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
