from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.quest import AssignmentRead, QuestRead
from app.services.quest_service import assign_quest, list_quests

router = APIRouter(prefix="/quests", tags=["quests"])


@router.get("", response_model=list[QuestRead])
def read_quests(db: Session = Depends(get_db)) -> list[QuestRead]:
    return list_quests(db)


@router.post("/{quest_id}/assign/{user_id}", response_model=AssignmentRead, status_code=201)
def create_assignment(quest_id: int, user_id: int, db: Session = Depends(get_db)) -> AssignmentRead:
    assignment = assign_quest(db, user_id, quest_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    return assignment
