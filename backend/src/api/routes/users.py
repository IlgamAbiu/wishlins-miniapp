"""
User API routes.
API layer handles only request/response orchestration.
"""

from fastapi import APIRouter, HTTPException, status

from src.api.dependencies import UserServiceDep
from src.api.schemas import (
    ErrorResponse,
    UserRegisterRequest,
    UserRegisterResponse,
    UserResponse,
    UserUpdateRequest,
)
from src.domain.entities import UserCreate, UserUpdate

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
) -> UserResponse:
    """Get user by Telegram ID."""
    user = await user_service.get_user_by_telegram_id(telegram_id)

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
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


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
    update_data = UserUpdate(profile_text=request.profile_text)
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
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
