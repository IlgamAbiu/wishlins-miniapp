"""
Wishlist repository for database operations.
Repository layer handles only database interactions.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities import Wishlist, WishlistCreate, WishlistUpdate
from src.infrastructure.models import WishlistModel


class WishlistRepository:
    """Repository for Wishlist entity database operations."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_id(self, wishlist_id: UUID) -> Optional[Wishlist]:
        """Get wishlist by UUID."""
        stmt = select(WishlistModel).where(WishlistModel.id == wishlist_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_user_id(self, user_id: UUID) -> list[Wishlist]:
        """Get all wishlists for a specific user."""
        stmt = (
            select(WishlistModel)
            .where(WishlistModel.user_id == user_id)
            .order_by(WishlistModel.created_at.desc())
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def create(self, data: WishlistCreate) -> Wishlist:
        """Create a new wishlist."""
        model = WishlistModel(
            user_id=data.user_id,
            title=data.title,
            description=data.description,
            is_public=data.is_public,
            is_default=data.is_default,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(
        self, wishlist_id: UUID, data: WishlistUpdate
    ) -> Optional[Wishlist]:
        """Update an existing wishlist."""
        update_data = {}
        if data.title is not None:
            update_data["title"] = data.title
        if data.description is not None:
            update_data["description"] = data.description
        if data.is_public is not None:
            update_data["is_public"] = data.is_public

        if not update_data:
            return await self.get_by_id(wishlist_id)

        stmt = (
            update(WishlistModel)
            .where(WishlistModel.id == wishlist_id)
            .values(**update_data)
            .returning(WishlistModel)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def delete(self, wishlist_id: UUID) -> bool:
        """Delete a wishlist."""
        stmt = delete(WishlistModel).where(WishlistModel.id == wishlist_id)
        result = await self._session.execute(stmt)
        return result.rowcount > 0

    @staticmethod
    def _to_entity(model: WishlistModel) -> Wishlist:
        """Convert ORM model to domain entity."""
        return Wishlist(
            id=model.id,
            user_id=model.user_id,
            title=model.title,
            description=model.description,
            is_public=model.is_public,
            is_default=model.is_default,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
