"""
Pydantic schemas for API request/response validation.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    """Request schema for user registration."""

    telegram_id: int = Field(..., description="Telegram user ID")
    username: Optional[str] = Field(None, description="Telegram username")
    first_name: str = Field(..., description="User's first name")
    last_name: Optional[str] = Field(None, description="User's last name")
    avatar_url: Optional[str] = Field(None, description="User's avatar URL")

    model_config = {
        "json_schema_extra": {
            "example": {
                "telegram_id": 123456789,
                "username": "johndoe",
                "first_name": "John",
                "last_name": "Doe",
                "avatar_url": None,
            }
        }
    }


class UserResponse(BaseModel):
    """Response schema for user data."""

    id: UUID = Field(..., description="Internal user ID")
    telegram_id: int = Field(..., description="Telegram user ID")
    username: Optional[str] = Field(None, description="Telegram username")
    first_name: str = Field(..., description="User's first name")
    last_name: Optional[str] = Field(None, description="User's last name")
    avatar_url: Optional[str] = Field(None, description="User's avatar URL")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "telegram_id": 123456789,
                "username": "johndoe",
                "first_name": "John",
                "last_name": "Doe",
                "avatar_url": None,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z",
            }
        }
    }


class UserRegisterResponse(BaseModel):
    """Response schema for user registration."""

    user: UserResponse
    is_new_user: bool = Field(..., description="Whether this is a new registration")

    model_config = {
        "json_schema_extra": {
            "example": {
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "telegram_id": 123456789,
                    "username": "johndoe",
                    "first_name": "John",
                    "last_name": "Doe",
                    "avatar_url": None,
                    "created_at": "2024-01-15T10:30:00Z",
                    "updated_at": "2024-01-15T10:30:00Z",
                },
                "is_new_user": True,
            }
        }
    }


class ErrorResponse(BaseModel):
    """Standard error response schema."""

    detail: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")


class WishlistCreateRequest(BaseModel):
    """Request schema for creating a wishlist."""

    title: str = Field(..., min_length=1, max_length=255, description="Wishlist title")
    description: Optional[str] = Field(None, description="Wishlist description")
    is_public: bool = Field(default=False, description="Whether wishlist is public")
    emoji: Optional[str] = Field(None, description="Event emoji")
    event_date: Optional[datetime] = Field(None, description="Date of the event")

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Birthday Wishlist",
                "description": "Things I want for my birthday",
                "is_public": True,
                "emoji": "🎂",
                "event_date": "2024-01-15T00:00:00Z"
            }
        }
    }


class WishlistUpdateRequest(BaseModel):
    """Request schema for updating a wishlist."""

    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Wishlist title")
    description: Optional[str] = Field(None, description="Wishlist description")
    is_public: Optional[bool] = Field(None, description="Whether wishlist is public")
    emoji: Optional[str] = Field(None, description="Event emoji")
    event_date: Optional[datetime] = Field(None, description="Date of the event")

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Updated Birthday Wishlist",
                "is_public": False,
                "emoji": "🎉"
            }
        }
    }


class WishlistResponse(BaseModel):
    """Response schema for wishlist data."""

    id: UUID = Field(..., description="Wishlist ID")
    user_id: UUID = Field(..., description="Owner user ID")
    title: str = Field(..., description="Wishlist title")
    description: Optional[str] = Field(None, description="Wishlist description")
    is_public: bool = Field(..., description="Whether wishlist is public")
    is_default: bool = Field(..., description="Whether this is the default wishlist")
    emoji: Optional[str] = Field(None, description="Event emoji")
    event_date: Optional[datetime] = Field(None, description="Date of the event")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Birthday Wishlist",
                "description": "Things I want for my birthday",
                "is_public": True,
                "emoji": "🎂",
                "event_date": "2024-01-15T00:00:00Z",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z",
            }
        }
    }


class WishlistListResponse(BaseModel):
    """Response schema for list of wishlists."""

    wishlists: list[WishlistResponse]
    total: int = Field(..., description="Total number of wishlists")

    model_config = {
        "json_schema_extra": {
            "example": {
                "wishlists": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440001",
                        "user_id": "550e8400-e29b-41d4-a716-446655440000",
                        "title": "Birthday Wishlist",
                        "description": "Things I want for my birthday",
                        "is_public": True,
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-15T10:30:00Z",
                    }
                ],
                "total": 1,
            }
        }
    }


class WishBase(BaseModel):
    """Base Wish schema."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    link: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = "RUB"


class WishCreateRequest(WishBase):
    """Schema for creating a wish."""

    wishlist_id: UUID = Field(..., description="Wishlist ID to add the wish to")


class WishUpdateRequest(BaseModel):
    """Schema for updating a wish."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    link: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    is_booked: Optional[bool] = None


class WishResponse(WishBase):
    """Schema for wish response."""

    id: UUID
    wishlist_id: UUID
    is_booked: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

