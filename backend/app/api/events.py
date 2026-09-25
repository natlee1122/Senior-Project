from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.event_service import log_event

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/{user_quest_id}", status_code=201)
def create_event(user_quest_id: int, event_type: str, status: str, db: Session = Depends(get_db)) -> dict[str, int]:
    event = log_event(db, user_quest_id, event_type, status)
    return {"id": event.id}
