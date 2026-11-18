from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.time import utc_now
from app.models.assignment import UserQuest
from app.models.event import EventLog
from app.models.quest import Quest
from app.models.user import User

REWARDS = {"Easy": (10, 5), "Medium": (20, 10), "Hard": (30, 15)}
THEMES = {"Exercise": "forest", "Study": "desk", "Explore": "camera", "Creative": "camera"}


def list_quests(db: Session) -> list[Quest]:
    return list(db.scalars(select(Quest).order_by(Quest.id)))


def create_quest(db: Session, title: str, category: str, description: str, duration: str, difficulty: str) -> Quest:
    xp, coins = REWARDS[difficulty]
    quest = Quest(
        title=title,
        category=category,
        description=description or "A quest you created.",
        duration=duration or "Any time",
        difficulty=difficulty,
        points=xp,
        coins=coins,
        theme=THEMES.get(category, "forest"),
    )
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return quest


def update_quest(db: Session, quest_id: int, values: dict[str, object]) -> Quest | None:
    quest = db.get(Quest, quest_id)
    if quest is None:
        return None
    for field, value in values.items():
        if value is not None:
            setattr(quest, field, value)
    if "difficulty" in values and values["difficulty"] is not None:
        quest.points, quest.coins = REWARDS[quest.difficulty]
    if "category" in values and values["category"] is not None:
        quest.theme = THEMES.get(quest.category, quest.theme)
    db.commit()
    db.refresh(quest)
    return quest


def delete_quest(db: Session, quest_id: int) -> bool:
    quest = db.get(Quest, quest_id)
    if quest is None:
        return False
    assignment_ids = list(db.scalars(select(UserQuest.id).where(UserQuest.quest_id == quest_id)))
    if assignment_ids:
        db.execute(delete(EventLog).where(EventLog.user_quest_id.in_(assignment_ids)))
        db.execute(delete(UserQuest).where(UserQuest.id.in_(assignment_ids)))
    db.delete(quest)
    db.commit()
    return True


def assign_quest(db: Session, user_id: int, quest_id: int) -> UserQuest | None:
    quest = db.get(Quest, quest_id)
    if quest is None:
        return None
    assignment = UserQuest(user_id=user_id, quest_id=quest_id, status="AVAILABLE")
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def complete_quest(db: Session, assignment_id: int) -> UserQuest | None:
    assignment = db.get(UserQuest, assignment_id)
    if assignment is None:
        return None
    if assignment.status == "COMPLETED":
        return assignment
    assignment.status = "COMPLETED"
    assignment.ended_at = utc_now()
    db.commit()
    db.refresh(assignment)
    return assignment


def complete_user_quest(db: Session, user: User, quest_id: int) -> tuple[Quest, UserQuest, bool] | None:
    quest = db.get(Quest, quest_id)
    if quest is None:
        return None
    today = utc_now().replace(hour=0, minute=0, second=0, microsecond=0)
    assignment = db.scalar(
        select(UserQuest)
        .where(
            UserQuest.user_id == user.id,
            UserQuest.quest_id == quest_id,
            UserQuest.status == "COMPLETED",
            UserQuest.ended_at >= today,
        )
        .order_by(UserQuest.ended_at.desc())
    )
    if assignment is not None:
        return quest, assignment, True

    now = utc_now()
    assignment = UserQuest(
        user_id=user.id,
        quest_id=quest_id,
        status="COMPLETED",
        started_at=now,
        ended_at=now,
    )
    db.add(assignment)
    user.points += quest.points
    db.commit()
    db.refresh(assignment)
    return quest, assignment, False
