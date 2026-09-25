from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.assignment import UserQuest
from app.models.quest import Quest


def recommend_next_quest(db: Session, user_id: int) -> tuple[Quest | None, str, str]:
    quest = db.scalar(
        select(Quest)
        .join(UserQuest, UserQuest.quest_id == Quest.id, isouter=True)
        .where((UserQuest.user_id == user_id) | (UserQuest.id.is_(None)))
        .order_by(Quest.id)
    )
    return quest, "rule-based", "rules-v1"
