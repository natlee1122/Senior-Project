from datetime import datetime
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.recommender.router import router as feedback_router
from app.recommender.schemas import RecommendationRead
from app.recommender.service import recommend

router = APIRouter(prefix="/recommendations", tags=["recommendations"])
router.include_router(feedback_router)


@router.get("/{user_id}", response_model=RecommendationRead)
def get_recommendation(user_id: int, db: Session = Depends(get_db)) -> RecommendationRead:
    try:
        return recommend(db, user_id, now=datetime.utcnow(), rng=random.SystemRandom())
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
