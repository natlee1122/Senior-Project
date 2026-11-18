from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.time import utc_now
from app.db import get_db
from app.models.assignment import UserQuest
from app.models.user import User
from app.schemas.quest import AssignmentRead, CompleteQuestRead, QuestCreate, QuestRead, QuestUpdate
from app.schemas.user import UserRead
from app.services.quest_service import (
    assign_quest,
    complete_user_quest,
    create_quest,
    delete_quest,
    list_quests,
    update_quest,
)

router = APIRouter(prefix="/quests", tags=["quests"])


@router.get("", response_model=list[QuestRead])
def read_quests(db: Session = Depends(get_db)) -> list[QuestRead]:
    return list_quests(db)


@router.post("", response_model=QuestRead, status_code=status.HTTP_201_CREATED)
def create(
    payload: QuestCreate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QuestRead:
    return create_quest(db, **payload.model_dump())


@router.patch("/{quest_id}", response_model=QuestRead)
def update(
    quest_id: int,
    payload: QuestUpdate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QuestRead:
    quest = update_quest(db, quest_id, payload.model_dump(exclude_unset=True))
    if quest is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    return quest


@router.delete("/{quest_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove(
    quest_id: int,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    if not delete_quest(db, quest_id):
        raise HTTPException(status_code=404, detail="Quest not found")


@router.get("/today-completions", response_model=dict[str, AssignmentRead])
def read_today_completions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = utc_now().replace(hour=0, minute=0, second=0, microsecond=0)
    assignments = db.query(UserQuest).filter(
        UserQuest.user_id == current_user.id,
        UserQuest.status == "COMPLETED",
        UserQuest.ended_at >= today,
    ).all()
    return {str(assignment.quest_id): assignment for assignment in assignments}


@router.post("/{quest_id}/complete", response_model=CompleteQuestRead)
def complete(
    quest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CompleteQuestRead:
    result = complete_user_quest(db, current_user, quest_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    quest, _assignment, already_completed = result
    return CompleteQuestRead(
        user=UserRead.model_validate(current_user),
        quest=quest,
        alreadyCompleted=already_completed,
    )


@router.post("/{quest_id}/assign/{user_id}", response_model=AssignmentRead, status_code=201)
def create_assignment(quest_id: int, user_id: int, db: Session = Depends(get_db)) -> AssignmentRead:
    assignment = assign_quest(db, user_id, quest_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Quest not found")
    return assignment
