"""
User domain entity.
Pure Python dataclasses with no framework dependencies.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4


@dataclass
class User:
    """User domain entity representing a registered user."""

    id: UUID
    telegram_id: int
    username: Optional[str]
    first_name: str
    last_name: Optional[str]
    avatar_url: Optional[str]
    profile_text: Optional[str]
    created_at: datetime
    updated_at: datetime

    def to_dict(self) -> dict:
        """Convert entity to dictionary."""
        return {
            "id": str(self.id),
            "telegram_id": self.telegram_id,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "avatar_url": self.avatar_url,
            "profile_text": self.profile_text,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @property
    def display_name(self) -> str:
        """Get user display name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.username or "User"


@dataclass
class UserCreate:
    """Data required to create a new user."""

    telegram_id: int
    username: Optional[str] = None
    first_name: str = ""
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None

    def __post_init__(self):
        if not self.telegram_id:
            raise ValueError("telegram_id is required")


@dataclass
class UserUpdate:
    """Data for updating an existing user."""

    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    profile_text: Optional[str] = None
    birth_date: Optional[date] = None
