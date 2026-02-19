"""
Wish service implementation.
"""

from datetime import datetime, timezone
from typing import List
from uuid import UUID, uuid4

from src.domain.entities.wish import Wish, WishCreate, WishUpdate
from src.domain.entities.wishlist import WishlistCreate
from src.repositories import WishlistRepository, WishRepository


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
            subtitle=data.subtitle,
            description=data.description,
            link=data.link,
            image_url=data.image_url,
            price=data.price,
            currency=data.currency,
            is_booked=False,
            booked_by_user_id=None,
            priority=data.priority,
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

        return await self._wish_repository.get_by_wishlist_id(wishlist_id)

    async def update_wish(self, wish_id: UUID, data: WishUpdate) -> Wish:
        """Update an existing wish."""
        wish = await self._wish_repository.get_by_id(wish_id)
        if not wish:
            raise ValueError(f"Wish with id {wish_id} not found")

        if data.title is not None:
            if not data.title.strip():
                raise ValueError("title cannot be empty")
            wish.title = data.title

        if data.subtitle is not None:
            wish.subtitle = data.subtitle

        if data.description is not None:
            wish.description = data.description

        if data.image_url is not None:
            wish.image_url = data.image_url

        if data.price is not None:
            wish.price = data.price

        if data.currency is not None:
            wish.currency = data.currency

        if data.is_booked is not None:
            wish.is_booked = data.is_booked

        if data.priority is not None:
            wish.priority = data.priority

        if data.link is not None:
            wish.link = data.link

        if data.wishlist_id is not None:
            # Verify new wishlist exists
            new_wishlist = await self._wishlist_repository.get_by_id(data.wishlist_id)
            if not new_wishlist:
                raise ValueError(f"Wishlist with id {data.wishlist_id} not found")
            wish.wishlist_id = data.wishlist_id

        wish.updated_at = datetime.now(timezone.utc)

        return await self._wish_repository.update(wish)

    async def delete_wish(self, wish_id: UUID) -> None:
        """Delete a wish."""
        wish = await self._wish_repository.get_by_id(wish_id)
        if not wish:
            raise ValueError(f"Wish with id {wish_id} not found")

        await self._wish_repository.delete(wish_id)

    async def fulfill_wish(self, wish_id: UUID, user_id: UUID) -> Wish:
        """Mark a wish as fulfilled by moving it to 'Fulfilled Dreams' wishlist."""
        wish = await self._wish_repository.get_by_id(wish_id)
        if not wish:
            raise ValueError(f"Wish with id {wish_id} not found")

        # Verify ownership
        current_wishlist = await self._wishlist_repository.get_by_id(wish.wishlist_id)
        if not current_wishlist or current_wishlist.user_id != user_id:
            raise ValueError("Not authorized to fulfill this wish")

        # Find or create 'Fulfilled Dreams' wishlist
        user_wishlists = await self._wishlist_repository.get_by_user_id(user_id)
        fulfilled_wishlist = next(
            (w for w in user_wishlists if w.title == "Сбывшиеся мечты"), None
        )

        if not fulfilled_wishlist:
            fulfilled_wishlist = await self._wishlist_repository.create(
                WishlistCreate(
                    user_id=user_id,
                    title="Сбывшиеся мечты",
                    description="Мои исполненные желания",
                    is_public=False,
                    is_default=False,
                    emoji="✨",
                )
            )

        # Move wish
        wish.wishlist_id = fulfilled_wishlist.id
        wish.is_booked = False  # Reset booking status as it is now fulfilled
        wish.booked_by_user_id = None
        wish.updated_at = datetime.now(timezone.utc)

        return await self._wish_repository.update(wish)

    async def book_wish(self, wish_id: UUID, booker_id: UUID) -> Wish:
        """Book a wish by a non-owner user."""
        wish = await self._wish_repository.get_by_id(wish_id)
        if not wish:
            raise ValueError(f"Wish with id {wish_id} not found")

        wish.is_booked = True
        wish.booked_by_user_id = booker_id
        wish.updated_at = datetime.now(timezone.utc)

        return await self._wish_repository.update(wish)

    async def unbook_wish(self, wish_id: UUID, requester_id: UUID) -> Wish:
        """Cancel a booking. Only the user who booked it can cancel."""
        wish = await self._wish_repository.get_by_id(wish_id)
        if not wish:
            raise ValueError(f"Wish with id {wish_id} not found")

        if wish.booked_by_user_id != requester_id:
            raise ValueError("You did not book this wish")

        wish.is_booked = False
        wish.booked_by_user_id = None
        wish.updated_at = datetime.now(timezone.utc)

        return await self._wish_repository.update(wish)
