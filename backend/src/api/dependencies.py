"""
FastAPI dependency injection.
"""

from typing import Annotated, AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database import get_session
from src.repositories import UserRepository, WishlistRepository
from src.services import UserService, WishlistService


async def get_user_repository(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> UserRepository:
    """Dependency for UserRepository."""
    return UserRepository(session)


async def get_user_service(
    repository: Annotated[UserRepository, Depends(get_user_repository)]
) -> UserService:
    """Dependency for UserService."""
    return UserService(repository)


async def get_wishlist_repository(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> WishlistRepository:
    """Dependency for WishlistRepository."""
    return WishlistRepository(session)


async def get_wishlist_service(
    repository: Annotated[WishlistRepository, Depends(get_wishlist_repository)]
) -> WishlistService:
    """Dependency for WishlistService."""
    return WishlistService(repository)


# Type aliases for cleaner route signatures
UserServiceDep = Annotated[UserService, Depends(get_user_service)]
WishlistServiceDep = Annotated[WishlistService, Depends(get_wishlist_service)]
