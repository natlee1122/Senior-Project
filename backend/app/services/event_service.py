from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from app.models.event import EventLog


def log_event(
    db: Session,
    user_quest_id: int,
    event_type: str,
    status: str,
    recommender: str | None = None,
    model_version: str | None = None,
    context: dict | None = None,
    evidence_url: str | None = None,
) -> EventLog:
    event = EventLog(
        user_quest_id=user_quest_id,
        event_type=event_type,
        status=status,
        recommender=recommender,
        model_version=model_version,
        context=context,
        evidence_url=evidence_url,
        occurred_at=datetime.utcnow(),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
