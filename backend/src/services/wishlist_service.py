"""
Wishlist service containing business logic.
Service layer orchestrates domain logic and repository calls.
"""

from typing import Optional
from uuid import UUID

from src.domain.entities import Wishlist, WishlistCreate, WishlistUpdate
from src.repositories import WishlistRepository


class WishlistService:
    """Service for wishlist-related business logic."""

    def __init__(self, repository: WishlistRepository):
        self._repository = repository

    async def get_wishlist_by_id(self, wishlist_id: UUID) -> Optional[Wishlist]:
        """Get wishlist by ID."""
        return await self._repository.get_by_id(wishlist_id)

    async def get_user_wishlists(self, user_id: UUID) -> list[Wishlist]:
        """Get all wishlists for a specific user."""
        return await self._repository.get_by_user_id(user_id)

    async def create_wishlist(self, data: WishlistCreate) -> Wishlist:
        """Create a new wishlist."""
        return await self._repository.create(data)

    async def update_wishlist(
        self, wishlist_id: UUID, data: WishlistUpdate
    ) -> Optional[Wishlist]:
        """Update an existing wishlist."""
        return await self._repository.update(wishlist_id, data)

    async def delete_wishlist(self, wishlist_id: UUID) -> bool:
        """Delete a wishlist."""
        return await self._repository.delete(wishlist_id)
