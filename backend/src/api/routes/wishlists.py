"""
Wishlist API routes.
API layer handles only request/response orchestration.
"""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from src.api.dependencies import WishlistServiceDep, UserServiceDep
from src.api.schemas import (
    ErrorResponse,
    WishlistCreateRequest,
    WishlistUpdateRequest,
    WishlistResponse,
    WishlistListResponse,
)
from src.domain.entities import WishlistCreate, WishlistUpdate, UNSET

router = APIRouter(prefix="/wishlists", tags=["wishlists"])


@router.get(
    "/user/telegram/{telegram_id}",
    response_model=WishlistListResponse,
    responses={
        200: {"description": "Wishlists retrieved successfully"},
        404: {"model": ErrorResponse, "description": "User not found"},
    },
    summary="Get user wishlists by Telegram ID",
    description="Retrieve all wishlists for a user by their Telegram ID.",
)
async def get_user_wishlists_by_telegram_id(
    telegram_id: int,
    wishlist_service: WishlistServiceDep,
    user_service: UserServiceDep,
) -> WishlistListResponse:
    """Get all wishlists for a user by Telegram ID."""
    # First, find the user by telegram_id
    user = await user_service.get_user_by_telegram_id(telegram_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Get user's wishlists
    wishlists = await wishlist_service.get_user_wishlists(user.id)

    return WishlistListResponse(
        wishlists=[
            WishlistResponse(
                id=w.id,
                user_id=w.user_id,
                title=w.title,
                description=w.description,
                is_public=w.is_public,
                is_default=w.is_default,
                emoji=w.emoji,
                event_date=w.event_date,
                created_at=w.created_at,
                updated_at=w.updated_at,
            )
            for w in wishlists
        ],
        total=len(wishlists),
    )


@router.get(
    "/user/{user_id}",
    response_model=WishlistListResponse,
    responses={
        200: {"description": "Wishlists retrieved successfully"},
    },
    summary="Get user wishlists",
    description="Retrieve all wishlists for a specific user.",
)
async def get_user_wishlists(
    user_id: UUID,
    wishlist_service: WishlistServiceDep,
) -> WishlistListResponse:
    """Get all wishlists for a user."""
    wishlists = await wishlist_service.get_user_wishlists(user_id)

    return WishlistListResponse(
        wishlists=[
            WishlistResponse(
                id=w.id,
                user_id=w.user_id,
                title=w.title,
                description=w.description,
                is_public=w.is_public,
                is_default=w.is_default,
                emoji=w.emoji,
                event_date=w.event_date,
                created_at=w.created_at,
                updated_at=w.updated_at,
            )
            for w in wishlists
        ],
        total=len(wishlists),
    )


@router.post(
    "/",
    response_model=WishlistResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Wishlist created successfully"},
        400: {"model": ErrorResponse, "description": "Invalid request"},
        404: {"model": ErrorResponse, "description": "User not found"},
    },
    summary="Create a wishlist",
    description="Create a new wishlist for a user.",
)
async def create_wishlist(
    request: WishlistCreateRequest,
    wishlist_service: WishlistServiceDep,
    user_service: UserServiceDep,
    telegram_id: int = Query(..., description="Telegram user ID"),
) -> WishlistResponse:
    """Create a new wishlist."""
    # First, find the user by telegram_id
    user = await user_service.get_user_by_telegram_id(telegram_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    wishlist_data = WishlistCreate(
        user_id=user.id,
        title=request.title,
        description=request.description,
        is_public=request.is_public,
        emoji=request.emoji,
        event_date=request.event_date,
    )

    wishlist = await wishlist_service.create_wishlist(wishlist_data)

    return WishlistResponse(
        id=wishlist.id,
        user_id=wishlist.user_id,
        title=wishlist.title,
        description=wishlist.description,
        is_public=wishlist.is_public,
        is_default=wishlist.is_default,
        emoji=wishlist.emoji,
        event_date=wishlist.event_date,
        created_at=wishlist.created_at,
        updated_at=wishlist.updated_at,
    )


@router.get(
    "/{wishlist_id}",
    response_model=WishlistResponse,
    responses={
        200: {"description": "Wishlist retrieved successfully"},
        404: {"model": ErrorResponse, "description": "Wishlist not found"},
    },
    summary="Get wishlist by ID",
    description="Retrieve a specific wishlist by its ID.",
)
async def get_wishlist(
    wishlist_id: UUID,
    wishlist_service: WishlistServiceDep,
) -> WishlistResponse:
    """Get wishlist by ID."""
    wishlist = await wishlist_service.get_wishlist_by_id(wishlist_id)

    if wishlist is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found",
        )

    return WishlistResponse(
        id=wishlist.id,
        user_id=wishlist.user_id,
        title=wishlist.title,
        description=wishlist.description,
        is_public=wishlist.is_public,
        is_default=wishlist.is_default,
        emoji=wishlist.emoji,
        event_date=wishlist.event_date,
        created_at=wishlist.created_at,
        updated_at=wishlist.updated_at,
    )


@router.patch(
    "/{wishlist_id}",
    response_model=WishlistResponse,
    responses={
        200: {"description": "Wishlist updated successfully"},
        404: {"model": ErrorResponse, "description": "Wishlist not found"},
    },
    summary="Update wishlist",
    description="Update an existing wishlist.",
)
async def update_wishlist(
    wishlist_id: UUID,
    request: WishlistUpdateRequest,
    wishlist_service: WishlistServiceDep,
) -> WishlistResponse:
    # Only pass fields that were actually set in the request
    # Use UNSET for fields that were not provided to avoid overwriting them
    fields_set = request.model_fields_set

    wishlist_data = WishlistUpdate(
        title=request.title if "title" in fields_set else UNSET,
        description=request.description if "description" in fields_set else UNSET,
        is_public=request.is_public if "is_public" in fields_set else UNSET,
        emoji=request.emoji if "emoji" in fields_set else UNSET,
        event_date=request.event_date if "event_date" in fields_set else UNSET,
    )

    wishlist = await wishlist_service.update_wishlist(wishlist_id, wishlist_data)

    if wishlist is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found",
        )

    return WishlistResponse(
        id=wishlist.id,
        user_id=wishlist.user_id,
        title=wishlist.title,
        description=wishlist.description,
        is_public=wishlist.is_public,
        is_default=wishlist.is_default,
        emoji=wishlist.emoji,
        event_date=wishlist.event_date,
        created_at=wishlist.created_at,
        updated_at=wishlist.updated_at,
    )


@router.delete(
    "/{wishlist_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Wishlist deleted successfully"},
        404: {"model": ErrorResponse, "description": "Wishlist not found"},
    },
    summary="Delete wishlist",
    description="Delete a wishlist.",
)
async def delete_wishlist(
    wishlist_id: UUID,
    wishlist_service: WishlistServiceDep,
) -> None:
    """Delete a wishlist."""
    wishlist = await wishlist_service.get_wishlist_by_id(wishlist_id)
    if wishlist and wishlist.is_default:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete default wishlist",
        )

    deleted = await wishlist_service.delete_wishlist(wishlist_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found",
        )
