"""
Wish repository implementation.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.wish import Wish
from src.infrastructure.models.wish import WishModel


class WishRepository:
    """Repository for managing wishes."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, wish: Wish) -> Wish:
        """Create a new wish."""
        model = WishModel(
            id=wish.id,
            wishlist_id=wish.wishlist_id,
            title=wish.title,
            subtitle=wish.subtitle,
            description=wish.description,
            link=wish.link,
            image_url=wish.image_url,
            price=wish.price,
            currency=wish.currency,
            is_booked=wish.is_booked,
            priority=wish.priority,
            created_at=wish.created_at,
            updated_at=wish.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return wish

    async def get_by_id(self, wish_id: UUID) -> Optional[Wish]:
        """Get wish by ID."""
        stmt = select(WishModel).where(WishModel.id == wish_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            return None

        return self._to_entity(model)

    async def get_by_wishlist_id(self, wishlist_id: UUID) -> List[Wish]:
        """Get all wishes for a wishlist, sorted by priority and creation date."""
        stmt = (
            select(WishModel)
            .where(WishModel.wishlist_id == wishlist_id)
            .order_by(
                WishModel.priority.desc(),  # really_want first
                WishModel.created_at.desc()
            )
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def update(self, wish: Wish) -> Wish:
        """Update an existing wish."""
        stmt = select(WishModel).where(WishModel.id == wish.id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            raise ValueError(f"Wish with id {wish.id} not found")

        model.wishlist_id = wish.wishlist_id
        model.title = wish.title
        model.subtitle = wish.subtitle
        model.description = wish.description
        model.link = wish.link
        model.image_url = wish.image_url
        model.price = wish.price
        model.currency = wish.currency
        model.is_booked = wish.is_booked
        model.priority = wish.priority
        model.updated_at = wish.updated_at

        # Ensure we commit changes if not using a transaction middleware
        # But wait, typically flush is enough if commit happens at the end of request.
        # But we don't see commit here.
        # If the calling code (FastAPI dependency) doesn't commit, changes are lost.
        # Usually flush is fine if `session.commit()` is called later.
        # Let's check api/dependencies.py if needed.
        # But for now, updating wishlist_id is definitely missing.

        await self._session.flush()
        return wish

    async def delete(self, wish_id: UUID) -> None:
        """Delete a wish."""
        stmt = delete(WishModel).where(WishModel.id == wish_id)
        await self._session.execute(stmt)

    def _to_entity(self, model: WishModel) -> Wish:
        """Convert ORM model to domain entity."""
        return Wish(
            id=model.id,
            wishlist_id=model.wishlist_id,
            title=model.title,
            subtitle=model.subtitle,
            description=model.description,
            link=model.link,
            image_url=model.image_url,
            price=model.price,
            currency=model.currency,
            is_booked=model.is_booked,
            priority=model.priority,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
