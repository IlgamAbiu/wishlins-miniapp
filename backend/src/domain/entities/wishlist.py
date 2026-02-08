"""
Wishlist domain entity.
Pure Python dataclasses with no framework dependencies.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Union
from uuid import UUID


class _Unset:
    """Sentinel class to distinguish between None and unset values in updates."""
    def __repr__(self) -> str:
        return "UNSET"


# Singleton sentinel value
UNSET = _Unset()


@dataclass
class Wishlist:
    """Wishlist domain entity representing a user's wishlist."""

    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    is_public: bool
    is_default: bool
    emoji: Optional[str]
    event_date: Optional[datetime]
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
            "is_default": self.is_default,
            "emoji": self.emoji,
            "event_date": self.event_date.isoformat() if self.event_date else None,
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
    is_default: bool = False
    emoji: Optional[str] = None
    event_date: Optional[datetime] = None

    def __post_init__(self):
        if not self.title or not self.title.strip():
            raise ValueError("title is required and cannot be empty")


@dataclass
class WishlistUpdate:
    """Data for updating an existing wishlist.

    Uses UNSET sentinel to distinguish between fields that should not be updated
    and fields that should be set to None/null.
    """

    title: Union[str, _Unset] = UNSET
    description: Union[Optional[str], _Unset] = UNSET
    is_public: Union[bool, _Unset] = UNSET
    emoji: Union[Optional[str], _Unset] = UNSET
    event_date: Union[Optional[datetime], _Unset] = UNSET
