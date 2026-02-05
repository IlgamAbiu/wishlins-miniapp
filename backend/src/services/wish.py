"""
Wish service implementation.
"""

from datetime import datetime, timezone
from typing import List
from uuid import UUID, uuid4

from src.domain.entities.wish import Wish, WishCreate, WishUpdate
from src.repositories.wish import WishRepository
from src.repositories.wishlist import WishlistRepository


class WishService:
    """Service for managing wishes."""

    def __init__(
        self,
        wish_repository: WishRepository,
        wishlist_repository: WishlistRepository,
    ):
        self._wish_repository = wish_repository
        self._wishlist_repository = wishlist_repository

    async def create_wish(self, data: WishCreate) -> Wish:
        """Create a new wish."""
        # Verify wishlist exists
        wishlist = await self._wishlist_repository.get_by_id(data.wishlist_id)
        if not wishlist:
            raise ValueError(f"Wishlist with id {data.wishlist_id} not found")

        now = datetime.now(timezone.utc)
        wish = Wish(
            id=uuid4(),
            wishlist_id=data.wishlist_id,
            title=data.title,
            description=data.description,
            link=data.link,
            image_url=data.image_url,
            price=data.price,
            currency=data.currency,
            is_booked=False,
            created_at=now,
            updated_at=now,
        )

        return await self._wish_repository.create(wish)

    async def get_wishlist_wishes(self, wishlist_id: UUID) -> List[Wish]:
        """Get all wishes for a wishlist."""
        # Verify wishlist exists
        wishlist = await self._wishlist_repository.get_by_id(wishlist_id)
        if not wishlist:
            raise ValueError(f"Wishlist with id {wishlist_id} not found")

        return await self._wish_repository.get_wishlist_wishes(wishlist_id)

    async def update_wish(self, wish_id: UUID, data: WishUpdate) -> Wish:
        """Update an existing wish."""
        wish = await self._wish_repository.get_by_id(wish_id)
        if not wish:
            raise ValueError(f"Wish with id {wish_id} not found")

        if data.title is not None:
            if not data.title.strip():
                raise ValueError("title cannot be empty")
            wish.title = data.title

        if data.description is not None:
            wish.description = data.description

        if data.link is not None:
            wish.link = data.link

        if data.image_url is not None:
            wish.image_url = data.image_url

        if data.price is not None:
            wish.price = data.price

        if data.currency is not None:
            wish.currency = data.currency

        if data.is_booked is not None:
            wish.is_booked = data.is_booked

        wish.updated_at = datetime.now(timezone.utc)

        return await self._wish_repository.update(wish)

    async def delete_wish(self, wish_id: UUID) -> None:
        """Delete a wish."""
        wish = await self._wish_repository.get_by_id(wish_id)
        if not wish:
            raise ValueError(f"Wish with id {wish_id} not found")

        await self._wish_repository.delete(wish_id)
