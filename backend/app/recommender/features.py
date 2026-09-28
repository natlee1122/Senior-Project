from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.assignment import UserQuest
from app.models.quest import Quest
from app.models.user import User

FEATURE_VERSION = 1
NUMERIC_FEATURES = [
    "quest_points", "user_points", "account_age_days", "completed_count",
    "category_completed_count", "hour_utc", "weekday_utc",
]


def snapshot(db: Session, user: User, quest: Quest, now: datetime) -> dict:
    completed = select(func.count(UserQuest.id)).where(
        UserQuest.user_id == user.id,
        UserQuest.status == "COMPLETED",
        UserQuest.ended_at <= now,
    )
    category_completed = completed.join(Quest, Quest.id == UserQuest.quest_id).where(
        Quest.category == quest.category
    )
    return {
        "category": quest.category,
        "quest_points": quest.points,
        "user_points": user.points,
        "account_age_days": max(0.0, (now - user.created_at).total_seconds() / 86400),
        "completed_count": db.scalar(completed),
        "category_completed_count": db.scalar(category_completed),
        "hour_utc": now.hour,
        "weekday_utc": now.weekday(),
    }


def encode(rows: list[dict], categories: list[str]) -> list[list[float]]:
    return [
        [float(row[name]) for name in NUMERIC_FEATURES]
        + [float(row["category"] == category) for category in categories]
        for row in rows
    ]
