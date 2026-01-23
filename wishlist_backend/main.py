from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import database
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

database.init_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserBase(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None

class EventCreate(BaseModel):
    userId: int
    title: str
    description: Optional[str] = None
    date: Optional[str] = None

class WishCreate(BaseModel):
    eventId: int
    title: str
    url: Optional[str] = None
    price: Optional[float] = None
    currency: str = "RUB"
    priority: int = 1
    comment: Optional[str] = None
    image_url: Optional[str] = None

class WishUpdate(BaseModel):
    isBooked: Optional[bool] = None
    bookedByUserId: Optional[int] = None
    title: Optional[str] = None
    price: Optional[float] = None
    priority: Optional[int] = None
    comment: Optional[str] = None
    image_url: Optional[str] = None

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/auth")
def auth_user(user: UserBase, db: Session = Depends(get_db)):
    db_user = db.query(database.User).filter(database.User.id == user.id).first()
    if db_user:
        db_user.first_name = user.first_name
        db_user.last_name = user.last_name
        db_user.username = user.username
        db_user.photo_url = user.photo_url
    else:
        db_user = database.User(**user.dict())
        db.add(db_user)
    db.commit()
    return {"success": True}

@app.get("/api/events/my")
def get_my_events(userId: int, db: Session = Depends(get_db)):
    events = db.query(database.Event).filter(database.Event.user_id == userId).order_by(database.Event.created_at.desc()).all()
    return events

@app.get("/api/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(database.Event).filter(database.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    owner = db.query(database.User).filter(database.User.id == event.user_id).first()
    return {
        "id": event.id,
        "user_id": event.user_id,
        "title": event.title,
        "description": event.description,
        "date": event.date,
        "owner": owner
    }

@app.post("/api/events")
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = database.Event(
        user_id=event.userId,
        title=event.title,
        description=event.description,
        date=event.date
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/api/events/{event_id}/wishes")
def get_event_wishes(event_id: int, db: Session = Depends(get_db)):
    wishes = db.query(database.Wish).filter(database.Wish.event_id == event_id).order_by(database.Wish.priority.desc()).all()
    return wishes

@app.post("/api/wishes")
def create_wish(wish: WishCreate, db: Session = Depends(get_db)):
    db_wish = database.Wish(
        event_id=wish.eventId,
        title=wish.title,
        url=wish.url,
        price=wish.price,
        currency=wish.currency,
        priority=wish.priority,
        comment=wish.comment,
        image_url=wish.image_url,
        is_booked=0
    )
    db.add(db_wish)
    db.commit()
    db.refresh(db_wish)
    return db_wish

@app.put("/api/wishes/{wish_id}")
def update_wish(wish_id: int, wish: WishUpdate, db: Session = Depends(get_db)):
    db_wish = db.query(database.Wish).filter(database.Wish.id == wish_id).first()
    if not db_wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    
    if wish.isBooked is not None:
        db_wish.is_booked = 1 if wish.isBooked else 0
        db_wish.booked_by_user_id = wish.bookedByUserId if wish.isBooked else None
    else:
        if wish.title is not None: db_wish.title = wish.title
        if wish.price is not None: db_wish.price = wish.price
        if wish.priority is not None: db_wish.priority = wish.priority
        if wish.comment is not None: db_wish.comment = wish.comment
        if wish.image_url is not None: db_wish.image_url = wish.image_url

    db.commit()
    db.refresh(db_wish)
    return db_wish

@app.delete("/api/wishes/{wish_id}")
def delete_wish(wish_id: int, db: Session = Depends(get_db)):
    db_wish = db.query(database.Wish).filter(database.Wish.id == wish_id).first()
    if not db_wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    db.delete(db_wish)
    db.commit()
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
