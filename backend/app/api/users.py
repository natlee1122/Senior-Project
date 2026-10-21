from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserStats, UserUpdate
from app.services.user_service import get_stats, get_user, update_profile

router = APIRouter(prefix="/users", tags=["users"])

# /me routes are declared before /{user_id} so "me" is not parsed as an id.


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    return update_profile(db, current_user, payload)


@router.get("/me/stats", response_model=UserStats)
def read_my_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserStats:
    return get_stats(db, current_user)


@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: int, db: Session = Depends(get_db)) -> User:
    user = get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
