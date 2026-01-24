"""
FastAPI dependency injection.
"""

from typing import Annotated, AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database import get_session
from src.repositories import UserRepository
from src.services import UserService


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


# Type aliases for cleaner route signatures
UserServiceDep = Annotated[UserService, Depends(get_user_service)]
