"""
Wish ORM model for SQLAlchemy.
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, Float, func, Enum as SQLAlchemyEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.infrastructure.database import Base
from src.domain.entities.wish import WishPriority


class WishModel(Base):
    """Wish database model."""

    __tablename__ = "wishes"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    wishlist_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("wishlists.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    link: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )
    image_url: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )
    price: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )
    currency: Mapped[str | None] = mapped_column(
        String(3),
        default="RUB",
        nullable=True,
    )
    is_booked: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    priority: Mapped[WishPriority] = mapped_column(
        SQLAlchemyEnum(WishPriority, native_enum=False),
        nullable=False,
        default=WishPriority.JUST_WANT,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Wish(id={self.id}, wishlist_id={self.wishlist_id}, title={self.title})>"
