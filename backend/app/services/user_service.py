from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.assignment import UserQuest
from app.models.user import User
from app.schemas.user import UserCreate, UserStats, UserUpdate

XP_PER_LEVEL = 500


class EmailAlreadyRegistered(Exception):
    pass


def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.scalar(select(User).where(User.email == email.strip().lower()))


def _unique_username(db: Session, email: str) -> str:
    """Derive a username from the email's local part, adding a suffix on collision."""
    base = email.split("@")[0][:70] or "user"
    candidate, n = base, 1
    while db.scalar(select(User.id).where(User.username == candidate)) is not None:
        n += 1
        candidate = f"{base}{n}"
    return candidate


def create_user(db: Session, payload: UserCreate) -> User:
    if get_user_by_email(db, payload.email) is not None:
        raise EmailAlreadyRegistered(payload.email)
    user = User(
        username=_unique_username(db, payload.email),
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        goal=payload.goal,
        interests=payload.interests,
        last_login_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        return None
    user.last_login_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def update_profile(db: Session, user: User, payload: UserUpdate) -> User:
    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is None:
            continue
        setattr(user, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(user)
    return user


def get_stats(db: Session, user: User, now: Optional[datetime] = None) -> UserStats:
    now = now or datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    def completed_since(start: datetime) -> int:
        return db.scalar(
            select(func.count(UserQuest.id)).where(
                UserQuest.user_id == user.id,
                UserQuest.status == "COMPLETED",
                UserQuest.ended_at >= start,
            )
        ) or 0

    xp = user.points
    return UserStats(
        xp=xp,
        coins=xp,  # no separate currency column yet; coins mirror points until rewards define one
        level=xp // XP_PER_LEVEL + 1,
        xp_into_level=xp % XP_PER_LEVEL,
        level_progress=round((xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100, 1),
        completed_today=completed_since(today),
        completed_this_week=completed_since(today - timedelta(days=6)),
    )
