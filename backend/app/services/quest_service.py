from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.assignment import UserQuest
from app.models.quest import Quest


def list_quests(db: Session) -> list[Quest]:
    return list(db.scalars(select(Quest).order_by(Quest.id)))


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
    assignment.ended_at = datetime.utcnow()
    db.commit()
    db.refresh(assignment)
    return assignment
