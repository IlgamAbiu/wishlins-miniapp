"""
Wish management routes.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from src.api.dependencies import UserServiceDep
from src.api.schemas import (
    WishCreateRequest,
    WishResponse,
    WishUpdateRequest,
)
from src.domain.entities.wish import WishCreate, WishUpdate
from src.repositories import WishRepository, WishlistRepository
from src.services import WishService
from src.infrastructure.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/wishes", tags=["wishes"])


async def get_wish_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> WishService:
    """Dependency to get wish service."""
    wish_repository = WishRepository(session)
    wishlist_repository = WishlistRepository(session)
    return WishService(wish_repository, wishlist_repository)


@router.get("", response_model=list[WishResponse])
async def get_wishlist_wishes(
    wishlist_id: UUID,
    service: Annotated[WishService, Depends(get_wish_service)],
):
    """Get all wishes for a wishlist."""
    try:
        return await service.get_wishlist_wishes(wishlist_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("", response_model=WishResponse, status_code=status.HTTP_201_CREATED)
async def create_wish(
    request: WishCreateRequest,
    user_service: UserServiceDep,
    service: Annotated[WishService, Depends(get_wish_service)],
    session: Annotated[AsyncSession, Depends(get_session)],
    telegram_id: int = Query(..., description="Telegram user ID"),
):
    """Create a new wish."""
    user = await user_service.get_user_by_telegram_id(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify wishlist ownership
    wishlist_repo = WishlistRepository(session)
    wishlist = await wishlist_repo.get_by_id(request.wishlist_id)
    
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found",
        )
        
    if wishlist.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add to this wishlist",
        )

    try:
        wish_data = WishCreate(
            wishlist_id=request.wishlist_id,
            title=request.title,
            subtitle=request.subtitle,
            description=request.description,
            link=request.link,
            image_url=request.image_url,
            price=request.price,
            currency=request.currency,
            priority=request.priority,
        )
        return await service.create_wish(wish_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{wish_id}", response_model=WishResponse)
async def update_wish(
    wish_id: UUID,
    request: WishUpdateRequest,
    user_service: UserServiceDep,
    service: Annotated[WishService, Depends(get_wish_service)],
    session: Annotated[AsyncSession, Depends(get_session)],
    telegram_id: int = Query(..., description="Telegram user ID"),
):
    """Update a wish."""
    user = await user_service.get_user_by_telegram_id(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    wish_repo = WishRepository(session)
    wish = await wish_repo.get_by_id(wish_id)
    
    if not wish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wish not found",
        )
        
    # Verify ownership via wishlist
    wishlist_repo = WishlistRepository(session)
    wishlist = await wishlist_repo.get_by_id(wish.wishlist_id)
    
    if not wishlist or wishlist.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this wish",
        )

    try:
        update_data = WishUpdate(
            wishlist_id=request.wishlist_id,
            title=request.title,
            subtitle=request.subtitle,
            description=request.description,
            link=request.link,
            image_url=request.image_url,
            price=request.price,
            currency=request.currency,
            is_booked=request.is_booked,
            priority=request.priority,
        )
        return await service.update_wish(wish_id, update_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{wish_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wish(
    wish_id: UUID,
    user_service: UserServiceDep,
    service: Annotated[WishService, Depends(get_wish_service)],
    session: Annotated[AsyncSession, Depends(get_session)],
    telegram_id: int = Query(..., description="Telegram user ID"),
):
    """Delete a wish."""
    user = await user_service.get_user_by_telegram_id(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    wish_repo = WishRepository(session)
    wish = await wish_repo.get_by_id(wish_id)
    
    if not wish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wish not found",
        )
        
    # Verify ownership via wishlist
    wishlist_repo = WishlistRepository(session)
    wishlist = await wishlist_repo.get_by_id(wish.wishlist_id)
    
    if not wishlist or wishlist.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this wish",
        )

    await service.delete_wish(wish_id)


@router.post("/{wish_id}/fulfill", response_model=WishResponse)
async def fulfill_wish(
    wish_id: UUID,
    user_service: UserServiceDep,
    service: Annotated[WishService, Depends(get_wish_service)],
    telegram_id: int = Query(..., description="Telegram user ID"),
):
    """Mark a wish as fulfilled."""
    user = await user_service.get_user_by_telegram_id(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        return await service.fulfill_wish(wish_id, user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
