from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.assignment import UserQuest
from app.services.quest_service import complete_quest
from app.services.reward_service import award_quest_points

router = APIRouter(prefix="/rewards", tags=["rewards"])


@router.post("/claim/{assignment_id}")
def claim_reward(assignment_id: int, db: Session = Depends(get_db)) -> dict[str, int]:
    assignment = db.get(UserQuest, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.status == "COMPLETED":
        return {"points_awarded": 0}
    assignment = complete_quest(db, assignment_id)
    return {"points_awarded": award_quest_points(db, assignment)}
