"""
User ORM model for SQLAlchemy.
"""

from datetime import datetime, date
from uuid import uuid4


from sqlalchemy import BigInteger, DateTime, String, Date, func, Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.infrastructure.database import Base


user_friends = Table(
    "user_friends",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
    Column("friend_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
)


class UserModel(Base):
    """User database model."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    telegram_id: Mapped[int] = mapped_column(
        BigInteger,
        unique=True,
        nullable=False,
        index=True,
    )
    username: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    first_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    last_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    avatar_url: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    profile_text: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        server_default="Saving for a dream ✨",
    )
    birth_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        comment="User's birth date",
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

    friends: Mapped[list["UserModel"]] = relationship(
        "UserModel",
        secondary=user_friends,
        primaryjoin=id == user_friends.c.user_id,
        secondaryjoin=id == user_friends.c.friend_id,
        backref="followed_by",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, telegram_id={self.telegram_id}, username={self.username})>"
