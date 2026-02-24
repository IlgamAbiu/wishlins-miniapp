"""
User API routes.
API layer handles only request/response orchestration.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies import UserServiceDep
from src.api.schemas import (
    ErrorResponse,
    UserRegisterRequest,
    UserRegisterResponse,
    UserResponse,
    UserUpdateRequest,
)
from src.domain.entities import UserCreate, UserUpdate
from src.infrastructure.database import get_session
from src.repositories import WishRepository

router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/register",
    response_model=UserRegisterResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "User registered or updated successfully"},
        400: {"model": ErrorResponse, "description": "Invalid request"},
    },
    summary="Register or update user",
    description="Register a new user or update existing user profile. "
    "This endpoint is idempotent - calling it multiple times with "
    "the same telegram_id will update the user's profile.",
)
async def register_user(
    request: UserRegisterRequest,
    user_service: UserServiceDep,
) -> UserRegisterResponse:
    """
    Register or update a user from Telegram.

    - If user with telegram_id doesn't exist: creates new user
    - If user exists: updates profile fields
    """
    user_data = UserCreate(
        telegram_id=request.telegram_id,
        username=request.username,
        first_name=request.first_name,
        last_name=request.last_name,
        avatar_url=request.avatar_url,
        birth_date=request.birth_date,
    )

    user, is_new = await user_service.register_or_update_user(user_data)

    return UserRegisterResponse(
        user=UserResponse(
            id=user.id,
            telegram_id=user.telegram_id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            avatar_url=user.avatar_url,
            profile_text=user.profile_text,
            birth_date=user.birth_date,
            is_subscribed=False,  # default for own profile returned
            created_at=user.created_at,
            updated_at=user.updated_at,
        ),
        is_new_user=is_new,
    )


@router.get(
    "/telegram/{telegram_id}",
    response_model=UserResponse,
    responses={
        200: {"description": "User found"},
        404: {"model": ErrorResponse, "description": "User not found"},
    },
    summary="Get user by Telegram ID",
    description="Retrieve user data by their Telegram ID.",
)
async def get_user_by_telegram_id(
    telegram_id: int,
    user_service: UserServiceDep,
    current_user_id: int = None,  # Optional: current user's telegram_id to check subscription
) -> UserResponse:
    """Get user by Telegram ID."""
    user = await user_service.get_user_by_telegram_id(telegram_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    is_subscribed = False
    if current_user_id:
        current_user = await user_service.get_user_by_telegram_id(current_user_id)
        if current_user:
            is_subscribed = await user_service.is_subscribed(current_user.id, user.id)

    return UserResponse(
        id=user.id,
        telegram_id=user.telegram_id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        avatar_url=user.avatar_url,
        profile_text=user.profile_text,
        birth_date=user.birth_date,
        is_subscribed=is_subscribed,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.get(
    "/friends",
    response_model=list[UserResponse],
    summary="Get friends list",
    description="Get list of friends (subscribed users) sorted by next birthday.",
)
async def get_friends(
    telegram_id: int,
    user_service: UserServiceDep,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[UserResponse]:
    """Get friends list."""
    current_user = await user_service.get_user_by_telegram_id(telegram_id)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    friends = await user_service.get_friends(current_user.id)
    wish_repo = WishRepository(session)

    result = []
    for friend in friends:
        wish_count = await wish_repo.count_by_user_id(friend.id)
        result.append(
            UserResponse(
                id=friend.id,
                telegram_id=friend.telegram_id,
                username=friend.username,
                first_name=friend.first_name,
                last_name=friend.last_name,
                avatar_url=friend.avatar_url,
                profile_text=friend.profile_text,
                birth_date=friend.birth_date,
                is_subscribed=True,
                wish_count=wish_count,
                created_at=friend.created_at,
                updated_at=friend.updated_at,
            )
        )
    return result


@router.post(
    "/{target_id}/subscribe",
    status_code=status.HTTP_200_OK,
    summary="Subscribe to a user",
    description="Subscribe to another user (follow).",
)
async def subscribe_user(
    target_id: int,
    current_user_id: int,  # Passed as query param currently
    user_service: UserServiceDep,
):
    """Subscribe to a user."""
    target_user = await user_service.get_user_by_telegram_id(target_id)
    current_user = await user_service.get_user_by_telegram_id(current_user_id)
    
    if not target_user or not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    if target_user.id == current_user.id:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot subscribe to yourself",
        )

    await user_service.subscribe(current_user.id, target_user.id)
    return {"message": "Subscribed successfully"}


@router.delete(
    "/{target_id}/subscribe",
    status_code=status.HTTP_200_OK,
    summary="Unsubscribe from a user",
    description="Unsubscribe from a user (unfollow).",
)
async def unsubscribe_user(
    target_id: int,
    current_user_id: int,
    user_service: UserServiceDep,
):
    """Unsubscribe from a user."""
    target_user = await user_service.get_user_by_telegram_id(target_id)
    current_user = await user_service.get_user_by_telegram_id(current_user_id)
    
    if not target_user or not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    await user_service.unsubscribe(current_user.id, target_user.id)
    return {"message": "Unsubscribed successfully"}


@router.get(
    "/search",
    response_model=list[UserResponse],
    summary="Search users",
    description="Search users by username or name.",
)
async def search_users(
    query: str,
    current_user_id: int,
    user_service: UserServiceDep,
) -> list[UserResponse]:
    """Search users."""
    current_user = await user_service.get_user_by_telegram_id(current_user_id)
    # If current_user not found (e.g. not reg yet), allow search but no subscription check?
    # Better to require registration.
    if not current_user:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    users = await user_service.search_users(query, current_user_id=current_user.id)
    
    # We need to populate is_subscribed for search results
    response_list = []
    for user in users:
        is_sub = await user_service.is_subscribed(current_user.id, user.id)
        response_list.append(
            UserResponse(
                id=user.id,
                telegram_id=user.telegram_id,
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name,
                avatar_url=user.avatar_url,
                profile_text=user.profile_text,
                birth_date=user.birth_date,
                is_subscribed=is_sub,
                created_at=user.created_at,
                updated_at=user.updated_at,
            )
        )
        
    return response_list


@router.patch(
    "/telegram/{telegram_id}/profile",
    response_model=UserResponse,
    responses={
        200: {"description": "Profile updated successfully"},
        404: {"model": ErrorResponse, "description": "User not found"},
    },
    summary="Update user profile",
    description="Update user profile information such as profile text/status.",
)
async def update_user_profile(
    telegram_id: int,
    request: UserUpdateRequest,
    user_service: UserServiceDep,
) -> UserResponse:
    """Update user profile."""
    update_data = UserUpdate(
        username=request.username,
        first_name=request.first_name,
        last_name=request.last_name,
        avatar_url=request.avatar_url,
        profile_text=request.profile_text,
        birth_date=request.birth_date
    )
    user = await user_service.update_user_profile(telegram_id, update_data)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse(
        id=user.id,
        telegram_id=user.telegram_id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        avatar_url=user.avatar_url,
        profile_text=user.profile_text,
        birth_date=user.birth_date,
        is_subscribed=False,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
