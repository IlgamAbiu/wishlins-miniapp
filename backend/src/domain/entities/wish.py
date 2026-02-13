"""
Wish domain entity.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID


class WishPriority(str, Enum):
    """Priority levels for wishes."""
    JUST_WANT = "just_want"
    REALLY_WANT = "really_want"


@dataclass
class Wish:
    """Wish domain entity."""

    id: UUID
    wishlist_id: UUID
    title: str
    description: Optional[str]
    link: Optional[str]
    image_url: Optional[str]
    price: Optional[float]
    currency: Optional[str]
    is_booked: bool
    priority: WishPriority
    store: Optional[str]
    created_at: datetime
    updated_at: datetime

    def to_dict(self) -> dict:
        """Convert entity to dictionary."""
        return {
            "id": str(self.id),
            "wishlist_id": str(self.wishlist_id),
            "title": self.title,
            "description": self.description,
            "link": self.link,
            "image_url": self.image_url,
            "price": self.price,
            "currency": self.currency,
            "is_booked": self.is_booked,
            "priority": self.priority.value,
            "store": self.store,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


@dataclass
class WishCreate:
    """Data required to create a new wish."""

    wishlist_id: UUID
    title: str
    description: Optional[str] = None
    link: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = "RUB"
    priority: WishPriority = WishPriority.JUST_WANT
    store: Optional[str] = None

    def __post_init__(self):
        if not self.title or not self.title.strip():
            raise ValueError("title is required and cannot be empty")
        if not isinstance(self.priority, WishPriority):
            raise ValueError("priority must be a valid WishPriority enum value")


@dataclass
class WishUpdate:
    """Data for updating an existing wish."""

    title: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    is_booked: Optional[bool] = None
    priority: Optional[WishPriority] = None
    store: Optional[str] = None
