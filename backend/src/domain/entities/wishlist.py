"""
Wishlist domain entity.
Pure Python dataclasses with no framework dependencies.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID


@dataclass
class Wishlist:
    """Wishlist domain entity representing a user's wishlist."""

    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    is_public: bool
    created_at: datetime
    updated_at: datetime

    def to_dict(self) -> dict:
        """Convert entity to dictionary."""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "title": self.title,
            "description": self.description,
            "is_public": self.is_public,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


@dataclass
class WishlistCreate:
    """Data required to create a new wishlist."""

    user_id: UUID
    title: str
    description: Optional[str] = None
    is_public: bool = False

    def __post_init__(self):
        if not self.title or not self.title.strip():
            raise ValueError("title is required and cannot be empty")


@dataclass
class WishlistUpdate:
    """Data for updating an existing wishlist."""

    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
