from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.recommendation import RecommendationRead
from app.services.recommendation_service import recommend_next_quest

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/{user_id}", response_model=RecommendationRead)
def get_recommendation(user_id: int, db: Session = Depends(get_db)) -> RecommendationRead:
    quest, recommender, model_version = recommend_next_quest(db, user_id)
    if quest is None:
        raise HTTPException(status_code=404, detail="No quest available")
    return RecommendationRead(
        assignment_id=0,
        quest_id=quest.id,
        recommender=recommender,
        model_version=model_version,
    )
