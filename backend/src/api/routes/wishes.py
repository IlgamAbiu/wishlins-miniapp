"""
Wish management routes.
"""

from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from src.api.dependencies import UserServiceDep
from src.api.schemas import (
    WishCreateRequest,
    WishResponse,
    WishUpdateRequest,
)
from src.domain.entities.wish import Wish, WishCreate, WishUpdate
from src.repositories import WishRepository, WishlistRepository
from src.services import WishService
from src.infrastructure.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/wishes", tags=["wishes"])


def _wish_to_response(wish: Wish, viewer_id: Optional[UUID] = None) -> WishResponse:
    """Convert wish entity to response schema, computing booked_by_me."""
    data = wish.to_dict()
    data['booked_by_me'] = viewer_id is not None and wish.booked_by_user_id == viewer_id
    return WishResponse(**data)


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
    user_service: UserServiceDep,
    viewer_telegram_id: Optional[int] = Query(None, description="Telegram ID of the viewer (to compute booked_by_me)"),
):
    """Get all wishes for a wishlist."""
    try:
        wishes = await service.get_wishlist_wishes(wishlist_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    viewer_id: Optional[UUID] = None
    if viewer_telegram_id is not None:
        viewer = await user_service.get_user_by_telegram_id(viewer_telegram_id)
        if viewer:
            viewer_id = viewer.id

    return [_wish_to_response(wish, viewer_id) for wish in wishes]


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
        wish = await service.fulfill_wish(wish_id, user.id)
        return _wish_to_response(wish, user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/{wish_id}/book", response_model=WishResponse)
async def book_wish(
    wish_id: UUID,
    user_service: UserServiceDep,
    service: Annotated[WishService, Depends(get_wish_service)],
    session: Annotated[AsyncSession, Depends(get_session)],
    telegram_id: int = Query(..., description="Telegram ID of the user booking the wish"),
):
    """Book a wish (non-owner only)."""
    user = await user_service.get_user_by_telegram_id(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    wish_repo = WishRepository(session)
    wish = await wish_repo.get_by_id(wish_id)
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")

    # Prevent owner from booking their own wish
    wishlist_repo = WishlistRepository(session)
    wishlist = await wishlist_repo.get_by_id(wish.wishlist_id)
    if wishlist and wishlist.user_id == user.id:
        raise HTTPException(status_code=403, detail="Owner cannot book their own wish")

    # Prevent double-booking by someone else
    if wish.is_booked and wish.booked_by_user_id != user.id:
        raise HTTPException(status_code=409, detail="Wish already booked by someone else")

    try:
        updated = await service.book_wish(wish_id, user.id)
        return _wish_to_response(updated, user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{wish_id}/book", response_model=WishResponse)
async def unbook_wish(
    wish_id: UUID,
    user_service: UserServiceDep,
    service: Annotated[WishService, Depends(get_wish_service)],
    telegram_id: int = Query(..., description="Telegram ID of the user cancelling the booking"),
):
    """Cancel a wish booking."""
    user = await user_service.get_user_by_telegram_id(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        updated = await service.unbook_wish(wish_id, user.id)
        return _wish_to_response(updated, user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
